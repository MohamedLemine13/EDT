package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.StatutProfesseur;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professeur")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Professeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private StatutProfesseur statut;

    @OneToMany(mappedBy = "professeur", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AffectationEnseignement> affectations = new ArrayList<>();
}
