package PEI.EDT.Controllers;

import PEI.EDT.Dtos.Auth.UserDto;
import PEI.EDT.Dtos.CreateEcoleDto;
import PEI.EDT.Dtos.DepartementDto;
import PEI.EDT.Dtos.EcoleDto;
import PEI.EDT.Entities.Ecole;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ForbiddenException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.EcoleRepository;
import PEI.EDT.Repositories.UtilisateurRepository;
import PEI.EDT.Security.CurrentUserService;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
@Transactional
public class SuperAdminController {

    private final EcoleRepository ecoleRepo;
    private final UtilisateurRepository userRepo;
    private final PasswordEncoder encoder;
    private final CurrentUserService currentUserService;

    // ─── DTOs specific to this controller ──────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateSchoolRequest {
        private CreateEcoleDto ecole;
        private AdminInfo admin;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AdminInfo {
        private String nom;
        private String prenom;
        private String email;
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SchoolWithAdminResponse {
        private EcoleDto ecole;
        private UserDto admin;
        private int departementCount;
        private List<DepartementDto> departements;
    }

    // ─── Endpoints ─────────────────────────────────────────────────

    /**
     * Create a new school with its admin user.
     */
    @PostMapping("/schools")
    @ResponseStatus(HttpStatus.CREATED)
    public SchoolWithAdminResponse createSchool(@RequestBody CreateSchoolRequest req) {
        assertSuperAdmin();

        // Validate école
        if (req.getEcole() == null) throw new BadRequestException("ecole is required");
        CreateEcoleDto ecoleDto = req.getEcole();
        if (ecoleDto.getId() == null || ecoleDto.getId().isBlank()) throw new BadRequestException("ecole.id is required");
        if (ecoleDto.getNom() == null || ecoleDto.getNom().isBlank()) throw new BadRequestException("ecole.nom is required");
        if (ecoleDto.getSlug() == null || ecoleDto.getSlug().isBlank()) throw new BadRequestException("ecole.slug is required");

        if (ecoleRepo.existsById(ecoleDto.getId())) {
            throw new BadRequestException("Une école avec cet ID existe déjà: " + ecoleDto.getId());
        }

        // Validate admin
        if (req.getAdmin() == null) throw new BadRequestException("admin is required");
        AdminInfo adminInfo = req.getAdmin();
        if (adminInfo.getEmail() == null || adminInfo.getEmail().isBlank()) throw new BadRequestException("admin.email is required");
        if (adminInfo.getPassword() == null || adminInfo.getPassword().isBlank()) throw new BadRequestException("admin.password is required");
        if (adminInfo.getNom() == null || adminInfo.getNom().isBlank()) throw new BadRequestException("admin.nom is required");
        if (adminInfo.getPrenom() == null || adminInfo.getPrenom().isBlank()) throw new BadRequestException("admin.prenom is required");

        if (userRepo.findByEmail(adminInfo.getEmail().trim().toLowerCase()).isPresent()) {
            throw new BadRequestException("Un utilisateur avec cet email existe déjà: " + adminInfo.getEmail());
        }

        // Create école
        Ecole ecole = Ecole.builder()
                .id(ecoleDto.getId().trim())
                .nom(ecoleDto.getNom().trim())
                .domaine(ecoleDto.getDomaine() != null ? ecoleDto.getDomaine().trim() : "")
                .slug(ecoleDto.getSlug().trim())
                .build();
        ecole = ecoleRepo.save(ecole);

        // Create admin user linked to the école
        Utilisateur admin = Utilisateur.builder()
                .nom(adminInfo.getNom().trim())
                .prenom(adminInfo.getPrenom().trim())
                .email(adminInfo.getEmail().trim().toLowerCase())
                .password(encoder.encode(adminInfo.getPassword()))
                .role(RoleUtilisateur.ADMIN)
                .ecole(ecole)
                .mustChangePassword(true)
                .build();
        admin = userRepo.save(admin);

        return buildResponse(ecole, admin);
    }

    /**
     * List all schools with their admin info.
     */
    @GetMapping("/schools")
    public List<SchoolWithAdminResponse> listSchools() {
        assertSuperAdmin();

        List<Ecole> ecoles = ecoleRepo.findAll();
        return ecoles.stream().map(ecole -> {
            Utilisateur admin = userRepo.findAll().stream()
                    .filter(u -> u.getRole() == RoleUtilisateur.ADMIN && u.getEcole() != null && u.getEcole().getId().equals(ecole.getId()))
                    .findFirst()
                    .orElse(null);
            return buildResponse(ecole, admin);
        }).toList();
    }

    /**
     * Get a single school with details.
     */
    @GetMapping("/schools/{id}")
    public SchoolWithAdminResponse getSchool(@PathVariable String id) {
        assertSuperAdmin();

        Ecole ecole = ecoleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("École non trouvée: " + id));

        Utilisateur admin = userRepo.findAll().stream()
                .filter(u -> u.getRole() == RoleUtilisateur.ADMIN && u.getEcole() != null && u.getEcole().getId().equals(ecole.getId()))
                .findFirst()
                .orElse(null);

        return buildResponse(ecole, admin);
    }

