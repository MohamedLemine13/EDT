package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateAffectationEnseignementDto {

    // Context
    private Integer semestreId;
    private java.util.List<Integer> departementIds;

    // Teaching definition
    private String matiereCode; // ex: "JAVA", "RESEAUX"
    private String type;        // CM | TD | TP

    // ✅ Multiple professors and rooms
    private java.util.List<Integer> professeurIds;
    private java.util.List<Integer> salleIds;
}
