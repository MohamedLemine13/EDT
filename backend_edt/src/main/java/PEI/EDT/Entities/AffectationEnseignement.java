package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.TypeSeance;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "affectation_enseignement")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AffectationEnseignement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeSeance type;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semestre_id", nullable = false)
    private Semestre semestre;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "affectation_departements",
            joinColumns = @JoinColumn(name = "affectation_id"),
            inverseJoinColumns = @JoinColumn(name = "departement_id")
    )
    @Builder.Default
    private java.util.Set<Departement> departements = new java.util.HashSet<>();

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_code", nullable = false)
    private Matiere matiere;

    // ✅ Multiple professeurs (ManyToMany)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "affectation_professeurs",
            joinColumns = @JoinColumn(name = "affectation_id"),
            inverseJoinColumns = @JoinColumn(name = "professeur_id")
    )
    @Builder.Default
    private java.util.Set<Professeur> professeurs = new java.util.HashSet<>();

    // ✅ Multiple salles (ManyToMany)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "affectation_salles",
            joinColumns = @JoinColumn(name = "affectation_id"),
            inverseJoinColumns = @JoinColumn(name = "salle_id")
    )
    @Builder.Default
    private java.util.Set<Salle> salles = new java.util.HashSet<>();
}
