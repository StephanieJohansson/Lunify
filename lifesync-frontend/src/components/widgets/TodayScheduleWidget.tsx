import type { CalendarEvent } from "../../services/CalendarApi";

type TodayScheduleWidgetProps = {
    events: CalendarEvent[];
    onShowAll?: () => void;
};

function formatTime(dateTime: string) {
    return new Date(dateTime).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function TodayScheduleWidget({
    events,
    onShowAll,
}: TodayScheduleWidgetProps) {
    const emptyRows = ["09:00", "11:00", "13:00", "15:00", "17:00"];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
            <h2 className="mb-3 text-base font-semibold text-white">
                Today Schedule
            </h2>

            {events.length === 0 ? (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {emptyRows.map((time) => (
                        <div
                            key={time}
                            className="flex items-center gap-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 p-3"
                        >
                            <span className="w-11 text-xs font-medium text-slate-500">
                                {time}
                            </span>
                            <span className="h-2 flex-1 rounded-full bg-slate-700/40" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-sm"
                        >
                            <div>
                                <p className="font-medium text-white">
                                    {event.title}
                                </p>

                                {event.location && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {event.location}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 h-full">
                                <p className="text-slate-300">
                                    {formatTime(event.startDateTime)}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {formatTime(event.endDateTime)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={onShowAll}
                className="mt-3 rounded-xl border border-violet-400/20 bg-slate-900/35 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15"
            >
                Show all tasks and events today
            </button>
        </section>
    );
}
