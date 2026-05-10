package PEI.EDT.Dtos;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AffectationEnseignementDto {

    private Integer id;

    // Context
    private Integer semestreId;
    private String semestreLibelle;

    private List<Integer> departementIds;
    private List<String> departementCodes;

    // Teaching
    private String matiereCode;
    private String type; // CM | TD | TP

    // ✅ Multiple professors
    private List<Integer> professeurIds;
    private List<String> professeurNoms;

    // ✅ Multiple salles
    private List<Integer> salleIds;
    private List<String> salleNoms;
}
