import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTodoModal from "../components/CreateTodoModal";
import { getDashboardSummary } from "../services/DashboardApi";
import type { DashboardSummary } from "../types/DashboardSummary";
import { Bell, CheckSquare, CreditCard, Package, Clock } from "lucide-react";
import UpcomingTasksWidget from "../components/widgets/UpcomingTasksWidget";
import WeatherWidget from "../components/widgets/WeatherWidget";
import TodayScheduleWidget from "../components/widgets/TodayScheduleWidget";
import type { Page } from "../App";
import {
    getPendingTodos,
    completeTodo,
    updateTodo,
} from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";
import {type CalendarEvent, getTodayEvents, getWeekEvents } from "../services/CalendarApi.ts";
import WeekViewWidget from "../components/widgets/WeekViewWidget.tsx";

type DashboardProps = {
    activePage: Page;
    onPageChange: (page: Page) => void;
};

export default function Dashboard({ activePage, onPageChange }: DashboardProps) {
    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
    const [upcomingTodos, setUpcomingTodos] = useState<TodoTask[]>([]);
    const [todoToEdit, setTodoToEdit] = useState<TodoTask | null>(null);
    const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
    const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);

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
            <div className="flex min-h-screen bg-slate-900 text-white">
                <Sidebar activePage={activePage} onPageChange={onPageChange} />

                <main className="flex-1 px-4 py-3">
                    <Header />
                    <p className="text-slate-400">Laddar...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar activePage={activePage} onPageChange={onPageChange} />

            <main className="flex-1 px-4 py-3">
                <Header />

                <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    <DashboardCard
                        title="Todos"
                        value={dashboard.pendingTodos}
                        onClick={() => onPageChange("todos")}
                        icon={<CheckSquare size={18} />}
                    />
                    <DashboardCard title="Notifications" value={dashboard.unreadNotifications} icon={<Bell size={18} />} />
                    <DashboardCard title="Payments" value={dashboard.unpaidPayments} icon={<CreditCard size={18} />} />
                    <DashboardCard title="Packages" value={dashboard.packagesInTransit} icon={<Package size={18} />} />
                    <DashboardCard title="Reminders" value={dashboard.upcomingReminders} icon={<Clock size={18} />} />
                </section>

                <section className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-4">
                    <div className="xl:col-span-1">
                        <TodayScheduleWidget events={todayEvents} />
                    </div>

                    <div className="xl:col-span-2">
                        <WeekViewWidget events={weekEvents} />
                    </div>

                    <div className="xl:col-span-1">
                        <UpcomingTasksWidget
                            todos={upcomingTodos}
                            onComplete={handleCompleteTodo}
                        />
                    </div>
                </section>

                <section className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-3">
                    <WeatherWidget />

                    <div className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
                        <h2 className="text-lg font-semibold text-white">Packages</h2>
                        <p className="mt-4 text-sm text-slate-400">No packages in transit.</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
                        <h2 className="text-lg font-semibold text-white">Quick actions</h2>
                        <button className="mt-4 rounded-full bg-violet-500/20 px-4 py-2 text-sm text-violet-200">
                            + New event
                        </button>
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
