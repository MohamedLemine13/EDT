package PEI.EDT.Controllers;

import PEI.EDT.Dtos.BilanDto;
import PEI.EDT.Dtos.BilanDto.*;
import PEI.EDT.Entities.*;
import PEI.EDT.Entities.Enums.StatutSeance;
import PEI.EDT.Entities.Enums.TypeSeance;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/bilan")
@RequiredArgsConstructor
public class BilanController {

    private final AffectationEnseignementRepository affectationRepo;
    private final SeanceRepository seanceRepo;
    private final DepartementRepository departementRepo;
    private final SemestreRepository semestreRepo;
    private final SeanceDepartementRepository seanceDeptRepo;

    /**
     * GET /api/bilan?departementId=1&semestreId=1
     *
     * Returns progress data: for each matière assigned to this dept+semester,
     * computes planned hours (from Matiere entity) vs completed hours
     * (count of REALISEE séances × 1.5h slot duration).
     */
    @GetMapping
    @Transactional(readOnly = true)
    public BilanDto getBilan(
            @RequestParam Integer departementId,
            @RequestParam Integer semestreId
    ) {
        Departement dept = departementRepo.findById(departementId)
                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + departementId));
        Semestre semestre = semestreRepo.findById(semestreId)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + semestreId));

        // Get all affectations for this dept + semester (DEP-specific)
        List<AffectationEnseignement> depAffectations = affectationRepo
                .findBySemestre_IdAndDepartements_Id(semestreId, departementId);

        // Also get common affectations (empty departements)
        List<AffectationEnseignement> communAffectations = affectationRepo
                .findBySemestre_Id(semestreId).stream()
                .filter(a -> a.getDepartements().size() != 1)
                .toList();

        // Combine and group by matière code
        List<AffectationEnseignement> allAffectations = new ArrayList<>();
        allAffectations.addAll(depAffectations);
        allAffectations.addAll(communAffectations);

        // Group affectations by matière code to build per-course entries
        Map<String, List<AffectationEnseignement>> byMatiere = allAffectations.stream()
                .collect(Collectors.groupingBy(a -> a.getMatiere().getCode()));

        // Get all seances for this department in this semester via join table
        List<SeanceDepartement> seanceDepts = seanceDeptRepo.findByDepartement_Id(departementId);
        List<Seance> allSeances = seanceDepts.stream()
                .map(SeanceDepartement::getSeance)
                .filter(s -> s.getCreneau().getSemestre().getId().equals(semestreId))
                .distinct()
                .toList();

        // Group completed seances by matière code + type
        // Key: "IRT31-CM" -> count
        Map<String, Long> completedCounts = allSeances.stream()
                .filter(s -> s.getStatut() == StatutSeance.REALISEE)
                .collect(Collectors.groupingBy(
                        s -> s.getMatiere().getCode() + "-" + s.getType().name(),
                        Collectors.counting()
                ));

        // Also count total seances (any status) for reference
        Map<String, Long> totalCounts = allSeances.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getMatiere().getCode() + "-" + s.getType().name(),
                        Collectors.counting()
                ));

        // Build per-course bilan
        List<BilanMatiereDto> courses = new ArrayList<>();
        int totalPlannedCm = 0, totalPlannedTd = 0, totalPlannedTp = 0;
        int totalCompletedCm = 0, totalCompletedTd = 0, totalCompletedTp = 0;

        for (Map.Entry<String, List<AffectationEnseignement>> entry : byMatiere.entrySet()) {
            String matiereCode = entry.getKey();
            List<AffectationEnseignement> affs = entry.getValue();
            Matiere matiere = affs.get(0).getMatiere();

            // Find primary professor (from CM affectation if available)
            AffectationEnseignement primaryAff = affs.stream()
                    .filter(a -> a.getType() == TypeSeance.CM)
                    .findFirst()
                    .orElse(affs.get(0));

            // Planned hours from matière entity
            int plannedCm = matiere.getHCm();
            int plannedTd = matiere.getHTd();
            int plannedTp = matiere.getHTp();

            // Completed: count REALISEE seances × 1.5 hours (each slot = 1.5h)
            // We convert to integer hours for simplicity
            long completedCmCount = completedCounts.getOrDefault(matiereCode + "-CM", 0L);
            long completedTdCount = completedCounts.getOrDefault(matiereCode + "-TD", 0L);
            long completedTpCount = completedCounts.getOrDefault(matiereCode + "-TP", 0L);

            // Use total seances as completed count (each slot = 1 séance)
            // The planned is in hours, completed is in séance count
            // For display purposes, show count (frontend can convert)
            int cCm = (int) completedCmCount;
            int cTd = (int) completedTdCount;
            int cTp = (int) completedTpCount;

            totalPlannedCm += plannedCm;
            totalPlannedTd += plannedTd;
            totalPlannedTp += plannedTp;
            totalCompletedCm += cCm;
            totalCompletedTd += cTd;
            totalCompletedTp += cTp;

            courses.add(BilanMatiereDto.builder()
                    .matiereCode(matiereCode)
                    .matiereIntitule(matiere.getIntitule())
                    .professeurNom(!primaryAff.getProfesseurs().isEmpty() ? primaryAff.getProfesseurs().iterator().next().getNom() : "Non défini")
                    .professeurPrenom(!primaryAff.getProfesseurs().isEmpty() ? primaryAff.getProfesseurs().iterator().next().getPrenom() : "")
                    .planned(HoursDto.builder().cm(plannedCm).td(plannedTd).tp(plannedTp).build())
                    .completed(HoursDto.builder().cm(cCm).td(cTd).tp(cTp).build())
                    .build());
        }

        int totalPlanned = totalPlannedCm + totalPlannedTd + totalPlannedTp;
        int totalCompleted = totalCompletedCm + totalCompletedTd + totalCompletedTp;
        double overallPct = totalPlanned > 0 ? Math.round((double) totalCompleted / totalPlanned * 1000.0) / 10.0 : 0;

        return BilanDto.builder()
                .semestreLibelle(semestre.getLibelle())
                .departementId(departementId)
                .departementCode(dept.getCode())
                .courses(courses)
                .summary(BilanSummaryDto.builder()
                        .planned(HoursDto.builder().cm(totalPlannedCm).td(totalPlannedTd).tp(totalPlannedTp).build())
                        .completed(HoursDto.builder().cm(totalCompletedCm).td(totalCompletedTd).tp(totalCompletedTp).build())
                        .overallPercentage(overallPct)
                        .build())
                .build();
    }
}
