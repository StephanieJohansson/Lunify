import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CreateTodoModal from "../components/CreateTodoModal";
import {
    getPendingTodos,
    completeTodo,
    getCompletedTodos,
    createTodo,
} from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";
import type { Page } from "../App";

type TodosProps = {
    activePage: Page;
    onPageChange: (page: Page) => void;
};

export default function Todos({ activePage, onPageChange }: TodosProps) {
    const [pendingTodos, setPendingTodos] = useState<TodoTask[]>([]);
    const [completedTodos, setCompletedTodos] = useState<TodoTask[]>([]);
    const [showCreateTodo, setShowCreateTodo] = useState(false);

    useEffect(() => {
        getPendingTodos().then(setPendingTodos).catch(console.error);
        getCompletedTodos().then(setCompletedTodos).catch(console.error);
    }, []);

    function handleCompleteTodo(todo: TodoTask) {
        completeTodo(todo.id, todo)
            .then((updatedTodo) => {
                setPendingTodos((current) =>
                    current.filter((item) => item.id !== todo.id)
                );

                setCompletedTodos((current) => [updatedTodo, ...current]);
            })
            .catch(console.error);
    }

    function handleCreateTodo(title: string, description: string) {
        createTodo(title, description)
            .then((newTodo) => {
                setPendingTodos((current) => [newTodo, ...current]);
                setShowCreateTodo(false);
            })
            .catch(console.error);
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar activePage={activePage} onPageChange={onPageChange} />

            <main className="flex-1 p-6">
                <Header />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Pending Todos</h2>

                            <button
                                onClick={() => setShowCreateTodo(true)}
                                className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                            >
                                + New Todo
                            </button>
                        </div>

                        {pendingTodos.length === 0 ? (
                            <p className="text-slate-400">No pending todos yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="flex items-start gap-4 rounded-xl bg-slate-900/60 p-4"
                                    >
                                        <button
                                            onClick={() => handleCompleteTodo(todo)}
                                            className="mt-1 h-5 w-5 rounded-md border border-slate-500 hover:border-violet-400"
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

                    <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">Completed Todos</h2>

                        {completedTodos.length === 0 ? (
                            <p className="text-slate-400">No completed todos yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {completedTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="rounded-xl bg-slate-900/40 p-4 opacity-70"
                                    >
                                        <h3 className="font-medium text-white line-through">
                                            {todo.title}
                                        </h3>

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
                </div>
            </main>

            {showCreateTodo && (
                <CreateTodoModal
                    onClose={() => setShowCreateTodo(false)}
                    onSave={handleCreateTodo}
                />
            )}
        </div>
    );
}