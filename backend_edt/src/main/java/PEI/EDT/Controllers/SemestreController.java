package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateSemestreDto;
import PEI.EDT.Dtos.SemestreDto;
import PEI.EDT.Services.SemestreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semestres")
@RequiredArgsConstructor
public class SemestreController {

    private final SemestreService semestreService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SemestreDto create(@RequestBody CreateSemestreDto dto) {
        return semestreService.create(dto);
    }

    @GetMapping("/{id}")
    public SemestreDto getById(@PathVariable Integer id) {
        return semestreService.getById(id);
    }

    @GetMapping
    public List<SemestreDto> list() {
        return semestreService.list();
    }

    @PutMapping("/{id}")
    public SemestreDto update(@PathVariable Integer id, @RequestBody CreateSemestreDto dto) {
        return semestreService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        semestreService.delete(id);
    }
}
