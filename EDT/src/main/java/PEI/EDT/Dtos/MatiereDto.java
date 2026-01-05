package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MatiereDto {
    private String code;
    private String intitule;
    private Integer credits;
    private Integer hCm;
    private Integer hTd;
    private Integer hTp;
}
