package PEI.EDT.Dtos;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateSalleDto {
    private String nom;
    private String typeSalle;     // AMPHI | SALLE | LABO

    // ✅ NEW: required for AMPHI (and generally recommended)
    private String ecoleId;

    // ✅ Optional: required for SALLE/LABO, null for AMPHI
    private Integer departementId;
}
