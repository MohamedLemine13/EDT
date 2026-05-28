package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvenementCalendrierDto {
    private Integer id;
    private String titre;
    private String description;
    private String type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer semestreId;
    private String semestreLibelle;
    private String couleur;
}
