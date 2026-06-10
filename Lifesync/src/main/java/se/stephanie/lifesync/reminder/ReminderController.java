package se.stephanie.lifesync.reminder;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

        private final ReminderService reminderService;

        public ReminderController(ReminderService reminderService) {
            this.reminderService = reminderService;
        }

        /* GET */
        @GetMapping
        public List<Reminder> getAllReminders() {
        return reminderService.getAllReminders();}

        @GetMapping("/{id}")
        public Reminder getReminderById(@PathVariable Long id) {
        return reminderService.getReminderById(id);
    }

        /* POST */
        @PostMapping
        public Reminder createReminder(@Valid @RequestBody Reminder reminder) {
            return reminderService.createReminder(reminder);
        }

        /* PUT */
        @PutMapping("/{id}")
        public Reminder updateReminder(@PathVariable Long id, @Valid @RequestBody Reminder reminder) {
            return reminderService.updateReminder(id, reminder);
        }

        /* DELETE */
        @DeleteMapping("/{id}")
        public void deleteReminder(@PathVariable Long id) {
            reminderService.deleteReminder(id);
        }
}
