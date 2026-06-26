package se.stephanie.lifesync.calendar;

import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;
import se.stephanie.lifesync.user.User;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;

    public CalendarEventService(CalendarEventRepository calendarEventRepository) {
        this.calendarEventRepository = calendarEventRepository;
    }

    public List<CalendarEvent> getEventsForCurrentWeek(Long userId) {
        LocalDate today = LocalDate.now();

        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate sunday = today.with(DayOfWeek.SUNDAY);

        LocalDateTime startOfWeek = monday.atStartOfDay();
        LocalDateTime endOfWeek = sunday.atTime(23, 59, 59);

        return calendarEventRepository.findByUserIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                userId,
                startOfWeek,
                endOfWeek
        );
    }

    public List<CalendarEvent> getEventsForToday(Long userId) {
        LocalDate today = LocalDate.now();

        return calendarEventRepository.findByUserIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                userId,
                today.atStartOfDay(),
                today.atTime(23, 59, 59)
        );
    }


    /* GET */

    public List<CalendarEvent> getAllEvents(Long userId) {
        return calendarEventRepository.findByUserIdOrderByStartDateTimeAsc(userId);
    }

    public CalendarEvent getEventById(Long id) {
        return calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with id: " + id));
    }

    /* POST */

    public CalendarEvent createEvent(CalendarEvent event, User user) {
        event.setUser(user);

        return calendarEventRepository.save(event);
    }

    /* UPDATE */

    public CalendarEvent updateEvent(Long id, CalendarEvent updatedEvent) {
        CalendarEvent existingEvent = getEventById(id);

        existingEvent.setTitle(updatedEvent.getTitle());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setLocation(updatedEvent.getLocation());
        existingEvent.setStartDateTime(updatedEvent.getStartDateTime());
        existingEvent.setEndDateTime(updatedEvent.getEndDateTime());
        existingEvent.setAllDay(updatedEvent.isAllDay());
        existingEvent.setCategory(updatedEvent.getCategory());
        existingEvent.setRecurring(updatedEvent.isRecurring());

        return calendarEventRepository.save(existingEvent);
    }

    /* DELETE */

    public void deleteEvent(Long id) {
        calendarEventRepository.deleteById(id);
    }
}
