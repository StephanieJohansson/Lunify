package se.stephanie.lifesync.auth;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PasswordResetRateLimiter {
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_REQUESTS = 3;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    public PasswordResetRateLimiter() {
        this(Clock.systemUTC());
    }

    PasswordResetRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public boolean allow(String opaqueKey) {
        Instant now = clock.instant();
        boolean[] allowed = { true };
        windows.compute(opaqueKey, (key, current) -> {
            if (current == null || current.startedAt().plus(WINDOW).isBefore(now)) return new Window(now, 1);
            if (current.count() >= MAX_REQUESTS) {
                allowed[0] = false;
                return current;
            }
            return new Window(current.startedAt(), current.count() + 1);
        });
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(entry -> entry.getValue().startedAt().plus(WINDOW).isBefore(now));
        }
        return allowed[0];
    }

    private record Window(Instant startedAt, int count) {}
}
