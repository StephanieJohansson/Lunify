import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getPendingTodos } from "../services/TodoApi";
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
                                    className="rounded-xl bg-slate-900/60 p-4"
                                >
                                    <p className="font-medium">{todo.title}</p>
                                    {todo.description && (
                                        <p className="mt-1 text-sm text-slate-400">
                                            {todo.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}