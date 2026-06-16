package se.stephanie.lifesync.package_tracking;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class PackageTrackingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status;

    @Column(length = 1000)
    private String description;

    private String city;

    private String country;

    private LocalDateTime eventTime;

    private boolean insignificant;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_tracking_id")
    private PackageTracking packageTracking;
}
