package se.stephanie.lifesync.calendar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private boolean allDay;

    private String description;

    private String location;

    @Enumerated(EnumType.STRING)
    private EventCategory category;

    private boolean recurring;
}
