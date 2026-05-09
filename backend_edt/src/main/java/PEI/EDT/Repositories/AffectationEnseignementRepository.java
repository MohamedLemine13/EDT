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

    Optional<AffectationEnseignement> findBySemestre_IdAndIsCommunTrueAndMatiere_CodeAndType(
            Integer semestreId,
            String matiereCode,
            TypeSeance type
    );


    List<AffectationEnseignement> findBySemestre_IdAndDepartement_Id(Integer semestreId, Integer departementId);

    // ✅ Pour le professeur connecté: voir ses affectations
    List<AffectationEnseignement> findByProfesseur_IdAndSemestre_Id(Integer professeurId, Integer semestreId);

    List<AffectationEnseignement> findByProfesseur_Id(Integer professeurId);

    // ✅ Pour les matières par département: via les affectations
    List<AffectationEnseignement> findByDepartement_Id(Integer departementId);

    // ✅ Pour le bilan: toutes les affectations communes d'un semestre
    List<AffectationEnseignement> findBySemestre_IdAndIsCommunTrue(Integer semestreId);
}
