package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateProfesseurDto;
import PEI.EDT.Dtos.ProfesseurDto;
import PEI.EDT.Entities.Professeur;
import PEI.EDT.Entities.Enums.StatutProfesseur; // make sure your enum name matches
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.ProfesseurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfesseurService {

    private final ProfesseurRepository professeurRepo;

    public ProfesseurDto create(CreateProfesseurDto dto) {
        if (dto.getNom() == null || dto.getNom().isBlank()) throw new BadRequestException("nom is required.");
        if (dto.getPrenom() == null || dto.getPrenom().isBlank()) throw new BadRequestException("prenom is required.");
        if (dto.getStatut() == null || dto.getStatut().isBlank()) throw new BadRequestException("statut is required.");

        StatutProfesseur statut = parseStatut(dto.getStatut());

        Professeur p = Professeur.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .statut(statut)
                .build();

        return toDto(professeurRepo.save(p));
    }

    @Transactional(readOnly = true)
    public ProfesseurDto getById(Integer id) {
        Professeur p = professeurRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professeur not found: " + id));
        return toDto(p);
    }

    @Transactional(readOnly = true)
    public List<ProfesseurDto> list() {
        return professeurRepo.findAll().stream().map(this::toDto).toList();
    }

    public ProfesseurDto update(Integer id, CreateProfesseurDto dto) {
        Professeur p = professeurRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professeur not found: " + id));

        if (dto.getNom() != null) p.setNom(dto.getNom());
        if (dto.getPrenom() != null) p.setPrenom(dto.getPrenom());
        if (dto.getStatut() != null) p.setStatut(parseStatut(dto.getStatut()));

        return toDto(professeurRepo.save(p));
    }

    public void delete(Integer id) {
        if (!professeurRepo.existsById(id)) throw new ResourceNotFoundException("Professeur not found: " + id);
        professeurRepo.deleteById(id);
    }

    private ProfesseurDto toDto(Professeur p) {
        return ProfesseurDto.builder()
                .id(p.getId())
                .nom(p.getNom())
                .prenom(p.getPrenom())
                .statut(p.getStatut().name())
                .build();
    }

    private StatutProfesseur parseStatut(String s) {
        try {
            return StatutProfesseur.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid statut (expected PERMANENT|VACATAIRE): " + s);
        }
    }
}
