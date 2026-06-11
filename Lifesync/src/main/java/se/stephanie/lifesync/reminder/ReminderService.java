package se.stephanie.lifesync.reminder;

import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderService(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

        /* GET */
    public List<Reminder> getAllReminders() {
        return reminderRepository.findAll();
    }

    public Reminder getReminderById(Long id) {
        return reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));
    }

        /* POST */
    public Reminder createReminder(Reminder reminder) {
        return reminderRepository.save(reminder);
    }

        /* PUT */
        public Reminder updateReminder(Long id, Reminder reminder) {
            Reminder existingReminder = getReminderById(id);

            existingReminder.setTitle(reminder.getTitle());
            existingReminder.setDescription(reminder.getDescription());
            existingReminder.setReminderTime(reminder.getReminderTime());
            existingReminder.setCompleted(reminder.isCompleted());
            existingReminder.setRecurring(reminder.isRecurring());

            return reminderRepository.save(existingReminder);
        }

        /* DELETE */
    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }
}
