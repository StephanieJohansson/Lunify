package se.stephanie.lifesync.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "app_user", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    private String passwordHash;

    private String phoneNumber;

    private boolean active;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified;

    @Column(nullable = false, columnDefinition = "bigint default 0")
    private long sessionVersion;
}
