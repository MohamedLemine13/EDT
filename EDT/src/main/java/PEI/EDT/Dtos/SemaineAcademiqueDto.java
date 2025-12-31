package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SemaineAcademiqueDto {
    private Integer id;
    private Integer numeroSemaine;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer semestreId;
}
