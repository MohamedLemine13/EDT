package PEI.EDT.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ecole")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Ecole {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String nom;

    private String domaine;

    @Column(nullable = false, unique = true)
    private String slug;

    @OneToMany(mappedBy = "ecole", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Departement> departements = new ArrayList<>();
}
