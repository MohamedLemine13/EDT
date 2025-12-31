package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateSalleDto;
import PEI.EDT.Dtos.SalleDto;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.Salle;
import PEI.EDT.Entities.Enums.TypeSalle;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.SalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SalleService {

    private final SalleRepository salleRepo;
    private final DepartementRepository departementRepo;

    public SalleDto create(CreateSalleDto dto) {
        if (dto.getNom() == null || dto.getNom().isBlank()) throw new BadRequestException("nom is required.");
        if (dto.getTypeSalle() == null || dto.getTypeSalle().isBlank()) throw new BadRequestException("typeSalle is required.");
        if (dto.getDepartementId() == null) throw new BadRequestException("departementId is required.");

        Departement departement = departementRepo.findById(dto.getDepartementId())
                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + dto.getDepartementId()));

        TypeSalle typeSalle = parseTypeSalle(dto.getTypeSalle());

        Salle s = Salle.builder()
                .nom(dto.getNom())
                .typeSalle(typeSalle)
                .departement(departement)
                .build();

        return toDto(salleRepo.save(s));
    }

    @Transactional(readOnly = true)
    public SalleDto getById(Integer id) {
        Salle s = salleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + id));
        return toDto(s);
    }

    @Transactional(readOnly = true)
    public List<SalleDto> list(Integer departementId) {
        if (departementId != null) {
            return salleRepo.findByDepartement_Id(departementId).stream().map(this::toDto).toList();
        }
        return salleRepo.findAll().stream().map(this::toDto).toList();
    }

    public SalleDto update(Integer id, CreateSalleDto dto) {
        Salle s = salleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle not found: " + id));

        if (dto.getNom() != null) s.setNom(dto.getNom());
        if (dto.getTypeSalle() != null) s.setTypeSalle(parseTypeSalle(dto.getTypeSalle()));

        if (dto.getDepartementId() != null) {
            Departement departement = departementRepo.findById(dto.getDepartementId())
                    .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + dto.getDepartementId()));
            s.setDepartement(departement);
        }

        return toDto(salleRepo.save(s));
    }

    public void delete(Integer id) {
        if (!salleRepo.existsById(id)) throw new ResourceNotFoundException("Salle not found: " + id);
        salleRepo.deleteById(id);
    }

    private SalleDto toDto(Salle s) {
        return SalleDto.builder()
                .id(s.getId())
                .nom(s.getNom())
                .typeSalle(s.getTypeSalle().name())
                .departementId(s.getDepartement().getId())
                .build();
    }

    private TypeSalle parseTypeSalle(String s) {
        try {
            return TypeSalle.valueOf(s.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid typeSalle (expected AMPHI|SALLE|LABO): " + s);
        }
    }
}
