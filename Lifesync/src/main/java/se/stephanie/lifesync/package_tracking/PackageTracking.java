package se.stephanie.lifesync.package_tracking;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import se.stephanie.lifesync.user.User;

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

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
