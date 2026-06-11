package se.stephanie.lifesync.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdAndPaidFalse(Long userId);

    List<Payment> findByUserIdAndPaidTrue(Long userId);
}
