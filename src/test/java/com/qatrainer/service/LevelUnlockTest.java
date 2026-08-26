package com.qatrainer.service;

import com.qatrainer.model.UserProgress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class LevelUnlockTest {

    @Autowired
    ContentService contentService;

    private UserProgress progress;

    @BeforeEach
    void setUp() {
        progress = new UserProgress();
        progress.setCompletedLessons(new HashSet<>());
    }

    @Test
    void juniorAlwaysOpenMiddleLockedAtStart() {
        assertThat(contentService.isLevelUnlocked("junior", progress)).isTrue();
        assertThat(contentService.isLevelUnlocked("middle", progress)).isFalse();
        assertThat(contentService.isLessonUnlocked("m-restassured", progress)).isFalse();
        assertThat(contentService.focusLevel(progress)).isEqualTo("junior");
    }

    @Test
    void middleUnlocksAfterMostOfJunior() {
        Set<String> juniorIds = contentService.lessonRefsForLevel("junior").stream()
                .map(r -> r.getId())
                .collect(Collectors.toSet());
        // 80% of junior
        int need = (int) Math.ceil(juniorIds.size() * 0.8);
        juniorIds.stream().limit(need).forEach(progress.getCompletedLessons()::add);

        assertThat(contentService.isLevelUnlocked("middle", progress)).isTrue();
        assertThat(contentService.isLevelUnlocked("senior", progress)).isFalse();
        assertThat(contentService.recommendNext(progress))
                .isPresent()
                .get()
                .extracting(r -> r.getId())
                .asString()
                .doesNotStartWith("s-");
    }

    @Test
    void recommendStaysInJuniorWhenIncomplete() {
        progress.getCompletedLessons().add("j-types");
        progress.setLastLessonId("j-locators");
        var next = contentService.recommendNext(progress);
        assertThat(next).isPresent();
        assertThat(next.get().getId()).startsWith("j-");
    }
}
