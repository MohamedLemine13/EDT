package PEI.EDT.Dtos;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateSeanceRequestDto {

    // Seance
    private String type;    // CM | TD | TP
    private String statut;  // optional; if null -> default PLANIFIEE

    // Links (IDs)
    private Integer creneauId;
    private String matiereCode;
    private Integer salleId;
    private Integer semaineId;

    // One or more departements (DEP vs HE/ST)
    private List<Integer> departementIds;
}
