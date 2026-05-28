package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateDepartementDto;
import PEI.EDT.Dtos.DepartementDto;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.Ecole;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.EcoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartementService {

    private final DepartementRepository departementRepo;
    private final EcoleRepository ecoleRepo;

    public DepartementDto create(CreateDepartementDto dto) {
        if (dto.getCode() == null || dto.getCode().isBlank()) {
            throw new BadRequestException("Departement.code is required.");
        }
        if (dto.getNom() == null || dto.getNom().isBlank()) {
            throw new BadRequestException("Departement.nom is required.");
        }
        if (dto.getEcoleId() == null || dto.getEcoleId().isBlank()) {
            throw new BadRequestException("Departement.ecoleId is required.");
        }

        Ecole ecole = ecoleRepo.findById(dto.getEcoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Ecole not found: " + dto.getEcoleId()));

        Departement dep = Departement.builder()
                .code(dto.getCode())
                .nom(dto.getNom())
                .ecole(ecole)
                .build();

        return toDto(departementRepo.save(dep));
    }

    @Transactional(readOnly = true)
    public DepartementDto getById(Integer id) {
        Departement d = departementRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + id));
        return toDto(d);
    }

    @Transactional(readOnly = true)
    public List<DepartementDto> list() {
        return departementRepo.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<DepartementDto> listByEcole(String ecoleId) {
        return departementRepo.findByEcole_Id(ecoleId).stream().map(this::toDto).toList();
    }

    public DepartementDto update(Integer id, CreateDepartementDto dto) {
        Departement d = departementRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + id));

        if (dto.getCode() != null) d.setCode(dto.getCode());
        if (dto.getNom() != null) d.setNom(dto.getNom());

        if (dto.getEcoleId() != null) {
            Ecole ecole = ecoleRepo.findById(dto.getEcoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ecole not found: " + dto.getEcoleId()));
            d.setEcole(ecole);
        }

        return toDto(departementRepo.save(d));
    }

    public void delete(Integer id) {
        if (!departementRepo.existsById(id)) {
            throw new ResourceNotFoundException("Departement not found: " + id);
        }
        departementRepo.deleteById(id);
    }

    private DepartementDto toDto(Departement d) {
        return DepartementDto.builder()
                .id(d.getId())
                .code(d.getCode())
                .nom(d.getNom())
                .ecoleId(d.getEcole().getId())
                .build();
    }
}
