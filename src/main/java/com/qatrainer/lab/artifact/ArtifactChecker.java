package com.qatrainer.lab.artifact;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

public final class ArtifactChecker {

    private static final ObjectMapper YAML = new ObjectMapper(new YAMLFactory());

    private ArtifactChecker() {}

    public static List<String> check(String kind, String content, List<String> rules) {
        List<String> failures = new ArrayList<>();
        if (content == null || content.isBlank()) {
            failures.add("Артефакт пустой");
            return failures;
        }
        String text = content.replace("\r\n", "\n");
        String k = kind == null ? "" : kind.toLowerCase(Locale.ROOT);

        if (rules == null || rules.isEmpty()) {
            rules = defaultRules(k);
        }

        for (String rule : rules) {
            String fail = applyRule(k, text, rule);
            if (fail != null) {
                failures.add(fail);
            }
        }

        // Structural YAML checks for compose; for gha only when it looks like a workflow
        if ("compose".equals(k)) {
            failures.addAll(structuralYaml(k, text));
        } else if ("gha".equals(k) && (text.contains("runs-on:") || text.contains("actions/checkout"))) {
            failures.addAll(structuralYaml(k, text));
        } else if (rules.stream().anyMatch(r -> r.startsWith("yamlKey:"))) {
            // yamlKey rules already applied in loop
        }
        if ("jenkinsfile".equals(k)) {
            if (!text.contains("pipeline")) {
                failures.add("Нужен блок pipeline { }");
            }
            if (!Pattern.compile("stages\\s*\\{", Pattern.MULTILINE).matcher(text).find()
                    && !text.contains("stages {")) {
                failures.add("Нужен блок stages");
            }
        }
        return failures.stream().distinct().toList();
    }

    private static List<String> structuralYaml(String kind, String text) {
        List<String> fails = new ArrayList<>();
        // Skip if clearly not YAML (Jenkinsfile groovy)
        if (text.contains("pipeline {")) {
            return fails;
        }
        try {
            JsonNode root = YAML.readTree(text);
            if (root == null || !root.isObject()) {
                fails.add("YAML должен быть объектом верхнего уровня");
                return fails;
            }
            if ("compose".equals(kind)) {
                if (!root.has("services") || !root.get("services").isObject() || root.get("services").isEmpty()) {
                    fails.add("compose: нужен непустой ключ services");
                } else {
                    boolean anyImage = false;
                    Iterator<JsonNode> it = root.get("services").elements();
                    while (it.hasNext()) {
                        JsonNode svc = it.next();
                        if (svc.has("image")) anyImage = true;
                    }
                    if (!anyImage) fails.add("compose: хотя бы один service должен иметь image");
                }
            }
            if ("gha".equals(kind)) {
                if (!root.has("on") && !root.has("true")) {
                    // Jackson may parse 'on' as boolean true in YAML 1.1
                    if (!root.has("true")) {
                        fails.add("GitHub Actions: нужен ключ on");
                    }
                }
                if (!root.has("jobs") || !root.get("jobs").isObject() || root.get("jobs").isEmpty()) {
                    // policy YAML may not be gha — only enforce if looks like workflow
                    if (text.contains("runs-on:") || text.contains("actions/checkout")) {
                        fails.add("GitHub Actions: нужен непустой jobs");
                    }
                }
            }
        } catch (Exception e) {
            // policy-like YAML with custom keys is fine; only fail hard for compose
            if ("compose".equals(kind)) {
                fails.add("Не удалось разобрать YAML: " + e.getMessage());
            }
        }
        return fails;
    }

    private static List<String> defaultRules(String kind) {
        return switch (kind) {
            case "dockerfile" -> List.of(
                    "contains:FROM",
                    "contains:COPY pom.xml",
                    "pomBeforeSrc",
                    "noSecret:password",
                    "noSecret:TOKEN="
            );
            case "jenkinsfile" -> List.of(
                    "contains:pipeline",
                    "contains:stages",
                    "contains:post",
                    "contains:junit",
                    "hasStageTest",
                    "noSecret:password"
            );
            case "compose" -> List.of(
                    "contains:services:",
                    "contains:image:",
                    "noSecret:PASSWORD"
            );
            case "gha" -> List.of(
                    "contains:on:",
                    "contains:jobs:",
                    "contains:runs-on:",
                    "contains:actions/checkout",
                    "contains:mvn",
                    "noSecret:password"
            );
            default -> List.of("contains:.");
        };
    }

    private static String applyRule(String kind, String text, String rule) {
        if (rule.startsWith("contains:")) {
            String needle = rule.substring("contains:".length());
            if (!text.contains(needle)) {
                return "Ожидался фрагмент: " + needle;
            }
            return null;
        }
        if (rule.startsWith("yamlKey:")) {
            String key = rule.substring("yamlKey:".length()).trim();
            try {
                JsonNode root = YAML.readTree(text);
                if (root == null || !root.has(key)) {
                    return "YAML: отсутствует ключ " + key;
                }
            } catch (Exception e) {
                return "YAML parse error for key " + key + ": " + e.getMessage();
            }
            return null;
        }
        if (rule.startsWith("regex:")) {
            String pattern = rule.substring("regex:".length());
            if (!Pattern.compile(pattern, Pattern.MULTILINE | Pattern.DOTALL).matcher(text).find()) {
                return "Не найдено по regex: " + pattern;
            }
            return null;
        }
        if (rule.startsWith("noSecret:")) {
            String needle = rule.substring("noSecret:".length());
            if (text.contains(needle + "=") || text.contains(needle + ":")) {
                return "Не храни секреты в файле (" + needle + ")";
            }
            return null;
        }
        if ("pomBeforeSrc".equals(rule)) {
            int pom = indexOfIgnoreCase(text, "COPY pom.xml");
            if (pom < 0) pom = indexOfIgnoreCase(text, "COPY ./pom.xml");
            int src = indexOfIgnoreCase(text, "COPY src");
            if (src < 0) src = indexOfIgnoreCase(text, "COPY ./src");
            if (pom >= 0 && src >= 0 && pom > src) {
                return "COPY pom.xml должен идти до COPY src (кэш зависимостей)";
            }
            return null;
        }
        if ("hasStageTest".equals(rule)) {
            if (!Pattern.compile("stage\\s*\\(\\s*['\"]Test['\"]\\s*\\)", Pattern.CASE_INSENSITIVE).matcher(text).find()
                    && !text.contains("stage('Test')") && !text.contains("stage(\"Test\")")) {
                return "Нужен stage Test";
            }
            return null;
        }
        return "Неизвестное правило: " + rule;
    }

    private static int indexOfIgnoreCase(String text, String needle) {
        return text.toLowerCase(Locale.ROOT).indexOf(needle.toLowerCase(Locale.ROOT));
    }
}
