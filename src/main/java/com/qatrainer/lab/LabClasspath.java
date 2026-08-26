package com.qatrainer.lab;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Builds an explicit classpath for javac / isolated student-code JVM.
 * Prefers target/dependency/*.jar (maven-dependency-plugin) so fat-jar launches still work.
 */
public final class LabClasspath {

    private LabClasspath() {}

    public static String resolve() {
        Set<String> entries = new LinkedHashSet<>();

        String cp = System.getProperty("java.class.path");
        if (cp != null && !cp.isBlank()) {
            for (String part : cp.split(File.pathSeparator)) {
                if (!part.isBlank()) {
                    entries.add(new File(part).getAbsolutePath());
                }
            }
        }

        Path dependencyDir = findDependencyDir();
        if (dependencyDir != null && Files.isDirectory(dependencyDir)) {
            try (Stream<Path> stream = Files.list(dependencyDir)) {
                stream.filter(p -> p.toString().endsWith(".jar"))
                        .forEach(p -> entries.add(p.toAbsolutePath().toString()));
            } catch (Exception ignored) {
                // keep going with java.class.path
            }
        }

        Path classes = findClassesDir();
        if (classes != null && Files.isDirectory(classes)) {
            entries.add(classes.toAbsolutePath().toString());
        }

        return String.join(File.pathSeparator, entries);
    }

    public static List<String> javacOptions() {
        List<String> opts = new ArrayList<>();
        opts.add("-classpath");
        opts.add(resolve());
        opts.add("-encoding");
        opts.add("UTF-8");
        return opts;
    }

    private static Path findDependencyDir() {
        Path cwd = Path.of("").toAbsolutePath();
        Path[] candidates = {
                cwd.resolve("target/dependency"),
                cwd.resolve("dependency"),
                Path.of(System.getProperty("user.dir", ".")).resolve("target/dependency")
        };
        for (Path p : candidates) {
            if (Files.isDirectory(p)) {
                return p;
            }
        }
        return null;
    }

    private static Path findClassesDir() {
        Path cwd = Path.of("").toAbsolutePath();
        Path[] candidates = {
                cwd.resolve("target/classes"),
                Path.of(System.getProperty("user.dir", ".")).resolve("target/classes")
        };
        for (Path p : candidates) {
            if (Files.isDirectory(p)) {
                return p;
            }
        }
        return null;
    }

    public static String describe() {
        String cp = resolve();
        long jars = Stream.of(cp.split(File.pathSeparator)).filter(s -> s.endsWith(".jar")).count();
        return "entries=" + cp.split(File.pathSeparator).length + ", jars=" + jars;
    }
}
