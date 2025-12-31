package PEI.EDT.Repositories;

import PEI.EDT.Entities.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfesseurRepository extends JpaRepository<Professeur, Integer> {
}
