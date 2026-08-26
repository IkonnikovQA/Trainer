package com.qatrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizQuestion {
    private String id;
    private String type; // single, multiple, truefalse
    private String question;
    private List<String> options = new ArrayList<>();
    private List<Integer> correctIndexes = new ArrayList<>();
    private String explanation;
    private String hint;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public List<Integer> getCorrectIndexes() { return correctIndexes; }
    public void setCorrectIndexes(List<Integer> correctIndexes) { this.correctIndexes = correctIndexes; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
