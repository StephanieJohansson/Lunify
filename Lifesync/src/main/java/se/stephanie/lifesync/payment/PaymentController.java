package se.stephanie.lifesync.payment;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {

        this.paymentService = paymentService;
    }

     /* GET */
    @GetMapping
    public List<Payment> getAllPayments() {

        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @GetMapping("/unpaid")
    public List<Payment> getUnpaidPayments() {
        Long userId = 1L; //TODO: replace with logged-in user from spring security
        return paymentService.getUnpaidPayments(userId);

    }

    @GetMapping("/paid")
    public List<Payment> getPaidPayments() {
        Long userId = 1L; //TODO: replace with logged-in user from spring security
        return paymentService.getPaidPayments(userId);
    }

    /* POST */
    @PostMapping
    public Payment createPayment(@Valid @RequestBody Payment payment) {

        return paymentService.createPayment(payment);
    }

    /* PUT */
    @PutMapping("/{id}")
    public Payment updatePayment(@PathVariable Long id, @Valid @RequestBody Payment payment) {
        return paymentService.updatePayment(id, payment);
    }

    /* DELETE */
    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable Long id) {

        paymentService.deletePayment(id);
    }
}
