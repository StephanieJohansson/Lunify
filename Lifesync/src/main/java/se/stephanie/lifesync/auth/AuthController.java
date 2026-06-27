package se.stephanie.lifesync.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import se.stephanie.lifesync.security.CurrentUserService;
import se.stephanie.lifesync.security.UserPrincipal;
import se.stephanie.lifesync.user.User;
import se.stephanie.lifesync.user.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    private final VerificationRateLimiter verificationRateLimiter;
    private final PasswordResetService passwordResetService;
    private final PasswordResetRateLimiter passwordResetRateLimiter;

    public AuthController(
            AuthenticationManager authenticationManager,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            EmailVerificationService emailVerificationService,
            VerificationRateLimiter verificationRateLimiter,
            PasswordResetService passwordResetService,
            PasswordResetRateLimiter passwordResetRateLimiter
    ) {
        this.authenticationManager = authenticationManager;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.emailVerificationService = emailVerificationService;
        this.verificationRateLimiter = verificationRateLimiter;
        this.passwordResetService = passwordResetService;
        this.passwordResetRateLimiter = passwordResetRateLimiter;
    }

    @PostMapping("/register")
    public AuthUserResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);

        userRepository.save(user);

        authenticateSession(email, request.password(), servletRequest);

        return AuthUserResponse.from(user);
    }

    @PostMapping("/login")
    public AuthUserResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        Authentication authentication = authenticateSession(request.email(), request.password(), servletRequest);
        if (!(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authenticated user");
        }
        User user = principal.user();

        return AuthUserResponse.from(user);
    }

    @GetMapping("/me")
    public AuthUserResponse me() {
        return AuthUserResponse.from(currentUserService.getCurrentUser());
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }
    }

    @PostMapping("/change-password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserService.getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setSessionVersion(user.getSessionVersion() + 1);
        userRepository.save(user);
    }

    @PostMapping("/email-verification")
    public void sendEmailVerification() {
        User user = currentUserService.getCurrentUser();
        verificationRateLimiter.check(user.getId());
        emailVerificationService.sendVerification(user);
    }

    @PostMapping("/verify-email")
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verify(request.token());
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest servletRequest) {
        String key = passwordResetService.opaqueRateLimitKey(request.email(), servletRequest.getRemoteAddr());
        if (!passwordResetRateLimiter.allow(key)) return;

        try {
            passwordResetService.requestReset(request.email());
        } catch (RuntimeException exception) {
            // Keep the public response identical so account existence and provider state are never disclosed.
            LOGGER.error("Password reset request could not be processed", exception);
        }
    }

    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.reset(request.token(), request.newPassword());
    }

    private Authentication authenticateSession(String email, String password, HttpServletRequest servletRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession existingSession = servletRequest.getSession(false);
        if (existingSession != null) {
            servletRequest.changeSessionId();
        }
        HttpSession session = servletRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return authentication;
    }
}
