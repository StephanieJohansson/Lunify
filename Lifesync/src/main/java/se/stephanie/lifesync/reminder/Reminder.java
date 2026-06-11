package se.stephanie.lifesync.reminder;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import se.stephanie.lifesync.user.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime reminderTime;

    private boolean completed;

    private boolean recurring;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
