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

    @EntityGraph(attributePaths = {"creneau", "matiere", "salles", "professeurs", "semaineAcademique", "seanceDepartements", "seanceDepartements.departement"})
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

    // ✅ Collision checks using ManyToMany join tables
    boolean existsBySalles_IdAndCreneau_IdAndSemaineAcademique_Id(
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
    boolean existsBySalles_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
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

    // ✅ Professor collision via ManyToMany
    boolean existsByProfesseurs_IdAndCreneau_IdAndSemaineAcademique_Id(
            Integer professeurId,
            Integer creneauId,
            Integer semaineId
    );

    boolean existsByProfesseurs_IdAndCreneau_IdAndSemaineAcademique_IdAndIdNot(
            Integer professeurId,
            Integer creneauId,
            Integer semaineId,
            Integer excludeSeanceId
    );

    // ✅ For professor endpoint: load seances by professor with all relations
    @EntityGraph(attributePaths = {"creneau", "matiere", "salles", "professeurs", "semaineAcademique", "seanceDepartements", "seanceDepartements.departement"})
    List<Seance> findByProfesseurs_Id(Integer professeurId);

    @EntityGraph(attributePaths = {"creneau", "matiere", "salles", "professeurs", "semaineAcademique", "seanceDepartements", "seanceDepartements.departement"})
    List<Seance> findByCreneau_IdAndSemaineAcademique_Id(Integer creneauId, Integer semaineId);
}
