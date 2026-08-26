package com.qatrainer.lab.http;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HttpLabHelperTest {

    @Test
    void startsServerAndServesStub() throws Exception {
        String json = """
                {"stubs":[{"status":200,"body":"{\\"status\\":\\"UP\\"}","headers":{"Content-Type":"application/json"}}]}
                """;
        try (MockWebServer server = HttpLabHelper.startFromStubJson(json)) {
            String url = HttpLabHelper.baseUrl(server) + "/health";
            OkHttpClient client = new OkHttpClient();
            try (Response response = client.newCall(new Request.Builder().url(url).build()).execute()) {
                assertThat(response.code()).isEqualTo(200);
                assertThat(response.body().string()).contains("UP");
            }
        }
    }
}
