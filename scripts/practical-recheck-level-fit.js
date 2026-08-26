const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum", "senior");

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

function save(file, data) {
  fs.writeFileSync(path.join(ROOT, file), JSON.stringify(data, null, 2) + "\n");
  console.log("saved", file);
}

{
  const l = load("s-observability.json");
  const e = l.exercises[0];
  e.title = "Trace correlation id policy";
  e.description = "Input: testName, ts. Output: request id string format qa-<slug>-<ts>. Expected behavior: lower-case slug, replace non [a-z0-9] with '-', trim edge '-', max slug length 20, ts must be >0. Edge cases: blank/null name or ts<=0 -> IllegalArgumentException.";
  e.difficulty = "hard";
  e.revealAfterFails = 2;
  e.starterCode = "import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass TraceIds {\n    static String requestId(String testName, long ts) {\n        // TODO validate, normalize slug, limit to 20 chars\n        return \"\";\n    }\n}\n\npublic class TraceIdsTest {\n    @Test\n    void normalizes() {\n        assertEquals(\"qa-login-checkout-100\", TraceIds.requestId(\"Login Checkout\", 100L));\n    }\n\n    @Test\n    void stripsNoise() {\n        assertEquals(\"qa-order-pay-v2-42\", TraceIds.requestId(\"Order@Pay v2!\", 42L));\n    }\n\n    @Test\n    void truncatesSlug() {\n        String id = TraceIds.requestId(\"very long scenario name for tracing\", 7L);\n        String slug = id.substring(3, id.lastIndexOf('-'));\n        assertTrue(slug.length() <= 20);\n    }\n\n    @Test\n    void invalidName() {\n        assertThrows(IllegalArgumentException.class, () -> TraceIds.requestId(\" \", 1L));\n    }\n}\n";
  e.solutionCode = "import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass TraceIds {\n    static String requestId(String testName, long ts) {\n        if (testName == null || testName.isBlank() || ts <= 0) {\n            throw new IllegalArgumentException(\"invalid input\");\n        }\n        String slug = testName.toLowerCase()\n                .replaceAll(\"[^a-z0-9]+\", \"-\")\n                .replaceAll(\"^-+|-+$\", \"\");\n        if (slug.length() > 20) {\n            slug = slug.substring(0, 20);\n        }\n        if (slug.isBlank()) {\n            throw new IllegalArgumentException(\"invalid input\");\n        }\n        return \"qa-\" + slug + \"-\" + ts;\n    }\n}\n\npublic class TraceIdsTest {\n    @Test\n    void normalizes() {\n        assertEquals(\"qa-login-checkout-100\", TraceIds.requestId(\"Login Checkout\", 100L));\n    }\n\n    @Test\n    void stripsNoise() {\n        assertEquals(\"qa-order-pay-v2-42\", TraceIds.requestId(\"Order@Pay v2!\", 42L));\n    }\n\n    @Test\n    void truncatesSlug() {\n        String id = TraceIds.requestId(\"very long scenario name for tracing\", 7L);\n        String slug = id.substring(3, id.lastIndexOf('-'));\n        assertTrue(slug.length() <= 20);\n    }\n\n    @Test\n    void invalidName() {\n        assertThrows(IllegalArgumentException.class, () -> TraceIds.requestId(\" \", 1L));\n    }\n}\n";
  e.hints = [
    "Validate early: blank/null testName or ts<=0 -> IllegalArgumentException",
    "Normalize via lower-case + replaceAll(\"[^a-z0-9]+\", \"-\") + trim edge '-'",
    "Return format: \"qa-\" + slug(max 20) + \"-\" + ts"
  ];
  save("s-observability.json", l);
}

