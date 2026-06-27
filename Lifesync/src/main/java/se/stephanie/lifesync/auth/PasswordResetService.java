package se.stephanie.lifesync.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;
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
public class PasswordResetService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetService.class);
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${lifesync.mail.from:}") private String fromAddress;
    @Value("${spring.mail.host:}") private String mailHost;
    @Value("${lifesync.client-url:http://localhost:5173}") private String clientUrl;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository, UserRepository userRepository,
                                PasswordEncoder passwordEncoder, ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    @Transactional
    @Async("mailTaskExecutor")
    public void requestReset(String email) {
        userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).ifPresent(this::createAndSend);
    }

    private void createAndSend(User user) {
        if (mailSender == null || mailHost.isBlank() || fromAddress.isBlank()) {
            LOGGER.warn("Password reset requested while email delivery is not configured");
            return;
        }
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String rawToken = HexFormat.of().formatHex(bytes);

        tokenRepository.deleteByUser(user);
        tokenRepository.flush();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        tokenRepository.save(token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Reset your Lunify password");
        message.setText("Open this link to choose a new password (valid for 30 minutes):\n\n"
                + clientUrl + "/#reset-password=" + rawToken);
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            LOGGER.error("Password reset email delivery failed", exception);
            throw exception;
        }
    }

    @Transactional
    public void reset(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset link"));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link has expired");
        }
        User user = token.getUser();
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setSessionVersion(user.getSessionVersion() + 1);
        userRepository.save(user);
        tokenRepository.delete(token);
    }

    public String opaqueRateLimitKey(String email, String remoteAddress) {
        return hash(email.trim().toLowerCase() + "|" + remoteAddress);
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
