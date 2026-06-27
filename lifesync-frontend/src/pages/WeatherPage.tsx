import { useEffect, useRef, useState } from "react";
import {
    Droplets,
    LocateFixed,
    MapPin,
    Moon,
    Search,
    Wind,
} from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import type { Page, SettingsSection } from "../App";
import type { AuthUser } from "../types/AuthUser";
import weatherSkyHero from "../assets/weather-sky-hero.png";
import weatherSkyCloudy from "../assets/weather-sky-cloudy.png";
import weatherSkyMostlyCloudy from "../assets/weather-sky-mostly-cloudy.png";
import weatherSkyRain from "../assets/weather-sky-rain.png";
import weatherSkyThunder from "../assets/weather-sky-thunder.png";
import weatherSkySnow from "../assets/weather-sky-snow.png";
import weatherSkyNight from "../assets/weather-sky-night.png";
import WeatherIcon from "../components/weather/WeatherIcon";
import { getWeatherKind } from "../components/weather/weatherKind";
import { isNightAt } from "../components/weather/sunPosition";
import {
    getWeatherForecast,
    searchWeatherLocations,
    type WeatherForecastResponse,
    type WeatherLocation,
} from "../services/WeatherApi";

type WeatherPageProps = {
    activePage: Page;
    currentUser: AuthUser;
    onCreateEvent: () => void;
    onCreatePackage: () => void;
    onLogout: () => void;
    onOpenSettings: (section: SettingsSection) => void;
    onPageChange: (page: Page) => void;
};

function weatherHero(condition: string, night: boolean) {
    if (night) return weatherSkyNight;

    switch (getWeatherKind(condition)) {
        case "thunder": return weatherSkyThunder;
        case "snow": return weatherSkySnow;
        case "rain": return weatherSkyRain;
        case "cloudy": return weatherSkyCloudy;
        case "mostly-cloudy":
        case "partly-cloudy": return weatherSkyMostlyCloudy;
        default: return weatherSkyHero;
    }
}

