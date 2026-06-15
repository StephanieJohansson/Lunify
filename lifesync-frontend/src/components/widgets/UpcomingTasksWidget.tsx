import type { TodoTask } from "../../types/TodoTask";

type UpcomingTasksWidgetProps = {
    todos: TodoTask[];
    onComplete?: (todo: TodoTask) => void;
    onEdit?: (todo: TodoTask) => void;
    onDelete?: (id: number) => void;
};

export default function UpcomingTasksWidget({
                                                todos,
                                                onComplete,
                                                onEdit,
                                                onDelete,
                                            }: UpcomingTasksWidgetProps) {
    const visibleTodos = [...todos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);

    return (
        <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-white">
                Upcoming Tasks
            </h2>

            {visibleTodos.length === 0 ? (
                <p className="text-sm text-slate-400">
                    No upcoming tasks.
                </p>
            ) : (
                <div className="space-y-3">
                    {visibleTodos.map((todo) => (
                        <div
                            key={todo.id}
                            className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3"
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onComplete?.(todo)}
                                    className="h-4 w-4 rounded border border-slate-500 hover:border-violet-400"
                                />

                                <span className="text-sm text-slate-300">
                                    {todo.title}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit?.(todo)}
                                    className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-600 hover:text-white"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => onDelete?.(todo.id)}
                                    className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/30 hover:text-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}