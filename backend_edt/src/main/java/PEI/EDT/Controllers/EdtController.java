package PEI.EDT.Controllers;

import PEI.EDT.Dtos.EdtSemaineDto;
import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Services.EdtService;
import PEI.EDT.Services.SeanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import PEI.EDT.Security.CurrentUserService;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.ForbiddenException;

import java.util.List;

@RestController
@RequestMapping("/api/edt")
@RequiredArgsConstructor
public class EdtController {

    private final EdtService edtService;
    private final SeanceService seanceService;
    private final CurrentUserService currentUserService;

    /**
     * Core endpoint to display timetable.
     * Example: GET /api/edt?departementId=2&semestreId=1&numeroSemaine=3
     */
    @GetMapping
    public EdtSemaineDto getEdt(
            @RequestParam Integer departementId,
            @RequestParam Integer semestreId,
            @RequestParam Integer numeroSemaine
    ) {
        return edtService.getEdt(departementId, semestreId, numeroSemaine);
    }
    /**
     * ETUDIANT endpoint: returns his own department timetable.
     * Example: GET /api/edt/me?semestreId=1&numeroSemaine=3
     */
    @GetMapping("/me")
    public EdtSemaineDto getMyEdt(
            @RequestParam Integer semestreId,
            @RequestParam Integer numeroSemaine
    ) {
        Utilisateur u = currentUserService.getCurrentUser();

        if (u.getRole() != RoleUtilisateur.ETUDIANT) {
            throw new ForbiddenException("Only ETUDIANT can use /api/edt/me.");
        }
        if (u.getDepartement() == null) {
            throw new ForbiddenException("ETUDIANT must be linked to a departement.");
        }

        Integer departementId = u.getDepartement().getId();
        return edtService.getEdt(departementId, semestreId, numeroSemaine);
    }

    /**
     * PROFESSEUR endpoint: returns his own seances for a given week.
     * Example: GET /api/edt/professeur/me?semestreId=1&semaineId=2
     */
    @GetMapping("/professeur/me")
    public List<SeanceDto> getMyProfessorEdt(
            @RequestParam Integer semestreId,
            @RequestParam Integer semaineId
    ) {
        Utilisateur u = currentUserService.getCurrentUser();

        // Allow professor roles
        if (u.getRole() != RoleUtilisateur.PROFESSEUR &&
            u.getRole() != RoleUtilisateur.CHEF_DEP &&
            u.getRole() != RoleUtilisateur.CHEF_HE &&
            u.getRole() != RoleUtilisateur.CHEF_ST &&
            u.getRole() != RoleUtilisateur.ADMIN) {
            throw new ForbiddenException("Only professors can use /api/edt/professeur/me.");
        }

        if (u.getProfesseur() == null) {
            throw new ForbiddenException("User must be linked to a professeur profile.");
        }

        Integer professeurId = u.getProfesseur().getId();
        return seanceService.listByProfesseur(professeurId, semestreId, semaineId);
    }
}
