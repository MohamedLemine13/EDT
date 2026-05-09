package PEI.EDT.Services;

import PEI.EDT.Dtos.CreateSemestreDto;
import PEI.EDT.Dtos.SemestreDto;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SemestreService {

    private final SemestreRepository semestreRepo;

    public SemestreDto create(CreateSemestreDto dto) {
        if (dto.getLibelle() == null || dto.getLibelle().isBlank()) {
            throw new BadRequestException("Semestre.libelle is required (ex: S1, S2...).");
        }
        if (dto.getDateDebut() == null || dto.getDateFin() == null) {
            throw new BadRequestException("Semestre.dateDebut and dateFin are required.");
        }
        if (dto.getDateFin().isBefore(dto.getDateDebut())) {
            throw new BadRequestException("Semestre.dateFin must be after dateDebut.");
        }

        Semestre s = Semestre.builder()
                .libelle(dto.getLibelle().trim().toUpperCase())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .build();

        return toDto(semestreRepo.save(s));
    }

    @Transactional(readOnly = true)
    public SemestreDto getById(Integer id) {
        Semestre s = semestreRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + id));
        return toDto(s);
    }

    @Transactional(readOnly = true)
    public List<SemestreDto> list() {
        return semestreRepo.findAll().stream().map(this::toDto).toList();
    }

    public SemestreDto update(Integer id, CreateSemestreDto dto) {
        Semestre s = semestreRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + id));

        if (dto.getLibelle() != null) s.setLibelle(dto.getLibelle().trim().toUpperCase());
        if (dto.getDateDebut() != null) s.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) s.setDateFin(dto.getDateFin());

        if (s.getDateDebut() == null || s.getDateFin() == null) {
            throw new BadRequestException("Semestre.dateDebut and dateFin cannot be null.");
        }
        if (s.getDateFin().isBefore(s.getDateDebut())) {
            throw new BadRequestException("Semestre.dateFin must be after dateDebut.");
        }

        return toDto(semestreRepo.save(s));
    }

    public void delete(Integer id) {
        if (!semestreRepo.existsById(id)) {
            throw new ResourceNotFoundException("Semestre not found: " + id);
        }
        semestreRepo.deleteById(id);
    }

    private SemestreDto toDto(Semestre s) {
        return SemestreDto.builder()
                .id(s.getId())
                .libelle(s.getLibelle())
                .dateDebut(s.getDateDebut())
                .dateFin(s.getDateFin())
                .build();
    }
}
