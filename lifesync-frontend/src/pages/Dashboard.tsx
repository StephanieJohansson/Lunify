import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { getDashboardSummary } from "../services/DashboardApi";
import type { DashboardSummary } from "../types/DashboardSummary";
import { Bell, CheckSquare, CreditCard, Package, Clock } from "lucide-react";
import UpcomingTasksWidget from "../components/widgets/UpcomingTasksWidget";
import WeatherWidget from "../components/widgets/WeatherWidget";
import TodayScheduleWidget from "../components/widgets/TodayScheduleWidget";
import type { Page } from "../App";

type DashboardProps = {
    activePage: Page;
    onPageChange: (page: Page) => void;
};

export default function Dashboard({ activePage, onPageChange }: DashboardProps) {
    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);

    useEffect(() => {
        getDashboardSummary()
            .then((data) => setDashboard(data))
            .catch((error) => console.error(error));
    }, []);

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
                    <DashboardCard title="Todos" value={dashboard.pendingTodos} icon={<CheckSquare size={22} />} />
                    <DashboardCard title="Notifications" value={dashboard.unreadNotifications} icon={<Bell size={22} />} />
                    <DashboardCard title="Payments" value={dashboard.unpaidPayments} icon={<CreditCard size={22} />} />
                    <DashboardCard title="Packages" value={dashboard.packagesInTransit} icon={<Package size={22} />} />
                    <DashboardCard title="Reminders" value={dashboard.upcomingReminders} icon={<Clock size={22} />} />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <TodayScheduleWidget />
                    <UpcomingTasksWidget />
                    <WeatherWidget />
                </section>
            </main>
        </div>
    );
}