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
    deleteTodo,
    updateTodo,
} from "../services/TodoApi";
import type { TodoTask } from "../types/TodoTask";

type DashboardProps = {
    activePage: Page;
    onPageChange: (page: Page) => void;
};

export default function Dashboard({ activePage, onPageChange }: DashboardProps) {
    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
    const [upcomingTodos, setUpcomingTodos] = useState<TodoTask[]>([]);
    const [todoToEdit, setTodoToEdit] = useState<TodoTask | null>(null);

    useEffect(() => {
        getDashboardSummary()
            .then((data) => setDashboard(data))
            .catch(console.error);

        getPendingTodos()
            .then(setUpcomingTodos)
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

    const handleDeleteTodo = async (id: number) => {
        await deleteTodo(id);

        setUpcomingTodos((current) =>
            current.filter((todo) => todo.id !== id)
        );

        decreasePendingCount();
    };

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

                <main className="flex-1 p-6">
                    <Header />
                    <p className="text-slate-400">Laddar...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar activePage={activePage} onPageChange={onPageChange} />

            <main className="flex-1 p-6">
                <Header />

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <DashboardCard
                        title="Todos"
                        value={dashboard.pendingTodos}
                        onClick={() => onPageChange("todos")}
                        icon={<CheckSquare size={22} />}
                    />
                    <DashboardCard title="Notifications" value={dashboard.unreadNotifications} icon={<Bell size={22} />} />
                    <DashboardCard title="Payments" value={dashboard.unpaidPayments} icon={<CreditCard size={22} />} />
                    <DashboardCard title="Packages" value={dashboard.packagesInTransit} icon={<Package size={22} />} />
                    <DashboardCard title="Reminders" value={dashboard.upcomingReminders} icon={<Clock size={22} />} />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <TodayScheduleWidget />

                    <UpcomingTasksWidget
                        todos={upcomingTodos}
                        onComplete={handleCompleteTodo}
                        onEdit={setTodoToEdit}
                        onDelete={handleDeleteTodo}
                    />

                    <WeatherWidget />
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