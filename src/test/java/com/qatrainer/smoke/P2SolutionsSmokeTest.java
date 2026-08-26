package com.qatrainer.smoke;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.model.Exercise;
import com.qatrainer.service.CodeVerifierService;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class P2SolutionsSmokeTest {
    private final ObjectMapper om = new ObjectMapper();
    private final CodeVerifierService verifier = new CodeVerifierService();

    @Test
    void softAssertSolutionPasses() throws Exception {
        assertSolution("middle/m-soft-assert.json");
    }

    @Test
    void awaitilitySolutionPasses() throws Exception {
        assertSolution("middle/m-awaitility.json");
    }

    @Test
    void dockerfilePracticePasses() throws Exception {
        assertSolution("senior/s-dockerfile-practice.json");
    }

    @Test
    void jsonSchemaSolutionPasses() throws Exception {
        assertSolution("middle/m-json-schema.json");
    }

    @Test
    void allureSolutionPasses() throws Exception {
        assertSolution("middle/m-allure.json");
    }

    @Test
    void capstoneAllPass() throws Exception {
        assertSolution("middle/m-capstone.json");
    }

    @Test
    void pomFluentSolutionPasses() throws Exception {
        assertSolution("middle/m-pom-fluent.json");
    }

    @Test
    void mockMvcSolutionPasses() throws Exception {
        assertSolution("middle/m-mockmvc.json");
    }

    @Test
    void convertedSeniorSamplesPass() throws Exception {
        assertSolution("senior/s-contract.json");
        assertSolution("senior/s-jenkinsfile.json");
        assertSolution("senior/s-security-qa.json");
    }

    private void assertSolution(String rel) throws Exception {
        Path p = Path.of("src/main/resources/curriculum").resolve(rel);
        var node = om.readTree(Files.readString(p));
        var exercises = node.get("exercises");
        for (var exNode : exercises) {
            Exercise ex = om.treeToValue(exNode, Exercise.class);
            String code = ex.getSolutionCode();
            assertThat(code).as(ex.getId()).isNotBlank();
            var result = verifier.verifyInProcess(ex, code, List.of());
            assertThat(result.isSuccess())
                    .as(ex.getId() + ": " + result.getMessage() + " " + result.getDetails())
                    .isTrue();
        }
    }
}
