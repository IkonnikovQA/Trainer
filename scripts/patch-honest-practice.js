/**
 * Convert weak java-kata exercises into real modes.
 * node scripts/patch-honest-practice.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');
function load(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
function save(rel, obj) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2), 'utf8');
  console.log('patched', rel);
}

// m-selenide -> FakeDriver $ helper + shouldHave text
{
  const L = load('middle/m-selenide.json');
  L.theoryMarkdown += "\n\n## Lab\n\nПишешь тонкий wrapper в духе Selenide поверх FakeDriver: `$` и `shouldHaveText`.\n";
  L.exercises = [{
    id: 'e1',
    title: 'Selenide-like $ and shouldHaveText',
    description: 'Класс SelenideLite(WebDriver): $(By) возвращает элемент; shouldHaveText(By, text) бросает AssertionError если текст не совпал, иначе void.',
    difficulty: 'medium',
    mode: 'selenium-fake',
    className: 'SelenideLite',
    fixtureJson: JSON.stringify({ elements: [{ tag: 'div', id: 'welcome', text: 'Hello', displayed: true }] }),
    starterCode: `import org.openqa.selenium.*;

public class SelenideLite {
    private final WebDriver driver;
    public SelenideLite(WebDriver driver) { this.driver = driver; }

    public WebElement $(By by) {
        // TODO
        return null;
    }

    public void shouldHaveText(By by, String expected) {
        // TODO: if not equals throw new AssertionError(...)
    }
}
`,
    solutionCode: `import org.openqa.selenium.*;

public class SelenideLite {
    private final WebDriver driver;
    public SelenideLite(WebDriver driver) { this.driver = driver; }

    public WebElement $(By by) {
        return driver.findElement(by);
    }

    public void shouldHaveText(By by, String expected) {
        String actual = $(by).getText();
        if (!expected.equals(actual)) {
            throw new AssertionError("expected [" + expected + "] but was [" + actual + "]");
        }
    }
}
`,
    hints: ['$(by) = driver.findElement(by)', 'сравни getText() с expected'],
    verifierCode: `import java.util.*;
import org.openqa.selenium.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lite = cls.getConstructor(WebDriver.class).newInstance(driver);
    WebElement el = (WebElement) cls.getMethod("$", By.class).invoke(lite, By.id("welcome"));
    if (el == null || !"Hello".equals(el.getText())) fails.add("$ failed");
    try {
      cls.getMethod("shouldHaveText", By.class, String.class).invoke(lite, By.id("welcome"), "Hello");
    } catch (Exception e) { fails.add("shouldHaveText positive failed: " + e.getMessage()); }
    try {
      cls.getMethod("shouldHaveText", By.class, String.class).invoke(lite, By.id("welcome"), "Nope");
      fails.add("shouldHaveText must fail on mismatch");
    } catch (Exception e) {
      Throwable c = e.getCause() != null ? e.getCause() : e;
      if (!(c instanceof AssertionError)) fails.add("expected AssertionError, got " + c);
    }
    return fails;
  }
}`
  }];
  save('middle/m-selenide.json', L);
}

// m-cucumber -> step defs invoking page double
{
  const L = load('middle/m-cucumber.json');
  L.exercises = [{
    id: 'e1',
    title: 'Step definition runner',
    description: 'Steps.run(line, LoginActions actions): если line startsWith Given/When/Then — вызови actions.open() для Given, actions.submit() для When, actions.assertHome() для Then. Верни "OK" или "UNKNOWN".',
    difficulty: 'medium',
    mode: 'junit',
    className: 'StepsTest',
    supportSources: {
      LoginActions: `public interface LoginActions {
  void open();
  void submit();
  void assertHome();
}`,
      Steps: `public class Steps {
  public String run(String line, LoginActions actions) {
    String t = line == null ? "" : line.trim();
    if (t.startsWith("Given")) { actions.open(); return "OK"; }
    if (t.startsWith("When")) { actions.submit(); return "OK"; }
    if (t.startsWith("Then")) { actions.assertHome(); return "OK"; }
    return "UNKNOWN";
  }
}`
    },
    starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class StepsTest {
    @Test
    void givenCallsOpen() {
        // TODO: mock LoginActions, Steps.run("Given user opens", actions), verify open()
    }

    @Test
    void unknown() {
        // TODO: assertEquals("UNKNOWN", ...)
    }
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class StepsTest {
    @Test
    void givenCallsOpen() {
        LoginActions actions = mock(LoginActions.class);
        assertEquals("OK", new Steps().run("Given user opens", actions));
        verify(actions).open();
    }

    @Test
    void unknown() {
        LoginActions actions = mock(LoginActions.class);
        assertEquals("UNKNOWN", new Steps().run("Maybe later", actions));
        verifyNoInteractions(actions);
    }
}
`,
    hints: ['mock(LoginActions.class)', 'verify(actions).open()']
  }];
  save('middle/m-cucumber.json', L);
}

// m-allure-steps -> mask + step recorder junit
{
  const L = load('middle/m-allure-steps.json');
  L.exercises = [{
    id: 'e1',
    title: 'Step recorder + secret mask',
    description: 'Напиши AllureLite: step(name) добавляет шаг; maskToken(token) маскирует; getSteps() возвращает список. Покрой JUnit-тестами.',
    difficulty: 'medium',
    mode: 'junit',
    className: 'AllureLiteTest',
    supportSources: {
      AllureLite: `import java.util.*;
public class AllureLite {
  private final List<String> steps = new ArrayList<>();
  public void step(String name) { steps.add(name); }
  public String maskToken(String token) {
    if (token == null || token.length() <= 4) return "****";
    return token.substring(0, 2) + "****" + token.substring(token.length() - 2);
  }
  public List<String> getSteps() { return List.copyOf(steps); }
}`
    },
    starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AllureLiteTest {
    // TODO: test step recording and maskToken("abcdef") -> ab****ef
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AllureLiteTest {
    @Test
    void recordsSteps() {
        AllureLite a = new AllureLite();
        a.step("Login");
        a.step("Open cart");
        assertEquals(2, a.getSteps().size());
        assertEquals("Login", a.getSteps().get(0));
    }

    @Test
    void masksToken() {
        assertEquals("ab****ef", new AllureLite().maskToken("abcdef"));
        assertEquals("****", new AllureLite().maskToken("ab"));
    }
}
`,
    hints: ['Два @Test: steps и mask', 'mask: первые 2 + **** + последние 2']
  }];
  save('middle/m-allure-steps.json', L);
}

// j-selenium4 -> theory+quiz only, remove dishonest exercise OR real relative via above by document order
{
  const L = load('junior/j-selenium4.json');
  L.exercises = [{
    id: 'e1',
    title: 'Relative-like: input above password by order',
    description: 'FakeDriver не умеет Selenium RelativeLocator. Реализуй findInputAbovePassword(WebDriver): найди все input, верни name того, чей индекс меньше password. Это модель relative above.',
    difficulty: 'medium',
    mode: 'selenium-fake',
    className: 'RelLab',
    fixtureJson: JSON.stringify({
      elements: [
        { tag: 'input', id: 'email', name: 'email' },
        { tag: 'input', id: 'password', name: 'password' },
        { tag: 'input', id: 'extra', name: 'extra' }
      ]
    }),
    starterCode: `import org.openqa.selenium.*;
import java.util.*;

public class RelLab {
    public String findInputAbovePassword(WebDriver driver) {
        // TODO: list inputs, find password index, return previous input's name
        return null;
    }
}
`,
    solutionCode: `import org.openqa.selenium.*;
import java.util.*;

public class RelLab {
    public String findInputAbovePassword(WebDriver driver) {
        List<WebElement> inputs = driver.findElements(By.tagName("input"));
        int pwd = -1;
        for (int i = 0; i < inputs.size(); i++) {
            if ("password".equals(inputs.get(i).getAttribute("id"))) pwd = i;
        }
        if (pwd <= 0) return null;
        return inputs.get(pwd - 1).getAttribute("name");
    }
}
`,
    hints: ['findElements(By.tagName("input"))', 'индекс password - 1'],
    verifierCode: `import java.util.*;
import org.openqa.selenium.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lab = cls.getDeclaredConstructor().newInstance();
    String name = (String) cls.getMethod("findInputAbovePassword", WebDriver.class).invoke(lab, driver);
    if (!"email".equals(name)) fails.add("expected email above password, got " + name);
    return fails;
  }
}`
  }];
  L.theoryMarkdown += `\n\n## Важно для lab\n\nВ тренажёре relative locator моделируется **порядком элементов** (above = предыдущий input), потому что FakeDriver без layout geometry. В проде используй \`RelativeLocator.with(...).above(...)\`.\n`;
  save('junior/j-selenium4.json', L);
}

// m-parallel strengthen with junit
{
  const L = load('middle/m-parallel.json');
  L.exercises = [{
    id: 'e1',
    title: 'ThreadLocal isolation test',
    description: 'Допиши DriverHolder (уже почти готов в support) и JUnit: два потока видят разные id.',
    difficulty: 'hard',
    mode: 'junit',
    className: 'DriverHolderTest',
    supportSources: {
      DriverHolder: `public class DriverHolder {
  private static final ThreadLocal<String> TL = new ThreadLocal<>();
  public static void set(String id) { TL.set(id); }
  public static String get() { return TL.get(); }
  public static void clear() { TL.remove(); }
}`
    },
    starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DriverHolderTest {
    @Test
    void threadsAreIsolated() throws Exception {
        // TODO: main sets "main"; worker thread sets "worker";
        // assert worker saw "worker", main still "main"
    }
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DriverHolderTest {
    @Test
    void threadsAreIsolated() throws Exception {
        DriverHolder.set("main");
        final String[] other = new String[1];
        Thread t = new Thread(() -> {
            DriverHolder.set("worker");
            other[0] = DriverHolder.get();
            DriverHolder.clear();
        });
        t.start();
        t.join();
        assertEquals("worker", other[0]);
        assertEquals("main", DriverHolder.get());
        DriverHolder.clear();
    }
}
`,
    hints: ['new Thread(() -> { DriverHolder.set("worker"); ...})', 'join + assertEquals']
  }];
  save('middle/m-parallel.json', L);
}

// s-interview-soft: remove code exercise
{
  const L = load('senior/s-interview-soft.json');
  L.exercises = [];
  L.quiz.push({
    id: 'q2',
    type: 'multiple',
    question: 'Что входит в сильный Senior-ответ? (несколько)',
    options: ['Контекст и проблема', 'Trade-offs вариантов', 'Только список инструментов', 'Результат/метрика'],
    correctIndexes: [0, 1, 3],
    explanation: 'Инструменты без trade-offs и эффекта — слабый ответ.',
    hint: 'STAR / trade-offs'
  });
  save('senior/s-interview-soft.json', L);
}

// s-playwright - replace with checklist artifact-like junit of decision reasons
{
  const L = load('senior/s-playwright-java.json');
  L.exercises = [{
    id: 'e1',
    title: 'Migration decision notes',
    description: 'Класс MigrationNotes: reasonsForPlaywright() и reasonsForSelenium() возвращают List<String> с ключевыми словами (auto-wait/trace для PW; mature/ecosystem для Selenium). Минимум 2 причины в каждом.',
    difficulty: 'easy',
    mode: 'junit',
    className: 'MigrationNotesTest',
    supportSources: {},
    starterCode: `import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MigrationNotes {
    public List<String> reasonsForPlaywright() {
        // TODO return list including auto-wait and trace
        return List.of();
    }
    public List<String> reasonsForSelenium() {
        // TODO return list including mature and ecosystem
        return List.of();
    }
}

public class MigrationNotesTest {
    @Test
    void playwrightReasons() {
        MigrationNotes n = new MigrationNotes();
        String joined = String.join(",", n.reasonsForPlaywright()).toLowerCase();
        assertTrue(joined.contains("auto-wait") || joined.contains("autowait"));
        assertTrue(joined.contains("trace"));
        assertTrue(n.reasonsForPlaywright().size() >= 2);
    }

    @Test
    void seleniumReasons() {
        MigrationNotes n = new MigrationNotes();
        String joined = String.join(",", n.reasonsForSelenium()).toLowerCase();
        assertTrue(joined.contains("mature") || joined.contains("legacy"));
        assertTrue(joined.contains("ecosystem") || joined.contains("selenide"));
        assertTrue(n.reasonsForSelenium().size() >= 2);
    }
}
`,
    solutionCode: `import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MigrationNotes {
    public List<String> reasonsForPlaywright() {
        return List.of("auto-wait built-in", "trace viewer");
    }
    public List<String> reasonsForSelenium() {
        return List.of("mature codebase", "ecosystem and Selenide");
    }
}

public class MigrationNotesTest {
    @Test
    void playwrightReasons() {
        MigrationNotes n = new MigrationNotes();
        String joined = String.join(",", n.reasonsForPlaywright()).toLowerCase();
        assertTrue(joined.contains("auto-wait") || joined.contains("autowait"));
        assertTrue(joined.contains("trace"));
        assertTrue(n.reasonsForPlaywright().size() >= 2);
    }

    @Test
    void seleniumReasons() {
        MigrationNotes n = new MigrationNotes();
        String joined = String.join(",", n.reasonsForSelenium()).toLowerCase();
        assertTrue(joined.contains("mature") || joined.contains("legacy"));
        assertTrue(joined.contains("ecosystem") || joined.contains("selenide"));
        assertTrue(n.reasonsForSelenium().size() >= 2);
    }
}
`,
    hints: ['List.of("auto-wait...", "trace...")', 'Тесты уже задают критерии — заполни MigrationNotes']
  }];
  // junit mode needs single public class - fix: put notes inside test file as package-private is ok but detectClassName finds first class
  // Lab compiles all sources - student writes one file with MigrationNotes + MigrationNotesTest
  // className should be MigrationNotesTest for junit runner
  save('senior/s-playwright-java.json', L);
}

// s-testcontainers - junit checklist
{
  const L = load('senior/s-testcontainers.json');
  L.exercises = [{
    id: 'e1',
    title: 'When to use Testcontainers',
    description: 'TcPolicy.use(needsRealDb, isUnit, dockerAvailable): true только если needsRealDb && !isUnit && dockerAvailable.',
    difficulty: 'easy',
    mode: 'junit',
    className: 'TcPolicyTest',
    starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TcPolicy {
    public boolean use(boolean needsRealDb, boolean isUnit, boolean dockerAvailable) {
        // TODO
        return false;
    }
}

public class TcPolicyTest {
    @Test void happy() { assertTrue(new TcPolicy().use(true, false, true)); }
    @Test void noDocker() { assertFalse(new TcPolicy().use(true, false, false)); }
    @Test void unit() { assertFalse(new TcPolicy().use(true, true, true)); }
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TcPolicy {
    public boolean use(boolean needsRealDb, boolean isUnit, boolean dockerAvailable) {
        return needsRealDb && !isUnit && dockerAvailable;
    }
}

public class TcPolicyTest {
    @Test void happy() { assertTrue(new TcPolicy().use(true, false, true)); }
    @Test void noDocker() { assertFalse(new TcPolicy().use(true, false, false)); }
    @Test void unit() { assertFalse(new TcPolicy().use(true, true, true)); }
}
`,
    hints: ['return needsRealDb && !isUnit && dockerAvailable;']
  }];
  save('senior/s-testcontainers.json', L);
}

// s-cloud-grid - artifact policy doc as YAML
{
  const L = load('senior/s-cloud-grid.json');
  L.exercises = [{
    id: 'e1',
    title: 'Infra policy YAML',
    description: 'Напиши YAML policy: ключи when_private_grid / when_cloud / default с осмысленными значениями (compliance, devices, local-ci).',
    difficulty: 'easy',
    mode: 'artifact',
    artifactKind: 'gha',
    artifactRules: [
      'contains:when_private_grid:',
      'contains:when_cloud:',
      'contains:default:',
      'contains:compliance',
      'contains:devices',
      'noSecret:password'
    ],
    className: 'Policy',
    starterCode: `when_private_grid:
  # TODO
when_cloud:
  # TODO
default:
  # TODO
`,
    solutionCode: `when_private_grid:
  reason: compliance blocks outbound browser traffic
when_cloud:
  reason: need many devices and browsers
default:
  reason: local-ci chrome headless
`,
    hints: ['Нужны ключи when_private_grid, when_cloud, default', 'Упомяни compliance и devices']
  }];
  // gha default rules require on:/jobs: - override with custom rules only - ArtifactChecker merges? It uses provided rules if non-empty. Good.
  save('senior/s-cloud-grid.json', L);
}

console.log('honest practice patch done');
