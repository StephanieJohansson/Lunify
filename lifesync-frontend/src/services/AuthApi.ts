import { apiFetch } from "./ApiClient";
import type { AuthUser } from "../types/AuthUser";

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = LoginPayload & {
    name: string;
};

async function parseAuthResponse(response: Response, message: string) {
    if (!response.ok) {
        throw new Error(message);
    }

    return response.json();
}

export async function getCurrentUser(): Promise<AuthUser> {
    const response = await apiFetch("/api/auth/me");

    return parseAuthResponse(response, "Not logged in");
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
    const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return parseAuthResponse(response, "Could not log in");
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
    const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return parseAuthResponse(response, "Could not create account");
}

export async function logout(): Promise<void> {
    const response = await apiFetch("/api/auth/logout", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Could not log out");
    }
}
