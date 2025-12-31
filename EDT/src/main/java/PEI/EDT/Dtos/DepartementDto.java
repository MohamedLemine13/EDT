package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepartementDto {
    private Integer id;
    private String code;
    private String nom;
    private String ecoleId;
}
