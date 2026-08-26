package com.qatrainer.smoke;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.model.Exercise;
import com.qatrainer.service.CodeVerifierService;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Smoke only for interview-gaps wave lessons (faster than full AllSolutions). */
class InterviewGapsSolutionsSmokeTest {

    private static final String[] FILES = {
            "middle/m-junit-extensions.json",
            "middle/m-invocation-interceptor.json",
            "middle/m-ra-filter.json",
            "middle/m-api-clients.json",
            "middle/m-retry-policy.json",
            "middle/m-custom-assertj.json",
            "senior/s-openapi-pitfalls.json",
            "senior/s-swagger-coverage.json",
            "senior/s-async-messaging.json",
            "senior/s-microservices-qa.json",
            "senior/s-interview-soft.json",
            "senior/s-framework.json",
            "senior/s-observability.json",
            "senior/s-performance-basics.json",
            "senior/s-security-qa.json",
            "senior/s-testcontainers.json",
            "senior/s-metrics.json",
            "junior/j-git.json",
            "junior/j-testng-vs-junit.json",
            "junior/j-debug.json",
            "junior/j-waits.json",
            "junior/j-locators.json",
            "junior/j-pom-intro.json",
            "junior/j-strings.json",
            "middle/m-capstone.json",
            "middle/m-allure.json",
            "middle/m-allure-steps.json"
    };

    private final ObjectMapper om = new ObjectMapper();
    private final CodeVerifierService verifier = new CodeVerifierService();

    @Test
    void interviewGapSolutionsPass() throws Exception {
        List<String> failures = new ArrayList<>();
        for (String rel : FILES) {
            Path p = Path.of("src/main/resources/curriculum").resolve(rel);
            JsonNode lesson = om.readTree(Files.readString(p));
            String lessonId = lesson.path("id").asText(rel);
            for (JsonNode exNode : lesson.withArray("exercises")) {
                Exercise ex = om.treeToValue(exNode, Exercise.class);
                assertThat(ex.getSolutionCode()).as(lessonId + " solution").isNotBlank();
                if (ex.getTimeoutMs() < 20000) ex.setTimeoutMs(20000);
                var result = verifier.verifyInProcess(ex, ex.getSolutionCode(), List.of());
                if (!result.isSuccess()) {
                    failures.add(lessonId + "::" + ex.getId() + " → " + result.getMessage()
                            + " " + result.getDetails());
                }
            }
        }
        assertThat(failures).isEmpty();
    }
}
