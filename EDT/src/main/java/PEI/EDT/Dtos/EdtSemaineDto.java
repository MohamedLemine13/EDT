package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EdtSemaineDto {

    // Semestre context
    private Integer semestreId;
    private String semestreLibelle; // S1, S2, S3 ...

    // Semaine context
    private Integer semaineId;
    private Integer numeroSemaine;
    private LocalDate dateDebut;
    private LocalDate dateFin;

    // Departement context
    private Integer departementId;
    private String departementCode;
    private String departementNom;

    @Builder.Default
    private List<EdtJourDto> jours = new ArrayList<>();
}
