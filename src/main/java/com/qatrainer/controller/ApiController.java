package com.qatrainer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.dto.CheckResult;
import com.qatrainer.dto.ExerciseSubmitRequest;
import com.qatrainer.dto.QuizCheckResult;
import com.qatrainer.dto.QuizSubmitRequest;
import com.qatrainer.model.Curriculum;
import com.qatrainer.model.Exercise;
import com.qatrainer.model.Lesson;
import com.qatrainer.model.UserProgress;
import com.qatrainer.service.ContentService;
import com.qatrainer.service.ExerciseService;
import com.qatrainer.service.ProgressService;
import com.qatrainer.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final ContentService contentService;
    private final ProgressService progressService;
    private final QuizService quizService;
    private final ExerciseService exerciseService;
    private final ObjectMapper objectMapper;

    public ApiController(ContentService contentService,
                         ProgressService progressService,
                         QuizService quizService,
                         ExerciseService exerciseService,
                         ObjectMapper objectMapper) {
        this.contentService = contentService;
        this.progressService = progressService;
        this.quizService = quizService;
        this.exerciseService = exerciseService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/curriculum")
    public Curriculum curriculum() {
        return contentService.getCurriculum();
    }

    @GetMapping("/progress")
    public Map<String, Object> progress() {
        UserProgress p = progressService.getProgress();
        Map<String, Object> map = new HashMap<>();
        map.put("progress", p);
        map.put("totalLessons", contentService.totalLessons());
        map.put("totalExercises", contentService.totalExercises());
        map.put("totalQuizQuestions", contentService.totalQuizQuestions());
        map.put("completedLessons", p.getCompletedLessons().size());
        map.put("completedExercises", p.getCompletedExercises().size());
        return map;
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<?> lesson(@PathVariable String id) {
        return contentService.getLesson(id)
                .<ResponseEntity<?>>map(lesson -> {
                    progressService.setLastLesson(id);
                    Map<String, Object> body = new HashMap<>();
                    body.put("lesson", sanitizeLesson(lesson));
                    body.put("theoryHtml", contentService.renderTheoryHtml(lesson));
                    body.put("prevId", contentService.prevLessonId(id).orElse(null));
                    body.put("nextId", contentService.nextLessonId(id).orElse(null));
                    Map<String, String> codes = new HashMap<>();
                    for (Exercise e : lesson.getExercises()) {
                        codes.put(e.getId(), exerciseService.starterOrSaved(id, e));
                    }
                    body.put("codes", codes);
                    Map<String, Object> labContexts = new HashMap<>();
                    for (Exercise e : lesson.getExercises()) {
                        Map<String, Object> ctx = new HashMap<>();
                        ctx.put("mode", e.getMode());
                        ctx.put("artifactKind", e.getArtifactKind());
                        if (e.getFixtureJson() != null && !e.getFixtureJson().isBlank()) {
                            ctx.put("fixturePreview", e.getFixtureJson().length() > 800
                                    ? e.getFixtureJson().substring(0, 800) + "…"
                                    : e.getFixtureJson());
                        }
                        if (e.getHttpStubJson() != null && !e.getHttpStubJson().isBlank()) {
                            ctx.put("httpStubPreview", e.getHttpStubJson().length() > 800
                                    ? e.getHttpStubJson().substring(0, 800) + "…"
                                    : e.getHttpStubJson());
                        }
                        labContexts.put(e.getId(), ctx);
                    }
                    body.put("labContexts", labContexts);
                    body.put("progress", progressService.getProgress());
                    return ResponseEntity.ok(body);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/quiz/check")
    public QuizCheckResult checkQuiz(@RequestBody QuizSubmitRequest request) {
        QuizCheckResult result = quizService.check(request.getLessonId(), request.getQuestionId(), request.getSelectedIndexes());
        quizService.markLessonQuizCompleteIfReady(request.getLessonId());
        return result;
    }

    @PostMapping("/exercise/check")
    public CheckResult checkExercise(@RequestBody ExerciseSubmitRequest request) {
        return exerciseService.submit(request.getLessonId(), request.getExerciseId(), request.getCode());
    }

    @PostMapping("/exercise/save")
    public Map<String, Object> save(@RequestBody ExerciseSubmitRequest request) {
        // Soft save without running tests
        contentService.getLesson(request.getLessonId()).ifPresent(lesson -> {
            lesson.getExercises().stream()
                    .filter(e -> e.getId().equals(request.getExerciseId()))
                    .findFirst()
                    .ifPresent(e -> progressService.saveCode(
                            request.getLessonId() + "::" + request.getExerciseId(),
                            request.getCode() == null ? "" : request.getCode()));
        });
        return Map.of("ok", true);
    }

    @PostMapping("/exercise/hint")
    public ResponseEntity<?> hint(@RequestBody ExerciseSubmitRequest request) {
        try {
            List<String> hints = exerciseService.unlockHint(request.getLessonId(), request.getExerciseId());
            return ResponseEntity.ok(Map.of("hints", hints, "count", hints.size()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "hints", List.of(), "count", 0));
        }
    }

    @PostMapping("/exercise/solution")
    public ResponseEntity<?> solution(@RequestBody ExerciseSubmitRequest request) {
        try {
            String code = exerciseService.revealSolution(request.getLessonId(), request.getExerciseId());
            return ResponseEntity.ok(Map.of("solutionCode", code));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/lesson/{id}/complete")
    public Map<String, Object> complete(@PathVariable String id) {
        Lesson lesson = contentService.getLesson(id)
                .orElseThrow(() -> new IllegalArgumentException("Урок не найден"));
        if (!progressService.canCompleteLesson(lesson)) {
            return Map.of("ok", false, "message", "Сначала пройди квиз и все практические задания.");
        }
        progressService.markLessonCompleted(id);
        return Map.of("ok", true);
    }

    @PostMapping("/progress/reset")
    public Map<String, Object> reset() {
        progressService.reset();
        return Map.of("ok", true);
    }

    @GetMapping("/progress/export")
    public UserProgress exportProgress() {
        progressService.flush();
        return progressService.getProgress();
    }

    @PostMapping("/progress/import")
    public Map<String, Object> importProgress(@RequestBody Map<String, Object> body) {
        boolean replace = Boolean.TRUE.equals(body.get("replace"));
        Object raw = body.get("progress");
        if (raw == null) {
            return Map.of("ok", false, "message", "Нужно поле progress");
        }
        try {
            UserProgress p = objectMapper.convertValue(raw, UserProgress.class);
            progressService.importProgress(p, replace);
            return Map.of("ok", true);
        } catch (Exception e) {
            return Map.of("ok", false, "message", "Не удалось импортировать: " + e.getMessage());
        }
    }

    @PostMapping("/progress/bookmark/{lessonId}")
    public Map<String, Object> bookmark(@PathVariable String lessonId) {
        boolean on = progressService.toggleBookmark(lessonId);
        return Map.of("ok", true, "bookmarked", on);
    }

    private Lesson sanitizeLesson(Lesson lesson) {
        Lesson copy = new Lesson();
        copy.setId(lesson.getId());
        copy.setLevelId(lesson.getLevelId());
        copy.setModuleId(lesson.getModuleId());
        copy.setTitle(lesson.getTitle());
        copy.setSummary(lesson.getSummary());
        copy.setTheoryMarkdown(null);
        copy.setKeyPoints(lesson.getKeyPoints());
        copy.setInterviewTips(lesson.getInterviewTips());
        copy.setQuiz(lesson.getQuiz().stream().map(q -> {
            var safe = new com.qatrainer.model.QuizQuestion();
            safe.setId(q.getId());
            safe.setType(q.getType());
            safe.setQuestion(q.getQuestion());
            safe.setOptions(q.getOptions());
            safe.setCorrectIndexes(List.of());
            safe.setExplanation(null);
            safe.setHint(null);
            return safe;
        }).toList());
        copy.setExercises(lesson.getExercises().stream().map(e -> {
            var safe = new Exercise();
            safe.setId(e.getId());
            safe.setTitle(e.getTitle());
            safe.setDescription(e.getDescription());
            safe.setDifficulty(e.getDifficulty());
            safe.setMode(e.getMode());
            safe.setStarterCode(e.getStarterCode());
            safe.setClassName(e.getClassName());
            safe.setMethodName(e.getMethodName());
            safe.setRevealAfterFails(e.getRevealAfterFails());
            safe.setArtifactKind(e.getArtifactKind());
            safe.setHints(List.of());
            safe.setTestCases(List.of());
            safe.setVerifierCode(null);
            safe.setSolutionCode(null);
            safe.setFixtureJson(null);
            safe.setHttpStubJson(null);
            return safe;
        }).toList());
        return copy;
    }
}
