package PEI.EDT.Repositories;

import PEI.EDT.Entities.Departement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartementRepository extends JpaRepository<Departement, Integer> {
    List<Departement> findByEcole_Id(String ecoleId);
    List<Departement> findByCode(String code);
}
