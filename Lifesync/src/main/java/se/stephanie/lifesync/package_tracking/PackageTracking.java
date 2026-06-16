package se.stephanie.lifesync.package_tracking;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import se.stephanie.lifesync.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private String carrier; // BRING, POSTNORD, DHL, INSTABOX, BUDBEE

    private String status; // PRE_NOTIFIED, IN_TRANSIT, READY_FOR_PICKUP, DELIVERED etc

    private String providerStatus;

    @Column(length = 1000)
    private String statusDescription;

    private LocalDate expectedDeliveryDate;

    private LocalDateTime expectedDeliveryStart;

    private LocalDateTime expectedDeliveryEnd;

    private LocalDateTime lastUpdatedAt;

    private LocalDateTime lastEventTime;

    private String lastEventLocation;

    private String productName;

    private String senderName;

    private String pickupCode;

    private String pickupPointName;

    private String trackingUrl;

    private boolean delivered;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "packageTracking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageTrackingEvent> events = new ArrayList<>();

    public void replaceEvents(List<PackageTrackingEvent> newEvents) {
        events.clear();

        for (PackageTrackingEvent event : newEvents) {
            event.setPackageTracking(this);
            events.add(event);
        }
    }
}
