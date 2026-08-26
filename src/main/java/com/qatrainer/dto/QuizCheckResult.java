package com.qatrainer.dto;

import java.util.ArrayList;
import java.util.List;

public class QuizCheckResult {
    private boolean correct;
    private String explanation;
    private String hint;
    private List<Integer> correctIndexes = new ArrayList<>();

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
    public List<Integer> getCorrectIndexes() { return correctIndexes; }
    public void setCorrectIndexes(List<Integer> correctIndexes) { this.correctIndexes = correctIndexes; }
}
