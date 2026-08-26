/**
 * Part 2: Junior testing + Middle lessons
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function writeLesson(level, file, lesson) {
  fs.mkdirSync(path.join(ROOT, level), { recursive: true });
  fs.writeFileSync(path.join(ROOT, level, file), JSON.stringify(lesson, null, 2), 'utf8');
}
function q(id, question, options, correctIndexes, explanation, hint, type = 'single') {
  return { id, type, question, options, correctIndexes, explanation, hint };
}
function ex(p) {
  return { difficulty: 'easy', hints: [], testCases: [], verifierCode: null, solutionCode: null, methodName: null, ...p };
}
function add(levelId, moduleId, file, lesson) {
  lesson.levelId = levelId;
  lesson.moduleId = moduleId;
  writeLesson(levelId, file, lesson);
}

add('junior', 'java-basics', 'j-streams.json', {
  id: 'j-streams',
  title: 'Java Streams API',
  summary: 'Stream API ускоряет обработку списков элементов и тестовых данных.',
  theoryMarkdown: `# Streams

Конвейер: source → intermediate ops → terminal op.

\`\`\`java
long visible = elements.stream()
    .filter(WebElement::isDisplayed)
    .count();
\`\`\`

## Ключевые операции

- filter, map, flatMap, distinct, sorted, peek
- collect/toList, count, findFirst, anyMatch, reduce

## Важно

Streams **ленивые**: без terminal операции ничего не выполнится.
Не переиспользуй один и тот же Stream.
`,
  keyPoints: ['filter/map/collect — базовый набор', 'Streams ленивые', 'toList() с Java 16'],
  interviewTips: ['Промежуточные vs терминальные операции', 'Параллельные стримы — когда опасно'],
  quiz: [
    q('q1', 'Какая операция терминальная?',
      ['map', 'filter', 'count', 'distinct'], [2], 'count завершает пайплайн.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Сумма чётных',
      description: 'sumEven(int[] nums) через цикл или stream-логику: сумма чётных. null → 0.',
      className: 'StreamTasks',
      starterCode: 'public class StreamTasks {\n    public int sumEven(int[] nums) {\n        // TODO\n        return 0;\n    }\n}\n',
      hints: ['if (nums==null) return 0;', 'если n % 2 == 0 — добавляй'],
      testCases: [
        { name: 'mixed', callExpression: 'sumEven({1,2,3,4})', expected: '6', expectedType: 'int' },
        { name: 'none', callExpression: 'sumEven({1,3})', expected: '0', expectedType: 'int' }
      ]
    })
  ]
});

add('junior', 'maven-junit', 'j-maven.json', {
  id: 'j-maven',
  title: 'Maven: проект, зависимости, жизненный цикл',
  summary: 'Maven — стандарт сборки Java-тестов: зависимости, плагины, фазы.',
  theoryMarkdown: `# Maven для QA

## Структура

\`\`\`
src/main/java      — прод/фреймворк код
src/test/java      — тесты
pom.xml            — координаты и зависимости
\`\`\`

## Координаты

\`groupId\`, \`artifactId\`, \`version\`

## Lifecycle

\`validate → compile → test → package → verify → install → deploy\`

Для тестов чаще всего: \`mvn test\`, \`mvn clean verify\`.

## Зависимости автотестов

- selenium-java
- junit-jupiter / testng
- rest-assured
- assertj / hamcrest
- allure, webdrivermanager

## Surefire

Плагин запуска unit/UI тестов. Настраивает parallel, includes/excludes.
`,
  keyPoints: ['pom.xml описывает проект', 'mvn test запускает тесты', 'scope test для тестовых библиотек'],
  interviewTips: ['Чем Maven отличается от Gradle?', 'Что делает dependency scope: test/provided/compile?'],
  quiz: [
    q('q1', 'Где лежат автотесты в стандартном Maven-проекте?',
      ['src/main/java', 'src/test/java', 'target/only', 'root/tests'], [1], 'Конвенция Maven: src/test/java.', null),
    q('q2', 'Какая фаза запускает тесты?',
      ['package', 'test', 'deploy', 'site'], [1], 'Фаза test.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Парсер GAV',
      description: 'parseArtifact("org.seleniumhq.selenium:selenium-java:4.25.0") верни массив [groupId, artifactId, version].',
      className: 'MavenUtils',
      difficulty: 'medium',
      starterCode: 'public class MavenUtils {\n    public String[] parseArtifact(String gav) {\n        // TODO split by :\n        return new String[0];\n    }\n    public String groupId(String gav) { return parseArtifact(gav)[0]; }\n    public String artifactId(String gav) { return parseArtifact(gav)[1]; }\n    public String version(String gav) { return parseArtifact(gav)[2]; }\n}\n',
      hints: ['gav.split(":")', 'Проверь что частей ровно 3'],
      testCases: [
        { name: 'group', callExpression: 'groupId("org.seleniumhq.selenium:selenium-java:4.25.0")', expected: 'org.seleniumhq.selenium', expectedType: 'string' },
        { name: 'artifact', callExpression: 'artifactId("org.seleniumhq.selenium:selenium-java:4.25.0")', expected: 'selenium-java', expectedType: 'string' },
        { name: 'ver', callExpression: 'version("a:b:1.0")', expected: '1.0', expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'maven-junit', 'j-junit.json', {
  id: 'j-junit',
  title: 'JUnit 5: аннотации и жизненный цикл теста',
  summary: 'JUnit 5 — основной движок тестов. Аннотации, assertions, вложенность.',
  theoryMarkdown: `# JUnit 5

## Аннотации

- \`@Test\` — тест
- \`@BeforeEach\` / \`@AfterEach\`
- \`@BeforeAll\` / \`@AfterAll\` (обычно static)
- \`@DisplayName\`, \`@Tag\`, \`@Disabled\`
- \`@ParameterizedTest\` + \`@ValueSource\` / \`@CsvSource\` / \`@MethodSource\`

## Пример

\`\`\`java
@BeforeEach
void setUp() { driver = new ChromeDriver(); }

@Test
@DisplayName("Login with valid user")
void loginOk() { /* ... */ }

