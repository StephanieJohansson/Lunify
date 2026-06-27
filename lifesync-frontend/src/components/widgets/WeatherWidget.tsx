import { useEffect, useState } from "react";
import {
    CloudSun,
    ArrowRight,
} from "lucide-react";
import { getWeather, type WeatherResponse } from "../../services/WeatherApi";
import WeatherIcon from "../weather/WeatherIcon";

export default function WeatherWidget({ onShowAdvanced }: { onShowAdvanced: () => void }) {
    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                            <WeatherIcon condition={weather.condition} />
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

            <button
                type="button"
                onClick={onShowAdvanced}
                className="mt-auto flex w-full items-center justify-between border-t border-slate-700/70 pt-2.5 text-xs font-semibold text-violet-300 transition hover:text-violet-200"
            >
                Show advanced weather
                <ArrowRight size={14} />
            </button>
        </section>
    );
}
