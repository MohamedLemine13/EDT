package PEI.EDT.Repositories;

import PEI.EDT.Entities.Ecole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EcoleRepository extends JpaRepository<Ecole, String> {
    Optional<Ecole> findBySlug(String slug);
}
