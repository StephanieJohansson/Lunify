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

    @GetMapping
    public List<TodoTask> getAllTodoTasks() {
        return todoTaskService.getAllTodoTasks();
    }

    @GetMapping("/{id}")
    public TodoTask getTodoTaskById(@PathVariable Long id) {
        return todoTaskService.getTodoTaskById(id);
    }

    @PostMapping
    public TodoTask createTask(@Valid @RequestBody TodoTask todoTask) {
        return todoTaskService.createTodoTask(todoTask);
    }

    @PutMapping("/{id}")
    public TodoTask updateTodoTask(@PathVariable Long id, @Valid @RequestBody TodoTask todoTask) {
        return todoTaskService.updateTodoTask(id, todoTask);
    }

    @DeleteMapping("/{id}")
    public void deleteTodoTask(@PathVariable Long id) {
        todoTaskService.deleteTodoTask(id);
    }
}
