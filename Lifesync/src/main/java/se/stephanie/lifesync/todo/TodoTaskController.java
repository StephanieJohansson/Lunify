package se.stephanie.lifesync.todo;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import se.stephanie.lifesync.user.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoTaskController {

    private final TodoTaskService todoTaskService;
    private final TodoTaskRepository todoTaskRepository;
    private final UserRepository userRepository;

    public TodoTaskController(TodoTaskService todoTaskService, TodoTaskRepository todoTaskRepository, UserRepository userRepository) {

        this.todoTaskService = todoTaskService;
        this.todoTaskRepository = todoTaskRepository;
        this.userRepository = userRepository;
    }

    /* GET */
    @GetMapping
    public List<TodoTask> getAllTodoTasks() {

        return todoTaskService.getAllTodoTasks();
    }

    @GetMapping("/pending")
    public List<TodoTask> getPendingTodoTasks() {
        Long userId = 1L;
        return todoTaskRepository.findByUserIdAndCompletedFalse(userId);
    }

    @GetMapping("/completed")
    public List<TodoTask> getCompletedTodoTasks() {
        Long userId = 1L;
        return todoTaskRepository.findByUserIdAndCompletedTrue(userId);
    }

    @GetMapping("/pending/count")
    public long getPendingTodoTaskCount() {
        return todoTaskService.countPendingTodoTask();
    }

    @GetMapping("/completed/count")
    public long getCompletedTodoTaskCount() {
        return todoTaskService.countCompletedTodoTask();
    }

    @GetMapping("/{id}")
    public TodoTask getTodoTaskById(@PathVariable Long id) {

        return todoTaskService.getTodoTaskById(id);
    }

    /* POST */

    @PostMapping
    public TodoTask createTask(@Valid @RequestBody TodoTask todoTask) {
        return todoTaskService.createTodoTask(todoTask);
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
}
