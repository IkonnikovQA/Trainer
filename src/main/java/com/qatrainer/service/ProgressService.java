package com.qatrainer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.config.TrainerProperties;
import com.qatrainer.model.UserProgress;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class ProgressService {

    private static final long SAVE_DEBOUNCE_MS = 400L;

    private final ObjectMapper objectMapper;
    private final TrainerProperties properties;
    private final ReentrantLock lock = new ReentrantLock();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "progress-save");
        t.setDaemon(true);
        return t;
    });
    private UserProgress progress;
    private ScheduledFuture<?> pendingSave;
    private boolean dirty;

    public ProgressService(ObjectMapper objectMapper, TrainerProperties properties) {
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    @PostConstruct
    public void init() throws IOException {
        Path workspace = Path.of(properties.getWorkspaceDir());
        Files.createDirectories(workspace);
        Path progressPath = Path.of(properties.getProgressFile());
        if (Files.exists(progressPath)) {
            progress = objectMapper.readValue(progressPath.toFile(), UserProgress.class);
        } else {
            progress = new UserProgress();
            saveNow();
        }
    }

    @PreDestroy
    public void shutdown() {
        flush();
        scheduler.shutdown();
    }

    public UserProgress getProgress() {
        return progress;
    }

    public void markLessonCompleted(String lessonId) {
        lock.lock();
        try {
            progress.getCompletedLessons().add(lessonId);
            progress.setLastLessonId(lessonId);
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
        } finally {
            lock.unlock();
        }
    }

    public void markQuizCompleted(String lessonId) {
        lock.lock();
        try {
            progress.getCompletedQuizzes().add(lessonId);
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
        } finally {
            lock.unlock();
        }
    }

    public void markExerciseCompleted(String exerciseKey) {
        lock.lock();
        try {
            progress.getCompletedExercises().add(exerciseKey);
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
        } finally {
            lock.unlock();
        }
    }

    public void saveCode(String exerciseKey, String code) {
        lock.lock();
        try {
            progress.getSavedCode().put(exerciseKey, code);
            progress.setUpdatedAt(System.currentTimeMillis());
            scheduleSave();
        } finally {
            lock.unlock();
        }
    }

    public String getSavedCode(String exerciseKey) {
        return progress.getSavedCode().get(exerciseKey);
    }

    public int unlockHint(String exerciseKey) {
        lock.lock();
        try {
            int current = progress.getHintUnlocks().getOrDefault(exerciseKey, 0);
            current++;
            progress.getHintUnlocks().put(exerciseKey, current);
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
            return current;
        } finally {
            lock.unlock();
        }
    }

    public int getHintsUnlocked(String exerciseKey) {
        return progress.getHintUnlocks().getOrDefault(exerciseKey, 0);
    }

    public int incrementFailCount(String exerciseKey) {
        lock.lock();
        try {
            if (progress.getFailCounts() == null) {
                progress.setFailCounts(new java.util.HashMap<>());
            }
            int current = progress.getFailCounts().getOrDefault(exerciseKey, 0) + 1;
            progress.getFailCounts().put(exerciseKey, current);
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
            return current;
        } finally {
            lock.unlock();
        }
    }

    public int getFailCount(String exerciseKey) {
        if (progress.getFailCounts() == null) {
            return 0;
        }
        return progress.getFailCounts().getOrDefault(exerciseKey, 0);
    }

    public boolean canCompleteLesson(com.qatrainer.model.Lesson lesson) {
        boolean allExercises = lesson.getExercises().isEmpty() || lesson.getExercises().stream()
                .allMatch(e -> progress.getCompletedExercises()
                        .contains(lesson.getId() + "::" + e.getId()));
        boolean quizOk = lesson.getQuiz().isEmpty()
                || progress.getCompletedQuizzes().contains(lesson.getId());
        return allExercises && quizOk;
    }

    public void setLastLesson(String lessonId) {
        lock.lock();
        try {
            progress.setLastLessonId(lessonId);
            progress.setUpdatedAt(System.currentTimeMillis());
            scheduleSave();
        } finally {
            lock.unlock();
        }
    }

    public boolean toggleBookmark(String lessonId) {
        lock.lock();
        try {
            boolean on;
            if (progress.getBookmarkedLessonIds().contains(lessonId)) {
                progress.getBookmarkedLessonIds().remove(lessonId);
                on = false;
            } else {
                progress.getBookmarkedLessonIds().add(lessonId);
                on = true;
            }
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
            return on;
        } finally {
            lock.unlock();
        }
    }

    /** Replace progress from imported JSON (full replace). */
    public void importProgress(UserProgress incoming, boolean replace) {
        lock.lock();
        try {
            if (incoming == null) {
                throw new IllegalArgumentException("Пустой прогресс");
            }
            if (replace) {
                progress = incoming;
            } else {
                progress.getCompletedLessons().addAll(nullSafe(incoming.getCompletedLessons()));
                progress.getCompletedExercises().addAll(nullSafe(incoming.getCompletedExercises()));
                progress.getCompletedQuizzes().addAll(nullSafe(incoming.getCompletedQuizzes()));
                progress.getBookmarkedLessonIds().addAll(nullSafe(incoming.getBookmarkedLessonIds()));
                if (incoming.getSavedCode() != null) progress.getSavedCode().putAll(incoming.getSavedCode());
                if (incoming.getHintUnlocks() != null) progress.getHintUnlocks().putAll(incoming.getHintUnlocks());
                if (incoming.getFailCounts() != null) {
                    if (progress.getFailCounts() == null) progress.setFailCounts(new java.util.HashMap<>());
                    progress.getFailCounts().putAll(incoming.getFailCounts());
                }
                if (incoming.getLastLessonId() != null) progress.setLastLessonId(incoming.getLastLessonId());
            }
            // Initialize null collections for both replace and merge modes
            if (progress.getBookmarkedLessonIds() == null) {
                progress.setBookmarkedLessonIds(new java.util.HashSet<>());
            }
            if (progress.getCompletedLessons() == null) {
                progress.setCompletedLessons(new java.util.HashSet<>());
            }
            if (progress.getCompletedExercises() == null) {
                progress.setCompletedExercises(new java.util.HashSet<>());
            }
            if (progress.getCompletedQuizzes() == null) {
                progress.setCompletedQuizzes(new java.util.HashSet<>());
            }
            if (progress.getSavedCode() == null) {
                progress.setSavedCode(new java.util.HashMap<>());
            }
            if (progress.getHintUnlocks() == null) {
                progress.setHintUnlocks(new java.util.HashMap<>());
            }
            if (progress.getFailCounts() == null) {
                progress.setFailCounts(new java.util.HashMap<>());
            }
            progress.setUpdatedAt(System.currentTimeMillis());
            saveNow();
        } finally {
            lock.unlock();
        }
    }

    private static java.util.Set<String> nullSafe(java.util.Set<String> s) {
        return s == null ? java.util.Set.of() : s;
    }

    public void reset() {
        lock.lock();
        try {
            progress = new UserProgress();
            saveNow();
        } finally {
            lock.unlock();
        }
    }

    public void flush() {
        lock.lock();
        try {
            if (pendingSave != null) {
                pendingSave.cancel(false);
                pendingSave = null;
            }
            if (dirty) {
                writeFile();
                dirty = false;
            }
        } finally {
            lock.unlock();
        }
    }

    private void scheduleSave() {
        dirty = true;
        if (pendingSave != null) {
            pendingSave.cancel(false);
        }
        pendingSave = scheduler.schedule(() -> {
            lock.lock();
            try {
                if (dirty) {
                    writeFile();
                    dirty = false;
                }
                pendingSave = null;
            } finally {
                lock.unlock();
            }
        }, SAVE_DEBOUNCE_MS, TimeUnit.MILLISECONDS);
    }

    private void saveNow() {
        if (pendingSave != null) {
            pendingSave.cancel(false);
            pendingSave = null;
        }
        dirty = false;
        writeFile();
    }

    private void writeFile() {
        try {
            Path progressPath = Path.of(properties.getProgressFile());
            Files.createDirectories(progressPath.getParent());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(progressPath.toFile(), progress);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot save progress", e);
        }
    }
}
