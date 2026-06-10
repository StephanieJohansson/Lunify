package se.stephanie.lifesync.notification;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

        private final NotificationRepository notificationRepository;

        public NotificationService(NotificationRepository notificationRepository) {
            this.notificationRepository = notificationRepository;
        }

        public List<Notification> getAllNotifications() {
            return notificationRepository.findAll();
        }

        public Notification getNotificationById(Long id) {
            return notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
        }

        public Notification createNotification(Notification notification) {
            return notificationRepository.save(notification);
        }

        public void deleteNotification(Long id) {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            notificationRepository.delete(notification);
        }


        public Notification markAsSent(Long id) {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            notification.setSent(true);
            return notificationRepository.save(notification);
        }

       public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setRead(true);
        return notificationRepository.save(notification);
       }

       public Notification markAsUnread(Long id) {
        Notification notification = getNotificationById(id);
        notification.setUnread(true);
        return notificationRepository.save(notification);
       }
}
