/**
 * Patch core lessons with real Selenium/JUnit/HTTP/artifact exercises.
 * Run: node scripts/patch-real-practice.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function save(rel, obj) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2), 'utf8');
  console.log('patched', rel);
}

// ---- j-selenium-intro ----
{
  const L = load('junior/j-selenium-intro.json');
  L.theoryMarkdown += `\n\n## Практика в тренажёре\n\nЗдесь используется **FakeDriver** — in-memory реализация WebDriver.\nТы пишешь обычный Selenium-код (\`get\`, \`getTitle\`, \`quit\`), без настоящего Chrome.\n`;
  L.exercises = [{
    id: 'e1',
    title: 'Сессия WebDriver',
    description: 'Класс SessionLab: метод openAndTitle(WebDriver driver, String url) открывает url, возвращает title, затем quit(). Верни title ДО quit.',
    difficulty: 'medium',
    mode: 'selenium-fake',
    className: 'SessionLab',
    fixtureJson: JSON.stringify({ title: 'Example Domain', url: 'about:blank', elements: [] }),
    starterCode: `import org.openqa.selenium.WebDriver;

public class SessionLab {
    public String openAndTitle(WebDriver driver, String url) {
        // TODO: driver.get(url); сохранить title; driver.quit(); вернуть title
        return null;
    }
}
`,
    solutionCode: `import org.openqa.selenium.WebDriver;

public class SessionLab {
    public String openAndTitle(WebDriver driver, String url) {
        driver.get(url);
        String title = driver.getTitle();
        driver.quit();
        return title;
    }
}
`,
    hints: [
      'Сначала driver.get(url)',
      'String t = driver.getTitle(); затем driver.quit(); return t;'
    ],
    verifierCode: `import java.util.*;
import org.openqa.selenium.WebDriver;
import com.qatrainer.lab.selenium.FakeDriver;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    FakeDriver fake = (FakeDriver) driver;
    fake.setTitle("Example Domain");
    Object lab = cls.getDeclaredConstructor().newInstance();
    Object title = cls.getMethod("openAndTitle", WebDriver.class, String.class)
        .invoke(lab, driver, "https://example.com");
    if (!"Example Domain".equals(title)) fails.add("title: expected Example Domain, got " + title);
    if (!fake.isQuit()) fails.add("driver.quit() не вызван");
    if (!fake.getActionsLog().contains("get:https://example.com")) fails.add("get(url) не вызван");
    return fails;
  }
}`
  }];
  save('junior/j-selenium-intro.json', L);
}

// ---- j-locators ----
{
  const L = load('junior/j-locators.json');
  L.exercises = [
    {
      id: 'e1',
      title: 'By по data-testid',
      description: 'Метод byTestId(String id) верни By.cssSelector("[data-testid=\'...\']").',
      difficulty: 'easy',
      mode: 'selenium-fake',
      className: 'LocatorLab',
      fixtureJson: JSON.stringify({
        title: 'Login',
        elements: [{ tag: 'button', id: 'go', testId: 'login', text: 'Login', displayed: true }]
      }),
      starterCode: `import org.openqa.selenium.By;

public class LocatorLab {
    public By byTestId(String id) {
        // TODO
        return null;
    }
}
`,
      solutionCode: `import org.openqa.selenium.By;

public class LocatorLab {
    public By byTestId(String id) {
        return By.cssSelector("[data-testid='" + id + "']");
    }
}
`,
      hints: ["By.cssSelector(\"[data-testid='\" + id + \"']\")"],
      verifierCode: `import java.util.*;
import org.openqa.selenium.*;
import com.qatrainer.lab.selenium.FakeDriver;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lab = cls.getDeclaredConstructor().newInstance();
    By by = (By) cls.getMethod("byTestId", String.class).invoke(lab, "login");
    WebElement el = driver.findElement(by);
    if (!"Login".equals(el.getText())) fails.add("Не нашли кнопку Login по data-testid");
    return fails;
  }
}`
    },
    {
      id: 'e2',
      title: 'XPath кнопки по тексту',
      description: 'byButtonText(String text) → By.xpath("//button[normalize-space()=\'text\']")',
      difficulty: 'easy',
      mode: 'selenium-fake',
      className: 'LocatorLab',
      fixtureJson: JSON.stringify({
        elements: [{ tag: 'button', id: 's', text: 'Save', displayed: true }]
      }),
      starterCode: `import org.openqa.selenium.By;

public class LocatorLab {
    public By byButtonText(String text) {
        // TODO
        return null;
    }
}
`,
      solutionCode: `import org.openqa.selenium.By;

public class LocatorLab {
    public By byButtonText(String text) {
        return By.xpath("//button[normalize-space()='" + text + "']");
    }
}
`,
      hints: ["By.xpath(\"//button[normalize-space()='\" + text + \"']\")"],
      verifierCode: `import java.util.*;
import org.openqa.selenium.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lab = cls.getDeclaredConstructor().newInstance();
    By by = (By) cls.getMethod("byButtonText", String.class).invoke(lab, "Save");
    if (!"Save".equals(driver.findElement(by).getText())) fails.add("Save button not found");
    return fails;
  }
}`
    }
  ];
  save('junior/j-locators.json', L);
}

// ---- j-waits ----
{
  const L = load('junior/j-waits.json');
  L.theoryMarkdown += `\n\n## Lab\n\nFakeDriver умеет \`appearAfterMs\` — элемент появляется через N мс. Используй WebDriverWait.\n`;
  L.exercises = [{
    id: 'e1',
    title: 'Explicit wait visibility',
    description: 'waitVisible(WebDriver driver, By by, long seconds) — дождись visibilityOfElementLocated и верни элемент. Используй WebDriverWait.',
    difficulty: 'hard',
    mode: 'selenium-fake',
    className: 'WaitLab',
    timeoutMs: 8000,
    fixtureJson: JSON.stringify({
      elements: [{ tag: 'div', id: 'ready', text: 'Ready', displayed: true, appearAfterMs: 400 }]
    }),
    starterCode: `import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;

public class WaitLab {
    public WebElement waitVisible(WebDriver driver, By by, long seconds) {
        // TODO WebDriverWait + ExpectedConditions.visibilityOfElementLocated
        return null;
    }
}
`,
    solutionCode: `import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;

public class WaitLab {
    public WebElement waitVisible(WebDriver driver, By by, long seconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(seconds));
        return wait.until(ExpectedConditions.visibilityOfElementLocated(by));
    }
}
`,
    hints: [
      'new WebDriverWait(driver, Duration.ofSeconds(seconds))',
      'wait.until(ExpectedConditions.visibilityOfElementLocated(by))'
    ],
    verifierCode: `import java.util.*;
import org.openqa.selenium.*;
import com.qatrainer.lab.selenium.FakeDriver;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lab = cls.getDeclaredConstructor().newInstance();
    WebElement el = (WebElement) cls.getMethod("waitVisible", WebDriver.class, By.class, long.class)
        .invoke(lab, driver, By.id("ready"), 3L);
    if (el == null || !"Ready".equals(el.getText())) fails.add("Не дождались элемента Ready");
    return fails;
  }
}`
  }];
  save('junior/j-waits.json', L);
}

// ---- j-pom-intro ----
{
  const L = load('junior/j-pom-intro.json');
  L.exercises = [{
    id: 'e1',
    title: 'LoginPage POM',
    description: 'Реализуй LoginPage(WebDriver): поля By email/password/submit; метод loginAs(user, pass) заполняет поля, кликает submit, возвращает текст #welcome.',
    difficulty: 'hard',
    mode: 'selenium-fake',
    className: 'LoginPage',
    fixtureJson: JSON.stringify({
      elements: [
        { tag: 'input', id: 'email', name: 'email', value: '' },
        { tag: 'input', id: 'password', name: 'password', value: '' },
        { tag: 'button', id: 'submit', text: 'Go', displayed: true },
        { tag: 'div', id: 'welcome', text: 'Hello, qa', displayed: true }
      ]
    }),
    starterCode: `import org.openqa.selenium.*;

public class LoginPage {
    private final WebDriver driver;
    // TODO: By email, password, submit, welcome

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    public String loginAs(String user, String pass) {
        // TODO fill + click + return welcome text
        return null;
    }
}
`,
    solutionCode: `import org.openqa.selenium.*;

public class LoginPage {
    private final WebDriver driver;
    private final By email = By.id("email");
    private final By password = By.id("password");
    private final By submit = By.id("submit");
    private final By welcome = By.id("welcome");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    public String loginAs(String user, String pass) {
        driver.findElement(email).sendKeys(user);
        driver.findElement(password).sendKeys(pass);
        driver.findElement(submit).click();
        return driver.findElement(welcome).getText();
    }
}
`,
    hints: [
      'By.id("email"), By.id("password"), By.id("submit"), By.id("welcome")',
      'sendKeys + click + getText welcome'
    ],
    verifierCode: `import java.util.*;
import org.openqa.selenium.*;
import com.qatrainer.lab.selenium.FakeDriver;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object page = cls.getConstructor(WebDriver.class).newInstance(driver);
    String welcome = (String) cls.getMethod("loginAs", String.class, String.class).invoke(page, "qa", "secret");
    if (!"Hello, qa".equals(welcome)) fails.add("welcome text: " + welcome);
    FakeDriver fake = (FakeDriver) driver;
    boolean typed = fake.getActionsLog().stream().anyMatch(a -> a.startsWith("sendKeys:"));
    boolean clicked = fake.getActionsLog().stream().anyMatch(a -> a.startsWith("click:"));
    if (!typed) fails.add("sendKeys не вызван");
    if (!clicked) fails.add("click не вызван");
    return fails;
  }
}`
  }];
  save('junior/j-pom-intro.json', L);
}

// ---- j-junit ----
{
  const L = load('junior/j-junit.json');
  L.exercises = [{
    id: 'e1',
    title: 'Напиши @Test для PasswordRule',
    description: 'Класс PasswordRuleTest: протестируй PasswordRule.isValidPassword — валидный "secret12", короткий "ab1", без цифры "longpassword". Используй assertTrue/assertFalse.',
    difficulty: 'medium',
    mode: 'junit',
    className: 'PasswordRuleTest',
    supportSources: {
      PasswordRule: `public class PasswordRule {
  public boolean isValidPassword(String p) {
    if (p == null || p.length() < 8) return false;
    boolean digit = false;
    for (int i = 0; i < p.length(); i++) if (Character.isDigit(p.charAt(i))) digit = true;
    return digit;
  }
}`
    },
    starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PasswordRuleTest {
    private final PasswordRule rule = new PasswordRule();

    // TODO: @Test methods
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PasswordRuleTest {
    private final PasswordRule rule = new PasswordRule();

    @Test
    void valid() { assertTrue(rule.isValidPassword("secret12")); }

    @Test
    void tooShort() { assertFalse(rule.isValidPassword("ab1")); }

    @Test
    void noDigit() { assertFalse(rule.isValidPassword("longpassword")); }
}
`,
    hints: [
      'Нужно минимум 3 метода с @Test',
      'assertTrue / assertFalse из Assertions'
    ]
  }];
  save('junior/j-junit.json', L);
}

// ---- j-assertions ----
{
  const L = load('junior/j-assertions.json');
  L.exercises = [{
    id: 'e1',
    title: 'AssertJ проверки ответа',
    description: 'ApiAssertTest: дан ApiResponse(status, body). Напиши тесты: status 200, body содержит "ok", id не blank. Используй AssertJ assertThat.',
    difficulty: 'medium',
    mode: 'junit',
    className: 'ApiAssertTest',
    supportSources: {
      ApiResponse: `public class ApiResponse {
  private final int status; private final String body;
  public ApiResponse(int status, String body) { this.status = status; this.body = body; }
  public int status() { return status; }
  public String body() { return body; }
  public String id() { return body.contains("\\"id\\":\\"") ? body.replaceAll(".*\\"id\\":\\"([^\\"]+)\\".*", "$1") : ""; }
}`
    },
    starterCode: `import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

public class ApiAssertTest {
    private final ApiResponse response = new ApiResponse(200, "{\\"ok\\":true,\\"id\\":\\"42\\"}");

    // TODO tests with assertThat
}
`,
    solutionCode: `import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

public class ApiAssertTest {
    private final ApiResponse response = new ApiResponse(200, "{\\"ok\\":true,\\"id\\":\\"42\\"}");

    @Test
    void statusOk() { assertThat(response.status()).isEqualTo(200); }

    @Test
    void bodyHasOk() { assertThat(response.body()).contains("ok"); }

    @Test
    void idPresent() { assertThat(response.id()).isNotBlank(); }
}
`,
    hints: ['assertThat(x).isEqualTo / contains / isNotBlank', 'Нужно 3 @Test']
  }];
  save('junior/j-assertions.json', L);
}

console.log('junior core done');
