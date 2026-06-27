package se.stephanie.lifesync.weather;

import java.util.List;

public record WeatherForecastResponse(
        WeatherResponse current,
        List<DailyWeatherResponse> days,
        String source
) {
}
