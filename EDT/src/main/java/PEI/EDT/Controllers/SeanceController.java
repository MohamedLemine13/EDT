package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateSeanceRequestDto;
import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Dtos.UpdateSeanceRequestDto;
import PEI.EDT.Services.SeanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seances")
@RequiredArgsConstructor
public class SeanceController {

    private final SeanceService seanceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeanceDto create(@RequestBody CreateSeanceRequestDto dto) {
        return seanceService.create(dto);
    }

    @GetMapping("/{id}")
    public SeanceDto getById(@PathVariable Integer id) {
        return seanceService.getById(id);
    }

    @PutMapping("/{id}")
    public SeanceDto update(@PathVariable Integer id, @RequestBody UpdateSeanceRequestDto dto) {
        return seanceService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        seanceService.delete(id);
    }
}
