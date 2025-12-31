package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateDepartementDto;
import PEI.EDT.Dtos.DepartementDto;
import PEI.EDT.Services.DepartementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departements")
@RequiredArgsConstructor
public class DepartementController {

    private final DepartementService departementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DepartementDto create(@RequestBody CreateDepartementDto dto) {
        return departementService.create(dto);
    }

    @GetMapping("/{id}")
    public DepartementDto getById(@PathVariable Integer id) {
        return departementService.getById(id);
    }

    @GetMapping
    public List<DepartementDto> list(@RequestParam(required = false) String ecoleId) {
        if (ecoleId != null && !ecoleId.isBlank()) {
            return departementService.listByEcole(ecoleId);
        }
        return departementService.list();
    }

    @PutMapping("/{id}")
    public DepartementDto update(@PathVariable Integer id, @RequestBody CreateDepartementDto dto) {
        return departementService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        departementService.delete(id);
    }
}
