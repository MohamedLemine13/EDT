package PEI.EDT.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "semaine_academique",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_semestre_num_semaine",
                columnNames = {"semestre_id", "numero_semaine"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SemaineAcademique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "numero_semaine", nullable = false)
    private Integer numeroSemaine;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semestre_id", nullable = false)
    private Semestre semestre;

    @OneToMany(mappedBy = "semaineAcademique", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
