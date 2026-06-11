package se.stephanie.lifesync.package_tracking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackageTrackingRepository extends JpaRepository<PackageTracking, Long> {
    List<PackageTracking> findByUserIdAndDeliveredTrue(Long userId);

    List<PackageTracking> findByUserIdAndDeliveredFalse(Long userId);

}
