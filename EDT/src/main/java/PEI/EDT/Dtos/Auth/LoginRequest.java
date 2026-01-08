package PEI.EDT.Dtos.Auth;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginRequest {
    private String email;
    private String password;
}
