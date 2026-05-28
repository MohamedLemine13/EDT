package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.TypeCreneau;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import PEI.EDT.Entities.Enums.JourSemaine;

@Entity
@Table(name = "creneau")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Creneau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private JourSemaine jour;


    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_creneau", nullable = false, length = 10)
    private TypeCreneau typeCreneau;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semestre_id", nullable = false)
    private Semestre semestre;

    @OneToMany(mappedBy = "creneau", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
