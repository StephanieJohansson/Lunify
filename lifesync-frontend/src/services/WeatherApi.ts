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

export type DailyWeather = {
    date: string;
    minTemperature: number;
    maxTemperature: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
};

export type WeatherForecastResponse = {
    current: WeatherResponse;
    days: DailyWeather[];
    source: string;
};

export type WeatherLocation = {
    name: string;
    displayName: string;
    latitude: number;
    longitude: number;
};

export async function getWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const response = await apiFetch(`/api/weather?lat=${lat}&lon=${lon}`);

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    return response.json();
}

export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecastResponse> {
    const response = await apiFetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error("Failed to fetch forecast");
    return response.json();
}

export async function searchWeatherLocations(query: string, signal?: AbortSignal): Promise<WeatherLocation[]> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(query)}`,
        { signal }
    );
    if (!response.ok) throw new Error("Failed to search locations");
    const results = await response.json() as Array<{ display_name: string; lat: string; lon: string; name?: string }>;
    return results.map((result) => ({
        name: result.name || result.display_name.split(",")[0],
        displayName: result.display_name,
        latitude: Number(result.lat),
        longitude: Number(result.lon),
    }));
}
