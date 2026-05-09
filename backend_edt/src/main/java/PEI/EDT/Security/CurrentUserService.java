package PEI.EDT.Security;

import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Exceptions.UnauthorizedException;
import PEI.EDT.Repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UtilisateurRepository utilisateurRepo;

    public Utilisateur getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated.");
        }

        String email = auth.getName(); // Spring Security username = email

        return utilisateurRepo.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found in database."));
    }
}
