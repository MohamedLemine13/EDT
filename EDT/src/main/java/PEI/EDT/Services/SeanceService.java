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
import PEI.EDT.Security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.ForbiddenException;
import PEI.EDT.Security.CurrentUserService;
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
    private final   CurrentUserService currentUserService;


    public SeanceDto create(CreateSeanceRequestDto dto) {

        boolean isCommun = Boolean.TRUE.equals(dto.getIsCommun());

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

        // ✅ isCommun rules:
        // - DEP creneau => isCommun must be false and exactly one department
        // - HE/ST (common slot) => isCommun must be true and no departmentIds
        if (creneau.getTypeCreneau() == TypeCreneau.DEP) {
            if (isCommun) {
                throw new BadRequestException("For DEP creneau, isCommun must be false.");
            }
            if (dto.getDepartementIds() == null || dto.getDepartementIds().size() != 1) {
                throw new BadRequestException("For DEP creneau, you must provide exactly 1 departementId.");
            }
        } else {
            if (!isCommun) {
                throw new BadRequestException("For HE/ST creneau (commun), isCommun must be true.");
            }
            if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
                throw new BadRequestException("For commun seance (isCommun=true), departementIds must be empty.");
            }
        }

        Utilisateur current = currentUserService.getCurrentUser();
        assertCanWriteSeance(current, creneau.getTypeCreneau(), dto.getDepartementIds());

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
            // Teaching session => professor + salle come from AffectationEnseignement
            if (creneau.getTypeCreneau() == TypeCreneau.DEP) {

                // already validated: exactly 1 departementId
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
                seance.setSalle(aff.getSalle());

            } else {
                // ✅ COMMUN (HE/ST): use common affectation (isCommun=true)
                AffectationEnseignement aff = affectationRepo
                        .findBySemestre_IdAndIsCommunTrueAndMatiere_CodeAndType(
                                creneau.getSemestre().getId(),
                                matiere.getCode(),
                                typeSeance
                        )
                        .orElseThrow(() -> new BadRequestException(
                                "No common AffectationEnseignement found (isCommun=true) for (semestre, matiere, type)."
                        ));

                seance.setProfesseur(aff.getProfesseur());
                seance.setSalle(aff.getSalle());
            }
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
            // ✅ Non-teaching:
            // - if isCommun=true => attach to ALL departments automatically
            // - else            => attach only if user provided departementIds
            if (isCommun) {

                // Optional strict rule: for commun non-teaching, don't accept departementIds
                if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
                    throw new BadRequestException("For non-teaching commun seance (isCommun=true), do not send departementIds.");
                }

                // Attach to ALL departments (global)
                targetDepts = departementRepo.findAll();
                checkDepartementCollisionsCreate(seance, targetDepts);

            } else {

                // DEP non-teaching: if you want to enforce exactly 1 dept when creneau is DEP:
                if (creneau.getTypeCreneau() == TypeCreneau.DEP) {
                    if (dto.getDepartementIds() == null || dto.getDepartementIds().size() != 1) {
                        throw new BadRequestException("For DEP creneau (non-teaching), you must provide exactly 1 departementId.");
                    }
                }

                if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
                    // validate departments exist
                    targetDepts = dto.getDepartementIds().stream()
                            .map(deptId -> departementRepo.findById(deptId)
                                    .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + deptId)))
                            .toList();

                    checkDepartementCollisionsCreate(seance, targetDepts);
                }
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

        Utilisateur current = currentUserService.getCurrentUser();

// Ensure join table is loaded (needed if dto.departementIds is null)
        refreshJoinCollection(seance);

// Determine the effective creneau type (if user changes creneauId, we must validate the NEW type)
        TypeCreneau effectiveType;
        if (dto.getCreneauId() != null) {
            Creneau newCreneau = creneauRepo.findById(dto.getCreneauId())
                    .orElseThrow(() -> new ResourceNotFoundException("Creneau not found: " + dto.getCreneauId()));
            effectiveType = newCreneau.getTypeCreneau();
        } else {
            effectiveType = seance.getCreneau().getTypeCreneau();
        }

