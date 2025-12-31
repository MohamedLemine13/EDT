package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.TypeSeance;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "affectation_enseignement",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_affectation_unique",
                columnNames = {"semestre_id", "departement_id", "matiere_code", "type"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AffectationEnseignement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private TypeSeance type;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semestre_id", nullable = false)
    private Semestre semestre;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = false)
    private Departement departement;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_code", nullable = false)
    private Matiere matiere;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "professeur_id", nullable = false)
    private Professeur professeur;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

}
