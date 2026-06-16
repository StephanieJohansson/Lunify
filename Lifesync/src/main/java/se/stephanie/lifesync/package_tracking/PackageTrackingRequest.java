package se.stephanie.lifesync.package_tracking;

import jakarta.validation.constraints.NotBlank;

public record PackageTrackingRequest(
        @NotBlank String packageName,
        @NotBlank String trackingNumber,
        @NotBlank String carrier
) {
}
