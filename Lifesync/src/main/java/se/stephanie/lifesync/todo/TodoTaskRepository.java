package se.stephanie.lifesync.todo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoTaskRepository extends JpaRepository<TodoTask, Long> {
    List<TodoTask> findByUserId(Long userId);

    List<TodoTask> findByCompletedFalse();

    List<TodoTask> findByCompletedTrue();

    long countByCompletedFalse();

    long countByCompletedTrue();

    long countByUserIdAndCompletedFalse(Long userId);

    long countByUserIdAndCompletedTrue(Long userId);

    List<TodoTask> findByUserIdAndCompletedTrue(Long userId);

    List<TodoTask> findByUserIdAndCompletedFalse(Long userId);
}
