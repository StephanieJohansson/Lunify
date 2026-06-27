package se.stephanie.lifesync.weather;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /* GET */
    @GetMapping("/api/weather")
    public WeatherResponse getWeather(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        return weatherService.getWeather(lat, lon);
    }

    @GetMapping("/api/weather/forecast")
    public WeatherForecastResponse getForecast(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        return weatherService.getForecast(lat, lon);
    }
}
