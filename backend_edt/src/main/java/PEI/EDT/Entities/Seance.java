package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.StatutSeance;
import PEI.EDT.Entities.Enums.TypeSeance;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "seance")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Seance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeSeance type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private StatutSeance statut;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "creneau_id", nullable = false)
    private Creneau creneau;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_code", nullable = false)
    private Matiere matiere;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semaine_id", nullable = false)
    private SemaineAcademique semaineAcademique;

    // ✅ Multiple professeurs (ManyToMany) — Set avoids MultipleBagFetchException
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "seance_professeurs",
            joinColumns = @JoinColumn(name = "seance_id"),
            inverseJoinColumns = @JoinColumn(name = "professeur_id")
    )
    @Builder.Default
    private Set<Professeur> professeurs = new HashSet<>();

    // ✅ Multiple salles (ManyToMany) — Set avoids MultipleBagFetchException
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "seance_salles",
            joinColumns = @JoinColumn(name = "seance_id"),
            inverseJoinColumns = @JoinColumn(name = "salle_id")
    )
    @Builder.Default
    private Set<Salle> salles = new HashSet<>();

    @Column(length = 100)
    private String tag;

    @OneToMany(mappedBy = "seance", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SeanceDepartement> seanceDepartements = new ArrayList<>();
}
