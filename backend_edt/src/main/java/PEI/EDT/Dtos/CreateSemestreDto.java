package PEI.EDT.Dtos;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateSemestreDto {
    private String libelle;     // S1, S2, S3...
    private LocalDate dateDebut;
    private LocalDate dateFin;
}
