import type { CalendarEvent } from "../../services/CalendarApi";

type WeekViewWidgetProps = {
    events: CalendarEvent[];
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(date: Date) {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function formatTime(dateTime: string) {
    return new Date(dateTime).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
}

function getEventsForDay(events: CalendarEvent[], date: Date) {
    return events.filter((event) =>
        isSameDay(new Date(event.startDateTime), date)
    );
}

export default function WeekViewWidget({ events }: WeekViewWidgetProps) {
    const monday = getMonday(new Date());

    const weekDays = days.map((day, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);

        return {
            label: day,
            date,
            dayNumber: date.getDate(),
            events: getEventsForDay(events, date),
        };
    });

    return (
        <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        This Week
                    </h2>
                    <p className="text-sm text-slate-400">
                        Your schedule overview
                    </p>
                </div>

                <button className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
                    Week
                </button>
            </div>

            <div className="grid grid-cols-7 gap-3">
                {weekDays.map((day) => (
                    <div
                        key={day.label}
                        className="min-h-60 rounded-2xl bg-slate-900/40 p-3"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wide text-slate-500">
                                {day.label}
                            </span>

                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">
                                {day.dayNumber}
                            </span>
                        </div>

                        {day.events.length === 0 ? (
                            <p className="text-xs text-slate-600">
                                No events
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {day.events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="rounded-xl bg-violet-500/15 p-2"
                                    >
                                        <p className="text-xs font-semibold text-white">
                                            {event.title}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {formatTime(event.startDateTime)}
                                        </p>

                                        {event.location && (
                                            <p className="mt-1 truncate text-[11px] text-slate-500">
                                                {event.location}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}