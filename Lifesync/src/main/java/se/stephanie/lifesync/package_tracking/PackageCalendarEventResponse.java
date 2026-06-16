package se.stephanie.lifesync.package_tracking;

import java.time.LocalDateTime;

public record PackageCalendarEventResponse(
        String id,
        Long packageId,
        String title,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        boolean allDay,
        String description,
        String location,
        String category,
        boolean recurring,
        String source,
        String carrier,
        String trackingNumber,
        String packageStatus
) {
}
