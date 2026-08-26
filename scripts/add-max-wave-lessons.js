const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function write(rel, obj) {
  fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n');
  console.log('wrote', rel);
}

write('middle/m-jwt-auth.json', {
  id: 'm-jwt-auth',
  title: 'API auth: Bearer и 401/403',
  summary: 'Различай authentication и authorization на HTTP-уровне.',
  theoryMarkdown:
    '# Bearer / JWT в API-тестах\n\n```java\ngiven().header("Authorization", "Bearer " + token)\n  .when().get("/secure")\n  .then().statusCode(200);\n```\n\n- **401** — нет/битый токен (не аутентифицирован)\n- **403** — токен есть, прав нет\n\nНе логируй токены в Allure.\n',
  keyPoints: ['Bearer header', '401 vs 403', 'Не светить токены в отчётах'],
  interviewTips: ['Как тестируешь refresh token?', 'Negative cases auth'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Клиент отправил валидный JWT, но роль без доступа. Ожидаемый код?',
      options: ['401', '403', '404', '204'],
      correctIndexes: [1],
      explanation: 'Authenticated but forbidden.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'SecureClient with Bearer',
      description:
        'fetchSecure(baseUrl, token): GET /secure с Authorization Bearer. Верни status code. Stub: с токеном secret → 200, иначе 401.',
      difficulty: 'hard',
      mode: 'http',
      className: 'SecureClient',
      httpStubJson:
        '{"stubs":[{"status":401,"body":"{\\"error\\":\\"unauthorized\\"}","headers":{"Content-Type":"application/json"}},{"status":200,"body":"{\\"ok\\":true}","headers":{"Content-Type":"application/json"}}]}',
      starterCode: `import static io.restassured.RestAssured.*;

public class SecureClient {
    public int fetchSecure(String baseUrl, String token) {
        // TODO GET baseUrl+"/secure" with Bearer token, return status
        return 0;
    }
}
`,
      solutionCode: `import static io.restassured.RestAssured.*;

public class SecureClient {
    public int fetchSecure(String baseUrl, String token) {
        return given()
            .header("Authorization", "Bearer " + token)
            .when()
            .get(baseUrl + "/secure")
            .then()
            .extract().statusCode();
    }
}
`,
      hints: [
        'header("Authorization", "Bearer " + token)',
        'get(baseUrl + "/secure").extract().statusCode()'
      ],
      verifierCode: `import java.util.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {
    List<String> fails = new ArrayList<>();
    Object c = cls.getDeclaredConstructor().newInstance();
    // first stub 401 for bad/empty — MockWebServer is sequential; call with secret then without
    // Our stubs are queued: first response then second. So call bad first then good.
    int bad = (Integer) cls.getMethod("fetchSecure", String.class, String.class).invoke(c, baseUrl, "bad");
    int ok = (Integer) cls.getMethod("fetchSecure", String.class, String.class).invoke(c, baseUrl, "secret");
    if (bad != 401) fails.add("expected 401 for bad token, got " + bad);
    if (ok != 200) fails.add("expected 200 for secret token, got " + ok);
    return fails;
  }
}`
    }
  ],
  levelId: 'middle',
  moduleId: 'api'
});

