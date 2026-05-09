package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateEcoleDto {
    private String id;      // Example: "E01"
    private String nom;
    private String domaine;
    private String slug;
}
