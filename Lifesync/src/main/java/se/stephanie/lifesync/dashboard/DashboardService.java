package se.stephanie.lifesync.dashboard;

import org.springframework.stereotype.Service;
import se.stephanie.lifesync.notification.NotificationRepository;
import se.stephanie.lifesync.package_tracking.PackageTrackingRepository;
import se.stephanie.lifesync.payment.PaymentRepository;
import se.stephanie.lifesync.reminder.ReminderRepository;
import se.stephanie.lifesync.todo.TodoTaskRepository;

import java.time.LocalDateTime;

@Service
public class DashboardService {
    LocalDateTime now = LocalDateTime.now();

    private final TodoTaskRepository todoRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final PackageTrackingRepository packageRepository;
    private final ReminderRepository reminderRepository;

    public DashboardService(TodoTaskRepository todoRepository, NotificationRepository notificationRepository,
                            PaymentRepository paymentRepository, PackageTrackingRepository packageRepository,
                            ReminderRepository reminderRepository) {
        this.todoRepository = todoRepository;
        this.notificationRepository = notificationRepository;
        this.paymentRepository = paymentRepository;
        this.packageRepository = packageRepository;
        this.reminderRepository = reminderRepository;
    }

    public DashboardSummary getSummary(Long userId) {
        return new DashboardSummary(
                todoRepository.countByUserIdAndCompletedFalse(userId),
                notificationRepository.findByUserIdAndReadFalse(userId).size(),
                paymentRepository.findByUserIdAndPaidFalse(userId).size(),
                packageRepository.findByUserIdAndDeliveredFalse(userId).size(),
                reminderRepository.countByUserIdAndReminderTimeAfterAndCompletedFalse(userId, now)
        );
    }
}
