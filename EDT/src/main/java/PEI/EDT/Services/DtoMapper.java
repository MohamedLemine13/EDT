package PEI.EDT.Services;

import PEI.EDT.Dtos.SeanceDto;
import PEI.EDT.Entities.Seance;
import PEI.EDT.Entities.SeanceDepartement;

import java.util.List;

public final class DtoMapper {

    private DtoMapper() {}

    public static SeanceDto toSeanceDto(Seance s) {
        List<Integer> deptIds = s.getSeanceDepartements()
                .stream()
                .map(sd -> sd.getDepartement().getId())
                .toList();

        return SeanceDto.builder()
                .id(s.getId())
                .type(s.getType().name())
                .statut(s.getStatut().name())

                .jour(s.getCreneau().getJour().toString()) // works for String or enum
                .heureDebut(s.getCreneau().getHeureDebut())
                .heureFin(s.getCreneau().getHeureFin())
                .typeCreneau(s.getCreneau().getTypeCreneau().name())

                .matiereCode(s.getMatiere() == null ? null : s.getMatiere().getCode())

                .salleId(s.getSalle() == null ? null : s.getSalle().getId())
                .salleNom(s.getSalle() == null ? null : s.getSalle().getNom())
                .typeSalle(s.getSalle() == null ? null : s.getSalle().getTypeSalle().name())

                .semaineId(s.getSemaineAcademique().getId())
                .numeroSemaine(s.getSemaineAcademique().getNumeroSemaine())

                .departementIds(deptIds)
                .build();
    }
}
