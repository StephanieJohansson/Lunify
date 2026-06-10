package se.stephanie.lifesync.todo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoTaskRepository extends JpaRepository<TodoTask, Long> {
}
