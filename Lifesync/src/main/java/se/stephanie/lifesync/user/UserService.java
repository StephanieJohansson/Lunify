package se.stephanie.lifesync.user;


import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User getUserByName(String name) {
        return userRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with name: " + name));
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(updatedUser.getName());
                    user.setEmail(updatedUser.getEmail());
                    user.setPhoneNumber(updatedUser.getPhoneNumber());
                    user.setActive(updatedUser.isActive());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
