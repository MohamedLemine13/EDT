package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateSeanceRequestDto;
import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Dtos.UpdateSeanceRequestDto;
import PEI.EDT.Entities.*;
import PEI.EDT.Entities.Enums.StatutSeance;
import PEI.EDT.Entities.Enums.TypeCreneau;
import PEI.EDT.Entities.Enums.TypeSeance;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SeanceService {

    private final SeanceRepository seanceRepo;
    private final SeanceDepartementRepository seanceDepartementRepo;

    private final CreneauRepository creneauRepo;
    private final MatiereRepository matiereRepo;
    private final SalleRepository salleRepo;
    private final SemaineAcademiqueRepository semaineRepo;
    private final DepartementRepository departementRepo;

    public SeanceDto create(CreateSeanceRequestDto dto) {

        if (dto.getCreneauId() == null
                || dto.getMatiereCode() == null
                || dto.getSalleId() == null
                || dto.getSemaineId() == null
                || dto.getType() == null) {
            throw new BadRequestException("type, creneauId, matiereCode, salleId, semaineId are required.");
        }

        Creneau creneau = creneauRepo.findById(dto.getCreneauId())
                .orElseThrow(() -> new ResourceNotFoundException("Creneau not found: " + dto.getCreneauId()));

        Matiere matiere = matiereRepo.findById(dto.getMatiereCode())
                .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + dto.getMatiereCode()));

        Salle salle = salleRepo.findById(dto.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + dto.getSalleId()));

        SemaineAcademique semaine = semaineRepo.findById(dto.getSemaineId())
                .orElseThrow(() -> new ResourceNotFoundException("Semaine not found: " + dto.getSemaineId()));

        // Ensure semaine belongs to same semestre as creneau
        if (!semaine.getSemestre().getId().equals(creneau.getSemestre().getId())) {
            throw new BadRequestException("Semaine and Creneau must belong to the same Semestre.");
        }

        TypeSeance typeSeance = parseTypeSeance(dto.getType());
        StatutSeance statut = (dto.getStatut() == null) ? StatutSeance.PLANIFIEE : parseStatut(dto.getStatut());

        Seance seance = Seance.builder()
                .type(typeSeance)
                .statut(statut)
                .creneau(creneau)
                .matiere(matiere)
                .salle(salle)
                .semaineAcademique(semaine)
                .build();

        Seance saved = seanceRepo.save(seance);

        // Attach departments based on typeCreneau rule
        attachDepartments(saved, dto.getDepartementIds());

        // ✅ refresh in-place (DO NOT replace collection reference)
        refreshJoinCollection(saved);

        return DtoMapper.toSeanceDto(saved);
    }

    public SeanceDto update(Integer id, UpdateSeanceRequestDto dto) {

        Seance seance = seanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seance not found: " + id));

        if (dto.getCreneauId() != null) {
            Creneau creneau = creneauRepo.findById(dto.getCreneauId())
                    .orElseThrow(() -> new ResourceNotFoundException("Creneau not found: " + dto.getCreneauId()));
            seance.setCreneau(creneau);
        }

        if (dto.getMatiereCode() != null) {
            Matiere matiere = matiereRepo.findById(dto.getMatiereCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + dto.getMatiereCode()));
            seance.setMatiere(matiere);
        }

        if (dto.getSalleId() != null) {
            Salle salle = salleRepo.findById(dto.getSalleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + dto.getSalleId()));
            seance.setSalle(salle);
        }

        if (dto.getSemaineId() != null) {
            SemaineAcademique semaine = semaineRepo.findById(dto.getSemaineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semaine not found: " + dto.getSemaineId()));
            seance.setSemaineAcademique(semaine);
        }

        // Validate semestre alignment after potential changes
        if (!seance.getSemaineAcademique().getSemestre().getId().equals(seance.getCreneau().getSemestre().getId())) {
            throw new BadRequestException("Semaine and Creneau must belong to the same Semestre.");
        }

        if (dto.getType() != null) {
            seance.setType(parseTypeSeance(dto.getType()));
        }

        if (dto.getStatut() != null) {
            seance.setStatut(parseStatut(dto.getStatut()));
        }

        Seance saved = seanceRepo.save(seance);

        // Re-attach departments if departementIds provided OR if typeCreneau implies "all"
        attachDepartments(saved, dto.getDepartementIds());

        // ✅ refresh in-place (DO NOT replace collection reference)
        refreshJoinCollection(saved);

        return DtoMapper.toSeanceDto(saved);
    }

    public void delete(Integer id) {
        if (!seanceRepo.existsById(id)) {
            throw new ResourceNotFoundException("Seance not found: " + id);
        }
        seanceDepartementRepo.deleteBySeance_Id(id);
        seanceRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public SeanceDto getById(Integer id) {
        Seance s = seanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seance not found: " + id));

        // ✅ refresh in-place
        refreshJoinCollection(s);

        return DtoMapper.toSeanceDto(s);
    }

    /**
     * ✅ Key fix:
     * With orphanRemoval=true, NEVER do setSeanceDepartements(newList).
     * Always mutate the existing list/set instance.
     */
    private void refreshJoinCollection(Seance seance) {
        // If your Seance entity initializes the collection (recommended), this is safe.
        // If not, you must initialize it in the entity with @Builder.Default or in constructor.
        List<SeanceDepartement> links = seanceDepartementRepo.findBySeance_Id(seance.getId());

        seance.getSeanceDepartements().clear();
        seance.getSeanceDepartements().addAll(links);
    }

    private void attachDepartments(Seance seance, List<Integer> requestedDepartementIds) {

        // Clear existing links in DB (works well with composite key join table)
        seanceDepartementRepo.deleteBySeance_Id(seance.getId());

        TypeCreneau typeCreneau = seance.getCreneau().getTypeCreneau();

        if (typeCreneau == TypeCreneau.DEP) {
            if (requestedDepartementIds == null || requestedDepartementIds.size() != 1) {
                throw new BadRequestException("For DEP creneau, you must provide exactly 1 departementId.");
            }

            Integer deptId = requestedDepartementIds.get(0);
            Departement dept = departementRepo.findById(deptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + deptId));

            // Strong consistency: the room belongs to a department, DEP seance should match that department
            if (!seance.getSalle().getDepartement().getId().equals(dept.getId())) {
                throw new BadRequestException("For DEP seance, salle.departement must match the provided departementId.");
            }

            SeanceDepartement link = SeanceDepartement.builder()
                    .id(new SeanceDepartementId(seance.getId(), dept.getId()))
                    .seance(seance)
                    .departement(dept)
                    .build();

            seanceDepartementRepo.save(link);
            return;
        }

        // Common seance (HE/ST/AUTRE): attach to ALL departments of the same Ecole
        String ecoleId = seance.getSalle().getDepartement().getEcole().getId();
        List<Departement> depts = departementRepo.findByEcole_Id(ecoleId);

        if (depts.isEmpty()) {
            throw new BadRequestException("No departments found for ecoleId=" + ecoleId + " (cannot attach common seance).");
        }

        List<SeanceDepartement> links = depts.stream()
                .map(d -> SeanceDepartement.builder()
                        .id(new SeanceDepartementId(seance.getId(), d.getId()))
                        .seance(seance)
                        .departement(d)
                        .build()
                )
                .toList();

        seanceDepartementRepo.saveAll(links);
    }

    private TypeSeance parseTypeSeance(String s) {
        try {
            return TypeSeance.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid type (expected CM|TD|TP): " + s);
        }
    }

    private StatutSeance parseStatut(String s) {
        try {
            return StatutSeance.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid statut (expected PLANIFIEE|ANNULEE|REALISEE): " + s);
        }
    }
}
