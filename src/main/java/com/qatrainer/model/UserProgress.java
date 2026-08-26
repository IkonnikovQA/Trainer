package com.qatrainer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class UserProgress {
    private Set<String> completedLessons = new HashSet<>();
    private Set<String> completedExercises = new HashSet<>();
    private Set<String> completedQuizzes = new HashSet<>();
    private Map<String, String> savedCode = new HashMap<>();
    private Map<String, Integer> hintUnlocks = new HashMap<>();
    private Map<String, Integer> failCounts = new HashMap<>();
    private List<String> quizHistory = new ArrayList<>();
    private String lastLessonId;
    private long updatedAt;
    private Set<String> bookmarkedLessonIds = new HashSet<>();

    public Set<String> getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(Set<String> completedLessons) { this.completedLessons = completedLessons; }
    public Set<String> getCompletedExercises() { return completedExercises; }
    public void setCompletedExercises(Set<String> completedExercises) { this.completedExercises = completedExercises; }
    public Set<String> getCompletedQuizzes() { return completedQuizzes; }
    public void setCompletedQuizzes(Set<String> completedQuizzes) { this.completedQuizzes = completedQuizzes; }
    public Map<String, String> getSavedCode() { return savedCode; }
    public void setSavedCode(Map<String, String> savedCode) { this.savedCode = savedCode; }
    public Map<String, Integer> getHintUnlocks() { return hintUnlocks; }
    public void setHintUnlocks(Map<String, Integer> hintUnlocks) { this.hintUnlocks = hintUnlocks; }
    public Map<String, Integer> getFailCounts() { return failCounts; }
    public void setFailCounts(Map<String, Integer> failCounts) { this.failCounts = failCounts; }
    public List<String> getQuizHistory() { return quizHistory; }
    public void setQuizHistory(List<String> quizHistory) { this.quizHistory = quizHistory; }
    public String getLastLessonId() { return lastLessonId; }
    public void setLastLessonId(String lastLessonId) { this.lastLessonId = lastLessonId; }
    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
    public Set<String> getBookmarkedLessonIds() {
        if (bookmarkedLessonIds == null) bookmarkedLessonIds = new HashSet<>();
        return bookmarkedLessonIds;
    }
    public void setBookmarkedLessonIds(Set<String> bookmarkedLessonIds) { this.bookmarkedLessonIds = bookmarkedLessonIds; }
}
