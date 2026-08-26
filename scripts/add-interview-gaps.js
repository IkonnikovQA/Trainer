const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function write(rel, obj) {
  fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('wrote', rel);
}

write('middle/m-junit-extensions.json', {
  id: 'm-junit-extensions',
  title: 'JUnit 5 Extensions: Store и Namespace',
  summary: 'Extension вместо толстого BaseTest: callbacks + Store для данных на тест.',
  theoryMarkdown: `# JUnit 5 Extensions

## Зачем

BaseTest наследует всё подряд → хрупко. Extension подключаешь точечно через \`@ExtendWith\`.

## BeforeEachCallback

\`\`\`java
public class TimingExtension implements BeforeEachCallback {
  static final ExtensionContext.Namespace NS =
      ExtensionContext.Namespace.create("timing");

  public void beforeEach(ExtensionContext ctx) {
    ctx.getStore(NS).put("startedAt", System.currentTimeMillis());
  }
}
\`\`\`

## Store и Namespace

- **Store** — map, живущий в контексте теста/класса
- **Namespace** — ключ изоляции, чтобы расширения не затирали чужие данные

## vs BaseTest

Extension = композиция. BaseTest = наследование (один «родитель»).
`,
  keyPoints: ['@ExtendWith', 'Store + Namespace', 'Композиция лучше толстого BaseTest'],
  interviewTips: ['Когда оставить BaseTest?', 'Что кладёшь в Store?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Namespace в ExtensionContext нужен чтобы:',
      options: [
        'Ускорить Maven',
        'Изолировать ключи Store между расширениями',
        'Заменить @Test',
        'Отключить параллель'
      ],
      correctIndexes: [1],
      explanation: 'Разные расширения не конфликтуют по ключам.',
      hint: null
    },
    {
      id: 'q2',
      type: 'multiple',
      question: 'Что правда про Extension?',
      options: [
        'Подключается через @ExtendWith',
        'Всегда требует наследования BaseTest',
        'Store хранит данные на контекст теста',
        'Заменяет CI'
      ],
      correctIndexes: [0, 2],
      explanation: 'Композиция + Store.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'TimingExtension + Store',
      description:
        'Реализуй TimingExtension (BeforeEachCallback): в Store под Namespace("timing") клади startedAt. Тест с @ExtendWith читает значение и проверяет что оно > 0.',
      difficulty: 'hard',
      mode: 'junit',
      className: 'TimingExtensionTest',
      timeoutMs: 15000,
      starterCode: `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.*;
import static org.junit.jupiter.api.Assertions.*;

class TimingExtension implements BeforeEachCallback {
    static final ExtensionContext.Namespace NS =
        ExtensionContext.Namespace.create("timing");

    @Override
    public void beforeEach(ExtensionContext context) {
        // TODO: context.getStore(NS).put("startedAt", System.currentTimeMillis());
    }
}

@ExtendWith(TimingExtension.class)
public class TimingExtensionTest {
    @Test
    void storeHasStart(ExtensionContext context) {
        // TODO: Long started = context.getStore(TimingExtension.NS).get("startedAt", Long.class);
        // assertNotNull(started); assertTrue(started > 0);
    }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.*;
import static org.junit.jupiter.api.Assertions.*;

class TimingExtension implements BeforeEachCallback {
    static final ExtensionContext.Namespace NS =
        ExtensionContext.Namespace.create("timing");

    @Override
    public void beforeEach(ExtensionContext context) {
        context.getStore(NS).put("startedAt", System.currentTimeMillis());
    }
}

@ExtendWith(TimingExtension.class)
public class TimingExtensionTest {
    @Test
    void storeHasStart(ExtensionContext context) {
        Long started = context.getStore(TimingExtension.NS).get("startedAt", Long.class);
        assertNotNull(started);
        assertTrue(started > 0);
    }
}
`,
      hints: [
        'context.getStore(NS).put("startedAt", System.currentTimeMillis())',
        'get("startedAt", Long.class) + assertNotNull'
      ]
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

write('middle/m-invocation-interceptor.json', {
  id: 'm-invocation-interceptor',
  title: 'InvocationInterceptor vs BeforeEachCallback',
  summary: 'Когда нужно обернуть сам вызов теста — interceptor, не beforeEach.',
  theoryMarkdown: `# InvocationInterceptor

## BeforeEachCallback

Выполняется **до** тестового метода. Не оборачивает \`invoke\`.

## InvocationInterceptor

\`\`\`java
public void interceptTestMethod(Invocation<Void> invocation,
    ReflectiveInvocationContext<Method> ctx,
    ExtensionContext extensionContext) throws Throwable {
  // до
  invocation.proceed(); // сам тест
  // после
}
\`\`\`

Нужен для: timing вокруг метода, retry/wrap, подмена аргументов, security check.

## Почему не BeforeEach

BeforeEach не видит «внутри» вызова и не может решить, вызывать ли тест (\`proceed\`).
`,
  keyPoints: ['proceed() — сердце interceptor', 'BeforeEach ≠ wrap', 'Для retry/timing вокруг метода'],
  interviewTips: [
    'Почему InvocationInterceptor, а не BeforeEachCallback?',
    'Что будет если не вызвать proceed()?'
  ],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Чтобы обернуть сам вызов @Test, используй:',
      options: [
        'BeforeEachCallback',
        'InvocationInterceptor',
        'Only @BeforeAll',
        'Thread.sleep'
      ],
      correctIndexes: [1],
      explanation: 'Нужен wrap через proceed().',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'CountingInterceptor',
      description:
        'InvocationInterceptor: в interceptTestMethod увеличь CALLS и вызови proceed(). Тест проверяет CALLS==1 после прогона (см. starter).',
      difficulty: 'hard',
      mode: 'junit',
      className: 'CountingInterceptorTest',
      timeoutMs: 15000,
      starterCode: `import java.lang.reflect.Method;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.*;
import static org.junit.jupiter.api.Assertions.*;

class CountingInterceptor implements InvocationInterceptor {
    static final AtomicInteger CALLS = new AtomicInteger();

    @Override
    public void interceptTestMethod(Invocation<Void> invocation,
                                    ReflectiveInvocationContext<Method> invocationContext,
                                    ExtensionContext extensionContext) throws Throwable {
        // TODO: CALLS.incrementAndGet(); invocation.proceed();
    }
}

@ExtendWith(CountingInterceptor.class)
public class CountingInterceptorTest {
    @Test
    void countsProceed() {
        assertEquals(1, CountingInterceptor.CALLS.get());
    }
}
`,
      solutionCode: `import java.lang.reflect.Method;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.*;
import static org.junit.jupiter.api.Assertions.*;

class CountingInterceptor implements InvocationInterceptor {
    static final AtomicInteger CALLS = new AtomicInteger();

    @Override
    public void interceptTestMethod(Invocation<Void> invocation,
                                    ReflectiveInvocationContext<Method> invocationContext,
                                    ExtensionContext extensionContext) throws Throwable {
        CALLS.incrementAndGet();
        invocation.proceed();
    }
}

@ExtendWith(CountingInterceptor.class)
public class CountingInterceptorTest {
    @Test
    void countsProceed() {
        assertEquals(1, CountingInterceptor.CALLS.get());
    }
}
`,
      hints: [
        'CALLS.incrementAndGet() перед proceed',
        'invocation.proceed() обязателен'
      ]
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

write('middle/m-ra-filter.json', {
  id: 'm-ra-filter',
  title: 'Custom RestAssured Filter',
  summary: 'Filter: request-id, логирование, общие headers без копипасты.',
  theoryMarkdown: `# RestAssured Filter

\`\`\`java
Filter filter = (req, resp, ctx) -> {
  String id = UUID.randomUUID().toString();
  return ctx.next(req.header("X-Request-Id", id), resp);
};

given().filter(filter).when().get("/ping");
\`\`\`

## Зачем

- Correlation id для логов/трассировки
- Маскирование секретов в логе
- Метрики latency

Не логируй Authorization plaintext.
`,
  keyPoints: ['Filter + ctx.next', 'X-Request-Id', 'Не светить секреты'],
  interviewTips: ['Чем Filter отличается от Spec?', 'Как дебажишь цепочку фильтров?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Filter должен вызвать:',
      options: ['только return null', 'ctx.next(request, response)', 'System.exit', 'driver.quit'],
      correctIndexes: [1],
      explanation: 'Иначе цепочка оборвётся.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'RequestId Filter',
      description:
        'PingClient.ping(baseUrl): Filter добавляет X-Request-Id, кладёт id в IDS, GET /ping. Верни status code. Stub отвечает 200.',
      difficulty: 'hard',
      mode: 'http',
      className: 'PingClient',
      httpStubJson:
        '{"stubs":[{"status":200,"body":"{\\"ok\\":true}","headers":{"Content-Type":"application/json"},"times":2}]}',
      starterCode: `import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import io.restassured.filter.Filter;
import static io.restassured.RestAssured.*;

public class PingClient {
    public static final List<String> IDS = new CopyOnWriteArrayList<>();

    public int ping(String baseUrl) {
        // TODO Filter: UUID → IDS + header X-Request-Id; GET baseUrl+"/ping"; return status
        return 0;
    }
}
`,
      solutionCode: `import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import io.restassured.filter.Filter;
import static io.restassured.RestAssured.*;

public class PingClient {
    public static final List<String> IDS = new CopyOnWriteArrayList<>();

    public int ping(String baseUrl) {
        Filter filter = (req, resp, ctx) -> {
            String id = UUID.randomUUID().toString();
            IDS.add(id);
            return ctx.next(req.header("X-Request-Id", id), resp);
        };
        return given().filter(filter)
            .when().get(baseUrl + "/ping")
            .then().extract().statusCode();
    }
}
`,
      hints: [
        'Filter filter = (req, resp, ctx) -> { ... ctx.next(req.header(...), resp); }',
        'given().filter(filter).when().get(baseUrl + "/ping")'
      ],
      verifierCode: `import java.util.*;
import java.lang.reflect.Field;

public class ExerciseVerifier {
  public List<String> verify(Class<?> cls, String baseUrl) throws Exception {
    List<String> fails = new ArrayList<>();
    Object c = cls.getDeclaredConstructor().newInstance();
    Field ids = cls.getField("IDS");
    ((List<?>) ids.get(null)).clear();
    int code = (Integer) cls.getMethod("ping", String.class).invoke(c, baseUrl);
    if (code != 200) fails.add("status expected 200, got " + code);
    List<?> list = (List<?>) ids.get(null);
    if (list == null || list.isEmpty()) fails.add("IDS must contain generated request id");
    return fails;
  }
}`
    }
  ],
  levelId: 'middle',
  moduleId: 'api'
});

write('middle/m-api-clients.json', {
  id: 'm-api-clients',
  title: 'Организация API-тестов и Client Factory',
  summary: 'packages clients/specs/tests + фабрика клиентов по сервису.',
  theoryMarkdown: `# API test layout

Типичная структура:

\`\`\`
api/
  clients/     # UserClient, OrderClient
  specs/       # RequestSpecFactory
  tests/       # @Test классы
\`\`\`

## ApiClientFactory

\`\`\`java
String base = factory.forService("orders"); // https://orders...
\`\`\`

Один место для baseUrl/auth — меньше дублей, проще multi-service.
`,
  keyPoints: ['clients / specs / tests', 'Factory по имени сервиса', 'Specs отдельно от сценариев'],
  interviewTips: ['Как делишь клиенты по микросервисам?', 'Где живёт auth?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'baseUrl сервиса лучше брать из:',
      options: ['хардкода в каждом @Test', 'фабрики/конфига клиентов', 'CSS', 'скриншота'],
      correctIndexes: [1],
      explanation: 'Одна точка правды.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'ApiClientFactory.forService',
      description:
        'Factory с map users→http://users, orders→http://orders. forService(name) верни url или брось IllegalArgumentException.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'ApiClientFactoryTest',
      starterCode: `import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ApiClientFactory {
    private final Map<String, String> bases = Map.of(
        "users", "http://users",
        "orders", "http://orders"
    );

    String forService(String name) {
        // TODO
        return null;
    }
}

public class ApiClientFactoryTest {
    private final ApiClientFactory factory = new ApiClientFactory();

    @Test
    void known() { assertEquals("http://orders", factory.forService("orders")); }

    @Test
    void unknown() {
        assertThrows(IllegalArgumentException.class, () -> factory.forService("billing"));
    }
}
`,
      solutionCode: `import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ApiClientFactory {
    private final Map<String, String> bases = Map.of(
        "users", "http://users",
        "orders", "http://orders"
    );

    String forService(String name) {
        String url = bases.get(name);
        if (url == null) throw new IllegalArgumentException("unknown service: " + name);
        return url;
    }
}

public class ApiClientFactoryTest {
    private final ApiClientFactory factory = new ApiClientFactory();

    @Test
    void known() { assertEquals("http://orders", factory.forService("orders")); }

    @Test
    void unknown() {
        assertThrows(IllegalArgumentException.class, () -> factory.forService("billing"));
    }
}
`,
      hints: ['bases.get(name)', 'if null → throw IllegalArgumentException']
    }
  ],
  levelId: 'middle',
  moduleId: 'api'
});

write('senior/s-openapi-pitfalls.json', {
  id: 's-openapi-pitfalls',
  title: 'OpenAPI Generator: польза и боли',
  summary: 'Codegen ускоряет старт, но ломается на drift и кривых схемах.',
  theoryMarkdown: `# OpenAPI Generator

## Плюсы

- Быстрый клиент из спеки
- Меньше ручного DTO boilerplate

## Минусы / проблемы

- **Drift**: спека устарела → клиент врёт
- Сложные \`oneOf\`/nullable ломают модели
- Сгенерированный код трудно ревьюить
- Нужен **wrapper layer** + политика regenerate в CI

Не коммить generated «как есть» без правил команды.
`,
  keyPoints: ['Drift спеки', 'Wrapper над generated', 'Regenerate в CI'],
  interviewTips: ['Как ловишь рассинхрон контракта?', 'Когда лучше hand-written RestAssured?'],
  quiz: [
    {
      id: 'q1',
      type: 'multiple',
      question: 'Типичные боли OpenAPI Generator:',
      options: [
        'Спека и код разъезжаются',
        'Всегда быстрее UI E2E',
        'Сложные схемы → кривые модели',
        'Не нужен CI'
      ],
      correctIndexes: [0, 2],
      explanation: 'Drift и сложные схемы.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'Codegen policy YAML',
      description:
        'YAML: codegen_policy, regenerate_on_ci, wrapper_layer (строки/bool). Без password.',
      difficulty: 'medium',
      mode: 'artifact',
      artifactKind: 'gha',
      artifactRules: [
        'contains:codegen_policy',
        'contains:regenerate_on_ci',
        'contains:wrapper_layer',
        'noSecret:password'
      ],
      className: 'CodegenPolicy',
      starterCode: `# OpenAPI codegen policy\\n# TODO\\n`,
      solutionCode: `codegen_policy: generate-into-build-dir
regenerate_on_ci: true
wrapper_layer: hand-written clients over generated models
`,
      hints: ['codegen_policy:', 'regenerate_on_ci: true', 'wrapper_layer:']
    }
  ],
  levelId: 'senior',
  moduleId: 'advanced'
});

write('senior/s-swagger-coverage.json', {
  id: 's-swagger-coverage',
  title: 'Swagger / OpenAPI coverage',
  summary: 'Доля покрытых операций спеки — сигнал дыр в API-наборе.',
  theoryMarkdown: `# API coverage

\`\`\`
coverage% = hitOperations * 100 / declaredOperations
\`\`\`

Не заменяет контрактные/бизнес-тесты, но показывает **непокрытые paths**.

Инструменты: swagger-coverage, собственные отчёты из логов RestAssured.
`,
  keyPoints: ['hit / declared', 'Находит слепые зоны', 'Не единственная метрика качества'],
  interviewTips: ['100% coverage API = качество?', 'Как считаешь operation id?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Swagger coverage в первую очередь показывает:',
      options: ['FPS UI', 'какие операции спеки не бились тестами', 'цвет кнопки', 'heap dump'],
      correctIndexes: [1],
      explanation: 'Покрытие операций OpenAPI.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'Coverage.ratio',
      description:
        'Coverage.percent(declared, hit): целые проценты hit*100/declared; declared==0 → 0. Тесты готовы.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'CoverageTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Coverage {
    static int percent(int declared, int hit) {
        // TODO
        return -1;
    }
}

public class CoverageTest {
    @Test
    void half() { assertEquals(50, Coverage.percent(10, 5)); }
    @Test
    void emptySpec() { assertEquals(0, Coverage.percent(0, 0)); }
    @Test
    void full() { assertEquals(100, Coverage.percent(4, 4)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Coverage {
    static int percent(int declared, int hit) {
        if (declared == 0) return 0;
        return hit * 100 / declared;
    }
}

public class CoverageTest {
    @Test
    void half() { assertEquals(50, Coverage.percent(10, 5)); }
    @Test
    void emptySpec() { assertEquals(0, Coverage.percent(0, 0)); }
    @Test
    void full() { assertEquals(100, Coverage.percent(4, 4)); }
}
`,
      hints: ['if (declared == 0) return 0;', 'return hit * 100 / declared;']
    }
  ],
  levelId: 'senior',
  moduleId: 'advanced'
});

write('senior/s-async-messaging.json', {
  id: 's-async-messaging',
  title: 'Async / Kafka testing без брокера',
  summary: 'Стратегии проверки асинхронности: poll, outbox, contract — не только «поднять Kafka».',
  theoryMarkdown: `# Async testing

## Стратегии

1. **Testcontainers Kafka** — ближе к прод, тяжелее CI  
2. **Embedded / in-memory bus** — быстрые unit/integration  
3. **Contract + outbox table** — проверяешь запись события, не брокер  
4. **Await/poll** статуса/inbox до таймаута

## Риски

At-least-once → дубли; нужны идемпотентные consumers.

В этом lab — in-memory Inbox + poll until processed (как Awaitility).
`,
  keyPoints: ['Poll until condition', 'Outbox/contract без брокера', 'Идемпотентность'],
  interviewTips: ['Как тестируешь Kafka у себя?', 'Чем опасен sleep(5) в async тесте?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Вместо Thread.sleep в async-тесте лучше:',
      options: [
        'Увеличить sleep',
        'Poll/await условия с таймаутом',
        'Отключить тест',
        'Только UI'
      ],
      correctIndexes: [1],
      explanation: 'Ждём условие, не время.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'Inbox poll until processed',
      description:
        'Допиши Poller + тест: сообщение кладётся в Inbox асинхронно; await пока processed.',
      difficulty: 'hard',
      mode: 'junit',
      className: 'InboxPollTest',
      timeoutMs: 20000,
      starterCode: `import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Inbox {
    final AtomicBoolean processed = new AtomicBoolean(false);
    void offerAsync() {
        Thread t = new Thread(() -> {
            try { Thread.sleep(60); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            processed.set(true);
        });
        t.start();
    }
}

class Poller {
    static void awaitTrue(BooleanSupplier cond, long timeoutMs, long intervalMs) {
        // TODO same as awaitility lesson
        throw new UnsupportedOperationException("todo");
    }
}

public class InboxPollTest {
    @Test
    void waitsUntilProcessed() {
        Inbox inbox = new Inbox();
        inbox.offerAsync();
        Poller.awaitTrue(inbox.processed::get, 2000, 20);
        assertTrue(inbox.processed.get());
    }
}
`,
      solutionCode: `import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Inbox {
    final AtomicBoolean processed = new AtomicBoolean(false);
    void offerAsync() {
        Thread t = new Thread(() -> {
            try { Thread.sleep(60); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            processed.set(true);
        });
        t.start();
    }
}

class Poller {
    static void awaitTrue(BooleanSupplier cond, long timeoutMs, long intervalMs) {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            if (cond.getAsBoolean()) return;
            try { Thread.sleep(Math.max(1, intervalMs)); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("interrupted");
            }
        }
        if (cond.getAsBoolean()) return;
        throw new IllegalStateException("timeout");
    }
}

public class InboxPollTest {
    @Test
    void waitsUntilProcessed() {
        Inbox inbox = new Inbox();
        inbox.offerAsync();
        Poller.awaitTrue(inbox.processed::get, 2000, 20);
        assertTrue(inbox.processed.get());
    }
}
`,
      hints: [
        'deadline loop + sleep(interval)',
        'throw IllegalStateException("timeout")'
      ]
    }
  ],
  levelId: 'senior',
  moduleId: 'advanced'
});

write('middle/m-retry-policy.json', {
  id: 'm-retry-policy',
  title: 'Restart failed tests: rerun vs quarantine',
  summary: 'Surefire rerun — костыль; quarantine + fix flake — стратегия.',
  theoryMarkdown: `# Failed test restart

## Surefire

\`\`\`xml
<rerunFailingTestsCount>1</rerunFailingTestsCount>
\`\`\`

Помогает от шума, **маскирует** flaky.

## Лучше

1. Чинить причину (waits/data)
2. Quarantine \`@Tag("flaky")\` вне PR gate
3. Метрика flake rate

Retry budget: не бесконечно.
`,
  keyPoints: ['rerunFailingTestsCount', 'Quarantine flaky', 'Сначала root cause'],
  interviewTips: ['Сколько rerun допустимо в PR?', 'Как ведёшь quarantine list?'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Бесконечный rerun упавших в PR:',
      options: [
        'Лучшая практика',
        'Маскирует нестабильность',
        'Заменяет waits',
        'Обязателен JUnit'
      ],
      correctIndexes: [1],
      explanation: 'Скрывает flake.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'RetryBudget.allow',
      description:
        'RetryBudget.allow(failsSoFar, maxReruns): true пока failsSoFar < maxReruns.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'RetryBudgetTest',
      starterCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RetryBudget {
    static boolean allow(int failsSoFar, int maxReruns) {
        // TODO
        return false;
    }
}

public class RetryBudgetTest {
    @Test
    void underLimit() { assertTrue(RetryBudget.allow(0, 1)); }
    @Test
    void atLimit() { assertFalse(RetryBudget.allow(1, 1)); }
}
`,
      solutionCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RetryBudget {
    static boolean allow(int failsSoFar, int maxReruns) {
        return failsSoFar < maxReruns;
    }
}

public class RetryBudgetTest {
    @Test
    void underLimit() { assertTrue(RetryBudget.allow(0, 1)); }
    @Test
    void atLimit() { assertFalse(RetryBudget.allow(1, 1)); }
}
`,
      hints: ['return failsSoFar < maxReruns;']
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

write('middle/m-custom-assertj.json', {
  id: 'm-custom-assertj',
  title: 'Custom AssertJ asserts',
  summary: 'Доменные ассерты: читаемые проверки DTO/API без копипасты.',
  theoryMarkdown: `# Custom AssertJ

\`\`\`java
public class UserAssert extends AbstractAssert<UserAssert, User> {
  public UserAssert(User actual) { super(actual, UserAssert.class); }
  public static UserAssert assertThatUser(User u) { return new UserAssert(u); }
  public UserAssert hasAdultAge() {
    isNotNull();
    if (actual.age() < 18) failWithMessage("expected adult, was %s", actual.age());
    return this;
  }
}
\`\`\`

На собесе часто просят набросать такой assert live.
`,
  keyPoints: ['AbstractAssert', 'failWithMessage', 'Fluent return this'],
  interviewTips: ['Когда custom assert оправдан?', 'AssertJ vs своими assertEquals'],
  quiz: [
    {
      id: 'q1',
      type: 'single',
      question: 'Custom assert обычно наследуют от:',
      options: ['Object', 'AbstractAssert', 'WebDriver', 'Thread'],
      correctIndexes: [1],
      explanation: 'AssertJ AbstractAssert.',
      hint: null
    }
  ],
  exercises: [
    {
      id: 'e1',
      title: 'UserAssert.hasAdultAge',
      description:
        'record User(int age); UserAssert extends AbstractAssert с hasAdultAge(); тесты на adult/teen.',
      difficulty: 'hard',
      mode: 'junit',
      className: 'UserAssertTest',
      starterCode: `import org.assertj.core.api.AbstractAssert;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

record User(int age) {}

class UserAssert extends AbstractAssert<UserAssert, User> {
    UserAssert(User actual) { super(actual, UserAssert.class); }
    static UserAssert assertThatUser(User u) { return new UserAssert(u); }

    UserAssert hasAdultAge() {
        // TODO isNotNull(); if age < 18 failWithMessage(...); return this;
        return this;
    }
}

public class UserAssertTest {
    @Test
    void adultOk() {
        UserAssert.assertThatUser(new User(20)).hasAdultAge();
    }

    @Test
    void teenFails() {
        assertThrows(AssertionError.class,
            () -> UserAssert.assertThatUser(new User(16)).hasAdultAge());
    }
}
`,
      solutionCode: `import org.assertj.core.api.AbstractAssert;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

record User(int age) {}

class UserAssert extends AbstractAssert<UserAssert, User> {
    UserAssert(User actual) { super(actual, UserAssert.class); }
    static UserAssert assertThatUser(User u) { return new UserAssert(u); }

    UserAssert hasAdultAge() {
        isNotNull();
        if (actual.age() < 18) {
            failWithMessage("expected adult age (>=18) but was <%s>", actual.age());
        }
        return this;
    }
}

public class UserAssertTest {
    @Test
    void adultOk() {
        UserAssert.assertThatUser(new User(20)).hasAdultAge();
    }

    @Test
    void teenFails() {
        assertThrows(AssertionError.class,
            () -> UserAssert.assertThatUser(new User(16)).hasAdultAge());
    }
}
`,
      hints: [
        'isNotNull(); if (actual.age() < 18) failWithMessage(...)',
        'return this;'
      ]
    }
  ],
  levelId: 'middle',
  moduleId: 'quality'
});

// index.json
const indexPath = path.join(root, 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
function mod(levelId, moduleId) {
  return index.levels.find((l) => l.id === levelId).modules.find((m) => m.id === moduleId);
}
function add(module, lesson) {
  if (!module.lessons.some((l) => l.id === lesson.id)) module.lessons.push(lesson);
}

const api = mod('middle', 'api');
add(api, { id: 'm-ra-filter', title: 'Custom RestAssured Filter', file: 'middle/m-ra-filter.json', estimatedMinutes: 30 });
add(api, { id: 'm-api-clients', title: 'API clients & factory', file: 'middle/m-api-clients.json', estimatedMinutes: 25 });

const quality = mod('middle', 'quality');
add(quality, { id: 'm-junit-extensions', title: 'JUnit 5 Extensions', file: 'middle/m-junit-extensions.json', estimatedMinutes: 35 });
add(quality, { id: 'm-invocation-interceptor', title: 'InvocationInterceptor', file: 'middle/m-invocation-interceptor.json', estimatedMinutes: 30 });
add(quality, { id: 'm-retry-policy', title: 'Retry failed tests', file: 'middle/m-retry-policy.json', estimatedMinutes: 25 });
add(quality, { id: 'm-custom-assertj', title: 'Custom AssertJ', file: 'middle/m-custom-assertj.json', estimatedMinutes: 30 });

const advanced = mod('senior', 'advanced');
add(advanced, { id: 's-openapi-pitfalls', title: 'OpenAPI Generator pitfalls', file: 'senior/s-openapi-pitfalls.json', estimatedMinutes: 25 });
add(advanced, { id: 's-swagger-coverage', title: 'Swagger coverage', file: 'senior/s-swagger-coverage.json', estimatedMinutes: 25 });
add(advanced, { id: 's-async-messaging', title: 'Async/Kafka testing', file: 'senior/s-async-messaging.json', estimatedMinutes: 30 });

quality.description = 'Моки, BDD, Extensions, Filter/AssertJ, flaky, retry.';
api.description = 'RestAssured, JWT, Filter, clients/factory, MockMvc.';
advanced.description = 'Контракты, OpenAPI, coverage, async, perf, security, observability.';

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log('index updated');
