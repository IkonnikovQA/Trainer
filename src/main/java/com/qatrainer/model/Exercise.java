package com.qatrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Exercise {
    private String id;
    private String title;
    private String description;
    private String difficulty; // easy, medium, hard
    /** java | junit | selenium-fake | http | artifact */
    private String mode = "java";
    private String starterCode;
    private String solutionCode;
    private String className;
    private String methodName;
    private List<String> hints = new ArrayList<>();
    private List<TestCase> testCases = new ArrayList<>();
    private String verifierCode;
    /** DOM fixture JSON for FakeDriver */
    private String fixtureJson;
    /** Mock HTTP routes JSON for http mode */
    private String httpStubJson;
    /** Artifact kind: dockerfile | jenkinsfile | compose | gha */
    private String artifactKind;
    private List<String> artifactRules = new ArrayList<>();
    private Map<String, String> supportSources = new HashMap<>();
    private int timeoutMs = 5000;
    /** After this many failed checks the «show solution» button appears. */
    private int revealAfterFails = 2;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getMode() { return mode == null || mode.isBlank() ? "java" : mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getStarterCode() { return starterCode; }
    public void setStarterCode(String starterCode) { this.starterCode = starterCode; }
    public String getSolutionCode() { return solutionCode; }
    public void setSolutionCode(String solutionCode) { this.solutionCode = solutionCode; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getMethodName() { return methodName; }
    public void setMethodName(String methodName) { this.methodName = methodName; }
    public List<String> getHints() { return hints; }
    public void setHints(List<String> hints) { this.hints = hints; }
    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
    public String getVerifierCode() { return verifierCode; }
    public void setVerifierCode(String verifierCode) { this.verifierCode = verifierCode; }
    public String getFixtureJson() { return fixtureJson; }
    public void setFixtureJson(String fixtureJson) { this.fixtureJson = fixtureJson; }
    public String getHttpStubJson() { return httpStubJson; }
    public void setHttpStubJson(String httpStubJson) { this.httpStubJson = httpStubJson; }
    public String getArtifactKind() { return artifactKind; }
    public void setArtifactKind(String artifactKind) { this.artifactKind = artifactKind; }
    public List<String> getArtifactRules() { return artifactRules; }
    public void setArtifactRules(List<String> artifactRules) { this.artifactRules = artifactRules; }
    public Map<String, String> getSupportSources() { return supportSources; }
    public void setSupportSources(Map<String, String> supportSources) { this.supportSources = supportSources; }
    public int getTimeoutMs() { return timeoutMs <= 0 ? 5000 : timeoutMs; }
    public void setTimeoutMs(int timeoutMs) { this.timeoutMs = timeoutMs; }
    public int getRevealAfterFails() { return revealAfterFails; }
    public void setRevealAfterFails(int revealAfterFails) { this.revealAfterFails = revealAfterFails; }
}
