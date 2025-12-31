package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.RoleUtilisateur;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "utilisateur")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleUtilisateur role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id") // nullable
    private Departement departement;
}
