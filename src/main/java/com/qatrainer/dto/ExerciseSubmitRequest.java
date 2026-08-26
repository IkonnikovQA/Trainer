package com.qatrainer.dto;

public class ExerciseSubmitRequest {
    private String lessonId;
    private String exerciseId;
    private String code;

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
