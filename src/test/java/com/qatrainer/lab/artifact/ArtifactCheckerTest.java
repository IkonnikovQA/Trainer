package com.qatrainer.lab.artifact;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArtifactCheckerTest {

    @Test
    void dockerfileRequiresPomBeforeSrc() {
        String bad = """
                FROM maven:3.9-eclipse-temurin-17
                COPY src ./src
                COPY pom.xml .
                RUN mvn -B test
                """;
        assertThat(ArtifactChecker.check("dockerfile", bad, null))
                .anyMatch(s -> s.contains("pom.xml"));

        String good = """
                FROM maven:3.9-eclipse-temurin-17
                COPY pom.xml .
                RUN mvn -B dependency:go-offline
                COPY src ./src
                RUN mvn -B test
                """;
        assertThat(ArtifactChecker.check("dockerfile", good, null)).isEmpty();
    }

    @Test
    void jenkinsfileRequiresPipelineStagesPostJunit() {
        String good = """
                pipeline {
                  agent any
                  stages { stage('Test') { steps { sh 'mvn test' } } }
                  post { always { junit '**/surefire-reports/*.xml' } }
                }
                """;
        assertThat(ArtifactChecker.check("jenkinsfile", good, null)).isEmpty();
    }

    @Test
    void rejectsSecrets() {
        String text = """
                pipeline {
                  stages { stage('Test') { steps { sh 'mvn test' } } }
                  post { always { junit 'x' } }
                  environment { password=secret }
                }
                """;
        assertThat(ArtifactChecker.check("jenkinsfile", text, null))
                .anyMatch(s -> s.toLowerCase().contains("секрет") || s.toLowerCase().contains("password"));
    }

    @Test
    void ghaRequiresJobsCheckoutMvn() {
        String good = """
                on: [pull_request]
                jobs:
                  test:
                    runs-on: ubuntu-latest
                    steps:
                      - uses: actions/checkout@v4
                      - run: mvn -B test
                """;
        assertThat(ArtifactChecker.check("gha", good, null)).isEmpty();
    }
}
