package com.qatrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Module {
    private String id;
    private String title;
    private String description;
    private List<LessonRef> lessons = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<LessonRef> getLessons() { return lessons; }
    public void setLessons(List<LessonRef> lessons) { this.lessons = lessons; }
}
