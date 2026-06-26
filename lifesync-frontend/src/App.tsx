import { useEffect, useState } from "react";
import CalendarPage from "./pages/CalendarPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Packages from "./pages/Packages";
import Todos from "./pages/Todos";
import { getCurrentUser, logout } from "./services/AuthApi";
import type { AuthUser } from "./types/AuthUser";

export type Page = "dashboard" | "calendar" | "todos" | "packages";
export type CalendarView = "month" | "week" | "day" | "year";

function App() {
    const [page, setPage] = useState<Page>("dashboard");
    const [calendarView, setCalendarView] = useState<CalendarView>("month");
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [createEventRequest, setCreateEventRequest] = useState(0);

    useEffect(() => {
        getCurrentUser()
            .then(setCurrentUser)
            .catch(() => setCurrentUser(null))
            .finally(() => setAuthLoading(false));
    }, []);

    function handleLogout() {
        logout()
            .catch(console.error)
            .finally(() => {
                setCurrentUser(null);
                setPage("dashboard");
            });
    }

    function handleCreateEvent() {
        setPage("calendar");
        setCreateEventRequest((current) => current + 1);
    }

    function handleCreatePackage() {
        setPage("packages");
    }

    function handleOpenTodaySchedule() {
        setCalendarView("day");
        setPage("calendar");
    }

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
                Loading Lunify...
            </div>
        );
    }

    if (!currentUser) {
        return <AuthPage onAuthenticated={setCurrentUser} />;
    }

    if (page === "todos") {
        return (
            <Todos
                activePage={page}
                currentUser={currentUser}
                onCreateEvent={handleCreateEvent}
                onCreatePackage={handleCreatePackage}
                onLogout={handleLogout}
                onPageChange={setPage}
            />
        );
    }

    if (page === "calendar") {
        return (
            <CalendarPage
                activePage={page}
                activeCalendarView={calendarView}
                createEventRequest={createEventRequest}
                currentUser={currentUser}
                onCreateEvent={handleCreateEvent}
                onCreatePackage={handleCreatePackage}
                onLogout={handleLogout}
                onCalendarViewChange={setCalendarView}
                onPageChange={setPage}
            />
        );
    }

    if (page === "packages") {
        return (
            <Packages
                activePage={page}
                currentUser={currentUser}
                onCreateEvent={handleCreateEvent}
                onCreatePackage={handleCreatePackage}
                onLogout={handleLogout}
                onPageChange={setPage}
            />
        );
    }

    return (
        <Dashboard
            activePage={page}
            currentUser={currentUser}
            onCreateEvent={handleCreateEvent}
            onCreatePackage={handleCreatePackage}
            onLogout={handleLogout}
            onOpenTodaySchedule={handleOpenTodaySchedule}
            onPageChange={setPage}
        />
    );
}

export default App;
