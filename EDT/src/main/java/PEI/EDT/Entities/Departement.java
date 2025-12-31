package PEI.EDT.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departement")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Departement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String nom;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ecole_id", nullable = false)
    private Ecole ecole;

    @OneToMany(mappedBy = "departement", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Utilisateur> utilisateurs = new ArrayList<>();

    @OneToMany(mappedBy = "departement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Salle> salles = new ArrayList<>();

    @OneToMany(mappedBy = "departement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AffectationEnseignement> affectations = new ArrayList<>();

    @OneToMany(mappedBy = "departement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SeanceDepartement> seanceDepartements = new ArrayList<>();
}
