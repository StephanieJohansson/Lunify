import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTodoModal from "../components/CreateTodoModal";
import { getDashboardSummary } from "../services/DashboardApi";
import type { DashboardSummary } from "../types/DashboardSummary";
import {
    Bell,
    CalendarPlus,
    CheckSquare,
    Clock,
    CreditCard,
    Package,
    Users,
    WalletCards,
} from "lucide-react";
import UpcomingTasksWidget from "../components/widgets/UpcomingTasksWidget";
import WeatherWidget from "../components/widgets/WeatherWidget";
import TodayScheduleWidget from "../components/widgets/TodayScheduleWidget";
import type { Page } from "../App";
import type { AuthUser } from "../types/AuthUser";
import {
    getPendingTodos,
    completeTodo,
    updateTodo,
} from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";
import { type CalendarEvent, getTodayEvents, getWeekEvents } from "../services/CalendarApi.ts";
import WeekViewWidget from "../components/widgets/WeekViewWidget.tsx";
import {
    getUndeliveredPackages,
    type PackageTracking,
} from "../services/PackageApi.ts";

type DashboardProps = {
    activePage: Page;
    currentUser: AuthUser;
    onLogout: () => void;
    onPageChange: (page: Page) => void;
};

function UpcomingCostsWidget({ count }: { count: number }) {
    const rows = count > 0
        ? ["Upcoming payment", "Household cost", "Subscription"]
        : ["No payments due", "Add a bill", "Track a subscription"];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Upcoming Costs</h2>
                <WalletCards size={17} className="text-violet-300" />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {rows.map((row, index) => (
                    <div
                        key={row}
                        className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2"
                    >
                        <span className={count > 0 ? "text-sm text-slate-200" : "h-2 w-28 rounded-full bg-slate-700/40 text-transparent"}>
                            {row}
                        </span>
                        <span className="text-xs text-slate-500">
                            {count > 0 && index === 0 ? "Soon" : ""}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FamilyWidget() {
    const rows = ["Emma", "Liam", "Sofia"];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Family</h2>
                <Users size={18} className="text-violet-300" />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {rows.map((row, index) => (
                    <div
                        key={row}
                        className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-2.5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-100">
                            {row.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-200">{row}</p>
                            <p className="text-xs text-slate-500">
                                {index === 0 ? "No events today" : "Ready to plan"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function QuickActionsWidget({ onPageChange }: { onPageChange: (page: Page) => void }) {
    const actions = [
        { label: "New event", icon: CalendarPlus, onClick: () => onPageChange("calendar") },
        { label: "New task", icon: CheckSquare, onClick: () => onPageChange("todos") },
        { label: "New package", icon: Package, onClick: () => onPageChange("packages") },
        { label: "Payment", icon: CreditCard, onClick: undefined },
    ];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
            <h2 className="mb-3 text-base font-semibold text-white">Quick Actions</h2>

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.label}
                            disabled={!action.onClick}
                            onClick={action.onClick}
                            className="flex min-h-0 flex-col items-start justify-between rounded-xl bg-slate-900/40 p-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Icon size={17} className="text-violet-300" />
                            <span>{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default function Dashboard({
    activePage,
    currentUser,
    onLogout,
    onPageChange,
}: DashboardProps) {
    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
    const [upcomingTodos, setUpcomingTodos] = useState<TodoTask[]>([]);
    const [todoToEdit, setTodoToEdit] = useState<TodoTask | null>(null);
    const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
    const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
    const [activePackages, setActivePackages] = useState<PackageTracking[]>([]);

    useEffect(() => {
        getDashboardSummary()
            .then((data) => setDashboard(data))
            .catch(console.error);

        getPendingTodos()
            .then(setUpcomingTodos)
            .catch(console.error);

        getTodayEvents()
            .then(setTodayEvents)
            .catch(console.error);

        getWeekEvents()
            .then(setWeekEvents)
            .catch(console.error);

        getUndeliveredPackages()
            .then(setActivePackages)
            .catch(console.error);

    }, []);

    function decreasePendingCount() {
        setDashboard((current) =>
            current
                ? { ...current, pendingTodos: Math.max(current.pendingTodos - 1, 0) }
                : current
        );
    }

    function handleCompleteTodo(todo: TodoTask) {
        completeTodo(todo.id, todo)
            .then((updatedTodo) => {
                setUpcomingTodos((current) =>
                    current.filter((item) => item.id !== updatedTodo.id)
                );

                decreasePendingCount();
            })
            .catch(console.error);
    }


    function handleUpdateTodo(title: string, description: string) {
        if (!todoToEdit) return;

        const updatedTodo: TodoTask = {
            ...todoToEdit,
            title,
            description,
        };

        updateTodo(updatedTodo)
            .then((savedTodo) => {
                setUpcomingTodos((current) =>
                    current.map((todo) =>
                        todo.id === savedTodo.id ? savedTodo : todo
                    )
                );

                setTodoToEdit(null);
            })
            .catch(console.error);
    }

    if (!dashboard) {
        return (
            <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
                <Sidebar
                    activePage={activePage}
                    currentUser={currentUser}
                    onPageChange={onPageChange}
                />

                <main className="min-w-0 flex-1 p-3">
                    <Header currentUser={currentUser} onLogout={onLogout} />
                    <p className="text-slate-400">Laddar...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar
                activePage={activePage}
                currentUser={currentUser}
                onPageChange={onPageChange}
            />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
                <Header currentUser={currentUser} onLogout={onLogout} />

                <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    <DashboardCard
                        title="Todos"
                        value={dashboard.pendingTodos}
                        onClick={() => onPageChange("todos")}
                        icon={<CheckSquare size={18} />}
                    />
                    <DashboardCard title="Notifications" value={dashboard.unreadNotifications} icon={<Bell size={18} />} />
                    <DashboardCard title="Payments" value={dashboard.unpaidPayments} icon={<CreditCard size={18} />} />
                    <DashboardCard
                        title="Packages"
                        value={activePackages.length || dashboard.packagesInTransit}
                        onClick={() => onPageChange("packages")}
                        icon={<Package size={18} />}
                    />
                    <DashboardCard title="Reminders" value={dashboard.upcomingReminders} icon={<Clock size={18} />} />
                </section>

                <section className="mt-2 grid min-h-0 flex-1 grid-cols-12 grid-rows-[minmax(0,1.35fr)_minmax(0,0.9fr)] gap-2">
                    <div className="col-span-3 min-h-0">
                        <TodayScheduleWidget events={todayEvents} />
                    </div>

                    <div className="col-span-6 min-h-0">
                        <WeekViewWidget events={weekEvents} />
                    </div>

                    <div className="col-span-3 grid min-h-0 grid-rows-2 gap-2">
                        <UpcomingCostsWidget count={dashboard.unpaidPayments} />
                        <UpcomingTasksWidget
                            todos={upcomingTodos}
                            onComplete={handleCompleteTodo}
                        />
                    </div>

                    <div className="col-span-3 min-h-0 rounded-xl bg-slate-800/80 p-4 shadow-lg">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-semibold text-white">Packages</h2>
                            <button
                                onClick={() => onPageChange("packages")}
                                className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/30"
                            >
                                Open
                            </button>
                        </div>

                        {activePackages.length === 0 ? (
                            <div className="mt-3 space-y-2">
                                {["Carrier", "Tracking", "ETA"].map((row) => (
                                    <div
                                        key={row}
                                        className="flex items-center gap-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 p-3"
                                    >
                                        <Package size={15} className="text-slate-600" />
                                        <span className="h-2 flex-1 rounded-full bg-slate-700/40" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-3 max-h-[calc(100%-3rem)] space-y-2 overflow-y-auto pr-1">
                                {activePackages.map((packageTracking) => (
                                    <button
                                        key={packageTracking.id}
                                        onClick={() => onPageChange("packages")}
                                        className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-900/50 px-3 py-2 text-left transition hover:bg-slate-700/60"
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-white">
                                                {packageTracking.packageName}
                                            </span>
                                            <span className="block truncate text-xs text-slate-500">
                                                {packageTracking.carrier}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-xs text-sky-300">
                                            {packageTracking.status?.replaceAll("_", " ") ??
                                                "Tracking"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="col-span-3 min-h-0">
                        <WeatherWidget />
                    </div>

                    <div className="col-span-3 min-h-0">
                        <FamilyWidget />
                    </div>

                    <div className="col-span-3 min-h-0">
                        <QuickActionsWidget onPageChange={onPageChange} />
                    </div>
                </section>
            </main>

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
