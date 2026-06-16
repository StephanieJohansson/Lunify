package se.stephanie.lifesync.package_tracking;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PackageTrackingScheduler {

    private final PackageTrackingService packageTrackingService;

    public PackageTrackingScheduler(PackageTrackingService packageTrackingService) {
        this.packageTrackingService = packageTrackingService;
    }

    @Scheduled(fixedDelayString = "${lifesync.packages.refresh-delay-ms:900000}")
    public void refreshActivePackages() {
        packageTrackingService.refreshActivePackages();
    }
}