// Determine the effective departments list (if user doesn't send departementIds, use current join table)
        List<Integer> effectiveDeptIds = (dto.getDepartementIds() != null)
                ? dto.getDepartementIds()
                : (seance.getSeanceDepartements() == null ? List.of()
                : seance.getSeanceDepartements().stream().map(sd -> sd.getDepartement().getId()).toList());

        assertCanWriteSeance(current, effectiveType, effectiveDeptIds);

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
            // ✅ salle will be resolved from AffectationEnseignement (DEP or COMMUN)
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
            // Teaching: always resolve professeur + salle from AffectationEnseignement

            boolean effectiveCommun = (dto.getIsCommun() != null)
                    ? Boolean.TRUE.equals(dto.getIsCommun())
                    : (seance.getCreneau().getTypeCreneau() != TypeCreneau.DEP);

            if (seance.getCreneau().getTypeCreneau() == TypeCreneau.DEP) {
                if (effectiveCommun) {
                    throw new BadRequestException("For DEP creneau, isCommun must be false.");
                }

                // Determine deptId: prefer dto.departementIds if provided; otherwise infer from existing join
                Integer deptId = null;

                if (dto.getDepartementIds() != null) {
                    if (dto.getDepartementIds().size() != 1) {
                        throw new BadRequestException("For DEP creneau, you must provide exactly 1 departementId.");
                    }
                    deptId = dto.getDepartementIds().get(0);
                } else {
                    // infer from current join table
                    if (seance.getSeanceDepartements() == null || seance.getSeanceDepartements().size() != 1) {
                        throw new BadRequestException("Cannot infer departementId for DEP seance; provide departementIds=[x].");
                    }
                    deptId = seance.getSeanceDepartements().get(0).getDepartement().getId();
                }

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
                seance.setSalle(aff.getSalle());

            } else {
                // COMMUN (HE/ST)
                if (!effectiveCommun) {
                    throw new BadRequestException("For HE/ST creneau (commun), isCommun must be true.");
                }
                if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
                    throw new BadRequestException("For commun seance (isCommun=true), departementIds must be empty.");
                }

                AffectationEnseignement aff = affectationRepo
                        .findBySemestre_IdAndIsCommunTrueAndMatiere_CodeAndType(
                                seance.getCreneau().getSemestre().getId(),
                                seance.getMatiere().getCode(),
                                seance.getType()
                        )
                        .orElseThrow(() -> new BadRequestException(
                                "No common AffectationEnseignement found (isCommun=true) for (semestre, matiere, type)."
                        ));

                seance.setProfesseur(aff.getProfesseur());
                seance.setSalle(aff.getSalle());
            }
        }


        // ----------------------------
        // Department resolution + collisions
        // ----------------------------

        if (teaching) {
            // Your original behavior: determine target departments from DEP/common rule
            List<Departement> targetDepts = resolveTargetDepartements(
                    seance,
                    (seance.getCreneau().getTypeCreneau() == TypeCreneau.DEP)
                            ? (dto.getDepartementIds() != null ? dto.getDepartementIds()
                            : seance.getSeanceDepartements().stream().map(sd -> sd.getDepartement().getId()).toList())
                            : null
            );

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

        Seance s = seanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seance not found: " + id));

        Utilisateur current = currentUserService.getCurrentUser();
        refreshJoinCollection(s);
        List<Integer> deptIds = (s.getSeanceDepartements() == null) ? List.of()
                : s.getSeanceDepartements().stream().map(sd -> sd.getDepartement().getId()).toList();

        assertCanWriteSeance(current, s.getCreneau().getTypeCreneau(), deptIds);

        seanceDepartementRepo.deleteBySeance_Id(id);
        seanceRepo.deleteById(id);
    }


    @Transactional(readOnly = true)
    public SeanceDto getById(Integer id) {
        Seance s = seanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seance not found: " + id));

        refreshJoinCollection(s);

        Utilisateur current = currentUserService.getCurrentUser();
        assertCanReadSeance(current, s);

        return DtoMapper.toSeanceDto(s);
    }


    private void assertCanWriteSeance(Utilisateur u, TypeCreneau typeCreneau, List<Integer> departementIds) {

        if (u.getRole() == RoleUtilisateur.ADMIN) return;

        // Students cannot create/update/delete
        if (u.getRole() == RoleUtilisateur.ETUDIANT) {
            throw new ForbiddenException("ETUDIANT is not allowed to modify seances.");
        }

        if (u.getRole() == RoleUtilisateur.CHEF_HE) {
            if (typeCreneau != TypeCreneau.HE) {
                throw new ForbiddenException("CHEF_HE can modify only HE seances.");
            }
            return;
        }

        if (u.getRole() == RoleUtilisateur.CHEF_ST) {
            if (typeCreneau != TypeCreneau.ST) {
                throw new ForbiddenException("CHEF_ST can modify only ST seances.");
            }
            return;
        }

        if (u.getRole() == RoleUtilisateur.CHEF_DEP) {
            if (typeCreneau != TypeCreneau.DEP) {
                throw new ForbiddenException("CHEF_DEP can modify only DEP seances.");
            }

            if (u.getDepartement() == null) {
                throw new ForbiddenException("CHEF_DEP must be linked to a departement.");
            }

            if (departementIds == null || departementIds.isEmpty()) {
                throw new ForbiddenException("DEP seance must have departementIds.");
            }

            Integer chefDeptId = u.getDepartement().getId();
            if (!departementIds.contains(chefDeptId)) {
                throw new ForbiddenException("CHEF_DEP can modify only his departement seances.");
            }
            return;
        }

        throw new ForbiddenException("Role not allowed to modify seances: " + u.getRole());
    }

    private void assertCanReadSeance(Utilisateur u, Seance s) {

        if (u.getRole() == RoleUtilisateur.ADMIN) return;

        // All non-students can view all EDT
        if (u.getRole() != RoleUtilisateur.ETUDIANT) return;

        if (u.getDepartement() == null) {
            throw new ForbiddenException("ETUDIANT must be linked to a departement.");
        }

        // Commun (HE/ST) seances: visible to all students
        if (s.getCreneau() != null && s.getCreneau().getTypeCreneau() != TypeCreneau.DEP) {
            return;
        }

        // DEP seances: visible only if student's department is in the join table
        Integer studentDeptId = u.getDepartement().getId();

        boolean belongs = s.getSeanceDepartements() != null
                && s.getSeanceDepartements().stream()
                .anyMatch(sd -> sd.getDepartement().getId().equals(studentDeptId));

        if (!belongs) {
            throw new ForbiddenException("ETUDIANT can view only seances of his departement.");
        }
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
            if (seance.getSalle().getDepartement() == null) {
                throw new BadRequestException("For DEP seance, salle must be attached to a departement (AMPHI is not allowed for DEP).");
            }

            // Keep your consistency rule
            if (!seance.getSalle().getDepartement().getId().equals(dept.getId())) {
                throw new BadRequestException("For DEP seance, salle.departement must match the provided departementId.");
            }
            return List.of(dept);
        }

        String ecoleId = seance.getSalle().getEcole().getId();

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
            if (seance.getSalle().getDepartement() == null) {
                throw new BadRequestException("For DEP seance, salle must be attached to a departement (AMPHI is not allowed for DEP).");
            }

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

        // ✅ Common slot (HE/ST/AUTRE):
        // If salle exists => attach departments of that school.
        // If salle is null (ex: AUTRE Instruction Militaire) => attach ALL departments.
        List<Departement> depts;

        if (seance.getSalle() != null && seance.getSalle().getEcole() != null) {
            String ecoleId = seance.getSalle().getEcole().getId();
            depts = departementRepo.findByEcole_Id(ecoleId);
        } else {
            depts = departementRepo.findAll();
        }

        if (depts.isEmpty()) {
            throw new BadRequestException("No departments found (cannot attach common seance).");
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
