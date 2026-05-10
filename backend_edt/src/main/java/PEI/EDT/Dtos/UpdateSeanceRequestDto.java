package PEI.EDT.Dtos;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdateSeanceRequestDto {

    // Optional updates (null means "no change")
    private String type;       // CM | TD | TP
    private String statut;     // PLANIFIEE | ANNULEE | REALISEE

    private Integer creneauId;
    private String matiereCode;
    private Integer semaineId;

    // ✅ Multiple professors and rooms
    private List<Integer> professeurIds;
    private List<Integer> salleIds;

    // ✅ commun vs dep (null means "infer from creneau")
    private Boolean isCommun;

    // Optional tag/label (e.g. "Rattrapage", "Online")
    private String tag;

    // If not null, replace the list of departments
    private List<Integer> departementIds;
}
