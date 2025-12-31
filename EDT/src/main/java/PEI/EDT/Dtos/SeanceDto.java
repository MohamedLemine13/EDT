package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalTime;
import java.util.List;

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
