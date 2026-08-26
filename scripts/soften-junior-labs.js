/**
 * Soften Junior selenium-path labs: more scaffolding in starters, easier difficulty labels.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function patch(file, fn) {
  const p = path.join(ROOT, file);
  const lesson = JSON.parse(fs.readFileSync(p, 'utf8'));
  fn(lesson);
  fs.writeFileSync(p, JSON.stringify(lesson, null, 2) + '\n');
  console.log('patched', file);
}

patch('junior/j-locators.json', (lesson) => {
  const e1 = lesson.exercises[0];
  e1.difficulty = 'easy';
  e1.revealAfterFails = 2;
  e1.description = 'Метод byTestId(id): верни By.cssSelector с атрибутом data-testid. Пример для id=login: [data-testid=\'login\'].';
  e1.starterCode = `import org.openqa.selenium.By;

public class LocatorLab {
    public By byTestId(String id) {
        // Собери строку: [data-testid='...' ] и передай в By.cssSelector
        return By.cssSelector("[data-testid='" + /* TODO: id */ + "']");
    }
}
`;
  // Fix invalid starter - can't leave broken Java. Use clear TODO with example comment.
  e1.starterCode = `import org.openqa.selenium.By;

public class LocatorLab {
    public By byTestId(String id) {
        // Пример: By.cssSelector("[data-testid='login']")
        // Подставь переменную id вместо login
        return null;
    }
}
`;
  e1.hints = [
    "Нужна строка вида: \"[data-testid='\" + id + \"']\"",
    "return By.cssSelector(\"[data-testid='\" + id + \"']\");"
  ];

  const e2 = lesson.exercises[1];
  e2.difficulty = 'easy';
  e2.revealAfterFails = 2;
  e2.starterCode = `import org.openqa.selenium.By;

public class LocatorLab {
    public By byButtonText(String text) {
        // Пример: //button[normalize-space()='Save']
        return null;
    }
}
`;
  e2.hints = [
    "By.xpath(\"//button[normalize-space()='\" + text + \"']\")"
  ];
});

patch('junior/j-waits.json', (lesson) => {
  const e1 = lesson.exercises[0];
  e1.difficulty = 'medium';
  e1.revealAfterFails = 2;
  e1.description = 'waitVisible: создай WebDriverWait на seconds секунд и верни результат until(visibilityOfElementLocated(by)). Импорты уже есть.';
  e1.starterCode = `import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;

public class WaitLab {
    public WebElement waitVisible(WebDriver driver, By by, long seconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(seconds));
        // TODO: return wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        return null;
    }
}
`;
  e1.hints = [
    "wait.until(ExpectedConditions.visibilityOfElementLocated(by))"
  ];
});

patch('junior/j-pom-intro.json', (lesson) => {
  const e1 = lesson.exercises[0];
  e1.difficulty = 'medium';
  e1.revealAfterFails = 2;
  e1.description = 'LoginPage: локаторы уже намечены. Допиши loginAs — sendKeys в email/password, click submit, верни текст welcome.';
  e1.starterCode = `import org.openqa.selenium.*;

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
        // TODO: password sendKeys, submit click, return welcome getText
        return null;
    }
}
`;
  e1.hints = [
    "driver.findElement(password).sendKeys(pass);",
    "driver.findElement(submit).click(); return driver.findElement(welcome).getText();"
  ];
});

patch('junior/j-selenium4.json', (lesson) => {
  const e1 = lesson.exercises[0];
  e1.difficulty = 'medium';
  e1.revealAfterFails = 2;
  e1.description = 'Найди все input, найди индекс элемента с id=password, верни name предыдущего input (модель «above»).';
  e1.starterCode = `import org.openqa.selenium.*;
import java.util.*;

public class RelLab {
    public String findInputAbovePassword(WebDriver driver) {
        List<WebElement> inputs = driver.findElements(By.tagName("input"));
        int pwd = -1;
        for (int i = 0; i < inputs.size(); i++) {
            if ("password".equals(inputs.get(i).getAttribute("id"))) {
                pwd = i;
            }
        }
        // TODO: если pwd > 0, верни name у inputs.get(pwd - 1)
        return null;
    }
}
`;
  e1.hints = [
    "if (pwd <= 0) return null;",
    "return inputs.get(pwd - 1).getAttribute(\"name\");"
  ];
});

patch('junior/j-junit.json', (lesson) => {
  const e1 = lesson.exercises[0];
  e1.difficulty = 'easy';
  e1.revealAfterFails = 2;
  e1.starterCode = `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PasswordRuleTest {
    private final PasswordRule rule = new PasswordRule();

    @Test
    void valid() {
        // TODO: assertTrue для "secret12"
    }

    @Test
    void tooShort() {
        // TODO: assertFalse для "ab1"
    }

    @Test
    void noDigit() {
        // TODO: assertFalse для "longpassword"
    }
}
`;
});

console.log('done');
