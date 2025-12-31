package PEI.EDT.Services;

import PEI.EDT.Dtos.CreneauDto;
import PEI.EDT.Dtos.CreateCreneauDto;
import PEI.EDT.Entities.Creneau;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Entities.Enums.JourSemaine;
import PEI.EDT.Entities.Enums.TypeCreneau;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.CreneauRepository;
import PEI.EDT.Repositories.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CreneauService {

    private final CreneauRepository creneauRepo;
    private final SemestreRepository semestreRepo;

    public CreneauDto create(CreateCreneauDto dto) {
        if (dto.getSemestreId() == null) throw new BadRequestException("Creneau.semestreId is required.");
        if (dto.getJour() == null || dto.getJour().isBlank()) throw new BadRequestException("Creneau.jour is required.");
        if (dto.getHeureDebut() == null || dto.getHeureFin() == null) throw new BadRequestException("heureDebut and heureFin are required.");
        if (!dto.getHeureFin().isAfter(dto.getHeureDebut())) throw new BadRequestException("heureFin must be after heureDebut.");
        if (dto.getTypeCreneau() == null || dto.getTypeCreneau().isBlank()) throw new BadRequestException("typeCreneau is required.");

        Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));

        TypeCreneau typeCreneau = parseTypeCreneau(dto.getTypeCreneau());
        JourSemaine jour = parseJour(dto.getJour());

        Creneau c = Creneau.builder()
                .jour(jour)                       // ✅ enum
                .heureDebut(dto.getHeureDebut())
                .heureFin(dto.getHeureFin())
                .typeCreneau(typeCreneau)
                .semestre(semestre)
                .build();

        return toDto(creneauRepo.save(c));
    }

    @Transactional(readOnly = true)
    public CreneauDto getById(Integer id) {
        Creneau c = creneauRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creneau not found: " + id));
        return toDto(c);
    }

    @Transactional(readOnly = true)
    public List<CreneauDto> list(Integer semestreId) {
        if (semestreId != null) {
            return creneauRepo.findBySemestre_Id(semestreId).stream().map(this::toDto).toList();
        }
        return creneauRepo.findAll().stream().map(this::toDto).toList();
    }

    public CreneauDto update(Integer id, CreateCreneauDto dto) {
        Creneau c = creneauRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Creneau not found: " + id));

        if (dto.getJour() != null) c.setJour(parseJour(dto.getJour())); // ✅ enum
        if (dto.getHeureDebut() != null) c.setHeureDebut(dto.getHeureDebut());
        if (dto.getHeureFin() != null) c.setHeureFin(dto.getHeureFin());
        if (dto.getTypeCreneau() != null) c.setTypeCreneau(parseTypeCreneau(dto.getTypeCreneau()));

        if (dto.getSemestreId() != null) {
            Semestre s = semestreRepo.findById(dto.getSemestreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));
            c.setSemestre(s);
        }

        if (c.getHeureDebut() == null || c.getHeureFin() == null || !c.getHeureFin().isAfter(c.getHeureDebut())) {
            throw new BadRequestException("Invalid time range: heureFin must be after heureDebut.");
        }

        return toDto(creneauRepo.save(c));
    }

    public void delete(Integer id) {
        if (!creneauRepo.existsById(id)) {
            throw new ResourceNotFoundException("Creneau not found: " + id);
        }
        creneauRepo.deleteById(id);
    }

    private CreneauDto toDto(Creneau c) {
        return CreneauDto.builder()
                .id(c.getId())
                .jour(c.getJour().name())                 // ✅ enum -> String
                .heureDebut(c.getHeureDebut())
                .heureFin(c.getHeureFin())
                .typeCreneau(c.getTypeCreneau().name())
                .semestreId(c.getSemestre().getId())
                .build();
    }

    private TypeCreneau parseTypeCreneau(String s) {
        try {
            return TypeCreneau.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid typeCreneau (expected DEP|HE|ST|AUTRE): " + s);
        }
    }

    private JourSemaine parseJour(String s) {
        try {
            return JourSemaine.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid jour (expected LUNDI..SAMEDI): " + s);
        }
    }
}
