package PEI.EDT.Controllers;

import PEI.EDT.Dtos.AffectationEnseignementDto;
import PEI.EDT.Dtos.CreateAffectationEnseignementDto;
import PEI.EDT.Services.AffectationEnseignementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@RequiredArgsConstructor
public class AffectationEnseignementController {

    private final AffectationEnseignementService affectationService;

    /**
     * Create OR update (upsert) an affectation:
     * (semestre, departement, matiere, type) -> professeur
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AffectationEnseignementDto upsert(@RequestBody CreateAffectationEnseignementDto dto) {
        return affectationService.upsert(dto);
    }

    /**
     * List affectations of a given departement for a given semestre.
     * Example: GET /api/affectations?semestreId=1&departementId=2
     */
    @GetMapping
    public List<AffectationEnseignementDto> list(
            @RequestParam Integer semestreId,
            @RequestParam Integer departementId
    ) {
        return affectationService.listBySemestreAndDepartement(semestreId, departementId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        affectationService.delete(id);
    }
}
