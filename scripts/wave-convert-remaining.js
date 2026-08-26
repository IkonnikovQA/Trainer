const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
function save(rel, obj) {
  fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n');
  console.log('patched', rel);
}

function junitExercise({
  id = 'e1',
  title,
  description,
  className,
  supportSources,
  starterCode,
  solutionCode,
  hints
}) {
  return {
    id,
    title,
    description,
    difficulty: 'medium',
    mode: 'junit',
    className,
    supportSources: supportSources || undefined,
    starterCode,
    solutionCode,
    hints
  };
}

// --- Middle ---
{
  const L = load('middle/m-testdata.json');
  L.exercises = [
    junitExercise({
      title: 'Unique email factory',
      description: 'Реализуй EmailFactory.email(prefix, id) → prefix+\"+\"+id+\"@example.com\". Тесты уже есть.',
      className: 'EmailFactoryTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailFactory {
    static String email(String prefix, String id) {
        // TODO
        return "";
    }
}

public class EmailFactoryTest {
    @Test
    void builds() {
        assertEquals("qa+42@example.com", EmailFactory.email("qa", "42"));
    }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailFactory {
    static String email(String prefix, String id) {
        return prefix + "+" + id + "@example.com";
    }
}

public class EmailFactoryTest {
    @Test
    void builds() {
        assertEquals("qa+42@example.com", EmailFactory.email("qa", "42"));
    }
}
`,
      hints: ['prefix + "+" + id + "@example.com"']
    })
  ];
  save('middle/m-testdata.json', L);
}

{
  const L = load('middle/m-flaky.json');
  L.exercises = [
    junitExercise({
      title: 'Flake rate calculator',
      description: 'FlakeStats.rate(flaky, total): целые проценты flaky*100/total; total==0 → 0. Допиши реализацию — тесты готовы.',
      className: 'FlakeStatsTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FlakeStats {
    static int rate(int flaky, int total) {
        // TODO
        return -1;
    }
}

public class FlakeStatsTest {
    @Test
    void percent() { assertEquals(25, FlakeStats.rate(1, 4)); }
    @Test
    void zeroTotal() { assertEquals(0, FlakeStats.rate(3, 0)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FlakeStats {
    static int rate(int flaky, int total) {
        if (total == 0) return 0;
        return flaky * 100 / total;
    }
}

public class FlakeStatsTest {
    @Test
    void percent() { assertEquals(25, FlakeStats.rate(1, 4)); }
    @Test
    void zeroTotal() { assertEquals(0, FlakeStats.rate(3, 0)); }
}
`,
      hints: ['if (total == 0) return 0;', 'return flaky * 100 / total;']
    })
  ];
  save('middle/m-flaky.json', L);
}

