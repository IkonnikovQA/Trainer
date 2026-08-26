/**
 * Add 2025-2026 market lessons and update index.json
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function write(level, file, lesson) {
  fs.mkdirSync(path.join(ROOT, level), { recursive: true });
  fs.writeFileSync(path.join(ROOT, level, file), JSON.stringify(lesson, null, 2), 'utf8');
  console.log('wrote', level + '/' + file);
}
function q(id, question, options, correctIndexes, explanation, hint, type = 'single') {
  return { id, type, question, options, correctIndexes, explanation, hint };
}

write('junior', 'j-selenium4.json', {
  id: 'j-selenium4',
  levelId: 'junior',
  moduleId: 'selenium',
  title: 'Selenium 4: relative locators и W3C',
  summary: 'Современный Selenium: W3C протокол, relative locators, CDP/BiDi обзор.',
  theoryMarkdown: `# Selenium 4

## W3C WebDriver

Selenium 4 говорит с браузером по **W3C WebDriver**, а не JSON Wire Protocol.
Это единый стандарт → меньше сюрпризов между драйверами.

## Relative locators

\`\`\`java
By email = RelativeLocator.with(By.tagName("input")).above(By.id("password"));
\`\`\`

Полезны, когда нет стабильного id, но есть соседний якорь.
Не злоупотребляй — data-testid всё ещё лучше.

## CDP / BiDi (обзор)

Chrome DevTools Protocol и WebDriver BiDi дают доступ к сети, консоли, emulation.
На собеседовании достаточно понимать *зачем*: перехват запросов, геолокация, performance.
В проде часто выбирают Playwright, если нужен богатый network layer из коробки.

## Anti-patterns Selenium 3 эпохи

- DesiredCapabilities вместо Options
- \`findElementBy*\` (deprecated)
- Игнор relative locators / нового Grid
`,
  keyPoints: [
    'W3C — стандарт протокола Selenium 4',
    'Relative locators — рядом с якорем',
    'CDP/BiDi — продвинутые возможности браузера'
  ],
  interviewTips: [
    'Чем Selenium 4 Grid отличается от Selenium 3 Hub-Node?',
    'Когда relative locator уместен, а когда вреден?'
  ],
  quiz: [
    q('q1', 'Relative locator нужен чтобы:',
      ['Заменить все CSS', 'Искать относительно другого элемента', 'Ускорить Maven', 'Отключить waits'],
      [1], 'Поиск относительно якоря.', null),
    q('q2', 'W3C WebDriver — это:',
      ['Старый JSON Wire', 'Стандартный протокол автоматизации браузера', 'Плагин Jenkins', 'Замена JUnit'],
      [1], 'Стандарт протокола.', null),
    q('q3', 'Что верно про CDP/BiDi? (несколько)',
      ['Позволяют глубже работать с браузером (сеть/консоль)', 'Обязательны в каждом UI-тесте', 'Полезны для advanced сценариев', 'Заменяют POM'],
      [0, 2], 'Advanced возможности, не замена архитектуры.', 'Не всё обязательно в каждом тесте.', 'multiple')
  ],
  exercises: [{
    id: 'e1',
    title: 'Relative above password',
    description: 'findEmail(WebDriver): найди input выше #password через RelativeLocator и верни его attribute name.',
    difficulty: 'medium',
    mode: 'selenium-fake',
    className: 'RelLab',
    fixtureJson: JSON.stringify({
      elements: [
        { tag: 'input', id: 'email', name: 'email', text: '' },
        { tag: 'input', id: 'password', name: 'password', text: '' }
      ]
    }),
    starterCode: `import org.openqa.selenium.*;
import org.openqa.selenium.support.locators.RelativeLocator;

public class RelLab {
    public String findEmail(WebDriver driver) {
        // TODO RelativeLocator.with(By.tagName("input")).above(By.id("password"))
        // FakeDriver может не поддержать relative — верни name через By.id("email") как fallback lab:
        // для зачёта: найди By.id("email") и верни getAttribute("name")
        return null;
    }
}
`,
    solutionCode: `import org.openqa.selenium.*;

public class RelLab {
    public String findEmail(WebDriver driver) {
        return driver.findElement(By.id("email")).getAttribute("name");
    }
}
`,
    hints: ['В этой lab-среде используй By.id("email").getAttribute("name")', 'В проде был бы RelativeLocator.with(...).above(...)'],
    verifierCode: `import java.util.*;
import org.openqa.selenium.*;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {
    List<String> fails = new ArrayList<>();
    Object lab = cls.getDeclaredConstructor().newInstance();
    String name = (String) cls.getMethod("findEmail", WebDriver.class).invoke(lab, driver);
    if (!"email".equals(name)) fails.add("expected name=email, got " + name);
    return fails;
  }
}`
  }]
});

write('junior', 'j-testng-vs-junit.json', {
  id: 'j-testng-vs-junit',
  levelId: 'junior',
  moduleId: 'maven-junit',
  title: 'TestNG vs JUnit 5',
  summary: 'Когда выбирать TestNG или JUnit 5: параллель, data providers, listeners.',
  theoryMarkdown: `# TestNG vs JUnit 5

| Тема | JUnit 5 | TestNG |
|------|---------|--------|
| Параллель | Surefire / config | встроенная мощная |
| Data | @ParameterizedTest | @DataProvider |
| Suite XML | редко | testng.xml |
| Listeners | Extension | ITestListener |

## Как отвечать на собесе

«Выбираю JUnit 5 по умолчанию в новых Java-проектах (экосистема Spring/AssertJ). TestNG беру, если уже есть suite XML и сложная параллель/зависимости тестов.»

Не говори «TestNG всегда лучше» — это red flag 2026.
`,
  keyPoints: [
    'JUnit 5 — дефолт новых проектов',
    'TestNG силён в suite/parallel legacy',
    'Решение = контекст команды'
  ],
  interviewTips: [
    'Сравни @DataProvider и @MethodSource',
    'Как параллелишь JUnit 5 в Maven?'
  ],
  quiz: [
    q('q1', 'В новом Spring Boot проекте чаще стартуют с:',
      ['Только TestNG', 'JUnit 5', 'Selenium RC', 'Ant'],
      [1], 'JUnit 5 — стандарт экосистемы.', null),
    q('q2', 'Что сильнее ассоциируется с TestNG?',
      ['testng.xml suites и DataProvider', 'только AssertJ', 'только Dockerfile', 'только BiDi'],
      [0], 'Suite XML и DataProvider.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Выбор раннера',
    description: 'choose(boolean hasTestNgXml, boolean springProject): верни "testng" если hasTestNgXml, иначе если spring — "junit5", иначе "junit5".',
    difficulty: 'easy',
    mode: 'java',
    className: 'RunnerChoice',
    starterCode: `public class RunnerChoice {
    public String choose(boolean hasTestNgXml, boolean springProject) {
        // TODO
        return "";
    }
}
`,
    solutionCode: `public class RunnerChoice {
    public String choose(boolean hasTestNgXml, boolean springProject) {
        if (hasTestNgXml) return "testng";
        return "junit5";
    }
}
`,
    hints: ['if (hasTestNgXml) return "testng"; return "junit5";'],
    testCases: [
      { name: 'xml', callExpression: 'choose(true, true)', expected: 'testng', expectedType: 'string' },
      { name: 'spring', callExpression: 'choose(false, true)', expected: 'junit5', expectedType: 'string' }
    ]
  }]
});

write('middle', 'm-restassured-deep.json', {
  id: 'm-restassured-deep',
  levelId: 'middle',
  moduleId: 'api',
  title: 'RestAssured deep: specs, schema, 401/403',
  summary: 'RequestSpecification, проверка authZ, отличие 401 и 403.',
  theoryMarkdown: `# RestAssured deep dive

## RequestSpecification

\`\`\`java
RequestSpecification spec = new RequestSpecBuilder()
  .setBaseUri(base)
  .setContentType(ContentType.JSON)
  .addHeader("Authorization", "Bearer " + token)
  .build();
\`\`\`

## 401 vs 403

- **401 Unauthorized** — нет/протухла аутентификация
- **403 Forbidden** — аутентифицирован, но нет прав

## Schema

Проверяй JSON Schema на критичных контрактах (или отдельный contract test).
`,
  keyPoints: [
    'Выноси common headers в RequestSpec',
    '401 ≠ 403',
    'Schema/контракт ловят ломающие изменения'
  ],
  interviewTips: [
    'Как обновляешь token в параллели?',
    'Где хранишь baseUri по окружениям?'
  ],
  quiz: [
    q('q1', '403 означает:',
      ['Не залогинен', 'Залогинен, но нет прав', 'Сервер упал', 'OK'],
      [1], 'Forbidden — авторизован, нет permission.', null),
    q('q2', 'RequestSpecification полезен чтобы:',
      ['Убрать дубли headers/baseUri', 'Заменить POM', 'Отключить CI', 'Ускорить Chrome'],
      [0], 'Переиспользование настроек запроса.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Проверка 401',
    description: 'unauthorized(baseUrl): GET /secure без токена, верни status (stub = 401).',
    difficulty: 'medium',
    mode: 'http',
    className: 'SecureClient',
    httpStubJson: JSON.stringify({ stubs: [{ status: 401, body: '{"error":"unauthorized"}' }] }),
    starterCode: `import static io.restassured.RestAssured.*;

public class SecureClient {
    public int unauthorized(String baseUrl) {
        // TODO GET baseUrl+"/secure" extract status
        return 0;
    }
}
`,
    solutionCode: `import static io.restassured.RestAssured.*;

public class SecureClient {
    public int unauthorized(String baseUrl) {
        return given().when().get(baseUrl + "/secure").then().extract().statusCode();
    }
}
`,
    hints: ['get(baseUrl + "/secure").then().extract().statusCode()'],
    verifierCode: `import java.util.*;
public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {
    List<String> fails = new ArrayList<>();
    int code = (Integer) cls.getMethod("unauthorized", String.class)
      .invoke(cls.getDeclaredConstructor().newInstance(), baseUrl);
    if (code != 401) fails.add("expected 401 got " + code);
    return fails;
  }
}`
  }]
});

write('middle', 'm-allure-steps.json', {
  id: 'm-allure-steps',
  levelId: 'middle',
  moduleId: 'reporting',
  title: 'Allure steps и вложения',
  summary: 'Как проектировать шаги отчёта и безопасные attachments.',
  theoryMarkdown: `# Allure steps

Идея: тест читается как сценарий в отчёте.

\`\`\`java
@Step("Login as {user}")
public void login(String user) { ... }
\`\`\`

На fail: screenshot, page source, request/response (без секретов).

## Naming

Шаг = бизнес-действие, не "click css=#x".
`,
  keyPoints: ['@Step для бизнес-действий', 'Attachments на fail', 'Маскируй токены'],
  interviewTips: ['Что прикладываешь к API fail?', 'Как именуешь steps?'],
  quiz: [
    q('q1', 'Плохой текст Allure step:',
      ['User opens checkout', 'Click css=#btn-3', 'Create order via API', 'Assert total amount'],
      [1], 'CSS в step — запах.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Step name builder',
    description: 'step(action, entity): "action: entity" в lower-case entity.',
    mode: 'java',
    className: 'StepNames',
    starterCode: `public class StepNames {
    public String step(String action, String entity) {
        // TODO
        return "";
    }
}
`,
    solutionCode: `public class StepNames {
    public String step(String action, String entity) {
        return action + ": " + entity.toLowerCase();
    }
}
`,
    hints: ['action + ": " + entity.toLowerCase()'],
    testCases: [
      { name: 'ok', callExpression: 'step("Login", "Admin")', expected: 'Login: admin', expectedType: 'string' }
    ]
  }]
});

write('middle', 'm-stale-flaky.json', {
  id: 'm-stale-flaky',
  levelId: 'middle',
  moduleId: 'quality',
  title: 'StaleElement и flaky postmortem',
  summary: 'Разбор типичных причин StaleElementReferenceException и процесс борьбы с flaky.',
  theoryMarkdown: `# StaleElementReferenceException

Элемент найден, DOM обновился, ссылка протухла.

## Фикс

1. Не храни WebElement долго
2. Повторный find перед действием
3. Жди стабильности (invisibility old / visibility new)
4. Не кликай во время анимации/перерисовки

## Flaky postmortem

1. Воспроизвести
2. Классифицировать (wait/data/race/env)
3. Корневой фикс
4. Ретрай — временная мера
`,
  keyPoints: ['Stale = DOM изменился', 'Не кэшируй элементы без нужды', 'Postmortem > слепой retry'],
  interviewTips: ['Расскажи реальный flaky кейс', 'Когда допустим retry?'],
  quiz: [
    q('q1', 'StaleElementReferenceException значит:',
      ['Неверный CSS всегда', 'Ссылка на элемент устарела после обновления DOM', 'JUnit сломан', 'Нет интернета'],
      [1], 'Протухший элемент.', null),
    q('q2', 'Выбери правильные антифлейк практики (несколько):',
      ['Явные waits по условию', 'Увеличить retries до 50 навсегда', 'Изоляция данных', 'Карантин с тикетом'],
      [0, 2, 3], 'Retries без фикса — плохо.', null, 'multiple')
  ],
  exercises: [{
    id: 'e1',
    title: 'Нужен ли refetch',
    description: 'shouldRefetch(boolean domChanged, boolean elementCached): true если элемент кэширован и DOM менялся.',
    mode: 'java',
    className: 'StalePolicy',
    starterCode: `public class StalePolicy {
    public boolean shouldRefetch(boolean domChanged, boolean elementCached) {
        // TODO
        return false;
    }
}
`,
    solutionCode: `public class StalePolicy {
    public boolean shouldRefetch(boolean domChanged, boolean elementCached) {
        return domChanged && elementCached;
    }
}
`,
    hints: ['return domChanged && elementCached;'],
    testCases: [
      { name: 'yes', callExpression: 'shouldRefetch(true, true)', expected: 'true', expectedType: 'boolean' },
      { name: 'no', callExpression: 'shouldRefetch(false, true)', expected: 'false', expectedType: 'boolean' }
    ]
  }]
});

write('senior', 's-github-actions.json', {
  id: 's-github-actions',
  levelId: 'senior',
  moduleId: 'ci',
  title: 'GitHub Actions для Java-тестов',
  summary: 'Workflow YAML: checkout, JDK, Maven cache, артефакты отчётов.',
  theoryMarkdown: `# GitHub Actions

\`\`\`yaml
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn -B test
\`\`\`

## vs Jenkins

GHA — меньше ops для GitHub-реп. Jenkins — гибкость on-prem/сложных агентов.
Senior должен уметь оба.
`,
  keyPoints: ['checkout + setup-java + mvn', 'cache: maven', 'upload artifacts отчётов'],
  interviewTips: ['Как кэшируешь зависимости?', 'Matrix browsers в GHA?'],
  quiz: [
    q('q1', 'actions/setup-java cache: maven помогает:',
      ['Скачать Chrome', 'Не качать зависимости каждый раз', 'Заменить тесты', 'Хранить пароли'],
      [1], 'Кэш .m2.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Напиши GHA workflow',
    description: 'YAML: on, jobs, runs-on, actions/checkout, mvn. Без password.',
    mode: 'artifact',
    artifactKind: 'gha',
    artifactRules: ['contains:on:', 'contains:jobs:', 'contains:runs-on:', 'contains:actions/checkout', 'contains:mvn', 'noSecret:password'],
    className: 'Workflow',
    starterCode: `name: tests
on:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # TODO
`,
    solutionCode: `name: tests
on:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: maven
      - run: mvn -B test
`,
    hints: ['actions/checkout@v4', 'run: mvn -B test']
  }]
});

write('senior', 's-testcontainers.json', {
  id: 's-testcontainers',
  levelId: 'senior',
  moduleId: 'docker',
  title: 'Testcontainers: идея и практика',
  summary: 'Реальные зависимости в Docker на время теста — изоляция без shared stage.',
  theoryMarkdown: `# Testcontainers

Поднимает контейнеры (Postgres, Kafka, WireMock…) из JUnit.

\`\`\`java
@Container
static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
\`\`\`

## Зачем

- Паритет с продом
- Нет гонок за shared sandbox
- CI воспроизводим (нужен Docker)

## Trade-off

Медленнее unit. Используй на integration слое, не на каждом UI клике.
`,
  keyPoints: ['Контейнер на lifecycle теста', 'Нужен Docker', 'Слой integration, не unit'],
  interviewTips: ['Когда Testcontainers vs Test Double?', 'Как ускоряешь старт контейнеров?'],
  quiz: [
    q('q1', 'Testcontainers требуют:',
      ['Только JRE без Docker', 'Доступный Docker engine', 'Только Windows', 'BrowserStack'],
      [1], 'Docker обязателен.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Выбор слоя',
    description: 'layer(needsRealDb, isUiE2E): "integration-tc" если needsRealDb && !isUiE2E, "e2e" если UI, иначе "unit".',
    mode: 'java',
    className: 'TcChoice',
    starterCode: `public class TcChoice {
    public String layer(boolean needsRealDb, boolean isUiE2E) {
        // TODO
        return "";
    }
}
`,
    solutionCode: `public class TcChoice {
    public String layer(boolean needsRealDb, boolean isUiE2E) {
        if (isUiE2E) return "e2e";
        if (needsRealDb) return "integration-tc";
        return "unit";
    }
}
`,
    hints: ['Сначала UI e2e, потом db → integration-tc'],
    testCases: [
      { name: 'tc', callExpression: 'layer(true, false)', expected: 'integration-tc', expectedType: 'string' },
      { name: 'ui', callExpression: 'layer(true, true)', expected: 'e2e', expectedType: 'string' },
      { name: 'unit', callExpression: 'layer(false, false)', expected: 'unit', expectedType: 'string' }
    ]
  }]
});

write('senior', 's-playwright-java.json', {
  id: 's-playwright-java',
  levelId: 'senior',
  moduleId: 'architecture',
  title: 'Playwright for Java: когда менять Selenium',
  summary: 'Auto-wait, traces, сравнение с Selenium — стратегический выбор стека.',
  theoryMarkdown: `# Playwright Java

## Сильные стороны

- Автоожидания из коробки
- Trace viewer (как «видео» шагов)
- Единый API web + APIRequest
- Быстрый старт параллели

## Когда остаться на Selenium

- Зрелый Selenium-фреймворк команды
- Нужна огромная экосистема legacy
- Корпстандарт = Selenium + Selenide

## Как отвечать

«Смотрю на риск миграции. Greenfield UI — часто Playwright. Существующий стабильный Selenium — эволюционирую (Selenide/waits), а не переписываю ради хайпа.»
`,
  keyPoints: [
    'Playwright = auto-wait + traces',
    'Миграция — cost/benefit',
    'Senior выбирает осознанно'
  ],
  interviewTips: [
    'Сравни flaky риск Selenium vs Playwright',
    'Что такое Playwright trace?'
  ],
  quiz: [
    q('q1', 'Trace в Playwright нужен чтобы:',
      ['Заменить ассерты', 'Разбирать падения пошагово', 'Собирать Maven', 'Писать Dockerfile'],
      [1], 'Отладка прогона.', null),
    q('q2', 'Правильный Senior-подход к смене стека:',
      ['Всегда переписать за неделю', 'Оценить ROI/риски/навыки команды', 'Игнорировать Selenium навсегда', 'Только TestNG'],
      [1], 'Trade-offs.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Рекомендация стека',
    description: 'recommend(boolean greenfield, boolean seleniumMature): "playwright" если greenfield, "selenium" если mature, иначе "evaluate".',
    mode: 'java',
    className: 'StackPick',
    starterCode: `public class StackPick {
    public String recommend(boolean greenfield, boolean seleniumMature) {
        // TODO
        return "";
    }
}
`,
    solutionCode: `public class StackPick {
    public String recommend(boolean greenfield, boolean seleniumMature) {
        if (greenfield) return "playwright";
        if (seleniumMature) return "selenium";
        return "evaluate";
    }
}
`,
    hints: ['if greenfield → playwright; else if mature → selenium; else evaluate'],
    testCases: [
      { name: 'new', callExpression: 'recommend(true, false)', expected: 'playwright', expectedType: 'string' },
      { name: 'legacy', callExpression: 'recommend(false, true)', expected: 'selenium', expectedType: 'string' },
      { name: 'mix', callExpression: 'recommend(false, false)', expected: 'evaluate', expectedType: 'string' }
    ]
  }]
});

write('senior', 's-cloud-grid.json', {
  id: 's-cloud-grid',
  levelId: 'senior',
  moduleId: 'docker',
  title: 'Cloud Grid: BrowserStack / Sauce',
  summary: 'Когда облако выгоднее своего Grid: масштаб устройств, ops, compliance.',
  theoryMarkdown: `# Cloud browser farms

## Плюсы облака

- Матрица браузеров/устройств без своего железа
- Меньше ops
- Видео/логи из коробки

## Плюсы своего Grid

- Данные не уходят наружу (compliance)
- Предсказуемая стоимость на огромных объёмах
- Контроль версий браузеров

## Решение

Compliance + бюджет + объём параллели + нужда в real devices.
`,
  keyPoints: ['Облако = масштаб/ops', 'Свой Grid = контроль/compliance', 'Решение по constraints'],
  interviewTips: ['Как считаешь TCO Grid vs BrowserStack?', 'Что с секретами в облаке?'],
  quiz: [
    q('q1', 'Если нельзя отправлять трафик наружу, чаще:',
      ['Только BrowserStack', 'On-prem Selenium Grid', 'Отключить UI тесты навсегда', 'Только Thread.sleep'],
      [1], 'Свой Grid / private cloud.', null)
  ],
  exercises: [{
    id: 'e1',
    title: 'Выбор инфраструктуры',
    description: 'pick(boolean complianceBlock, boolean needManyDevices): "private-grid" если compliance, "cloud" если many devices, иначе "local-ci".',
    mode: 'java',
    className: 'GridPick',
    starterCode: `public class GridPick {
    public String pick(boolean complianceBlock, boolean needManyDevices) {
        // TODO
        return "";
    }
}
`,
    solutionCode: `public class GridPick {
    public String pick(boolean complianceBlock, boolean needManyDevices) {
        if (complianceBlock) return "private-grid";
        if (needManyDevices) return "cloud";
        return "local-ci";
    }
}
`,
    hints: ['compliance first, then devices'],
    testCases: [
      { name: 'comp', callExpression: 'pick(true, true)', expected: 'private-grid', expectedType: 'string' },
      { name: 'cloud', callExpression: 'pick(false, true)', expected: 'cloud', expectedType: 'string' },
      { name: 'local', callExpression: 'pick(false, false)', expected: 'local-ci', expectedType: 'string' }
    ]
  }]
});

// Update index.json
const indexPath = path.join(ROOT, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function findModule(levelId, moduleId) {
  const level = index.levels.find(l => l.id === levelId);
  return level.modules.find(m => m.id === moduleId);
}

findModule('junior', 'selenium').lessons.push(
  { id: 'j-selenium4', title: 'Selenium 4', file: 'junior/j-selenium4.json', estimatedMinutes: 30 }
);
findModule('junior', 'maven-junit').lessons.push(
  { id: 'j-testng-vs-junit', title: 'TestNG vs JUnit 5', file: 'junior/j-testng-vs-junit.json', estimatedMinutes: 25 }
);
findModule('middle', 'api').lessons.push(
  { id: 'm-restassured-deep', title: 'RestAssured deep', file: 'middle/m-restassured-deep.json', estimatedMinutes: 35 }
);
findModule('middle', 'reporting').lessons.push(
  { id: 'm-allure-steps', title: 'Allure steps', file: 'middle/m-allure-steps.json', estimatedMinutes: 20 }
);
findModule('middle', 'quality').lessons.push(
  { id: 'm-stale-flaky', title: 'StaleElement & flaky', file: 'middle/m-stale-flaky.json', estimatedMinutes: 30 }
);
findModule('senior', 'ci').lessons.push(
  { id: 's-github-actions', title: 'GitHub Actions', file: 'senior/s-github-actions.json', estimatedMinutes: 30 }
);
findModule('senior', 'docker').lessons.push(
  { id: 's-testcontainers', title: 'Testcontainers', file: 'senior/s-testcontainers.json', estimatedMinutes: 25 },
  { id: 's-cloud-grid', title: 'Cloud Grid', file: 'senior/s-cloud-grid.json', estimatedMinutes: 20 }
);
findModule('senior', 'architecture').lessons.push(
  { id: 's-playwright-java', title: 'Playwright for Java', file: 'senior/s-playwright-java.json', estimatedMinutes: 30 }
);

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
console.log('index updated');
