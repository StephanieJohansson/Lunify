package se.stephanie.lifesync.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank @Size(max = 128) String token,
        @Size(min = 8, max = 128) String newPassword
) {
}
