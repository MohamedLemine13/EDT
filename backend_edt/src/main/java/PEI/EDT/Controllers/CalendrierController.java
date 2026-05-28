package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateEvenementCalendrierDto;
import PEI.EDT.Dtos.EvenementCalendrierDto;
import PEI.EDT.Services.EvenementCalendrierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendrier")
@RequiredArgsConstructor
public class CalendrierController {

    private final EvenementCalendrierService evenementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EvenementCalendrierDto create(@RequestBody CreateEvenementCalendrierDto dto) {
        return evenementService.create(dto);
    }

    @GetMapping("/{id}")
    public EvenementCalendrierDto getById(@PathVariable Integer id) {
        return evenementService.getById(id);
    }

    /**
     * Liste des événements du calendrier.
     * Exemple: GET /api/calendrier?semestreId=1&startDate=2024-01-01&endDate=2024-06-30
     */
    @GetMapping
    public List<EvenementCalendrierDto> list(
            @RequestParam(required = false) Integer semestreId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return evenementService.list(semestreId, startDate, endDate);
    }

    @PutMapping("/{id}")
    public EvenementCalendrierDto update(@PathVariable Integer id, @RequestBody CreateEvenementCalendrierDto dto) {
        return evenementService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        evenementService.delete(id);
    }
}
