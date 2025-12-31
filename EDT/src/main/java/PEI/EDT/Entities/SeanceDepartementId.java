package PEI.EDT.Entities;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class SeanceDepartementId implements Serializable {
    private Integer seanceId;
    private Integer departementId;
}
