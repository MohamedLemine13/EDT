package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateSemaineAcademiqueDto;
import PEI.EDT.Dtos.SemaineAcademiqueDto;
import PEI.EDT.Entities.SemaineAcademique;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.SemaineAcademiqueRepository;
import PEI.EDT.Repositories.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SemaineAcademiqueService {

    private final SemaineAcademiqueRepository semaineRepo;
    private final SemestreRepository semestreRepo;

    public SemaineAcademiqueDto create(CreateSemaineAcademiqueDto dto) {
        if (dto.getSemestreId() == null) throw new BadRequestException("semestreId is required.");
        if (dto.getNumeroSemaine() == null) throw new BadRequestException("numeroSemaine is required.");
        if (dto.getDateDebut() == null || dto.getDateFin() == null) throw new BadRequestException("dateDebut and dateFin are required.");
        if (dto.getDateFin().isBefore(dto.getDateDebut())) throw new BadRequestException("dateFin must be after dateDebut.");

        Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));

        // Optional consistency: keep week inside semester dates
        if (dto.getDateDebut().isBefore(semestre.getDateDebut()) || dto.getDateFin().isAfter(semestre.getDateFin())) {
            throw new BadRequestException("Week dates must be within the Semestre date range.");
        }

        SemaineAcademique s = SemaineAcademique.builder()
                .numeroSemaine(dto.getNumeroSemaine())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .semestre(semestre)
                .build();

        return toDto(semaineRepo.save(s));
    }

    @Transactional(readOnly = true)
    public SemaineAcademiqueDto getById(Integer id) {
        SemaineAcademique s = semaineRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semaine not found: " + id));
        return toDto(s);
    }

    @Transactional(readOnly = true)
    public List<SemaineAcademiqueDto> list(Integer semestreId) {
        if (semestreId != null) {
            return semaineRepo.findBySemestre_Id(semestreId).stream().map(this::toDto).toList();
        }
        return semaineRepo.findAll().stream().map(this::toDto).toList();
    }

    public SemaineAcademiqueDto update(Integer id, CreateSemaineAcademiqueDto dto) {
        SemaineAcademique s = semaineRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semaine not found: " + id));

        if (dto.getNumeroSemaine() != null) s.setNumeroSemaine(dto.getNumeroSemaine());
        if (dto.getDateDebut() != null) s.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) s.setDateFin(dto.getDateFin());

        if (dto.getSemestreId() != null) {
            Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));
            s.setSemestre(semestre);
        }

        if (s.getDateDebut() == null || s.getDateFin() == null || s.getDateFin().isBefore(s.getDateDebut())) {
            throw new BadRequestException("Invalid week dates.");
        }

        Semestre sem = s.getSemestre();
        if (s.getDateDebut().isBefore(sem.getDateDebut()) || s.getDateFin().isAfter(sem.getDateFin())) {
            throw new BadRequestException("Week dates must be within the Semestre date range.");
        }

        return toDto(semaineRepo.save(s));
    }

    public void delete(Integer id) {
        if (!semaineRepo.existsById(id)) throw new ResourceNotFoundException("Semaine not found: " + id);
        semaineRepo.deleteById(id);
    }

    private SemaineAcademiqueDto toDto(SemaineAcademique s) {
        return SemaineAcademiqueDto.builder()
                .id(s.getId())
                .numeroSemaine(s.getNumeroSemaine())
                .dateDebut(s.getDateDebut())
                .dateFin(s.getDateFin())
                .semestreId(s.getSemestre().getId())
                .build();
    }
}
