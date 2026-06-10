package se.stephanie.lifesync.calendar;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;

    public CalendarEventService(CalendarEventRepository calendarEventRepository) {
        this.calendarEventRepository = calendarEventRepository;
    }



    /* GET */

    public List<CalendarEvent> getAllEvents() {
        return calendarEventRepository.findAll();
    }

    public CalendarEvent getEventById(Long id) {
        return calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    /* POST */

    public CalendarEvent createEvent(CalendarEvent event) {
        if (!event.isAllDay() && event.getStartDateTime().isAfter(event.getEndDateTime())) {
            throw new IllegalArgumentException("Start date/time must be before end date/time for non-all-day events.");
        }

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
