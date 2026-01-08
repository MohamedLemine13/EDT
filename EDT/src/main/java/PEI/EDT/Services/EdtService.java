package PEI.EDT.Services;

import PEI.EDT.Dtos.EdtJourDto;
import PEI.EDT.Dtos.EdtSemaineDto;
import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Entities.Departement;
import PEI.EDT.Entities.SemaineAcademique;
import PEI.EDT.Entities.Semestre;
import PEI.EDT.Entities.Seance;
import PEI.EDT.Exceptions.BadRequestException;
import PEI.EDT.Exceptions.ResourceNotFoundException;
import PEI.EDT.Repositories.DepartementRepository;
import PEI.EDT.Repositories.SemaineAcademiqueRepository;
import PEI.EDT.Repositories.SeanceRepository;
import PEI.EDT.Repositories.SemestreRepository;
import PEI.EDT.Security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import PEI.EDT.Entities.Utilisateur;
import PEI.EDT.Entities.Enums.RoleUtilisateur;
import PEI.EDT.Exceptions.ForbiddenException;


import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EdtService {

    private final SeanceRepository seanceRepo;
    private final SemaineAcademiqueRepository semaineRepo;
    private final SemestreRepository semestreRepo;
    private final DepartementRepository departementRepo;
    private final CurrentUserService currentUserService;


    public EdtSemaineDto getEdt(Integer departementId, Integer semestreId, Integer numeroSemaine) {
        if (departementId == null || semestreId == null || numeroSemaine == null) {
            throw new BadRequestException("departementId, semestreId, numeroSemaine are required.");
        }
        Utilisateur current = currentUserService.getCurrentUser();


        if (current.getRole() == RoleUtilisateur.ETUDIANT) {
            if (current.getDepartement() == null) {
                throw new ForbiddenException("ETUDIANT must be linked to a departement.");
            }
            if (!current.getDepartement().getId().equals(departementId)) {
                throw new ForbiddenException("ETUDIANT can view only the EDT of his departement.");
            }
        }

        Semestre semestre = semestreRepo.findById(semestreId)
                .orElseThrow(() -> new ResourceNotFoundException("Semestre not found: " + semestreId));

        Departement departement = departementRepo.findById(departementId)
                .orElseThrow(() -> new ResourceNotFoundException("Departement not found: " + departementId));

        SemaineAcademique semaine = semaineRepo.findBySemestre_IdAndNumeroSemaine(semestreId, numeroSemaine)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Semaine not found for semestreId=" + semestreId + " and numeroSemaine=" + numeroSemaine
                ));

        List<Seance> seances = seanceRepo.findEdtByDepartementSemestreSemaineWithFetch(
                departementId, semestreId, semaine.getId()
        );

        // Group by day
        Map<String, EdtJourDto> byDay = new HashMap<>();
        for (Seance s : seances) {
            SeanceDto sd = DtoMapper.toSeanceDto(s);
            byDay.computeIfAbsent(sd.getJour(), j -> EdtJourDto.builder().jour(j).seances(new ArrayList<>()).build())
                    .getSeances()
                    .add(sd);
        }

        // Sort sessions by start time per day
        for (EdtJourDto dayDto : byDay.values()) {
            dayDto.getSeances().sort(Comparator.comparing(SeanceDto::getHeureDebut));
        }

        // Sort days in a fixed order
        List<String> dayOrder = List.of("LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI");
        List<EdtJourDto> jours = new ArrayList<>(byDay.values());
        jours.sort(Comparator.comparingInt(d -> indexOfDay(dayOrder, d.getJour())));

        return EdtSemaineDto.builder()
                .semestreId(semestre.getId())
                .semestreLibelle(semestre.getLibelle())

                .semaineId(semaine.getId())
                .numeroSemaine(semaine.getNumeroSemaine())
                .dateDebut(semaine.getDateDebut())
                .dateFin(semaine.getDateFin())

                .departementId(departement.getId())
                .departementCode(departement.getCode())
                .departementNom(departement.getNom())

                .jours(jours)
                .build();
    }

    private int indexOfDay(List<String> order, String jour) {
        if (jour == null) return Integer.MAX_VALUE;
        int i = order.indexOf(jour.trim().toUpperCase());
        return (i >= 0) ? i : Integer.MAX_VALUE;
    }
}
