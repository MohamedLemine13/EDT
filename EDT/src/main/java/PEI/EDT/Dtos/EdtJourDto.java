package PEI.EDT.Dtos;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EdtJourDto {

    private String jour; // LUNDI, MARDI, ...

    @Builder.Default
    private List<SeanceDto> seances = new ArrayList<>();
}
