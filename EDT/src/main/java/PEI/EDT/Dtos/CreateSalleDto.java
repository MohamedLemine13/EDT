package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateSalleDto {
    private String nom;
    private String typeSalle;    // AMPHI | SALLE | LABO
    private Integer departementId;
}
