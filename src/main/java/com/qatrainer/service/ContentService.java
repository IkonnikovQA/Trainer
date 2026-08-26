package com.qatrainer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.model.Curriculum;
import com.qatrainer.model.Exercise;
import com.qatrainer.model.Lesson;
import com.qatrainer.model.LessonRef;
import com.qatrainer.model.Level;
import com.qatrainer.model.Module;
import com.qatrainer.model.UserProgress;
import jakarta.annotation.PostConstruct;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ContentService {

    private final ObjectMapper objectMapper;
    private final Parser markdownParser;
    private final HtmlRenderer htmlRenderer;

    private Curriculum curriculum;
    private final Map<String, Lesson> lessonsById = new HashMap<>();
    private final Map<String, String> lessonPathById = new HashMap<>();

    public ContentService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        var extensions = List.of(TablesExtension.create());
        this.markdownParser = Parser.builder().extensions(extensions).build();
        this.htmlRenderer = HtmlRenderer.builder().extensions(extensions).build();
    }

    @PostConstruct
    public void load() throws IOException {
        try (InputStream in = getClass().getResourceAsStream("/curriculum/index.json")) {
            if (in == null) {
                throw new IllegalStateException("curriculum/index.json not found");
            }
            curriculum = objectMapper.readValue(stripBom(in), Curriculum.class);
        }

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:curriculum/**/*.json");
        for (Resource resource : resources) {
            String filename = resource.getFilename();
            if (filename == null || "index.json".equals(filename)) {
                continue;
            }
            try (InputStream in = resource.getInputStream()) {
                Lesson lesson = objectMapper.readValue(stripBom(in), Lesson.class);
                lessonsById.put(lesson.getId(), lesson);
                lessonPathById.put(lesson.getId(), resource.getURI().toString());
            }
        }
    }

    private InputStream stripBom(InputStream in) throws IOException {
        BufferedInputStream buffered = new BufferedInputStream(in);
        buffered.mark(4);
        byte[] bom = new byte[3];
        int read = buffered.read(bom);
        if (read == 3 && (bom[0] & 0xFF) == 0xEF && (bom[1] & 0xFF) == 0xBB && (bom[2] & 0xFF) == 0xBF) {
            return buffered;
        }
        buffered.reset();
        return buffered;
    }

    public Curriculum getCurriculum() {
        return curriculum;
    }

    public Optional<Lesson> getLesson(String id) {
        return Optional.ofNullable(lessonsById.get(id));
    }

    public String renderTheoryHtml(Lesson lesson) {
        Node document = markdownParser.parse(lesson.getTheoryMarkdown() == null ? "" : lesson.getTheoryMarkdown());
        return htmlRenderer.render(document);
    }

    public List<LessonRef> allLessonRefs() {
        List<LessonRef> refs = new ArrayList<>();
        for (Level level : curriculum.getLevels()) {
            for (Module module : level.getModules()) {
                refs.addAll(module.getLessons());
            }
        }
        return refs;
    }

    public Optional<String> nextLessonId(String currentId) {
        List<LessonRef> refs = allLessonRefs();
        for (int i = 0; i < refs.size(); i++) {
            if (refs.get(i).getId().equals(currentId) && i + 1 < refs.size()) {
                return Optional.of(refs.get(i + 1).getId());
            }
        }
        return Optional.empty();
    }

    public Optional<String> prevLessonId(String currentId) {
        List<LessonRef> refs = allLessonRefs();
        for (int i = 0; i < refs.size(); i++) {
            if (refs.get(i).getId().equals(currentId) && i > 0) {
                return Optional.of(refs.get(i - 1).getId());
            }
        }
        return Optional.empty();
    }

    /**
     * Prefer an in-progress lesson (quiz/exercise/code touched but not completed),
     * otherwise the first incomplete lesson in curriculum order.
     * Never recommends a lesson from a locked level (Middle before Junior is done, etc.).
     */
    public Optional<LessonRef> recommendNext(UserProgress progress) {
        List<LessonRef> refs = allLessonRefs().stream()
                .filter(ref -> isLessonUnlocked(ref.getId(), progress))
                .toList();
        for (LessonRef ref : refs) {
            if (progress.getCompletedLessons().contains(ref.getId())) {
                continue;
            }
            if (isTouched(ref.getId(), progress)) {
                return Optional.of(ref);
            }
        }
        for (LessonRef ref : refs) {
            if (!progress.getCompletedLessons().contains(ref.getId())) {
                return Optional.of(ref);
            }
        }
        return Optional.empty();
    }

    /** Fraction of lessons in a level that are marked completed (0..1). */
    public double levelCompletionRatio(String levelId, UserProgress progress) {
        List<LessonRef> inLevel = lessonRefsForLevel(levelId);
        if (inLevel.isEmpty()) {
            return 1.0;
        }
        long done = inLevel.stream().filter(r -> progress.getCompletedLessons().contains(r.getId())).count();
        return (double) done / inLevel.size();
    }

    /**
     * Junior always open. Middle after ≥80% Junior. Senior after ≥80% Middle.
     */
    public boolean isLevelUnlocked(String levelId, UserProgress progress) {
        if (levelId == null || "junior".equals(levelId)) {
            return true;
        }
        if ("middle".equals(levelId)) {
            return levelCompletionRatio("junior", progress) >= 0.8;
        }
        if ("senior".equals(levelId)) {
            return levelCompletionRatio("middle", progress) >= 0.8;
        }
        return true;
    }

    public boolean isLessonUnlocked(String lessonId, UserProgress progress) {
        return levelIdOf(lessonId).map(lid -> isLevelUnlocked(lid, progress)).orElse(true);
    }

    public Optional<String> levelIdOf(String lessonId) {
        for (Level level : curriculum.getLevels()) {
            for (Module module : level.getModules()) {
                for (LessonRef ref : module.getLessons()) {
                    if (ref.getId().equals(lessonId)) {
                        return Optional.of(level.getId());
                    }
                }
            }
        }
        Lesson lesson = lessonsById.get(lessonId);
        if (lesson != null && lesson.getLevelId() != null) {
            return Optional.of(lesson.getLevelId());
        }
        return Optional.empty();
    }

    public List<LessonRef> lessonRefsForLevel(String levelId) {
        List<LessonRef> refs = new ArrayList<>();
        for (Level level : curriculum.getLevels()) {
            if (!level.getId().equals(levelId)) {
                continue;
            }
            for (Module module : level.getModules()) {
                refs.addAll(module.getLessons());
            }
        }
        return refs;
    }

    /** Highest unlocked track for interview filters: junior | middle | senior */
    public String focusLevel(UserProgress progress) {
        if (isLevelUnlocked("senior", progress)) {
            return "senior";
        }
        if (isLevelUnlocked("middle", progress)) {
            return "middle";
        }
        return "junior";
    }

    private boolean isTouched(String lessonId, UserProgress progress) {
        if (progress.getCompletedQuizzes().contains(lessonId)
                || progress.getCompletedQuizzes().stream().anyMatch(k -> k.startsWith(lessonId + "::"))) {
            return true;
        }
        Lesson lesson = lessonsById.get(lessonId);
        if (lesson == null) {
            return false;
        }
        for (Exercise e : lesson.getExercises()) {
            String key = lessonId + "::" + e.getId();
            if (progress.getCompletedExercises().contains(key)
                    || progress.getSavedCode().containsKey(key)
                    || (progress.getFailCounts() != null && progress.getFailCounts().containsKey(key))
                    || progress.getHintUnlocks().containsKey(key)) {
                return true;
            }
        }
        return lessonId.equals(progress.getLastLessonId());
    }

    public Map<String, Lesson> getLessonsById() {
        return Collections.unmodifiableMap(lessonsById);
    }

    public int totalLessons() {
        return lessonsById.size();
    }

    public int totalExercises() {
        return lessonsById.values().stream().mapToInt(l -> l.getExercises().size()).sum();
    }

    public int totalQuizQuestions() {
        return lessonsById.values().stream().mapToInt(l -> l.getQuiz().size()).sum();
    }
}
