package se.stephanie.lifesync.calendar;

import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;
import se.stephanie.lifesync.user.User;
import se.stephanie.lifesync.user.UserRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;

    public CalendarEventService(CalendarEventRepository calendarEventRepository, UserRepository userRepository) {
        this.calendarEventRepository = calendarEventRepository;
        this.userRepository = userRepository;
    }

    public List<CalendarEvent> getEventsForCurrentWeek() {
        LocalDate today = LocalDate.now();

        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate sunday = today.with(DayOfWeek.SUNDAY);

        LocalDateTime startOfWeek = monday.atStartOfDay();
        LocalDateTime endOfWeek = sunday.atTime(23, 59, 59);

        return calendarEventRepository.findByStartDateTimeBetweenOrderByStartDateTimeAsc(
                startOfWeek,
                endOfWeek
        );
    }

    public List<CalendarEvent> getEventsForToday() {
        LocalDate today = LocalDate.now();

        return calendarEventRepository.findByStartDateTimeBetweenOrderByStartDateTimeAsc(
                today.atStartOfDay(),
                today.atTime(23, 59, 59)
        );
    }


    /* GET */

    public List<CalendarEvent> getAllEvents() {
        return calendarEventRepository.findAll();
    }

    public CalendarEvent getEventById(Long id) {
        return calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with id: " + id));
    }

    /* POST */

    public CalendarEvent createEvent(CalendarEvent event) {
        Long defaultUserId = 1L;

        User user = userRepository.findById(defaultUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Default user not found with id: " + defaultUserId
                ));

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
