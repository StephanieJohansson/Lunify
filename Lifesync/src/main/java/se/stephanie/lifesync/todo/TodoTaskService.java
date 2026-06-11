package se.stephanie.lifesync.todo;


import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;
import se.stephanie.lifesync.user.User;
import se.stephanie.lifesync.user.UserRepository;

import java.util.List;

@Service
public class TodoTaskService {

    private final TodoTaskRepository todoTaskRepository;
    private final UserRepository userRepository;

    public TodoTaskService(TodoTaskRepository todoTaskRepository, UserRepository userRepository) {
        this.todoTaskRepository = todoTaskRepository;
        this.userRepository = userRepository;
    }

    /* GET */
    public List<TodoTask> getAllTodoTasks() {

        return todoTaskRepository.findAll();
    }

    public TodoTask getTodoTaskById(Long id) {

        return todoTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Todo task not found with id: " + id));
    }

    public List<TodoTask> getPendingTodoTask() {
        return todoTaskRepository.findByCompletedFalse();
    }

    public List<TodoTask> getCompletedTodoTask() {
        return todoTaskRepository.findByCompletedTrue();
    }

    public long countPendingTodoTask() {
        return todoTaskRepository.countByCompletedFalse();
    }

    public long countCompletedTodoTask() {
        return todoTaskRepository.countByCompletedTrue();
    }


    /* POST */
    public TodoTask createTodoTask(TodoTask task) {
        Long userId = 1L; // TODO: Replace with authenticated user from Spring Security

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        task.setUser(user);
        task.setCompleted(false);

        return todoTaskRepository.save(task);
    }

    /* PUT */

    public TodoTask updateTodoTask(Long id, TodoTask task) {
        TodoTask existingTask = getTodoTaskById(id);

        if (existingTask != null) {
            existingTask.setTitle(task.getTitle());
            existingTask.setDescription(task.getDescription());
            existingTask.setCompleted(task.isCompleted());
            return todoTaskRepository.save(existingTask);
        }
        return null;
    }

    /* DELETE */
    public void deleteTodoTask(Long id) {

        todoTaskRepository.deleteById(id);
    }

}
