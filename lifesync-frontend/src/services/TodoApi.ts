import type { TodoTask } from "../types/TodoTask";

export async function getPendingTodos(): Promise<TodoTask[]> {
    const response = await fetch("http://localhost:8080/api/todos/pending");

    if (!response.ok) {
        throw new Error("Failed to fetch todos");
    }

    return response.json();
}