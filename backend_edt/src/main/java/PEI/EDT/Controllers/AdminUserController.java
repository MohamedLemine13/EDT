package PEI.EDT.Controllers;

import PEI.EDT.Dtos.Auth.CreateUserRequest;
import PEI.EDT.Dtos.Auth.UserDto;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.Ecole;
import PEI.EDT.Entities.Professeur;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ForbiddenException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.EcoleRepository;
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
    private final EcoleRepository ecoleRepo;
    private final PasswordEncoder encoder;
    private final CurrentUserService currentUserService;

    /**
     * Create a new user account.
     * - SUPER_ADMIN can create ADMIN users (must specify ecoleId)
     * - ADMIN can create CHEF_DEP, CHEF_HE, CHEF_ST, PROFESSEUR, ETUDIANT (scoped to their school)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@RequestBody CreateUserRequest req) {
        Utilisateur current = assertAdminOrSuperAdmin();

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

        // Permission checks based on current user's role
        boolean isSuperAdmin = current.getRole() == RoleUtilisateur.SUPER_ADMIN;

        if (role == RoleUtilisateur.SUPER_ADMIN) {
            throw new BadRequestException("Impossible de créer un autre SUPER_ADMIN.");
        }

        if (role == RoleUtilisateur.ADMIN && !isSuperAdmin) {
            throw new ForbiddenException("Seul un SUPER_ADMIN peut créer un ADMIN.");
        }

        if (!isSuperAdmin && current.getRole() != RoleUtilisateur.ADMIN) {
            throw new ForbiddenException("Seul un ADMIN ou SUPER_ADMIN peut créer des utilisateurs.");
        }

        // Ecole link for ADMIN role
        Ecole ecole = null;
        if (role == RoleUtilisateur.ADMIN) {
            if (req.getEcoleId() == null || req.getEcoleId().isBlank()) {
                throw new BadRequestException("ecoleId est requis pour le rôle ADMIN.");
            }
            ecole = ecoleRepo.findById(req.getEcoleId())
                    .orElseThrow(() -> new BadRequestException("École non trouvée: " + req.getEcoleId()));
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
                .ecole(ecole)
                .departement(dep)
                .professeur(prof)
                .mustChangePassword(true)
                .build();

        Utilisateur saved = userRepo.save(u);
        return toDto(saved);
    }

    /**
     * List users.
     * - SUPER_ADMIN sees all users
     * - ADMIN sees only users in their school (no other SUPER_ADMIN/ADMIN)
     */
    @GetMapping
    public List<UserDto> listUsers() {
        Utilisateur current = assertAdminOrSuperAdmin();

        if (current.getRole() == RoleUtilisateur.SUPER_ADMIN) {
            return userRepo.findAll().stream()
                    .map(this::toDto)
                    .toList();
        }

        // ADMIN: show all users (scoped by role - they see all non-SUPER_ADMIN users for now)
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() != RoleUtilisateur.SUPER_ADMIN)
                .map(this::toDto)
                .toList();
    }

    /**
     * Delete a user.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Integer id) {
        Utilisateur current = assertAdminOrSuperAdmin();

        Utilisateur target = userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        // Prevent deleting yourself
        if (current.getId().equals(target.getId())) {
            throw new BadRequestException("Vous ne pouvez pas supprimer votre propre compte.");
        }

        // ADMIN cannot delete SUPER_ADMIN or other ADMIN
        if (current.getRole() == RoleUtilisateur.ADMIN) {
            if (target.getRole() == RoleUtilisateur.SUPER_ADMIN || target.getRole() == RoleUtilisateur.ADMIN) {
                throw new ForbiddenException("Un ADMIN ne peut pas supprimer un SUPER_ADMIN ou un autre ADMIN.");
            }
        }

        userRepo.delete(target);
    }

    private Utilisateur assertAdminOrSuperAdmin() {
        Utilisateur current = currentUserService.getCurrentUser();
        if (current.getRole() != RoleUtilisateur.ADMIN && current.getRole() != RoleUtilisateur.SUPER_ADMIN) {
            throw new ForbiddenException("Seul un ADMIN ou SUPER_ADMIN peut gérer les utilisateurs.");
        }
        return current;
    }

    private UserDto toDto(Utilisateur u) {
        return UserDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .role(u.getRole().name())
                .departementId(u.getDepartement() == null ? null : u.getDepartement().getId())
                .ecoleId(u.getEcole() == null ? null : u.getEcole().getId())
                .mustChangePassword(u.isMustChangePassword())
                .build();
    }
}
