package PEI.EDT.Repositories;

import PEI.EDT.Entities.Seance;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeanceRepository extends JpaRepository<Seance, Integer> {

    /**
     * Get all seances of a given departement for a given semestre and semaine.
     * This is the core query for "Afficher l'EDT".
     */
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

    /**
     * Same as above but fetches associated objects to avoid LazyInitializationException
     * when you map to DTO outside transaction.
     */
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
}
