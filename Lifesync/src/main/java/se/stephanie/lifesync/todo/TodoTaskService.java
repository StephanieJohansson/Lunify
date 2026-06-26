package se.stephanie.lifesync.todo;


import org.springframework.stereotype.Service;
import se.stephanie.lifesync.common.exception.ResourceNotFoundException;
import se.stephanie.lifesync.user.User;

import java.util.List;

@Service
public class TodoTaskService {

    private final TodoTaskRepository todoTaskRepository;

    public TodoTaskService(TodoTaskRepository todoTaskRepository) {
        this.todoTaskRepository = todoTaskRepository;
    }

    /* GET */
    public List<TodoTask> getAllTodoTasks(Long userId) {
        return todoTaskRepository.findByUserId(userId);
    }

    public TodoTask getTodoTaskById(Long id) {

        return todoTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Todo task not found with id: " + id));
    }

    public List<TodoTask> getPendingTodoTask(Long userId) {
        return todoTaskRepository.findByUserIdAndCompletedFalse(userId);
    }

    public List<TodoTask> getCompletedTodoTask(Long userId) {
        return todoTaskRepository.findByUserIdAndCompletedTrue(userId);
    }

    public long countPendingTodoTask(Long userId) {
        return todoTaskRepository.countByUserIdAndCompletedFalse(userId);
    }

    public long countCompletedTodoTask(Long userId) {
        return todoTaskRepository.countByUserIdAndCompletedTrue(userId);
    }


    /* POST */
    public TodoTask createTodoTask(TodoTask task, User user) {
        task.setUser(user);
        task.setCompleted(false);

        return todoTaskRepository.save(task);
    }

    /* PUT */

    public TodoTask updateTodoTask(Long id, TodoTask task) {
        TodoTask existingTask = getTodoTaskById(id);

        existingTask.setTitle(task.getTitle());
        existingTask.setDescription(task.getDescription());
        existingTask.setCompleted(task.isCompleted());
        return todoTaskRepository.save(existingTask);
    }

    /* DELETE */
    public void deleteTodoTask(Long id) {

        todoTaskRepository.deleteById(id);
    }

    public void clearCompletedTodoTasks(Long userId) {
        List<TodoTask> completedTodos = todoTaskRepository.findByUserIdAndCompletedTrue(userId);

        todoTaskRepository.deleteAll(completedTodos);
    }

}
