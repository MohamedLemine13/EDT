package PEI.EDT.Repositories;

import PEI.EDT.Entities.Seance;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeanceRepository extends JpaRepository<Seance, Integer> {

    @Query("""
        select distinct s
        from Seance s
        join s.seanceDepartements sd
        join sd.departement d
        where d.id = :departementId
          and s.creneau.semestre.id = :semestreId
          and s.semaineAcademique.id = :semaineId
        """)
    List<Seance> findEdtByDepartementSemestreSemaine(
            @Param("departementId") Integer departementId,
            @Param("semestreId") Integer semestreId,
            @Param("semaineId") Integer semaineId
    );

    @EntityGraph(attributePaths = {"creneau", "matiere", "salle", "semaineAcademique", "seanceDepartements", "seanceDepartements.departement"})
    @Query("""
        select distinct s
        from Seance s
        join s.seanceDepartements sd
        where sd.departement.id = :departementId
          and s.creneau.semestre.id = :semestreId
          and s.semaineAcademique.id = :semaineId
        """)
    List<Seance> findEdtByDepartementSemestreSemaineWithFetch(
            @Param("departementId") Integer departementId,
            @Param("semestreId") Integer semestreId,
            @Param("semaineId") Integer semaineId
    );

    // ✅ Collision checks (create)
    boolean existsBySalle_IdAndCreneau_IdAndSemaineAcademique_Id(
            Integer salleId,
            Integer creneauId,
            Integer semaineId
    );

    boolean existsBySeanceDepartements_Departement_IdAndCreneau_IdAndSemaineAcademique_Id(
            Integer departementId,
            Integer creneauId,
            Integer semaineId
    );

    // ✅ Collision checks (update: exclude current seance)
    boolean existsBySalle_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
            Integer salleId,
            Integer creneauId,
            Integer semaineId,
            Integer excludeSeanceId
    );

    boolean existsBySeanceDepartements_Departement_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
            Integer departementId,
            Integer creneauId,
            Integer semaineId,
            Integer excludeSeanceId
    );

    boolean existsByProfesseur_IdAndCreneau_IdAndSemaineAcademique_Id(
            Integer professeurId,
            Integer creneauId,
            Integer semaineId
    );

    boolean existsByProfesseur_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
            Integer professeurId,
            Integer creneauId,
            Integer semaineId,
            Integer excludeSeanceId
    );


    // ✅ For professeur collision: load seances of same slot with joins
    @EntityGraph(attributePaths = {"creneau", "matiere", "salle", "semaineAcademique", "seanceDepartements", "seanceDepartements.departement"})
    List<Seance> findByCreneau_IdAndSemaineAcademique_Id(Integer creneauId, Integer semaineId);
}
