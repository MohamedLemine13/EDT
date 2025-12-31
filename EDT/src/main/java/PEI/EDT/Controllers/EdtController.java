package PEI.EDT.Controllers;

import PEI.EDT.Dtos.EdtSemaineDto;
import PEI.EDT.Services.EdtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/edt")
@RequiredArgsConstructor
public class EdtController {

    private final EdtService edtService;

    /**
     * Core endpoint to display timetable.
     * Example: GET /api/edt?departementId=2&semestreId=1&numeroSemaine=3
     */
    @GetMapping
    public EdtSemaineDto getEdt(
            @RequestParam Integer departementId,
            @RequestParam Integer semestreId,
            @RequestParam Integer numeroSemaine
    ) {
        return edtService.getEdt(departementId, semestreId, numeroSemaine);
    }
}