{
  const l = load("s-performance-basics.json");
  const e = l.exercises[0];
  e.title = "SLO evaluator from samples";
  e.description = "Input: long[] samples, budgetMs. Output: \"OK\" or \"SLOW\". Expected behavior: sort samples, compute p50 and p95, return OK only when p95<=budgetMs and p50<=budgetMs*0.8. Edge cases: null/empty samples or budget<=0 -> IllegalArgumentException.";
  e.difficulty = "hard";
  e.revealAfterFails = 2;
  e.className = "PerfGateTest";
  e.starterCode = "import java.util.Arrays;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass PerfGate {\n    static String evaluate(long[] samples, long budgetMs) {\n        // TODO sort + compute p50/p95 + thresholds\n        return \"\";\n    }\n}\n\npublic class PerfGateTest {\n    @Test\n    void healthy() {\n        assertEquals(\"OK\", PerfGate.evaluate(new long[]{100,120,130,140,150,160,170,180,190,200}, 250));\n    }\n\n    @Test\n    void slowByP95() {\n        assertEquals(\"SLOW\", PerfGate.evaluate(new long[]{100,110,120,130,140,150,160,170,180,800}, 250));\n    }\n\n    @Test\n    void slowByP50() {\n        assertEquals(\"SLOW\", PerfGate.evaluate(new long[]{220,230,240,250,260,270,280,290,300,310}, 400));\n    }\n\n    @Test\n    void emptyNotAllowed() {\n        assertThrows(IllegalArgumentException.class, () -> PerfGate.evaluate(new long[]{}, 100));\n    }\n}\n";
  e.solutionCode = "import java.util.Arrays;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass PerfGate {\n    static String evaluate(long[] samples, long budgetMs) {\n        if (samples == null || samples.length == 0 || budgetMs <= 0) {\n            throw new IllegalArgumentException(\"invalid input\");\n        }\n        long[] arr = Arrays.copyOf(samples, samples.length);\n        Arrays.sort(arr);\n        long p50 = arr[(int) Math.floor(0.5 * (arr.length - 1))];\n        long p95 = arr[(int) Math.ceil(0.95 * (arr.length - 1))];\n        if (p95 <= budgetMs && p50 <= (long) (budgetMs * 0.8)) {\n            return \"OK\";\n        }\n        return \"SLOW\";\n    }\n}\n\npublic class PerfGateTest {\n    @Test\n    void healthy() {\n        assertEquals(\"OK\", PerfGate.evaluate(new long[]{100,120,130,140,150,160,170,180,190,200}, 250));\n    }\n\n    @Test\n    void slowByP95() {\n        assertEquals(\"SLOW\", PerfGate.evaluate(new long[]{100,110,120,130,140,150,160,170,180,800}, 250));\n    }\n\n    @Test\n    void slowByP50() {\n        assertEquals(\"SLOW\", PerfGate.evaluate(new long[]{220,230,240,250,260,270,280,290,300,310}, 400));\n    }\n\n    @Test\n    void emptyNotAllowed() {\n        assertThrows(IllegalArgumentException.class, () -> PerfGate.evaluate(new long[]{}, 100));\n    }\n}\n";
  e.hints = [
    "Sort a copy of samples to calculate percentiles",
    "Use indexes for p50 and p95 from sorted array",
    "Return OK only if both thresholds pass; otherwise SLOW"
  ];
  save("s-performance-basics.json", l);
}

{
  const l = load("s-security-qa.json");
  const e = l.exercises[0];
  e.title = "Protected endpoint access matrix";
  e.description = "Input: baseUrl, token. Output: HTTP status code. Expected behavior: send GET /secure with Authorization Bearer token; verifier checks matrix (bad->401, no-role->403, admin->200).";
  e.difficulty = "hard";
  e.mode = "http";
  e.className = "SecureMatrix";
  e.revealAfterFails = 2;
  e.httpStubJson = "{\"stubs\":[{\"status\":401,\"body\":\"{\\\"error\\\":\\\"unauthorized\\\"}\"},{\"status\":403,\"body\":\"{\\\"error\\\":\\\"forbidden\\\"}\"},{\"status\":200,\"body\":\"{\\\"ok\\\":true}\"}]}";
  e.starterCode = "import static io.restassured.RestAssured.*;\n\npublic class SecureMatrix {\n    public int check(String baseUrl, String token) {\n        // TODO given().header(\"Authorization\", \"Bearer \" + token)\n        // TODO GET /secure and return status\n        return 0;\n    }\n}\n";
  e.solutionCode = "import static io.restassured.RestAssured.*;\n\npublic class SecureMatrix {\n    public int check(String baseUrl, String token) {\n        return given()\n            .header(\"Authorization\", \"Bearer \" + token)\n            .when().get(baseUrl + \"/secure\")\n            .then().extract().statusCode();\n    }\n}\n";
  e.hints = [
    "Use Authorization header with Bearer token",
    "Call GET baseUrl + \"/secure\"",
    "Return extracted statusCode()"
  ];
  e.verifierCode = "import java.util.*;\n\npublic class ExerciseVerifier {\n  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {\n    List<String> fails = new ArrayList<>();\n    Object c = cls.getDeclaredConstructor().newInstance();\n    int bad = (Integer) cls.getMethod(\"check\", String.class, String.class).invoke(c, baseUrl, \"bad\");\n    int noRole = (Integer) cls.getMethod(\"check\", String.class, String.class).invoke(c, baseUrl, \"no-role\");\n    int admin = (Integer) cls.getMethod(\"check\", String.class, String.class).invoke(c, baseUrl, \"admin\");\n    if (bad != 401) fails.add(\"expected 401 got \" + bad);\n    if (noRole != 403) fails.add(\"expected 403 got \" + noRole);\n    if (admin != 200) fails.add(\"expected 200 got \" + admin);\n    return fails;\n  }\n}";
  save("s-security-qa.json", l);
}

