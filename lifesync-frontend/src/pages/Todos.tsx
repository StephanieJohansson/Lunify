import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getPendingTodos, completeTodo } from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";

import type { Page } from "../App";

type TodosProps = {
    activePage: Page;
    onPageChange: (page: Page) => void;
};

export default function Todos({ activePage, onPageChange }: TodosProps) {
    const [todos, setTodos] = useState<TodoTask[]>([]);

    useEffect(() => {
        getPendingTodos()
            .then(setTodos)
            .catch(console.error);
    }, []);

    function handleCompleteTodo(todo: TodoTask) {
        completeTodo(todo.id, todo)
            .then(() => {
                setTodos((currentTodos) =>
                    currentTodos.filter((currentTodo) => currentTodo.id !== todo.id)
                );
            })
            .catch(console.error);
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar activePage={activePage} onPageChange={onPageChange} />

            <main className="flex-1 p-6">
                <Header />

                <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
                    <h2 className="mb-4 text-xl font-semibold">Todos</h2>

                    {todos.length === 0 ? (
                        <p className="text-slate-400">No pending todos yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {todos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-start gap-4 rounded-xl bg-slate-900/60 p-4"
                                >
                                    <button
                                        onClick={() => handleCompleteTodo(todo)}
                                        className="mt-1 h-5 w-5 rounded-md border border-slate-500 hover:border-violet-400"
                                        aria-label="Complete todo"
                                    />

                                    <div>
                                        <h3 className="font-medium text-white">{todo.title}</h3>

                                        {todo.description && (
                                            <p className="mt-1 text-sm text-slate-400">
                                                {todo.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}