import type {DashboardSummary} from "../types/DashboardSummary";
import { apiFetch } from "./ApiClient";

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiFetch("/api/dashboard/summary");

    return response.json();
}
