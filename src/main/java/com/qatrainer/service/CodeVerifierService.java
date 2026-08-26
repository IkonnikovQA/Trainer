package com.qatrainer.service;

import com.qatrainer.dto.CheckResult;
import com.qatrainer.lab.ExecutionGuard;
import com.qatrainer.lab.LabClasspath;
import com.qatrainer.lab.ProcessIsolator;
import com.qatrainer.lab.artifact.ArtifactChecker;
import com.qatrainer.lab.http.HttpLabHelper;
import com.qatrainer.lab.junit.JUnitLabRunner;
import com.qatrainer.lab.selenium.FakeDriver;
import com.qatrainer.model.Exercise;
import com.qatrainer.model.TestCase;
import okhttp3.mockwebserver.MockWebServer;
import org.springframework.stereotype.Service;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodeVerifierService {

    private static final Pattern CLASS_PATTERN = Pattern.compile("(?:public\\s+)?class\\s+(\\w+)");

    public CheckResult verify(Exercise exercise, String studentCode, List<String> unlockedHints) {
        if (studentCode == null || studentCode.isBlank()) {
            return withHints(CheckResult.fail("Код пустой. Напиши решение."), unlockedHints, exercise);
        }
        // Artifact checks are pure text — keep in-process.
        if ("artifact".equals(exercise.getMode())) {
            return verifyInProcess(exercise, studentCode, unlockedHints);
        }
        // Prefer isolated child JVM for student code.
        CheckResult isolated = ProcessIsolator.run(
                exercise, studentCode, unlockedHints, exercise.getTimeoutMs() + 3000L);
        if (isolated != null && isolated.getMessage() != null
                && isolated.getMessage().startsWith("Не удалось запустить")) {
            CheckResult fallback = verifyInProcess(exercise, studentCode, unlockedHints);
            String mode = exercise.getMode() == null ? "java" : exercise.getMode();
            if ("selenium-fake".equals(mode) || "http".equals(mode) || "junit".equals(mode)) {
                fallback.setWarning(
                        "Изолированный процесс недоступен (" + isolated.getMessage()
                                + "). Проверка выполнена in-process. Сделай: mvn dependency:copy-dependencies");
            }
            return withHints(fallback, unlockedHints, exercise);
        }
        return withHints(isolated, unlockedHints, exercise);
    }

    /** Used by LabWorker in a child process and as in-process fallback. */
    public CheckResult verifyInProcess(Exercise exercise, String studentCode, List<String> unlockedHints) {
        if (studentCode == null || studentCode.isBlank()) {
            return withHints(CheckResult.fail("Код пустой. Напиши решение."), unlockedHints, exercise);
        }
        String mode = exercise.getMode();
        try {
            return ExecutionGuard.run(() -> verifyByMode(exercise, studentCode, unlockedHints, mode),
                    exercise.getTimeoutMs());
        } catch (TimeoutException e) {
            return withHints(CheckResult.fail(e.getMessage()), unlockedHints, exercise);
        } catch (CompilationException e) {
            CheckResult fail = CheckResult.fail("Ошибка компиляции");
            fail.getDetails().addAll(e.getErrors());
            return withHints(fail, unlockedHints, exercise);
        } catch (Exception e) {
            CheckResult fail = CheckResult.fail("Ошибка выполнения: " + rootMessage(e));
            fail.getDetails().add(stackSummary(e));
            return withHints(fail, unlockedHints, exercise);
        }
    }

    private CheckResult verifyByMode(Exercise exercise, String studentCode, List<String> unlockedHints, String mode)
            throws Exception {
        if ("artifact".equals(mode)) {
            List<String> fails = ArtifactChecker.check(exercise.getArtifactKind(), studentCode, exercise.getArtifactRules());
            if (fails.isEmpty()) {
                return withHints(CheckResult.ok("Артефакт соответствует правилам."), unlockedHints, exercise);
            }
            CheckResult fail = CheckResult.fail("Артефакт не прошёл проверку (" + fails.size() + ")");
            fail.getDetails().addAll(fails);
            return withHints(fail, unlockedHints, exercise);
        }

        String className = exercise.getClassName() != null && !exercise.getClassName().isBlank()
                ? exercise.getClassName()
                : detectClassName(studentCode, exercise.getClassName());
        if (className == null) {
            return withHints(CheckResult.fail("Не удалось найти объявление class."), unlockedHints, exercise);
        }

        Map<String, String> sources = new HashMap<>();
        // File name must match the public class (usually exercise.className for junit)
        String sourceFileName = preferPublicClassName(studentCode, className);
        sources.put(sourceFileName, studentCode);
        if (exercise.getSupportSources() != null) {
            sources.putAll(exercise.getSupportSources());
        }

        if ("junit".equals(mode)) {
            Map<String, Class<?>> classes = compile(sources);
            Class<?> testClass = classes.get(className);
            if (testClass == null) {
                testClass = classes.get(sourceFileName);
            }
            if (testClass == null && !classes.isEmpty()) {
                testClass = classes.values().iterator().next();
            }
            List<String> failures = JUnitLabRunner.run(testClass);
            if (failures.isEmpty()) {
                return withHints(CheckResult.ok("Все JUnit-тесты зелёные."), unlockedHints, exercise);
            }
            CheckResult fail = CheckResult.fail("JUnit: есть падения (" + failures.size() + ")");
            fail.getDetails().addAll(failures);
            return withHints(fail, unlockedHints, exercise);
        }

        if (exercise.getVerifierCode() != null && !exercise.getVerifierCode().isBlank()) {
            String verifierSource = exercise.getVerifierCode();
            String verifierName = detectClassName(verifierSource, "ExerciseVerifier");
            sources.put(verifierName, verifierSource);
            Map<String, Class<?>> classes = compile(sources);
            Class<?> verifierClass = classes.get(verifierName);
            Object verifier = verifierClass.getDeclaredConstructor().newInstance();
            Class<?> studentClass = classes.get(className);
            List<String> failures;
            if ("http".equals(mode)) {
                try (MockWebServer server = HttpLabHelper.startFromStubJson(exercise.getHttpStubJson())) {
                    String baseUrl = HttpLabHelper.baseUrl(server);
                    failures = invokeVerifier(findVerifyMethod(verifierClass), verifier, studentClass, baseUrl, null);
                }
            } else if ("selenium-fake".equals(mode)) {
                FakeDriver driver = FakeDriver.fromFixtureJson(exercise.getFixtureJson());
                failures = invokeVerifier(findVerifyMethod(verifierClass), verifier, studentClass, null, driver);
            } else {
                Method run = verifierClass.getMethod("verify", Class.class);
                @SuppressWarnings("unchecked")
                List<String> f = (List<String>) run.invoke(verifier, studentClass);
                failures = f;
            }
            if (failures == null || failures.isEmpty()) {
                return withHints(CheckResult.ok("Все проверки пройдены! Отличная работа."), unlockedHints, exercise);
            }
            CheckResult fail = CheckResult.fail("Есть ошибки (" + failures.size() + ")");
            fail.getDetails().addAll(failures);
            return withHints(fail, unlockedHints, exercise);
        }

        if ("selenium-fake".equals(mode) || "http".equals(mode)) {
            return withHints(CheckResult.fail("Для режима " + mode + " нужен verifierCode."), unlockedHints, exercise);
        }

        Map<String, Class<?>> compiled = compile(sources);
        return runTestCases(exercise, compiled.get(className), unlockedHints);
    }

    private Method findVerifyMethod(Class<?> verifierClass) {
        for (Method m : verifierClass.getMethods()) {
            if ("verify".equals(m.getName())) return m;
        }
        throw new IllegalArgumentException("no verify");
    }

    @SuppressWarnings("unchecked")
    private List<String> invokeVerifier(Method run, Object verifier, Class<?> studentClass,
                                        String baseUrl, FakeDriver driver) throws Exception {
        Class<?>[] params = run.getParameterTypes();
        Object[] args = new Object[params.length];
        for (int i = 0; i < params.length; i++) {
            if (params[i] == Class.class) args[i] = studentClass;
            else if (params[i] == String.class) args[i] = baseUrl;
            else if (FakeDriver.class.isAssignableFrom(params[i])
                    || org.openqa.selenium.WebDriver.class.isAssignableFrom(params[i])) args[i] = driver;
            else args[i] = null;
        }
        return (List<String>) run.invoke(verifier, args);
    }

    private CheckResult runTestCases(Exercise exercise, Class<?> studentClass, List<String> unlockedHints) throws Exception {
        Object instance = null;
        try { instance = studentClass.getDeclaredConstructor().newInstance(); } catch (NoSuchMethodException ignored) {}
        List<String> failures = new ArrayList<>();
        int passed = 0;
        for (TestCase testCase : exercise.getTestCases()) {
            try {
                Object actual = evaluateCall(studentClass, instance, testCase.getCallExpression());
                Object expected = parseExpected(testCase.getExpected(), testCase.getExpectedType());
                if (!valuesEqual(actual, expected)) {
                    failures.add(testCase.getName() + ": expected [" + stringify(expected) + "] got [" + stringify(actual) + "]");
                } else passed++;
            } catch (Exception e) {
                failures.add(testCase.getName() + ": " + rootMessage(e));
            }
        }
        if (failures.isEmpty()) {
            return withHints(CheckResult.ok("OK (" + passed + "/" + exercise.getTestCases().size() + ")"), unlockedHints, exercise);
        }
        CheckResult fail = CheckResult.fail(passed + "/" + exercise.getTestCases().size());
        fail.getDetails().addAll(failures);
        return withHints(fail, unlockedHints, exercise);
    }

    private Object evaluateCall(Class<?> clazz, Object instance, String expression) throws Exception {
        String expr = expression.trim();
        if (expr.startsWith("new ")) {
            int dot = expr.indexOf(").");
            if (dot < 0) throw new IllegalArgumentException(expression);
            expr = expr.substring(dot + 2);
        } else {
            int firstParen = expr.indexOf('(');
            String beforeParen = firstParen > 0 ? expr.substring(0, firstParen) : expr;
            if (beforeParen.contains(".")) expr = expr.substring(expr.indexOf('.') + 1);
        }
        return invokeChain(clazz, instance, expr);
    }

    private Object invokeChain(Class<?> clazz, Object instance, String expression) throws Exception {
        Object current = instance;
        Class<?> currentClass = clazz;
        for (String call : splitChain(expression)) {
            Object result = invokeMethodCall(currentClass, current, call.trim());
            current = result;
            if (result != null) currentClass = result.getClass();
        }
        return current;
    }

    private List<String> splitChain(String expression) {
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inString = false;
        int depth = 0;
        for (int i = 0; i < expression.length(); i++) {
            char c = expression.charAt(i);
            if (c == '"' && (i == 0 || expression.charAt(i - 1) != '\\')) { inString = !inString; current.append(c); }
            else if (!inString && c == '(') { depth++; current.append(c); }
            else if (!inString && c == ')') { depth--; current.append(c); }
            else if (!inString && depth == 0 && c == '.') { parts.add(current.toString()); current = new StringBuilder(); }
            else current.append(c);
        }
        if (!current.isEmpty()) parts.add(current.toString());
        return parts;
    }

    private Object invokeMethodCall(Class<?> clazz, Object instance, String call) throws Exception {
        int open = call.indexOf('(');
        int close = call.lastIndexOf(')');
        if (open < 0 || close < open) throw new IllegalArgumentException(call);
        String methodName = call.substring(0, open).trim();
        String argsRaw = call.substring(open + 1, close).trim();
        List<Object> args = parseArgs(argsRaw);
        Method method = findMethod(clazz, methodName, args.size());
        method.setAccessible(true);
        Object target = java.lang.reflect.Modifier.isStatic(method.getModifiers()) ? null : instance;
        if (target == null && !java.lang.reflect.Modifier.isStatic(method.getModifiers())) {
            target = clazz.getDeclaredConstructor().newInstance();
        }
        Class<?>[] paramTypes = method.getParameterTypes();
        Object[] converted = new Object[args.size()];
        for (int i = 0; i < args.size(); i++) converted[i] = convertArg(args.get(i), paramTypes[i]);
        return method.invoke(target, converted);
    }

    private Method findMethod(Class<?> clazz, String name, int argCount) {
        for (Method m : clazz.getDeclaredMethods()) {
            if (m.getName().equals(name) && m.getParameterCount() == argCount) return m;
        }
        for (Method m : clazz.getMethods()) {
            if (m.getName().equals(name) && m.getParameterCount() == argCount) return m;
        }
        throw new IllegalArgumentException("method not found: " + name);
    }

    private List<Object> parseArgs(String raw) {
        List<Object> args = new ArrayList<>();
        if (raw.isBlank()) return args;
        for (String part : splitArgs(raw)) args.add(parseLiteral(part.trim()));
        return args;
    }

    private List<String> splitArgs(String raw) {
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inString = false;
        int depth = 0;
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (c == '"' && (i == 0 || raw.charAt(i - 1) != '\\')) { inString = !inString; current.append(c); }
            else if (!inString && c == '{') { depth++; current.append(c); }
            else if (!inString && c == '}') { depth--; current.append(c); }
            else if (!inString && depth == 0 && c == ',') { parts.add(current.toString()); current = new StringBuilder(); }
            else current.append(c);
        }
        parts.add(current.toString());
        return parts;
    }

    private Object parseLiteral(String raw) {
        if (raw.equals("null")) return null;
        if (raw.equals("true")) return true;
        if (raw.equals("false")) return false;
        if (raw.startsWith("\"") && raw.endsWith("\"")) return unescape(raw.substring(1, raw.length() - 1));
        if (raw.endsWith("L") || raw.endsWith("l")) return Long.parseLong(raw.substring(0, raw.length() - 1));
        if (raw.contains(".") || raw.endsWith("d") || raw.endsWith("D") || raw.endsWith("f") || raw.endsWith("F")) {
            return Double.parseDouble(raw.replaceAll("[fFdD]$", ""));
        }
        if (raw.matches("-?\\d+")) {
            long v = Long.parseLong(raw);
            if (v >= Integer.MIN_VALUE && v <= Integer.MAX_VALUE) return (int) v;
            return v;
        }
        if (raw.startsWith("{") && raw.endsWith("}")) {
            String inner = raw.substring(1, raw.length() - 1).trim();
            if (inner.isEmpty()) return new int[0];
            if (inner.matches("-?\\d+(\\s*,\\s*-?\\d+)*")) {
                String[] nums = inner.split(",");
                int[] arr = new int[nums.length];
                for (int i = 0; i < nums.length; i++) arr[i] = Integer.parseInt(nums[i].trim());
                return arr;
            }
            List<String> parts = splitArgs(inner);
            String[] arr = new String[parts.size()];
            for (int i = 0; i < parts.size(); i++) {
                Object lit = parseLiteral(parts.get(i).trim());
                arr[i] = lit == null ? null : String.valueOf(lit);
            }
            return arr;
        }
        return raw;
    }

    private Object parseExpected(String expected, String type) {
        if (expected == null) return null;
        String t = type == null ? "auto" : type.toLowerCase();
        return switch (t) {
            case "string" -> expected;
            case "int" -> Integer.parseInt(expected);
            case "long" -> Long.parseLong(expected);
            case "boolean" -> Boolean.parseBoolean(expected);
            case "double" -> Double.parseDouble(expected);
            case "null" -> null;
            default -> parseLiteral(expected.contains("\"") || expected.equals("true") || expected.equals("false")
                    || expected.equals("null") || expected.matches("-?\\d+(\\.\\d+)?[LlFfDd]?")
                    || expected.startsWith("{") ? expected : "\"" + expected + "\"");
        };
    }

    private Object convertArg(Object arg, Class<?> target) {
        if (arg == null) return null;
        if (target.isInstance(arg)) return arg;
        if (target == int.class || target == Integer.class) return ((Number) arg).intValue();
        if (target == long.class || target == Long.class) return ((Number) arg).longValue();
        if (target == double.class || target == Double.class) return ((Number) arg).doubleValue();
        if (target == float.class || target == Float.class) return ((Number) arg).floatValue();
        if (target == boolean.class || target == Boolean.class) return (Boolean) arg;
        if (target == String.class) return String.valueOf(arg);
        if (target == String[].class && arg instanceof int[] ia && ia.length == 0) {
            return new String[0];
        }
        if (target == String[].class && arg instanceof Object[] oa) {
            String[] out = new String[oa.length];
            for (int i = 0; i < oa.length; i++) out[i] = oa[i] == null ? null : String.valueOf(oa[i]);
            return out;
        }
        return arg;
    }

    private boolean valuesEqual(Object actual, Object expected) {
        if (actual == null && expected == null) return true;
        if (actual == null || expected == null) return false;
        if (actual instanceof Number && expected instanceof Number) {
            return Double.compare(((Number) actual).doubleValue(), ((Number) expected).doubleValue()) == 0;
        }
        if (actual.getClass().isArray() && expected.getClass().isArray()) {
            if (actual instanceof int[] ai && expected instanceof int[] ei) {
                return Arrays.equals(ai, ei);
            }
            if (actual instanceof Object[] ao && expected instanceof Object[] eo) {
                return Arrays.deepEquals(ao, eo);
            }
        }
        return actual.equals(expected) || String.valueOf(actual).equals(String.valueOf(expected));
    }

    private String stringify(Object value) {
        if (value == null) return "null";
        if (value instanceof int[] arr) return Arrays.toString(arr);
        if (value instanceof Object[] arr) return Arrays.deepToString(arr);
        return String.valueOf(value);
    }

    private CheckResult withHints(CheckResult result, List<String> unlockedHints, Exercise exercise) {
        result.setAvailableHints(unlockedHints == null ? List.of() : unlockedHints);
        result.setHintsUnlocked(unlockedHints == null ? 0 : unlockedHints.size());
        result.setTotalHints(exercise.getHints() == null ? 0 : exercise.getHints().size());
        return result;
    }

    private String detectClassName(String source, String fallback) {
        Matcher m = CLASS_PATTERN.matcher(source);
        if (m.find()) return m.group(1);
        return fallback;
    }

    /** Prefer explicit className / public class so multi-class units compile as Name.java. */
    private String preferPublicClassName(String source, String preferred) {
        if (preferred != null && !preferred.isBlank()) {
            Pattern publicPreferred = Pattern.compile("public\\s+class\\s+" + Pattern.quote(preferred) + "\\b");
            if (publicPreferred.matcher(source).find()) {
                return preferred;
            }
            if (Pattern.compile("(?:public\\s+)?class\\s+" + Pattern.quote(preferred) + "\\b").matcher(source).find()) {
                return preferred;
            }
        }
        Matcher pub = Pattern.compile("public\\s+class\\s+(\\w+)").matcher(source);
        if (pub.find()) {
            return pub.group(1);
        }
        return detectClassName(source, preferred);
    }

    private Map<String, Class<?>> compile(Map<String, String> sources) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) throw new CompilationException(List.of("Need JDK"));
        Map<String, String> filtered = new HashMap<>();
        sources.forEach((k, v) -> { if (v != null) filtered.put(k, v); });
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        List<JavaFileObject> units = new ArrayList<>();
        filtered.forEach((k, v) -> units.add(new SourceFile(k, v)));
        MemoryFileManager fileManager = new MemoryFileManager(compiler.getStandardFileManager(diagnostics, null, null));
        Boolean ok = compiler.getTask(null, fileManager, diagnostics, LabClasspath.javacOptions(), null, units).call();
        if (!Boolean.TRUE.equals(ok)) {
            List<String> errors = new ArrayList<>();
            for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
                if (d.getKind() == Diagnostic.Kind.ERROR) errors.add("Line " + d.getLineNumber() + ": " + d.getMessage(null));
            }
            if (errors.isEmpty()) errors.add("compile error");
            throw new CompilationException(errors);
        }
        MemoryClassLoader loader = new MemoryClassLoader(fileManager.getClassBytes());
        Map<String, Class<?>> result = new HashMap<>();
        try {
            for (String name : fileManager.getClassBytes().keySet()) {
                result.put(name, loader.loadClass(name));
            }
            for (String name : filtered.keySet()) {
                if (!result.containsKey(name)) {
                    result.put(name, loader.loadClass(name));
                }
            }
        } catch (ClassNotFoundException e) {
            throw new CompilationException(List.of(e.getMessage()));
        }
        return result;
    }

    private String rootMessage(Throwable e) {
        Throwable cur = e;
        while (cur.getCause() != null && cur.getCause() != cur) cur = cur.getCause();
        return cur.getClass().getSimpleName() + ": " + (cur.getMessage() == null ? "" : cur.getMessage());
    }

    private String stackSummary(Throwable e) {
        Throwable cur = e;
        while (cur.getCause() != null && cur.getCause() != cur) cur = cur.getCause();
        StackTraceElement[] st = cur.getStackTrace();
        return st.length == 0 ? cur.toString() : cur + " at " + st[0];
    }

    private String unescape(String s) {
        return s.replace("\\\"", "\"").replace("\\n", "\n").replace("\\t", "\t");
    }

    static class CompilationException extends RuntimeException {
        private final List<String> errors;
        CompilationException(List<String> errors) { super(String.join("; ", errors)); this.errors = errors; }
        List<String> getErrors() { return errors; }
    }

    static class SourceFile extends SimpleJavaFileObject {
        private final String code;
        SourceFile(String name, String code) {
            super(URI.create("string:///" + name.replace('.', '/') + ".java"), Kind.SOURCE);
            this.code = code;
        }
        @Override public CharSequence getCharContent(boolean ignoreEncodingErrors) { return code; }
    }

    static class ClassFile extends SimpleJavaFileObject {
        private final ByteArrayOutputStream out = new ByteArrayOutputStream();
        ClassFile(String name) { super(URI.create("bytes:///" + name.replace('.', '/') + ".class"), Kind.CLASS); }
        @Override public OutputStream openOutputStream() { return out; }
        byte[] getBytes() { return out.toByteArray(); }
    }

    static class MemoryFileManager extends ForwardingJavaFileManager<StandardJavaFileManager> {
        private final Map<String, ClassFile> classFiles = new HashMap<>();
        MemoryFileManager(StandardJavaFileManager fileManager) { super(fileManager); }
        @Override
        public JavaFileObject getJavaFileForOutput(Location location, String className, JavaFileObject.Kind kind, FileObject sibling) {
            ClassFile file = new ClassFile(className);
            classFiles.put(className, file);
            return file;
        }
        Map<String, byte[]> getClassBytes() {
            Map<String, byte[]> map = new HashMap<>();
            classFiles.forEach((k, v) -> map.put(k, v.getBytes()));
            return map;
        }
    }

    static class MemoryClassLoader extends ClassLoader {
        private final Map<String, byte[]> classes;
        MemoryClassLoader(Map<String, byte[]> classes) {
            super(CodeVerifierService.class.getClassLoader());
            this.classes = classes;
        }
        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            byte[] bytes = classes.get(name);
            if (bytes == null) throw new ClassNotFoundException(name);
            return defineClass(name, bytes, 0, bytes.length);
        }
    }
}
