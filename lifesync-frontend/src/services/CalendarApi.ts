export type CalendarEvent = {
    id: number;
    title: string;
    startDateTime: string;
    endDateTime: string;
    allDay: boolean;
    description?: string;
    location?: string;
    category: string;
    recurring: boolean;
    userId: number;
};

export async function getTodayEvents(): Promise<CalendarEvent[]> {
    const response = await fetch("http://localhost:8080/api/events/today");

    if (!response.ok) {
        throw new Error("Failed to fetch today events");
    }

    return response.json();
}

export async function getWeekEvents(): Promise<CalendarEvent[]> {
    const response = await fetch("http://localhost:8080/api/events/week");

    if (!response.ok) {
        throw new Error("Failed to fetch week events");
    }

    return response.json();
}