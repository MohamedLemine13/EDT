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
import PEI.EDT.Entities.Ecole;
import PEI.EDT.Repositories.EcoleRepository;


import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SalleService {

    private final SalleRepository salleRepo;
    private final DepartementRepository departementRepo;
    private final EcoleRepository ecoleRepo; // ✅ NEW

    public SalleDto create(CreateSalleDto dto) {
        if (dto.getNom() == null || dto.getNom().isBlank()) throw new BadRequestException("nom is required.");
        if (dto.getTypeSalle() == null || dto.getTypeSalle().isBlank()) throw new BadRequestException("typeSalle is required.");

        TypeSalle typeSalle = parseTypeSalle(dto.getTypeSalle());

        // ✅ If departementId provided, derive ecole from departement
        Departement departement = null;
        Ecole ecole = null;

        if (dto.getDepartementId() != null) {
            departement = departementRepo.findById(dto.getDepartementId())
                    .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + dto.getDepartementId()));
            ecole = departement.getEcole();
        }

        // ✅ If no departementId, ecoleId becomes mandatory (needed for AMPHI)
        if (ecole == null) {
            if (dto.getEcoleId() == null || dto.getEcoleId().isBlank()) {
                throw new BadRequestException("ecoleId is required when departementId is null (e.g., AMPHI).");
            }
            ecole = ecoleRepo.findById(dto.getEcoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ecole not found: " + dto.getEcoleId()));
        }

        // ✅ Rule: AMPHI must NOT have departement
        if (typeSalle == TypeSalle.AMPHI) {
            if (dto.getDepartementId() != null) {
                throw new BadRequestException("For AMPHI, departementId must be null (AMPHI is common / school-level).");
            }
        } else {
            // SALLE/LABO must have departement
            if (departement == null) {
                throw new BadRequestException("For SALLE/LABO, departementId is required.");
            }
        }

        // ✅ If both provided, verify consistency
        if (dto.getEcoleId() != null && !dto.getEcoleId().isBlank()) {
            if (!ecole.getId().equals(dto.getEcoleId())) {
                throw new BadRequestException("ecoleId does not match departement.ecoleId.");
            }
        }

        Salle s = Salle.builder()
                .nom(dto.getNom())
                .typeSalle(typeSalle)
                .ecole(ecole)
                .departement(departement) // null for AMPHI
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
    public List<SalleDto> list(Integer departementId, String ecoleId) {
        if (departementId != null) {
            return salleRepo.findByDepartement_Id(departementId).stream().map(this::toDto).toList();
        }
        if (ecoleId != null && !ecoleId.isBlank()) {
            return salleRepo.findByEcole_Id(ecoleId).stream().map(this::toDto).toList();
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
                .ecoleId(s.getEcole() == null ? null : s.getEcole().getId())
                .departementId(s.getDepartement() == null ? null : s.getDepartement().getId())
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
