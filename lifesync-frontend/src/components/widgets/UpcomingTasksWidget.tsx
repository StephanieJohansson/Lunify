import type { TodoTask } from "../../types/TodoTask";

type UpcomingTasksWidgetProps = {
    todos: TodoTask[];
    onComplete?: (todo: TodoTask) => void;
    onShowAll?: () => void;
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
                                                onShowAll,
                                            }: UpcomingTasksWidgetProps) {
    const sortedTodos = [...todos].sort((a, b) => b.id - a.id);

    const thisWeekTodos = sortedTodos.filter((todo) =>
        isCreatedThisWeek(todo.createdAt)
    );

    const unfinishedPreviousTodos = sortedTodos.filter((todo) =>
        !isCreatedThisWeek(todo.createdAt)
    );
    const visibleTodos = [...thisWeekTodos, ...unfinishedPreviousTodos].slice(0, 3);
    const hiddenTodoCount = sortedTodos.length - visibleTodos.length;

    const renderTodo = (todo: TodoTask) => (
        <div
            key={todo.id}
            className="rounded-xl bg-slate-900/50 px-3 py-2 transition hover:bg-slate-900/80"
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onComplete?.(todo)}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-500 transition hover:border-violet-400 hover:bg-violet-500/20"
                    aria-label="Complete todo"
                >
                    <span className="h-2 w-2 rounded-full bg-transparent" />
                </button>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                        {todo.title}
                    </p>

                    {todo.description && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                            {todo.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
    const emptyRows = ["Plan something small", "Add a todo", "Pick a priority"];

    const renderEmptyRows = () => (
        <div className="space-y-2">
            {emptyRows.map((label) => (
                <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-3 py-2.5"
                >
                    <span className="h-4 w-4 rounded-full border border-slate-600" />
                    <span className="h-2 flex-1 rounded-full bg-slate-700/40" />
                </div>
            ))}
        </div>
    );

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-3 shadow-lg">
            <h2 className="mb-2 text-base font-semibold text-white">
                Upcoming Tasks
            </h2>

            {visibleTodos.length === 0 ? (
                <div className="min-h-0 flex-1">{renderEmptyRows()}</div>
            ) : (
                <div className="min-h-0 flex-1 space-y-2">
                    {visibleTodos.map(renderTodo)}

                    {hiddenTodoCount > 0 && (
                        <p className="px-1 text-xs text-slate-500">
                            +{hiddenTodoCount} more in Todos
                        </p>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={onShowAll}
                className="mt-2 rounded-xl border border-violet-400/20 bg-slate-900/35 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15"
            >
                Show all tasks
            </button>
        </section>
    );
}
