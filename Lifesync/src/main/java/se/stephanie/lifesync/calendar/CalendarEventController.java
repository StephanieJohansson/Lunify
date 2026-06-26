package se.stephanie.lifesync.calendar;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import se.stephanie.lifesync.security.CurrentUserService;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class CalendarEventController {

    private final CalendarEventService service;
    private final CurrentUserService currentUserService;

    public CalendarEventController(CalendarEventService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    /* GET */

    @GetMapping
    public List<CalendarEvent> getAllEvents() {
        return service.getAllEvents(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/{id}")
    public CalendarEvent getEventById(@PathVariable Long id) {
        return service.getEventById(id);
    }

    @GetMapping("/categories")
    public EventCategory[] getCategories(){
        return EventCategory.values();
    }

    @GetMapping("/today")
    public List<CalendarEvent> getTodayEvents() {
        return service.getEventsForToday(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/week")
    public List<CalendarEvent> getWeekEvents() {
        return service.getEventsForCurrentWeek(currentUserService.getCurrentUser().getId());
    }

    /* POST */

    @PostMapping
    public CalendarEvent createEvent(@Valid @RequestBody CalendarEvent event) {
        return service.createEvent(event, currentUserService.getCurrentUser());
    }

    /* PUT */

    @PutMapping("/{id}")
    public CalendarEvent updateEvent(@PathVariable Long id, @Valid @RequestBody CalendarEvent updatedEvent) {
        return service.updateEvent(id, updatedEvent);
    }

    /* DELETE */

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        service.deleteEvent(id);
    }
}
