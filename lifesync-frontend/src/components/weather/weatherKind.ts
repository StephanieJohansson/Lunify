export type WeatherKind =
    | "clear"
    | "partly-cloudy"
    | "mostly-cloudy"
    | "cloudy"
    | "rain"
    | "thunder"
    | "snow";

export function getWeatherKind(condition: string): WeatherKind {
    const value = condition.toLowerCase();

    if (value.includes("thunder") || value.includes("lightning")) return "thunder";
    if (value.includes("snow")) return "snow";
    if (value.includes("rain") || value.includes("sleet")) return "rain";
    if (value.includes("mostly cloudy")) return "mostly-cloudy";
    if (value.includes("partly cloudy")) return "partly-cloudy";
    if (value.includes("cloud") || value.includes("overcast") || value.includes("fog")) return "cloudy";
    return "clear";
}
