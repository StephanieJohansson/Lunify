import { useEffect, useState } from "react";
import {
    Cloud,
    CloudRain,
    CloudSnow,
    CloudSun,
    MapPin,
    Sun,
    Zap,
} from "lucide-react";
import { getWeather, type WeatherResponse } from "../../services/WeatherApi";

function getWeatherIcon(condition: string, size = 36) {
    const lowerCondition = condition.toLowerCase();

    if (lowerCondition.includes("clear")) return <Sun className="text-yellow-300" size={size} />;
    if (lowerCondition.includes("rain")) return <CloudRain className="text-blue-300" size={size} />;
    if (lowerCondition.includes("snow")) return <CloudSnow className="text-sky-200" size={size} />;
    if (lowerCondition.includes("thunder")) return <Zap className="text-yellow-300" size={size} />;
    if (lowerCondition.includes("cloud")) return <CloudSun className="text-violet-300" size={size} />;

    return <Cloud className="text-violet-300" size={size} />;
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
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-3 text-sm shadow-lg">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Weather</h2>
                <CloudSun className="text-violet-300" size={18} />
            </div>

            {loading && (
                <div className="space-y-3">
                    <span className="block h-3 w-32 rounded-full bg-slate-700/50" />
                    <span className="block h-10 w-24 rounded-full bg-slate-700/30" />
                    <div className="grid grid-cols-3 gap-2">
                        <span className="h-11 rounded-xl bg-slate-900/40" />
                        <span className="h-11 rounded-xl bg-slate-900/40" />
                        <span className="h-11 rounded-xl bg-slate-900/40" />
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="rounded-xl bg-slate-900/40 p-3 text-sm text-slate-400">
                    <p>{error}</p>
                    <p className="mt-1 text-xs text-slate-500">
                        Allow location access to see local weather.
                    </p>
                </div>
            )}

            {!loading && weather && (
                <div className="flex min-h-0 flex-1 flex-col justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={14} className="text-violet-300" />
                        <span className="truncate">{locationName}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-semibold leading-none text-white">
                                    {Math.round(weather.temperature)}°C
                                </p>
                                <p className="pb-1 text-sm text-slate-300">
                                    {weather.condition}
                                </p>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                H: {Math.round(weather.maxTemperature)}° · L: {Math.round(weather.minTemperature)}°
                            </p>
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20">
                            {getWeatherIcon(weather.condition)}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-slate-900/40 px-3 py-2">
                            <p className="text-xs text-slate-500">Rain</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-200">
                                {weather.precipitation.toFixed(1)} mm
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-900/40 px-3 py-2">
                            <p className="text-xs text-slate-500">Wind</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-200">
                                {weather.windSpeed.toFixed(1)} m/s
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-900/40 px-3 py-2">
                            <p className="text-xs text-slate-500">UV-index</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-200">2</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
