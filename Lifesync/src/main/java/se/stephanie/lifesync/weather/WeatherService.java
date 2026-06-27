package se.stephanie.lifesync.weather;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherResponse getWeather(double lat, double lon) {
        try {
            return getSmhiWeather(lat, lon);
        } catch (RuntimeException exception) {
            return getGlobalForecast(lat, lon).current();
        }
    }

    public WeatherForecastResponse getForecast(double lat, double lon) {
        try {
            return getSmhiForecast(lat, lon);
        } catch (RuntimeException exception) {
            return getGlobalForecast(lat, lon);
        }
    }

    private WeatherResponse getSmhiWeather(double lat, double lon) {
        JsonNode timeSeries = loadSmhiForecast(lat, lon, 24).path("timeSeries");
        if (!timeSeries.isArray() || timeSeries.isEmpty()) {
            throw new IllegalStateException("SMHI returned an empty forecast");
        }

        JsonNode data = timeSeries.get(0).path("data");
        double temperature = value(data, "air_temperature");
        double windSpeed = value(data, "wind_speed");
        double precipitation = value(data, "precipitation_amount_mean_deterministic");
        int symbolCode = (int) value(data, "symbol_code");
        double minTemperature = temperature;
        double maxTemperature = temperature;

        for (JsonNode item : timeSeries) {
            double itemTemperature = value(item.path("data"), "air_temperature");
            minTemperature = Math.min(minTemperature, itemTemperature);
            maxTemperature = Math.max(maxTemperature, itemTemperature);
        }

        return new WeatherResponse(
                temperature,
                mapSymbolCode(symbolCode),
                buildReminder(temperature, symbolCode, windSpeed, precipitation),
                windSpeed,
                precipitation,
                minTemperature,
                maxTemperature
        );
    }

    private WeatherForecastResponse getSmhiForecast(double lat, double lon) {
        JsonNode timeSeries = loadSmhiForecast(lat, lon, null).path("timeSeries");
        if (!timeSeries.isArray() || timeSeries.isEmpty()) {
            throw new IllegalStateException("SMHI returned an empty forecast");
        }

        Map<LocalDate, List<JsonNode>> byDate = new LinkedHashMap<>();
        for (JsonNode item : timeSeries) {
            try {
                LocalDate date = OffsetDateTime.parse(item.path("time").asText()).toLocalDate();
                byDate.computeIfAbsent(date, ignored -> new ArrayList<>()).add(item);
            } catch (RuntimeException ignored) {
                // A malformed time point should not make the complete forecast unusable.
            }
        }

        List<DailyWeatherResponse> days = byDate.entrySet().stream()
                .limit(10)
                .map(entry -> summarizeSmhiDay(entry.getKey(), entry.getValue()))
                .toList();

        return new WeatherForecastResponse(toCurrentWeather(timeSeries), days, "SMHI");
    }

    private DailyWeatherResponse summarizeSmhiDay(LocalDate date, List<JsonNode> items) {
        double min = Double.POSITIVE_INFINITY;
        double max = Double.NEGATIVE_INFINITY;
        double precipitation = 0;
        double wind = 0;

        for (JsonNode item : items) {
            JsonNode data = item.path("data");
            double temperature = value(data, "air_temperature");
            min = Math.min(min, temperature);
            max = Math.max(max, temperature);
            precipitation += value(data, "precipitation_amount_mean_deterministic");
            wind = Math.max(wind, value(data, "wind_speed"));
        }

        JsonNode representative = items.stream()
                .min(Comparator.comparingInt(item -> Math.abs(forecastHour(item) - 12)))
                .map(item -> item.path("data"))
                .orElse(objectMapper.createObjectNode());

        return new DailyWeatherResponse(
                date,
                Double.isFinite(min) ? min : 0,
                Double.isFinite(max) ? max : 0,
                mapSymbolCode((int) value(representative, "symbol_code")),
                precipitation,
                wind
        );
    }

    private WeatherResponse toCurrentWeather(JsonNode timeSeries) {
        JsonNode data = timeSeries.get(0).path("data");
        double temperature = value(data, "air_temperature");
        double wind = value(data, "wind_speed");
        double precipitation = value(data, "precipitation_amount_mean_deterministic");
        int symbol = (int) value(data, "symbol_code");

        return new WeatherResponse(
                temperature,
                mapSymbolCode(symbol),
                buildReminder(temperature, symbol, wind, precipitation),
                wind,
                precipitation,
                temperature,
                temperature
        );
    }

    private WeatherForecastResponse getGlobalForecast(double lat, double lon) {
        validateCoordinates(lat, lon);
        String url = "https://api.open-meteo.com/v1/forecast?latitude=" + formatCoordinate(lat)
                + "&longitude=" + formatCoordinate(lon)
                + "&current=temperature_2m,weather_code,wind_speed_10m,precipitation"
                + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"
                + "&forecast_days=10&timezone=auto&wind_speed_unit=ms";
        JsonNode response = fetchJson(url);
        JsonNode current = response.path("current");
        JsonNode daily = response.path("daily");
        JsonNode dates = daily.path("time");

        if (!current.isObject() || !daily.isObject() || !dates.isArray()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Global weather forecast was incomplete");
        }

        JsonNode weatherCodes = daily.path("weather_code");
        JsonNode maximums = daily.path("temperature_2m_max");
        JsonNode minimums = daily.path("temperature_2m_min");
        JsonNode precipitation = daily.path("precipitation_sum");
        JsonNode wind = daily.path("wind_speed_10m_max");
        int dayCount = Math.min(10, dates.size());
        List<DailyWeatherResponse> days = new ArrayList<>();

        for (int index = 0; index < dayCount; index++) {
            days.add(new DailyWeatherResponse(
                    LocalDate.parse(textAt(dates, index)),
                    numberAt(minimums, index),
                    numberAt(maximums, index),
                    mapWmoCode((int) numberAt(weatherCodes, index)),
                    numberAt(precipitation, index),
                    numberAt(wind, index)
            ));
        }

        double currentTemperature = value(current, "temperature_2m");
        double currentWind = value(current, "wind_speed_10m");
        double currentPrecipitation = value(current, "precipitation");
        int currentCode = (int) value(current, "weather_code");
        double minimum = minimums.isEmpty() ? currentTemperature : numberAt(minimums, 0);
        double maximum = maximums.isEmpty() ? currentTemperature : numberAt(maximums, 0);
        WeatherResponse currentWeather = new WeatherResponse(
                currentTemperature,
                mapWmoCode(currentCode),
                buildGlobalReminder(currentTemperature, currentCode, currentWind, currentPrecipitation),
                currentWind,
                currentPrecipitation,
                minimum,
                maximum
        );

        return new WeatherForecastResponse(currentWeather, days, "Open-Meteo");
    }

    private JsonNode loadSmhiForecast(double lat, double lon, Integer timeSeries) {
        validateCoordinates(lat, lon);
        String url = "https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/"
                + formatCoordinate(lon) + "/lat/" + formatCoordinate(lat)
                + "/data.json?parameters=air_temperature,wind_speed,precipitation_amount_mean_deterministic,symbol_code"
                + (timeSeries == null ? "" : "&timeseries=" + timeSeries);

        try {
            return fetchJson(url);
        } catch (HttpClientErrorException.BadRequest exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "SMHI has no forecast for this location",
                    exception
            );
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "SMHI could not resolve the forecast coordinates",
                    exception
            );
        }
    }

    private JsonNode fetchJson(String url) {
        String response = restTemplate.getForObject(url, String.class);
        if (response == null || response.isBlank()) {
            throw new IllegalStateException("Weather service returned no data");
        }

        try {
            return objectMapper.readTree(response);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Weather service returned invalid data", exception);
        }
    }

    private void validateCoordinates(double lat, double lon) {
        if (!Double.isFinite(lat) || !Double.isFinite(lon)
                || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid weather coordinates");
        }
    }

    private int forecastHour(JsonNode item) {
        try {
            return OffsetDateTime.parse(item.path("time").asText()).getHour();
        } catch (RuntimeException ignored) {
            return 12;
        }
    }

    private double value(JsonNode data, String key) {
        return data.path(key).asDouble(0);
    }

    private double numberAt(JsonNode values, int index) {
        return values.isArray() && index < values.size() ? values.get(index).asDouble(0) : 0;
    }

    private String textAt(JsonNode values, int index) {
        return values.isArray() && index < values.size() ? values.get(index).asText() : "";
    }

    private String formatCoordinate(double coordinate) {
        return BigDecimal.valueOf(coordinate)
                .setScale(6, RoundingMode.HALF_UP)
                .stripTrailingZeros()
                .toPlainString();
    }

    private String mapWmoCode(int code) {
        if (code == 0) return "Clear sky";
        if (code == 1) return "Partly cloudy";
        if (code == 2) return "Mostly cloudy";
        if (code == 3 || code == 45 || code == 48) return "Cloudy";
        if (code >= 95) return "Thunder";
        if ((code >= 71 && code <= 77) || code == 85 || code == 86) return "Snow";
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Rain";
        return "Weather";
    }

    private String mapSymbolCode(int code) {
        return switch (code) {
            case 1, 2 -> "Clear sky";
            case 3, 4 -> "Partly cloudy";
            case 5 -> "Mostly cloudy";
            case 6 -> "Cloudy";
            case 7 -> "Fog";
            case 8, 9, 10, 18, 19, 20 -> "Rain";
            case 11, 21 -> "Thunder";
            case 12, 13, 14, 22, 23, 24 -> "Sleet";
            case 15, 16, 17, 25, 26, 27 -> "Snow";
            default -> "Weather";
        };
    }

    private String buildGlobalReminder(double temperature, int code, double wind, double precipitation) {
        String condition = mapWmoCode(code);
        if ("Thunder".equals(condition)) return "Thunderstorms expected. Take care outdoors.";
        if ("Snow".equals(condition)) return "Snow expected. Plan extra travel time.";
        if ("Rain".equals(condition) || precipitation > 0.5) return "Bring an umbrella today.";
        return buildTemperatureAndWindReminder(temperature, wind);
    }

    private String buildReminder(double temperature, int symbolCode, double windSpeed, double precipitation) {
        if (precipitation > 0.5 || (symbolCode >= 8 && symbolCode <= 10)) {
            return "Bring an umbrella today.";
        }
        if (symbolCode >= 15 && symbolCode <= 27) {
            return "Snow expected. Plan extra travel time.";
        }
        return buildTemperatureAndWindReminder(temperature, windSpeed);
    }

    private String buildTemperatureAndWindReminder(double temperature, double windSpeed) {
        if (windSpeed >= 8) return "It may be windy today.";
        if (temperature <= 5) return "Bring a warm jacket today.";
        if (temperature >= 22) return "Looks warm today. Remember water.";
        return "No special weather reminder today.";
    }
}
