package PEI.EDT.Dtos.Auth;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreateUserRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;

    // "ADMIN" "ETUDIANT" "PROFESSEUR" "CHEF_DEP" "CHEF_HE" "CHEF_ST"
    private String role;

    // Required for ETUDIANT / CHEF_DEP
    private Integer departementId;

    // Optional: link to an existing Professeur profile
    private Integer professeurId;
}
