package PEI.EDT.Config;

import PEI.EDT.Repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevPasswordSeeder implements CommandLineRunner {

    private final UtilisateurRepository userRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        userRepo.findAll().forEach(u -> {
            if ("TEMP".equals(u.getPassword())) {
                // default password for all seeded accounts (change later)
                u.setPassword(encoder.encode("1234"));
                userRepo.save(u);
            }
        });
    }
}
