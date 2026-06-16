import type { CalendarEvent } from "../../services/CalendarApi";

type TodayScheduleWidgetProps = {
    events: CalendarEvent[];
};

function formatTime(dateTime: string) {
    return new Date(dateTime).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function TodayScheduleWidget({ events }: TodayScheduleWidgetProps) {
    return (
        <section className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
            <h2 className="mb-3 text-lg font-semibold text-white">
                Today Schedule
            </h2>

            {events.length === 0 ? (
                <p className="text-sm text-slate-400">
                    No events scheduled today.
                </p>
            ) : (
                <div className="space-y-1">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between rounded-xl bg-slate-900/60 p-2.5 text-sm"
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

                            <div className="flex h-full flex-col gap-2">
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
        </section>
    );
}
