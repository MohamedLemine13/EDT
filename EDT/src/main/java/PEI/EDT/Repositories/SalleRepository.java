package PEI.EDT.Repositories;

import PEI.EDT.Entities.Salle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalleRepository extends JpaRepository<Salle, Integer> {
    List<Salle> findByDepartement_Id(Integer departementId);
    List<Salle> findByEcole_Id(String ecoleId); // ✅ NEW
}
