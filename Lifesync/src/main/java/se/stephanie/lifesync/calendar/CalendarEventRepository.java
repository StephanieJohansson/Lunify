package se.stephanie.lifesync.calendar;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarEventRepository
        extends JpaRepository<CalendarEvent, Long> {
}