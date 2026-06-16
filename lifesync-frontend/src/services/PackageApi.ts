import type { CalendarEvent } from "./CalendarApi";

const BASE_URL = "http://localhost:8080/api/packages";

export type PackageTrackingEvent = {
    id: number;
    status?: string;
    description?: string;
    city?: string;
    country?: string;
    eventTime?: string;
    insignificant: boolean;
};

export type PackageTracking = {
    id: number;
    packageName: string;
    trackingNumber: string;
    carrier: string;
    status?: string;
    providerStatus?: string;
    statusDescription?: string;
    expectedDeliveryDate?: string;
    expectedDeliveryStart?: string;
    expectedDeliveryEnd?: string;
    lastUpdatedAt?: string;
    lastEventTime?: string;
    lastEventLocation?: string;
    productName?: string;
    senderName?: string;
    pickupCode?: string;
    pickupPointName?: string;
    trackingUrl?: string;
    delivered: boolean;
    events?: PackageTrackingEvent[];
};

export type PackageTrackingPayload = {
    packageName: string;
    trackingNumber: string;
    carrier: string;
};

async function parsePackageResponse(response: Response, errorMessage: string) {
    if (!response.ok) {
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function getPackageCalendarEvents(): Promise<CalendarEvent[]> {
    const response = await fetch(`${BASE_URL}/calendar`);

    return parsePackageResponse(response, "Failed to fetch package calendar events");
}

export async function getUndeliveredPackages(): Promise<PackageTracking[]> {
    const response = await fetch(`${BASE_URL}/undelivered`);

    return parsePackageResponse(response, "Failed to fetch active packages");
}

export async function getDeliveredPackages(): Promise<PackageTracking[]> {
    const response = await fetch(`${BASE_URL}/delivered`);

    return parsePackageResponse(response, "Failed to fetch delivered packages");
}

export async function createPackageTracking(
    packageTracking: PackageTrackingPayload
): Promise<PackageTracking> {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(packageTracking),
    });

    return parsePackageResponse(response, "Failed to create package tracking");
}

export async function refreshPackageTracking(id: number): Promise<PackageTracking> {
    const response = await fetch(`${BASE_URL}/${id}/refresh`, {
        method: "POST",
    });

    return parsePackageResponse(response, "Failed to refresh package tracking");
}

export async function updatePackageTracking(
    packageTracking: PackageTracking
): Promise<PackageTracking> {
    const response = await fetch(`${BASE_URL}/${packageTracking.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(packageTracking),
    });

    return parsePackageResponse(response, "Failed to update package tracking");
}

export async function deletePackageTracking(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete package tracking");
    }
}
