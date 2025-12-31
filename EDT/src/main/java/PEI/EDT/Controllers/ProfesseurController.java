package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateProfesseurDto;
import PEI.EDT.Dtos.ProfesseurDto;
import PEI.EDT.Services.ProfesseurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professeurs")
@RequiredArgsConstructor
public class ProfesseurController {

    private final ProfesseurService professeurService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProfesseurDto create(@RequestBody CreateProfesseurDto dto) {
        return professeurService.create(dto);
    }

    @GetMapping("/{id}")
    public ProfesseurDto getById(@PathVariable Integer id) {
        return professeurService.getById(id);
    }

    @GetMapping
    public List<ProfesseurDto> list() {
        return professeurService.list();
    }

    @PutMapping("/{id}")
    public ProfesseurDto update(@PathVariable Integer id, @RequestBody CreateProfesseurDto dto) {
        return professeurService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        professeurService.delete(id);
    }
}
