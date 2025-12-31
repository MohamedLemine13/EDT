package PEI.EDT.Repositories;

import PEI.EDT.Entities.Creneau;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreneauRepository extends JpaRepository<Creneau, Integer> {
    List<Creneau> findBySemestre_Id(Integer semestreId);
}
