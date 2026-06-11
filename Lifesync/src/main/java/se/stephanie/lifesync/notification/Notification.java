package se.stephanie.lifesync.notification;

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
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String message;

    @NotNull
    private LocalDateTime notifyAt;

    private boolean sent;

    private boolean read;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
