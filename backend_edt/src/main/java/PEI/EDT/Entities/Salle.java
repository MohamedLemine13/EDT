package PEI.EDT.Entities;

import PEI.EDT.Entities.Enums.TypeSalle;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salle")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_salle", nullable = false, length = 10)
    private TypeSalle typeSalle;

    // ✅ NEW: AMPHI belongs to an ECOLE (school-level room)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ecole_id", nullable = false)
    private Ecole ecole;

    // ✅ CHANGED: departement is now OPTIONAL (NULL for AMPHI)
    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "departement_id", nullable = true)
    private Departement departement;

    @OneToMany(mappedBy = "salle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
