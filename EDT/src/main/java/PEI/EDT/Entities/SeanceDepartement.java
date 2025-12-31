package PEI.EDT.Entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seance_departement")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SeanceDepartement {

    @EmbeddedId
    private SeanceDepartementId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("seanceId")
    @JoinColumn(name = "seance_id", nullable = false)
    private Seance seance;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("departementId")
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;
}
