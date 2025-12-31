package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateEcoleDto;
import PEI.EDT.Dtos.EcoleDto;
import PEI.EDT.Entities.Ecole;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.EcoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EcoleService {

    private final EcoleRepository ecoleRepo;

    public EcoleDto create(CreateEcoleDto dto) {
        if (dto.getId() == null || dto.getId().isBlank()) {
            throw new BadRequestException("Ecole.id is required (string).");
        }
        if (dto.getNom() == null || dto.getNom().isBlank()) {
            throw new BadRequestException("Ecole.nom is required.");
        }
        if (dto.getSlug() == null || dto.getSlug().isBlank()) {
            throw new BadRequestException("Ecole.slug is required.");
        }
        if (ecoleRepo.existsById(dto.getId())) {
            throw new BadRequestException("Ecole already exists with id=" + dto.getId());
        }

        Ecole e = Ecole.builder()
                .id(dto.getId())
                .nom(dto.getNom())
                .domaine(dto.getDomaine())
                .slug(dto.getSlug())
                .build();

        return toDto(ecoleRepo.save(e));
    }

    @Transactional(readOnly = true)
    public EcoleDto getById(String id) {
        Ecole e = ecoleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ecole not found: " + id));
        return toDto(e);
    }

    @Transactional(readOnly = true)
    public List<EcoleDto> list() {
        return ecoleRepo.findAll().stream().map(this::toDto).toList();
    }

    public EcoleDto update(String id, CreateEcoleDto dto) {
        Ecole e = ecoleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ecole not found: " + id));

        if (dto.getNom() != null) e.setNom(dto.getNom());
        if (dto.getDomaine() != null) e.setDomaine(dto.getDomaine());
        if (dto.getSlug() != null) e.setSlug(dto.getSlug());

        return toDto(ecoleRepo.save(e));
    }

    public void delete(String id) {
        if (!ecoleRepo.existsById(id)) {
            throw new ResourceNotFoundException("Ecole not found: " + id);
        }
        ecoleRepo.deleteById(id);
    }

    private EcoleDto toDto(Ecole e) {
        return EcoleDto.builder()
                .id(e.getId())
                .nom(e.getNom())
                .domaine(e.getDomaine())
                .slug(e.getSlug())
                .build();
    }
}
