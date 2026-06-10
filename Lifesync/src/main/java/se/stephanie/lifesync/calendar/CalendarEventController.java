package se.stephanie.lifesync.calendar;


import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class CalendarEventController {

    private final CalendarEventService service;

    public CalendarEventController(CalendarEventService service) {
        this.service = service;
    }

    /* GET */

    @GetMapping
    public List<CalendarEvent> getAllEvents() {
        return service.getAllEvents();
    }

    @GetMapping("/{id}")
    public CalendarEvent getEventById(@PathVariable Long id) {
        return service.getEventById(id);
    }

    @GetMapping("/categories")
    public EventCategory[] getCategories(){
        return EventCategory.values();
    }

    /* POST */

    @PostMapping
    public CalendarEvent createEvent(@RequestBody CalendarEvent event) {
        return service.createEvent(event);
    }

    /* PUT */

    @PutMapping("/{id}")
    public CalendarEvent updateEvent(@PathVariable Long id, @RequestBody CalendarEvent updatedEvent) {
        return service.updateEvent(id, updatedEvent);
    }

    /* DELETE */

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        service.deleteEvent(id);
    }
}
