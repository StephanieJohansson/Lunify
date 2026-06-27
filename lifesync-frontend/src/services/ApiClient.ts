const API_BASE_URL = "http://localhost:8080";

let csrfToken: string | null = null;

async function getCsrfToken() {
    if (csrfToken) return csrfToken;

    const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, { credentials: "include" });
    if (!response.ok) throw new Error("Could not initialize request security");
    const payload = await response.json() as { token: string };
    csrfToken = payload.token;
    return csrfToken;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const method = (options.method ?? "GET").toUpperCase();
    const csrfHeader: Record<string, string> = {};
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        csrfHeader["X-XSRF-TOKEN"] = await getCsrfToken();
    }

    return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...csrfHeader,
            ...options.headers,
        },
    });
}
