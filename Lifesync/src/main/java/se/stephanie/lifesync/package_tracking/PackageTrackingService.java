package se.stephanie.lifesync.package_tracking;


import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;
import se.stephanie.lifesync.user.User;
import se.stephanie.lifesync.user.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PackageTrackingService {

    private final PackageTrackingRepository packageTrackingRepository;
    private final UserRepository userRepository;
    private final BringTrackingClient bringTrackingClient;
    private final PostNordTrackingClient postNordTrackingClient;

    public PackageTrackingService(
            PackageTrackingRepository packageTrackingRepository,
            UserRepository userRepository,
            BringTrackingClient bringTrackingClient,
            PostNordTrackingClient postNordTrackingClient
    ) {
        this.packageTrackingRepository = packageTrackingRepository;
        this.userRepository = userRepository;
        this.bringTrackingClient = bringTrackingClient;
        this.postNordTrackingClient = postNordTrackingClient;
    }

     /* GET */
    public List<PackageTracking> getAllPackageTrackings() {
        return packageTrackingRepository.findAll();
    }

    public PackageTracking getPackageTrackingById(Long id) {
        return packageTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package tracking not found with id: " + id));
    }

    public List<PackageTracking> getDeliveredPackageTrackings(Long userId) {
        return packageTrackingRepository.findByUserIdAndDeliveredTrue(userId);
    }

    public List<PackageTracking> getUndeliveredPackageTrackings(Long userId) {
        return packageTrackingRepository.findByUserIdAndDeliveredFalse(userId);
    }

    public List<PackageCalendarEventResponse> getPackageCalendarEvents(Long userId) {
        List<PackageCalendarEventResponse> calendarEvents = new ArrayList<>();

        for (PackageTracking packageTracking : getUndeliveredPackageTrackings(userId)) {
            addExpectedDeliveryEvent(calendarEvents, packageTracking);
            addTrackingTimelineEvents(calendarEvents, packageTracking);
        }

        return calendarEvents;
    }

     /* POST */
    public PackageTracking createPackageTracking(PackageTracking packageTracking) {
        Long defaultUserId = 1L;

        User user = userRepository.findById(defaultUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Default user not found with id: " + defaultUserId
                ));

        packageTracking.setUser(user);
        packageTracking.setCarrier(normalizeCarrier(packageTracking.getCarrier()));
        packageTracking.setStatus(defaultStatus(packageTracking.getStatus()));
        packageTracking.setTrackingUrl(createTrackingUrl(packageTracking));

        return packageTrackingRepository.save(packageTracking);
    }

    public PackageTracking createPackageTracking(PackageTrackingRequest request) {
        PackageTracking packageTracking = new PackageTracking();
        packageTracking.setPackageName(request.packageName());
        packageTracking.setTrackingNumber(request.trackingNumber());
        packageTracking.setCarrier(request.carrier());
        packageTracking.setStatus("REGISTERED");

        PackageTracking savedPackageTracking = createPackageTracking(packageTracking);

        if (canRefreshCarrier(savedPackageTracking.getCarrier())) {
            try {
                return refreshPackageTracking(savedPackageTracking.getId());
            } catch (RuntimeException exception) {
                savedPackageTracking.setStatus("TRACKING_UNAVAILABLE");
                savedPackageTracking.setStatusDescription(exception.getMessage());
                savedPackageTracking.setLastUpdatedAt(LocalDateTime.now());
                return packageTrackingRepository.save(savedPackageTracking);
            }
        }

        return savedPackageTracking;
    }

     /* PUT */
    public PackageTracking updatePackageTracking(Long id, PackageTracking packageTracking) {
        PackageTracking existingPackageTracking = getPackageTrackingById(id);

        existingPackageTracking.setPackageName(packageTracking.getPackageName());
        existingPackageTracking.setCarrier(packageTracking.getCarrier());
        existingPackageTracking.setTrackingNumber(packageTracking.getTrackingNumber());
        existingPackageTracking.setStatus(packageTracking.getStatus());
        existingPackageTracking.setProviderStatus(packageTracking.getProviderStatus());
        existingPackageTracking.setStatusDescription(packageTracking.getStatusDescription());
        existingPackageTracking.setExpectedDeliveryDate(packageTracking.getExpectedDeliveryDate());
        existingPackageTracking.setExpectedDeliveryStart(packageTracking.getExpectedDeliveryStart());
        existingPackageTracking.setExpectedDeliveryEnd(packageTracking.getExpectedDeliveryEnd());
        existingPackageTracking.setPickupCode(packageTracking.getPickupCode());
        existingPackageTracking.setPickupPointName(packageTracking.getPickupPointName());
        existingPackageTracking.setDelivered(packageTracking.isDelivered());
        existingPackageTracking.setTrackingUrl(createTrackingUrl(existingPackageTracking));

        return packageTrackingRepository.save(existingPackageTracking);
    }

    public PackageTracking refreshPackageTracking(Long id) {
        PackageTracking packageTracking = getPackageTrackingById(id);

        if (!canRefreshCarrier(packageTracking.getCarrier())) {
            return packageTracking;
        }

        TrackingResult trackingResult;

        try {
            trackingResult = fetchTrackingResult(packageTracking);
        } catch (RuntimeException exception) {
            packageTracking.setCarrier(normalizeCarrier(packageTracking.getCarrier()));
            packageTracking.setStatus("TRACKING_UNAVAILABLE");
            packageTracking.setStatusDescription(exception.getMessage());
            packageTracking.setLastUpdatedAt(LocalDateTime.now());
            packageTracking.setTrackingUrl(createTrackingUrl(packageTracking));
            return packageTrackingRepository.save(packageTracking);
        }

        packageTracking.setCarrier(normalizeCarrier(packageTracking.getCarrier()));
        packageTracking.setProviderStatus(trackingResult.providerStatus());
        packageTracking.setStatus(trackingResult.normalizedStatus());
        packageTracking.setStatusDescription(trackingResult.statusDescription());
        packageTracking.setProductName(trackingResult.productName());
        packageTracking.setSenderName(trackingResult.senderName());
        packageTracking.setPickupCode(trackingResult.pickupCode());
        packageTracking.setPickupPointName(trackingResult.pickupPointName());
        packageTracking.setExpectedDeliveryDate(trackingResult.expectedDeliveryDate());
        packageTracking.setExpectedDeliveryStart(trackingResult.expectedDeliveryStart());
        packageTracking.setExpectedDeliveryEnd(trackingResult.expectedDeliveryEnd());
        packageTracking.setLastEventTime(trackingResult.lastEventTime());
        packageTracking.setLastEventLocation(trackingResult.lastEventLocation());
        packageTracking.setDelivered(trackingResult.delivered());
        packageTracking.setLastUpdatedAt(LocalDateTime.now());
        packageTracking.setTrackingUrl(createTrackingUrl(packageTracking));
        packageTracking.replaceEvents(trackingResult.events());

        return packageTrackingRepository.save(packageTracking);
    }

    public void refreshActivePackages() {
        List<PackageTracking> activePackages = new ArrayList<>();
        activePackages.addAll(packageTrackingRepository.findByCarrierIgnoreCaseAndDeliveredFalse("BRING"));
        activePackages.addAll(packageTrackingRepository.findByCarrierIgnoreCaseAndDeliveredFalse("POSTNORD"));

        for (PackageTracking packageTracking : activePackages) {
            try {
                refreshPackageTracking(packageTracking.getId());
            } catch (RuntimeException exception) {
                packageTracking.setStatus("TRACKING_UNAVAILABLE");
                packageTracking.setStatusDescription(exception.getMessage());
                packageTracking.setLastUpdatedAt(LocalDateTime.now());
                packageTrackingRepository.save(packageTracking);
            }
        }
    }

     /* DELETE */
    public void deletePackageTracking(Long id) {
        packageTrackingRepository.deleteById(id);
    }

    private void addExpectedDeliveryEvent(
            List<PackageCalendarEventResponse> calendarEvents,
            PackageTracking packageTracking
    ) {
        LocalDate expectedDate = packageTracking.getExpectedDeliveryDate();

        if (expectedDate == null) {
            return;
        }

        LocalDateTime start = packageTracking.getExpectedDeliveryStart() != null
                ? packageTracking.getExpectedDeliveryStart()
                : LocalDateTime.of(expectedDate, LocalTime.of(12, 0));
        LocalDateTime end = packageTracking.getExpectedDeliveryEnd() != null
                ? packageTracking.getExpectedDeliveryEnd()
                : start.plusHours(1);

        calendarEvents.add(new PackageCalendarEventResponse(
                "package-" + packageTracking.getId() + "-eta",
                packageTracking.getId(),
                "Package ETA: " + packageTracking.getPackageName(),
                start,
                end,
                false,
                packageTracking.getStatusDescription(),
                packageTracking.getPickupPointName(),
                "PACKAGE",
                false,
                "PACKAGE",
                packageTracking.getCarrier(),
                packageTracking.getTrackingNumber(),
                packageTracking.getStatus()
        ));
    }

    private void addTrackingTimelineEvents(
            List<PackageCalendarEventResponse> calendarEvents,
            PackageTracking packageTracking
    ) {
        for (PackageTrackingEvent event : packageTracking.getEvents()) {
            if (event.isInsignificant() || event.getEventTime() == null) {
                continue;
            }

            calendarEvents.add(new PackageCalendarEventResponse(
                    "package-event-" + event.getId(),
                    packageTracking.getId(),
                    packageTracking.getPackageName() + ": " + event.getStatus(),
                    event.getEventTime(),
                    event.getEventTime().plusMinutes(30),
                    false,
                    event.getDescription(),
                    formatLocation(event.getCity(), event.getCountry()),
                    "PACKAGE",
                    false,
                    "PACKAGE",
                    packageTracking.getCarrier(),
                    packageTracking.getTrackingNumber(),
                    event.getStatus()
            ));
        }
    }

    private String normalizeCarrier(String carrier) {
        return carrier == null ? "UNKNOWN" : carrier.trim().toUpperCase();
    }

    private String defaultStatus(String status) {
        return status == null || status.isBlank() ? "REGISTERED" : status.trim().toUpperCase();
    }

    private String createTrackingUrl(PackageTracking packageTracking) {
        if ("BRING".equalsIgnoreCase(packageTracking.getCarrier())) {
            return "https://sporing.bring.no/sporing/" + packageTracking.getTrackingNumber();
        }

        if ("POSTNORD".equalsIgnoreCase(packageTracking.getCarrier())) {
            return "https://www.postnord.se/vara-verktyg/spara-brev-paket-och-pall?shipmentId="
                    + packageTracking.getTrackingNumber();
        }

        return "";
    }

    private boolean canRefreshCarrier(String carrier) {
        return "BRING".equalsIgnoreCase(carrier) || "POSTNORD".equalsIgnoreCase(carrier);
    }

    private TrackingResult fetchTrackingResult(PackageTracking packageTracking) {
        if ("POSTNORD".equalsIgnoreCase(packageTracking.getCarrier())) {
            return postNordTrackingClient.track(packageTracking.getTrackingNumber());
        }

        return bringTrackingClient.track(packageTracking.getTrackingNumber());
    }

    private String formatLocation(String city, String country) {
        if (city == null || city.isBlank()) {
            return country == null ? "" : country;
        }

        if (country == null || country.isBlank()) {
            return city;
        }

        return city + ", " + country;
    }
}
