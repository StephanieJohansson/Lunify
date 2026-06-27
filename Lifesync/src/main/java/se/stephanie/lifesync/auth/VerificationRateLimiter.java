package se.stephanie.lifesync.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class VerificationRateLimiter {
    private static final int MAX_REQUESTS = 3;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<Long, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    public VerificationRateLimiter() {
        this(Clock.systemUTC());
    }

    VerificationRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void check(Long userId) {
        Instant now = clock.instant();
        windows.compute(userId, (key, current) -> {
            if (current == null || current.startedAt().plus(WINDOW).isBefore(now)) {
                return new Window(now, 1);
            }
            if (current.count() >= MAX_REQUESTS) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many verification requests");
            }
            return new Window(current.startedAt(), current.count() + 1);
        });

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(entry -> entry.getValue().startedAt().plus(WINDOW).isBefore(now));
        }
    }

    private record Window(Instant startedAt, int count) {
    }
}
