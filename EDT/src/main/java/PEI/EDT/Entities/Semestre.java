package PEI.EDT.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "semestre")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Semestre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String libelle;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @OneToMany(mappedBy = "semestre", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Creneau> creneaux = new ArrayList<>();

    @OneToMany(mappedBy = "semestre", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SemaineAcademique> semaines = new ArrayList<>();

    @OneToMany(mappedBy = "semestre", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AffectationEnseignement> affectations = new ArrayList<>();
}
