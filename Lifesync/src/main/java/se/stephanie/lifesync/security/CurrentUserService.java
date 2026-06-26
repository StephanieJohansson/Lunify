package se.stephanie.lifesync.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;
import se.stephanie.lifesync.user.User;
import se.stephanie.lifesync.user.UserRepository;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.user();
        }

        String email = authentication == null ? null : authentication.getName();

        return userRepository.findByEmailIgnoreCase(email == null ? "" : email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found"));
    }
}
