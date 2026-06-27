import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CreateTodoModal from "../components/CreateTodoModal";
import {
    getPendingTodos,
    completeTodo,
    getCompletedTodos,
    createTodo,
    deleteTodo,
    restoreTodo,
    updateTodo,
    clearCompletedTodos,
} from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";
import type { Page, SettingsSection } from "../App";
import type { AuthUser } from "../types/AuthUser";

type TodosProps = {
    activePage: Page;
    currentUser: AuthUser;
    onCreateEvent: () => void;
    onCreatePackage: () => void;
    onLogout: () => void;
    onOpenSettings: (section: SettingsSection) => void;
    onPageChange: (page: Page) => void;
};

export default function Todos({
    activePage,
    currentUser,
    onCreateEvent,
    onCreatePackage,
    onLogout,
    onOpenSettings,
    onPageChange,
}: TodosProps) {
    const [pendingTodos, setPendingTodos] = useState<TodoTask[]>([]);
    const [completedTodos, setCompletedTodos] = useState<TodoTask[]>([]);
    const [showCreateTodo, setShowCreateTodo] = useState(false);
    const [todoToEdit, setTodoToEdit] = useState<TodoTask | null>(null);

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

    function handleClearCompletedTodos() {
        clearCompletedTodos()
            .then(() => setCompletedTodos([]))
            .catch(console.error);
    }

    function handleRestoreTodo(todo: TodoTask) {
        restoreTodo(todo.id, todo)
            .then((updatedTodo) => {
                setCompletedTodos((current) =>
                    current.filter((item) => item.id !== todo.id)
                );

                setPendingTodos((current) => [updatedTodo, ...current]);
            })
            .catch(console.error);
    }

    function handleUpdateTodo(title: string, description: string) {
        if (!todoToEdit) {
            return;
        }

        const updatedTodo: TodoTask = {
            ...todoToEdit,
            title,
            description,
        };

        updateTodo(updatedTodo)
            .then((savedTodo) => {
                setPendingTodos((current) =>
                    current.map((todo) =>
                        todo.id === savedTodo.id ? savedTodo : todo
                    )
                );

                setTodoToEdit(null);
            })
            .catch(console.error);
    }

    const handleDeleteTodo = async (id: number) => {
        await deleteTodo(id);

        setPendingTodos((current) =>
            current.filter((todo) => todo.id !== id)
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar
                activePage={activePage}
                currentUser={currentUser}
                onPageChange={onPageChange}
            />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
                <Header
                    currentUser={currentUser}
                    onCreateEvent={onCreateEvent}
                    onCreatePackage={onCreatePackage}
                    onLogout={onLogout}
                    onOpenSettings={onOpenSettings}
                />

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
                    <section className="flex min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Pending Todos</h2>

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
                            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                                {pendingTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="flex items-start justify-between gap-4 rounded-xl bg-slate-900/60 p-4"
                                    >
                                        <div className="flex items-start gap-4">
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

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setTodoToEdit(todo)}
                                                className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-600 hover:text-white"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/30 hover:text-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="flex min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Completed Todos</h2>

                            <button
                                onClick={handleClearCompletedTodos}
                                className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-600 hover:text-white"
                            >
                                Clear history
                            </button>
                        </div>
                        {completedTodos.length === 0 ? (
                            <p className="text-slate-400">No completed todos yet.</p>
                        ) : (
                            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                                {completedTodos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-900/40 p-4 opacity-80"
                                    >
                                        <div>
                                            <h3 className="font-medium text-white line-through">
                                                {todo.title}
                                            </h3>

                                            {todo.description && (
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {todo.description}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleRestoreTodo(todo)}
                                            className="rounded-full bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/30 hover:text-violet-200"
                                        >
                                            Restore
                                        </button>
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
            {todoToEdit && (
                <CreateTodoModal
                    mode="edit"
                    todo={todoToEdit}
                    onClose={() => setTodoToEdit(null)}
                    onSave={handleUpdateTodo}
                />
            )}
        </div>
    );
}
