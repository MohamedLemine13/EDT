package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SalleDto {
    private Integer id;
    private String nom;
    private String typeSalle;
    private Integer departementId;
}
