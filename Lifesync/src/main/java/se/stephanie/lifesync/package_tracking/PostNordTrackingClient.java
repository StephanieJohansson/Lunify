package se.stephanie.lifesync.package_tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class PostNordTrackingClient {

    private static final String DEFAULT_BASE_URL =
            "https://api2.postnord.com/rest";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private final String baseUrl;
    private final String locale;

    public PostNordTrackingClient(
            @Value("${postnord.api.key:}") String apiKey,
            @Value("${postnord.base-url:" + DEFAULT_BASE_URL + "}") String baseUrl,
            @Value("${postnord.locale:sv}") String locale
    ) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.locale = locale;
    }

    public TrackingResult track(String trackingNumber) {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("PostNord tracking requires POSTNORD_API_KEY.");
        }

        try {
            String encodedTrackingNumber = URLEncoder.encode(trackingNumber, StandardCharsets.UTF_8);
            String encodedApiKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
            String encodedLocale = URLEncoder.encode(locale, StandardCharsets.UTF_8);
            URI uri = URI.create(baseUrl + "/v7/trackandtrace/id/" + encodedTrackingNumber
                    + "/public?locale=" + encodedLocale
                    + "&apikey=" + encodedApiKey);

            HttpRequest request = HttpRequest.newBuilder(uri)
                    .GET()
                    .header("Accept", "application/json")
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() >= 400) {
                throw postNordException(response.statusCode(), response.body());
            }

            return mapResponse(objectMapper.readTree(response.body()));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read PostNord tracking response", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("PostNord tracking request was interrupted", exception);
        }
    }

    private IllegalStateException postNordException(int statusCode, String responseBody) {
        if (statusCode == 404) {
            return new IllegalStateException(
                    "PostNord could not find this package in the public tracking API. "
                            + "It can still be visible in the PostNord app if it is connected to your account."
            );
        }

        if (statusCode == 401 || statusCode == 403) {
            return new IllegalStateException(
                    "PostNord did not accept the API key for this tracking request."
            );
        }

        return new IllegalStateException(
                "PostNord tracking is temporarily unavailable"
                        + formatResponseMessage(statusCode, responseBody)
        );
    }

    private String formatResponseMessage(int statusCode, String responseBody) {
        String message = extractResponseMessage(responseBody);

        if (message.isBlank()) {
            return " (status " + statusCode + ").";
        }

        return " (status " + statusCode + ": " + message + ").";
    }

    private String extractResponseMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "";
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return firstText(
                    root.path("message"),
                    root.path("fault").path("message"),
                    first(root.path("faults")).path("explanationText"),
                    first(root.path("compositeFault").path("faults")).path("explanationText")
            );
        } catch (IOException ignored) {
            return "";
        }
    }

    private TrackingResult mapResponse(JsonNode root) {
        JsonNode shipment = first(root.path("TrackingInformationResponse").path("shipments"));
        JsonNode item = first(shipment.path("items"));
        JsonNode estimatedTimeSpan = firstPresent(
                item.path("estimatedDeliveryTimeSpan"),
                shipment.path("estimatedDeliveryTimeSpan")
        );
        List<PackageTrackingEvent> events = mapEvents(firstPresent(
                item.path("events"),
                shipment.path("events")
        ));
        PackageTrackingEvent latestEvent = events.stream()
                .filter(event -> event.getEventTime() != null)
                .max(Comparator.comparing(PackageTrackingEvent::getEventTime))
                .orElse(null);

        String providerStatus = firstText(
                item.path("status"),
                item.path("statusCode"),
                shipment.path("status"),
                latestEvent != null ? latestEvent.getStatus() : null
        );
        String description = firstText(
                item.path("statusText"),
                item.path("statusDescription"),
                shipment.path("statusText"),
                latestEvent != null ? latestEvent.getDescription() : null
        );
        LocalDate expectedDeliveryDate = parseDate(firstText(
                item.path("deliveryDate"),
                shipment.path("deliveryDate"),
                estimatedTimeSpan.path("date")
        ));
        LocalDateTime expectedDeliveryStart = parseDateTime(firstText(
                estimatedTimeSpan.path("start"),
                estimatedTimeSpan.path("startTime"),
                estimatedTimeSpan.path("from")
        ));
        LocalDateTime expectedDeliveryEnd = parseDateTime(firstText(
                estimatedTimeSpan.path("end"),
                estimatedTimeSpan.path("endTime"),
                estimatedTimeSpan.path("to")
        ));

        if (expectedDeliveryDate == null && expectedDeliveryStart != null) {
            expectedDeliveryDate = expectedDeliveryStart.toLocalDate();
        }

        return new TrackingResult(
                providerStatus,
                normalizeStatus(providerStatus + " " + description),
                description,
                firstText(item.path("serviceName"), shipment.path("serviceName"), item.path("productName")),
                firstText(shipment.path("senderName"), item.path("senderName")),
                firstText(item.path("pickupCode"), shipment.path("pickupCode")),
                firstText(item.path("servicePointName"), shipment.path("servicePointName")),
                expectedDeliveryDate,
                expectedDeliveryStart,
                expectedDeliveryEnd,
                latestEvent != null ? latestEvent.getEventTime() : null,
                latestEvent != null ? formatLocation(latestEvent.getCity(), latestEvent.getCountry()) : "",
                "DELIVERED".equals(normalizeStatus(providerStatus + " " + description)),
                events
        );
    }

    private List<PackageTrackingEvent> mapEvents(JsonNode eventNodes) {
        List<PackageTrackingEvent> events = new ArrayList<>();

        if (!eventNodes.isArray()) {
            return events;
        }

        for (JsonNode eventNode : eventNodes) {
            PackageTrackingEvent event = new PackageTrackingEvent();
            event.setStatus(firstText(
                    eventNode.path("eventCode"),
                    eventNode.path("eventType"),
                    eventNode.path("status")
            ));
            event.setDescription(firstText(
                    eventNode.path("eventDescription"),
                    eventNode.path("description"),
                    eventNode.path("statusDescription")
            ));
            event.setCity(firstText(eventNode.path("location"), eventNode.path("city")));
            event.setCountry(firstText(eventNode.path("country"), eventNode.path("countryCode")));
            event.setEventTime(parseDateTime(firstText(
                    eventNode.path("eventTime"),
                    eventNode.path("eventDateTime"),
                    eventNode.path("date")
            )));
            event.setInsignificant(false);
            events.add(event);
        }

        return events;
    }

    private String normalizeStatus(String value) {
        if (value == null || value.isBlank()) {
            return "UNKNOWN";
        }

        String status = value.toUpperCase();

        if (status.contains("DELIVERED") || status.contains("UTL")) {
            return "DELIVERED";
        }
        if (status.contains("PICKUP") || status.contains("COLLECT")) {
            return "READY_FOR_PICKUP";
        }
        if (status.contains("RETURN")) {
            return "RETURNED";
        }
        if (status.contains("DELAY") || status.contains("EXCEPTION")) {
            return "DELAYED";
        }
        if (status.contains("OUT FOR DELIVERY") || status.contains("LOADED FOR DELIVERY")) {
            return "OUT_FOR_DELIVERY";
        }
        if (status.contains("TRANSIT") || status.contains("SORT") || status.contains("TERMINAL")) {
            return "IN_TRANSIT";
        }
        if (status.contains("INFORMED") || status.contains("ELECTRONIC")) {
            return "PRE_NOTIFIED";
        }

        return status.trim().replace(" ", "_");
    }

    private JsonNode first(JsonNode node) {
        return node.isArray() && !node.isEmpty() ? node.get(0) : objectMapper.createObjectNode();
    }

    private JsonNode firstPresent(JsonNode firstNode, JsonNode secondNode) {
        if (!firstNode.isMissingNode() && !firstNode.isNull() && (!firstNode.isArray() || !firstNode.isEmpty())) {
            return firstNode;
        }

        return secondNode;
    }

    private String firstText(Object... values) {
        for (Object value : values) {
            if (value instanceof JsonNode node && !node.isMissingNode() && !node.isNull()) {
                String text = node.asText("");
                if (!text.isBlank()) {
                    return text;
                }
            }

            if (value instanceof String text && !text.isBlank()) {
                return text;
            }
        }

        return "";
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("yyyyMMdd"),
                DateTimeFormatter.ofPattern("dd.MM.yyyy")
        )) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        LocalDateTime dateTime = parseDateTime(value);
        return dateTime == null ? null : dateTime.toLocalDate();
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        return null;
    }

    private String formatLocation(String city, String country) {
        if (city == null || city.isBlank()) {
            return country == null ? "" : country;
        }

        if (country == null || country.isBlank()) {
            return city;
        }

        return city + ", " + country;
    }
}
