import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarPlus,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Clock,
    CreditCard,
    MapPin,
    Package,
    Pencil,
    RotateCcw,
    Trash2,
    X,
} from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
    type CalendarEvent,
    type CalendarEventPayload,
    type EventCategory,
} from "../services/CalendarApi";
import { getDashboardSummary } from "../services/DashboardApi";
import { getPackageCalendarEvents } from "../services/PackageApi";
import type { DashboardSummary } from "../types/DashboardSummary";
import type { CalendarView, Page, SettingsSection } from "../App";
import type { AuthUser } from "../types/AuthUser";

type CalendarPageProps = {
    activePage: Page;
    activeCalendarView: CalendarView;
    createEventRequest: number;
    currentUser: AuthUser;
    onCreateEvent: () => void;
    onCreatePackage: () => void;
    onLogout: () => void;
    onOpenSettings: (section: SettingsSection) => void;
    onCalendarViewChange: (view: CalendarView) => void;
    onPageChange: (page: Page) => void;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarHours = Array.from({ length: 18 }, (_, index) => index + 6);
const calendarGridColumns = "4.5rem repeat(7, minmax(7rem, 1fr))";
const dayGridColumns = "4.5rem minmax(0, 1fr)";
const calendarPageColumns = "minmax(0, 1fr) 18rem";
const calendarLine = "1px solid rgba(148, 163, 184, 0.18)";
const calendarStrongLine = "1px solid rgba(148, 163, 184, 0.28)";

const categoryStyles: Record<EventCategory, string> = {
    WORK: "border-pink-400/60 bg-pink-500/15 text-pink-100",
    HEALTH: "border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
    FAMILY: "border-amber-300/70 bg-amber-500/15 text-amber-100",
    PERSONAL: "border-violet-400/60 bg-violet-500/15 text-violet-100",
    EDUCATION: "border-sky-400/60 bg-sky-500/15 text-sky-100",
};

const categoryLabels: Record<EventCategory, string> = {
    WORK: "Work",
    HEALTH: "Health",
    FAMILY: "Family",
    PERSONAL: "Personal",
    EDUCATION: "Education",
};

function normalizeCategory(category: string): EventCategory {
    const normalizedCategory = category.toUpperCase();

    if (normalizedCategory in categoryStyles) {
        return normalizedCategory as EventCategory;
    }

    return "PERSONAL";
}

const defaultForm: CalendarEventPayload = {
    title: "",
    startDateTime: "",
    endDateTime: "",
    allDay: false,
    description: "",
    location: "",
    category: "PERSONAL",
    recurring: false,
};

function getMonday(date: Date) {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
}

function formatTime(dateTime: string) {
    return new Date(dateTime).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function toDateTimeInputValue(date: Date, hour = 9) {
    return `${formatDateInput(date)}T${String(hour).padStart(2, "0")}:00`;
}

function eventToPayload(event: CalendarEvent): CalendarEventPayload {
    return {
        title: event.title,
        startDateTime: event.startDateTime.slice(0, 16),
        endDateTime: event.endDateTime.slice(0, 16),
        allDay: event.allDay,
        description: event.description ?? "",
        location: event.location ?? "",
        category: normalizeCategory(event.category),
        recurring: event.recurring,
    };
}

function isEditableCalendarEvent(
    event: CalendarEvent
): event is CalendarEvent & { id: number; source?: "CALENDAR" } {
    return event.source !== "PACKAGE" && typeof event.id === "number";
}

function getEventsForDay(events: CalendarEvent[], date: Date) {
    return events
        .filter((event) => isSameDay(new Date(event.startDateTime), date))
        .sort(
            (a, b) =>
                new Date(a.startDateTime).getTime() -
                new Date(b.startDateTime).getTime()
        );
}

function getEventsForHour(events: CalendarEvent[], date: Date, hour: number) {
    return getEventsForDay(events, date).filter(
        (event) => new Date(event.startDateTime).getHours() === hour
    );
}

function getUpcomingEvents(events: CalendarEvent[], fromDate = new Date()) {
    return [...events]
        .filter((event) => new Date(event.startDateTime) >= fromDate)
        .sort(
            (a, b) =>
                new Date(a.startDateTime).getTime() -
                new Date(b.startDateTime).getTime()
        )
        .slice(0, 5);
}

function buildMonthDays(currentDate: Date) {
    const firstOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );
    const gridStart = getMonday(firstOfMonth);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
    });
}

