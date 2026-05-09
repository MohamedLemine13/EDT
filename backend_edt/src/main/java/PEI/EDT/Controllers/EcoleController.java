package PEI.EDT.Controllers;

import PEI.EDT.Dtos.CreateEcoleDto;
import PEI.EDT.Dtos.EcoleDto;
import PEI.EDT.Services.EcoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ecoles")
@RequiredArgsConstructor
public class EcoleController {

    private final EcoleService ecoleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EcoleDto create(@RequestBody CreateEcoleDto dto) {
        return ecoleService.create(dto);
    }

    @GetMapping("/{id}")
    public EcoleDto getById(@PathVariable String id) {
        return ecoleService.getById(id);
    }

    @GetMapping
    public List<EcoleDto> list() {
        return ecoleService.list();
    }

    @PutMapping("/{id}")
    public EcoleDto update(@PathVariable String id, @RequestBody CreateEcoleDto dto) {
        return ecoleService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        ecoleService.delete(id);
    }
}
