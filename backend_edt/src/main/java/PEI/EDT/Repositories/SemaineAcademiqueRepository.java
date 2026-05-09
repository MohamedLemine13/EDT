package PEI.EDT.Repositories;

import PEI.EDT.Entities.SemaineAcademique;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SemaineAcademiqueRepository extends JpaRepository<SemaineAcademique, Integer> {
    Optional<SemaineAcademique> findBySemestre_IdAndNumeroSemaine(Integer semestreId, Integer numeroSemaine);
    List<SemaineAcademique> findBySemestre_Id(Integer semestreId);
}
