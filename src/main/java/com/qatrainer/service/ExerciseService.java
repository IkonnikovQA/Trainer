package com.qatrainer.service;

import com.qatrainer.dto.CheckResult;
import com.qatrainer.model.Exercise;
import com.qatrainer.model.Lesson;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExerciseService {

    private final ContentService contentService;
    private final ProgressService progressService;
    private final CodeVerifierService codeVerifierService;

    public ExerciseService(ContentService contentService,
                           ProgressService progressService,
                           CodeVerifierService codeVerifierService) {
        this.contentService = contentService;
        this.progressService = progressService;
        this.codeVerifierService = codeVerifierService;
    }

    public CheckResult submit(String lessonId, String exerciseId, String code) {
        Lesson lesson = contentService.getLesson(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Урок не найден"));
        Exercise exercise = lesson.getExercises().stream()
                .filter(e -> e.getId().equals(exerciseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Упражнение не найдено"));

        String key = key(lessonId, exerciseId);
        progressService.saveCode(key, code);

        int unlocked = progressService.getHintsUnlocked(key);
        List<String> hints = new ArrayList<>();
        if (exercise.getHints() != null) {
            for (int i = 0; i < Math.min(unlocked, exercise.getHints().size()); i++) {
                hints.add(exercise.getHints().get(i));
            }
        }

        CheckResult result = codeVerifierService.verify(exercise, code, hints);
        int fails = progressService.getFailCount(key);
        if (result.isSuccess()) {
            progressService.markExerciseCompleted(key);
            maybeCompleteLesson(lesson);
        } else {
            fails = progressService.incrementFailCount(key);
        }
        result.setFailCount(fails);
        boolean canReveal = fails >= exercise.getRevealAfterFails()
                || (exercise.getHints() != null && unlocked >= exercise.getHints().size() && !exercise.getHints().isEmpty() && fails >= 1);
        result.setCanRevealSolution(canReveal);
        // solutionCode only via /exercise/solution — never embed in check response
        return result;
    }

    public List<String> unlockHint(String lessonId, String exerciseId) {
        Lesson lesson = contentService.getLesson(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Урок не найден"));
        Exercise exercise = lesson.getExercises().stream()
                .filter(e -> e.getId().equals(exerciseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Упражнение не найдено"));

        String key = key(lessonId, exerciseId);
        if (progressService.getFailCount(key) < 1) {
            throw new IllegalStateException("Сначала сделай хотя бы одну попытку проверки — потом откроются подсказки.");
        }
        int count = progressService.unlockHint(key);
        List<String> hints = new ArrayList<>();
        if (exercise.getHints() != null) {
            for (int i = 0; i < Math.min(count, exercise.getHints().size()); i++) {
                hints.add(exercise.getHints().get(i));
            }
        }
        return hints;
    }

    public String revealSolution(String lessonId, String exerciseId) {
        Lesson lesson = contentService.getLesson(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Урок не найден"));
        Exercise exercise = lesson.getExercises().stream()
                .filter(e -> e.getId().equals(exerciseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Упражнение не найдено"));
        String key = key(lessonId, exerciseId);
        int fails = progressService.getFailCount(key);
        int unlocked = progressService.getHintsUnlocked(key);
        boolean canReveal = fails >= exercise.getRevealAfterFails()
                || (exercise.getHints() != null && unlocked >= exercise.getHints().size() && !exercise.getHints().isEmpty() && fails >= 1);
        if (!canReveal) {
            throw new IllegalStateException("Решение ещё недоступно. Сделай больше попыток или открой все подсказки.");
        }
        return exercise.getSolutionCode() == null ? "" : exercise.getSolutionCode();
    }

    public String starterOrSaved(String lessonId, Exercise exercise) {
        String key = key(lessonId, exercise.getId());
        String saved = progressService.getSavedCode(key);
        return saved != null ? saved : exercise.getStarterCode();
    }

    private void maybeCompleteLesson(Lesson lesson) {
        if (progressService.canCompleteLesson(lesson)) {
            progressService.markLessonCompleted(lesson.getId());
        }
    }

    public static String key(String lessonId, String exerciseId) {
        return lessonId + "::" + exerciseId;
    }
}
