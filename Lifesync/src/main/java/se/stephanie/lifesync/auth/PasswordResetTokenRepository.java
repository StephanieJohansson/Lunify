package se.stephanie.lifesync.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import se.stephanie.lifesync.user.User;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void deleteByUser(User user);
}
