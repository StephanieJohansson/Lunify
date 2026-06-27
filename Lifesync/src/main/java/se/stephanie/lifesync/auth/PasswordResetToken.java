package se.stephanie.lifesync.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import se.stephanie.lifesync.user.User;

import java.time.Instant;

@Entity
@Table(name = "password_reset_token")
@Getter
@Setter
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private Instant expiresAt;
}
