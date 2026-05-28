package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.StatutProfesseur;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

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

    @Column(length = 100)
    private String email;

    @ManyToMany(mappedBy = "professeurs")
    @Builder.Default
    private Set<AffectationEnseignement> affectations = new HashSet<>();
}
