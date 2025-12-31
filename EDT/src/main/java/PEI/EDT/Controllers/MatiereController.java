package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateMatiereDto;
import PEI.EDT.Dtos.MatiereDto;
import PEI.EDT.Services.MatiereService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matieres")
@RequiredArgsConstructor
public class MatiereController {

    private final MatiereService matiereService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatiereDto create(@RequestBody CreateMatiereDto dto) {
        return matiereService.create(dto);
    }

    @GetMapping("/{code}")
    public MatiereDto getById(@PathVariable String code) {
        return matiereService.getById(code);
    }

    @GetMapping
    public List<MatiereDto> list() {
        return matiereService.list();
    }

    @PutMapping("/{code}")
    public MatiereDto update(@PathVariable String code, @RequestBody CreateMatiereDto dto) {
        return matiereService.update(code, dto);
    }

    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String code) {
        matiereService.delete(code);
    }
}
