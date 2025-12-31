package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateMatiereDto;
import PEI.EDT.Dtos.MatiereDto;
import PEI.EDT.Entities.Matiere;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.MatiereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MatiereService {

    private final MatiereRepository matiereRepo;

    public MatiereDto create(CreateMatiereDto dto) {
        if (dto.getCode() == null || dto.getCode().isBlank()) throw new BadRequestException("code is required.");
        if (dto.getIntitule() == null || dto.getIntitule().isBlank()) throw new BadRequestException("intitule is required.");

        String code = dto.getCode().trim().toUpperCase();
        if (matiereRepo.existsById(code)) throw new BadRequestException("Matiere already exists: " + code);

        Matiere m = Matiere.builder()
                .code(code)
                .intitule(dto.getIntitule())
                .build();

        return toDto(matiereRepo.save(m));
    }

    @Transactional(readOnly = true)
    public MatiereDto getById(String code) {
        Matiere m = matiereRepo.findById(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + code));
        return toDto(m);
    }

    @Transactional(readOnly = true)
    public List<MatiereDto> list() {
        return matiereRepo.findAll().stream().map(this::toDto).toList();
    }

    public MatiereDto update(String code, CreateMatiereDto dto) {
        Matiere m = matiereRepo.findById(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + code));

        if (dto.getIntitule() != null) m.setIntitule(dto.getIntitule());
        return toDto(matiereRepo.save(m));
    }

    public void delete(String code) {
        String c = code.trim().toUpperCase();
        if (!matiereRepo.existsById(c)) throw new ResourceNotFoundException("Matiere not found: " + code);
        matiereRepo.deleteById(c);
    }

    private MatiereDto toDto(Matiere m) {
        return MatiereDto.builder()
                .code(m.getCode())
                .intitule(m.getIntitule())
                .build();
    }
}
