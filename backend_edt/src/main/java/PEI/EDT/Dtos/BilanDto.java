package PEI.EDT.Dtos;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BilanDto {

    private String semestreLibelle;
    private Integer departementId;
    private String departementCode;

    private List<BilanMatiereDto> courses;

    private BilanSummaryDto summary;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BilanMatiereDto {
        private String matiereCode;
        private String matiereIntitule;
        private String professeurNom;
        private String professeurPrenom;
        private HoursDto planned;
        private HoursDto completed;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BilanSummaryDto {
        private HoursDto planned;
        private HoursDto completed;
        private double overallPercentage;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class HoursDto {
        private int cm;
        private int td;
        private int tp;
    }
}
