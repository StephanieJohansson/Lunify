package se.stephanie.lifesync.package_tracking;


import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PackageTrackingService {

    private final PackageTrackingRepository packageTrackingRepository;

    public PackageTrackingService(PackageTrackingRepository packageTrackingRepository) {
        this.packageTrackingRepository = packageTrackingRepository;
    }

     /* GET */
    public List<PackageTracking> getAllPackageTrackings() {
        return packageTrackingRepository.findAll();
    }

    public PackageTracking getPackageTrackingById(Long id) {
        return packageTrackingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package tracking not found with id: " + id));
    }

     /* POST */
    public PackageTracking createPackageTracking(PackageTracking packageTracking) {
        return packageTrackingRepository.save(packageTracking);
    }

     /* PUT */
    public PackageTracking updatePackageTracking(Long id, PackageTracking packageTracking) {
        PackageTracking existingPackageTracking = getPackageTrackingById(id);

        existingPackageTracking.setCarrier(packageTracking.getCarrier());
        existingPackageTracking.setTrackingNumber(packageTracking.getTrackingNumber());
        existingPackageTracking.setStatus(packageTracking.getStatus());
        existingPackageTracking.setExpectedDeliveryDate(packageTracking.getExpectedDeliveryDate());
        existingPackageTracking.setDelivered(packageTracking.isDelivered());

        return packageTrackingRepository.save(existingPackageTracking);
    }

     /* DELETE */
    public void deletePackageTracking(Long id) {
        packageTrackingRepository.deleteById(id);
    }
}
