package PEI.EDT.Controllers;

import PEI.EDT.Dtos.AffectationEnseignementDto;
import PEI.EDT.Dtos.CreateAffectationEnseignementDto;
import PEI.EDT.Services.AffectationEnseignementService;
import PEI.EDT.Security.CurrentUserService;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@RequiredArgsConstructor
public class AffectationEnseignementController {

    private final AffectationEnseignementService affectationService;
    private final CurrentUserService currentUserService;

    /**
     * Create OR update (upsert) an affectation:
     * (semestre, departement, matiere, type) -> professeur
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AffectationEnseignementDto upsert(@RequestBody CreateAffectationEnseignementDto dto) {
        return affectationService.upsert(dto);
    }

    /**
     * List affectations of a given departement for a given semestre.
     * Example: GET /api/affectations?semestreId=1&departementId=2
     */
    @GetMapping
    public List<AffectationEnseignementDto> list(
            @RequestParam Integer semestreId,
            @RequestParam Integer departementId
    ) {
        return affectationService.listBySemestreAndDepartement(semestreId, departementId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        affectationService.delete(id);
    }

    /**
     * PROFESSEUR endpoint: returns his own affectations.
     * Example: GET /api/affectations/me?semestreId=1
     */
    @GetMapping("/me")
    public List<AffectationEnseignementDto> getMyAffectations(
            @RequestParam(required = false) Integer semestreId
    ) {
        Utilisateur u = currentUserService.getCurrentUser();

        // Allow PROFESSEUR, CHEF_DEP, CHEF_HE, CHEF_ST (professor roles)
        if (u.getRole() != RoleUtilisateur.PROFESSEUR &&
            u.getRole() != RoleUtilisateur.CHEF_DEP &&
            u.getRole() != RoleUtilisateur.CHEF_HE &&
            u.getRole() != RoleUtilisateur.CHEF_ST &&
            u.getRole() != RoleUtilisateur.ADMIN) {
            throw new ForbiddenException("Only professors can use /api/affectations/me.");
        }

        if (u.getProfesseur() == null) {
            throw new ForbiddenException("User must be linked to a professeur profile.");
        }

        Integer professeurId = u.getProfesseur().getId();

        if (semestreId != null) {
            return affectationService.listByProfesseurAndSemestre(professeurId, semestreId);
        } else {
            return affectationService.listByProfesseur(professeurId);
        }
    }
}
