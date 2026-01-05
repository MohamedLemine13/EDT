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

    private void requirePositive(Integer value, String field) {
        if (value == null) {
            throw new BadRequestException(field + " is required.");
        }
        if (value < 0) {
            throw new BadRequestException(field + " must be >= 0.");
        }
    }


    public MatiereDto create(CreateMatiereDto dto) {

        if (dto.getCode() == null || dto.getCode().isBlank())
            throw new BadRequestException("code is required.");

        if (dto.getIntitule() == null || dto.getIntitule().isBlank())
            throw new BadRequestException("intitule is required.");

        // REQUIRED numeric fields
        requirePositive(dto.getCredits(), "credits");
        requirePositive(dto.getHCm(), "hCm");
        requirePositive(dto.getHTd(), "hTd");
        requirePositive(dto.getHTp(), "hTp");

        String code = dto.getCode().trim().toUpperCase();
        if (matiereRepo.existsById(code))
            throw new BadRequestException("Matiere already exists: " + code);

        Matiere matiere = Matiere.builder()
                .code(code)
                .intitule(dto.getIntitule().trim())
                .credits(dto.getCredits())
                .hCm(dto.getHCm())
                .hTd(dto.getHTd())
                .hTp(dto.getHTp())
                .build();

        return toDto(matiereRepo.save(matiere));
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

        Matiere m = matiereRepo.findById(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Matiere not found: " + code));

        if (dto.getIntitule() != null)
            m.setIntitule(dto.getIntitule().trim());

        if (dto.getCredits() != null) {
            requirePositive(dto.getCredits(), "credits");
            m.setCredits(dto.getCredits());
        }

        if (dto.getHCm() != null) {
            requirePositive(dto.getHCm(), "hCm");
            m.setHCm(dto.getHCm());
        }

        if (dto.getHTd() != null) {
            requirePositive(dto.getHTd(), "hTd");
            m.setHTd(dto.getHTd());
        }

        if (dto.getHTp() != null) {
            requirePositive(dto.getHTp(), "hTp");
            m.setHTp(dto.getHTp());
        }

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
                .credits(m.getCredits())
                .hCm(m.getHCm())
                .hTd(m.getHTd())
                .hTp(m.getHTp())
                .build();
    }

}
