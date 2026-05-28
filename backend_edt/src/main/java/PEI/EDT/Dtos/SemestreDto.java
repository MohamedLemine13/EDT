package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SemestreDto {
    private Integer id;
    private String libelle;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}
