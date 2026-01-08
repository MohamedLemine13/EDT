package PEI.EDT.Controllers;

import PEI.EDT.Dtos.Auth.*;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.UtilisateurRepository;
import PEI.EDT.Security.CurrentUserService;
import PEI.EDT.Security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import PEI.EDT.Dtos.Auth.UserDto;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository userRepo;
    private final DepartementRepository departementRepo;
    private final PasswordEncoder encoder;

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    public UserDto register(@RequestBody RegisterRequest req)
    {

        if (req.getEmail() == null || req.getEmail().isBlank()) throw new BadRequestException("email is required");
        if (req.getPassword() == null || req.getPassword().isBlank()) throw new BadRequestException("password is required");
        if (req.getRole() == null || req.getRole().isBlank()) throw new BadRequestException("role is required");

        if (userRepo.findByEmail(req.getEmail().trim().toLowerCase()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        RoleUtilisateur role;
        try {
            role = RoleUtilisateur.valueOf(req.getRole().trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + req.getRole());
        }

        Departement dep = null;
        if (role == RoleUtilisateur.ETUDIANT || role == RoleUtilisateur.CHEF_DEP) {
            if (req.getDepartementId() == null) {
                throw new BadRequestException("departementId is required for " + role);
            }
            dep = departementRepo.findById(req.getDepartementId())
                    .orElseThrow(() -> new BadRequestException("Departement not found: " + req.getDepartementId()));
        }

        Utilisateur u = Utilisateur.builder()
                .nom(req.getNom())
                .prenom(req.getPrenom())
                .email(req.getEmail().trim().toLowerCase())
                .password(encoder.encode(req.getPassword()))
                .role(role)
                .departement(dep)
                .build();

        Utilisateur saved = userRepo.save(u);

        return UserDto.builder()
                .id(saved.getId())
                .nom(saved.getNom())
                .prenom(saved.getPrenom())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .departementId(saved.getDepartement() == null ? null : saved.getDepartement().getId())
                .build();

    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {

        if (req.getEmail() == null || req.getEmail().isBlank()) throw new BadRequestException("email is required");
        if (req.getPassword() == null || req.getPassword().isBlank()) throw new BadRequestException("password is required");

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail().trim().toLowerCase(), req.getPassword())
        );

        UserDetails user = userDetailsService.loadUserByUsername(req.getEmail().trim().toLowerCase());
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .build();
    }

    @GetMapping("/me")
    public UserDto me() {
        Utilisateur u = currentUserService.getCurrentUser();

        return UserDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .role(u.getRole().name())
                .departementId(u.getDepartement() == null ? null : u.getDepartement().getId())
                .build();
    }

}
