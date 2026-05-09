package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EcoleDto {
    private String id;
    private String nom;
    private String domaine;
    private String slug;
}
