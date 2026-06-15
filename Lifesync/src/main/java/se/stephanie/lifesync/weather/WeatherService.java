package se.stephanie.lifesync.weather;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherResponse getWeather(double lat, double lon) {
        String url = "https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/"
                + lon
                + "/lat/"
                + lat
                + "/data.json?timeseries=24&parameters=air_temperature,wind_speed,precipitation_amount,symbol_code";

        Map response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("timeSeries")) {
            return new WeatherResponse(0, "Weather unavailable", "Could not load weather data.", 0, 0, 0, 0);
        }

        List<Map<String, Object>> timeSeries =
                (List<Map<String, Object>>) response.get("timeSeries");

        if (timeSeries.isEmpty()) {
            return new WeatherResponse(0, "Weather unavailable", "Could not load weather data.", 0, 0, 0, 0);
        }

        Map<String, Object> firstForecast = timeSeries.get(0);
        Map<String, Object> data = (Map<String, Object>) firstForecast.get("data");

        double temperature = getDouble(data, "air_temperature");
        double windSpeed = getDouble(data, "wind_speed");
        double precipitation = getDouble(data, "precipitation_amount");
        int symbolCode = (int) getDouble(data, "symbol_code");

        double minTemperature = timeSeries.stream()
                .map(item -> (Map<String, Object>) item.get("data"))
                .mapToDouble(itemData -> getDouble(itemData, "air_temperature"))
                .min()
                .orElse(temperature);

        double maxTemperature = timeSeries.stream()
                .map(item -> (Map<String, Object>) item.get("data"))
                .mapToDouble(itemData -> getDouble(itemData, "air_temperature"))
                .max()
                .orElse(temperature);

        String condition = mapSymbolCode(symbolCode);
        String reminder = buildReminder(temperature, symbolCode, windSpeed, precipitation);

        return new WeatherResponse(
                temperature,
                condition,
                reminder,
                windSpeed,
                precipitation,
                minTemperature,
                maxTemperature
        );
    }
    private double getDouble(Map<String, Object> data, String key) {
        Object value = data.get(key);

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        return 0;
    }

    private String mapSymbolCode(int code) {
        return switch (code) {
            case 1, 2 -> "Clear sky";
            case 3, 4 -> "Partly cloudy";
            case 5, 6 -> "Cloudy";
            case 7 -> "Fog";
            case 8, 9, 10, 18, 19, 20 -> "Rain";
            case 11, 21 -> "Thunder";
            case 12, 13, 14, 22, 23, 24 -> "Sleet";
            case 15, 16, 17, 25, 26, 27 -> "Snow";
            default -> "Weather";
        };
    }

    private String buildReminder(
            double temperature,
            int symbolCode,
            double windSpeed,
            double precipitation
    ) {
        if (precipitation > 0.5 || (symbolCode >= 8 && symbolCode <= 10)) {
            return "Bring an umbrella today.";
        }

        if (symbolCode >= 15 && symbolCode <= 27) {
            return "Snow expected. Plan extra travel time.";
        }

        if (windSpeed >= 8) {
            return "It may be windy today.";
        }

        if (temperature <= 5) {
            return "Bring a warm jacket today.";
        }

        if (temperature >= 22) {
            return "Looks warm today. Remember water.";
        }

        return "No special weather reminder today.";
    }
}