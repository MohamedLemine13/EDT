package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateEvenementCalendrierDto;
import PEI.EDT.Dtos.EvenementCalendrierDto;
import PEI.EDT.Entities.EvenementCalendrier;
import PEI.EDT.Entities.Enums.TypeEvenement;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.EvenementCalendrierRepository;
import PEI.EDT.Repositories.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EvenementCalendrierService {

    private final EvenementCalendrierRepository evenementRepo;
    private final SemestreRepository semestreRepo;

    public EvenementCalendrierDto create(CreateEvenementCalendrierDto dto) {
        if (dto.getTitre() == null || dto.getTitre().isBlank()) {
            throw new BadRequestException("titre is required.");
        }
        if (dto.getType() == null || dto.getType().isBlank()) {
            throw new BadRequestException("type is required.");
        }
        if (dto.getDateDebut() == null) {
            throw new BadRequestException("dateDebut is required.");
        }

        TypeEvenement type = parseType(dto.getType());

        EvenementCalendrier evenement = EvenementCalendrier.builder()
                .titre(dto.getTitre().trim())
                .description(dto.getDescription())
                .type(type)
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin() != null ? dto.getDateFin() : dto.getDateDebut())
                .couleur(dto.getCouleur())
                .build();

        if (dto.getSemestreId() != null) {
            Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));
            evenement.setSemestre(semestre);
        }

        return toDto(evenementRepo.save(evenement));
    }

    @Transactional(readOnly = true)
    public EvenementCalendrierDto getById(Integer id) {
        EvenementCalendrier e = evenementRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement not found: " + id));
        return toDto(e);
    }

    @Transactional(readOnly = true)
    public List<EvenementCalendrierDto> list(Integer semestreId, LocalDate startDate, LocalDate endDate) {
        List<EvenementCalendrier> evenements;

        if (semestreId != null && startDate != null && endDate != null) {
            evenements = evenementRepo.findBySemestre_IdAndDateDebutBetween(semestreId, startDate, endDate);
        } else if (semestreId != null) {
            evenements = evenementRepo.findBySemestre_Id(semestreId);
        } else if (startDate != null && endDate != null) {
            evenements = evenementRepo.findByDateDebutBetween(startDate, endDate);
        } else {
            evenements = evenementRepo.findAll();
        }

        return evenements.stream()
                .map(this::toDto)
                .toList();
    }

    public EvenementCalendrierDto update(Integer id, CreateEvenementCalendrierDto dto) {
        EvenementCalendrier evenement = evenementRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement not found: " + id));

        if (dto.getTitre() != null) {
            evenement.setTitre(dto.getTitre().trim());
        }
        if (dto.getDescription() != null) {
            evenement.setDescription(dto.getDescription());
        }
        if (dto.getType() != null) {
            evenement.setType(parseType(dto.getType()));
        }
        if (dto.getDateDebut() != null) {
            evenement.setDateDebut(dto.getDateDebut());
        }
        if (dto.getDateFin() != null) {
            evenement.setDateFin(dto.getDateFin());
        }
        if (dto.getCouleur() != null) {
            evenement.setCouleur(dto.getCouleur());
        }
        if (dto.getSemestreId() != null) {
            Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));
            evenement.setSemestre(semestre);
        }

        return toDto(evenementRepo.save(evenement));
    }

    public void delete(Integer id) {
        if (!evenementRepo.existsById(id)) {
            throw new ResourceNotFoundException("Evenement not found: " + id);
        }
        evenementRepo.deleteById(id);
    }

    private EvenementCalendrierDto toDto(EvenementCalendrier e) {
        return EvenementCalendrierDto.builder()
                .id(e.getId())
                .titre(e.getTitre())
                .description(e.getDescription())
                .type(e.getType().name())
                .dateDebut(e.getDateDebut())
                .dateFin(e.getDateFin())
                .semestreId(e.getSemestre() != null ? e.getSemestre().getId() : null)
                .semestreLibelle(e.getSemestre() != null ? e.getSemestre().getLibelle() : null)
                .couleur(e.getCouleur())
                .build();
    }

    private TypeEvenement parseType(String s) {
        try {
            return TypeEvenement.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid type (expected RENTREE|VACANCES|EXAMEN|FERIE|SOUTENANCE|EVENEMENT|AUTRE): " + s);
        }
    }
}
