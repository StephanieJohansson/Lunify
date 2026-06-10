package se.stephanie.lifesync.calendar;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
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

    private String category;

    private boolean recurring;
}
