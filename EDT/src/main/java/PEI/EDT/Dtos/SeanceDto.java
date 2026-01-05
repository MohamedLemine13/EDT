package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;
import static com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SeanceDto {

    private Integer id;

    // Seance
    private String type;        // CM | TD | TP
    private String statut;      // PLANIFIEE | ANNULEE | REALISEE

    // Creneau (for timetable positioning)
    private String jour;        // LUNDI, MARDI, ...
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String typeCreneau; // HE | ST | DEP | AUTRE

    // Matiere
    private String matiereCode;
    private String matiereIntitule;

    private Integer professeurId;
    private String professeurNom;
    private String professeurPrenom;

    // Salle
    private Integer salleId;
    private String salleNom;
    private String typeSalle;   // AMPHI | SALLE | LABO

    // Semaine
    private Integer semaineId;
    private Integer numeroSemaine;

    // Departements concernés (séances communes)
    private List<Integer> departementIds;
}
