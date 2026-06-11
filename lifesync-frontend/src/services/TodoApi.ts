import type { TodoTask } from "../types/TodoTask";

export async function getPendingTodos(): Promise<TodoTask[]> {
    const response = await fetch("http://localhost:8080/api/todos/pending");

    if (!response.ok) {
        throw new Error("Failed to fetch todos");
    }

    return response.json();
}

export async function createTodo(
    title: string,
    description: string){
    const response = await fetch(
        "http://localhost:8080/api/todos",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                description,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create todo");
    }
}

export async function completeTodo(todoId: number, todo: TodoTask): Promise<TodoTask> {
    const response = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...todo,
            completed: true,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to complete todo");
    }

    return response.json();
}
