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
    private Integer salleId;
    private Integer semaineId;
    private Integer professeurId; // optional


    // If not null, replace the list of departments
    private List<Integer> departementIds;
}
