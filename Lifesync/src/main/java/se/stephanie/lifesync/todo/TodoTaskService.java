package se.stephanie.lifesync.todo;


import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoTaskService {

    private final TodoTaskRepository todoTaskRepository;

    public TodoTaskService(TodoTaskRepository todoTaskRepository) {
        this.todoTaskRepository = todoTaskRepository;
    }

    /* GET */
    public List<TodoTask> getAllTodoTasks() {

        return todoTaskRepository.findAll();
    }

    public TodoTask getTodoTaskById(Long id) {

        return todoTaskRepository.findById(id).orElse(null);
    }


    /* POST */
    public TodoTask createTodoTask(TodoTask task) {

        return todoTaskRepository.save(task);
    }

    /* PUT */

    public TodoTask updateTodoTask(Long id, TodoTask task) {
        TodoTask existingTask = todoTaskRepository.findById(id).orElse(null);
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
