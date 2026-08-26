package com.qatrainer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "trainer")
public class TrainerProperties {
    private String workspaceDir = "./workspace";
    private String progressFile = "./workspace/progress.json";
    private String contentDir = "classpath:curriculum";

    public String getWorkspaceDir() { return workspaceDir; }
    public void setWorkspaceDir(String workspaceDir) { this.workspaceDir = workspaceDir; }
    public String getProgressFile() { return progressFile; }
    public void setProgressFile(String progressFile) { this.progressFile = progressFile; }
    public String getContentDir() { return contentDir; }
    public void setContentDir(String contentDir) { this.contentDir = contentDir; }
}
