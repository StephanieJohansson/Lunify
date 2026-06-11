package se.stephanie.lifesync.notification;

import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;

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
                    .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        }

        public Notification createNotification(Notification notification) {
            return notificationRepository.save(notification);
        }

        public void deleteNotification(Long id) {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
            notificationRepository.delete(notification);
        }


        public Notification markAsSent(Long id) {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
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
        notification.setRead(false);
        return notificationRepository.save(notification);
       }

       public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
       }

    public List<Notification> getReadNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadTrue(userId);
    }

    public List<Notification> getSentNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndSentTrue(userId);
    }
}
