package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateDepartementDto {
    private String code;
    private String nom;
    private String ecoleId; // FK
}
