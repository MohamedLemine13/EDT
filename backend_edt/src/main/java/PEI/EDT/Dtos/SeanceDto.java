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

    // ✅ Multiple professors
    private List<Integer> professeurIds;
    private List<String> professeurNoms;

    // ✅ Multiple salles
    private List<Integer> salleIds;
    private List<String> salleNoms;

    // Semaine
    private Integer semaineId;
    private Integer numeroSemaine;

    // Optional tag/label
    private String tag;

    // Departements concernés (séances communes)
    private List<Integer> departementIds;
}
