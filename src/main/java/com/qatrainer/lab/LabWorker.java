package com.qatrainer.lab;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qatrainer.dto.CheckResult;
import com.qatrainer.model.Exercise;
import com.qatrainer.service.CodeVerifierService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * Entry point for isolated student-code verification in a child JVM.
 * Args: &lt;request.json&gt; &lt;result.json&gt;
 */
public final class LabWorker {

    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: LabWorker <request.json> <result.json>");
            System.exit(2);
        }
        ObjectMapper om = new ObjectMapper();
        Map<?, ?> req = om.readValue(Path.of(args[0]).toFile(), Map.class);
        Exercise exercise = om.convertValue(req.get("exercise"), Exercise.class);
        String code = String.valueOf(req.get("code"));
        @SuppressWarnings("unchecked")
        List<String> hints = req.get("hints") instanceof List<?> list
                ? (List<String>) list
                : List.of();

        CodeVerifierService verifier = new CodeVerifierService();
        CheckResult result = verifier.verifyInProcess(exercise, code, hints);
        om.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(), result);
    }
}