{
  const L = load('middle/m-stale-flaky.json');
  L.exercises = [
    junitExercise({
      title: 'shouldRefetch decision',
      description: 'StalePolicy.shouldRefetch(domChanged, elementCached): true если элемент кэширован И DOM изменился.',
      className: 'StalePolicyTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StalePolicy {
    static boolean shouldRefetch(boolean domChanged, boolean elementCached) {
        // TODO
        return false;
    }
}

public class StalePolicyTest {
    @Test
    void needsRefetch() { assertTrue(StalePolicy.shouldRefetch(true, true)); }
    @Test
    void freshOk() { assertFalse(StalePolicy.shouldRefetch(true, false)); }
    @Test
    void unchanged() { assertFalse(StalePolicy.shouldRefetch(false, true)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StalePolicy {
    static boolean shouldRefetch(boolean domChanged, boolean elementCached) {
        return domChanged && elementCached;
    }
}

public class StalePolicyTest {
    @Test
    void needsRefetch() { assertTrue(StalePolicy.shouldRefetch(true, true)); }
    @Test
    void freshOk() { assertFalse(StalePolicy.shouldRefetch(true, false)); }
    @Test
    void unchanged() { assertFalse(StalePolicy.shouldRefetch(false, true)); }
}
`,
      hints: ['return domChanged && elementCached;']
    })
  ];
  save('middle/m-stale-flaky.json', L);
}

{
  const L = load('middle/m-db.json');
  L.exercises = [
    junitExercise({
      title: 'Safe SQL identifier',
      description: 'SqlSafe.safeId(name): только [A-Za-z0-9_], иначе \"INVALID\".',
      className: 'SqlSafeTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SqlSafe {
    static String safeId(String name) {
        // TODO
        return "";
    }
}

public class SqlSafeTest {
    @Test
    void ok() { assertEquals("users_1", SqlSafe.safeId("users_1")); }
    @Test
    void bad() { assertEquals("INVALID", SqlSafe.safeId("users;drop")); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SqlSafe {
    static String safeId(String name) {
        if (name == null || !name.matches("[A-Za-z0-9_]+")) return "INVALID";
        return name;
    }
}

public class SqlSafeTest {
    @Test
    void ok() { assertEquals("users_1", SqlSafe.safeId("users_1")); }
    @Test
    void bad() { assertEquals("INVALID", SqlSafe.safeId("users;drop")); }
}
`,
      hints: ['name.matches("[A-Za-z0-9_]+")']
    })
  ];
  save('middle/m-db.json', L);
}

{
  const L = load('middle/m-patterns.json');
  L.exercises = [
    junitExercise({
      title: 'Fluent Query builder',
      description: 'Допиши Query.withPath/withLimit (return this) и build() → \"PATH {path} LIMIT {limit}\".',
      className: 'QueryBuilderTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Query {
    private String path = "";
    private int limit = 0;
    Query withPath(String p) { /* TODO return this */ return this; }
    Query withLimit(int n) { /* TODO */ return this; }
    String build() { /* TODO */ return ""; }
}

public class QueryBuilderTest {
    @Test
    void fluent() {
        String s = new Query().withPath("/users").withLimit(10).build();
        assertEquals("PATH /users LIMIT 10", s);
    }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Query {
    private String path = "";
    private int limit = 0;
    Query withPath(String p) { this.path = p; return this; }
    Query withLimit(int n) { this.limit = n; return this; }
    String build() { return "PATH " + path + " LIMIT " + limit; }
}

public class QueryBuilderTest {
    @Test
    void fluent() {
        String s = new Query().withPath("/users").withLimit(10).build();
        assertEquals("PATH /users LIMIT 10", s);
    }
}
`,
      hints: ['this.path = p; return this;', 'return "PATH " + path + " LIMIT " + limit;']
    })
  ];
  save('middle/m-patterns.json', L);
}

// --- Senior ---
{
  const L = load('senior/s-jenkinsfile.json');
  L.exercises = [
    {
      id: 'e1',
      title: 'Jenkinsfile with parallel browsers',
      description:
        'Jenkinsfile: pipeline, stages, parallel chrome/firefox с mvn test -Dbrowser=..., post junit. Без password=.',
      difficulty: 'hard',
      mode: 'artifact',
      artifactKind: 'jenkinsfile',
      artifactRules: [
        'contains:pipeline',
        'contains:stages',
        'contains:parallel',
        'contains:mvn',
        'contains:post',
        'contains:junit',
        'noSecret:password'
      ],
      className: 'Jenkinsfile',
      starterCode: `pipeline {
  agent any
  stages {
    stage('Test') {
      // TODO parallel chrome / firefox
    }
  }
  post {
    // TODO junit
  }
}
`,
      solutionCode: `pipeline {
  agent any
  stages {
    stage('Test') {
      parallel {
        stage('chrome') { steps { sh 'mvn -B test -Dbrowser=chrome' } }
        stage('firefox') { steps { sh 'mvn -B test -Dbrowser=firefox' } }
      }
    }
  }
  post {
    always { junit '**/surefire-reports/*.xml' }
  }
}
`,
      hints: ['parallel { stage(...) { steps { sh ... } } }', 'post { always { junit ... } }']
    }
  ];
  save('senior/s-jenkinsfile.json', L);
}

{
  const L = load('senior/s-framework.json');
  L.exercises = [
    junitExercise({
      title: 'SuiteSelector for PR vs nightly',
      description: 'SuiteSelector.select(isPr): PR → \"smoke\", иначе \"regression\".',
      className: 'SuiteSelectorTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SuiteSelector {
    static String select(boolean isPr) {
        // TODO
        return "";
    }
}

public class SuiteSelectorTest {
    @Test
    void pr() { assertEquals("smoke", SuiteSelector.select(true)); }
    @Test
    void nightly() { assertEquals("regression", SuiteSelector.select(false)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SuiteSelector {
    static String select(boolean isPr) {
        return isPr ? "smoke" : "regression";
    }
}

public class SuiteSelectorTest {
    @Test
    void pr() { assertEquals("smoke", SuiteSelector.select(true)); }
    @Test
    void nightly() { assertEquals("regression", SuiteSelector.select(false)); }
}
`,
      hints: ['return isPr ? "smoke" : "regression";']
    })
  ];
  save('senior/s-framework.json', L);
}

{
  const L = load('senior/s-codereview.json');
  L.exercises = [
    junitExercise({
      title: 'Review severity classifier',
      description: 'ReviewBot.severity(issue): содержит sleep→HIGH, duplicated locator→MEDIUM, naming→LOW, иначе INFO.',
      className: 'ReviewBotTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ReviewBot {
    static String severity(String issue) {
        // TODO
        return "";
    }
}

public class ReviewBotTest {
    @Test
    void sleep() { assertEquals("HIGH", ReviewBot.severity("Thread.sleep in wait")); }
    @Test
    void dup() { assertEquals("MEDIUM", ReviewBot.severity("duplicated locator in pages")); }
    @Test
    void naming() { assertEquals("LOW", ReviewBot.severity("bad naming of test")); }
    @Test
    void other() { assertEquals("INFO", ReviewBot.severity("typo in comment")); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ReviewBot {
    static String severity(String issue) {
        String s = issue == null ? "" : issue.toLowerCase();
        if (s.contains("sleep")) return "HIGH";
        if (s.contains("duplicated locator")) return "MEDIUM";
        if (s.contains("naming")) return "LOW";
        return "INFO";
    }
}

public class ReviewBotTest {
    @Test
    void sleep() { assertEquals("HIGH", ReviewBot.severity("Thread.sleep in wait")); }
    @Test
    void dup() { assertEquals("MEDIUM", ReviewBot.severity("duplicated locator in pages")); }
    @Test
    void naming() { assertEquals("LOW", ReviewBot.severity("bad naming of test")); }
    @Test
    void other() { assertEquals("INFO", ReviewBot.severity("typo in comment")); }
}
`,
      hints: ['if (s.contains("sleep")) return "HIGH";', 'duplicated locator → MEDIUM, naming → LOW']
    })
  ];
  save('senior/s-codereview.json', L);
}

{
  const L = load('senior/s-contract.json');
  L.exercises = [
    {
      id: 'e1',
      title: 'API contract version check',
      description:
        'ContractClient.check(baseUrl): GET /contract, status 200, body.version major == 2 (path \"version\" like \"2.1.0\"). Верни true.',
      difficulty: 'hard',
      mode: 'http',
      className: 'ContractClient',
      httpStubJson:
        '{"stubs":[{"status":200,"body":"{\\"version\\":\\"2.1.0\\",\\"endpoints\\":[\\"/login\\"]}","headers":{"Content-Type":"application/json"}}]}',
      starterCode: `import static io.restassured.RestAssured.*;

public class ContractClient {
    public boolean check(String baseUrl) {
        // TODO GET /contract, assert major version 2
        return false;
    }
}
`,
      solutionCode: `import static io.restassured.RestAssured.*;

public class ContractClient {
    public boolean check(String baseUrl) {
        String version = given().when().get(baseUrl + "/contract")
            .then().statusCode(200).extract().path("version");
        return version != null && version.startsWith("2.");
    }
}
`,
      hints: ['get(baseUrl + "/contract")', 'version.startsWith("2.")'],
      verifierCode: `import java.util.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {
    List<String> fails = new ArrayList<>();
    Object c = cls.getDeclaredConstructor().newInstance();
    boolean ok = (Boolean) cls.getMethod("check", String.class).invoke(c, baseUrl);
    if (!ok) fails.add("check must return true for version 2.x");
    return fails;
  }
}`
    }
  ];
  save('senior/s-contract.json', L);
}

{
  const L = load('senior/s-security-qa.json');
  L.exercises = [
    junitExercise({
      title: 'HTTP access code mapper',
      description: 'AccessCodes.expected(authenticated, allowed): !auth→401, auth&&!allowed→403, иначе 200.',
      className: 'AccessCodesTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AccessCodes {
    static int expected(boolean authenticated, boolean allowed) {
        // TODO
        return 0;
    }
}

public class AccessCodesTest {
    @Test
    void unauthorized() { assertEquals(401, AccessCodes.expected(false, true)); }
    @Test
    void forbidden() { assertEquals(403, AccessCodes.expected(true, false)); }
    @Test
    void ok() { assertEquals(200, AccessCodes.expected(true, true)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AccessCodes {
    static int expected(boolean authenticated, boolean allowed) {
        if (!authenticated) return 401;
        if (!allowed) return 403;
        return 200;
    }
}

public class AccessCodesTest {
    @Test
    void unauthorized() { assertEquals(401, AccessCodes.expected(false, true)); }
    @Test
    void forbidden() { assertEquals(403, AccessCodes.expected(true, false)); }
    @Test
    void ok() { assertEquals(200, AccessCodes.expected(true, true)); }
}
`,
      hints: ['if (!authenticated) return 401;', 'if (!allowed) return 403;']
    })
  ];
  save('senior/s-security-qa.json', L);
}

{
  const L = load('senior/s-metrics.json');
  L.exercises = [
    junitExercise({
      title: 'Feedback minutes',
      description: 'CiMetrics.feedbackMin(queueSec, runSec) = ceil((queue+run)/60).',
      className: 'CiMetricsTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CiMetrics {
    static int feedbackMin(int queueSec, int runSec) {
        // TODO
        return 0;
    }
}

public class CiMetricsTest {
    @Test
    void exact() { assertEquals(2, CiMetrics.feedbackMin(60, 60)); }
    @Test
    void ceil() { assertEquals(1, CiMetrics.feedbackMin(1, 0)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CiMetrics {
    static int feedbackMin(int queueSec, int runSec) {
        return (queueSec + runSec + 59) / 60;
    }
}

public class CiMetricsTest {
    @Test
    void exact() { assertEquals(2, CiMetrics.feedbackMin(60, 60)); }
    @Test
    void ceil() { assertEquals(1, CiMetrics.feedbackMin(1, 0)); }
}
`,
      hints: ['(queueSec + runSec + 59) / 60']
    })
  ];
  save('senior/s-metrics.json', L);
}

{
  const L = load('senior/s-pyramid.json');
  L.exercises = [
    junitExercise({
      title: 'Risk score',
      description: 'Risk.score(criticality, likelihood) = product (1..3 each).',
      className: 'RiskTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Risk {
    static int score(int criticality, int likelihood) {
        // TODO
        return 0;
    }
}

public class RiskTest {
    @Test
    void high() { assertEquals(9, Risk.score(3, 3)); }
    @Test
    void low() { assertEquals(1, Risk.score(1, 1)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Risk {
    static int score(int criticality, int likelihood) {
        return criticality * likelihood;
    }
}

public class RiskTest {
    @Test
    void high() { assertEquals(9, Risk.score(3, 3)); }
    @Test
    void low() { assertEquals(1, Risk.score(1, 1)); }
}
`,
      hints: ['return criticality * likelihood;']
    })
  ];
  save('senior/s-pyramid.json', L);
}

{
  const L = load('senior/s-performance-basics.json');
  L.exercises = [
    junitExercise({
      title: 'p95 budget check',
      description: 'Perf.isSlow(p95, budget): true если p95 > budget.',
      className: 'PerfTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Perf {
    static boolean isSlow(long p95, long budget) {
        // TODO
        return false;
    }
}

public class PerfTest {
    @Test
    void slow() { assertTrue(Perf.isSlow(1200, 1000)); }
    @Test
    void ok() { assertFalse(Perf.isSlow(900, 1000)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Perf {
    static boolean isSlow(long p95, long budget) {
        return p95 > budget;
    }
}

public class PerfTest {
    @Test
    void slow() { assertTrue(Perf.isSlow(1200, 1000)); }
    @Test
    void ok() { assertFalse(Perf.isSlow(900, 1000)); }
}
`,
      hints: ['return p95 > budget;']
    })
  ];
  save('senior/s-performance-basics.json', L);
}

{
  const L = load('senior/s-observability.json');
  L.exercises = [
    junitExercise({
      title: 'Correlation request id',
      description: 'TraceIds.requestId(testName, ts) → testName + \"-\" + ts.',
      className: 'TraceIdsTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TraceIds {
    static String requestId(String testName, long ts) {
        // TODO
        return "";
    }
}

public class TraceIdsTest {
    @Test
    void builds() { assertEquals("login-100", TraceIds.requestId("login", 100L)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TraceIds {
    static String requestId(String testName, long ts) {
        return testName + "-" + ts;
    }
}

public class TraceIdsTest {
    @Test
    void builds() { assertEquals("login-100", TraceIds.requestId("login", 100L)); }
}
`,
      hints: ['return testName + "-" + ts;']
    })
  ];
  save('senior/s-observability.json', L);
}

let real = 0,
  tot = 0,
  seniorJava = 0;
for (const d of ['junior', 'middle', 'senior']) {
  for (const f of fs.readdirSync(path.join(root, d)).filter((x) => x.endsWith('.json'))) {
    const L = JSON.parse(fs.readFileSync(path.join(root, d, f), 'utf8'));
    for (const e of L.exercises || []) {
      tot++;
      const m = e.mode || 'java';
      if (m !== 'java') real++;
      else if (d === 'senior') seniorJava++;
    }
  }
}
console.log('real-mode', real + '/' + tot, ((100 * real) / tot).toFixed(1) + '%', 'senior-java-left', seniorJava);