@AfterEach
void tearDown() { driver.quit(); }
\`\`\`

## Assertions

\`Assertions.assertEquals\`, \`assertTrue\`, \`assertThrows\`.
Лучше AssertJ: \`assertThat(x).isEqualTo(y)\`.
`,
  keyPoints: ['@BeforeEach перед каждым тестом', 'Один тест — одна идея', 'Имя теста = поведение'],
  interviewTips: ['JUnit 4 vs 5', 'Как параметризовать тест?', '@TestInstance(PER_CLASS)'],
  quiz: [
    q('q1', '@BeforeAll по умолчанию требует метод:',
      ['instance', 'static', 'private only', 'async'], [1], 'Без PER_CLASS метод @BeforeAll static.', null),
    q('q2', 'Для набора входных данных лучше:',
      ['Скопировать 10 @Test', '@ParameterizedTest', 'main()', 'while(true)'], [1], 'Параметризация убирает дубли.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Простая проверка пароля',
      description: 'isValidPassword(String p): длина >= 8 и есть хотя бы одна цифра.',
      className: 'PasswordRule',
      difficulty: 'medium',
      starterCode: 'public class PasswordRule {\n    public boolean isValidPassword(String p) {\n        // TODO\n        return false;\n    }\n}\n',
      hints: ['if (p == null || p.length() < 8) return false;', 'p.chars().anyMatch(Character::isDigit)'],
      testCases: [
        { name: 'ok', callExpression: 'isValidPassword("secret12")', expected: 'true', expectedType: 'boolean' },
        { name: 'short', callExpression: 'isValidPassword("ab1")', expected: 'false', expectedType: 'boolean' },
        { name: 'no digit', callExpression: 'isValidPassword("longpassword")', expected: 'false', expectedType: 'boolean' }
      ]
    })
  ]
});

