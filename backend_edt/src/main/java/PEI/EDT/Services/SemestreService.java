package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateSemestreDto;
import PEI.EDT.Dtos.SemestreDto;
import PEI.EDT.Entities.Creneau;
import PEI.EDT.Entities.SemaineAcademique;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Entities.Enums.JourSemaine;
import PEI.EDT.Entities.Enums.TypeCreneau;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.CreneauRepository;
import PEI.EDT.Repositories.SemaineAcademiqueRepository;
import PEI.EDT.Repositories.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SemestreService {

    private final SemestreRepository semestreRepo;
    private final SemaineAcademiqueRepository semaineRepo;
    private final CreneauRepository creneauRepo;

    // Default time slots (5 periods per day)
    private static final LocalTime[][] DEFAULT_SLOTS = {
            {LocalTime.of(8, 0), LocalTime.of(9, 30)},
            {LocalTime.of(9, 45), LocalTime.of(11, 15)},
            {LocalTime.of(11, 30), LocalTime.of(13, 0)},
            {LocalTime.of(15, 10), LocalTime.of(16, 40)},
            {LocalTime.of(17, 0), LocalTime.of(18, 30)},
    };

    public SemestreDto create(CreateSemestreDto dto) {
        if (dto.getLibelle() == null || dto.getLibelle().isBlank()) {
            throw new BadRequestException("Semestre.libelle is required (ex: S1, S2...).");
        }
        if (dto.getDateDebut() == null || dto.getDateFin() == null) {
            throw new BadRequestException("Semestre.dateDebut and dateFin are required.");
        }
        if (dto.getDateFin().isBefore(dto.getDateDebut())) {
            throw new BadRequestException("Semestre.dateFin must be after dateDebut.");
        }

        Semestre s = Semestre.builder()
                .libelle(dto.getLibelle().trim().toUpperCase())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .build();

        s = semestreRepo.save(s);

        // Auto-generate academic weeks
        generateSemaines(s);

        // Auto-generate créneaux (30 = 6 days × 5 slots) with default type DEP
        generateCreneaux(s);

        return toDto(s);
    }

    @Transactional(readOnly = true)
    public SemestreDto getById(Integer id) {
        Semestre s = semestreRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + id));
        return toDto(s);
    }

    @Transactional(readOnly = true)
    public List<SemestreDto> list() {
        return semestreRepo.findAll().stream().map(this::toDto).toList();
    }

    public SemestreDto update(Integer id, CreateSemestreDto dto) {
        Semestre s = semestreRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + id));

        if (dto.getLibelle() != null) s.setLibelle(dto.getLibelle().trim().toUpperCase());
        if (dto.getDateDebut() != null) s.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) s.setDateFin(dto.getDateFin());

        if (s.getDateDebut() == null || s.getDateFin() == null) {
            throw new BadRequestException("Semestre.dateDebut and dateFin cannot be null.");
        }
        if (s.getDateFin().isBefore(s.getDateDebut())) {
            throw new BadRequestException("Semestre.dateFin must be after dateDebut.");
        }

        return toDto(semestreRepo.save(s));
    }

    public void delete(Integer id) {
        if (!semestreRepo.existsById(id)) {
            throw new ResourceNotFoundException("Semestre not found: " + id);
        }
        semestreRepo.deleteById(id);
    }

    // ── Auto-generation helpers ──────────────────────────────────────

    private void generateSemaines(Semestre semestre) {
        LocalDate start = semestre.getDateDebut();
        LocalDate end = semestre.getDateFin();

        // Align to the Monday of the first week
        LocalDate weekStart = start.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        List<SemaineAcademique> weeks = new ArrayList<>();
        int weekNum = 1;

        while (!weekStart.isAfter(end)) {
            LocalDate weekEnd = weekStart.plusDays(5); // Monday to Saturday

            SemaineAcademique sa = SemaineAcademique.builder()
                    .numeroSemaine(weekNum)
                    .dateDebut(weekStart)
                    .dateFin(weekEnd)
                    .semestre(semestre)
                    .build();
            weeks.add(sa);

            weekStart = weekStart.plusWeeks(1);
            weekNum++;
        }

        semaineRepo.saveAll(weeks);
    }

    private void generateCreneaux(Semestre semestre) {
        List<Creneau> creneaux = new ArrayList<>();

        for (JourSemaine jour : JourSemaine.values()) {
            for (LocalTime[] slot : DEFAULT_SLOTS) {
                Creneau c = Creneau.builder()
                        .jour(jour)
                        .heureDebut(slot[0])
                        .heureFin(slot[1])
                        .typeCreneau(TypeCreneau.DEP) // Default: DEP (green)
                        .semestre(semestre)
                        .build();
                creneaux.add(c);
            }
        }

        creneauRepo.saveAll(creneaux);
    }

    private SemestreDto toDto(Semestre s) {
        return SemestreDto.builder()
                .id(s.getId())
                .libelle(s.getLibelle())
                .dateDebut(s.getDateDebut())
                .dateFin(s.getDateFin())
                .build();
    }
}

