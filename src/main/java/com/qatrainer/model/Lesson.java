package com.qatrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Lesson {
    private String id;
    private String levelId;
    private String moduleId;
    private String title;
    private String summary;
    private String theoryMarkdown;
    private List<String> keyPoints = new ArrayList<>();
    private List<String> interviewTips = new ArrayList<>();
    private List<QuizQuestion> quiz = new ArrayList<>();
    private List<Exercise> exercises = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLevelId() { return levelId; }
    public void setLevelId(String levelId) { this.levelId = levelId; }
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getTheoryMarkdown() { return theoryMarkdown; }
    public void setTheoryMarkdown(String theoryMarkdown) { this.theoryMarkdown = theoryMarkdown; }
    public List<String> getKeyPoints() { return keyPoints; }
    public void setKeyPoints(List<String> keyPoints) { this.keyPoints = keyPoints; }
    public List<String> getInterviewTips() { return interviewTips; }
    public void setInterviewTips(List<String> interviewTips) { this.interviewTips = interviewTips; }
    public List<QuizQuestion> getQuiz() { return quiz; }
    public void setQuiz(List<QuizQuestion> quiz) { this.quiz = quiz; }
    public List<Exercise> getExercises() { return exercises; }
    public void setExercises(List<Exercise> exercises) { this.exercises = exercises; }
}
