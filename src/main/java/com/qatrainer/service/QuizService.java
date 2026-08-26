package com.qatrainer.service;

import com.qatrainer.dto.QuizCheckResult;
import com.qatrainer.model.Lesson;
import com.qatrainer.model.QuizQuestion;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class QuizService {

    private final ContentService contentService;
    private final ProgressService progressService;

    public QuizService(ContentService contentService, ProgressService progressService) {
        this.contentService = contentService;
        this.progressService = progressService;
    }

    public QuizCheckResult check(String lessonId, String questionId, List<Integer> selected) {
        Lesson lesson = contentService.getLesson(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Урок не найден: " + lessonId));

        QuizQuestion question = lesson.getQuiz().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Вопрос не найден: " + questionId));

        Set<Integer> correct = new HashSet<>(question.getCorrectIndexes());
        Set<Integer> chosen = new HashSet<>(selected == null ? List.of() : selected);
        boolean ok = correct.equals(chosen);

        QuizCheckResult result = new QuizCheckResult();
        result.setCorrect(ok);
        result.setExplanation(question.getExplanation());
        // Do not leak correctIndexes to the client
        if (!ok) {
            result.setHint(question.getHint());
        }

        if (ok) {
            progressService.markQuizCompleted(lessonId + "::" + questionId);
            if (allAnswered(lesson) || (lesson.getQuiz().size() == 1)) {
                progressService.markQuizCompleted(lessonId);
            }
        }
        return result;
    }

    private boolean allAnswered(Lesson lesson) {
        return lesson.getQuiz().stream()
                .allMatch(q -> progressService.getProgress().getCompletedQuizzes()
                        .contains(lesson.getId() + "::" + q.getId()));
    }

    public void markLessonQuizCompleteIfReady(String lessonId) {
        Lesson lesson = contentService.getLesson(lessonId).orElse(null);
        if (lesson == null) return;
        boolean all = lesson.getQuiz().stream()
                .allMatch(q -> progressService.getProgress().getCompletedQuizzes()
                        .contains(lessonId + "::" + q.getId()));
        if (all && !lesson.getQuiz().isEmpty()) {
            progressService.markQuizCompleted(lessonId);
        }
    }
}
