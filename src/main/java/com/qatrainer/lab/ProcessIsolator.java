package com.qatrainer.lab;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.dto.CheckResult;
import com.qatrainer.model.Exercise;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public final class ProcessIsolator {

    private static final ObjectMapper OM = new ObjectMapper();

    private ProcessIsolator() {}

    public static CheckResult run(Exercise exercise, String code, List<String> hints, long timeoutMs) {
        Path dir = null;
        try {
            dir = Files.createTempDirectory("qaforge-lab-");
            Path req = dir.resolve("request.json");
            Path out = dir.resolve("result.json");
            OM.writeValue(req.toFile(), Map.of(
                    "exercise", exercise,
                    "code", code,
                    "hints", hints == null ? List.of() : hints
            ));

            String javaHome = System.getProperty("java.home");
            Path javaBin = Path.of(javaHome, "bin",
                    System.getProperty("os.name", "").toLowerCase().contains("win") ? "java.exe" : "java");

            List<String> cmd = new ArrayList<>();
            cmd.add(javaBin.toString());
            cmd.add("-cp");
            cmd.add(LabClasspath.resolve());
            cmd.add("com.qatrainer.lab.LabWorker");
            cmd.add(req.toAbsolutePath().toString());
            cmd.add(out.toAbsolutePath().toString());

            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(Math.max(timeoutMs, 1000), TimeUnit.MILLISECONDS);
            String console = readFully(process.getInputStream());
            if (!finished) {
                process.destroyForcibly();
                return CheckResult.fail("Превышен лимит выполнения в изолированном процессе (" + timeoutMs + " мс).");
            }
            if (process.exitValue() != 0 && !Files.exists(out)) {
                CheckResult fail = CheckResult.fail("Изолированная проверка завершилась с ошибкой (exit " + process.exitValue() + ")");
                if (!console.isBlank()) {
                    fail.getDetails().add(console.length() > 2000 ? console.substring(0, 2000) : console);
                }
                return fail;
            }
            if (!Files.exists(out)) {
                CheckResult fail = CheckResult.fail("Нет результата изолированной проверки");
                if (!console.isBlank()) fail.getDetails().add(console);
                return fail;
            }
            return OM.readValue(out.toFile(), CheckResult.class);
        } catch (Exception e) {
            CheckResult fail = CheckResult.fail("Не удалось запустить изолированную проверку: " + e.getMessage());
            fail.getDetails().add("Fallback hint: выполни mvn dependency:copy-dependencies");
            return fail;
        } finally {
            if (dir != null) {
                try {
                    Files.walk(dir)
                            .sorted((a, b) -> b.compareTo(a))
                            .forEach(p -> {
                                try { Files.deleteIfExists(p); } catch (Exception ignored) {}
                            });
                } catch (Exception ignored) {}
            }
        }
    }

    private static String readFully(InputStream in) {
        try {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }
}
