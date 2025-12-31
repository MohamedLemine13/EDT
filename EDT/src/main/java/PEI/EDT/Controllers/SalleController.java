package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateSalleDto;
import PEI.EDT.Dtos.SalleDto;
import PEI.EDT.Services.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salles")
@RequiredArgsConstructor
public class SalleController {

    private final SalleService salleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SalleDto create(@RequestBody CreateSalleDto dto) {
        return salleService.create(dto);
    }

    @GetMapping("/{id}")
    public SalleDto getById(@PathVariable Integer id) {
        return salleService.getById(id);
    }

    /**
     * Optional filter: GET /api/salles?departementId=1
     */
    @GetMapping
    public List<SalleDto> list(@RequestParam(required = false) Integer departementId) {
        return salleService.list(departementId);
    }

    @PutMapping("/{id}")
    public SalleDto update(@PathVariable Integer id, @RequestBody CreateSalleDto dto) {
        return salleService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        salleService.delete(id);
    }
}
