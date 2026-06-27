import { useEffect, useState } from "react";
import CalendarPage from "./pages/CalendarPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Packages from "./pages/Packages";
import Todos from "./pages/Todos";
import SettingsPage from "./pages/SettingsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { getCurrentUser, logout } from "./services/AuthApi";
import type { AuthUser } from "./types/AuthUser";

export type Page = "dashboard" | "calendar" | "todos" | "packages" | "settings";
export type CalendarView = "month" | "week" | "day" | "year";
export type SettingsSection = "account" | "security";

function App() {
    const verificationToken = window.location.hash.startsWith("#verify-email=")
        ? window.location.hash.slice("#verify-email=".length)
        : null;
    const resetToken = window.location.hash.startsWith("#reset-password=")
        ? window.location.hash.slice("#reset-password=".length)
        : null;
    const [page, setPage] = useState<Page>("dashboard");
    const [calendarView, setCalendarView] = useState<CalendarView>("month");
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [createEventRequest, setCreateEventRequest] = useState(0);
    const [settingsSection, setSettingsSection] = useState<SettingsSection>("account");

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

    function handleOpenSettings(section: SettingsSection) {
        setSettingsSection(section);
        setPage("settings");
    }

    if (verificationToken) {
        return <VerifyEmailPage token={verificationToken} />;
    }

    if (resetToken) {
        return <ResetPasswordPage token={resetToken} />;
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
                onOpenSettings={handleOpenSettings}
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
                onOpenSettings={handleOpenSettings}
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
                onOpenSettings={handleOpenSettings}
                onPageChange={setPage}
            />
        );
    }

    if (page === "settings") {
        return (
            <SettingsPage
                key={settingsSection}
                activePage={page}
                currentUser={currentUser}
                onCreateEvent={handleCreateEvent}
                onCreatePackage={handleCreatePackage}
                onLogout={handleLogout}
                onOpenSettings={handleOpenSettings}
                onPageChange={setPage}
                initialSection={settingsSection}
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
            onOpenSettings={handleOpenSettings}
            onOpenTodaySchedule={handleOpenTodaySchedule}
            onPageChange={setPage}
        />
    );
}

export default App;
