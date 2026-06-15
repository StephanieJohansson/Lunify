package se.stephanie.lifesync.calendar;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository
        extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByStartDateTimeBetweenOrderByStartDateTimeAsc(
            @NotNull LocalDateTime startDateTime, @NotNull LocalDateTime startDateTime2
    );
}