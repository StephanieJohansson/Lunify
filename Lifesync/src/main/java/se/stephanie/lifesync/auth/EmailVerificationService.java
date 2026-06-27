package se.stephanie.lifesync.auth;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import se.stephanie.lifesync.user.User;
import se.stephanie.lifesync.user.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Service
public class EmailVerificationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailVerificationService.class);
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${lifesync.mail.from:}")
    private String fromAddress;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${lifesync.client-url:http://localhost:5173}")
    private String clientUrl;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    @Transactional
    public void sendVerification(User user) {
        if (user.isEmailVerified()) {
            return;
        }
        if (mailSender == null || mailHost.isBlank() || fromAddress.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email delivery is not configured");
        }

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String rawToken = HexFormat.of().formatHex(bytes);

        tokenRepository.deleteByUser(user);
        tokenRepository.flush();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        tokenRepository.save(token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Verify your Lunify email");
        message.setText("Confirm your email address by opening this link (valid for 24 hours):\n\n"
                + clientUrl + "/#verify-email=" + rawToken);
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            Throwable rootCause = exception;
            while (rootCause.getCause() != null) rootCause = rootCause.getCause();
            LOGGER.error("Verification email delivery failed: {}: {}",
                    rootCause.getClass().getSimpleName(), rootCause.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Email delivery failed", exception);
        }
    }

    @Transactional
    public void verify(String rawToken) {
        EmailVerificationToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification link"));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link has expired");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
