package com.eduassess.backend.service;

import com.eduassess.backend.config.GeminiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

@Service
public class GeminiClientService {

    private static final String PLACEHOLDER_KEY = "MY_GEMINI_API_KEY";

    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    public GeminiClientService(GeminiProperties geminiProperties, ObjectMapper objectMapper) {
        this.geminiProperties = geminiProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public boolean isMockMode() {
        return geminiApiKey == null || geminiApiKey.isBlank() || PLACEHOLDER_KEY.equals(geminiApiKey);
    }

    public <T> T generateFromPdf(String prompt, byte[] pdfBytes, Class<T> responseType) {
        String base64 = Base64.getEncoder().encodeToString(pdfBytes);
        String body = """
                {
                  "contents": [
                    {
                      "parts": [
                        {"text": %s},
                        {"inline_data": {"mime_type": "application/pdf", "data": %s}}
                      ]
                    }
                  ],
                  "generationConfig": {
                    "responseMimeType": "application/json"
                  }
                }
                """.formatted(toJsonString(prompt), toJsonString(base64));

        return callAndMap(body, responseType);
    }

    public <T> T generateFromText(String prompt, Class<T> responseType) {
        String body = """
                {
                  "contents": [
                    {
                      "parts": [
                        {"text": %s}
                      ]
                    }
                  ],
                  "generationConfig": {
                    "responseMimeType": "application/json"
                  }
                }
                """.formatted(toJsonString(prompt));

        return callAndMap(body, responseType);
    }

    private <T> T callAndMap(String body, Class<T> responseType) {
        if (isMockMode()) {
            throw new IllegalStateException("GEMINI_API_KEY is missing or invalid.");
        }

        try {
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + geminiProperties.getModel()
                    + ":generateContent?key="
                    + geminiApiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Gemini API error: " + response.statusCode() + " - " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText(null);
            if (text == null || text.isBlank()) {
                throw new IllegalStateException("Gemini returned an empty response.");
            }

            return objectMapper.readValue(text, responseType);
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Failed to communicate with Gemini API", ex);
        }
    }

    private String toJsonString(String raw) {
        try {
            return objectMapper.writeValueAsString(raw);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to serialize JSON value", e);
        }
    }
}
