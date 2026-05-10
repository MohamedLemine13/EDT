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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AffectationEnseignementService {

    private final AffectationEnseignementRepository affectationRepo;
    private final SemestreRepository semestreRepo;
    private final DepartementRepository departementRepo;
    private final MatiereRepository matiereRepo;
    private final ProfesseurRepository professeurRepo;
    private final SalleRepository salleRepo;

    public AffectationEnseignementDto upsert(CreateAffectationEnseignementDto dto) {

        if (dto.getSemestreId() == null
                || dto.getMatiereCode() == null
                || dto.getType() == null) {
            throw new BadRequestException("semestreId, matiereCode, and type are required.");
        }

        TypeSeance type = parseTypeSeance(dto.getType());

        Semestre semestre = semestreRepo.findById(dto.getSemestreId())
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + dto.getSemestreId()));

        Matiere matiere = matiereRepo.findById(dto.getMatiereCode())
                .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + dto.getMatiereCode()));

        // ✅ Resolve multiple professeurs
        Set<Professeur> professeurs = new HashSet<>();
        if (dto.getProfesseurIds() != null && !dto.getProfesseurIds().isEmpty()) {
            List<Professeur> profList = professeurRepo.findAllById(dto.getProfesseurIds());
            if (profList.size() != dto.getProfesseurIds().size()) {
                throw new BadRequestException("One or more professeurs not found.");
            }
            professeurs = new HashSet<>(profList);
        }

        // ✅ Resolve multiple salles
        Set<Salle> salles = new HashSet<>();
        if (dto.getSalleIds() != null && !dto.getSalleIds().isEmpty()) {
            List<Salle> salleList = salleRepo.findAllById(dto.getSalleIds());
            if (salleList.size() != dto.getSalleIds().size()) {
                throw new BadRequestException("One or more salles not found.");
            }
            salles = new HashSet<>(salleList);
        }

        // Resolve departments
        Set<Departement> departements = new HashSet<>();
        if (dto.getDepartementIds() != null && !dto.getDepartementIds().isEmpty()) {
            List<Departement> deptList = departementRepo.findAllById(dto.getDepartementIds());
            if (deptList.size() != dto.getDepartementIds().size()) {
                throw new BadRequestException("One or more departements not found.");
            }
            departements = new HashSet<>(deptList);
        }

        // Upsert: find by semestre, matiere, type
        AffectationEnseignement affectation = affectationRepo
                .findBySemestre_IdAndMatiere_CodeAndType(semestre.getId(), matiere.getCode(), type)
                .stream()
                .findFirst()
                .orElseGet(AffectationEnseignement::new);

        affectation.setSemestre(semestre);
        affectation.setDepartements(departements);
        affectation.setMatiere(matiere);
        affectation.setType(type);
        affectation.setProfesseurs(professeurs);
        affectation.setSalles(salles);

        AffectationEnseignement saved = affectationRepo.save(affectation);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AffectationEnseignementDto> listBySemestreAndDepartement(Integer semestreId, Integer departementId) {
        if (semestreId == null) {
            throw new BadRequestException("semestreId is required.");
        }
        if (departementId == null) {
            return affectationRepo.findBySemestre_Id(semestreId)
                    .stream()
                    .map(this::toDto)
                    .toList();
        }
        // ✅ Merge department-specific affectations WITH common ones (empty departements)
        List<AffectationEnseignement> deptSpecific = affectationRepo.findBySemestre_IdAndDepartements_Id(semestreId, departementId);
        List<AffectationEnseignement> common = affectationRepo.findCommonBySemestreId(semestreId);

        // Combine and deduplicate by ID
        Map<Integer, AffectationEnseignement> merged = new LinkedHashMap<>();
        for (AffectationEnseignement a : deptSpecific) merged.put(a.getId(), a);
        for (AffectationEnseignement a : common) merged.put(a.getId(), a);

        return merged.values().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AffectationEnseignementDto> listByProfesseurAndSemestre(Integer professeurId, Integer semestreId) {
        return affectationRepo.findByProfesseurs_IdAndSemestre_Id(professeurId, semestreId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AffectationEnseignementDto> listByProfesseur(Integer professeurId) {
        return affectationRepo.findByProfesseurs_Id(professeurId)
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

                .departementIds(a.getDepartements() == null ? new ArrayList<>() : a.getDepartements().stream().map(Departement::getId).toList())
                .departementCodes(a.getDepartements() == null ? new ArrayList<>() : a.getDepartements().stream().map(Departement::getCode).toList())

                .matiereCode(a.getMatiere().getCode())
                .type(a.getType().name())

                // ✅ Multiple professors
                .professeurIds(a.getProfesseurs() == null ? new ArrayList<>() : a.getProfesseurs().stream().map(Professeur::getId).toList())
                .professeurNoms(a.getProfesseurs() == null ? new ArrayList<>() : a.getProfesseurs().stream()
                        .map(p -> p.getPrenom() + " " + p.getNom())
                        .toList())

                // ✅ Multiple salles
                .salleIds(a.getSalles() == null ? new ArrayList<>() : a.getSalles().stream().map(Salle::getId).toList())
                .salleNoms(a.getSalles() == null ? new ArrayList<>() : a.getSalles().stream().map(Salle::getNom).toList())

                .build();
    }

    // ✅ Professeur queries now use the ManyToMany join table
    // The repository methods findByProfesseur_IdAndSemestre_Id and findByProfesseur_Id
    // need to be updated to use the new relationship name "professeurs"

    private TypeSeance parseTypeSeance(String s) {
        try {
            return TypeSeance.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid type: " + s);
        }
    }
}
