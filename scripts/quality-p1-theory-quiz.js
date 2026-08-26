/**
 * P1: expand theory (>=~450) and ensure >=2 quiz on critical thin lessons + m-capstone
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function save(rel, obj) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2) + '\n');
  console.log('saved', rel, 'theory', (obj.theoryMarkdown || '').length, 'quiz', (obj.quiz || []).length);
}

function q(id, question, options, correctIndexes, explanation, type = 'single') {
  return { id, type, question, options, correctIndexes, explanation, hint: null };
}

function ensureQuizMin2(lesson, extras) {
  const have = new Set((lesson.quiz || []).map((x) => x.id));
  for (const extra of extras) {
    if (!have.has(extra.id)) {
      lesson.quiz = lesson.quiz || [];
      lesson.quiz.push(extra);
      have.add(extra.id);
    }
  }
}

// ---------- JUNIOR ----------
{
  const l = load('junior/j-locators.json');
  l.theoryMarkdown = `# Локаторы

## Приоритет выбора

1. **data-testid / id** — стабильные, договорённость с фронтом
2. **CSS** — структура, атрибуты
3. **XPath** — текст, оси, сложные отношения
4. Хрупкие: абсолютный xpath, индексы \`div[3]\`, CSS-hash классы

## CSS

\`\`\`
#login
input[name='email']
.btn.primary
[data-testid='save']
\`\`\`

## XPath

\`\`\`
//button[normalize-space()='Submit']
//div[@class='row']//input
//*[contains(@class,'error')]
\`\`\`

## Плохие практики

- \`/html/body/div[3]/div[1]/...\`
- Локатор от позиции в списке без бизнес-смысла
- Завязка на динамические CSS-modules hash

На собесе говори: «сначала стабильный test id, xpath — когда нужен текст/ось».
`;
  ensureQuizMin2(l, [
    q('q2', 'Absolute XPath (/html/body/...) плох потому что:', [
      'Слишком быстрый',
      'Хрупкий к любым изменениям вёрстки',
      'Не поддерживается Selenium',
      'Запрещён в Java'
    ], [1], 'Малейшее изменение DOM ломает путь.')
  ]);
  save('junior/j-locators.json', l);
}

{
  const l = load('junior/j-waits.json');
  l.theoryMarkdown = `# Ожидания

## Implicit

Глобально на поиск элементов. Легко скрывает проблемы. Часто ставят \`0\` и живут на explicit.

## Explicit

\`\`\`java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.id("go")));
\`\`\`

## FluentWait

Кастомный polling и ignored exceptions — когда нужен тонкий контроль.

## Запрещено почти всегда

\`Thread.sleep(5000)\` — замедляет и флакает: жди **условие**, не время.

## Типичные условия

visibility, clickable, presence, urlContains, textToBePresent.

## Lab

FakeDriver умеет \`appearAfterMs\` — элемент появляется через N мс. Используй WebDriverWait.
`;
  ensureQuizMin2(l, [
    q('q2', 'Почему Thread.sleep плох в UI-тесте?', [
      'Он ускоряет тест',
      'Либо ждёт лишнее, либо не дожидается — и флакает',
      'Не компилируется',
      'Запрещён JDK'
    ], [1], 'Фиксированное время не равно условию готовности.')
  ]);
  save('junior/j-waits.json', l);
}

{
  const l = load('junior/j-pom-intro.json');
  ensureQuizMin2(l, [
    q('q2', 'Тест с POM должен выглядеть скорее как:', [
      'Цепочка findElement/css в @Test',
      'loginPage.loginAs(user, pass)',
      'Только Thread.sleep',
      'Прямые SQL в каждом шаге UI'
    ], [1], 'Бизнес-шаги, детали UI в page.')
  ]);
  // theory already long enough (~926)
  save('junior/j-pom-intro.json', l);
}

{
  const l = load('junior/j-streams.json');
  l.theoryMarkdown = `# Streams

Конвейер: source → intermediate ops → terminal op.

\`\`\`java
long visible = elements.stream()
    .filter(WebElement::isDisplayed)
    .count();
\`\`\`

## Ключевые операции

- Intermediate: filter, map, flatMap, distinct, sorted, peek
- Terminal: collect/toList, count, findFirst, anyMatch, reduce

## Важно

Streams **ленивые**: без terminal операции ничего не выполнится.  
Не переиспользуй один и тот же Stream — после terminal он «закрыт».

## В тестах

Удобно агрегировать списки текстов/атрибутов с страницы, фильтровать тестовые данные.
`;
  ensureQuizMin2(l, [
    q('q2', 'Можно ли повторно вызвать terminal op на том же Stream?', [
      'Да, всегда',
      'Нет, Stream одноразовый после terminal',
      'Только для map',
      'Только в parallel'
    ], [1], 'Нужен новый stream от источника.')
  ]);
  save('junior/j-streams.json', l);
}

{
  const l = load('junior/j-records-fixtures.json');
  l.theoryMarkdown = `# Records (Java 16+) как test data

\`\`\`java
public record UserFixture(String email, int age) {}
new UserFixture("a@b.c", 20);
\`\`\`

## Зачем в тестах

- Компактные **immutable** фикстуры
- \`equals\` / \`hashCode\` / \`toString\` из коробки
- Меньше boilerplate vs class с полями и геттерами

## Ограничения

- Не для stateful page objects
- Наследование record ограничено (не extends другой class)
- Для сложной логики — обычный class/builder

## Практика

Храни входные данные сценария в record; helper-методы (\`isAdult\`) — рядом в тесте или util.
`;
  ensureQuizMin2(l, [
    q('q2', 'Record лучше подходит для:', [
      'WebDriver holder с mutable state',
      'Неизменяемой тестовой фикстуры/DTO',
      'Замены JUnit',
      'CI pipeline'
    ], [1], 'Data carrier, не сервис с состоянием.')
  ]);
  save('junior/j-records-fixtures.json', l);
}

{
  const l = load('junior/j-strings.json');
  l.theoryMarkdown = `# Строки и регулярки

Полезные методы: \`contains\`, \`startsWith\`, \`trim\`, \`split\`, \`replace\`, \`formatted\`.

\`\`\`java
String price = el.getText().replace("₽", "").trim();
\`\`\`

## StringBuilder

Когда много конкатенаций в цикле — \`StringBuilder\` (String immutable).

## Регулярки

\`\`\`java
boolean ok = text.matches("Order #\\\\d+");
String digits = price.replaceAll("[^0-9]", "");
\`\`\`

В UI/API тестах часто вытаскиваешь числа из цен, кодов заказа, сообщений об ошибках.
`;
  ensureQuizMin2(l, [
    q('q2', 'Как безопаснее вытащить только цифры из "1 299 ₽"?', [
      'substring(0,1)',
      'replaceAll("[^0-9]", "") и проверить что не пусто',
      'split по пробелу и взять [0] без проверки',
      'игнорировать'
    ], [1], 'Убираем всё кроме цифр, потом parse.')
  ]);
  save('junior/j-strings.json', l);
}

// ---------- MIDDLE ----------
{
  const l = load('middle/m-capstone.json');
  l.theoryMarkdown = `# Capstone: одна история в трёх частях

Реальный флоу заказа в пирамиде:

1. **UI (POM)** — login / smoke видимости (дорого, мало)
2. **API (RestAssured)** — создать заказ / подготовить данные (быстро, стабильно)
3. **JUnit** — оркестратор: связать шаги и ассерты

## Порядок

Сначала **API data setup**, потом UI проверка (если нужна), затем assert статуса.  
Не плоди E2E «всё кликами» — UI для критичного пути, данные через API.

## Критерии готовности lab

- POM не светит CSS в тесте
- API-клиент возвращает id/status
- JUnit проверяет связку ожиданий

Это три упражнения одного сценария, не три разных курса.
`;
  ensureQuizMin2(l, [
    q('q2', 'Оптимальный порядок в UI+API сценарии заказа:', [
      'Только UI клики от регистрации до оплаты',
      'API создаёт данные → UI smoke при необходимости → assert',
      'Сначала sleep(10), потом всё подряд',
      'Только SQL в @Test без API'
    ], [1], 'Данные через API, UI точечно.')
  ]);
  save('middle/m-capstone.json', l);
}

{
  const l = load('middle/m-test-config.json');
  l.theoryMarkdown = `# Конфиг тестов: env / properties

## Откуда брать baseUrl

1. System property (\`-DbaseUrl=\`)
2. Environment variable (\`BASE_URL\`)
3. Безопасный default для local (\`http://localhost:8080\`)

## Правила

- Секреты — только credentials CI / vault, **не в git**
- Разные профили: local / ci / stage
- Один модуль \`Config\` / \`Env\` — точка правды

## Anti-patterns

Хардкод URL в каждом \`@Test\`; пароли в репозитории; разные «магические» константы по файлам.
`;
  ensureQuizMin2(l, [
    q('q2', 'Пароль к stage в автотестах лучше:', [
      'Закоммитить в Config.java',
      'Взять из CI credentials / env',
      'Написать в README',
      'Захардкодить в CSS'
    ], [1], 'Секреты вне git.')
  ]);
  save('middle/m-test-config.json', l);
}

{
  const l = load('middle/m-junit-params.json');
  l.theoryMarkdown = `# @ParameterizedTest

Один тест — много входных данных. Меньше копипасты, яснее матрица кейсов.

\`\`\`java
@ParameterizedTest
@CsvSource({"secret12,true", "ab1,false"})
void password(String p, boolean ok) {
  assertEquals(ok, rule.isValid(p));
}
\`\`\`

## Источники

- \`@ValueSource\` — простой список
- \`@CsvSource\` / \`@CsvFileSource\` — таблица
- \`@MethodSource\` — фабрика аргументов

## Когда не надо

Сложный сценарий с разными шагами — лучше отдельные \`@Test\` или кумулятивный soft-assert, а не гигантский csv.
`;
  ensureQuizMin2(l, [
    q('q2', '@CsvSource удобен когда:', [
      'Нужен браузер CDP',
      'Много пар вход→ожидание в одном сценарии проверки',
      'Пишешь Dockerfile',
      'Только UI PageFactory'
    ], [1], 'Таблица данных для одной логики.')
  ]);
  save('middle/m-junit-params.json', l);
}

{
  const l = load('middle/m-jwt-auth.json');
  l.theoryMarkdown = `# JWT / Bearer в API-тестах

## Как слать токен

\`\`\`java
given()
  .header("Authorization", "Bearer " + token)
  .when().get("/secure");
\`\`\`

## Негативы (обязательны)

- Без токена / пустой → обычно **401**
- Протухший / чужая подпись → **401**
- Валидный токен, нет роли → **403**

## Практика

Выноси получение токена в \`AuthClient\` / spec; не копируй header в каждый тест. В параллели — токен на поток или короткоживущий per-test.
`;
  ensureQuizMin2(l, [
    q('q2', 'Валидный JWT без нужной роли чаще даёт:', [
      '200',
      '403 Forbidden',
      '301',
      '301'
    ], [1], 'AuthN ок, AuthZ нет → 403.')
  ]);
  save('middle/m-jwt-auth.json', l);
}

{
  const l = load('middle/m-json-schema.json');
  l.theoryMarkdown = `# JSON Schema в API-тестах

Проверяешь **форму** ответа: обязательные поля, типы, enums — не только status code.

\`\`\`java
.then().body(matchesJsonSchemaInClasspath("schemas/order.json"));
\`\`\`

## Зачем

Ловит ломающие контракт изменения раньше UI. Дополняет, не заменяет бизнес-ассерты (цена, статус заказа).

## Ограничения

Слишком жёсткая схема флакает на эволюцию API; держи schema рядом с контрактом/версией.
`;
  ensureQuizMin2(l, [
    q('q2', 'JSON Schema в первую очередь проверяет:', [
      'Цвет кнопки',
      'Структуру/типы JSON-контракта',
      'Скорость Chrome',
      'Только HTTP 500'
    ], [1], 'Форма ответа, не весь бизнес.')
  ]);
  save('middle/m-json-schema.json', l);
}

{
  const l = load('middle/m-allure.json');
  l.theoryMarkdown = `# Allure: отчёты для разбора CI

## Зачем

Шаги, вложения (скрин, request/response), история падений. Ускоряет triage.

## База

- Аннотации \`@Epic\` / \`@Feature\` / \`@Story\`
- \`Allure.step\` / \`@Step\`
- Attachments: не клади секреты (токены, пароли)

## Связь с CI

Генерируй отчёт в post-action; храни артефакты job. Без Allure тоже можно — но единообразие шагов экономит время команды.
`;
  ensureQuizMin2(l, [
    q('q2', 'В Allure attachment нельзя класть:', [
      'Скриншрут падения',
      'Authorization Bearer plaintext',
      'Текст ошибки assert',
      'Имя теста'
    ], [1], 'Секреты маскируй.')
  ]);
  save('middle/m-allure.json', l);
}

{
  const l = load('middle/m-allure-steps.json');
  l.theoryMarkdown = `# Allure steps vs отчёт целиком

Этот урок — про **гранулярность шагов**:

- \`@Step("Login as {user}")\` на page/flow методах
- Вложенные steps для API given/when/then

\`m-allure\` — зачем отчёт и вложения; здесь — как резать шаги, чтобы в CI было читаемо.

Не дублируй один и тот же step на каждый findElement — шаг = бизнес-действие.
`;
  ensureQuizMin2(l, [
    q('q2', 'Хороший @Step обычно описывает:', [
      'Каждый CSS-селектор',
      'Бизнес-действие (login, createOrder)',
      'Имя JDK',
      'Цвет кнопки'
    ], [1], 'Читаемый сценарий в отчёте.')
  ]);
  save('middle/m-allure-steps.json', l);
}

{
  const l = load('middle/m-retry-policy.json');
  l.theoryMarkdown = `# Restart failed tests: rerun vs quarantine

## Surefire

\`\`\`xml
<rerunFailingTestsCount>1</rerunFailingTestsCount>
\`\`\`

Помогает от шума CI, но **маскирует** flaky.

## Стратегия

1. Чинить причину (waits/data/isolation)
2. Quarantine \`@Tag("flaky")\` вне PR gate
3. Метрика flake rate + владелец

## Retry budget

Ограниченный budget (1 rerun) ок как временная мера. Бесконечный rerun в PR — anti-pattern.
`;
  ensureQuizMin2(l, [
    q('q2', 'Quarantine flaky теста значит:', [
      'Удалить навсегда без тикета',
      'Вынести из PR gate, чинить отдельно с метрикой',
      'Увеличить sleep до 60с',
      'Отключить CI'
    ], [1], 'Не маскируй — изолируй и чини.')
  ]);
  save('middle/m-retry-policy.json', l);
}

// ---------- SENIOR ----------
{
  const l = load('senior/s-swagger-coverage.json');
  l.theoryMarkdown = `# Swagger / OpenAPI coverage

\`\`\`
coverage% = hitOperations * 100 / declaredOperations
\`\`\`

## Что даёт

Видишь **непокрытые paths/operationId** — слепые зоны API-набора.

## Чего не даёт

Не заменяет контрактные и бизнес-ассерты. 100% coverage операций ≠ качество продукта.

## Практика

Собирай hit из логов RestAssured / proxy; сравнивай со спекой. Смотри новые endpoints в PR.
`;
  ensureQuizMin2(l, [
    q('q2', '100% OpenAPI operation coverage значит:', [
      'Продукт без багов',
      'Все объявленные операции хоть раз дергались тестами — не гарантия бизнес-качества',
      'UI покрыт',
      'Можно отключить ассерты'
    ], [1], 'Метрика дыр, не качества.')
  ]);
  save('senior/s-swagger-coverage.json', l);
}

{
  const l = load('senior/s-observability.json');
  l.theoryMarkdown = `# Observability для QA

## Три столпа

- **Logs** — корреляция request-id
- **Metrics** — latency, error rate, flake
- **Traces** — путь запроса по сервисам

## Зачем тестировщику

Падение в CI без trace/log — долгое гадание. В API-тестах прокидывай \`X-Request-Id\`; в отчётах прикладывай id.

## Связь с автотестами

Не путай «тест зелёный» и «система здорова»: смотри алерты и SLI вместе с регрессом.
`;
  ensureQuizMin2(l, [
    q('q2', 'X-Request-Id в API-тестах помогает:', [
      'Ускорить Chrome',
      'Связать падение теста с логами/трейсами сервиса',
      'Заменить ассерты',
      'Отключить JWT'
    ], [1], 'Корреляция разбора.')
  ]);
  save('senior/s-observability.json', l);
}

{
  const l = load('senior/s-openapi-pitfalls.json');
  l.theoryMarkdown = `# OpenAPI Generator: грабли

## Типичные проблемы

- **Drift**: спека в git ≠ реальный API
- Кривые \`oneOf\` / nullable модели
- Шумный review огромных generated diff
- Коммит generated без политики → вечный merge hell

## Политика

1. \`codegen_policy\` — когда и как генерим
2. \`regenerate_on_ci\` — проверка актуальности
3. \`wrapper_layer\` — свои клиенты поверх generated

Не тащи сырой generated в бизнес-тесты без обёртки.
`;
  ensureQuizMin2(l, [
    q('q2', 'Generated клиенты лучше:', [
      'Править руками в каждом PR',
      'Обернуть тонким wrapper и регенерировать по политике',
      'Хранить только локально у одного разработчика',
      'Удалить OpenAPI'
    ], [1], 'Wrapper + CI policy.')
  ]);
  save('senior/s-openapi-pitfalls.json', l);
}

{
  const l = load('senior/s-pyramid.json');
  l.theoryMarkdown = `# Пирамида тестирования

Много быстрых unit/API, мало тяжёлого UI. UI — критические пользовательские пути.

## Как применять

- Бизнес-правила и расчёты → unit/API
- Контракты на границах сервисов → contract
- UI smoke / critical journey → немного E2E

## Anti-pattern

Перевернутая пирамида: всё через UI → медленно, flaky, дорого чинить.

На собесе: «сдвигаем влево», цифры времени feedback и flake.
`;
  ensureQuizMin2(l, [
    q('q2', 'Перевернутая пирамида — это когда:', [
      'Много unit, мало UI',
      'Почти всё покрыто тяжёлым UI E2E',
      'Нет тестов',
      'Только lint'
    ], [1], 'Дорого и хрупко.')
  ]);
  save('senior/s-pyramid.json', l);
}

{
  const l = load('senior/s-codereview.json');
  l.theoryMarkdown = `# Code review автотестов

## Смотри

- Ценность сценария (не дубль)
- Стабильность: waits без sleep, изоляция данных
- Ассерты по делу (не только status 200)
- Секреты, хардкод env
- Время CI / параллель

## Legacy

STAR: боль → strangler (новый слой рядом) → метрики → выпил старого. Не rewrite overnight.

## Тон

Ревью про качество сигнала, не про стиль ради стиля.
`;
  ensureQuizMin2(l, [
    q('q2', 'В review автотеста red flag:', [
      'Явный WebDriverWait',
      'Thread.sleep без причины и секрет в коде',
      'Page Object',
      'AssertJ'
    ], [1], 'Sleep и секреты.')
  ]);
  save('senior/s-codereview.json', l);
}

{
  const l = load('senior/s-jenkinsfile.json');
  l.theoryMarkdown = `# Jenkinsfile (Declarative) для тестов

\`\`\`groovy
pipeline {
  agent any
  stages {
    stage('Test') { steps { sh 'mvn -B test' } }
  }
  post {
    always { junit '**/surefire-reports/*.xml' }
  }
}
\`\`\`

## Важно

- Credentials через Jenkins credentials, не plaintext
- \`post\` — отчёты always
- Разделяй smoke (PR) и полный регресс (nightly)

Lab: собери валидный declarative skeleton с stages/post/junit.
`;
  ensureQuizMin2(l, [
    q('q2', 'junit-отчёт в Jenkinsfile обычно в:', [
      'agent only',
      'post { always { junit ... } }',
      'options { skipDefaultCheckout() } только',
      'tools { nodejs }'
    ], [1], 'Сбор артефактов после stages.')
  ]);
  save('senior/s-jenkinsfile.json', l);
}

console.log('P1 quiz-theory done');
