package se.stephanie.lifesync.todo;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import se.stephanie.lifesync.security.CurrentUserService;
import se.stephanie.lifesync.user.User;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoTaskController {

    private final TodoTaskService todoTaskService;
    private final CurrentUserService currentUserService;

    public TodoTaskController(TodoTaskService todoTaskService, CurrentUserService currentUserService) {

        this.todoTaskService = todoTaskService;
        this.currentUserService = currentUserService;
    }

    /* GET */
    @GetMapping
    public List<TodoTask> getAllTodoTasks() {
        return todoTaskService.getAllTodoTasks(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/pending")
    public List<TodoTask> getPendingTodoTasks() {
        return todoTaskService.getPendingTodoTask(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/completed")
    public List<TodoTask> getCompletedTodoTasks() {
        return todoTaskService.getCompletedTodoTask(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/pending/count")
    public long getPendingTodoTaskCount() {
        return todoTaskService.countPendingTodoTask(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/completed/count")
    public long getCompletedTodoTaskCount() {
        return todoTaskService.countCompletedTodoTask(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/{id}")
    public TodoTask getTodoTaskById(@PathVariable Long id) {

        return todoTaskService.getTodoTaskById(id);
    }

    /* POST */

    @PostMapping
    public TodoTask createTask(@Valid @RequestBody TodoTask todoTask) {
        User user = currentUserService.getCurrentUser();
        return todoTaskService.createTodoTask(todoTask, user);
    }

    /* PUT */

    @PutMapping("/{id}")
    public TodoTask updateTodoTask(@PathVariable Long id, @Valid @RequestBody TodoTask todoTask) {
        return todoTaskService.updateTodoTask(id, todoTask);
    }

    /* DELETE */

    @DeleteMapping("/{id}")
    public void deleteTodoTask(@PathVariable Long id) {
        todoTaskService.deleteTodoTask(id);
    }

    @DeleteMapping("/completed")
    public void clearCompletedTodoTasks() {
        todoTaskService.clearCompletedTodoTasks(currentUserService.getCurrentUser().getId());
    }
}
