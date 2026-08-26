(() => {
  const questions = [
    { level: 'junior', hot: true, lessonId: 'j-types', q: 'Чем отличается == от equals() в Java?', a: '== сравнивает ссылки (для примитивов — значения). equals() сравнивает содержимое объектов, если метод переопределён (как в String).' },
    { level: 'junior', lessonId: 'j-types', q: 'Что такое JVM, JRE и JDK?', a: 'JDK — инструменты разработки (компилятор + JRE). JRE — среда выполнения (JVM + библиотеки). JVM — виртуальная машина, исполняет bytecode.' },
    { level: 'junior', hot: true, lessonId: 'j-locators', q: 'Какие типы локаторов Selenium знаешь и какой приоритет выбора?', a: 'id, name, css, xpath, linkText, partialLinkText, className, tagName. Предпочтительно: data-testid/id → css → xpath (для сложных структур/текста).' },
    { level: 'junior', hot: true, lessonId: 'j-waits', q: 'Зачем нужны явные ожидания (WebDriverWait)?', a: 'Чтобы ждать условие (видимость, кликабельность), а не фиксированный Thread.sleep. Снижают флаки и ускоряют тесты.' },
    { level: 'junior', hot: true, lessonId: 'j-pom-intro', q: 'Что такое Page Object Model?', a: 'Паттерн: страница/компонент = класс с локаторами и действиями. Тесты читают бизнес-шаги, UI-детали инкапсулированы.' },
    { level: 'junior', hot: true, lessonId: 'j-junit', q: 'Разница @BeforeEach и @BeforeAll в JUnit 5?', a: '@BeforeEach — перед каждым тестом. @BeforeAll — один раз на класс (метод static, если нет TestInstance.PER_CLASS).' },
    { level: 'junior', lessonId: 'j-exceptions', q: 'Что такое checked и unchecked исключения?', a: 'Checked (Exception) — надо объявить/обработать. Unchecked (RuntimeException) — необязательно. Error — серьёзные сбои JVM.' },
    { level: 'junior', lessonId: 'j-collections', q: 'List vs Set vs Map?', a: 'List — упорядоченная коллекция с дубликатами. Set — уникальные элементы. Map — ключ→значение.' },
    { level: 'junior', lessonId: 'j-maven', q: 'Что такое Maven lifecycle?', a: 'Фазы: validate → compile → test → package → verify → install → deploy. Плагины привязываются к фазам.' },
    { level: 'junior', hot: true, lessonId: 'j-assertions', q: 'assertEquals vs assertThat (AssertJ)?', a: 'assertEquals — классика JUnit. AssertJ даёт fluent API: assertThat(x).isEqualTo(y) — читаемее и информативнее.' },
    { level: 'junior', lessonId: 'j-selenium4', q: 'Что нового в Selenium 4, о чём спросить на интервью?', a: 'W3C WebDriver, relative locators, обновлённый Grid (Router/Distributor/Nodes), CDP/BiDi для advanced сценариев.' },
    { level: 'junior', lessonId: 'j-testng-vs-junit', q: 'TestNG или JUnit 5 — что выбрать в 2026?', a: 'Новые проекты чаще JUnit 5. TestNG — если уже suite XML/сложная параллель. Решение по контексту команды, не по моде.' },
    { level: 'junior', hot: true, lessonId: 'j-selenium-intro', q: 'close vs quit?', a: 'close закрывает вкладку/окно. quit завершает сессию WebDriver и связанные процессы.' },
    { level: 'middle', hot: true, lessonId: 'm-parallel', q: 'Как работает ThreadLocal WebDriver в параллели?', a: 'Каждый поток хранит свой экземпляр драйвера в ThreadLocal, чтобы тесты не делили сессию браузера.' },
    { level: 'middle', hot: true, lessonId: 'm-restassured', q: 'Как тестировать REST API через RestAssured?', a: 'given() (headers/body/auth) → when() (method/url) → then() (status/body/jsonPath). Выносить Request/Response specs.' },
    { level: 'middle', hot: true, lessonId: 'm-restassured-deep', q: 'Чем 401 отличается от 403?', a: '401 — не аутентифицирован (нет/битый токен). 403 — аутентифицирован, но нет прав (authorization).' },
    { level: 'middle', lessonId: 'm-restassured-deep', q: 'Зачем RequestSpecification?', a: 'Общие baseUri, headers, auth, content-type — без копипасты в каждом тесте.' },
    { level: 'middle', hot: true, lessonId: 'm-flaky', q: 'Что такое flaky test и как бороться?', a: 'Нестабильный тест. Причины: waits, данные, порядок, время, сеть. Фикс: стабильные ожидания, изоляция данных; ретраи — временная мера.' },
    { level: 'middle', hot: true, lessonId: 'm-stale-flaky', q: 'Что значит StaleElementReferenceException?', a: 'Элемент был найден, но DOM обновился — ссылка протухла. Не кэшируй WebElement надолго, делай refetch и жди стабильности.' },
    { level: 'middle', lessonId: 'm-allure', q: 'Зачем Allure/отчёты?', a: 'Трассировка шагов, вложения (скрин/лог/request), история падений. Ускоряют разбор CI-фейлов. Секреты маскируй.' },
    { level: 'middle', lessonId: 'm-cucumber', q: 'Cucumber: плюсы и минусы?', a: 'Плюсы: общий язык с бизнесом. Минусы: оверхед, плохие сценарии. Имеет смысл при живом BDD-процессе.' },
    { level: 'middle', lessonId: 'm-testdata', q: 'Как организовать тестовые данные?', a: 'Фабрики/билдеры, API setup/cleanup, уникальные данные (UUID), env-конфиги, независимость тестов.' },
    { level: 'middle', lessonId: 'm-mockito', q: 'Mockito: when/verify?', a: 'when — stub поведения. verify — проверяет взаимодействие. В E2E не мокай WebDriver.' },
    { level: 'middle', lessonId: 'm-selenide', q: 'Selenide vs Selenium?', a: 'Selenide — concise API и автоожидания поверх Selenium. Всё равно нужно понимать WebDriver.' },
    { level: 'senior', lessonId: 's-framework', q: 'Как спроектировать тестовый фреймворк с нуля?', a: 'Слои: tests → steps/pages → core (driver/http) → config/reporting. Параллель by design, CI-first, smoke отдельно.' },
    { level: 'senior', lessonId: 's-pyramid', q: 'Пирамида тестирования — как применяешь?', a: 'Много unit/API, мало тяжёлого UI. UI — критические пути. Сдвиг влево.' },
    { level: 'senior', lessonId: 's-jenkins', q: 'Jenkins pipeline: agent, stages, post?', a: 'agent — где бежит. stages — этапы. post — always/success/failure (отчёты). Credentials для секретов.' },
    { level: 'senior', hot: true, lessonId: 's-github-actions', q: 'Минимальный GitHub Actions для Maven-тестов?', a: 'on PR → checkout → setup-java (cache maven) → mvn test → upload surefire/allure artifacts.' },
    { level: 'senior', lessonId: 's-docker', q: 'Как Docker помогает автотестам?', a: 'Воспроизводимое окружение, Grid/браузеры, сервисы-зависимости, одинаковый JDK. Меньше «у меня работает».' },
    { level: 'senior', lessonId: 's-testcontainers', q: 'Зачем Testcontainers?', a: 'Реальные зависимости (БД и др.) в Docker на время теста — изоляция без shared stage. Нужен Docker; слой integration.' },
    { level: 'senior', lessonId: 's-compose-grid', q: 'Selenium Grid vs облако (BrowserStack)?', a: 'Grid — контроль/compliance on-prem. Облако — масштаб устройств, меньше ops. Выбор: compliance, бюджет, объём.' },
    { level: 'senior', lessonId: 's-cloud-grid', q: 'Когда НЕ брать публичный cloud grid?', a: 'Строгий compliance/данные не должны уходить наружу → private grid / on-prem.' },
    { level: 'senior', lessonId: 's-playwright-java', q: 'Когда смотреть на Playwright вместо Selenium?', a: 'Greenfield UI, нужны traces/auto-wait/network из коробки. Зрелый Selenium — эволюционируй, не переписывай ради хайпа.' },
    { level: 'senior', lessonId: 's-codereview', q: 'На что смотришь в code review автотестов?', a: 'Стабильность, ценность, waits без sleep, данные, ассерты по делу, секреты, время CI.' },
    { level: 'senior', lessonId: 's-metrics', q: 'Как измерять эффективность автотестов?', a: 'Time to feedback, flake rate, сигнал критичного набора, MTTR разбора, риск-покрытие — не только число тестов.' },
    { level: 'senior', lessonId: 's-contract', q: 'Контрактное тестирование — идея?', a: 'Проверка соглашения consumer/provider без полного E2E. Ловит ломающие API-изменения раньше.' },
    { level: 'senior', hot: true, lessonId: 's-interview-soft', q: 'Как структурировать Senior-ответ?', a: 'Контекст → проблема → варианты/trade-offs → решение → эффект с метрикой (STAR).' },
    { level: 'junior', hot: true, lessonId: 'j-locators', q: '[Live coding] By для кнопки с data-testid=\"save\".', a: 'By.cssSelector("[data-testid=\'save\']") или By.xpath("//*[@data-testid=\'save\']"). Предпочтительнее testid/css.' },
    { level: 'junior', lessonId: 'j-selenium-intro', q: '[Live coding] Открой URL, проверь title, quit.', a: 'driver.get(url); assert title; driver.quit() в finally/afterEach.' },
    { level: 'junior', lessonId: 'j-junit', q: '[Live coding] 3 @Test на PasswordRule isValid.', a: 'assertTrue валидный; assertFalse короткий; assertFalse без цифры. Или @ParameterizedTest.' },
    { level: 'junior', lessonId: 'j-assertions', q: '[Live coding] AssertJ: список содержит \"ok\".', a: 'assertThat(list).contains(\"ok\"); или hasSize / extracting.' },
    { level: 'junior', hot: true, lessonId: 'j-pom-intro', q: '[Live coding] Напиши LoginPage с By и методом loginAs.', a: 'Класс с private By + конструктор WebDriver + sendKeys/click; верни следующую page или welcome text. Локаторы не в тесте.' },
    { level: 'junior', hot: true, lessonId: 'j-waits', q: '[Live coding] Замени Thread.sleep на WebDriverWait.', a: 'new WebDriverWait(driver, Duration.ofSeconds(n)).until(ExpectedConditions.visibilityOfElementLocated(by)).' },
    { level: 'junior', hot: true, lessonId: 'j-waits', q: 'Implicit vs Explicit vs Fluent wait?', a: 'Implicit — глобальный poll для findElement. Explicit — конкретное условие. Fluent — explicit с кастомным polling/ignoring. Лучше explicit.' },
    { level: 'middle', hot: true, lessonId: 'm-restassured', q: '[Live coding] given-when-then: POST /login и достань token.', a: 'given().contentType(JSON).body(...).when().post(url).then().statusCode(200).extract().path("token").' },
    { level: 'middle', lessonId: 'm-restassured-deep', q: '[Live coding] Вынеси RequestSpec с baseUri и Bearer.', a: 'new RequestSpecBuilder().setBaseUri(...).addHeader("Authorization","Bearer "+t).build(); given().spec(spec)...' },
    { level: 'middle', lessonId: 'm-parallel', q: '[Live coding] ThreadLocal DriverHolder set/get/clear.', a: 'private static final ThreadLocal<WebDriver> TL=...; set/get/remove в afterEach.' },
    { level: 'middle', lessonId: 'm-mockito', q: '[Live coding] mock Gateway, stub charge, verify.', a: 'Gateway g=mock(...); when(g.charge(10)).thenReturn("OK"); verify(g).charge(10);' },
    { level: 'middle', lessonId: 'm-mockmvc', q: '[Live coding] MockMvc GET /health → 200 UP.', a: 'mockMvc.perform(get("/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));' },
    { level: 'middle', hot: true, lessonId: 'm-soft-assert', q: '[Live coding] Soft assert двух полей формы.', a: 'softly.assertThat(a).isEqualTo(...); softly.assertThat(b)...; softly.assertAll();' },
    { level: 'senior', lessonId: 's-jenkins', q: '[Live coding] Набросай Declarative Jenkinsfile для mvn test + junit.', a: 'pipeline { agent any; stages { stage Test { sh mvn test } }; post { always { junit ... } } }.' },
    { level: 'senior', lessonId: 's-docker', q: '[Live coding] Dockerfile: кэш Maven deps.', a: 'FROM maven…; COPY pom.xml; RUN dependency:go-offline; COPY src; RUN package/test.' },
    { level: 'senior', lessonId: 's-github-actions', q: '[Live coding] Минимальный workflow YAML.', a: 'on: pull_request; jobs.test.runs-on; steps: checkout, setup-java cache maven, run mvn test.' },
    { level: 'senior', lessonId: 's-compose-grid', q: '[Live coding] compose: selenium hub + chrome node.', a: 'services: selenium-hub (image selenium/hub), chrome (depends_on hub, SE_EVENT_BUS_HOST).' },
    { level: 'senior', lessonId: 's-contract', q: '[Live coding] RestAssured: required field version major.', a: 'then().statusCode(200).body("version", startsWith("2.")); или jsonPath + assert.' },
    { level: 'middle', hot: true, lessonId: 'm-jwt-auth', q: 'Как проверить API с Bearer JWT?', a: 'given().header("Authorization","Bearer "+token).when().get(...).then().statusCode(...). Отдельно негативы: без токена 401, без роли 403.' },
    { level: 'middle', lessonId: 'm-jwt-auth', q: '[Live coding] GET /secure с Bearer.', a: 'given().header("Authorization","Bearer "+t).when().get(base+"/secure").then().extract().statusCode();' },
    { level: 'middle', lessonId: 'm-junit-params', q: 'Зачем @ParameterizedTest?', a: 'Один тест — много входных данных (@CsvSource/@MethodSource), меньше копипасты и яснее матрица кейсов.' },
    { level: 'middle', lessonId: 'm-junit-params', q: '[Live coding] CsvSource для password valid/invalid.', a: '@ParameterizedTest @CsvSource({"secret12,true","ab1,false"}) void t(String p, boolean ok){ assertEquals(ok, rule.isValid(p)); }' },
    { level: 'middle', lessonId: 'm-test-config', q: 'Откуда брать baseUrl в тестах?', a: 'System property / env с безопасным default для local. Секреты — только credentials CI, не в git.' },
    { level: 'junior', lessonId: 'j-records-fixtures', q: 'Зачем record в тестах?', a: 'Компактные immutable фикстуры с equals/toString. Удобно для тестовых данных без boilerplate.' },
    { level: 'middle', lessonId: 'm-flaky', q: 'STAR: разбор flaky в CI.', a: 'Situation: flake 8% на waits. Task: снизить. Action: явные waits, изоляция данных, quarantine. Result: flake <2%, feedback минус 15 мин.' },
    { level: 'junior', lessonId: 'j-selenium4', q: 'Когда нужен CDP/BiDi, а когда нет?', a: 'Нужен для network interception, console, advanced browser hooks. Для обычного UI CRUD — classic WebDriver/waits достаточно.' },
    { level: 'senior', lessonId: 's-playwright-java', q: 'Политика migrate Selenium→Playwright?', a: 'Не big-bang: greenfield и болевые пути сначала, общий reporting/CI, измерить flake и время.' },
    { level: 'senior', lessonId: 's-interview-soft', q: 'Как за 60 секунд рассказать стек проекта?', a: 'Слои: язык/билд → тест-фреймворк (JUnit/RA/Selenium) → отчёты → CI. 1–2 бизнес-домена и где твоя зона ответственности.' },
    { level: 'senior', lessonId: 's-interview-soft', q: 'Как описать состав команды и владение качеством?', a: 'Кто пишет автотесты (QA Auto/devs), кто ревьюит, кто чинит flake, как связаны с backend/frontend. Избегай «у нас все тестируют всё» без ясности.' },
    { level: 'senior', lessonId: 's-interview-soft', q: 'Зачем Tech Talks в команде тестирования?', a: 'Делишься паттернами (Extension, Filter, flake triage), выравниваешь уровень, снижаешь bus factor. Короткий формат + пример из репо.' },
    { level: 'senior', lessonId: 's-codereview', q: 'Как рефакторишь легаси автотесты?', a: 'STAR: боль (время/flake) → strangler (новый слой рядом) → метрики (flake%, feedback) → выпил старого. Не rewrite overnight.' },
    { level: 'middle', lessonId: 'm-junit-extensions', q: 'Extension vs BaseTest — что выбрать?', a: 'Extension — композиция (@ExtendWith), подключаешь точечно. BaseTest — наследование, быстро плодит God-parent. Store/Namespace для данных расширения.' },
    { level: 'middle', lessonId: 'm-junit-extensions', q: 'Что такое Store и Namespace в JUnit 5?', a: 'Store — map в ExtensionContext. Namespace изолирует ключи разных расширений, чтобы не затирали чужие данные.' },
    { level: 'middle', lessonId: 'm-junit-extensions', q: '[Live coding] BeforeEachCallback кладёт startedAt в Store.', a: 'Namespace.create("timing"); context.getStore(NS).put("startedAt", System.currentTimeMillis()); helper читает get("startedAt", Long.class).' },
    { level: 'middle', lessonId: 'm-invocation-interceptor', q: 'Почему InvocationInterceptor, а не BeforeEachCallback?', a: 'Interceptor оборачивает invokeTestMethod через proceed() — timing/retry/wrap. BeforeEach только «до», без контроля вызова.' },
    { level: 'middle', lessonId: 'm-invocation-interceptor', q: '[Live coding] Interceptor считает proceed().', a: 'interceptTestMethod: counter++; invocation.proceed();' },
    { level: 'middle', lessonId: 'm-ra-filter', q: 'Зачем custom RestAssured Filter?', a: 'Общий request-id, логирование без секретов, метрики. ctx.next(req.header(...), resp).' },
    { level: 'middle', lessonId: 'm-ra-filter', q: '[Live coding] Filter с X-Request-Id.', a: 'req.header("X-Request-Id", id); return ctx.next(req, resp); then given().filter(f)...' },
    { level: 'middle', lessonId: 'm-api-clients', q: 'Как организуешь API-тесты в проекте?', a: 'packages: clients / specs / tests; ApiClientFactory для baseUrl/auth по сервису; сценарии без хардкода URL.' },
    { level: 'senior', lessonId: 's-openapi-pitfalls', q: 'Проблемы OpenAPI Generator?', a: 'Drift спеки, кривые oneOf/nullable модели, шумный review. Нужны wrapper + regenerate в CI + контрактные проверки.' },
    { level: 'senior', lessonId: 's-swagger-coverage', q: 'Что даёт Swagger/OpenAPI coverage?', a: 'hitOps/declaredOps — видишь непокрытые paths. Не заменяет бизнес-ассерты, но ловит слепые зоны.' },
    { level: 'senior', lessonId: 's-async-messaging', q: 'Как тестировать Kafka/async без постоянного брокера?', a: 'Poll/await статуса или inbox; outbox/contract; Testcontainers точечно. Не sleep(5). Идемпотентность consumer.' },
    { level: 'middle', lessonId: 'm-retry-policy', q: 'Rerun упавших в CI — когда ок?', a: 'Ограниченный budget (Surefire rerunFailingTestsCount). Не маскируй flake: quarantine + fix + метрика.' },
    { level: 'middle', lessonId: 'm-restassured-deep', q: 'Негативные API-сценарии — что обязательно?', a: '401/403/404/409/422 + невалидное тело; идемпотентность; без токена / протухший token. Матрица важнее одного happy-path.' },
    { level: 'middle', lessonId: 'm-custom-assertj', q: '[Live coding] Custom AssertJ hasAdultAge.', a: 'class UserAssert extends AbstractAssert<...> { hasAdultAge(){ isNotNull(); if(age<18) failWithMessage(...); return this; } }' },
    { level: 'senior', lessonId: 's-microservices-qa', q: 'Плюсы/минусы микросервисов для тестирования?', a: 'Плюсы: изоляция контрактов, независимый деплой. Минусы: распределённые фейлы, async, данные across services, дороже E2E. Пирамида + contract критичны.' },
    { level: 'senior', lessonId: 's-framework', q: 'Что в базовом тестовом классе, а что в Extension?', a: 'Base: минимум lifecycle если команда так живёт. Extension: переиспользуемые concerns (timing, auth cleanup, reporting). Не тащи всё в родителя.' }
  ];

  const cards = document.getElementById('cards');
  const filters = document.querySelectorAll('.filters button');
  const search = document.getElementById('interviewSearch');
  const empty = document.getElementById('interviewEmpty');
  const focus = window.__FOCUS_LEVEL__ || 'junior';
  const middleOk = !!window.__MIDDLE_UNLOCKED__;
  const seniorOk = !!window.__SENIOR_UNLOCKED__;
  let currentLevel = focus === 'senior' && seniorOk ? 'senior'
    : focus === 'middle' && middleOk ? 'middle'
    : 'junior';

  function unlockedPool() {
    return questions.filter(item => {
      if (item.level === 'middle' && !middleOk) return false;
      if (item.level === 'senior' && !seniorOk) return false;
      return true;
    });
  }

  function render() {
    cards.innerHTML = '';
    const q = (search?.value || '').trim().toLowerCase();
    const list = unlockedPool().filter(item => {
      if (currentLevel === 'junior-hot') return !!item.hot;
      if (currentLevel !== 'all' && item.level !== currentLevel) return false;
      if (!q) return true;
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
    if (empty) empty.hidden = list.length > 0;
    list.forEach((item, i) => {
      const el = document.createElement('article');
      el.className = 'card';
      const lessonLink = item.lessonId
        ? `<a class="muted" href="/lesson/${item.lessonId}" style="font-size:0.85rem">Урок →</a>`
        : '';
      const hot = item.hot ? '<span class="lvl hot">часто</span>' : '';
      el.innerHTML = `
        <div class="lvl-row"><span class="lvl">${item.level}</span>${hot}</div>
        <h3>${i + 1}. ${item.q}</h3>
        ${lessonLink}
        <div style="margin-top:10px">
          <button class="btn ghost toggle" type="button">Показать ответ</button>
        </div>
        <div class="answer">${item.a}</div>`;
      el.querySelector('.toggle').addEventListener('click', (e) => {
        const ans = el.querySelector('.answer');
        const open = ans.classList.toggle('open');
        e.target.textContent = open ? 'Скрыть ответ' : 'Показать ответ';
      });
      cards.appendChild(el);
    });
  }

  filters.forEach(btn => {
    if (btn.dataset.level === currentLevel) btn.classList.add('active');
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLevel = btn.dataset.level;
      render();
    });
  });
  search?.addEventListener('input', render);

  // --- Mock session ---
  const sessionBar = document.getElementById('sessionBar');
  const sessionCard = document.getElementById('sessionCard');
  const sessionSummary = document.getElementById('sessionSummary');
  const sessionTimer = document.getElementById('sessionTimer');
  const sessionIdx = document.getElementById('sessionIdx');
  const sessionTotal = document.getElementById('sessionTotal');
  let session = null;
  let timerId = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function showSessionQuestion() {
    if (!session) return;
    const item = session.items[session.i];
    sessionIdx.textContent = String(session.i + 1);
    sessionTotal.textContent = String(session.items.length);
    sessionSummary.hidden = true;
    sessionCard.hidden = false;
    sessionCard.innerHTML = `
      <div class="lvl-row"><span class="lvl">${item.level}</span>${item.hot ? '<span class="lvl hot">часто</span>' : ''}</div>
      <h3>${item.q}</h3>
      ${item.lessonId ? `<a class="muted" href="/lesson/${item.lessonId}">Урок →</a>` : ''}
      <div class="answer" id="sessionAnswer">${item.a}</div>`;
  }

  function endSession() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    if (!session) return;
    const weak = session.weak;
    sessionCard.hidden = true;
    sessionSummary.hidden = false;
    const links = weak.length
      ? '<ul>' + weak.map(w => `<li><a href="/lesson/${w.lessonId || ''}">${w.q.slice(0, 80)}</a></li>`).join('') + '</ul>'
      : '<p>Слабых тем не отмечено — хорошая сессия.</p>';
    sessionSummary.innerHTML = `
      <p><strong>Итог:</strong> знаю ${session.ok.length}, слабо ${weak.length}</p>
      <p class="muted">Повтори слабые уроки:</p>${links}
      <p class="muted">Отметь в CAREER.md чеклист mock-сессий.</p>`;
    try {
      localStorage.setItem('qa-forge-mock-interview-done', '1');
    } catch (_) { /* ignore */ }
  }

  function tick() {
    if (!session) return;
    session.left -= 1;
    if (sessionTimer) sessionTimer.textContent = fmt(Math.max(0, session.left));
    if (session.left <= 0) endSession();
  }

  function startSession(minutes) {
    const pool = unlockedPool().filter(x => x.hot || x.q.includes('[Live coding]'));
    const n = minutes >= 45 ? 10 : 7;
    const items = shuffle(pool.length ? pool : unlockedPool()).slice(0, Math.min(n, unlockedPool().length));
    session = { items, i: 0, ok: [], weak: [], left: minutes * 60 };
    if (sessionBar) sessionBar.hidden = false;
    if (sessionTimer) sessionTimer.textContent = fmt(session.left);
    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    showSessionQuestion();
    sessionBar?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('startSession30')?.addEventListener('click', () => startSession(30));
  document.getElementById('startSession45')?.addEventListener('click', () => startSession(45));
  document.getElementById('sessionReveal')?.addEventListener('click', () => {
    sessionCard?.querySelector('.answer')?.classList.add('open');
  });
  document.getElementById('sessionOk')?.addEventListener('click', () => {
    if (!session) return;
    session.ok.push(session.items[session.i]);
    session.i += 1;
    if (session.i >= session.items.length) endSession();
    else showSessionQuestion();
  });
  document.getElementById('sessionWeak')?.addEventListener('click', () => {
    if (!session) return;
    session.weak.push(session.items[session.i]);
    session.i += 1;
    if (session.i >= session.items.length) endSession();
    else showSessionQuestion();
  });
  document.getElementById('sessionEnd')?.addEventListener('click', endSession);

  render();
})();
