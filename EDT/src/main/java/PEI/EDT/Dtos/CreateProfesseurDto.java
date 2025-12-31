package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateProfesseurDto {
    private String nom;
    private String prenom;
    private String statut; // PERMANENT | VACATAIRE
}