add('junior', 'maven-junit', 'j-assertions.json', {
  id: 'j-assertions',
  title: 'Ассерты и дизайн проверок',
  summary: 'Хороший ассерт проверяет поведение и даёт понятный fail-message.',
  theoryMarkdown: `# Ассерты

## Правила

1. Проверяй **поведение**, не реализацию
2. Сообщение падения должно говорить *что ожидали*
3. Несколько связанных проверок — SoftAssertions
4. Не проверяй всё подряд — фокус на риске

\`\`\`java
assertThat(response.statusCode()).isEqualTo(200);
assertThat(response.jsonPath().getString("id")).isNotBlank();
\`\`\`

## Anti-patterns

- \`assertTrue(a == b)\` вместо \`assertEquals\`
- Ассерт без смысла после действия
- Скриншот вместо проверки текста (когда текст доступен)
`,
  keyPoints: ['Понятный failure message', 'AssertJ читаемее', 'Soft assert когда нужно увидеть все ошибки'],
  interviewTips: ['Чем assertEquals отличается от assertSame?', 'Когда soft assertions вредны?'],
  quiz: [
    q('q1', 'assertSame сравнивает:',
      ['equals содержимое', 'ссылки на один объект', 'hashCode', 'toString'], [1], 'same = identity ==', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Мини-матчер',
      description: 'describeDiff(expected, actual) верни "OK" если равны, иначе "expected=<e> actual=<a>".',
      className: 'AssertHelper',
      starterCode: 'public class AssertHelper {\n    public String describeDiff(String expected, String actual) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['Objects.equals или сравнение с учётом null', 'Формат строго: expected=... actual=...'],
      testCases: [
        { name: 'равны', callExpression: 'describeDiff("A", "A")', expected: 'OK', expectedType: 'string' },
        { name: 'различаются', callExpression: 'describeDiff("A", "B")', expected: 'expected=A actual=B', expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'selenium', 'j-selenium-intro.json', {
  id: 'j-selenium-intro',
  title: 'Selenium WebDriver: архитектура и старт',
  summary: 'WebDriver — интерфейс управления браузером. Драйвер, сессия, команды.',
  theoryMarkdown: `# Selenium WebDriver

## Идея

Тест → WebDriver API → Driver (chromedriver) → Браузер.

## Минимальный тест

\`\`\`java
WebDriver driver = new ChromeDriver();
driver.get("https://example.com");
String title = driver.getTitle();
driver.quit();
\`\`\`

## Важные методы

- \`get\`, \`getCurrentUrl\`, \`getTitle\`
- \`findElement\` / \`findElements\`
- \`quit\` (закрыть сессию) vs \`close\` (вкладку)

## WebDriverManager / Selenium Manager

Современный Selenium умеет сам подтягивать драйверы (Selenium Manager).
`,
  keyPoints: ['quit закрывает сессию полностью', 'findElement бросает если нет элемента', 'findElements вернёт пустой список'],
  interviewTips: ['Архитектура Selenium 4', 'JSON Wire vs W3C WebDriver', 'close vs quit'],
  quiz: [
    q('q1', 'Что делает driver.quit()?',
      ['Закрывает одну вкладку', 'Завершает сессию WebDriver и процессы', 'Только чистит cookies', 'Перезапускает ОС'],
      [1], 'quit завершает сессию.', null),
    q('q2', 'findElements при отсутствии элементов:',
      ['кидает NoSuchElement', 'возвращает пустой List', 'возвращает null', 'ждёт вечно'],
      [1], 'findElements → empty list.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'URL builder для теста',
      description: 'buildUrl(base, path): склей base без хвостового / и path с ведущим /. Пример: https://x.com + /login → https://x.com/login',
      className: 'UrlUtils',
      starterCode: 'public class UrlUtils {\n    public String buildUrl(String base, String path) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['Убери trailing / у base', 'Добавь / к path если нет', 'base + path'],
      testCases: [
        { name: 'normal', callExpression: 'buildUrl("https://x.com", "/login")', expected: 'https://x.com/login', expectedType: 'string' },
        { name: 'slash base', callExpression: 'buildUrl("https://x.com/", "login")', expected: 'https://x.com/login', expectedType: 'string' },
        { name: 'both', callExpression: 'buildUrl("https://x.com/", "/a")', expected: 'https://x.com/a', expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'selenium', 'j-locators.json', {
  id: 'j-locators',
  title: 'Локаторы: CSS, XPath, стратегии',
  summary: 'Качество локаторов = стабильность UI-тестов.',
  theoryMarkdown: `# Локаторы

## Приоритет

1. data-testid / id (стабильные)
2. CSS
3. XPath (текст, оси)
4. хрупкие: полные абсолютные xpath, индексы

## CSS примеры

\`\`\`
#login
input[name='email']
.btn.primary
div.card > h2
\`\`\`

## XPath примеры

\`\`\`
//button[text()='Submit']
//div[@class='row']//input
//*[contains(@class,'error')]
\`\`\`

## Плохие практики

- \`/html/body/div[3]/div[1]/...\`
- Локатор от позиции в списке без бизнес-смысла
- Завязка на динамические CSS-hash классы
`,
  keyPoints: ['Стабильный атрибут лучше красивого xpath', 'CSS для структуры, XPath для текста', 'Не Absolute XPath'],
  interviewTips: ['CSS vs XPath производительность', 'Как работать с Shadow DOM (ограничения)'],
  quiz: [
    q('q1', 'Какой локатор предпочтительнее для стабильности?',
      ['/html/body/div[5]/button', "By.cssSelector(\"[data-testid='login']\")", 'By.xpath("//div[3]")', 'By.className("css-hash-123")'],
      [1], 'data-testid специально для тестов.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'CSS по data-testid',
      description: "cssByTestId(String id) → [data-testid='id']",
      className: 'LocatorUtils',
      starterCode: 'public class LocatorUtils {\n    public String cssByTestId(String id) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ["Верни строку вида [data-testid='login']"],
      testCases: [
        { name: 'login', callExpression: 'cssByTestId("login")', expected: "[data-testid='login']", expectedType: 'string' },
        { name: 'submit', callExpression: 'cssByTestId("submit")', expected: "[data-testid='submit']", expectedType: 'string' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'XPath по тексту кнопки',
      description: "xpathButton(String text) → //button[normalize-space()='text']",
      className: 'LocatorUtils',
      starterCode: 'public class LocatorUtils {\n    public String xpathButton(String text) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['Склей: "//button[normalize-space()=\'" + text + "\']"'],
      testCases: [
        { name: 'Save', callExpression: 'xpathButton("Save")', expected: "//button[normalize-space()='Save']", expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'selenium', 'j-waits.json', {
  id: 'j-waits',
  title: 'Ожидания: implicit, explicit, anti-sleep',
  summary: 'Правильные waits — главный антифлейк навык Junior→Middle.',
  theoryMarkdown: `# Ожидания

## Implicit

Глобально на поиск элементов. Легко скрывает проблемы. Используй осторожно / = 0.

## Explicit

\`\`\`java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.id("go")));
\`\`\`

## FluentWait

Кастомный polling, ignored exceptions.

## Запрещено (почти всегда)

\`Thread.sleep(5000)\` — замедляет и флакает.

## Типичные условия

visibility, clickable, presence, urlContains, textToBePresent
`,
  keyPoints: ['Explicit > sleep', 'Жди условие, не время', 'Смешение implicit+explicit путает таймауты'],
  interviewTips: ['Почему sleep — зло?', 'Как отладить TimeoutException?'],
  quiz: [
    q('q1', 'Лучшая замена Thread.sleep в UI тесте:',
      ['увеличить sleep', 'WebDriverWait + ExpectedConditions', 'игнорировать падение', 'закрыть глаза'],
      [1], 'Явное ожидание условия.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Расчёт таймаута polling',
      description: 'maxPolls(timeoutSec, intervalMs): сколько попыток = ceil(timeoutSec*1000/intervalMs).',
      className: 'WaitMath',
      starterCode: 'public class WaitMath {\n    public int maxPolls(int timeoutSec, int intervalMs) {\n        // TODO\n        return 0;\n    }\n}\n',
      hints: ['(timeoutSec * 1000 + intervalMs - 1) / intervalMs', 'или Math.ceil'],
      testCases: [
        { name: '10s/500ms', callExpression: 'maxPolls(10, 500)', expected: '20', expectedType: 'int' },
        { name: '1s/300ms', callExpression: 'maxPolls(1, 300)', expected: '4', expectedType: 'int' }
      ]
    })
  ]
});

add('junior', 'selenium', 'j-pom-intro.json', {
  id: 'j-pom-intro',
  title: 'Page Object Model: введение',
  summary: 'POM отделяет UI-детали от тест-сценариев.',
  theoryMarkdown: `# Page Object Model

## Идея

Класс страницы:
- хранит локаторы
- предоставляет действия (\`login\`, \`open\`)
- возвращает другую страницу / this для fluent

\`\`\`java
public class LoginPage {
  private final WebDriver driver;
  private final By email = By.id("email");
  private final By pass = By.id("password");
  private final By submit = By.id("submit");

  public LoginPage(WebDriver driver) { this.driver = driver; }

  public HomePage loginAs(String user, String password) {
    driver.findElement(email).sendKeys(user);
    driver.findElement(pass).sendKeys(password);
    driver.findElement(submit).click();
    return new HomePage(driver);
  }
}
\`\`\`

## Тест становится читаемым

\`\`\`java
new LoginPage(driver).loginAs("u", "p").assertWelcome("u");
\`\`\`

## Правила

- Не храни ассерты только в тесте? Можно assert-методы в page/assert-объекте — команда выбирает стиль
- Не делай God-page на 2000 строк — дроби компоненты
`,
  keyPoints: ['Локаторы внутри page', 'Тест говорит бизнес-языком', 'Компоненты для повторяющихся блоков'],
  interviewTips: ['POM vs Page Factory', 'Screenplay pattern vs POM'],
  quiz: [
    q('q1', 'Где должны жить CSS/XPath в POM?',
      ['В @Test методах', 'В классе Page/Component', 'В README', 'В Jenkinsfile'],
      [1], 'Инкапсуляция локаторов в page.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Имитация LoginPage',
      description: 'Класс LoginFlow с методом step(String action) накапливает действия в списке; getSteps() возвращает "a->b->c".',
      className: 'LoginFlow',
      difficulty: 'medium',
      starterCode: 'import java.util.*;\npublic class LoginFlow {\n    private final List<String> steps = new ArrayList<>();\n    public LoginFlow open() { steps.add("open"); return this; }\n    public LoginFlow typeEmail(String e) { steps.add("email:"+e); return this; }\n    public LoginFlow typePassword(String p) { steps.add("pass:"+p); return this; }\n    public LoginFlow submit() { steps.add("submit"); return this; }\n    public String getSteps() {\n        // TODO: join with ->\n        return "";\n    }\n}\n',
      hints: ['String.join("->", steps)'],
      testCases: [
        { name: 'flow', callExpression: 'open().typeEmail("a").typePassword("b").submit().getSteps()', expected: 'open->email:a->pass:b->submit', expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'tools', 'j-git.json', {
  id: 'j-git',
  title: 'Git для автоматизатора',
  summary: 'Ветки, коммиты, PR — обязательный навык для работы в команде.',
  theoryMarkdown: `# Git essentials

## База

\`\`\`
git status
git pull
git checkout -b feature/login-tests
git add .
git commit -m "Add login smoke tests"
git push -u origin HEAD
\`\`\`

## Хорошие коммиты тестов

- Одна логическая цель
- Не коммить \`target/\`, секреты, локальные конфиги
- Понятное сообщение: что/зачем

## Конфликты

Часто в локаторах и общих util. Разрешай осознанно, прогони тесты.
`,
  keyPoints: ['Не коммить секреты и target/', 'Короткие feature-ветки', 'PR = ревью + CI'],
  interviewTips: ['merge vs rebase', 'Что такое git bisect?'],
  quiz: [
    q('q1', 'Что обычно добавляют в .gitignore автотестов?',
      ['src/test/java', 'target/, .idea/, *.env', 'pom.xml', 'README'], [1], 'Артефакты сборки и локальные файлы.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Имя ветки',
      description: 'branchName(ticket, slug): "feature/TICKET-slug" в lower-case для slug, ticket as-is.',
      className: 'GitUtils',
      starterCode: 'public class GitUtils {\n    public String branchName(String ticket, String slug) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['"feature/" + ticket + "-" + slug.toLowerCase()'],
      testCases: [
        { name: 'ok', callExpression: 'branchName("QA-12", "LoginTests")', expected: 'feature/QA-12-logintests', expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'tools', 'j-debug.json', {
  id: 'j-debug',
  title: 'Отладка падающих тестов',
  summary: 'Системный разбор фейла: воспроизвести → локализовать → зафиксировать.',
  theoryMarkdown: `# Дебаг UI/API теста

## Чеклист

1. Падение стабильно или flaky?
2. Что именно упало: ассерт / timeout / infra?
3. Есть скрин, HTML dump, request/response, video?
4. Воспроизводится локально на том же окружении?
5. Данные теста валидны?

## Инструменты

- Логи WebDriver / browser console
- Breakpoints в IDE
- System.out / logger на шагах (временно)
- Allure attachments

## Не делай

- «Починил» добавлением sleep без понимания
- Пропуск теста без тикета
`,
  keyPoints: ['Сначала классифицируй ошибку', 'Артефакты ускоряют разбор', 'Sleep — не фикс корневой причины'],
  interviewTips: ['Расскажи историю расследования flaky', 'Как логируешь API вызовы?'],
  quiz: [
    q('q1', 'TimeoutException чаще всего значит:',
      ['JVM сломалась', 'Ожидаемое условие не наступило вовремя', 'JUnit баг', 'Maven не установлен'],
      [1], 'Wait не дождался условия.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Классификатор ошибки',
      description: 'classify(String msg): если содержит Timeout → WAIT, Assert/Assertion → ASSERT, NoSuchElement → LOCATOR, иначе OTHER.',
      className: 'FailureClass',
      starterCode: 'public class FailureClass {\n    public String classify(String msg) {\n        // TODO\n        return "OTHER";\n    }\n}\n',
      hints: ['Проверяй msg.toLowerCase().contains(...)', 'Порядок проверок важен'],
      testCases: [
        { name: 'wait', callExpression: 'classify("TimeoutException: waiting")', expected: 'WAIT', expectedType: 'string' },
        { name: 'assert', callExpression: 'classify("AssertionError expected")', expected: 'ASSERT', expectedType: 'string' },
        { name: 'loc', callExpression: 'classify("NoSuchElementException")', expected: 'LOCATOR', expectedType: 'string' },
        { name: 'other', callExpression: 'classify("Connection refused")', expected: 'OTHER', expectedType: 'string' }
      ]
    })
  ]
});

// MIDDLE
add('middle', 'selenium-adv', 'm-advanced-selenium.json', {
  id: 'm-advanced-selenium',
  title: 'Advanced Selenium: окна, фреймы, алерты, JS',
  summary: 'Реальные приложения: iframe, новые вкладки, shadow-близко, JS executor.',
  theoryMarkdown: `# Advanced Selenium

## Windows / Tabs

\`\`\`java
String parent = driver.getWindowHandle();
for (String h : driver.getWindowHandles()) {
  driver.switchTo().window(h);
}
driver.switchTo().window(parent);
\`\`\`

## Frames

\`driver.switchTo().frame(el)\` → работа внутри → \`defaultContent()\`.

## Alerts

\`switchTo().alert().accept()/dismiss()/sendKeys\`

## JavascriptExecutor

\`\`\`java
((JavascriptExecutor) driver).executeScript("arguments[0].click();", el);
\`\`\`

Используй JS-клик осторожно — может маскировать баг UX.
`,
  keyPoints: ['Всегда возвращайся из frame', 'Храни parent handle', 'JS click — исключение, не норма'],
  interviewTips: ['Как тестировать файл download?', 'Как обойти stale element?'],
  quiz: [
    q('q1', 'После работы в iframe нужно:',
      ['Ничего', 'switchTo().defaultContent()', 'quit()', 'refresh только'],
      [1], 'Вернуться в главный документ.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Выбор окна по title',
      description: 'pickHandle(String[] handles, String[] titles, String wantedTitle) — верни handle с нужным title. Если нет — null.',
      className: 'WindowUtils',
      difficulty: 'medium',
      starterCode: 'public class WindowUtils {\n    public String pickHandle(String[] handles, String[] titles, String wantedTitle) {\n        // TODO: handles[i] соответствует titles[i]\n        return null;\n    }\n}\n',
      hints: ['Цикл по индексам', 'titles[i].equals(wantedTitle)'],
      testCases: [
        { name: 'found', callExpression: 'pickHandle({"h1","h2"}, {"A","B"}, "B")', expected: 'h2', expectedType: 'string' },
        { name: 'missing', callExpression: 'pickHandle({"h1"}, {"A"}, "Z")', expected: 'null', expectedType: 'null' }
      ]
    })
  ]
});

add('middle', 'selenium-adv', 'm-pom-fluent.json', {
  id: 'm-pom-fluent',
  title: 'Fluent Page Objects и компоненты',
  summary: 'Масштабируемый UI-слой: fluent API, компоненты, loadable pages.',
  theoryMarkdown: `# Fluent POM & Components

## Fluent

Методы возвращают \`this\` или следующую страницу — цепочки шагов.

## Components

\`Header\`, \`Table\`, \`Modal\` — переиспользуемые куски DOM.

## LoadableComponent

Страница умеет \`isLoaded()\` / \`load()\` — меньше «слепых» действий.

## Не смешивай уровни

Тест не должен знать CSS. Page не должен знать бизнес-сценарий из 15 страниц — для этого steps/flows.
`,
  keyPoints: ['Компоненты против копипасты', 'Flows/steps для сквозных сценариев', 'isLoaded снижает флаки'],
  interviewTips: ['Слой steps vs page', 'Когда Screenplay оправдан?'],
  quiz: [
    q('q1', 'Повторяющийся header лучше вынести в:',
      ['каждый page copy-paste', 'Component класс', 'Jenkins', 'String utils'], [1], 'UI-компонент.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Component path',
      description: 'childCss(parent, child) → parent + " " + child',
      className: 'CssCombine',
      starterCode: 'public class CssCombine {\n    public String childCss(String parent, String child) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['return parent + " " + child;'],
      testCases: [
        { name: 'ok', callExpression: 'childCss("div.header", "a.logo")', expected: 'div.header a.logo', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'api', 'm-restassured.json', {
  id: 'm-restassured',
  title: 'API тестирование с RestAssured',
  summary: 'Большая часть ценности Middle — стабильные API-тесты и контракты ответов.',
  theoryMarkdown: `# RestAssured

\`\`\`java
given()
  .contentType(ContentType.JSON)
  .body(payload)
.when()
  .post("/api/login")
.then()
  .statusCode(200)
  .body("token", not(emptyString()));
\`\`\`

## Спеки

\`RequestSpecBuilder\` / \`ResponseSpecBuilder\` — общие headers, baseURI, ожидаемые коды.

## jsonPath / hamcrest / assertj

Проверяй поля, массивы, типы.

## Пирамида

API тесты быстрее и стабильнее UI — покрывай ими бизнес-логику.
`,
  keyPoints: ['given-when-then', 'Выноси base spec', 'API > UI для логики'],
  interviewTips: ['Идемпотентность', 'Как тестировать auth (Bearer)?', 'Разница 401 и 403'],
  quiz: [
    q('q1', '401 обычно значит:',
      ['Нет прав (forbidden)', 'Не аутентифицирован', 'Сервер упал', 'OK'], [1], 'Unauthorized — нет/невалидна аутентификация.', null),
    q('q2', 'Где лучше проверять бизнес-правило расчёта цены?',
      ['Только через тяжёлый UI', 'API/сервисный уровень (+ UI smoke)', 'Вручную раз в год', 'В CSS'],
      [1], 'Ближе к логике — дешевле.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Сборка Authorization header',
      description: 'bearer(token) → "Bearer " + token. Пустой/null token → IllegalArgumentException (верни "ERROR" для тренажёра через safeBearer).',
      className: 'AuthHeaders',
      starterCode: 'public class AuthHeaders {\n    public String bearer(String token) {\n        if (token == null || token.isBlank()) throw new IllegalArgumentException("token");\n        return "Bearer " + token;\n    }\n    public String safeBearer(String token) {\n        try { return bearer(token); } catch (IllegalArgumentException e) { return "ERROR"; }\n    }\n}\n',
      hints: ['Стартер уже почти готов — проверь логику и не ломай методы'],
      testCases: [
        { name: 'ok', callExpression: 'safeBearer("abc")', expected: 'Bearer abc', expectedType: 'string' },
        { name: 'empty', callExpression: 'safeBearer("")', expected: 'ERROR', expectedType: 'string' },
        { name: 'null', callExpression: 'safeBearer(null)', expected: 'ERROR', expectedType: 'string' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'JSON path упрощённо',
      description: 'getField("{\\"a\\":{\\"b\\":\\"x\\"}}" имитация): simpleGet(mapLike, key) — для тренировки: из "a.b=x;a.c=y" достань значение по ключу "a.b".',
      className: 'FlatJson',
      difficulty: 'medium',
      starterCode: 'public class FlatJson {\n    public String simpleGet(String flat, String key) {\n        // flat format: k=v;k2=v2\n        // TODO\n        return null;\n    }\n}\n',
      hints: ['split by ;', 'каждый pair split by = (limit 2)', 'сравни ключ'],
      testCases: [
        { name: 'found', callExpression: 'simpleGet("a.b=x;a.c=y", "a.b")', expected: 'x', expectedType: 'string' },
        { name: 'missing', callExpression: 'simpleGet("a.b=x", "z")', expected: 'null', expectedType: 'null' }
      ]
    })
  ]
});

add('middle', 'api', 'm-testdata.json', {
  id: 'm-testdata',
  title: 'Тестовые данные: фабрики, фикстуры, изоляция',
  summary: 'Нестабильные данные — частая причина flaky. Middle обязан уметь готовить данные правильно.',
  theoryMarkdown: `# Тестовые данные

## Стратегии

1. **Создать через API** перед UI
2. **Фабрики/билдеры** с дефолтами + overrides
3. **Уникальность**: UUID, timestamp
4. **Cleanup**: delete/after, или immutable env

## Плохо

- Зависимость от ручного состояния стенда
- Один и тот же email в параллели
- Тесты, требующие точный порядок выполнения

\`\`\`java
User user = UserFactory.builder().email("qa+" + UUID.randomUUID() + "@mail.com").build();
\`\`\`
`,
  keyPoints: ['Уникальные данные для параллели', 'Setup через API', 'Тесты независимы'],
  interviewTips: ['Как готовишь данные для E2E?', 'Что делать с shared sandbox?'],
  quiz: [
    q('q1', 'Почему UUID в email полезен?',
      ['Красиво', 'Избегает коллизий в параллельных прогонах', 'Ускоряет Chrome', 'Нужен Maven'],
      [1], 'Уникальность данных.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Уникальный email',
      description: 'email(String prefix, String id) → prefix + "+" + id + "@example.com"',
      className: 'DataFactory',
      starterCode: 'public class DataFactory {\n    public String email(String prefix, String id) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['prefix + "+" + id + "@example.com"'],
      testCases: [
        { name: 'ok', callExpression: 'email("qa", "123")', expected: 'qa+123@example.com', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'reporting', 'm-allure.json', {
  id: 'm-allure',
  title: 'Отчётность Allure и артефакты',
  summary: 'Без отчётов CI-фейлы разбираются слишком долго.',
  theoryMarkdown: `# Allure

## Зачем

- Шаги \`@Step\`
- Вложения: скрин, лог, request/response
- История, retries, categories
- Связь с TMS (issue/link)

## Практика

На падении UI — скрин + page source.
На падении API — body + headers (без секретов).

## CI

Генерируй allure-report как артефакт job.
`,
  keyPoints: ['Шаги делают отчёт читаемым', 'Вложения на fail', 'Не логируй секреты'],
  interviewTips: ['Allure vs ExtentReports', 'Как храните историю флаков?'],
  quiz: [
    q('q1', 'Что нельзя прикладывать в отчёт?',
      ['screenshot', 'access token / пароли', 'response body без PII', 'browser console'],
      [1], 'Секреты нельзя.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Маскирование секрета',
      description: 'mask(token): если length<=4 → "****", иначе первые 2 + **** + последние 2.',
      className: 'SecretMask',
      starterCode: 'public class SecretMask {\n    public String mask(String token) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['if token==null return "****"', 'короткие полностью маскируй'],
      testCases: [
        { name: 'short', callExpression: 'mask("abcd")', expected: '****', expectedType: 'string' },
        { name: 'long', callExpression: 'mask("abcdef")', expected: 'ab****ef', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'reporting', 'm-parallel.json', {
  id: 'm-parallel',
  title: 'Параллельный запуск и ThreadLocal',
  summary: 'Параллель ускоряет CI, но ломает наивные static WebDriver.',
  theoryMarkdown: `# Параллель

## Проблема

\`static WebDriver driver\` — гонки между потоками.

## Решение

\`ThreadLocal<WebDriver>\` + аккуратный cleanup в afterEach.

## Уровни параллели

- методы
- классы
- JVM forks (Surefire)

## Данные

Изоляция обязательна: иначе параллель покажет ложные падения.
`,
  keyPoints: ['ThreadLocal для драйвера', 'Cleanup в finally/after', 'Изоляция данных'],
  interviewTips: ['Как отладить race в тестах?', 'parallel=methods vs classes'],
  quiz: [
    q('q1', 'static WebDriver в параллели опасен потому что:',
      ['Медленный', 'Потоки делят одну сессию/состояние', 'Запрещён Java', 'Не работает с Maven'],
      [1], 'Shared mutable state.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Ключ потока',
      description: 'threadKey(suite, threadId) → suite + "#" + threadId',
      className: 'ParallelKeys',
      starterCode: 'public class ParallelKeys {\n    public String threadKey(String suite, long threadId) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['suite + "#" + threadId'],
      testCases: [
        { name: 'ok', callExpression: 'threadKey("smoke", 12)', expected: 'smoke#12', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'quality', 'm-mockito.json', {
  id: 'm-mockito',
  title: 'Mockito для тестового каркаса',
  summary: 'Моки полезны в unit-тестах утилит фреймворка и сервисов.',
  theoryMarkdown: `# Mockito

\`\`\`java
List list = mock(List.class);
when(list.size()).thenReturn(2);
verify(list).size();
\`\`\`

## Когда

- Unit тесты хелперов отчётов, ретраев, клиентов с зависимостями
- Не мокай всё в E2E — иначе тестируешь мок

## ArgumentCaptor

Достаёт аргументы вызова для проверки.
`,
  keyPoints: ['Моки для unit, не для E2E', 'verify проверяет взаимодействие', 'stub через when/thenReturn'],
  interviewTips: ['mock vs spy', 'Чем stub отличается от mock в классике?'],
  quiz: [
    q('q1', 'В чистом UI E2E мокать WebDriver обычно:',
      ['Обязательно', 'Плохая идея — теряется смысл E2E', 'Требование Selenium', 'Быстрее Grid'],
      [1], 'E2E проверяет интеграцию с браузером.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Retry helper',
      description: 'shouldRetry(attempt, max, status): retry если attempt < max и status >= 500.',
      className: 'RetryPolicy',
      starterCode: 'public class RetryPolicy {\n    public boolean shouldRetry(int attempt, int max, int status) {\n        // TODO\n        return false;\n    }\n}\n',
      hints: ['attempt < max && status >= 500'],
      testCases: [
        { name: '500', callExpression: 'shouldRetry(0, 3, 500)', expected: 'true', expectedType: 'boolean' },
        { name: '400', callExpression: 'shouldRetry(0, 3, 400)', expected: 'false', expectedType: 'boolean' },
        { name: 'exhausted', callExpression: 'shouldRetry(3, 3, 500)', expected: 'false', expectedType: 'boolean' }
      ]
    })
  ]
});

add('middle', 'quality', 'm-cucumber.json', {
  id: 'm-cucumber',
  title: 'Cucumber BDD: когда нужен и как не утонуть',
  summary: 'BDD полезен при живом сотрудничестве с бизнесом, иначе — оверхед.',
  theoryMarkdown: `# Cucumber

## Gherkin

\`\`\`gherkin
Scenario: Successful login
  Given user is on login page
  When user logs in with valid credentials
  Then home page is shown
\`\`\`

## Step definitions

Клеят текст шагов к Java-коду.

## Антипаттерны

- Сценарии с CSS и деталями UI
- Тысячи дублирующих steps
- BDD «для галочки» без читателей сценариев

## Альтернатива

Если бизнес не читает feature-файлы — обычные Java-тесты с хорошими именами часто лучше.
`,
  keyPoints: ['Сценарий = бизнес-язык', 'Steps тонкие, логика в коде', 'BDD нужен процесс, не только инструмент'],
  interviewTips: ['Плюсы/минусы Cucumber', 'Как избежать step-adu'],
  quiz: [
    q('q1', 'В Given/When/Then лучше писать:',
      ['Click css=#btn', 'Бизнес-действие пользователя', 'Thread.sleep', 'xpath'],
      [1], 'Бизнес-язык.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Парсер Gherkin строки',
      description: 'keyword("Given user opens app") → "Given".',
      className: 'GherkinUtils',
      starterCode: 'public class GherkinUtils {\n    public String keyword(String line) {\n        // TODO first word\n        return "";\n    }\n}\n',
      hints: ['line.trim().split(" ")[0]'],
      testCases: [
        { name: 'given', callExpression: 'keyword("Given user opens app")', expected: 'Given', expectedType: 'string' },
        { name: 'then', callExpression: 'keyword("Then home opened")', expected: 'Then', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'quality', 'm-db.json', {
  id: 'm-db',
  title: 'Проверки базы данных в автотестах',
  summary: 'Иногда нужно проверить side-effect в БД — аккуратно и точечно.',
  theoryMarkdown: `# DB в тестах

## Когда

- Критичный side effect не виден через API
- Сверка отчётов/биллинга

## Как

JDBC / jOOQ / MyBatis. Лучше отдельный read-only user.

## Риски

- Хрупкая привязка к схеме
- Медленные тесты
- Засорение данных

Предпочти API verification, БД — точечно.
`,
  keyPoints: ['БД-проверки точечные', 'Read-only доступ', 'Не дублируй всё API проверками SQL'],
  interviewTips: ['Как чистишь данные?', 'Транзакции в тестах'],
  quiz: [
    q('q1', 'Предпочтительный способ проверить создание сущности:',
      ['Только SELECT в прод БД руками', 'API get + при необходимости точечный SQL', 'Только UI screenshot', 'Игнорировать'],
      [1], 'API first.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Безопасный SQL identifier',
      description: 'safeId(name): разрешены только буквы/цифры/_. Иначе "INVALID".',
      className: 'SqlSafety',
      starterCode: 'public class SqlSafety {\n    public String safeId(String name) {\n        // TODO\n        return "INVALID";\n    }\n}\n',
      hints: ['name.matches("[A-Za-z0-9_]+") ? name : "INVALID"', 'null → INVALID'],
      testCases: [
        { name: 'ok', callExpression: 'safeId("users_1")', expected: 'users_1', expectedType: 'string' },
        { name: 'bad', callExpression: 'safeId("users;drop")', expected: 'INVALID', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'quality', 'm-selenide.json', {
  id: 'm-selenide',
  title: 'Selenide: удобный слой над Selenium',
  summary: 'Selenide даёт разумные дефолты waits и concise API.',
  theoryMarkdown: `# Selenide

\`\`\`java
open("/login");
$("#email").setValue("u");
$("#password").setValue("p");
$("button[type=submit]").click();
$(".welcome").shouldHave(text("Hello"));
\`\`\`

## Плюсы

- Автоожидания
- Красивые ассерты
- Меньше бойлерплейта

## Минусы/ограничения

- Нужно понимать Selenium под капотом
- Кастомизация драйвера/грида всё равно нужна
`,
  keyPoints: ['$ / $$ селекторы', 'should* ассерты с wait', 'Не забывай архитектуру POM'],
  interviewTips: ['Selenide vs чистый Selenium', 'Как параллелить Selenide?'],
  quiz: [
    q('q1', 'Selenide shouldHave(text(...)) обычно:',
      ['Не ждёт', 'Ждёт условие в течение таймаута', 'Делает sleep 10с всегда', 'Работает только с Firefox'],
      [1], 'Умные ожидания в ассертах.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Selenide-like css shorten',
      description: 'id(String x) → "#" + x; cssClass(String x) → "." + x',
      className: 'Sel',
      starterCode: 'public class Sel {\n    public String id(String x) { return ""; }\n    public String cssClass(String x) { return ""; }\n}\n',
      hints: ['return "#" + x;', 'return "." + x;'],
      testCases: [
        { name: 'id', callExpression: 'id("email")', expected: '#email', expectedType: 'string' },
        { name: 'class', callExpression: 'cssClass("active")', expected: '.active', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'quality', 'm-patterns.json', {
  id: 'm-patterns',
  title: 'Паттерны тест-фреймворка',
  summary: 'Factory, Builder, Strategy, Facade — как применять в тестах.',
  theoryMarkdown: `# Паттерны

## Factory

\`DriverFactory.create(Browser.CHROME)\`

## Builder

Сборка сложных тестовых данных/запросов.

## Strategy

Разные waits/auth стратегии.

## Facade

Упрощённый API над сложным subsystem (например, \`MailFacade\`).

## Singleton — осторожно

Легко создать скрытое состояние и сломать параллель.
`,
  keyPoints: ['Factory для драйверов', 'Builder для данных', 'Singleton опасен в параллели'],
  interviewTips: ['Какие паттерны в твоём фреймворке?', 'DI в тестах'],
  quiz: [
    q('q1', 'User.builder().email(..).build() — это:',
      ['Factory Method строго', 'Builder', 'Observer', 'Proxy'], [1], 'Builder.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Мини-builder результат',
      description: 'Класс Query с полями; через withPath/withLimit верни this; build() → "PATH path LIMIT n".',
      className: 'Query',
      difficulty: 'medium',
      starterCode: 'public class Query {\n    private String path = "/";\n    private int limit = 10;\n    public Query withPath(String path) { this.path = path; return this; }\n    public Query withLimit(int limit) { this.limit = limit; return this; }\n    public String build() {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['return "PATH " + path + " LIMIT " + limit;'],
      testCases: [
        { name: 'ok', callExpression: 'withPath("/users").withLimit(5).build()', expected: 'PATH /users LIMIT 5', expectedType: 'string' }
      ]
    })
  ]
});

add('middle', 'quality', 'm-flaky.json', {
  id: 'm-flaky',
  title: 'Flaky tests: поиск причин и стратегия',
  summary: 'Умение снижать flake rate отличает крепкого Middle.',
  theoryMarkdown: `# Flaky

## Причины

Waits, анимации, данные, время/таймзоны, порядок тестов, утечки состояния, сеть, параллель.

## Процесс

1. Пометить и измерить
2. Карантин / quarantine job
3. Корневой фикс
4. Ретраи — временная мера, не стратегия

## Метрики

flake rate = flaky runs / total runs
`,
  keyPoints: ['Ретрай не лечит причину', 'Карантин прозрачен', 'Сначала стабильность критичного набора'],
  interviewTips: ['Как снижал flaky на проекте?', 'Когда ретраи допустимы?'],
  quiz: [
    q('q1', 'Лучший долгосрочный подход к flaky:',
      ['Увеличить retries до 10', 'Найти и устранить причину', 'Отключить CI', 'Игнорировать'],
      [1], 'Root cause fix.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Flake rate',
      description: 'rate(flaky, total) в процентах целых: flaky*100/total. total=0 → 0.',
      className: 'FlakeMath',
      starterCode: 'public class FlakeMath {\n    public int rate(int flaky, int total) {\n        // TODO\n        return 0;\n    }\n}\n',
      hints: ['if (total==0) return 0;', 'return flaky * 100 / total;'],
      testCases: [
        { name: '10/100', callExpression: 'rate(10, 100)', expected: '10', expectedType: 'int' },
        { name: 'zero', callExpression: 'rate(1, 0)', expected: '0', expectedType: 'int' }
      ]
    })
  ]
});

console.log('Part 2 done');
