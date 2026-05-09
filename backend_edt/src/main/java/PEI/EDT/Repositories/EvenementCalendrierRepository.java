package PEI.EDT.Repositories;

import PEI.EDT.Entities.EvenementCalendrier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EvenementCalendrierRepository extends JpaRepository<EvenementCalendrier, Integer> {

    List<EvenementCalendrier> findBySemestre_Id(Integer semestreId);

    List<EvenementCalendrier> findByDateDebutBetween(LocalDate start, LocalDate end);

    List<EvenementCalendrier> findBySemestre_IdAndDateDebutBetween(Integer semestreId, LocalDate start, LocalDate end);
}