function EventPill({
    event,
    onEdit,
    className = "",
}: {
    event: CalendarEvent;
    onEdit: (event: CalendarEvent) => void;
    className?: string;
}) {
    const timeLabel = event.allDay ? "All day" : formatTime(event.startDateTime);
    const isPackageEvent = event.source === "PACKAGE";

    return (
        <button
            onClick={() => {
                if (!isPackageEvent) {
                    onEdit(event);
                }
            }}
            className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1 text-left text-xs text-violet-50 shadow-sm shadow-slate-950/20 ring-1 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/40 ${
                isPackageEvent
                    ? "cursor-default border-fuchsia-300/30 bg-fuchsia-500/20 ring-fuchsia-300/10 hover:bg-fuchsia-500/30"
                    : "cursor-pointer border-violet-400/25 bg-violet-500/20 ring-violet-300/5 hover:border-violet-200/60 hover:bg-violet-500/30 hover:ring-violet-200/20"
            } ${className}`}
        >
            <span
                className={`h-4 w-1 shrink-0 rounded-full ${
                    isPackageEvent ? "bg-fuchsia-200/80" : "bg-violet-300/70"
                }`}
            />
            <span className="min-w-0 truncate font-semibold">{event.title}</span>
            <span className="shrink-0 text-[11px] opacity-75">
                {timeLabel}
            </span>
        </button>
    );
}

function CalendarSummaryCards({
    dashboard,
    onPackagesClick,
    onTodosClick,
}: {
    dashboard: DashboardSummary | null;
    onPackagesClick: () => void;
    onTodosClick: () => void;
}) {
    const cards = [
        {
            title: "Todos",
            value: dashboard?.pendingTodos ?? 0,
            icon: CheckSquare,
            onClick: onTodosClick,
        },
        {
            title: "Payments",
            value: dashboard?.unpaidPayments ?? 0,
            icon: CreditCard,
        },
        {
            title: "Packages",
            value: dashboard?.packagesInTransit ?? 0,
            icon: Package,
            onClick: onPackagesClick,
        },
        {
            title: "Reminders",
            value: dashboard?.upcomingReminders ?? 0,
            icon: Clock,
        },
    ];

    return (
        <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <button
                        key={card.title}
                        onClick={card.onClick}
                        className="rounded-2xl bg-slate-800/80 p-3 text-left shadow-lg transition hover:bg-slate-700/80"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">{card.title}</p>
                            <div className="rounded-lg bg-violet-500/20 p-1.5 text-violet-300">
                                <Icon size={16} />
                            </div>
                        </div>
                        <p className="mt-1 text-xl font-bold text-white">
                            {card.value}
                        </p>
                    </button>
                );
            })}
        </section>
    );
}

function MiniMonthWidget({
    currentDate,
    events,
    onSelectDate,
}: {
    currentDate: Date;
    events: CalendarEvent[];
    onSelectDate: (date: Date) => void;
}) {
    const miniMonthDays = buildMonthDays(currentDate);

    return (
        <section className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                    {currentDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                </h3>
                <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs font-semibold text-violet-200">
                    {events.length}
                </span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-slate-500">
                {weekDays.map((day) => (
                    <span key={day}>{day.slice(0, 1)}</span>
                ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
                {miniMonthDays.map((date) => {
                    const isCurrentMonth =
                        date.getMonth() === currentDate.getMonth();
                    const isSelected = isSameDay(date, currentDate);
                    const hasEvents = getEventsForDay(events, date).length > 0;

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onSelectDate(date)}
                            className={`relative flex h-7 items-center justify-center rounded-lg text-xs transition hover:bg-slate-700 ${
                                isSelected
                                    ? "bg-violet-600 text-white"
                                    : isCurrentMonth
                                      ? "text-slate-300"
                                      : "text-slate-600"
                            }`}
                        >
                            {date.getDate()}
                            {hasEvents && (
                                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-violet-300" />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function CalendarViewHeader({
    title,
    viewMode,
    onViewChange,
    onPrevious,
    onToday,
    onNext,
    onCreate,
}: {
    title: string;
    viewMode: CalendarView;
    onViewChange: (view: CalendarView) => void;
    onPrevious: () => void;
    onToday: () => void;
    onNext: () => void;
    onCreate: () => void;
}) {
    return (
        <div className="mb-3 flex flex-col gap-3 border-b border-slate-700/50 pb-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
                <p className="text-xs text-slate-400">Calendar</p>
                <h2 className="text-lg font-semibold capitalize text-white">
                    {title}
                </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex rounded-xl bg-slate-900/60 p-1">
                    {(["month", "week", "day", "year"] as CalendarView[]).map(
                        (mode) => (
                            <button
                                key={mode}
                                onClick={() => onViewChange(mode)}
                                className={`rounded-lg px-3 py-1 text-sm font-medium capitalize transition ${
                                    viewMode === mode
                                        ? "bg-violet-600 text-white"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {mode}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={onPrevious}
                    className="rounded-xl bg-slate-900/60 p-2 text-slate-300 transition hover:text-white"
                    aria-label="Previous period"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    onClick={onToday}
                    className="rounded-xl bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                    Today
                </button>

                <button
                    onClick={onNext}
                    className="rounded-xl bg-slate-900/60 p-2 text-slate-300 transition hover:text-white"
                    aria-label="Next period"
                >
                    <ChevronRight size={18} />
                </button>

                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                    <CalendarPlus size={17} />
                    New event
                </button>
            </div>
        </div>
    );
}

function CalendarSidePanel({
    currentDate,
    events,
    onCreate,
    onEdit,
}: {
    currentDate: Date;
    events: CalendarEvent[];
    onCreate: () => void;
    onEdit: (event: CalendarEvent) => void;
}) {
    const selectedDayEvents = getEventsForDay(events, currentDate);
    const upcomingEvents = getUpcomingEvents(events);

    return (
        <aside className="space-y-5">
            <section className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold">Day details</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            {selectedDayEvents.length} events scheduled
                        </p>
                    </div>

                    <button
                        onClick={onCreate}
                        className="rounded-xl bg-violet-600 p-2.5 text-white transition hover:bg-violet-500"
                        aria-label="Create event for selected day"
                    >
                        <CalendarPlus size={17} />
                    </button>
                </div>

                <div className="mt-3 space-y-2">
                    {selectedDayEvents.length === 0 ? (
                        <p className="rounded-xl bg-slate-900/50 p-3 text-sm text-slate-500">
                            No events for this day.
                        </p>
                    ) : (
                        selectedDayEvents.map((event) => (
                            <EventPill
                                key={event.id}
                                event={event}
                                onEdit={onEdit}
                            />
                        ))
                    )}
                </div>
            </section>

            <section className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
                <h3 className="text-base font-semibold">Upcoming</h3>
                <div className="mt-3 space-y-2">
                    {upcomingEvents.length === 0 ? (
                        <p className="rounded-xl bg-slate-900/50 p-3 text-sm text-slate-500">
                            No upcoming events.
                        </p>
                    ) : (
                        upcomingEvents.slice(0, 4).map((event) => (
                        <button
                            key={event.id}
                            onClick={() => onEdit(event)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-900/50 p-2.5 text-left transition hover:bg-slate-700/70"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    {event.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {new Date(event.startDateTime).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                        }
                                    )}
                                </p>
                            </div>

                            <span className="text-xs font-medium text-slate-400">
                                {formatTime(event.startDateTime)}
                            </span>
                        </button>
                        ))
                    )}
                </div>
            </section>
        </aside>
    );
}

