package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateSemaineAcademiqueDto;
import PEI.EDT.Dtos.SemaineAcademiqueDto;
import PEI.EDT.Services.SemaineAcademiqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semaines")
@RequiredArgsConstructor
public class SemaineAcademiqueController {

    private final SemaineAcademiqueService semaineService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SemaineAcademiqueDto create(@RequestBody CreateSemaineAcademiqueDto dto) {
        return semaineService.create(dto);
    }

    @GetMapping("/{id}")
    public SemaineAcademiqueDto getById(@PathVariable Integer id) {
        return semaineService.getById(id);
    }

    @GetMapping
    public List<SemaineAcademiqueDto> list(@RequestParam(required = false) Integer semestreId) {
        return semaineService.list(semestreId);
    }

    @PutMapping("/{id}")
    public SemaineAcademiqueDto update(@PathVariable Integer id, @RequestBody CreateSemaineAcademiqueDto dto) {
        return semaineService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        semaineService.delete(id);
    }
}
