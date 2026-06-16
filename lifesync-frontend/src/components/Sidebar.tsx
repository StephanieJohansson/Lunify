import {
    Home,
    CalendarDays,
    CheckSquare,
    CreditCard,
    Package,
    Bell,
} from "lucide-react";

import type { CalendarView, Page } from "../App";

type SidebarProps = {
    activePage: Page;
    activeCalendarView?: CalendarView;
    onCalendarViewChange?: (view: CalendarView) => void;
    onPageChange: (page: Page) => void;
};

const calendarViews = [
    { label: "Month", view: "month" },
    { label: "Week", view: "week" },
    { label: "Day", view: "day" },
    { label: "Year", view: "year" },
] satisfies { label: string; view: CalendarView }[];

export default function Sidebar({
    activePage,
    activeCalendarView = "month",
    onCalendarViewChange,
    onPageChange,
}: SidebarProps) {
    const menuItems = [
        { name: "Home", page: "dashboard", icon: Home },
        { name: "Calendar", page: "calendar", icon: CalendarDays },
        { name: "Todos", page: "todos", icon: CheckSquare },
        { name: "Payments", page: null, icon: CreditCard },
        { name: "Packages", page: "packages", icon: Package },
        { name: "Reminders", page: null, icon: Bell },
    ] satisfies {
        name: string;
        page: Page | null;
        icon: typeof Home;
    }[];

    return (
        <aside className="hidden min-h-screen w-64 flex-col bg-slate-950 p-6 text-white md:flex">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold">
                    L
                </div>

                <span className="text-xl font-bold">Lunify</span>
            </div>

            <nav className="mt-8 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.page === activePage;

                    return (
                        <div key={item.name}>
                            <button
                                disabled={!item.page}
                                onClick={() => {
                                    if (item.page) {
                                        onPageChange(item.page);
                                    }
                                }}
                                className={`
                flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm
                transition
                ${
                                isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }
                ${!item.page ? "cursor-not-allowed opacity-60" : ""}
              `}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </button>

                            {item.page === "calendar" &&
                                activePage === "calendar" && (
                                    <div className="mt-1 space-y-1 pl-10">
                                        {calendarViews.map((calendarItem) => (
                                            <button
                                                key={calendarItem.view}
                                                onClick={() => {
                                                    onPageChange("calendar");
                                                    onCalendarViewChange?.(
                                                        calendarItem.view
                                                    );
                                                }}
                                                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                                                    activeCalendarView ===
                                                    calendarItem.view
                                                        ? "bg-violet-500/15 text-violet-100"
                                                        : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                                                }`}
                                            >
                                                {calendarItem.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </div>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-2xl bg-slate-900 p-4">
                <p className="text-sm font-medium">Stephanie</p>
                <p className="text-xs text-slate-500">Lunify workspace</p>
            </div>
        </aside>
    );
}
