package se.stephanie.lifesync.auth;

import se.stephanie.lifesync.user.User;

public record AuthUserResponse(
        Long id,
        String name,
        String email
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
