import { useState } from "react";
import CalendarPage from "./pages/CalendarPage";
import Dashboard from "./pages/Dashboard";
import Todos from "./pages/Todos";

export type Page = "dashboard" | "calendar" | "todos";
export type CalendarView = "month" | "week" | "day" | "year";

function App() {
    const [page, setPage] = useState<Page>("dashboard");
    const [calendarView, setCalendarView] = useState<CalendarView>("month");

    if (page === "todos") {
        return <Todos activePage={page} onPageChange={setPage} />;
    }

    if (page === "calendar") {
        return (
            <CalendarPage
                activePage={page}
                activeCalendarView={calendarView}
                onCalendarViewChange={setCalendarView}
                onPageChange={setPage}
            />
        );
    }

    return <Dashboard activePage={page} onPageChange={setPage} />;
}

export default App;
