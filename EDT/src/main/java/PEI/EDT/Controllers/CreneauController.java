package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreneauDto;
import PEI.EDT.Dtos.CreateCreneauDto;
import PEI.EDT.Services.CreneauService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creneaux")
@RequiredArgsConstructor
public class CreneauController {

    private final CreneauService creneauService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreneauDto create(@RequestBody CreateCreneauDto dto) {
        return creneauService.create(dto);
    }

    @GetMapping("/{id}")
    public CreneauDto getById(@PathVariable Integer id) {
        return creneauService.getById(id);
    }

    /**
     * Optional filter by semestreId:
     * GET /api/creneaux?semestreId=1
     */
    @GetMapping
    public List<CreneauDto> list(@RequestParam(required = false) Integer semestreId) {
        return creneauService.list(semestreId);
    }

    @PutMapping("/{id}")
    public CreneauDto update(@PathVariable Integer id, @RequestBody CreateCreneauDto dto) {
        return creneauService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        creneauService.delete(id);
    }
}
