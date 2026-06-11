package se.stephanie.lifesync.package_tracking;


import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;

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
                .orElseThrow(() -> new ResourceNotFoundException("Package tracking not found with id: " + id));
    }

    public List<PackageTracking> getDeliveredPackageTrackings(Long userId) {
        return packageTrackingRepository.findByUserIdAndDeliveredTrue(userId);
    }

    public List<PackageTracking> getUndeliveredPackageTrackings(Long userId) {
        return packageTrackingRepository.findByUserIdAndDeliveredFalse(userId);
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