function dayLabel(date: string, index: number) {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

export default function WeatherPage(props: WeatherPageProps) {
    const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
    const [locationName, setLocationName] = useState("Your location");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<WeatherLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const skipNextSuggestionSearch = useRef(false);

    function loadForecast(latitude: number, longitude: number, name: string) {
        setLoading(true);
        setError("");
        setForecast(null);
        setLocationName(name);
        setCoordinates({ latitude, longitude });
        getWeatherForecast(latitude, longitude)
            .then(setForecast)
            .catch(() => setError("Could not load the forecast for this location."))
            .finally(() => setLoading(false));
    }

    function useMyLocation() {
        if (!navigator.geolocation) {
            setError("Location is not supported by your browser.");
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => loadForecast(coords.latitude, coords.longitude, "Your location"),
            () => {
                setError("Allow location access or search for a place above.");
                setLoading(false);
            }
        );
    }

    useEffect(() => {
        if (!navigator.geolocation) {
            queueMicrotask(() => {
                setError("Location is not supported by your browser.");
                setLoading(false);
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => loadForecast(coords.latitude, coords.longitude, "Your location"),
            () => {
                setError("Allow location access or search for a place above.");
                setLoading(false);
            }
        );
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const night = coordinates
        ? isNightAt(coordinates.latitude, coordinates.longitude, currentTime)
        : false;

    useEffect(() => {
        if (skipNextSuggestionSearch.current) {
            skipNextSuggestionSearch.current = false;
            return;
        }

        const searchText = query.trim();
        if (searchText.length < 2) {
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setSearching(true);
            searchWeatherLocations(searchText, controller.signal)
                .then(setResults)
                .catch((searchError) => {
                    if (searchError instanceof DOMException && searchError.name === "AbortError") return;
                    setResults([]);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setSearching(false);
                });
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [query]);

    async function handleSearch(event: React.FormEvent) {
        event.preventDefault();
        if (query.trim().length < 2) return;
        setSearching(true);
        setError("");
        try {
            setResults(await searchWeatherLocations(query.trim()));
        } catch {
            setError("Could not search for that place.");
        } finally {
            setSearching(false);
        }
    }

    function selectLocation(location: WeatherLocation) {
        skipNextSuggestionSearch.current = true;
        setQuery(location.name);
        setResults([]);
        loadForecast(location.latitude, location.longitude, location.displayName);
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar activePage={props.activePage} currentUser={props.currentUser} onPageChange={props.onPageChange} />
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-3">
                <Header
                    currentUser={props.currentUser}
                    onCreateEvent={props.onCreateEvent}
                    onCreatePackage={props.onCreatePackage}
                    onLogout={props.onLogout}
                    onOpenSettings={props.onOpenSettings}
                />

                <div className="weather-scrollbar min-h-0 flex-1 overflow-y-auto pb-6 pr-1">
                    <section className="relative overflow-visible rounded-3xl border border-white/10 p-6 shadow-[0_24px_70px_-28px_rgba(91,33,182,0.75)]">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                            <img
                                src={forecast ? weatherHero(forecast.current.condition, night) : weatherSkyHero}
                                alt=""
                                className="h-full w-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(15,23,42,0.10)_0%,rgba(30,41,59,0.18)_38%,rgba(49,46,129,0.82)_67%,rgba(15,23,42,0.97)_100%)]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
                        </div>

                        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                            <div>
                                <p className="text-sm font-medium text-violet-200">10-day forecast</p>
                                <h1 className="mt-1 text-3xl font-bold">Weather</h1>
                                <p className="mt-2 flex max-w-xl items-center gap-2 text-sm text-violet-100/80">
                                    <MapPin size={16} /> <span className="truncate">{locationName}</span>
                                </p>
                            </div>

                            <div className="relative w-full max-w-xl">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            value={query}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                setQuery(value);
                                                if (value.trim().length < 2) setResults([]);
                                            }}
                                            placeholder="Search city or place"
                                            className="w-full rounded-xl border border-white/15 bg-slate-950/80 py-3 pl-10 pr-3 text-sm shadow-lg outline-none backdrop-blur-md focus:border-violet-300"
                                        />
                                    </div>
                                    <button className="rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-violet-100">
                                        {searching ? "Searching..." : "Search"}
                                    </button>
                                    <button type="button" onClick={useMyLocation} title="Use my location" className="rounded-xl bg-white/15 px-3 hover:bg-white/25">
                                        <LocateFixed size={18} />
                                    </button>
                                </form>

                                {results.length > 0 && (
                                    <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
                                        {results.map((location) => (
                                            <button
                                                key={`${location.latitude}-${location.longitude}`}
                                                onClick={() => selectLocation(location)}
                                                className="block w-full border-b border-slate-800 px-4 py-3 text-left last:border-0 hover:bg-slate-800"
                                            >
                                                <span className="block text-sm font-medium">{location.name}</span>
                                                <span className="block truncate text-xs text-slate-400">{location.displayName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {forecast && !loading && (
                            <div className="relative z-0 mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-white/15 bg-slate-950/35 p-5 shadow-2xl backdrop-blur-md sm:flex-row sm:items-end">
                                <div className="flex items-center gap-5">
                                    <div>
                                        <p className="text-6xl font-semibold drop-shadow-lg">{Math.round(forecast.current.temperature)}°</p>
                                        <p className="mt-2 text-slate-100">{forecast.current.condition}</p>
                                    </div>
                                    <div className="hidden rounded-2xl bg-white/10 p-4 sm:block">
                                        {night
                                            ? <Moon className="text-indigo-100" size={52} />
                                            : <WeatherIcon condition={forecast.current.condition} size={52} />}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-72">
                                    <div className="rounded-xl bg-slate-950/45 px-4 py-3">
                                        <p className="text-xs text-slate-300">Precipitation</p>
                                        <p className="mt-1 font-semibold">{forecast.current.precipitation.toFixed(1)} mm</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-950/45 px-4 py-3">
                                        <p className="text-xs text-slate-300">Wind</p>
                                        <p className="mt-1 font-semibold">{forecast.current.windSpeed.toFixed(1)} m/s</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {loading && <div className="mt-4 rounded-2xl bg-slate-800 p-8 text-center text-slate-400">Loading forecast...</div>}
                    {error && <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

                    {forecast && !loading && (
                        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-b from-slate-800/95 to-slate-900/95 shadow-[0_22px_55px_-35px_rgba(99,102,241,0.7)]">
                            <div className="border-b border-slate-700 px-5 py-4">
                                <h2 className="font-semibold">Next 10 days</h2>
                                <p className="mt-1 text-xs text-slate-400">Forecast data from {forecast.source}</p>
                            </div>
                            <div className="divide-y divide-slate-700/70">
                                {forecast.days.map((day, index) => (
                                    <div key={day.date} className="grid grid-cols-[minmax(7rem,1fr)_3rem_minmax(7rem,1fr)] items-center gap-3 px-5 py-4 sm:grid-cols-[minmax(9rem,1.4fr)_4rem_minmax(9rem,1fr)_8rem_8rem]">
                                        <div>
                                            <p className="font-semibold">{dayLabel(day.date, index)}</p>
                                            <p className="text-xs text-slate-500">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                        </div>
                                        <div><WeatherIcon condition={day.condition} size={30} /></div>
                                        <p className="text-sm text-slate-300">{day.condition}</p>
                                        <p className="hidden text-sm sm:block"><span className="font-semibold">{Math.round(day.maxTemperature)}°</span> <span className="text-slate-500">/ {Math.round(day.minTemperature)}°</span></p>
                                        <div className="hidden items-center gap-4 text-xs text-slate-400 sm:flex">
                                            <span className="flex items-center gap-1"><Droplets size={14} className="text-sky-300" />{day.precipitation.toFixed(1)} mm</span>
                                            <span className="flex items-center gap-1"><Wind size={14} />{day.windSpeed.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
