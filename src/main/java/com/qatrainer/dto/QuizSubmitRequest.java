package com.qatrainer.dto;

import java.util.ArrayList;
import java.util.List;

public class QuizSubmitRequest {
    private String lessonId;
    private String questionId;
    private List<Integer> selectedIndexes = new ArrayList<>();

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public List<Integer> getSelectedIndexes() { return selectedIndexes; }
    public void setSelectedIndexes(List<Integer> selectedIndexes) { this.selectedIndexes = selectedIndexes; }
}
