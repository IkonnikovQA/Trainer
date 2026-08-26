package com.qatrainer.service;

import com.qatrainer.model.Exercise;
import com.qatrainer.model.Lesson;
import com.qatrainer.model.QuizQuestion;
import com.qatrainer.model.UserProgress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProgressServiceTest {

    @TempDir
    Path temp;

    ProgressService progressService;

    @BeforeEach
    void setUp() throws Exception {
        com.qatrainer.config.TrainerProperties props = new com.qatrainer.config.TrainerProperties();
        props.setWorkspaceDir(temp.toString());
        props.setProgressFile(temp.resolve("progress.json").toString());
        progressService = new ProgressService(new com.fasterxml.jackson.databind.ObjectMapper(), props);
        progressService.init();
    }

    @Test
    void canCompleteLessonRequiresQuizAndExercises() {
        Lesson lesson = new Lesson();
        lesson.setId("L1");
        QuizQuestion q = new QuizQuestion();
        q.setId("q1");
        lesson.setQuiz(List.of(q));
        Exercise e = new Exercise();
        e.setId("e1");
        lesson.setExercises(List.of(e));

        assertThat(progressService.canCompleteLesson(lesson)).isFalse();

        progressService.markQuizCompleted("L1");
        assertThat(progressService.canCompleteLesson(lesson)).isFalse();

        progressService.markExerciseCompleted("L1::e1");
        assertThat(progressService.canCompleteLesson(lesson)).isTrue();
    }

    @Test
    void failCountIncrements() {
        assertThat(progressService.getFailCount("k")).isEqualTo(0);
        assertThat(progressService.incrementFailCount("k")).isEqualTo(1);
        assertThat(progressService.incrementFailCount("k")).isEqualTo(2);
        UserProgress p = progressService.getProgress();
        assertThat(p.getFailCounts().get("k")).isEqualTo(2);
    }

    @Test
    void saveCodeDebouncesDiskWrite() throws Exception {
        Path file = temp.resolve("progress.json");
        long before = Files.getLastModifiedTime(file).toMillis();
        progressService.saveCode("L::e", "a");
        progressService.saveCode("L::e", "ab");
        progressService.saveCode("L::e", "abc");
        // not necessarily flushed yet
        Thread.sleep(500);
        progressService.flush();
        assertThat(progressService.getSavedCode("L::e")).isEqualTo("abc");
        assertThat(Files.getLastModifiedTime(file).toMillis()).isGreaterThanOrEqualTo(before);
    }

    @Test
    void toggleBookmark() {
        assertThat(progressService.toggleBookmark("j-types")).isTrue();
        assertThat(progressService.getProgress().getBookmarkedLessonIds()).contains("j-types");
        assertThat(progressService.toggleBookmark("j-types")).isFalse();
        assertThat(progressService.getProgress().getBookmarkedLessonIds()).doesNotContain("j-types");
    }
}
