package PEI.EDT.Dtos.Auth;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType; // "Bearer"
}
