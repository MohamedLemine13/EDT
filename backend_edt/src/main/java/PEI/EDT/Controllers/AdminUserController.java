package PEI.EDT.Controllers;

import PEI.EDT.Dtos.Auth.CreateUserRequest;
import PEI.EDT.Dtos.Auth.UserDto;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.Professeur;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ForbiddenException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.ProfesseurRepository;
import PEI.EDT.Repositories.UtilisateurRepository;
import PEI.EDT.Security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UtilisateurRepository userRepo;
    private final DepartementRepository departementRepo;
    private final ProfesseurRepository professeurRepo;
    private final PasswordEncoder encoder;
    private final CurrentUserService currentUserService;

    /**
     * Admin-only: create a new user account.
     * The user will be required to change their password on first login.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@RequestBody CreateUserRequest req) {
        assertAdmin();

        if (req.getEmail() == null || req.getEmail().isBlank()) throw new BadRequestException("email is required");
        if (req.getPassword() == null || req.getPassword().isBlank()) throw new BadRequestException("password is required");
        if (req.getRole() == null || req.getRole().isBlank()) throw new BadRequestException("role is required");
        if (req.getNom() == null || req.getNom().isBlank()) throw new BadRequestException("nom is required");
        if (req.getPrenom() == null || req.getPrenom().isBlank()) throw new BadRequestException("prenom is required");

        if (userRepo.findByEmail(req.getEmail().trim().toLowerCase()).isPresent()) {
            throw new BadRequestException("Un utilisateur avec cet email existe déjà.");
        }

        RoleUtilisateur role;
        try {
            role = RoleUtilisateur.valueOf(req.getRole().trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Rôle invalide: " + req.getRole());
        }

        // Departement required for ETUDIANT and CHEF_DEP
        Departement dep = null;
        if (role == RoleUtilisateur.ETUDIANT || role == RoleUtilisateur.CHEF_DEP) {
            if (req.getDepartementId() == null) {
                throw new BadRequestException("departementId est requis pour " + role);
            }
            dep = departementRepo.findById(req.getDepartementId())
                    .orElseThrow(() -> new BadRequestException("Département non trouvé: " + req.getDepartementId()));
        }

        // Optional professeur link (for PROFESSEUR, CHEF_DEP, CHEF_HE, CHEF_ST roles)
        Professeur prof = null;
        if (req.getProfesseurId() != null) {
            prof = professeurRepo.findById(req.getProfesseurId())
                    .orElseThrow(() -> new BadRequestException("Professeur non trouvé: " + req.getProfesseurId()));
        }

        Utilisateur u = Utilisateur.builder()
                .nom(req.getNom().trim())
                .prenom(req.getPrenom().trim())
                .email(req.getEmail().trim().toLowerCase())
                .password(encoder.encode(req.getPassword()))
                .role(role)
                .departement(dep)
                .professeur(prof)
                .mustChangePassword(true)
                .build();

        Utilisateur saved = userRepo.save(u);
        return toDto(saved);
    }

    /**
     * Admin-only: list all users.
     */
    @GetMapping
    public List<UserDto> listUsers() {
        assertAdmin();
        return userRepo.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Admin-only: delete a user.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Integer id) {
        assertAdmin();

        Utilisateur target = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        // Prevent admin from deleting themselves
        Utilisateur current = currentUserService.getCurrentUser();
        if (current.getId().equals(target.getId())) {
            throw new BadRequestException("Vous ne pouvez pas supprimer votre propre compte.");
        }

        userRepo.delete(target);
    }

    private void assertAdmin() {
        Utilisateur current = currentUserService.getCurrentUser();
        if (current.getRole() != RoleUtilisateur.ADMIN) {
            throw new ForbiddenException("Seul un ADMIN peut gérer les utilisateurs.");
        }
    }

    private UserDto toDto(Utilisateur u) {
        return UserDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .role(u.getRole().name())
                .departementId(u.getDepartement() == null ? null : u.getDepartement().getId())
                .mustChangePassword(u.isMustChangePassword())
                .build();
    }
}