{
  const l = load("s-testcontainers.json");
  const e = l.exercises[0];
  e.title = "Container profile selection policy";
  e.description = "Input: needsRealDb, hasDocker, ciMinutes. Output: profile string. Expected behavior: if !needsRealDb -> unit; if needsRealDb and hasDocker and ciMinutes>=8 -> integration-tc; otherwise integration-mock.";
  e.difficulty = "medium";
  e.revealAfterFails = 2;
  e.className = "TcPolicyTest";
  e.starterCode = "import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass TcPolicy {\n    public String profile(boolean needsRealDb, boolean hasDocker, int ciMinutes) {\n        // TODO decision matrix\n        return \"\";\n    }\n}\n\npublic class TcPolicyTest {\n    @Test void tcPath() { assertEquals(\"integration-tc\", new TcPolicy().profile(true, true, 12)); }\n    @Test void mockWhenNoDocker() { assertEquals(\"integration-mock\", new TcPolicy().profile(true, false, 12)); }\n    @Test void mockWhenBudgetLow() { assertEquals(\"integration-mock\", new TcPolicy().profile(true, true, 5)); }\n    @Test void unitPath() { assertEquals(\"unit\", new TcPolicy().profile(false, true, 20)); }\n}\n";
  e.solutionCode = "import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass TcPolicy {\n    public String profile(boolean needsRealDb, boolean hasDocker, int ciMinutes) {\n        if (!needsRealDb) return \"unit\";\n        if (hasDocker && ciMinutes >= 8) return \"integration-tc\";\n        return \"integration-mock\";\n    }\n}\n\npublic class TcPolicyTest {\n    @Test void tcPath() { assertEquals(\"integration-tc\", new TcPolicy().profile(true, true, 12)); }\n    @Test void mockWhenNoDocker() { assertEquals(\"integration-mock\", new TcPolicy().profile(true, false, 12)); }\n    @Test void mockWhenBudgetLow() { assertEquals(\"integration-mock\", new TcPolicy().profile(true, true, 5)); }\n    @Test void unitPath() { assertEquals(\"unit\", new TcPolicy().profile(false, true, 20)); }\n}\n";
  e.hints = [
    "Start from the easiest branch: !needsRealDb -> unit",
    "For real DB path, check both Docker availability and CI budget",
    "If one constraint fails, fall back to integration-mock"
  ];
  save("s-testcontainers.json", l);
}

{
  const l = load("s-metrics.json");
  const e = l.exercises[0];
  e.title = "Quality gate verdict";
  e.description = "Input: flakeRate, feedbackMin, passRate. Output: GREEN or RED:<reason>. Expected behavior: GREEN only if flakeRate<=5, feedbackMin<=15, passRate>=95; otherwise first violated reason in order flake, feedback, passrate.";
  e.difficulty = "hard";
  e.revealAfterFails = 2;
  e.className = "QualityGateTest";
  e.starterCode = "import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass QualityGate {\n    static String verdict(int flakeRate, int feedbackMin, int passRate) {\n        // TODO ordered checks: flake -> feedback -> passrate\n        return \"\";\n    }\n}\n\npublic class QualityGateTest {\n    @Test\n    void green() { assertEquals(\"GREEN\", QualityGate.verdict(3, 12, 98)); }\n    @Test\n    void redFlake() { assertEquals(\"RED:flake\", QualityGate.verdict(9, 12, 98)); }\n    @Test\n    void redFeedback() { assertEquals(\"RED:feedback\", QualityGate.verdict(2, 40, 99)); }\n    @Test\n    void redPassrate() { assertEquals(\"RED:passrate\", QualityGate.verdict(2, 12, 90)); }\n}\n";
  e.solutionCode = "import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass QualityGate {\n    static String verdict(int flakeRate, int feedbackMin, int passRate) {\n        if (flakeRate > 5) return \"RED:flake\";\n        if (feedbackMin > 15) return \"RED:feedback\";\n        if (passRate < 95) return \"RED:passrate\";\n        return \"GREEN\";\n    }\n}\n\npublic class QualityGateTest {\n    @Test\n    void green() { assertEquals(\"GREEN\", QualityGate.verdict(3, 12, 98)); }\n    @Test\n    void redFlake() { assertEquals(\"RED:flake\", QualityGate.verdict(9, 12, 98)); }\n    @Test\n    void redFeedback() { assertEquals(\"RED:feedback\", QualityGate.verdict(2, 40, 99)); }\n    @Test\n    void redPassrate() { assertEquals(\"RED:passrate\", QualityGate.verdict(2, 12, 90)); }\n}\n";
  e.hints = [
    "Apply checks in fixed order to keep deterministic reason",
    "First failed threshold should stop evaluation",
    "Only full pass returns GREEN"
  ];
  save("s-metrics.json", l);
}

console.log("senior level-fit updates done");
