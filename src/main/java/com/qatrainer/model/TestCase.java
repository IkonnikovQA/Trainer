package com.qatrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TestCase {
    private String name;
    private String callExpression;
    private String expected;
    private String expectedType; // string, int, boolean, long, double, null, list, object

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCallExpression() { return callExpression; }
    public void setCallExpression(String callExpression) { this.callExpression = callExpression; }
    public String getExpected() { return expected; }
    public void setExpected(String expected) { this.expected = expected; }
    public String getExpectedType() { return expectedType; }
    public void setExpectedType(String expectedType) { this.expectedType = expectedType; }
}
