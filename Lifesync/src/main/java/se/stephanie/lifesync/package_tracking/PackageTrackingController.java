package se.stephanie.lifesync.package_tracking;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import se.stephanie.lifesync.security.CurrentUserService;
import se.stephanie.lifesync.user.User;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PackageTrackingController {

        private final PackageTrackingService service;
        private final CurrentUserService currentUserService;

        public PackageTrackingController(PackageTrackingService service, CurrentUserService currentUserService) {

            this.service = service;
            this.currentUserService = currentUserService;
        }

        /* GET */
    @GetMapping
    public List<PackageTracking> getAllPackageTrackings() {

        return service.getAllPackageTrackings();
    }

    @GetMapping("/{id}")
    public PackageTracking getPackageTrackingById(@PathVariable Long id) {

        return service.getPackageTrackingById(id);
    }

    @GetMapping("/delivered")
    public List<PackageTracking> getDeliveredPackages() {
        return service.getDeliveredPackageTrackings(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/undelivered")
    public List<PackageTracking> getUndeliveredPackages() {
        return service.getUndeliveredPackageTrackings(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/calendar")
    public List<PackageCalendarEventResponse> getPackageCalendarEvents() {
        return service.getPackageCalendarEvents(currentUserService.getCurrentUser().getId());
    }

        /* POST */
    @PostMapping
    public PackageTracking createPackageTracking(@Valid @RequestBody PackageTrackingRequest request) {
        User user = currentUserService.getCurrentUser();
        return service.createPackageTracking(request, user);
    }

    @PostMapping("/{id}/refresh")
    public PackageTracking refreshPackageTracking(@PathVariable Long id) {
        return service.refreshPackageTracking(id);
    }

        /* PUT */
    @PutMapping("/{id}")
    public PackageTracking updatePackageTracking(@PathVariable Long id, @Valid @RequestBody PackageTracking packageTracking) {
        return service.updatePackageTracking(id, packageTracking);
    }

        /* DELETE */
    @DeleteMapping("/{id}")
    public void deletePackageTracking(@PathVariable Long id) {

        service.deletePackageTracking(id);
    }
}
