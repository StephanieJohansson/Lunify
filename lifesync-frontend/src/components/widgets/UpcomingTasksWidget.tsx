import type { TodoTask } from "../../types/TodoTask";

type UpcomingTasksWidgetProps = {
    todos: TodoTask[];
};

export default function UpcomingTasksWidget({ todos }: UpcomingTasksWidgetProps) {
    const visibleTodos = todos.slice(0, 3);

    return (
        <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-white">Upcoming Tasks</h2>

            {visibleTodos.length === 0 ? (
                <p className="text-sm text-slate-400">No upcoming tasks.</p>
            ) : (
                <div className="space-y-3">
                    {visibleTodos.map((todo) => (
                        <div
                            key={todo.id}
                            className="flex items-center gap-3 rounded-xl bg-slate-900/60 p-3 text-sm text-slate-300"
                        >
                            <span className="h-2 w-2 rounded-full bg-violet-400" />
                            <span>{todo.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}