export default function CalendarPage({
    activePage,
    activeCalendarView,
    createEventRequest,
    currentUser,
    onCreateEvent,
    onCreatePackage,
    onLogout,
    onOpenSettings,
    onCalendarViewChange,
    onPageChange,
}: CalendarPageProps) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [form, setForm] = useState<CalendarEventPayload>(defaultForm);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        Promise.all([getAllEvents(), getPackageCalendarEvents()])
            .then(([calendarEvents, packageEvents]) =>
                setEvents([
                    ...calendarEvents.map((event) => ({
                        ...event,
                        source: "CALENDAR" as const,
                    })),
                    ...packageEvents,
                ])
            )
            .catch(console.error);
        getDashboardSummary().then(setDashboard).catch(console.error);
    }, []);

    const monthDays = useMemo(() => buildMonthDays(currentDate), [currentDate]);
    const weekStart = useMemo(() => getMonday(currentDate), [currentDate]);
    const weekDates = useMemo(
        () =>
            Array.from({ length: 7 }, (_, index) => {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + index);
                return date;
            }),
        [weekStart]
    );
    const yearMonths = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => {
                const date = new Date(currentDate.getFullYear(), index, 1);
                return {
                    date,
                    events: events.filter(
                        (event) =>
                            new Date(event.startDateTime).getFullYear() ===
                                date.getFullYear() &&
                            new Date(event.startDateTime).getMonth() ===
                                date.getMonth()
                    ),
                };
            }),
        [currentDate, events]
    );
    const viewMode = activeCalendarView;
    const openCreateModal = useCallback((date = currentDate) => {
        const start = toDateTimeInputValue(date, 9);
        const end = toDateTimeInputValue(date, 10);
        setEditingEvent(null);
        setForm({ ...defaultForm, startDateTime: start, endDateTime: end });
        setIsModalOpen(true);
    }, [currentDate]);

    useEffect(() => {
        const handleCreateEventRequest = () => openCreateModal();

        window.addEventListener("lifesync:create-event", handleCreateEventRequest);

        return () => {
            window.removeEventListener("lifesync:create-event", handleCreateEventRequest);
        };
    }, [openCreateModal]);

    useEffect(() => {
        if (createEventRequest > 0) {
            window.dispatchEvent(new Event("lifesync:create-event"));
        }
    }, [createEventRequest]);

    function openEditModal(event: CalendarEvent) {
        if (!isEditableCalendarEvent(event)) {
            return;
        }

        setEditingEvent(event);
        setForm(eventToPayload(event));
        setIsModalOpen(true);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);

        try {
            if (editingEvent) {
                if (!isEditableCalendarEvent(editingEvent)) {
                    return;
                }

                const savedEvent = await updateEvent(editingEvent.id, form);
                setEvents((current) =>
                    current.map((item) =>
                        item.id === savedEvent.id
                            ? { ...savedEvent, source: "CALENDAR" as const }
                            : item
                    )
                );
            } else {
                const savedEvent = await createEvent(form);
                setEvents((current) => [
                    ...current,
                    { ...savedEvent, source: "CALENDAR" as const },
                ]);
            }

            setIsModalOpen(false);
            setEditingEvent(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!editingEvent || !isEditableCalendarEvent(editingEvent)) {
            return;
        }

        await deleteEvent(editingEvent.id);
        setEvents((current) =>
            current.filter((event) => event.id !== editingEvent.id)
        );
        setIsModalOpen(false);
        setEditingEvent(null);
    }

    function movePeriod(direction: -1 | 1) {
        setCurrentDate((date) => {
            const nextDate = new Date(date);

            if (viewMode === "month") {
                nextDate.setMonth(date.getMonth() + direction);
            } else if (viewMode === "week") {
                nextDate.setDate(date.getDate() + direction * 7);
            } else if (viewMode === "year") {
                nextDate.setFullYear(date.getFullYear() + direction);
            } else {
                nextDate.setDate(date.getDate() + direction);
            }

            return nextDate;
        });
    }

    const heading = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const calendarHeading =
        viewMode === "day"
            ? currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
              })
            : viewMode === "year"
              ? currentDate.getFullYear().toString()
              : heading;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar
                activePage={activePage}
                activeCalendarView={activeCalendarView}
                currentUser={currentUser}
                onCalendarViewChange={onCalendarViewChange}
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

                <section
                    className="grid min-h-0 flex-1 gap-3 overflow-hidden"
                    style={{
                        gridTemplateColumns: calendarPageColumns,
                        alignItems: "start",
                    }}
                >
                    <div className="min-w-0 space-y-3">
                        <CalendarSummaryCards
                            dashboard={dashboard}
                            onPackagesClick={() => onPageChange("packages")}
                            onTodosClick={() => onPageChange("todos")}
                        />

                {viewMode === "month" && (
                    <section className="rounded-2xl bg-slate-800/80 p-3 shadow-lg">
                        <CalendarViewHeader
                            title={calendarHeading}
                            viewMode={viewMode}
                            onViewChange={onCalendarViewChange}
                            onPrevious={() => movePeriod(-1)}
                            onToday={() => setCurrentDate(new Date())}
                            onNext={() => movePeriod(1)}
                            onCreate={() => openCreateModal()}
                        />

                        <div className="grid grid-cols-7 gap-1.5 pb-1.5">
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className="px-2 text-xs font-semibold uppercase text-slate-500"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                            {monthDays.map((date) => {
                                const dayEvents = getEventsForDay(events, date);
                                const isCurrentMonth =
                                    date.getMonth() === currentDate.getMonth();
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <div
                                        key={date.toISOString()}
                                        role="button"
                                        tabIndex={0}
                                        onDoubleClick={() => openCreateModal(date)}
                                        onClick={() => setCurrentDate(date)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                setCurrentDate(date);
                                                onCalendarViewChange("day");
                                            }
                                        }}
                                        className={`min-h-20 rounded-xl bg-slate-900/40 p-2 text-left transition hover:bg-slate-900/70 ${
                                            !isCurrentMonth ? "opacity-45" : ""
                                        }`}
                                    >
                                        <span
                                            className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                                isToday
                                                    ? "bg-violet-600 text-white"
                                                    : "text-slate-300"
                                            }`}
                                        >
                                            {date.getDate()}
                                        </span>

                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <EventPill
                                                    key={event.id}
                                                    event={event}
                                                    onEdit={openEditModal}
                                                />
                                            ))}

                                            {dayEvents.length > 2 && (
                                                <p className="text-xs text-slate-500">
                                                    +{dayEvents.length - 2} more
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {viewMode === "week" && (
                    <section>
                        <div className="min-w-0 overflow-x-auto rounded-2xl bg-slate-800/80 shadow-lg">
                            <div className="min-w-4xl">
                                <div className="p-3 pb-0">
                                    <CalendarViewHeader
                                        title={calendarHeading}
                                        viewMode={viewMode}
                                        onViewChange={onCalendarViewChange}
                                        onPrevious={() => movePeriod(-1)}
                                        onToday={() => setCurrentDate(new Date())}
                                        onNext={() => movePeriod(1)}
                                        onCreate={() => openCreateModal()}
                                    />
                                </div>

                                <div
                                    className="grid bg-slate-900/25"
                                    style={{
                                        gridTemplateColumns: calendarGridColumns,
                                        borderBottom: calendarStrongLine,
                                    }}
                                >
                                    <div
                                        className="p-3 text-xs font-semibold uppercase text-slate-500"
                                        style={{ borderRight: calendarStrongLine }}
                                    >
                                        Time
                                    </div>

                                    {weekDates.map((date, index) => {
                                        const isToday = isSameDay(date, new Date());

                                        return (
                                            <button
                                                key={date.toISOString()}
                                                onClick={() => {
                                                    setCurrentDate(date);
                                                    onCalendarViewChange("day");
                                                }}
                                                className="p-3 text-left transition hover:bg-slate-700/50"
                                                style={{
                                                    borderRight:
                                                        index === weekDates.length - 1
                                                            ? "none"
                                                            : calendarStrongLine,
                                                }}
                                            >
                                                <span className="block text-xs font-semibold uppercase text-slate-500">
                                                    {weekDays[index]}
                                                </span>
                                                <span
                                                    className={`mt-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                                        isToday
                                                            ? "bg-violet-600 text-white"
                                                            : "bg-violet-500/20 text-violet-200"
                                                    }`}
                                                >
                                                    {date.getDate()}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div>
                                    {calendarHours.map((hour) => (
                                        <div
                                            key={hour}
                                            className="grid min-h-7"
                                            style={{
                                                gridTemplateColumns: calendarGridColumns,
                                                borderBottom:
                                                    hour ===
                                                    calendarHours[
                                                        calendarHours.length - 1
                                                    ]
                                                        ? "none"
                                                        : calendarLine,
                                            }}
                                        >
                                            <div
                                                className="px-3 py-1 text-xs text-slate-500"
                                                style={{ borderRight: calendarStrongLine }}
                                            >
                                                {String(hour).padStart(2, "0")}:00
                                            </div>

                                            {weekDates.map((date, dayIndex) => {
                                                const hourEvents = getEventsForHour(
                                                    events,
                                                    date,
                                                    hour
                                                );

                                                return (
                                                    <div
                                                        key={`${date.toISOString()}-${hour}`}
                                                        className="p-1.5 transition hover:bg-slate-900/25"
                                                        style={{
                                                            borderRight:
                                                                dayIndex ===
                                                                weekDates.length - 1
                                                                    ? "none"
                                                                    : calendarLine,
                                                        }}
                                                    >
                                                        <div className="space-y-1">
                                                            {hourEvents.map((event) => (
                                                                <EventPill
                                                                    key={event.id}
                                                                    event={event}
                                                                    onEdit={openEditModal}
                                                                    className="min-h-6"
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </section>
                )}

                {viewMode === "year" && (
                    <section className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
                        <CalendarViewHeader
                            title={calendarHeading}
                            viewMode={viewMode}
                            onViewChange={onCalendarViewChange}
                            onPrevious={() => movePeriod(-1)}
                            onToday={() => setCurrentDate(new Date())}
                            onNext={() => movePeriod(1)}
                            onCreate={() => openCreateModal()}
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {yearMonths.map((month) => {
                            const isCurrentMonth =
                                month.date.getMonth() === new Date().getMonth() &&
                                month.date.getFullYear() ===
                                    new Date().getFullYear();

                            return (
                                <div
                                    key={month.date.toISOString()}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setCurrentDate(month.date);
                                        onCalendarViewChange("month");
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            setCurrentDate(month.date);
                                            onCalendarViewChange("month");
                                        }
                                    }}
                                    className="min-h-32 rounded-xl bg-slate-900/40 p-4 text-left transition hover:bg-slate-900/70 hover:ring-1 hover:ring-violet-300/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold capitalize text-white">
                                            {month.date.toLocaleDateString("en-US", {
                                                month: "long",
                                            })}
                                        </h3>

                                        <span
                                            className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                                                isCurrentMonth
                                                    ? "bg-violet-600 text-white"
                                                    : "bg-violet-500/20 text-violet-200"
                                            }`}
                                        >
                                            {month.events.length}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-1.5">
                                        {month.events.length === 0 ? (
                                            <p className="text-xs text-slate-600">
                                                No events
                                            </p>
                                        ) : (
                                            month.events.slice(0, 2).map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={(eventClick) => {
                                                        eventClick.stopPropagation();
                                                        openEditModal(event);
                                                    }}
                                                    className="flex w-full items-center justify-between gap-2 rounded-lg bg-violet-500/15 px-2 py-1 text-left text-xs text-violet-100 transition hover:bg-violet-500/25"
                                                >
                                                    <span className="min-w-0 truncate font-semibold">
                                                        {event.title}
                                                    </span>
                                                    <span className="shrink-0 text-[11px] text-violet-200/80">
                                                        {formatTime(
                                                            event.startDateTime
                                                        )}
                                                    </span>
                                                </button>
                                            ))
                                        )}

                                        {month.events.length > 2 && (
                                            <p className="text-xs font-medium text-slate-500">
                                                +{month.events.length - 2} more events
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    </section>
                )}

                {viewMode === "day" && (
                    <section>
                        <div className="min-w-0 overflow-hidden rounded-2xl bg-slate-800/80 shadow-lg">
                            <div className="p-3 pb-0">
                                <CalendarViewHeader
                                    title={calendarHeading}
                                    viewMode={viewMode}
                                    onViewChange={onCalendarViewChange}
                                    onPrevious={() => movePeriod(-1)}
                                    onToday={() => setCurrentDate(new Date())}
                                    onNext={() => movePeriod(1)}
                                    onCreate={() => openCreateModal()}
                                />
                            </div>

                            <div
                                className="bg-slate-900/25 px-5 py-2.5"
                                style={{ borderBottom: calendarStrongLine }}
                            >
                                <p className="text-sm font-semibold capitalize text-slate-300">
                                    {currentDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                    })}
                                </p>
                            </div>

                            {calendarHours.map((hour) => {
                                const eventsAtHour = getEventsForHour(
                                    events,
                                    currentDate,
                                    hour
                                );

                                return (
                                    <div
                                        key={hour}
                                        className="grid min-h-7"
                                        style={{
                                            gridTemplateColumns: dayGridColumns,
                                            borderBottom:
                                                hour ===
                                                calendarHours[
                                                    calendarHours.length - 1
                                                ]
                                                    ? "none"
                                                    : calendarLine,
                                        }}
                                    >
                                        <div
                                            className="px-3 py-1 text-xs text-slate-500"
                                            style={{ borderRight: calendarStrongLine }}
                                        >
                                            {String(hour).padStart(2, "0")}:00
                                        </div>

                                        <div className="bg-slate-900/10 p-1.5 transition hover:bg-slate-900/25">
                                            <div className="space-y-2">
                                                {eventsAtHour.map((event) => (
                                                    <EventPill
                                                        key={event.id}
                                                        event={event}
                                                        onEdit={openEditModal}
                                                        className="max-w-md"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </section>
                )}
                    </div>

                    <aside className="space-y-4">
                        <MiniMonthWidget
                            currentDate={currentDate}
                            events={events}
                            onSelectDate={(date) => {
                                setCurrentDate(date);
                                onCalendarViewChange("day");
                            }}
                        />
                        <CalendarSidePanel
                            currentDate={currentDate}
                            events={events}
                            onCreate={() => openCreateModal(currentDate)}
                            onEdit={openEditModal}
                        />
                    </aside>
                </section>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-2xl rounded-2xl bg-slate-800 p-5 shadow-2xl"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">
                                    {editingEvent ? "Edit event" : "New event"}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Add time, place, category and repeat status.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl bg-slate-900/70 p-2 text-slate-400 transition hover:text-white"
                                aria-label="Close event form"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="md:col-span-2">
                                <span className="text-sm text-slate-300">Title</span>
                                <input
                                    required
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm({ ...form, title: event.target.value })
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </label>

                            <label>
                                <span className="text-sm text-slate-300">Starts</span>
                                <input
                                    required
                                    type="datetime-local"
                                    value={form.startDateTime}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            startDateTime: event.target.value,
                                        })
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </label>

                            <label>
                                <span className="text-sm text-slate-300">Ends</span>
                                <input
                                    required
                                    type="datetime-local"
                                    value={form.endDateTime}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            endDateTime: event.target.value,
                                        })
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </label>

                            <label>
                                <span className="text-sm text-slate-300">Category</span>
                                <select
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            category: event.target.value as EventCategory,
                                        })
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                >
                                    {Object.entries(categoryLabels).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <label>
                                <span className="text-sm text-slate-300">Location</span>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 focus-within:border-violet-400">
                                    <MapPin size={17} className="text-slate-500" />
                                    <input
                                        value={form.location}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                location: event.target.value,
                                            })
                                        }
                                        className="w-full bg-transparent text-white outline-none"
                                    />
                                </div>
                            </label>

                            <label className="md:col-span-2">
                                <span className="text-sm text-slate-300">
                                    Description
                                </span>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            description: event.target.value,
                                        })
                                    }
                                    className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </label>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <label className="flex items-center gap-2 rounded-xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.allDay}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            allDay: event.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 accent-violet-500"
                                />
                                <Clock size={16} />
                                All day
                            </label>

                            <label className="flex items-center gap-2 rounded-xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.recurring}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            recurring: event.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 accent-violet-500"
                                />
                                <RotateCcw size={16} />
                                Recurring
                            </label>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            {editingEvent ? (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/25"
                                >
                                    <Trash2 size={17} />
                                    Delete
                                </button>
                            ) : (
                                <span />
                            )}

                            <button
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
                            >
                                <Pencil size={17} />
                                {isSaving ? "Saving..." : "Save event"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
