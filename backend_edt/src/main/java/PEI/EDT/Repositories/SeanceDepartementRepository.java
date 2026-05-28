package PEI.EDT.Repositories;

import PEI.EDT.Entities.SeanceDepartement;
import PEI.EDT.Entities.SeanceDepartementId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeanceDepartementRepository extends JpaRepository<SeanceDepartement, SeanceDepartementId> {
    List<SeanceDepartement> findByDepartement_Id(Integer departementId);
    List<SeanceDepartement> findBySeance_Id(Integer seanceId);
    void deleteBySeance_Id(Integer seanceId);
}
