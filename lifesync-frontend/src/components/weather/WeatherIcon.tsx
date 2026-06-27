import {
    Cloud,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    Sun,
} from "lucide-react";
import { getWeatherKind } from "./weatherKind";

export default function WeatherIcon({ condition, size = 36 }: { condition: string; size?: number }) {
    switch (getWeatherKind(condition)) {
        case "thunder":
            return <CloudLightning className="text-amber-300" size={size} />;
        case "snow":
            return <CloudSnow className="text-sky-100" size={size} />;
        case "rain":
            return <CloudRain className="text-sky-300" size={size} />;
        case "partly-cloudy":
            return <CloudSun className="text-violet-300" size={size} />;
        case "mostly-cloudy":
        case "cloudy":
            return <Cloud className="text-slate-300" size={size} />;
        default:
            return <Sun className="text-yellow-300" size={size} />;
    }
}