write('middle/m-junit-params.json', {
  id: 'm-junit-params',
  title: 'ParameterizedTest и @CsvSource',
  summary: 'Один тест — много данных без копипасты.',
  theoryMarkdown:
    '# Parameterized tests\n\n```java\n@ParameterizedTest\n@CsvSource({"secret12,true", "ab1,false"})\nvoid check(String pwd, boolean ok) {\n  assertEquals(ok, rule.isValid(pwd));\n}\n```\n\nИсточники: `@ValueSource`, `@CsvSource`, `@MethodSource`.\n',
  keyPoints: ['@ParameterizedTest', '@CsvSource', 'Меньше дублей'],
  interviewTips: ['MethodSource vs CsvSource', 'DisplayName generation'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Чтобы прогнать один тест на наборе строк, используй:',
      options: ['@RepeatedTest', '@ParameterizedTest', '@Disabled', '@Tag'],
      correctIndexes: [1],
      explanation: 'ParameterizedTest.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'CsvSource password matrix',
      description:
        'Допиши @ParameterizedTest с @CsvSource для PasswordRule.isValid: secret12→true, ab1→false, longpassword→false.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'PasswordParamsTest',
      supportSources: {
        PasswordRule:
          'public class PasswordRule {\n  public boolean isValid(String p) {\n    if (p == null || p.length() < 8) return false;\n    for (int i = 0; i < p.length(); i++) if (Character.isDigit(p.charAt(i))) return true;\n    return false;\n  }\n}'
      },
      starterCode: `import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

public class PasswordParamsTest {
    private final PasswordRule rule = new PasswordRule();

    // TODO: @ParameterizedTest + @CsvSource with password,expected
    @ParameterizedTest
    @CsvSource({
        // "secret12, true"
    })
    void validates(String password, boolean expected) {
        assertEquals(expected, rule.isValid(password));
    }
}
`,
      solutionCode: `import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

public class PasswordParamsTest {
    private final PasswordRule rule = new PasswordRule();

    @ParameterizedTest
    @CsvSource({
        "secret12, true",
        "ab1, false",
        "longpassword, false"
    })
    void validates(String password, boolean expected) {
        assertEquals(expected, rule.isValid(password));
    }
}
`,
      hints: ['@CsvSource({"secret12, true", "ab1, false", ...})', 'assertEquals(expected, rule.isValid(password))']
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

write('middle/m-test-config.json', {
  id: 'm-test-config',
  title: 'Конфиг тестов: baseUrl и env',
  summary: 'Вынеси окружение из хардкода — иначе CI и local разъедутся.',
  theoryMarkdown:
    '# Test config\n\n```java\npublic class TestConfig {\n  public static String baseUrl() {\n    return System.getenv().getOrDefault("BASE_URL", "http://localhost:8080");\n  }\n}\n```\n\nПрофили: local / stage. Не коммить секреты.\n',
  keyPoints: ['getenv / property', 'default для local', 'без секретов в git'],
  interviewTips: ['Как переключаешь стенды?', 'Secrets в CI'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'baseUrl лучше брать из:',
      options: ['хардкода в каждом тесте', 'конфига/env с default', 'скриншота', 'CSS'],
      correctIndexes: [1],
      explanation: 'Env/config.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'TestConfig.baseUrl',
      description:
        'Реализуй TestConfig.baseUrl(): если system property qa.baseUrl задан — его, иначе default http://localhost:8080. Тесты проверят оба пути.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'TestConfigTest',
      starterCode: `import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TestConfig {
    static String baseUrl() {
        // TODO read System.getProperty("qa.baseUrl") with default
        return "";
    }
}

public class TestConfigTest {
    @AfterEach
    void clear() { System.clearProperty("qa.baseUrl"); }

    @Test
    void defaultUrl() {
        System.clearProperty("qa.baseUrl");
        assertEquals("http://localhost:8080", TestConfig.baseUrl());
    }

    @Test
    void fromProperty() {
        System.setProperty("qa.baseUrl", "https://stage.example");
        assertEquals("https://stage.example", TestConfig.baseUrl());
    }
}
`,
      solutionCode: `import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TestConfig {
    static String baseUrl() {
        String v = System.getProperty("qa.baseUrl");
        return (v == null || v.isBlank()) ? "http://localhost:8080" : v;
    }
}

public class TestConfigTest {
    @AfterEach
    void clear() { System.clearProperty("qa.baseUrl"); }

    @Test
    void defaultUrl() {
        System.clearProperty("qa.baseUrl");
        assertEquals("http://localhost:8080", TestConfig.baseUrl());
    }

    @Test
    void fromProperty() {
        System.setProperty("qa.baseUrl", "https://stage.example");
        assertEquals("https://stage.example", TestConfig.baseUrl());
    }
}
`,
      hints: ['System.getProperty("qa.baseUrl")', 'default http://localhost:8080']
    }
  ],
  levelId: 'middle',
  moduleId: 'api'
});

write('junior/j-records-fixtures.json', {
  id: 'j-records-fixtures',
  title: 'Java records как test data',
  summary: 'Record — компактные неизменяемые фикстуры для тестов.',
  theoryMarkdown:
    '# Records (Java 16+)\n\n```java\npublic record UserFixture(String email, int age) {}\nnew UserFixture("a@b.c", 20);\n```\n\nУдобно для тестовых данных: equals/hashCode/toString из коробки.\n',
  keyPoints: ['record = data carrier', 'immutable', 'меньше boilerplate'],
  interviewTips: ['Record vs class для DTO', 'Можно ли наследовать record?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'record по умолчанию:',
      options: ['mutable bean', 'immutable data carrier', 'abstract class', 'enum'],
      correctIndexes: [1],
      explanation: 'Компоненты final.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'UserFixture record',
      description:
        'Объяви record UserFixture(String email, int age) и тесты: adult если age>=18 через helper isAdult(fixture).',
      difficulty: 'medium',
      mode: 'junit',
      className: 'UserFixtureTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

// TODO: public record UserFixture(String email, int age) {}

class Fixtures {
    static boolean isAdult(UserFixture u) {
        return u.age() >= 18;
    }
}

public class UserFixtureTest {
    @Test
    void adult() {
        // TODO assertTrue Fixtures.isAdult(new UserFixture("a@b.c", 20))
    }
    @Test
    void teen() {
        // TODO assertFalse for age 16
    }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

record UserFixture(String email, int age) {}

class Fixtures {
    static boolean isAdult(UserFixture u) {
        return u.age() >= 18;
    }
}

public class UserFixtureTest {
    @Test
    void adult() {
        assertTrue(Fixtures.isAdult(new UserFixture("a@b.c", 20)));
    }
    @Test
    void teen() {
        assertFalse(Fixtures.isAdult(new UserFixture("t@b.c", 16)));
    }
}
`,
      hints: ['record UserFixture(String email, int age) {}', 'u.age() >= 18']
    }
  ],
  levelId: 'junior',
  moduleId: 'java-basics'
});

// Strengthen thin senior
function patchSenior(file, mut) {
  const p = path.join(root, file);
  const L = JSON.parse(fs.readFileSync(p, 'utf8'));
  mut(L);
  fs.writeFileSync(p, JSON.stringify(L, null, 2) + '\n');
  console.log('patched', file);
}

patchSenior('senior/s-pyramid.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'Test strategy checklist YAML',
      description:
        'YAML-политика пирамиды: ключи unit_share, api_share, ui_share (числа), принцип shift_left: true. Без password.',
      difficulty: 'medium',
      mode: 'artifact',
      artifactKind: 'gha',
      artifactRules: [
        'contains:unit_share',
        'contains:api_share',
        'contains:ui_share',
        'contains:shift_left',
        'yamlKey:unit_share',
        'noSecret:password'
      ],
      className: 'PyramidPolicy',
      starterCode: `# Test pyramid policy\n# TODO: unit_share, api_share, ui_share, shift_left\n`,
      solutionCode: `unit_share: 70
api_share: 20
ui_share: 10
shift_left: true
`,
      hints: ['unit_share: 70', 'shift_left: true']
    }
  ];
});

patchSenior('senior/s-metrics.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'Metrics dashboard asserts',
      description:
        'Допиши Metrics.report(flakeRate, feedbackMin): строка "flake={n};feedback={m}m". Тесты проверяют формат и порог isHealthy(flakeRate<=5 && feedbackMin<=15).',
      difficulty: 'medium',
      mode: 'junit',
      className: 'MetricsTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Metrics {
    static String report(int flakeRate, int feedbackMin) {
        // TODO
        return "";
    }
    static boolean isHealthy(int flakeRate, int feedbackMin) {
        // TODO flakeRate <= 5 && feedbackMin <= 15
        return false;
    }
}

public class MetricsTest {
    @Test
    void format() { assertEquals("flake=2;feedback=10m", Metrics.report(2, 10)); }
    @Test
    void healthy() { assertTrue(Metrics.isHealthy(3, 12)); }
    @Test
    void unhealthyFlake() { assertFalse(Metrics.isHealthy(9, 10)); }
    @Test
    void unhealthyFeedback() { assertFalse(Metrics.isHealthy(2, 40)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Metrics {
    static String report(int flakeRate, int feedbackMin) {
        return "flake=" + flakeRate + ";feedback=" + feedbackMin + "m";
    }
    static boolean isHealthy(int flakeRate, int feedbackMin) {
        return flakeRate <= 5 && feedbackMin <= 15;
    }
}

public class MetricsTest {
    @Test
    void format() { assertEquals("flake=2;feedback=10m", Metrics.report(2, 10)); }
    @Test
    void healthy() { assertTrue(Metrics.isHealthy(3, 12)); }
    @Test
    void unhealthyFlake() { assertFalse(Metrics.isHealthy(9, 10)); }
    @Test
    void unhealthyFeedback() { assertFalse(Metrics.isHealthy(2, 40)); }
}
`,
      hints: ['"flake=" + flakeRate + ";feedback=" + feedbackMin + "m"', 'flakeRate <= 5 && feedbackMin <= 15']
    }
  ];
});

patchSenior('senior/s-codereview.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'Review findings aggregator',
      description:
        'ReviewReport: add(severity, msg), summary() → "HIGH:n;MEDIUM:n;LOW:n" по счётчикам. Тесты ниже.',
      difficulty: 'hard',
      mode: 'junit',
      className: 'ReviewReportTest',
      starterCode: `import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ReviewReport {
    private final Map<String, Integer> counts = new HashMap<>();
    void add(String severity, String msg) {
        // TODO increment counts for HIGH/MEDIUM/LOW (ignore unknown)
    }
    String summary() {
        // TODO return HIGH:x;MEDIUM:y;LOW:z using getOrDefault 0
        return "";
    }
}

public class ReviewReportTest {
    @Test
    void aggregates() {
        ReviewReport r = new ReviewReport();
        r.add("HIGH", "sleep");
        r.add("HIGH", "sleep2");
        r.add("MEDIUM", "dup");
        r.add("LOW", "name");
        r.add("INFO", "skip");
        assertEquals("HIGH:2;MEDIUM:1;LOW:1", r.summary());
    }
}
`,
      solutionCode: `import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ReviewReport {
    private final Map<String, Integer> counts = new HashMap<>();
    void add(String severity, String msg) {
        if (!Set.of("HIGH", "MEDIUM", "LOW").contains(severity)) return;
        counts.merge(severity, 1, Integer::sum);
    }
    String summary() {
        return "HIGH:" + counts.getOrDefault("HIGH", 0)
            + ";MEDIUM:" + counts.getOrDefault("MEDIUM", 0)
            + ";LOW:" + counts.getOrDefault("LOW", 0);
    }
}

public class ReviewReportTest {
    @Test
    void aggregates() {
        ReviewReport r = new ReviewReport();
        r.add("HIGH", "sleep");
        r.add("HIGH", "sleep2");
        r.add("MEDIUM", "dup");
        r.add("LOW", "name");
        r.add("INFO", "skip");
        assertEquals("HIGH:2;MEDIUM:1;LOW:1", r.summary());
    }
}
`,
      hints: ['counts.merge(severity, 1, Integer::sum)', 'HIGH:x;MEDIUM:y;LOW:z']
    }
  ];
});

patchSenior('senior/s-playwright-java.json', (L) => {
  L.exercises = [
    {
      id: 'e1',
      title: 'Tool choice policy YAML',
      description:
        'YAML: when_playwright (строка), when_selenium, migrate_rule. Без password. Опиши стратегию выбора инструмента.',
      difficulty: 'medium',
      mode: 'artifact',
      artifactKind: 'gha',
      artifactRules: [
        'contains:when_playwright',
        'contains:when_selenium',
        'contains:migrate_rule',
        'noSecret:password'
      ],
      className: 'ToolPolicy',
      starterCode: `# UI tool policy\n# TODO\n`,
      solutionCode: `when_playwright: greenfield UI with traces and auto-wait
when_selenium: mature Grid and existing POM investment
migrate_rule: evolve critical paths first, do not rewrite overnight
`,
      hints: ['when_playwright:', 'when_selenium:', 'migrate_rule:']
    }
  ];
});

// index.json
const indexPath = path.join(root, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
function mod(levelId, moduleId) {
  return index.levels.find((l) => l.id === levelId).modules.find((m) => m.id === moduleId);
}
function addLesson(module, lesson) {
  if (!module.lessons.some((l) => l.id === lesson.id)) module.lessons.push(lesson);
}

addLesson(mod('junior', 'java-basics'), {
  id: 'j-records-fixtures',
  title: 'Java records как test data',
  file: 'junior/j-records-fixtures.json',
  estimatedMinutes: 20
});
addLesson(mod('middle', 'api'), {
  id: 'm-jwt-auth',
  title: 'API auth: Bearer и 401/403',
  file: 'middle/m-jwt-auth.json',
  estimatedMinutes: 30
});
addLesson(mod('middle', 'api'), {
  id: 'm-test-config',
  title: 'Конфиг тестов',
  file: 'middle/m-test-config.json',
  estimatedMinutes: 25
});
addLesson(mod('middle', 'quality'), {
  id: 'm-junit-params',
  title: 'ParameterizedTest',
  file: 'middle/m-junit-params.json',
  estimatedMinutes: 25
});

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log('index updated');
