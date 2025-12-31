package PEI.EDT.Repositories;

import PEI.EDT.Entities.AffectationEnseignement;
import PEI.EDT.Entities.Enums.TypeSeance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AffectationEnseignementRepository extends JpaRepository<AffectationEnseignement, Integer> {

    Optional<AffectationEnseignement> findBySemestre_IdAndDepartement_IdAndMatiere_CodeAndType(
            Integer semestreId,
            Integer departementId,
            String matiereCode,
            TypeSeance type
    );

    List<AffectationEnseignement> findBySemestre_IdAndDepartement_Id(Integer semestreId, Integer departementId);
}
