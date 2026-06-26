import type { CalendarEvent } from "../../services/CalendarApi";

type WeekViewWidgetProps = {
    events: CalendarEvent[];
    onShowAll?: () => void;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = [8, 10, 12, 14, 16, 18, 20];
const startHour = 8;
const endHour = 20;
const totalMinutes = (endHour - startHour) * 60;

const categoryStyles: Record<string, string> = {
    WORK: "border-pink-400/50 bg-pink-500/20 text-pink-50",
    HEALTH: "border-emerald-400/50 bg-emerald-500/20 text-emerald-50",
    FAMILY: "border-amber-300/50 bg-amber-500/20 text-amber-50",
    PERSONAL: "border-violet-400/50 bg-violet-500/20 text-violet-50",
    EDUCATION: "border-sky-400/50 bg-sky-500/20 text-sky-50",
    PACKAGE: "border-fuchsia-300/40 bg-fuchsia-500/20 text-fuchsia-50",
};

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
    return events
        .filter((event) => isSameDay(new Date(event.startDateTime), date))
        .sort(
            (a, b) =>
                new Date(a.startDateTime).getTime() -
                new Date(b.startDateTime).getTime()
        );
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getEventLayout(event: CalendarEvent) {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const startMinutes = (start.getHours() - startHour) * 60 + start.getMinutes();
    const durationMinutes = Math.max((end.getTime() - start.getTime()) / 60000, 45);
    const top = clamp((startMinutes / totalMinutes) * 100, 0, 92);
    const height = clamp((durationMinutes / totalMinutes) * 100, 12, 26);

    return { top, height };
}

function getNowLineTop(now: Date) {
    const nowMinutes = (now.getHours() - startHour) * 60 + now.getMinutes();

    if (nowMinutes < 0 || nowMinutes > totalMinutes) {
        return null;
    }

    return (nowMinutes / totalMinutes) * 100;
}

function getHourTop(hour: number) {
    return clamp(((hour - startHour) / (endHour - startHour)) * 100, 0, 96);
}

export default function WeekViewWidget({
    events,
    onShowAll,
}: WeekViewWidgetProps) {
    const now = new Date();
    const monday = getMonday(now);
    const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const nowLineTop = getNowLineTop(now);

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
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-white">
                        This Week
                    </h2>
                    <p className="text-xs text-slate-400">
                        Your schedule overview
                    </p>
                </div>

                <button className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
                    Week
                </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[3rem_repeat(7,minmax(0,1fr))] grid-rows-[2.6rem_minmax(0,1fr)] overflow-hidden rounded-xl bg-slate-900/25 pb-4">
                <div className="border-b border-slate-700/40" />

                {weekDays.map((day, index) => {
                    const isToday = index === todayIndex;

                    return (
                        <div
                            key={day.label}
                            className="flex flex-col items-center justify-center border-b border-l border-slate-700/40"
                        >
                            <span className="text-[11px] font-medium text-slate-500">
                                {day.label}
                            </span>
                            <span
                                className={`mt-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                                    isToday
                                        ? "bg-pink-500 text-white"
                                        : "bg-violet-500/20 text-violet-200"
                                }`}
                            >
                                {day.dayNumber}
                            </span>
                        </div>
                    );
                })}

                <div className="relative border-r border-slate-700/40">
                    {hours.map((hour) => (
                        <span
                            key={hour}
                            className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-500"
                            style={{
                                top: `${getHourTop(hour)}%`,
                            }}
                        >
                            {String(hour).padStart(2, "0")}:00
                        </span>
                    ))}
                </div>

                <div className="relative col-span-7 grid min-h-0 grid-cols-7">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="pointer-events-none absolute left-0 right-0 border-t border-slate-700/35"
                            style={{
                                top: `${getHourTop(hour)}%`,
                            }}
                        />
                    ))}

                    {nowLineTop !== null && (
                        <div
                            className="pointer-events-none absolute z-20 h-px bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.7)]"
                            style={{
                                top: `${nowLineTop}%`,
                                left: `${(todayIndex / 7) * 100}%`,
                                width: `${100 / 7}%`,
                            }}
                        >
                            <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-pink-400" />
                        </div>
                    )}

                    {weekDays.map((day) => (
                        <div
                            key={day.label}
                            className="relative border-l border-slate-700/35 px-2"
                        >
                            {day.events.map((event) => {
                                const layout = getEventLayout(event);
                                const style =
                                    categoryStyles[event.category] ??
                                    categoryStyles.PERSONAL;

                                return (
                                    <div
                                        key={event.id}
                                        className={`absolute left-2 right-2 overflow-hidden rounded-lg border px-2 py-1.5 shadow-lg shadow-slate-950/20 ${style}`}
                                        style={{
                                            top: `${layout.top}%`,
                                            minHeight: `${layout.height}%`,
                                        }}
                                    >
                                        <p className="truncate text-xs font-semibold">
                                            {event.title}
                                        </p>
                                        <p className="mt-0.5 text-[11px] opacity-80">
                                            {formatTime(event.startDateTime)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={onShowAll}
                className="mt-3 rounded-xl border border-violet-400/20 bg-slate-900/35 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15"
            >
                Show full week in calendar
            </button>
        </section>
    );
}
