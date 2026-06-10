package se.stephanie.lifesync.package_tracking;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class PackageTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String packageName;

    @NotBlank
    private String trackingNumber;

    private String carrier; //postnordf, instabox, bring etc

    private String status; // registrerad, under transport, levererad etc

    private LocalDate expectedDeliveryDate;

    private boolean delivered;
}
