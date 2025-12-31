package PEI.EDT.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matiere")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Matiere {

    @Id
    @Column(length = 50)
    private String code;

    @Column(nullable = false)
    private String intitule;

    @OneToMany(mappedBy = "matiere", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AffectationEnseignement> affectations = new ArrayList<>();

    @OneToMany(mappedBy = "matiere", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
