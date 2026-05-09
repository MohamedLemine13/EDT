package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateCreneauDto {

    private String jour;        // LUNDI, MARDI... (or enum name)
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String typeCreneau; // DEP | HE | ST | AUTRE

    private Integer semestreId;
}
