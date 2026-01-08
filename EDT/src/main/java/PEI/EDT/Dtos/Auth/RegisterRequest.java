package PEI.EDT.Dtos.Auth;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;

    // required for ETUDIANT and CHEF_DEP, nullable otherwise
    private Integer departementId;

    // "ADMIN" "ETUDIANT" "CHEF_DEP" "CHEF_HE" "CHEF_ST"
    private String role;
}
