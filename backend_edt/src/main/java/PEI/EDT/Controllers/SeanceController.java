package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateSeanceRequestDto;
import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Dtos.UpdateSeanceRequestDto;
import PEI.EDT.Services.SeanceService;
import PEI.EDT.Security.CurrentUserService;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
public class SeanceController {

    private final SeanceService seanceService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeanceDto create(@RequestBody CreateSeanceRequestDto dto) {
        return seanceService.create(dto);
    }

    @GetMapping
    public List<SeanceDto> list() {
        return seanceService.list();
    }

    @GetMapping("/{id}")
    public SeanceDto getById(@PathVariable Integer id) {
        return seanceService.getById(id);
    }

    @PutMapping("/{id}")
    public SeanceDto update(@PathVariable Integer id, @RequestBody UpdateSeanceRequestDto dto) {
        return seanceService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        seanceService.delete(id);
    }

    /**
     * Get all seances for a department (optionally filtered by semester).
     * Used by the Plan page to show the full semester matrix.
     * Example: GET /api/seances/departement/1?semestreId=1
     */
    @GetMapping("/departement/{departementId}")
    public List<SeanceDto> listByDepartement(
            @PathVariable Integer departementId,
            @RequestParam(required = false) Integer semestreId
    ) {
        return seanceService.listByDepartement(departementId, semestreId, null);
    }

    /**
     * ETUDIANT/PROFESSEUR endpoint: returns seances for the current user.
     * - ETUDIANT: returns seances of his department
     * - PROFESSEUR: returns his own seances
     * Example: GET /api/seances/me?semestreId=1&semaineId=2
     */
    @GetMapping("/me")
    public List<SeanceDto> getMySeances(
            @RequestParam(required = false) Integer semestreId,
            @RequestParam(required = false) Integer semaineId
    ) {
        Utilisateur u = currentUserService.getCurrentUser();

        // ETUDIANT: get seances from his department
        if (u.getRole() == RoleUtilisateur.ETUDIANT) {
            if (u.getDepartement() == null) {
                throw new ForbiddenException("ETUDIANT must be linked to a departement.");
            }
            Integer departementId = u.getDepartement().getId();
            return seanceService.listByDepartement(departementId, semestreId, semaineId);
        }

        // PROFESSEUR roles: get their own seances
        if (u.getRole() == RoleUtilisateur.PROFESSEUR ||
            u.getRole() == RoleUtilisateur.CHEF_DEP ||
            u.getRole() == RoleUtilisateur.CHEF_HE ||
            u.getRole() == RoleUtilisateur.CHEF_ST ||
            u.getRole() == RoleUtilisateur.ADMIN) {

            if (u.getProfesseur() == null) {
                throw new ForbiddenException("User must be linked to a professeur profile.");
            }
            Integer professeurId = u.getProfesseur().getId();
            return seanceService.listByProfesseur(professeurId, semestreId, semaineId);
        }

        throw new ForbiddenException("Only ETUDIANT or PROFESSEUR roles can use /api/seances/me.");
    }
}
