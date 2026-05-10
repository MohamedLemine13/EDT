package PEI.EDT.Services;

import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Entities.Professeur;
import PEI.EDT.Entities.Salle;
import PEI.EDT.Entities.Seance;

import java.util.ArrayList;
import java.util.List;

public final class DtoMapper {

    private DtoMapper() {}

    public static SeanceDto toSeanceDto(Seance s) {
        List<Integer> deptIds = s.getSeanceDepartements()
                .stream()
                .map(sd -> sd.getDepartement().getId())
                .toList();

        // ✅ Multiple professors
        List<Integer> profIds = s.getProfesseurs() == null ? new ArrayList<>()
                : s.getProfesseurs().stream().map(Professeur::getId).toList();
        List<String> profNoms = s.getProfesseurs() == null ? new ArrayList<>()
                : s.getProfesseurs().stream().map(p -> p.getPrenom() + " " + p.getNom()).toList();

        // ✅ Multiple salles
        List<Integer> salleIds = s.getSalles() == null ? new ArrayList<>()
                : s.getSalles().stream().map(Salle::getId).toList();
        List<String> salleNoms = s.getSalles() == null ? new ArrayList<>()
                : s.getSalles().stream().map(Salle::getNom).toList();

        return SeanceDto.builder()
                .id(s.getId())
                .type(s.getType().name())
                .statut(s.getStatut().name())

                .jour(s.getCreneau().getJour().toString())
                .heureDebut(s.getCreneau().getHeureDebut())
                .heureFin(s.getCreneau().getHeureFin())
                .typeCreneau(s.getCreneau().getTypeCreneau().name())

                .matiereCode(s.getMatiere() == null ? null : s.getMatiere().getCode())
                .matiereIntitule(s.getMatiere() == null ? null : s.getMatiere().getIntitule())

                .professeurIds(profIds)
                .professeurNoms(profNoms)

                .salleIds(salleIds)
                .salleNoms(salleNoms)

                .semaineId(s.getSemaineAcademique().getId())
                .numeroSemaine(s.getSemaineAcademique().getNumeroSemaine())

                .tag(s.getTag())

                .departementIds(deptIds)
                .build();
    }
}
