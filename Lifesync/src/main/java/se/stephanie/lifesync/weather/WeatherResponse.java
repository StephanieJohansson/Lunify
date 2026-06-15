package se.stephanie.lifesync.weather;

public record WeatherResponse(
        double temperature,
        String condition,
        String reminder,
        double windSpeed,
        double precipitation,
        double minTemperature,
        double maxTemperature
) {
}