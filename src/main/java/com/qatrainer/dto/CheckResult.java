package com.qatrainer.dto;

import java.util.ArrayList;
import java.util.List;

public class CheckResult {
    private boolean success;
    private String message;
    private List<String> details = new ArrayList<>();
    private List<String> availableHints = new ArrayList<>();
    private int hintsUnlocked;
    private int totalHints;
    private int failCount;
    private boolean canRevealSolution;
    private String solutionCode;
    private String warning;

    public static CheckResult ok(String message) {
        CheckResult r = new CheckResult();
        r.success = true;
        r.message = message;
        return r;
    }

    public static CheckResult fail(String message) {
        CheckResult r = new CheckResult();
        r.success = false;
        r.message = message;
        return r;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<String> getDetails() { return details; }
    public void setDetails(List<String> details) { this.details = details; }
    public List<String> getAvailableHints() { return availableHints; }
    public void setAvailableHints(List<String> availableHints) { this.availableHints = availableHints; }
    public int getHintsUnlocked() { return hintsUnlocked; }
    public void setHintsUnlocked(int hintsUnlocked) { this.hintsUnlocked = hintsUnlocked; }
    public int getTotalHints() { return totalHints; }
    public void setTotalHints(int totalHints) { this.totalHints = totalHints; }
    public int getFailCount() { return failCount; }
    public void setFailCount(int failCount) { this.failCount = failCount; }
    public boolean isCanRevealSolution() { return canRevealSolution; }
    public void setCanRevealSolution(boolean canRevealSolution) { this.canRevealSolution = canRevealSolution; }
    public String getSolutionCode() { return solutionCode; }
    public void setSolutionCode(String solutionCode) { this.solutionCode = solutionCode; }
    public String getWarning() { return warning; }
    public void setWarning(String warning) { this.warning = warning; }
}
