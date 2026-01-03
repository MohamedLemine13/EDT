package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.StatutSeance;
import PEI.EDT.Entities.Enums.TypeSeance;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

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

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = true)
    private Salle salle;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semaine_id", nullable = false)
    private SemaineAcademique semaineAcademique;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "professeur_id", nullable = true)
    private Professeur professeur;

    @OneToMany(mappedBy = "seance", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SeanceDepartement> seanceDepartements = new ArrayList<>();
}
