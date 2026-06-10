package se.stephanie.lifesync.notification;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

        private final NotificationService service;

        public NotificationController(NotificationService service) {
            this.service = service;
        }

        /* GET */
    @GetMapping
    public List<Notification> getAllNotifications() {
        return service.getAllNotifications();
    }

    @GetMapping("/{id}")
    public Notification getNotificationById(@PathVariable Long id) {
        return service.getNotificationById(id);
    }

    /* POST */
    @PostMapping
    public Notification createNotification(@Valid @RequestBody Notification notification) {
        return service.createNotification(notification);
    }

    /* PUT */
    @PutMapping("/{id}/sent")
    public Notification markAsSent(@PathVariable Long id) {
        return service.markAsSent(id);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return service.markAsRead(id);
    }

    @PutMapping("/{id}/unread")
    public Notification markAsUnread(@PathVariable Long id) {
        return service.markAsUnread(id);
    }

        /* DELETE */

        @DeleteMapping("/{id}")
        public void deleteNotification(@PathVariable Long id) {
            service.getNotificationById(id); // Check if exists
            service.markAsSent(id); // Mark as sent before deletion
            service.markAsRead(id); // Mark as read before deletion
            service.deleteNotification(id);
        }

}
