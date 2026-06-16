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
public class BringTrackingClient {

    private static final String BASE_URL = "https://api.bring.com/tracking/api/v2/tracking.json";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiUid;
    private final String apiKey;
    private final String clientUrl;

    public BringTrackingClient(
            @Value("${bring.api.uid:}") String apiUid,
            @Value("${bring.api.key:}") String apiKey,
            @Value("${bring.client-url:http://localhost:5173}") String clientUrl
    ) {
        this.apiUid = apiUid;
        this.apiKey = apiKey;
        this.clientUrl = clientUrl;
    }

    public TrackingResult track(String trackingNumber) {
        try {
            String query = URLEncoder.encode(trackingNumber, StandardCharsets.UTF_8);
            URI uri = URI.create(BASE_URL + "?q=" + query + "&lang=sv");

            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder(uri)
                    .GET()
                    .header("Accept", "application/json")
                    .header("X-Bring-Client-URL", clientUrl)
                    .header("api-version", "2");

            if (!apiUid.isBlank() && !apiKey.isBlank()) {
                requestBuilder
                        .header("X-MyBring-API-Uid", apiUid)
                        .header("X-MyBring-API-Key", apiKey);
            }

            HttpResponse<String> response = httpClient.send(
                    requestBuilder.build(),
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() >= 400) {
                throw new IllegalStateException("Bring tracking failed with status " + response.statusCode());
            }

            return mapResponse(objectMapper.readTree(response.body()));
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read Bring tracking response", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Bring tracking request was interrupted", exception);
        }
    }

    private TrackingResult mapResponse(JsonNode root) {
        JsonNode consignment = first(root.path("consignmentSet"));

        if (consignment.path("error").isObject()) {
            String message = text(consignment.path("error").path("message"));
            throw new IllegalStateException(message.isBlank() ? "Bring tracking returned an error" : message);
        }

        JsonNode packageNode = first(consignment.path("packageSet"));
        List<PackageTrackingEvent> events = mapEvents(packageNode.path("eventSet"));
        PackageTrackingEvent latestEvent = events.stream()
                .filter(event -> event.getEventTime() != null)
                .max(Comparator.comparing(PackageTrackingEvent::getEventTime))
                .orElse(null);

        String providerStatus = latestEvent != null
                ? latestEvent.getStatus()
                : text(packageNode.path("statusDescription"));

        return new TrackingResult(
                providerStatus,
                normalizeStatus(providerStatus),
                text(packageNode.path("statusDescription")),
                text(packageNode.path("productName")),
                text(packageNode.path("senderName")),
                text(packageNode.path("pickupCode")),
                text(packageNode.path("expectedPickupUnitName")),
                parseDate(text(packageNode.path("dateOfEstimatedDelivery"))),
                parseDateTime(text(packageNode.path("estimatedTimeSpanOfDelivery").path("startTime"))),
                parseDateTime(text(packageNode.path("estimatedTimeSpanOfDelivery").path("endTime"))),
                latestEvent != null ? latestEvent.getEventTime() : null,
                latestEvent != null ? formatLocation(latestEvent.getCity(), latestEvent.getCountry()) : "",
                "DELIVERED".equalsIgnoreCase(providerStatus),
                events
        );
    }

    private List<PackageTrackingEvent> mapEvents(JsonNode eventSet) {
        List<PackageTrackingEvent> events = new ArrayList<>();

        if (!eventSet.isArray()) {
            return events;
        }

        for (JsonNode eventNode : eventSet) {
            PackageTrackingEvent event = new PackageTrackingEvent();
            event.setStatus(text(eventNode.path("status")));
            event.setDescription(text(eventNode.path("description")));
            event.setCity(text(eventNode.path("city")));
            event.setCountry(text(eventNode.path("country")));
            event.setEventTime(parseDateTime(text(eventNode.path("dateIso"))));
            event.setInsignificant(eventNode.path("insignificant").asBoolean(false));
            events.add(event);
        }

        return events;
    }

    private String normalizeStatus(String providerStatus) {
        if (providerStatus == null || providerStatus.isBlank()) {
            return "UNKNOWN";
        }

        return switch (providerStatus.toUpperCase()) {
            case "PRE_NOTIFIED", "NOTIFICATION_SENT" -> "PRE_NOTIFIED";
            case "HANDED_IN", "IN_TRANSIT", "TERMINAL", "INTERNATIONAL" -> "IN_TRANSIT";
            case "TRANSPORT_TO_RECIPIENT", "DELIVERY_ORDERED" -> "OUT_FOR_DELIVERY";
            case "READY_FOR_PICKUP", "COLLECTED" -> "READY_FOR_PICKUP";
            case "DEVIATION", "DELIVERY_CHANGED", "DELIVERY_CANCELLED", "ATTEMPTED_DELIVERY" -> "DELAYED";
            case "DELIVERED" -> "DELIVERED";
            case "RETURN", "DELIVERED_SENDER" -> "RETURNED";
            default -> providerStatus.toUpperCase();
        };
    }

    private JsonNode first(JsonNode node) {
        return node.isArray() && !node.isEmpty() ? node.get(0) : objectMapper.createObjectNode();
    }

    private String text(JsonNode node) {
        return node.isMissingNode() || node.isNull() ? "" : node.asText("");
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd.MM.yyyy")
        )) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        return null;
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
