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
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class AllSolutionsSmokeTest {

    private final ObjectMapper om = new ObjectMapper();
    private final CodeVerifierService verifier = new CodeVerifierService();

    @Test
    void everyExerciseWithSolutionPasses() throws Exception {
        Path root = Path.of("src/main/resources/curriculum");
        List<String> failures = new ArrayList<>();
        int checked = 0;
        try (Stream<Path> paths = Files.walk(root)) {
            List<Path> files = paths
                    .filter(p -> p.toString().endsWith(".json"))
                    .filter(p -> !p.getFileName().toString().equals("index.json"))
                    .toList();
            for (Path file : files) {
                JsonNode lesson = om.readTree(Files.readString(file));
                String lessonId = lesson.path("id").asText(file.getFileName().toString());
                for (JsonNode exNode : lesson.withArray("exercises")) {
                    Exercise ex = om.treeToValue(exNode, Exercise.class);
                    if (ex.getSolutionCode() == null || ex.getSolutionCode().isBlank()) {
                        failures.add(lessonId + "::" + ex.getId() + " missing solutionCode");
                        continue;
                    }
                    checked++;
                    if (ex.getTimeoutMs() < 20000) {
                        ex.setTimeoutMs(20000);
                    }
                    var result = verifier.verifyInProcess(ex, ex.getSolutionCode(), List.of());
                    if (!result.isSuccess()) {
                        failures.add(lessonId + "::" + ex.getId() + " → " + result.getMessage()
                                + " " + result.getDetails());
                    }
                }
            }
        }
        assertThat(failures).as("checked=" + checked).isEmpty();
        assertThat(checked).isGreaterThan(40);
    }
}
