package se.stephanie.lifesync.user;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /* GET */
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/name/{name}")
    public User getUserByName(@PathVariable String name) {
        return userService.getUserByName(name);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

        /* POST */
    @PostMapping
    public User createUser(@Valid @RequestBody User user) {
        return userService.createUser(user);
    }

    /* PUT */
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }

    /* DELETE */
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
