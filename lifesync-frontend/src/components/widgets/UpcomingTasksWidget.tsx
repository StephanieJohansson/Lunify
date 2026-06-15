import type { TodoTask } from "../../types/TodoTask";

type UpcomingTasksWidgetProps = {
    todos: TodoTask[];
    onComplete?: (todo: TodoTask) => void;
    onEdit?: (todo: TodoTask) => void;
    onDelete?: (id: number) => void;
};

function isCreatedThisWeek(createdAt?: string) {
    if (!createdAt) return false;

    const createdDate = new Date(createdAt);
    const today = new Date();

    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    return createdDate >= startOfWeek;
}

export default function UpcomingTasksWidget({
                                                todos,
                                                onComplete,
                                                onEdit,
                                                onDelete,
                                            }: UpcomingTasksWidgetProps) {
    const sortedTodos = [...todos].sort((a, b) => b.id - a.id);

    const thisWeekTodos = sortedTodos.filter((todo) =>
        isCreatedThisWeek(todo.createdAt)
    );

    const unfinishedPreviousTodos = sortedTodos.filter((todo) =>
        !isCreatedThisWeek(todo.createdAt)
    );

    const renderTodo = (todo: TodoTask) => (
        <div
            key={todo.id}
            className="rounded-xl bg-slate-900/60 p-3 transition hover:bg-slate-900/80"
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onComplete?.(todo)}
                    className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-500 transition hover:border-violet-400 hover:bg-violet-500/20"
                    aria-label="Complete todo"
                >
                    <span className="h-2 w-2 rounded-full bg-transparent" />
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200">
                        {todo.title}
                    </p>

                    {todo.description && (
                        <p className="mt-1 text-xs text-slate-500">
                            {todo.description}
                        </p>
                    )}

                    <div className="mt-3 flex gap-2">
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
            </div>
        </div>
    );

    return (
        <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-white">
                Upcoming Tasks
            </h2>

            {thisWeekTodos.length === 0 && unfinishedPreviousTodos.length === 0 ? (
                <p className="text-sm text-slate-400">No upcoming tasks.</p>
            ) : (
                <div className="space-y-5">
                    <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-300">
                            This week
                        </h3>

                        {thisWeekTodos.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No todos added this week.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {thisWeekTodos.map(renderTodo)}
                            </div>
                        )}
                    </div>

                    {unfinishedPreviousTodos.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-shadow-violet-300">
                                Unfinished todos from previous weeks
                            </h3>

                            <div className="space-y-3">
                                {unfinishedPreviousTodos.map(renderTodo)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}