    /**
     * Update school info.
     */
    @PutMapping("/schools/{id}")
    public SchoolWithAdminResponse updateSchool(@PathVariable String id, @RequestBody CreateEcoleDto dto) {
        assertSuperAdmin();

        Ecole ecole = ecoleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("École non trouvée: " + id));

        if (dto.getNom() != null && !dto.getNom().isBlank()) ecole.setNom(dto.getNom().trim());
        if (dto.getDomaine() != null) ecole.setDomaine(dto.getDomaine().trim());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) ecole.setSlug(dto.getSlug().trim());

        Ecole savedEcole = ecoleRepo.save(ecole);
        final String savedEcoleId = savedEcole.getId();

        Utilisateur admin = userRepo.findAll().stream()
                .filter(u -> u.getRole() == RoleUtilisateur.ADMIN && u.getEcole() != null && u.getEcole().getId().equals(savedEcoleId))
                .findFirst()
                .orElse(null);

        return buildResponse(savedEcole, admin);
    }

    /**
     * Delete a school and its admin user.
     */
    @DeleteMapping("/schools/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchool(@PathVariable String id) {
        assertSuperAdmin();

        Ecole ecole = ecoleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("École non trouvée: " + id));

        // Delete admin users linked to this school
        userRepo.findAll().stream()
                .filter(u -> u.getEcole() != null && u.getEcole().getId().equals(id))
                .forEach(userRepo::delete);

        ecoleRepo.delete(ecole);
    }

    // ─── Helpers ───────────────────────────────────────────────────

    private void assertSuperAdmin() {
        Utilisateur current = currentUserService.getCurrentUser();
        if (current.getRole() != RoleUtilisateur.SUPER_ADMIN) {
            throw new ForbiddenException("Seul un SUPER_ADMIN peut accéder à cette ressource.");
        }
    }

    private SchoolWithAdminResponse buildResponse(Ecole ecole, Utilisateur admin) {
        EcoleDto ecoleDto = EcoleDto.builder()
                .id(ecole.getId())
                .nom(ecole.getNom())
                .domaine(ecole.getDomaine())
                .slug(ecole.getSlug())
                .build();

        UserDto adminDto = admin == null ? null : UserDto.builder()
                .id(admin.getId())
                .nom(admin.getNom())
                .prenom(admin.getPrenom())
                .email(admin.getEmail())
                .role(admin.getRole().name())
                .ecoleId(ecole.getId())
                .mustChangePassword(admin.isMustChangePassword())
                .build();

        List<DepartementDto> depts = ecole.getDepartements() == null ? List.of() :
                ecole.getDepartements().stream()
                        .map(d -> DepartementDto.builder()
                                .id(d.getId())
                                .code(d.getCode())
                                .nom(d.getNom())
                                .ecoleId(ecole.getId())
                                .build())
                        .toList();

        return SchoolWithAdminResponse.builder()
                .ecole(ecoleDto)
                .admin(adminDto)
                .departementCount(depts.size())
                .departements(depts)
                .build();
    }
}
