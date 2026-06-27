package se.stephanie.lifesync.auth;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordResetRateLimiterTests {
    @Test
    void silentlyRejectsTheFourthRequestForTheSameOpaqueKey() {
        PasswordResetRateLimiter limiter = new PasswordResetRateLimiter(
                Clock.fixed(Instant.parse("2026-06-27T10:00:00Z"), ZoneOffset.UTC)
        );

        assertTrue(limiter.allow("opaque-key"));
        assertTrue(limiter.allow("opaque-key"));
        assertTrue(limiter.allow("opaque-key"));
        assertFalse(limiter.allow("opaque-key"));
        assertTrue(limiter.allow("different-key"));
    }
}
