/**
 * Curriculum quality pass — P0 mistags + difficulty + scaffolding
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function save(rel, obj) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2) + '\n');
  console.log('saved', rel);
}

// --- interview mistags ---
{
  const p = path.join(__dirname, '..', 'src', 'main', 'resources', 'static', 'js', 'interview.js');
  let inv = fs.readFileSync(p, 'utf8');
  inv = inv.replace(
    "level: 'senior', lessonId: 'm-flaky', q: 'STAR: разбор flaky в CI.'",
    "level: 'middle', lessonId: 'm-flaky', q: 'STAR: разбор flaky в CI.'"
  );
  inv = inv.replace(
    "level: 'senior', lessonId: 'j-selenium4', q: 'Когда нужен CDP/BiDi",
    "level: 'junior', lessonId: 'j-selenium4', q: 'Когда нужен CDP/BiDi"
  );
  fs.writeFileSync(p, inv);
  console.log('interview mistags fixed');
}

// j-strings
{
  const l = load('junior/j-strings.json');
  l.title = 'Строки, регулярки, форматирование';
  if (l.summary) l.summary = l.summary.replace('регулярлов', 'регулярок');
  for (const e of l.exercises) {
    if (e.id === 'e2') e.difficulty = 'medium';
    if (!e.mode) e.mode = 'java';
  }
  save('junior/j-strings.json', l);
}

// j-waits
{
  const l = load('junior/j-waits.json');
  const e = l.exercises[0];
  e.difficulty = 'easy';
  e.starterCode =
    "import org.openqa.selenium.*;\n" +
    "import org.openqa.selenium.support.ui.*;\n" +
    "import java.time.Duration;\n\n" +
    "public class WaitLab {\n" +
    "    public WebElement waitVisible(WebDriver driver, By by, long seconds) {\n" +
    "        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(seconds));\n" +
    "        // TODO: until + ExpectedConditions.visibilityOfElementLocated\n" +
    "        return null;\n" +
    "    }\n" +
    "}\n";
  e.hints = ['wait.until(ExpectedConditions.visibilityOfElementLocated(by))'];
  save('junior/j-waits.json', l);
}

// m-jwt-auth
{
  const l = load('middle/m-jwt-auth.json');
  l.exercises[0].difficulty = 'medium';
  save('middle/m-jwt-auth.json', l);
}

// m-invocation-interceptor
{
  const l = load('middle/m-invocation-interceptor.json');
  const e = l.exercises[0];
  e.starterCode =
    "import java.lang.reflect.Method;\n" +
    "import java.util.concurrent.atomic.AtomicInteger;\n" +
    "import org.junit.jupiter.api.Test;\n" +
    "import org.junit.jupiter.api.extension.*;\n" +
    "import static org.junit.jupiter.api.Assertions.*;\n\n" +
    "class CountingInterceptor implements InvocationInterceptor {\n" +
    "    static final AtomicInteger CALLS = new AtomicInteger();\n\n" +
    "    @Override\n" +
    "    public void interceptTestMethod(Invocation<Void> invocation,\n" +
    "                                    ReflectiveInvocationContext<Method> invocationContext,\n" +
    "                                    ExtensionContext extensionContext) throws Throwable {\n" +
    "        // TODO: CALLS.incrementAndGet();\n" +
    "        // TODO: invocation.proceed();\n" +
    "    }\n" +
    "}\n\n" +
    "@ExtendWith(CountingInterceptor.class)\n" +
    "public class CountingInterceptorTest {\n" +
    "    @Test\n" +
    "    void countsProceed() {\n" +
    "        assertEquals(1, CountingInterceptor.CALLS.get());\n" +
    "    }\n" +
    "}\n";
  e.hints = ['CALLS.incrementAndGet() перед proceed', 'invocation.proceed() обязателен'];
  save('middle/m-invocation-interceptor.json', l);
}

// m-junit-extensions
{
  const l = load('middle/m-junit-extensions.json');
  const e = l.exercises[0];
  e.description =
    'TimingExtension: в beforeEach положи startedAt в Store и сохрани context. Helper startedAt() читает из Store.';
  e.starterCode =
    "import org.junit.jupiter.api.Test;\n" +
    "import org.junit.jupiter.api.extension.*;\n" +
    "import static org.junit.jupiter.api.Assertions.*;\n\n" +
    "class TimingExtension implements BeforeEachCallback {\n" +
    "    static final ExtensionContext.Namespace NS =\n" +
    "        ExtensionContext.Namespace.create(\"timing\");\n" +
    "    private static ExtensionContext last;\n\n" +
    "    @Override\n" +
    "    public void beforeEach(ExtensionContext context) {\n" +
    "        // TODO: put startedAt into Store; last = context;\n" +
    "    }\n\n" +
    "    static Long startedAt() {\n" +
    "        // TODO: return last.getStore(NS).get(\"startedAt\", Long.class);\n" +
    "        return null;\n" +
    "    }\n" +
    "}\n\n" +
    "@ExtendWith(TimingExtension.class)\n" +
    "public class TimingExtensionTest {\n" +
    "    @Test\n" +
    "    void storeHasStart() {\n" +
    "        Long started = TimingExtension.startedAt();\n" +
    "        assertNotNull(started);\n" +
    "        assertTrue(started > 0);\n" +
    "    }\n" +
    "}\n";
  e.hints = [
    'context.getStore(NS).put("startedAt", System.currentTimeMillis()); last = context;',
    'return last.getStore(NS).get("startedAt", Long.class);'
  ];
  save('middle/m-junit-extensions.json', l);
}

// m-ra-filter
{
  const l = load('middle/m-ra-filter.json');
  const e = l.exercises[0];
  e.difficulty = 'medium';
  e.starterCode =
    "import java.util.*;\n" +
    "import java.util.concurrent.CopyOnWriteArrayList;\n" +
    "import io.restassured.filter.Filter;\n" +
    "import static io.restassured.RestAssured.*;\n\n" +
    "public class PingClient {\n" +
    "    public static final List<String> IDS = new CopyOnWriteArrayList<>();\n\n" +
    "    public int ping(String baseUrl) {\n" +
    "        Filter filter = (req, resp, ctx) -> {\n" +
    "            String id = UUID.randomUUID().toString();\n" +
    "            // TODO: IDS.add(id); req.header(\"X-Request-Id\", id); return ctx.next(req, resp);\n" +
    "            return null;\n" +
    "        };\n" +
    "        return given().filter(filter)\n" +
    "            .when().get(baseUrl + \"/ping\")\n" +
    "            .then().extract().statusCode();\n" +
    "    }\n" +
    "}\n";
  save('middle/m-ra-filter.json', l);
}

// s-github-actions
{
  const l = load('senior/s-github-actions.json');
  l.exercises[0].difficulty = 'medium';
  save('senior/s-github-actions.json', l);
}

// explicit mode=java
for (const f of fs.readdirSync(path.join(ROOT, 'junior')).filter((x) => x.endsWith('.json'))) {
  const l = load('junior/' + f);
  let changed = false;
  for (const e of l.exercises || []) {
    if (!e.mode) {
      e.mode = 'java';
      changed = true;
    }
  }
  if (changed) save('junior/' + f, l);
}

console.log('P0 mistags-diff done');
