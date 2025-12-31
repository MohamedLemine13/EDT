package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AffectationEnseignementDto {

    private Integer id;

    // Context
    private Integer semestreId;
    private String semestreLibelle;

    private Integer departementId;
    private String departementCode;

    // Teaching
    private String matiereCode;
    private String type; // CM | TD | TP

    // Professor
    private Integer professeurId;
    private String professeurNom;
    private String professeurPrenom;
    private String professeurStatut; // PERMANENT | VACATAIRE

    private Integer salleId;
    private String salleNom;
    private String typeSalle; // AMPHI | SALLE | LABO
}
