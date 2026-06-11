package se.stephanie.lifesync.payment;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import se.stephanie.lifesync.user.User;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDate dueDate;

    private boolean paid;

    private boolean recurring;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
