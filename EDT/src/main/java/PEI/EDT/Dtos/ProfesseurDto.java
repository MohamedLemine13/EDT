package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfesseurDto {
    private Integer id;
    private String nom;
    private String prenom;
    private String statut; // PERMANENT | VACATAIRE
}
