package PEI.EDT.Repositories;

import PEI.EDT.Entities.AffectationEnseignement;
import PEI.EDT.Entities.Enums.TypeSeance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AffectationEnseignementRepository extends JpaRepository<AffectationEnseignement, Integer> {

    List<AffectationEnseignement> findBySemestre_IdAndDepartements_IdAndMatiere_CodeAndType(
            Integer semestreId,
            Integer departementId,
            String matiereCode,
            TypeSeance type
    );

    List<AffectationEnseignement> findBySemestre_IdAndMatiere_CodeAndType(
            Integer semestreId,
            String matiereCode,
            TypeSeance type
    );

    List<AffectationEnseignement> findBySemestre_IdAndDepartements_Id(Integer semestreId, Integer departementId);

    List<AffectationEnseignement> findBySemestre_Id(Integer semestreId);

    // ✅ Find common affectations (those with NO departments in the junction table)
    @Query("SELECT a FROM AffectationEnseignement a WHERE a.semestre.id = :semestreId AND a.departements IS EMPTY")
    List<AffectationEnseignement> findCommonBySemestreId(Integer semestreId);

    // ✅ Pour le professeur connecté: via ManyToMany join
    List<AffectationEnseignement> findByProfesseurs_IdAndSemestre_Id(Integer professeurId, Integer semestreId);

    List<AffectationEnseignement> findByProfesseurs_Id(Integer professeurId);

    // ✅ Pour les matières par département: via les affectations
    List<AffectationEnseignement> findByDepartements_Id(Integer departementId);
}
