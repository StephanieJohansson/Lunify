package se.stephanie.lifesync.weather;

import java.time.LocalDate;

public record DailyWeatherResponse(
        LocalDate date,
        double minTemperature,
        double maxTemperature,
        String condition,
        double precipitation,
        double windSpeed
) {
}
