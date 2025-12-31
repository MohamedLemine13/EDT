package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateAffectationEnseignementDto {

    // Context
    private Integer semestreId;
    private Integer departementId;

    // Teaching definition
    private String matiereCode; // ex: "JAVA", "RESEAUX"
    private String type;        // CM | TD | TP

    // Professor
    // Frontend sends this ONLY ONCE when creating the affectation
    private Integer professeurId;
    private Integer salleId;
}
