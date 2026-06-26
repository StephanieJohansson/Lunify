import { apiFetch } from "./ApiClient";

export type WeatherResponse = {
    temperature: number;
    condition: string;
    reminder: string;
    windSpeed: number;
    precipitation: number;
    minTemperature: number;
    maxTemperature: number;
};

export async function getWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const response = await apiFetch(`/api/weather?lat=${lat}&lon=${lon}`);

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    return response.json();
}
