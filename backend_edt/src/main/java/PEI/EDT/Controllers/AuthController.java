package PEI.EDT.Controllers;

import PEI.EDT.Dtos.Auth.*;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Repositories.UtilisateurRepository;
import PEI.EDT.Security.CurrentUserService;
import PEI.EDT.Security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository userRepo;
    private final PasswordEncoder encoder;

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

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
                .ecoleId(u.getEcole() == null ? null : u.getEcole().getId())
                .mustChangePassword(u.isMustChangePassword())
                .build();
    }

    @PostMapping("/change-password")
    public UserDto changePassword(@RequestBody ChangePasswordRequest req) {
        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank())
            throw new BadRequestException("currentPassword is required");
        if (req.getNewPassword() == null || req.getNewPassword().isBlank())
            throw new BadRequestException("newPassword is required");
        if (req.getNewPassword().length() < 4)
            throw new BadRequestException("newPassword must be at least 4 characters");

        Utilisateur u = currentUserService.getCurrentUser();

        // Verify current password
        if (!encoder.matches(req.getCurrentPassword(), u.getPassword())) {
            throw new BadRequestException("Le mot de passe actuel est incorrect.");
        }

        // Update password and clear the flag
        u.setPassword(encoder.encode(req.getNewPassword()));
        u.setMustChangePassword(false);
        userRepo.save(u);

        return UserDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .role(u.getRole().name())
                .departementId(u.getDepartement() == null ? null : u.getDepartement().getId())
                .ecoleId(u.getEcole() == null ? null : u.getEcole().getId())
                .mustChangePassword(false)
                .build();
    }
}
