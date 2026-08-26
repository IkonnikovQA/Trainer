package com.qatrainer.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.model.UserProgress;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiHonestyAndProgressTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @Test
    void quizCheckDoesNotLeakCorrectIndexes() throws Exception {
        MvcResult res = mvc.perform(post("/api/quiz/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"lessonId":"j-types","questionId":"q1","selectedIndexes":[0]}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = om.readTree(res.getResponse().getContentAsString());
        assertThat(body.has("correct")).isTrue();
        if (body.has("correctIndexes")) {
            assertThat(body.get("correctIndexes")).isEmpty();
        }
    }

    @Test
    void exerciseCheckDoesNotEmbedSolutionCode() throws Exception {
        MvcResult res = mvc.perform(post("/api/exercise/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"lessonId":"j-types","exerciseId":"e1","code":"public class Basics { public int sum(int a,int b){return 0;} }"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = om.readTree(res.getResponse().getContentAsString());
        assertThat(body.path("solutionCode").isMissingNode() || body.path("solutionCode").isNull()
                || body.path("solutionCode").asText("").isBlank()).isTrue();
    }

    @Test
    void progressExportImportRoundTrip() throws Exception {
        mvc.perform(get("/api/progress/export"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedLessons").exists());

        UserProgress p = new UserProgress();
        p.getCompletedLessons().add("j-types");
        p.getBookmarkedLessonIds().add("j-junit");

        mvc.perform(post("/api/progress/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(java.util.Map.of("replace", true, "progress", p))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));

        MvcResult exported = mvc.perform(get("/api/progress/export")).andExpect(status().isOk()).andReturn();
        JsonNode body = om.readTree(exported.getResponse().getContentAsString());
        assertThat(body.get("completedLessons").toString()).contains("j-types");
        assertThat(body.get("bookmarkedLessonIds").toString()).contains("j-junit");
    }
}
