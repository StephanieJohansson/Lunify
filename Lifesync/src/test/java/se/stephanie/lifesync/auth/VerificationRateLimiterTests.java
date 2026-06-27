package se.stephanie.lifesync.auth;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class VerificationRateLimiterTests {
    @Test
    void blocksTheFourthRequestWithinTheWindow() {
        VerificationRateLimiter limiter = new VerificationRateLimiter(
                Clock.fixed(Instant.parse("2026-06-27T10:00:00Z"), ZoneOffset.UTC)
        );

        assertDoesNotThrow(() -> limiter.check(42L));
        assertDoesNotThrow(() -> limiter.check(42L));
        assertDoesNotThrow(() -> limiter.check(42L));
        assertThrows(ResponseStatusException.class, () -> limiter.check(42L));
    }

    @Test
    void limitsUsersIndependently() {
        VerificationRateLimiter limiter = new VerificationRateLimiter(
                Clock.fixed(Instant.parse("2026-06-27T10:00:00Z"), ZoneOffset.UTC)
        );

        limiter.check(1L);
        limiter.check(1L);
        limiter.check(1L);
        assertDoesNotThrow(() -> limiter.check(2L));
    }
}
