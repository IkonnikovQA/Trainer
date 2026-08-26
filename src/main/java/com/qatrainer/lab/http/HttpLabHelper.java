package com.qatrainer.lab.http;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public final class HttpLabHelper {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private HttpLabHelper() {}

    public static MockWebServer startFromStubJson(String json) throws IOException {
        MockWebServer server = new MockWebServer();
        if (json == null || json.isBlank()) {
            server.start();
            return server;
        }
        JsonNode root = MAPPER.readTree(json);
        JsonNode stubs = root.has("stubs") ? root.get("stubs") : root;
        if (stubs.isArray()) {
            for (JsonNode stub : stubs) {
                MockResponse response = new MockResponse();
                int code = stub.has("status") ? stub.get("status").asInt() : 200;
                response.setResponseCode(code);
                if (stub.has("body")) {
                    response.setBody(stub.get("body").isTextual()
                            ? stub.get("body").asText()
                            : stub.get("body").toString());
                }
                if (stub.has("headers") && stub.get("headers").isObject()) {
                    Iterator<Map.Entry<String, JsonNode>> fields = stub.get("headers").fields();
                    while (fields.hasNext()) {
                        Map.Entry<String, JsonNode> e = fields.next();
                        response.addHeader(e.getKey(), e.getValue().asText());
                    }
                } else {
                    response.addHeader("Content-Type", "application/json");
                }
                // enqueue once per stub (sequential matching)
                int times = stub.has("times") ? stub.get("times").asInt() : 1;
                for (int i = 0; i < times; i++) {
                    server.enqueue(response);
                }
            }
        }
        server.start();
        return server;
    }

    public static String baseUrl(MockWebServer server) {
        return server.url("/").toString().replaceAll("/$", "");
    }

    public static List<String> drainRequestLines(MockWebServer server, int max) {
        List<String> lines = new ArrayList<>();
        try {
            for (int i = 0; i < max; i++) {
                var rec = server.takeRequest(100, java.util.concurrent.TimeUnit.MILLISECONDS);
                if (rec == null) break;
                lines.add(rec.getMethod() + " " + rec.getPath());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return lines;
    }
}
