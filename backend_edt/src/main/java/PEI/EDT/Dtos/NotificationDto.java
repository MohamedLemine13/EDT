package PEI.EDT.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDto {
    private Integer id;
    private String titre;
    private String message;
    private LocalDateTime dateCreation;
    private boolean lue;
    private String type;
}
