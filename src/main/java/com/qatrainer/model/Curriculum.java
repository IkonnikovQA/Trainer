package com.qatrainer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Curriculum {
    private String title;
    private String description;
    private List<Level> levels = new ArrayList<>();

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<Level> getLevels() { return levels; }
    public void setLevels(List<Level> levels) { this.levels = levels; }
}
