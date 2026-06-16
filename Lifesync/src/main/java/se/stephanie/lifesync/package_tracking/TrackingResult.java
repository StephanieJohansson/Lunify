package se.stephanie.lifesync.package_tracking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TrackingResult(
        String providerStatus,
        String normalizedStatus,
        String statusDescription,
        String productName,
        String senderName,
        String pickupCode,
        String pickupPointName,
        LocalDate expectedDeliveryDate,
        LocalDateTime expectedDeliveryStart,
        LocalDateTime expectedDeliveryEnd,
        LocalDateTime lastEventTime,
        String lastEventLocation,
        boolean delivered,
        List<PackageTrackingEvent> events
) {
}
