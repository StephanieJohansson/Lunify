import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateTodoModal from "../components/CreateTodoModal";
import { getDashboardSummary } from "../services/DashboardApi";
import type { DashboardSummary } from "../types/DashboardSummary";
import {
    CheckSquare,
    Clock,
    CreditCard,
    Package,
} from "lucide-react";
import UpcomingTasksWidget from "../components/widgets/UpcomingTasksWidget";
import WeatherWidget from "../components/widgets/WeatherWidget";
import TodayScheduleWidget from "../components/widgets/TodayScheduleWidget";
import type { Page, SettingsSection } from "../App";
import type { AuthUser } from "../types/AuthUser";
import {
    getPendingTodos,
    completeTodo,
    updateTodo,
} from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";
import { type CalendarEvent, getTodayEvents, getWeekEvents } from "../services/CalendarApi.ts";
import WeekViewWidget from "../components/widgets/WeekViewWidget.tsx";
import FamilyWidget from "../components/widgets/FamilyWidget";
import PackagesWidget from "../components/widgets/PackagesWidget";
import QuickActionsWidget from "../components/widgets/QuickActionsWidget";
import UpcomingCostsWidget from "../components/widgets/UpcomingCostsWidget";
import {
    getUndeliveredPackages,
    type PackageTracking,
} from "../services/PackageApi.ts";

type DashboardProps = {
    activePage: Page;
    currentUser: AuthUser;
    onCreateEvent: () => void;
    onCreatePackage: () => void;
    onLogout: () => void;
    onOpenSettings: (section: SettingsSection) => void;
    onOpenTodaySchedule: () => void;
    onPageChange: (page: Page) => void;
};

export default function Dashboard({
    activePage,
    currentUser,
    onCreateEvent,
    onCreatePackage,
    onLogout,
    onOpenSettings,
    onOpenTodaySchedule,
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
                    <Header
                        currentUser={currentUser}
                        onCreateEvent={onCreateEvent}
                        onCreatePackage={onCreatePackage}
                        onLogout={onLogout}
                        onOpenSettings={onOpenSettings}
                    />
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
                <Header
                    currentUser={currentUser}
                    onCreateEvent={onCreateEvent}
                    onCreatePackage={onCreatePackage}
                    onLogout={onLogout}
                    onOpenSettings={onOpenSettings}
                />

                <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardCard
                        title="Todos"
                        value={dashboard.pendingTodos}
                        onClick={() => onPageChange("todos")}
                        icon={<CheckSquare size={18} />}
                    />
                    <DashboardCard title="Payments" value={dashboard.unpaidPayments} icon={<CreditCard size={18} />} />
                    <DashboardCard
                        title="Packages"
                        value={activePackages.length || dashboard.packagesInTransit}
                        onClick={() => onPageChange("packages")}
                        icon={<Package size={18} />}
                    />
                    <DashboardCard title="Reminders" value={dashboard.upcomingReminders} icon={<Clock size={18} />} />
                </section>

                <section className="mt-2 grid min-h-0 flex-1 grid-cols-12 grid-rows-[minmax(0,1.55fr)_minmax(0,0.7fr)] gap-2">
                    <div className="col-span-3 min-h-0">
                        <TodayScheduleWidget
                            events={todayEvents}
                            onShowAll={onOpenTodaySchedule}
                        />
                    </div>

                    <div className="col-span-6 min-h-0">
                        <WeekViewWidget
                            events={weekEvents}
                            onShowAll={() => onPageChange("calendar")}
                        />
                    </div>

                    <div className="col-span-3 grid min-h-0 grid-rows-2 gap-2">
                        <UpcomingCostsWidget count={dashboard.unpaidPayments} />
                        <UpcomingTasksWidget
                            todos={upcomingTodos}
                            onComplete={handleCompleteTodo}
                            onShowAll={() => onPageChange("todos")}
                        />
                    </div>

                    <div className="col-span-3 min-h-0">
                        <PackagesWidget
                            packages={activePackages}
                            onShowAll={() => onPageChange("packages")}
                        />
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
