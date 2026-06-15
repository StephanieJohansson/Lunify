package se.stephanie.lifesync.todo;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import se.stephanie.lifesync.user.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class TodoTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    private LocalDateTime createdAt;

    private boolean completed;

    private boolean deleted;

    private boolean archived;

    private boolean pinned;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
