package se.stephanie.lifesync.payment;


import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {

        this.paymentRepository = paymentRepository;
    }

        /* GET */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    public List<Payment> getUnpaidPayments(Long userId) {
        return paymentRepository.findByUserIdAndPaidFalse(userId);
    }

    public List<Payment> getPaidPayments(Long userId) {
        return paymentRepository.findByUserIdAndPaidTrue(userId);
    }

    /* POST */
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    /* PUT */
    public Payment updatePayment(Long id, Payment payment) {
        Payment existingPayment = getPaymentById(id);

        existingPayment.setTitle(payment.getTitle());
        existingPayment.setDescription(payment.getDescription());
        existingPayment.setAmount(payment.getAmount());
        existingPayment.setDueDate(payment.getDueDate());
        existingPayment.setPaid(payment.isPaid());
        existingPayment.setRecurring(payment.isRecurring());

        return paymentRepository.save(existingPayment);
    }

    /* DELETE */
    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
}
