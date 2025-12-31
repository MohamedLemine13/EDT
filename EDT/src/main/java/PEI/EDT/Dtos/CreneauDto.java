package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreneauDto {

    private Integer id;

    private String jour;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String typeCreneau;

    private Integer semestreId;
}
