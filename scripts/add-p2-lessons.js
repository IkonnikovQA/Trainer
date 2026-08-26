const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function writeLesson(rel, obj) {
  const file = path.join(root, rel);
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('wrote', rel);
}

writeLesson('middle/m-awaitility.json', {
  id: 'm-awaitility',
  title: 'Поллинг и Awaitility-стиль',
  summary: 'Вместо Thread.sleep — ожидание условия с таймаутом.',
  theoryMarkdown:
    '# Awaitility-стиль\n\nВ UI/API часто нужно ждать, пока условие станет true.\n\n```java\nawait().atMost(2, SECONDS).until(() -> status.equals(\"READY\"));\n```\n\nВ этом уроке реализуй простой `Poller` без внешней библиотеки: цикл + deadline + sleep.\n\n## Правила\n\n- Таймаут обязателен\n- Интервал опроса не должен быть нулевым\n- По таймауту — понятное исключение\n',
  keyPoints: ['Poll until condition', 'Timeout + interval', 'Не sleep без проверки'],
  interviewTips: ['Чем Awaitility лучше sleep?', 'Как выбрать polling interval?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Thread.sleep(5000) в тесте плох потому что:',
      options: [
        'Медленнее даже когда условие уже true',
        'Запрещён в Java',
        'Не работает в CI',
        'Ломает Maven'
      ],
      correctIndexes: [0],
      explanation: 'Фиксированный sleep либо ждёт лишнее, либо мало.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'Poller.awaitTrue',
      description:
        'Допиши Poller.awaitTrue(BooleanSupplier, timeoutMs, intervalMs): крутит условие до true или бросает IllegalStateException(\"timeout\"). JUnit проверит happy-path и timeout.',
      difficulty: 'hard',
      mode: 'junit',
      className: 'PollerTest',
      supportSources: {
        Poller:
          'import java.util.function.BooleanSupplier;\n\npublic class Poller {\n  public static void awaitTrue(BooleanSupplier condition, long timeoutMs, long intervalMs) {\n    // student implements via editing Poller in starter — actually support is fixed;\n    // We put implementation in starter as Poller class instead.\n    throw new UnsupportedOperationException(\"use starter Poller\");\n  }\n}'
      },
      starterCode:
        'import java.util.concurrent.atomic.AtomicBoolean;\nimport java.util.function.BooleanSupplier;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class Poller {\n    public static void awaitTrue(BooleanSupplier condition, long timeoutMs, long intervalMs) {\n        // TODO: loop until condition.getAsBoolean() or timeout\n        throw new UnsupportedOperationException(\"todo\");\n    }\n}\n\npublic class PollerTest {\n    @Test\n    void becomesTrue() {\n        AtomicBoolean flag = new AtomicBoolean(false);\n        Thread t = new Thread(() -> {\n            try { Thread.sleep(80); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n            flag.set(true);\n        });\n        t.start();\n        Poller.awaitTrue(flag::get, 2000, 20);\n        assertTrue(flag.get());\n    }\n\n    @Test\n    void timesOut() {\n        assertThrows(IllegalStateException.class,\n            () -> Poller.awaitTrue(() -> false, 120, 20));\n    }\n}\n',
      solutionCode:
        'import java.util.concurrent.atomic.AtomicBoolean;\nimport java.util.function.BooleanSupplier;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class Poller {\n    public static void awaitTrue(BooleanSupplier condition, long timeoutMs, long intervalMs) {\n        long deadline = System.currentTimeMillis() + timeoutMs;\n        while (System.currentTimeMillis() < deadline) {\n            if (condition.getAsBoolean()) return;\n            try { Thread.sleep(Math.max(1, intervalMs)); } catch (InterruptedException e) {\n                Thread.currentThread().interrupt();\n                throw new IllegalStateException(\"interrupted\");\n            }\n        }\n        if (condition.getAsBoolean()) return;\n        throw new IllegalStateException(\"timeout\");\n    }\n}\n\npublic class PollerTest {\n    @Test\n    void becomesTrue() {\n        AtomicBoolean flag = new AtomicBoolean(false);\n        Thread t = new Thread(() -> {\n            try { Thread.sleep(80); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n            flag.set(true);\n        });\n        t.start();\n        Poller.awaitTrue(flag::get, 2000, 20);\n        assertTrue(flag.get());\n    }\n\n    @Test\n    void timesOut() {\n        assertThrows(IllegalStateException.class,\n            () -> Poller.awaitTrue(() -> false, 120, 20));\n    }\n}\n',
      hints: [
        'deadline = now + timeoutMs; while now < deadline',
        'если условие true — return; иначе sleep(interval); в конце throw IllegalStateException(\"timeout\")'
      ]
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

// Fix awaitility: supportSources Poller conflicts with student Poller in same file.
// JUnit runner compiles starter + support — duplicate Poller class!
// Better: only Poller in starter, tests in PollerTest as className, no supportSources.
// Or supportSources empty and both classes in starter.

writeLesson('middle/m-awaitility.json', {
  id: 'm-awaitility',
  title: 'Поллинг и Awaitility-стиль',
  summary: 'Вместо Thread.sleep — ожидание условия с таймаутом.',
  theoryMarkdown:
    '# Awaitility-стиль\n\nВ UI/API часто нужно ждать, пока условие станет true.\n\n```java\nawait().atMost(2, SECONDS).until(() -> status.equals(\"READY\"));\n```\n\nВ этом уроке реализуй простой `Poller` без внешней библиотеки: цикл + deadline + sleep.\n\n## Правила\n\n- Таймаут обязателен\n- Интервал опроса не должен быть нулевым\n- По таймауту — понятное исключение\n',
  keyPoints: ['Poll until condition', 'Timeout + interval', 'Не sleep без проверки'],
  interviewTips: ['Чем Awaitility лучше sleep?', 'Как выбрать polling interval?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Thread.sleep(5000) в тесте плох потому что:',
      options: [
        'Медленнее даже когда условие уже true',
        'Запрещён в Java',
        'Не работает в CI',
        'Ломает Maven'
      ],
      correctIndexes: [0],
      explanation: 'Фиксированный sleep либо ждёт лишнее, либо мало.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'Poller.awaitTrue',
      description:
        'Реализуй Poller.awaitTrue(BooleanSupplier, timeoutMs, intervalMs). Тесты в том же файле уже написаны — сделай, чтобы они проходили.',
      difficulty: 'hard',
      mode: 'junit',
      className: 'PollerTest',
      starterCode:
        'import java.util.concurrent.atomic.AtomicBoolean;\nimport java.util.function.BooleanSupplier;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass Poller {\n    static void awaitTrue(BooleanSupplier condition, long timeoutMs, long intervalMs) {\n        // TODO\n        throw new UnsupportedOperationException(\"todo\");\n    }\n}\n\npublic class PollerTest {\n    @Test\n    void becomesTrue() {\n        AtomicBoolean flag = new AtomicBoolean(false);\n        Thread t = new Thread(() -> {\n            try { Thread.sleep(80); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n            flag.set(true);\n        });\n        t.start();\n        Poller.awaitTrue(flag::get, 2000, 20);\n        assertTrue(flag.get());\n    }\n\n    @Test\n    void timesOut() {\n        assertThrows(IllegalStateException.class,\n            () -> Poller.awaitTrue(() -> false, 120, 20));\n    }\n}\n',
      solutionCode:
        'import java.util.concurrent.atomic.AtomicBoolean;\nimport java.util.function.BooleanSupplier;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass Poller {\n    static void awaitTrue(BooleanSupplier condition, long timeoutMs, long intervalMs) {\n        long deadline = System.currentTimeMillis() + timeoutMs;\n        while (System.currentTimeMillis() < deadline) {\n            if (condition.getAsBoolean()) return;\n            try { Thread.sleep(Math.max(1, intervalMs)); } catch (InterruptedException e) {\n                Thread.currentThread().interrupt();\n                throw new IllegalStateException(\"interrupted\");\n            }\n        }\n        if (condition.getAsBoolean()) return;\n        throw new IllegalStateException(\"timeout\");\n    }\n}\n\npublic class PollerTest {\n    @Test\n    void becomesTrue() {\n        AtomicBoolean flag = new AtomicBoolean(false);\n        Thread t = new Thread(() -> {\n            try { Thread.sleep(80); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n            flag.set(true);\n        });\n        t.start();\n        Poller.awaitTrue(flag::get, 2000, 20);\n        assertTrue(flag.get());\n    }\n\n    @Test\n    void timesOut() {\n        assertThrows(IllegalStateException.class,\n            () -> Poller.awaitTrue(() -> false, 120, 20));\n    }\n}\n',
      hints: [
        'deadline = now + timeoutMs; while now < deadline',
        'если условие true — return; иначе sleep(interval); в конце throw IllegalStateException(\"timeout\")'
      ]
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

writeLesson('middle/m-json-schema.json', {
  id: 'm-json-schema',
  title: 'JSON contract checks',
  summary: 'Проверка обязательных полей ответа — мини-контракт без тяжёлого schema framework.',
  theoryMarkdown:
    '# JSON contract\n\nПолный JSON Schema — мощно, но часто достаточно:\n\n- required fields\n- типы\n- enum статусов\n\n```java\n.then()\n  .body(\"id\", notNullValue())\n  .body(\"status\", equalTo(\"ACTIVE\"));\n```\n\nВ lab напиши валидатор контракта поверх RestAssured jsonPath.\n',
  keyPoints: ['Required fields', 'Типы/enum', 'Fail fast на контракте'],
  interviewTips: ['JSON Schema vs hand-written asserts', 'Где хранить контракты?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Если API убрал поле token из login-ответа, что должно упасть первым?',
      options: ['Только UI', 'Контрактный/API assert на required field', 'Ничего', 'Линтер CSS'],
      correctIndexes: [1],
      explanation: 'Контракт ловит breaking change дешевле UI.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'validateUserContract',
      description:
        'UserContract.validate(baseUrl): GET /user, проверь status 200 и что body содержит непустые id (number/string), email, status==\"ACTIVE\". Верни true если ок.',
      difficulty: 'hard',
      mode: 'http',
      className: 'UserContract',
      httpStubJson:
        '{"stubs":[{"status":200,"body":"{\\"id\\":42,\\"email\\":\\"qa@example.com\\",\\"status\\":\\"ACTIVE\\"}","headers":{"Content-Type":"application/json"}}]}',
      starterCode:
        'import static io.restassured.RestAssured.*;\n\npublic class UserContract {\n    public boolean validate(String baseUrl) {\n        // TODO GET baseUrl+"/user", assert fields, return true\n        return false;\n    }\n}\n',
      solutionCode:
        'import static io.restassured.RestAssured.*;\n\npublic class UserContract {\n    public boolean validate(String baseUrl) {\n        var res = given().when().get(baseUrl + "/user").then().statusCode(200).extract();\n        Object id = res.path("id");\n        String email = res.path("email");\n        String status = res.path("status");\n        if (id == null) throw new AssertionError("id required");\n        if (email == null || email.isBlank()) throw new AssertionError("email required");\n        if (!"ACTIVE".equals(status)) throw new AssertionError("status ACTIVE required");\n        return true;\n    }\n}\n',
      hints: [
        'given().when().get(baseUrl + "/user").then().statusCode(200).extract()',
        'path("id"), path("email"), path("status")'
      ],
      verifierCode:
        'import java.util.*;\n\npublic class ExerciseVerifier {\n  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {\n    List<String> fails = new ArrayList<>();\n    Object c = cls.getDeclaredConstructor().newInstance();\n    boolean ok = (Boolean) cls.getMethod("validate", String.class).invoke(c, baseUrl);\n    if (!ok) fails.add("validate must return true");\n    return fails;\n  }\n}'
    }
  ],
  levelId: 'middle',
  moduleId: 'api'
});

writeLesson('middle/m-soft-assert.json', {
  id: 'm-soft-assert',
  title: 'Soft asserts',
  summary: 'Собрать несколько проверок и упасть один раз со всеми ошибками.',
  theoryMarkdown:
    '# Soft assert\n\nHard assert падает на первой ошибке. Soft assert копит failures и репортит в конце — удобно для UI snapshot полей формы.\n\n```java\nsoftly.assertThat(a).isEqualTo(1);\nsoftly.assertThat(b).isEqualTo(2);\nsoftly.assertAll();\n```\n\nРеализуй мини-`SoftAssert` на списке сообщений.\n',
  keyPoints: ['assertAll в конце', 'Не глотай ошибки', 'Когда soft уместен'],
  interviewTips: ['AssertJ SoftAssertions', 'Когда soft вреден?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'soft assertAll() должен:',
      options: [
        'Игнорировать ошибки',
        'Бросить, если были failures, со всеми сообщениями',
        'Всегда pass',
        'Перезапустить тест'
      ],
      correctIndexes: [1],
      explanation: 'Иначе soft бесполезен.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'SoftAssert collector',
      description:
        'Реализуй SoftAssert.checkEquals/checkTrue и assertAll(). Тесты уже есть — должны пройти.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'SoftAssertTest',
      starterCode:
        'import java.util.*;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass SoftAssert {\n    private final List<String> fails = new ArrayList<>();\n\n    void checkEquals(Object expected, Object actual, String msg) {\n        // TODO if not equal, add msg to fails (do not throw yet)\n    }\n\n    void checkTrue(boolean cond, String msg) {\n        // TODO\n    }\n\n    void assertAll() {\n        // TODO if fails not empty, throw AssertionError with joined messages\n    }\n}\n\npublic class SoftAssertTest {\n    @Test\n    void passesWhenAllOk() {\n        SoftAssert s = new SoftAssert();\n        s.checkEquals(1, 1, "one");\n        s.checkTrue(true, "flag");\n        s.assertAll();\n    }\n\n    @Test\n    void collectsMultiple() {\n        SoftAssert s = new SoftAssert();\n        s.checkEquals("a", "b", "eq");\n        s.checkTrue(false, "flag");\n        AssertionError err = assertThrows(AssertionError.class, s::assertAll);\n        assertTrue(err.getMessage().contains("eq"));\n        assertTrue(err.getMessage().contains("flag"));\n    }\n}\n',
      solutionCode:
        'import java.util.*;\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass SoftAssert {\n    private final List<String> fails = new ArrayList<>();\n\n    void checkEquals(Object expected, Object actual, String msg) {\n        if (!Objects.equals(expected, actual)) fails.add(msg);\n    }\n\n    void checkTrue(boolean cond, String msg) {\n        if (!cond) fails.add(msg);\n    }\n\n    void assertAll() {\n        if (!fails.isEmpty()) throw new AssertionError(String.join("; ", fails));\n    }\n}\n\npublic class SoftAssertTest {\n    @Test\n    void passesWhenAllOk() {\n        SoftAssert s = new SoftAssert();\n        s.checkEquals(1, 1, "one");\n        s.checkTrue(true, "flag");\n        s.assertAll();\n    }\n\n    @Test\n    void collectsMultiple() {\n        SoftAssert s = new SoftAssert();\n        s.checkEquals("a", "b", "eq");\n        s.checkTrue(false, "flag");\n        AssertionError err = assertThrows(AssertionError.class, s::assertAll);\n        assertTrue(err.getMessage().contains("eq"));\n        assertTrue(err.getMessage().contains("flag"));\n    }\n}\n',
      hints: [
        'Objects.equals(expected, actual)',
        'assertAll: if (!fails.isEmpty()) throw new AssertionError(String.join("; ", fails))'
      ]
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

writeLesson('middle/m-capstone.json', {
  id: 'm-capstone',
  title: 'Capstone: UI + API + JUnit',
  summary: 'Сведи POM, RestAssured и JUnit в одном сценарии заказа.',
  theoryMarkdown:
    '# Capstone\n\nРеальный флоу:\n\n1. UI login через POM\n2. API создаёт заказ\n3. JUnit связывает ожидания\n\nПирамида: бизнес-логика через API, UI — smoke.\n',
  keyPoints: ['POM для UI smoke', 'API для создания данных', 'JUnit как оркестратор проверок'],
  interviewTips: ['Как делить UI/API в E2E?', 'Test data ownership'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Создавать заказ лучше:',
      options: ['Только кликами в UI', 'Через API (+ UI smoke при необходимости)', 'Вручную в проде', 'В CSS'],
      correctIndexes: [1],
      explanation: 'API быстрее и стабильнее для setup.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'CheckoutPage POM',
      description:
        'CheckoutPage: fillEmail + placeOrder кликает #place, возвращает текст #order-banner.',
      difficulty: 'medium',
      mode: 'selenium-fake',
      className: 'CheckoutPage',
      fixtureJson:
        '{"elements":[{"tag":"input","id":"email","value":""},{"tag":"button","id":"place","text":"Place","displayed":true},{"tag":"div","id":"order-banner","text":"Order OK","displayed":true}]}',
      starterCode:
        'import org.openqa.selenium.*;\n\npublic class CheckoutPage {\n    private final WebDriver driver;\n    // TODO By email, place, banner\n\n    public CheckoutPage(WebDriver driver) { this.driver = driver; }\n\n    public String placeOrder(String email) {\n        // TODO\n        return null;\n    }\n}\n',
      solutionCode:
        'import org.openqa.selenium.*;\n\npublic class CheckoutPage {\n    private final WebDriver driver;\n    private final By email = By.id("email");\n    private final By place = By.id("place");\n    private final By banner = By.id("order-banner");\n\n    public CheckoutPage(WebDriver driver) { this.driver = driver; }\n\n    public String placeOrder(String email) {\n        driver.findElement(this.email).sendKeys(email);\n        driver.findElement(place).click();\n        return driver.findElement(banner).getText();\n    }\n}\n',
      hints: ['By.id("email"), By.id("place"), By.id("order-banner")', 'sendKeys + click + getText'],
      verifierCode:
        'import java.util.*;\nimport org.openqa.selenium.*;\nimport com.qatrainer.lab.selenium.FakeDriver;\n\npublic class ExerciseVerifier {\n  public List<String> verify(Class<?> cls, WebDriver driver) throws Exception {\n    List<String> fails = new ArrayList<>();\n    Object page = cls.getConstructor(WebDriver.class).newInstance(driver);\n    String text = (String) cls.getMethod("placeOrder", String.class).invoke(page, "qa@ex.com");\n    if (!"Order OK".equals(text)) fails.add("banner: " + text);\n    FakeDriver fake = (FakeDriver) driver;\n    if (fake.getActionsLog().stream().noneMatch(a -> a.startsWith("sendKeys:"))) fails.add("sendKeys missing");\n    if (fake.getActionsLog().stream().noneMatch(a -> a.startsWith("click:"))) fails.add("click missing");\n    return fails;\n  }\n}'
    },
    {
      id: 'e2',
      title: 'OrderClient API',
      description:
        'createOrder(baseUrl, sku): POST /orders JSON {\"sku\":...}, верни orderId из ответа.',
      difficulty: 'medium',
      mode: 'http',
      className: 'OrderClient',
      httpStubJson:
        '{"stubs":[{"status":201,"body":"{\\"orderId\\":\\"ORD-9\\"}","headers":{"Content-Type":"application/json"}}]}',
      starterCode:
        'import static io.restassured.RestAssured.*;\nimport io.restassured.http.ContentType;\n\npublic class OrderClient {\n    public String createOrder(String baseUrl, String sku) {\n        // TODO\n        return null;\n    }\n}\n',
      solutionCode:
        'import static io.restassured.RestAssured.*;\nimport io.restassured.http.ContentType;\n\npublic class OrderClient {\n    public String createOrder(String baseUrl, String sku) {\n        String body = "{\\"sku\\":\\"" + sku + "\\"}";\n        return given().contentType(ContentType.JSON).body(body)\n            .when().post(baseUrl + "/orders")\n            .then().statusCode(201).extract().path("orderId");\n    }\n}\n',
      hints: ['POST baseUrl+"/orders"', 'extract().path("orderId")'],
      verifierCode:
        'import java.util.*;\n\npublic class ExerciseVerifier {\n  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {\n    List<String> fails = new ArrayList<>();\n    Object c = cls.getDeclaredConstructor().newInstance();\n    String id = (String) cls.getMethod("createOrder", String.class, String.class).invoke(c, baseUrl, "SKU1");\n    if (!"ORD-9".equals(id)) fails.add("orderId: " + id);\n    return fails;\n  }\n}'
    },
    {
      id: 'e3',
      title: 'OrderFlowTest',
      description:
        'JUnit: протестируй PriceCalc.total(qty, price) — qty*price, и отрицательный qty бросает IllegalArgumentException.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'OrderFlowTest',
      supportSources: {
        PriceCalc:
          'public class PriceCalc {\n  public int total(int qty, int price) {\n    if (qty < 0) throw new IllegalArgumentException("qty");\n    return qty * price;\n  }\n}'
      },
      starterCode:
        'import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class OrderFlowTest {\n    private final PriceCalc calc = new PriceCalc();\n\n    // TODO: @Test totalOk and negativeQty\n}\n',
      solutionCode:
        'import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class OrderFlowTest {\n    private final PriceCalc calc = new PriceCalc();\n\n    @Test\n    void totalOk() { assertEquals(30, calc.total(3, 10)); }\n\n    @Test\n    void negativeQty() {\n        assertThrows(IllegalArgumentException.class, () -> calc.total(-1, 10));\n    }\n}\n',
      hints: ['assertEquals(30, calc.total(3, 10))', 'assertThrows(IllegalArgumentException.class, ...)']
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

// Patch index.json
const indexPath = path.join(root, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function findModule(levelId, moduleId) {
  const level = index.levels.find((l) => l.id === levelId);
  return level.modules.find((m) => m.id === moduleId);
}

const api = findModule('middle', 'api');
if (!api.lessons.some((l) => l.id === 'm-json-schema')) {
  api.lessons.push({
    id: 'm-json-schema',
    title: 'JSON contract checks',
    file: 'middle/m-json-schema.json',
    estimatedMinutes: 30
  });
}

const quality = findModule('middle', 'quality');
for (const lesson of [
  {
    id: 'm-awaitility',
    title: 'Поллинг и Awaitility-стиль',
    file: 'middle/m-awaitility.json',
    estimatedMinutes: 30
  },
  {
    id: 'm-soft-assert',
    title: 'Soft asserts',
    file: 'middle/m-soft-assert.json',
    estimatedMinutes: 25
  },
  {
    id: 'm-capstone',
    title: 'Capstone: UI + API + JUnit',
    file: 'middle/m-capstone.json',
    estimatedMinutes: 45
  }
]) {
  if (!quality.lessons.some((l) => l.id === lesson.id)) {
    quality.lessons.push(lesson);
  }
}

// Update middle description
const middle = index.levels.find((l) => l.id === 'middle');
middle.description =
  'Advanced Selenium, API, данные, Allure, параллель, Mockito, BDD, DB, Selenide, паттерны, flaky, Awaitility/soft asserts, capstone.';

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log('index.json updated');
