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

    /**
     * Create a salle.
     *
     * Examples:
     * - AMPHI (school-level / common):
     *   POST /api/salles
     *   { "nom":"AMPHI ESP", "typeSalle":"AMPHI", "ecoleId":"ESP" }
     *
     * - Normal room (department-level):
     *   POST /api/salles
     *   { "nom":"Salle 104", "typeSalle":"SALLE", "departementId":1 }
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SalleDto create(@RequestBody CreateSalleDto dto) {
        return salleService.create(dto);
    }

    /**
     * List salles with optional filters:
     * - GET /api/salles                      -> all salles
     * - GET /api/salles?departementId=1      -> salles of one department
     * - GET /api/salles?ecoleId=ESP          -> salles of one school (includes AMPHI)
     *
     * Priority (if both provided): departementId wins.
     */
    @GetMapping
    public List<SalleDto> list(
            @RequestParam(required = false) Integer departementId,
            @RequestParam(required = false) String ecoleId
    ) {
        return salleService.list(departementId, ecoleId);
    }

    @GetMapping("/{id}")
    public SalleDto getById(@PathVariable Integer id) {
        return salleService.getById(id);
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
