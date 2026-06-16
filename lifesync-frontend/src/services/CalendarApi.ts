export type CalendarEvent = {
    id: number | string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    allDay: boolean;
    description?: string;
    location?: string;
    category: string;
    recurring: boolean;
    source?: "CALENDAR" | "PACKAGE";
    packageId?: number;
    carrier?: string;
    trackingNumber?: string;
    packageStatus?: string;
    userId?: number;
    user?: {
        id: number;
        name?: string;
        email?: string;
    };
};

export type EventCategory =
    | "WORK"
    | "HEALTH"
    | "FAMILY"
    | "PERSONAL"
    | "EDUCATION";

export type CalendarEventPayload = {
    title: string;
    startDateTime: string;
    endDateTime: string;
    allDay: boolean;
    description?: string;
    location?: string;
    category: EventCategory;
    recurring: boolean;
};

const BASE_URL = "http://localhost:8080/api/events";

async function parseEventResponse(response: Response, errorMessage: string) {
    if (!response.ok) {
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
    const response = await fetch(BASE_URL);

    return parseEventResponse(response, "Failed to fetch calendar events");
}

export async function getTodayEvents(): Promise<CalendarEvent[]> {
    const response = await fetch(`${BASE_URL}/today`);

    return parseEventResponse(response, "Failed to fetch today events");
}

export async function getWeekEvents(): Promise<CalendarEvent[]> {
    const response = await fetch(`${BASE_URL}/week`);

    return parseEventResponse(response, "Failed to fetch week events");
}

export async function createEvent(
    event: CalendarEventPayload
): Promise<CalendarEvent> {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
    });

    return parseEventResponse(response, "Failed to create calendar event");
}

export async function updateEvent(
    id: number,
    event: CalendarEventPayload
): Promise<CalendarEvent> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
    });

    return parseEventResponse(response, "Failed to update calendar event");
}

export async function deleteEvent(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete calendar event");
    }
}
