package PEI.EDT.Services;

import PEI.EDT.Dtos.AffectationEnseignementDto;
import PEI.EDT.Dtos.CreateAffectationEnseignementDto;
import PEI.EDT.Entities.AffectationEnseignement;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.Matiere;
import PEI.EDT.Entities.Professeur;
import PEI.EDT.Entities.Salle;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Entities.Enums.TypeSeance;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.AffectationEnseignementRepository;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.MatiereRepository;
import PEI.EDT.Repositories.ProfesseurRepository;
import PEI.EDT.Repositories.SalleRepository;
import PEI.EDT.Repositories.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AffectationEnseignementService {

    private final AffectationEnseignementRepository affectationRepo;
    private final SemestreRepository semestreRepo;
    private final DepartementRepository departementRepo;
    private final MatiereRepository matiereRepo;
    private final ProfesseurRepository professeurRepo;
    private final SalleRepository salleRepo; // ✅ NEW

    public AffectationEnseignementDto upsert(CreateAffectationEnseignementDto dto) {

        if (dto.getSemestreId() == null
                || dto.getDepartementId() == null
                || dto.getMatiereCode() == null
                || dto.getType() == null
                || dto.getProfesseurId() == null
                || dto.getSalleId() == null) {
            throw new BadRequestException("semestreId, departementId, matiereCode, type, professeurId, salleId are required.");
        }

        TypeSeance type = parseTypeSeance(dto.getType());

        Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));

        Departement departement = departementRepo.findById(dto.getDepartementId())
                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + dto.getDepartementId()));

        Matiere matiere = matiereRepo.findById(dto.getMatiereCode())
                .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + dto.getMatiereCode()));

        Professeur professeur = professeurRepo.findById(dto.getProfesseurId())
                .orElseThrow(() -> new ResourceNotFoundException("Professeur not found: " + dto.getProfesseurId()));

        Salle salle = salleRepo.findById(dto.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + dto.getSalleId()));

        // ✅ Recommended consistency: salle must belong to the same department
        if (salle.getDepartement() == null || salle.getDepartement().getId() == null) {
            throw new BadRequestException("Salle must be attached to a Departement.");
        }
        if (!salle.getDepartement().getId().equals(departement.getId())) {
            throw new BadRequestException("Salle must belong to the same Departement as the affectation.");
        }

        AffectationEnseignement affectation = affectationRepo
                .findBySemestre_IdAndDepartement_IdAndMatiere_CodeAndType(
                        semestre.getId(), departement.getId(), matiere.getCode(), type
                )
                .orElseGet(AffectationEnseignement::new);

        affectation.setSemestre(semestre);
        affectation.setDepartement(departement);
        affectation.setMatiere(matiere);
        affectation.setType(type);
        affectation.setProfesseur(professeur);
        affectation.setSalle(salle); // ✅ NEW

        AffectationEnseignement saved = affectationRepo.save(affectation);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AffectationEnseignementDto> listBySemestreAndDepartement(Integer semestreId, Integer departementId) {
        if (semestreId == null || departementId == null) {
            throw new BadRequestException("semestreId and departementId are required.");
        }
        return affectationRepo.findBySemestre_IdAndDepartement_Id(semestreId, departementId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public void delete(Integer id) {
        if (!affectationRepo.existsById(id)) {
            throw new ResourceNotFoundException("Affectation not found: " + id);
        }
        affectationRepo.deleteById(id);
    }

    private AffectationEnseignementDto toDto(AffectationEnseignement a) {
        return AffectationEnseignementDto.builder()
                .id(a.getId())

                .semestreId(a.getSemestre().getId())
                .semestreLibelle(a.getSemestre().getLibelle())

                .departementId(a.getDepartement().getId())
                .departementCode(a.getDepartement().getCode())

                .matiereCode(a.getMatiere().getCode())
                .type(a.getType().name())

                .professeurId(a.getProfesseur().getId())
                .professeurNom(a.getProfesseur().getNom())
                .professeurPrenom(a.getProfesseur().getPrenom())
                .professeurStatut(a.getProfesseur().getStatut().name())

                // ✅ NEW: salle info
                .salleId(a.getSalle().getId())
                .salleNom(a.getSalle().getNom())
                .typeSalle(a.getSalle().getTypeSalle().name())
                .build();
    }

    private TypeSeance parseTypeSeance(String s) {
        try {
            return TypeSeance.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid type (expected CM|TD|TP): " + s);
        }
    }
}
