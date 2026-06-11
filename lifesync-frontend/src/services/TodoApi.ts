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
    description: string
): Promise<TodoTask> {
    const response = await fetch("http://localhost:8080/api/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            description,
            completed: false,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to create todo");
    }

    return response.json();
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

export async function getCompletedTodos(): Promise<TodoTask[]> {
    const response = await fetch("http://localhost:8080/api/todos/completed");

    if (!response.ok) {
        throw new Error("Failed to fetch completed todos");
    }

    return response.json();
}

export async function deleteTodo(todoId: number): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete todo");
    }
}

export async function restoreTodo(todoId: number, todo: TodoTask): Promise<TodoTask> {
    const response = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...todo,
            completed: false,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to restore todo");
    }

    return response.json();
}

export async function updateTodo(todo: TodoTask): Promise<TodoTask> {
    const response = await fetch(`http://localhost:8080/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    });

    if (!response.ok) {
        throw new Error("Failed to update todo");
    }

    return response.json();
}