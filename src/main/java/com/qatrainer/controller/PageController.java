package com.qatrainer.controller;

import com.qatrainer.service.ContentService;
import com.qatrainer.service.ProgressService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    private final ContentService contentService;
    private final ProgressService progressService;

    public PageController(ContentService contentService, ProgressService progressService) {
        this.contentService = contentService;
        this.progressService = progressService;
    }

    @GetMapping("/")
    public String home(Model model) {
        var progress = progressService.getProgress();
        model.addAttribute("curriculum", contentService.getCurriculum());
        model.addAttribute("progress", progress);
        model.addAttribute("bookmarks", progress.getBookmarkedLessonIds());
        long unlockedLessonCount = contentService.allLessonRefs().stream()
                .filter(ref -> contentService.isLessonUnlocked(ref.getId(), progress))
                .count();
        long unlockedDone = progress.getCompletedLessons().stream()
                .filter(id -> contentService.isLessonUnlocked(id, progress))
                .count();
        model.addAttribute("totalLessons", unlockedLessonCount);
        model.addAttribute("doneLessons", unlockedDone);
        model.addAttribute("totalExercises", contentService.totalExercises());
        model.addAttribute("totalQuiz", contentService.totalQuizQuestions());
        model.addAttribute("juniorUnlocked", true);
        model.addAttribute("middleUnlocked", contentService.isLevelUnlocked("middle", progress));
        model.addAttribute("seniorUnlocked", contentService.isLevelUnlocked("senior", progress));
        model.addAttribute("focusLevel", contentService.focusLevel(progress));
        var titles = new java.util.HashMap<String, String>();
        contentService.allLessonRefs().forEach(ref -> titles.put(ref.getId(), ref.getTitle()));
        model.addAttribute("lessonTitles", titles);
        contentService.recommendNext(progress)
                .ifPresent(ref -> model.addAttribute("recommended", ref));
        return "index";
    }

    @GetMapping("/lesson/{id}")
    public String lesson(@PathVariable String id, Model model) {
        if (contentService.getLesson(id).isEmpty()) {
            return "redirect:/";
        }
        var progress = progressService.getProgress();
        if (!contentService.isLessonUnlocked(id, progress)) {
            return "redirect:/?locked=" + id;
        }
        model.addAttribute("lessonId", id);
        model.addAttribute("curriculum", contentService.getCurriculum());
        model.addAttribute("progress", progress);
        return "lesson";
    }

    @GetMapping("/interview")
    public String interview(Model model) {
        var progress = progressService.getProgress();
        model.addAttribute("curriculum", contentService.getCurriculum());
        model.addAttribute("progress", progress);
        model.addAttribute("focusLevel", contentService.focusLevel(progress));
        model.addAttribute("middleUnlocked", contentService.isLevelUnlocked("middle", progress));
        model.addAttribute("seniorUnlocked", contentService.isLevelUnlocked("senior", progress));
        return "interview";
    }
}
