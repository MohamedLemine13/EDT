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
    private final AffectationEnseignementRepository affectationRepo;
    private final ProfesseurRepository professeurRepo;



    public SeanceDto create(CreateSeanceRequestDto dto) {

        // type / creneau / semaine always required
        if (dto.getCreneauId() == null || dto.getSemaineId() == null || dto.getType() == null) {
            throw new BadRequestException("type, creneauId, semaineId are required.");
        }

        TypeSeance typeSeance = parseTypeSeance(dto.getType());
        boolean teaching = isTeachingType(typeSeance);

        // For teaching sessions (CM/TD/TP) keep your old required fields
        if (teaching && dto.getMatiereCode() == null) {
            throw new BadRequestException("For CM/TD/TP: matiereCode is required.");
        }


        Creneau creneau = creneauRepo.findById(dto.getCreneauId())
                .orElseThrow(() -> new ResourceNotFoundException("Creneau not found: " + dto.getCreneauId()));

        SemaineAcademique semaine = semaineRepo.findById(dto.getSemaineId())
                .orElseThrow(() -> new ResourceNotFoundException("Semaine not found: " + dto.getSemaineId()));

        // Ensure semaine belongs to same semestre as creneau
        if (!semaine.getSemestre().getId().equals(creneau.getSemestre().getId())) {
            throw new BadRequestException("Semaine and Creneau must belong to the same Semestre.");
        }

        StatutSeance statut = (dto.getStatut() == null) ? StatutSeance.PLANIFIEE : parseStatut(dto.getStatut());

        // Optional links (depend on type)
        Matiere matiere = null;
        Salle salle = null;

        if (dto.getMatiereCode() != null) {
            matiere = matiereRepo.findById(dto.getMatiereCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + dto.getMatiereCode()));
        }
        // salle is ONLY manual for non-teaching seances
        if (!teaching && dto.getSalleId() != null) {
            salle = salleRepo.findById(dto.getSalleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + dto.getSalleId()));
        }

        Seance seance = Seance.builder()
                .type(typeSeance)
                .statut(statut)
                .creneau(creneau)
                .matiere(matiere)
                .salle(salle)
                .semaineAcademique(semaine)
                .build();

        // =========================
        // PROF / SALLE ASSIGNMENT
        // =========================

        if (!teaching) {
            // Non CM/TD/TP => manual professor + manual salle (both optional)
            if (dto.getProfesseurId() != null) {
                Professeur prof = professeurRepo.findById(dto.getProfesseurId())
                        .orElseThrow(() -> new ResourceNotFoundException("Professeur not found: " + dto.getProfesseurId()));
                seance.setProfesseur(prof);
            } else {
                seance.setProfesseur(null);
            }
            // salle already optional (seance.setSalle(salle)) - ok
        } else {
            // Teaching session => keep affectation logic (DEP case)
            if (creneau.getTypeCreneau() == TypeCreneau.DEP) {

                if (dto.getDepartementIds() == null || dto.getDepartementIds().size() != 1) {
                    throw new BadRequestException(
                            "For DEP creneau, exactly one departementId is required to resolve professeur."
                    );
                }

                Integer deptId = dto.getDepartementIds().get(0);

                AffectationEnseignement aff = affectationRepo
                        .findBySemestre_IdAndDepartement_IdAndMatiere_CodeAndType(
                                creneau.getSemestre().getId(),
                                deptId,
                                matiere.getCode(),
                                typeSeance
                        )
                        .orElseThrow(() -> new BadRequestException(
                                "No AffectationEnseignement found for (semestre, departement, matiere, type)."
                        ));

                seance.setProfesseur(aff.getProfesseur());
                seance.setSalle(aff.getSalle()); // ✅ THIS IS THE KEY FIX

            }
            // NOTE: For non-DEP teaching types, your current project does not resolve professeur here.
            // We keep it unchanged to avoid breaking your current model.
        }

        // =========================
        // COLLISION CHECKS
        // =========================

        // salle collision only if salle != null
        if (seance.getSalle() != null) {
            checkSalleCollisionCreate(seance);
        }

        // departement collisions / attachments:
        // - For teaching: keep your current behavior (resolveTargetDepartements depends on salle)
        // - For non-teaching: only attach if user provided departementIds (optional)
        List<Departement> targetDepts = null;

        if (teaching) {
            targetDepts = resolveTargetDepartements(seance, dto.getDepartementIds());
            checkDepartementCollisionsCreate(seance, targetDepts);
        } else {
            if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
                // validate departments exist
                targetDepts = dto.getDepartementIds().stream()
                        .map(deptId -> departementRepo.findById(deptId)
                                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + deptId)))
                        .toList();

                checkDepartementCollisionsCreate(seance, targetDepts);
            }
        }

        // teacher collision only if professeur != null (avoid NPE)
        if (seance.getProfesseur() != null) {
            if (seanceRepo.existsByProfesseur_IdAndCreneau_IdAndSemaineAcademique_Id(
                    seance.getProfesseur().getId(),
                    seance.getCreneau().getId(),
                    seance.getSemaineAcademique().getId()
            )) {
                throw new BadRequestException("This teacher already has a seance at this time.");
            }
        }

        Seance saved = seanceRepo.save(seance);

        // attach departments
        if (targetDepts != null && !targetDepts.isEmpty()) {
            attachDepartments(saved, targetDepts.stream().map(Departement::getId).toList());
            refreshJoinCollection(saved);
        }

        return DtoMapper.toSeanceDto(saved);
    }


    public SeanceDto update(Integer id, UpdateSeanceRequestDto dto) {

        Seance seance = seanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seance not found: " + id));

        // Track whether the caller changed the type in this request
        boolean typeChangedInRequest = (dto.getType() != null);

        // ----------------------------
        // Apply field updates
        // ----------------------------

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

        // Convention for UPDATE:
        // - dto.salleId == null   => no change
        // - dto.salleId == 0      => clear salle (set null)
        // - dto.salleId > 0       => set salle
        if (dto.getSalleId() != null) {
            if (dto.getSalleId() == 0) {
                seance.setSalle(null);
            } else {
                Salle salle = salleRepo.findById(dto.getSalleId())
                        .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + dto.getSalleId()));
                seance.setSalle(salle);
            }
        }

        if (dto.getSemaineId() != null) {
            SemaineAcademique semaine = semaineRepo.findById(dto.getSemaineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semaine not found: " + dto.getSemaineId()));
            seance.setSemaineAcademique(semaine);
        }

        if (dto.getType() != null) {
            seance.setType(parseTypeSeance(dto.getType()));
        }

        if (dto.getStatut() != null) {
            seance.setStatut(parseStatut(dto.getStatut()));
        }

        // ----------------------------
        // Validate semestre alignment
        // ----------------------------
        if (!seance.getSemaineAcademique().getSemestre().getId().equals(seance.getCreneau().getSemestre().getId())) {
            throw new BadRequestException("Semaine and Creneau must belong to the same Semestre.");
        }

        // ----------------------------
        // Type-based rules
        // ----------------------------
        boolean teaching = isTeachingType(seance.getType());

        // If the seance is CM/TD/TP, these must exist
        if (teaching) {
            if (seance.getMatiere() == null) {
                throw new BadRequestException("For CM/TD/TP: matiereCode is required (cannot be null).");
            }
            if (seance.getSalle() == null) {
                throw new BadRequestException("For CM/TD/TP: salleId is required (cannot be null).");
            }
        }

        // ----------------------------
        // Professeur assignment rules
        // ----------------------------

        if (!teaching) {
            // Non CM/TD/TP: professeur is manual; NEVER use AffectationEnseignement

            // Convention for UPDATE:
            // - dto.professeurId == null => if type changed to non-teaching, clear professeur; otherwise keep existing
            // - dto.professeurId == 0    => clear professeur (set null)
            // - dto.professeurId > 0     => set professeur
            if (dto.getProfesseurId() != null) {
                if (dto.getProfesseurId() == 0) {
                    seance.setProfesseur(null);
                } else {
                    Professeur prof = professeurRepo.findById(dto.getProfesseurId())
                            .orElseThrow(() -> new ResourceNotFoundException("Professeur not found: " + dto.getProfesseurId()));
                    seance.setProfesseur(prof);
                }
            } else if (typeChangedInRequest) {
                // Type changed in this request (e.g., CM -> MEETING): ensure we are not stuck with affectation-driven prof
                seance.setProfesseur(null);
            }

            // Departments:
            // For non-teaching seances, your existing model attaches departments via salle/ecole logic.
            // If salle is null, we cannot safely attach departments (because resolveTargetDepartements/attachDepartments use salle).
            if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty() && seance.getSalle() == null) {
                throw new BadRequestException("Cannot attach departements when salle is null (non CM/TD/TP). Provide salleId or omit departementIds.");
            }

        } else {
            // Teaching seance (CM/TD/TP): professor comes from AffectationEnseignement in DEP case (same as your create)

            if (seance.getCreneau().getTypeCreneau() == TypeCreneau.DEP) {

                if (dto.getDepartementIds() == null || dto.getDepartementIds().size() != 1) {
                    throw new BadRequestException("For DEP creneau, exactly one departementId is required to resolve professeur.");
                }

                Integer deptId = dto.getDepartementIds().get(0);

                AffectationEnseignement aff = affectationRepo
                        .findBySemestre_IdAndDepartement_IdAndMatiere_CodeAndType(
                                seance.getCreneau().getSemestre().getId(),
                                deptId,
                                seance.getMatiere().getCode(),
                                seance.getType()
                        )
                        .orElseThrow(() -> new BadRequestException(
                                "No AffectationEnseignement found for (semestre, departement, matiere, type)."
                        ));

                seance.setProfesseur(aff.getProfesseur());
            }

            // If you later want to enforce professor resolution for non-DEP teaching slots,
            // you can add it here. For now we keep your existing behavior.
        }

        // ----------------------------
        // Department resolution + collisions
        // ----------------------------

        if (teaching) {
            // Your original behavior: determine target departments from DEP/common rule
            List<Departement> targetDepts = resolveTargetDepartements(seance, dto.getDepartementIds());

            // salle collision only if salle is not null (should be non-null for teaching)
            if (seance.getSalle() != null) {
                checkSalleCollisionUpdate(seance, id);
            }

            checkDepartementCollisionsUpdate(seance, targetDepts, id);

            // teacher collision only if professeur is not null
            if (seance.getProfesseur() != null && seanceRepo.existsByProfesseur_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
                    seance.getProfesseur().getId(),
                    seance.getCreneau().getId(),
                    seance.getSemaineAcademique().getId(),
                    id
            )) {
                throw new BadRequestException("This teacher already has a seance at this time.");
            }

            Seance saved = seanceRepo.save(seance);

            // reattach with computed target list
            attachDepartments(saved, targetDepts.stream().map(Departement::getId).toList());

            // refresh in-place
            refreshJoinCollection(saved);

            return DtoMapper.toSeanceDto(saved);

        } else {
            // Non teaching: we do NOT force department attachment (unless you keep salle and your rules allow it)
            // We'll keep your existing join table unchanged unless departementIds were provided AND salle != null.

            // salle collision only if salle not null
            if (seance.getSalle() != null) {
                checkSalleCollisionUpdate(seance, id);
            }

            // teacher collision only if professeur not null
            if (seance.getProfesseur() != null && seanceRepo.existsByProfesseur_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
                    seance.getProfesseur().getId(),
                    seance.getCreneau().getId(),
                    seance.getSemaineAcademique().getId(),
                    id
            )) {
                throw new BadRequestException("This teacher already has a seance at this time.");
            }

            Seance saved = seanceRepo.save(seance);

            // Optional: if user explicitly provided departementIds AND salle != null, reuse your attach logic
            if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
                // NOTE: resolveTargetDepartements requires salle != null; we already validated that above
                List<Departement> targetDepts = resolveTargetDepartements(seance, dto.getDepartementIds());
                checkDepartementCollisionsUpdate(seance, targetDepts, id);

                attachDepartments(saved, targetDepts.stream().map(Departement::getId).toList());
                refreshJoinCollection(saved);
            } else {
                refreshJoinCollection(saved);
            }

            return DtoMapper.toSeanceDto(saved);
        }
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

    private void checkSalleCollisionCreate(Seance seance) {
        boolean occupied = seanceRepo.existsBySalle_IdAndCreneau_IdAndSemaineAcademique_Id(
                seance.getSalle().getId(),
                seance.getCreneau().getId(),
                seance.getSemaineAcademique().getId()
        );
        if (occupied) {
            throw new BadRequestException("Salle is already occupied for this creneau and semaine.");
        }
    }

    private void checkSalleCollisionUpdate(Seance seance, Integer seanceId) {
        boolean occupied = seanceRepo.existsBySalle_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
                seance.getSalle().getId(),
                seance.getCreneau().getId(),
                seance.getSemaineAcademique().getId(),
                seanceId
        );
        if (occupied) {
            throw new BadRequestException("Salle is already occupied for this creneau and semaine.");
        }
    }

    private List<Departement> resolveTargetDepartements(Seance seance, List<Integer> requestedDepartementIds) {

        TypeCreneau typeCreneau = seance.getCreneau().getTypeCreneau();

        if (typeCreneau == TypeCreneau.DEP) {
            if (requestedDepartementIds == null || requestedDepartementIds.size() != 1) {
                throw new BadRequestException("For DEP creneau, you must provide exactly 1 departementId.");
            }
            Integer deptId = requestedDepartementIds.get(0);
            Departement dept = departementRepo.findById(deptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + deptId));

            // Keep your consistency rule
            if (!seance.getSalle().getDepartement().getId().equals(dept.getId())) {
                throw new BadRequestException("For DEP seance, salle.departement must match the provided departementId.");
            }
            return List.of(dept);
        }

        // common: all departments in same school
        String ecoleId = seance.getSalle().getDepartement().getEcole().getId();
        List<Departement> depts = departementRepo.findByEcole_Id(ecoleId);
        if (depts.isEmpty()) {
            throw new BadRequestException("No departments found for ecoleId=" + ecoleId + " (cannot attach common seance).");
        }
        return depts;
    }

    private void checkDepartementCollisionsCreate(Seance seance, List<Departement> targetDepts) {
        for (Departement d : targetDepts) {
            boolean conflict = seanceRepo.existsBySeanceDepartements_Departement_IdAndCreneau_IdAndSemaineAcademique_Id(
                    d.getId(),
                    seance.getCreneau().getId(),
                    seance.getSemaineAcademique().getId()
            );
            if (conflict) {
                throw new BadRequestException("Departement " + d.getId() + " already has a seance at this time.");
            }
        }
    }

    private void checkDepartementCollisionsUpdate(Seance seance, List<Departement> targetDepts, Integer seanceId) {
        for (Departement d : targetDepts) {
            boolean conflict = seanceRepo.existsBySeanceDepartements_Departement_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
                    d.getId(),
                    seance.getCreneau().getId(),
                    seance.getSemaineAcademique().getId(),
                    seanceId
            );
            if (conflict) {
                throw new BadRequestException("Departement " + d.getId() + " already has a seance at this time.");
            }
        }
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

    private boolean isTeachingType(TypeSeance t) {
        return t == TypeSeance.CM || t == TypeSeance.TD || t == TypeSeance.TP;
    }


    private TypeSeance parseTypeSeance(String s) {
        try {
            return TypeSeance.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid type (expected CM|TD|TP|DEVOIR|EXAMEN|MEETING|AUTRE): " + s);
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
