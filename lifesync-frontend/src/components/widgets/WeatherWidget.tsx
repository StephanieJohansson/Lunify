import { useEffect, useState } from "react";
import {
    Cloud,
    CloudRain,
    CloudSnow,
    CloudSun,
    Sun,
    Zap,
    MapPin,
    CheckCircle2,
} from "lucide-react";
import { getWeather, type WeatherResponse } from "../../services/WeatherApi";

function getWeatherIcon(condition: string) {
    const lowerCondition = condition.toLowerCase();

    if (lowerCondition.includes("clear")) return <Sun className="text-yellow-300" size={30} />;
    if (lowerCondition.includes("rain")) return <CloudRain className="text-blue-300" size={30} />;
    if (lowerCondition.includes("snow")) return <CloudSnow className="text-sky-200" size={30} />;
    if (lowerCondition.includes("thunder")) return <Zap className="text-yellow-300" size={30} />;
    if (lowerCondition.includes("cloud")) return <CloudSun className="text-violet-300" size={30} />;

    return <Cloud className="text-violet-300" size={30} />;
}

function shouldShowReminder(reminder: string) {
    return reminder && reminder !== "No special weather reminder today.";
}

function getWindLabel(windSpeed: number) {
    if (windSpeed < 2) return "Calm";
    if (windSpeed < 6) return "Light wind";
    if (windSpeed < 10) return "Windy";
    return "Strong wind";
}

function getRainLabel(precipitation: number) {
    if (precipitation <= 0) return "No rain";
    if (precipitation < 1) return "Light rain";
    if (precipitation < 4) return "Rain expected";
    return "Heavy rain";
}

type NominatimResponse = {
    address?: {
        village?: string;
        town?: string;
        city?: string;
        municipality?: string;
        county?: string;
        country?: string;
    };
};

function formatLocationName(data: NominatimResponse) {
    const address = data.address;

    const place =
        address?.village ||
        address?.town ||
        address?.city ||
        address?.municipality ||
        address?.county;

    const country = address?.country;

    if (place && country) {
        return `${place}, ${country}`;
    }

    return place || country || "Your location";
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locationName, setLocationName] = useState("Your location");

    async function getLocationName(latitude: number, longitude: number) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
            return "Your location";
        }

        const data = await response.json();

        return formatLocationName(data);
    }

    useEffect(() => {
        const loadWeather = () => {
            if (!navigator.geolocation) {
                setError("Location is not supported by your browser.");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    getLocationName(latitude, longitude)
                        .then(setLocationName)
                        .catch(() => setLocationName("Your location"));

                    getWeather(latitude, longitude)
                        .then(setWeather)
                        .catch(() => setError("Could not load weather."))
                        .finally(() => setLoading(false));
                },
                () => {
                    setError("Location permission denied.");
                    setLoading(false);
                }
            );
        };

        loadWeather();
    }, []);

    return (
        <section className="rounded-2xl bg-slate-800/80 p-4 shadow-lg text-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Weather</h2>
                <CloudSun className="text-violet-300" size={22} />
            </div>

            {loading && (
                <p className="text-sm text-slate-400">Loading weather...</p>
            )}

            {!loading && error && (
                <div>
                    <p className="text-sm text-slate-400">{error}</p>
                    <p className="mt-2 text-xs text-slate-500">
                        Allow location access to see local weather.
                    </p>
                </div>
            )}

            {!loading && weather && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={15} className="text-violet-300" />
                            <span>{locationName}</span>
                        </div>

                        <span className="text-xs text-slate-500">Updated now</span>
                    </div>

                    <div className="rounded-2xl bg-slate-900/30 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-bold text-white">
                                        {Math.round(weather.temperature)}°C
                                    </p>

                                    <p className="pb-2 text-sm text-slate-300">
                                        {weather.condition}
                                    </p>
                                </div>

                                <div className="mt-3 flex gap-3 text-xs text-slate-400">
                                    <span>H: {Math.round(weather.maxTemperature)}°</span>
                                    <span>L: {Math.round(weather.minTemperature)}°</span>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-violet-500/20 p-5">
                                {getWeatherIcon(weather.condition)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-900/40 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Wind
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-200">
                                {getWindLabel(weather.windSpeed)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {weather.windSpeed.toFixed(1)} m/s
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-900/40 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Rain
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-200">
                                {getRainLabel(weather.precipitation)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {weather.precipitation.toFixed(1)} mm
                            </p>
                        </div>
                    </div>

                    {shouldShowReminder(weather.reminder) ? (
                        <div className="rounded-xl bg-violet-500/10 p-3">
                            <p className="text-xs uppercase tracking-wide text-violet-300">
                                Weather note
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                                {weather.reminder}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-slate-900/40 p-3 text-sm text-slate-400">
                            <CheckCircle2 size={16} className="text-emerald-300" />
                            <span>No weather alerts today.</span>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}