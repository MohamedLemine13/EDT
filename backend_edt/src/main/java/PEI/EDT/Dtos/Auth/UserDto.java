package PEI.EDT.Dtos.Auth;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserDto {
    private Integer id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private Integer departementId; // nullable
    private String ecoleId; // nullable — only for ADMIN role
    private boolean mustChangePassword;
}
