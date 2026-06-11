package se.stephanie.lifesync.todo;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoTaskController {

    private final TodoTaskService todoTaskService;

    public TodoTaskController(TodoTaskService todoTaskService) {

        this.todoTaskService = todoTaskService;
    }

    /* GET */
    @GetMapping
    public List<TodoTask> getAllTodoTasks() {

        return todoTaskService.getAllTodoTasks();
    }

    @GetMapping("/pending")
    public List<TodoTask> getPendingTodoTasks() {
        return todoTaskService.getPendingTodoTask();
    }

    @GetMapping("/completed")
    public List<TodoTask> getCompletedTodoTasks() {
        return todoTaskService.getCompletedTodoTask();
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
