package PEI.EDT.Dtos;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import static com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SalleDto {
    private Integer id;
    private String nom;
    private String typeSalle;

    private String ecoleId;        // ✅ NEW
    private Integer departementId; // can be null for AMPHI
    
    private Integer capacite;
    private String equipements;
}
