package se.stephanie.lifesync.package_tracking;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PackageTrackingController {

        private final PackageTrackingService service;

        public PackageTrackingController(PackageTrackingService service) {

            this.service = service;
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
        Long userId = 1L; //TODO: replace with logged-in user from spring security
        return service.getDeliveredPackageTrackings(userId);
    }

    @GetMapping("/undelivered")
    public List<PackageTracking> getUndeliveredPackages() {
        Long userId = 1L; //TODO: replace with logged-in user from spring security
        return service.getUndeliveredPackageTrackings(userId);
    }

    @GetMapping("/calendar")
    public List<PackageCalendarEventResponse> getPackageCalendarEvents() {
        Long userId = 1L; //TODO: replace with logged-in user from spring security
        return service.getPackageCalendarEvents(userId);
    }

        /* POST */
    @PostMapping
    public PackageTracking createPackageTracking(@Valid @RequestBody PackageTrackingRequest request) {
        return service.createPackageTracking(request);
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
