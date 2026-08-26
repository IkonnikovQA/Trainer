package com.qatrainer.lab.junit;

import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.Launcher;
import org.junit.platform.launcher.LauncherDiscoveryRequest;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.junit.platform.launcher.listeners.TestExecutionSummary;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

public final class JUnitLabRunner {

    private JUnitLabRunner() {}

    public static List<String> run(Class<?> testClass) {
        LauncherDiscoveryRequest request = LauncherDiscoveryRequestBuilder.request()
                .selectors(DiscoverySelectors.selectClass(testClass))
                .build();
        Launcher launcher = LauncherFactory.create();
        SummaryGeneratingListener listener = new SummaryGeneratingListener();
        launcher.registerTestExecutionListeners(listener);
        launcher.execute(request);
        TestExecutionSummary summary = listener.getSummary();
        List<String> failures = new ArrayList<>();
        if (summary.getTestsFoundCount() == 0) {
            failures.add("Не найдено ни одного @Test. Добавь тестовые методы.");
            return failures;
        }
        summary.getFailures().forEach(f -> {
            Throwable t = f.getException();
            String msg = t == null ? "unknown" : (t.getMessage() == null ? t.toString() : t.getMessage());
            failures.add(f.getTestIdentifier().getDisplayName() + ": " + msg);
        });
        if (summary.getTestsSucceededCount() == 0 && failures.isEmpty()) {
            failures.add("Тесты не прошли (0 successful).");
        }
        return failures;
    }

    public static String summarize(Class<?> testClass) {
        List<String> fails = run(testClass);
        if (fails.isEmpty()) {
            return "OK";
        }
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        fails.forEach(pw::println);
        return sw.toString();
    }
}
