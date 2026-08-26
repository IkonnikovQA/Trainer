/**
 * Append "К практике" bridges so theory teaches what exercises require.
 * Idempotent: skips lessons that already contain the marker.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const MARKER = "## К практике";

function load(rel) {
  const file = path.join(ROOT, rel);
  return { file, lesson: JSON.parse(fs.readFileSync(file, "utf8")) };
}

function save(file, lesson) {
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
}

function appendBridge(lesson, bridgeMd) {
  const theory = lesson.theoryMarkdown || "";
  if (theory.includes(MARKER)) return false;
  lesson.theoryMarkdown = theory.trimEnd() + "\n\n" + bridgeMd.trim() + "\n";
  return true;
}

function setDesc(ex, lines) {
  ex.description = lines.join("\n");
}

function pointDesc(ex, theoryHint) {
  if (!ex.description) return;
  if (ex.description.includes(theoryHint)) return;
  ex.description = ex.description.replace(
    "Задание:\n",
    `Задание:\nСм. теорию «К практике» (${theoryHint}).\n`
  );
}

const patches = {
  "junior/j-collections.json"(L) {
    appendBridge(
      L,
      `${MARKER}

### uniqueCount
Если \`items == null\` — верни \`0\`. Иначе собери \`HashSet\` и возьми \`size()\`:

\`\`\`java
if (items == null) return 0;
return new HashSet<>(Arrays.asList(items)).size();
\`\`\`

### freq
\`null\` → пустая \`HashMap\`. Для каждого слова: \`map.merge(w, 1, Integer::sum)\`.`
    );
    const e1 = L.exercises.find((e) => e.id === "e1");
    if (e1) {
      setDesc(e1, [
        "Дано:",
        "- класс CollectionTasks",
        "- метод uniqueCount(String[] items)",
        "",
        "Задание:",
        "Верни число уникальных строк. null → 0. См. «К практике».",
        "",
        "Результат:",
        '- uniqueCount({"a","b","a"}) → 2',
        "- uniqueCount(null) → 0"
      ]);
      e1.hints = ["Сначала проверь null", "HashSet сам уберёт дубликаты"];
    }
    const e2 = L.exercises.find((e) => e.id === "e2");
    if (e2) pointDesc(e2, "freq + merge");
  },

  "junior/j-control.json"(L) {
    appendBridge(
      L,
      `${MARKER}

### classify(int code)
Диапазоны статусов:

\`\`\`java
if (code >= 200 && code < 300) return "success"; // 2xx
if (code >= 400 && code < 500) return "client";  // 4xx
if (code >= 500 && code < 600) return "server";  // 5xx
return "other";
\`\`\`

### sum(int[] nums)
\`null\` или пустой массив → \`0\`. Иначе суммируй for-each:

\`\`\`java
int s = 0;
for (int n : nums) s += n;
return s;
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "classify / sum");
  },

  "junior/j-maven.json"(L) {
    appendBridge(
      L,
      `${MARKER}

GAV — строка \`groupId:artifactId:version\`. Разбей через \`split(":")\`:

\`\`\`java
String[] p = gav.split(":");
// p[0] groupId, p[1] artifactId, p[2] version
\`\`\`

Методы \`groupId\`, \`artifactId\`, \`version\` просто возвращают нужный индекс.`
    );
    for (const e of L.exercises) pointDesc(e, "split GAV");
  },

  "junior/j-records-fixtures.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Record объявляют так:

\`\`\`java
record UserFixture(String email, int age) {}
\`\`\`

Доступ к полям — **методы** \`email()\`, \`age()\` (не \`u.age\` как поле):

\`\`\`java
static boolean isAdult(UserFixture u) {
    return u.age() >= 18;
}
\`\`\`

В тесте: \`assertTrue(Fixtures.isAdult(new UserFixture("a@b.c", 20)));\``
    );
    for (const e of L.exercises) pointDesc(e, "record accessors");
  },

  "junior/j-streams.json"(L) {
    appendBridge(
      L,
      `${MARKER}

### sumEven
\`null\` → \`0\`. Суммируй только чётные (\`n % 2 == 0\`).

Цикл:

\`\`\`java
int s = 0;
for (int n : nums) if (n % 2 == 0) s += n;
\`\`\`

Или Stream:

\`\`\`java
return Arrays.stream(nums).filter(n -> n % 2 == 0).sum();
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "sumEven");
  },

  "junior/j-selenium4.json"(L) {
    appendBridge(
      L,
      `${MARKER}

В этой лабе RelativeLocator **эмулируется порядком input в DOM** (FakeDriver):

1. \`List<WebElement> inputs = driver.findElements(By.tagName("input"));\`
2. Найди индекс, где \`getAttribute("id")\` равен \`"password"\`.
3. Элемент «выше» — \`inputs.get(pwdIndex - 1)\`.
4. Верни его \`getAttribute("name")\`.`
    );
    for (const e of L.exercises) pointDesc(e, "порядок input");
  },

  "junior/j-exceptions.json"(L) {
    appendBridge(
      L,
      `${MARKER}

### parseIntSafe(String s)
1. \`s == null\` или \`s.isBlank()\` → \`-1\`
2. Иначе \`try { return Integer.parseInt(s); } catch (NumberFormatException e) { return -1; }\`

\`\`\`java
public int parseIntSafe(String s) {
    if (s == null || s.isBlank()) return -1;
    try {
        return Integer.parseInt(s);
    } catch (NumberFormatException e) {
        return -1;
    }
}
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "parseIntSafe");
  },

  "junior/j-git.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Артефакт — YAML со **строго этими ключами** (без \`password\` и секретов):

\`\`\`yaml
branch_pattern: feature/TICKET-slug
gitignore_entries: target/, .idea/, *.env
pr_requires_ci: true
\`\`\``
    );
    const e1 = L.exercises[0];
    if (e1) {
      setDesc(e1, [
        "Дано:",
        "- артефакт GitHygiene (YAML)",
        "- режим artifact",
        "",
        "Задание:",
        "Заполни чеклист гигиены репозитория. Нужные ключи — в теории «К практике». Секретов/password быть не должно.",
        "",
        "Результат:",
        "- есть branch_pattern, gitignore_entries, pr_requires_ci",
        "- нет password"
      ]);
      e1.hints = [
        "Скопируй структуру YAML из теории и подставь осмысленные значения",
        "Не добавляй password и токены"
      ];
    }
  },

  "junior/j-testng-vs-junit.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Политика выбора раннера:

\`\`\`java
static String choose(boolean hasTestNgXml) {
    return hasTestNgXml ? "testng" : "junit5";
}
\`\`\`

В тесте проверь оба случая: \`true → "testng"\`, \`false → "junit5"\`.`
    );
    const e1 = L.exercises[0];
    if (e1) {
      setDesc(e1, [
        "Дано:",
        "- класс RunnerPolicyTest (режим junit)",
        "",
        "Задание:",
        "Реализуй choose(hasTestNgXml): если есть TestNG XML — верни \"testng\", иначе \"junit5\". См. «К практике».",
        "",
        "Результат:",
        "- все @Test зелёные"
      ]);
      e1.hints = ["Это обычный тернарный оператор", "Строки ровно testng и junit5"];
    }
  },

  "middle/m-test-config.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Читай именно system property \`qa.baseUrl\`:

\`\`\`java
static String baseUrl() {
    String v = System.getProperty("qa.baseUrl");
    return (v == null || v.isBlank()) ? "http://localhost:8080" : v;
}
\`\`\`

В \`@AfterEach\` очищай property, чтобы тесты не мешали друг другу.`
    );
    for (const e of L.exercises) pointDesc(e, "qa.baseUrl");
  },

  "middle/m-stale-flaky.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Правило рефетча после StaleElement:

\`\`\`java
static boolean shouldRefetch(boolean domChanged, boolean elementCached) {
    return domChanged && elementCached;
}
\`\`\`

Перечитывать элемент нужно только если DOM изменился **и** у тебя ещё старая ссылка.`
    );
    for (const e of L.exercises) pointDesc(e, "shouldRefetch");
  },

  "middle/m-cucumber.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Мини-раннер step-определений (префикс строки):

\`\`\`java
public String run(String line, LoginActions actions) {
    String t = line == null ? "" : line.trim();
    if (t.startsWith("Given")) { actions.open(); return "OK"; }
    if (t.startsWith("When"))  { actions.submit(); return "OK"; }
    if (t.startsWith("Then"))  { actions.assertHome(); return "OK"; }
    return "UNKNOWN";
}
\`\`\`

В тесте: \`mock(LoginActions.class)\`, \`verify(actions).open()\`, для неизвестной строки — \`verifyNoInteractions(actions)\`.`
    );
    for (const e of L.exercises) pointDesc(e, "Steps.run");
  },

  "middle/m-pom-fluent.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Компонент Header хранит \`WebDriver\` и \`By root\`. Метод \`openLogo()\`:

1. Кликни логотип: \`driver.findElement(By.className("logo")).click()\`
2. Верни текст заголовка: \`driver.findElement(By.id("page-title")).getText()\``
    );
    for (const e of L.exercises) pointDesc(e, "Header.openLogo");
  },

  "middle/m-parallel.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Проверка изоляции ThreadLocal:

\`\`\`java
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
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "ThreadLocal isolation");
  },

  "middle/m-restassured.json"(L) {
    appendBridge(
      L,
      `${MARKER}

### loginToken
POST JSON на \`/login\`, вытащи токен:

\`\`\`java
String body = "{\\"user\\":\\"" + user + "\\",\\"pass\\":\\"" + pass + "\\"}";
return given()
    .contentType(ContentType.JSON)
    .body(body)
    .when().post(baseUrl + "/login")
    .then().statusCode(200)
    .extract().path("token");
\`\`\``
    );
    const e2 = L.exercises.find((e) => e.id === "e2");
    if (e2) pointDesc(e2, "extract().path(token)");
  },

  "middle/m-retry-policy.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Бюджет ретраев:

\`\`\`java
static boolean allow(int failsSoFar, int maxReruns) {
    return failsSoFar < maxReruns;
}
\`\`\`

При \`failsSoFar == maxReruns\` новый прогон уже нельзя.`
    );
    for (const e of L.exercises) pointDesc(e, "RetryBudget.allow");
  },

  "middle/m-json-schema.json"(L) {
    appendBridge(
      L,
      `${MARKER}

В этой лабе контракт проверяем **вручную** через RestAssured (без matchesJsonSchema):

\`\`\`java
var res = given().when().get(baseUrl + "/user").then().statusCode(200).extract();
Object id = res.path("id");
String email = res.path("email");
String status = res.path("status");
// id != null, email содержит @, status равен "ACTIVE"
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "ручной контракт path()");
  },

  "middle/m-db.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Безопасный SQL-идентификатор:

\`\`\`java
static String safeId(String name) {
    if (name == null || !name.matches("[A-Za-z0-9_]+")) return "INVALID";
    return name;
}
\`\`\`

Только буквы/цифры/_\` — иначе \`"INVALID"\`.`
    );
    for (const e of L.exercises) pointDesc(e, "SqlSafe.safeId");
  },

  "middle/m-capstone.json"(L) {
    appendBridge(
      L,
      `${MARKER}

### OrderFlowTest (e3)
Это не полный E2E — юнит на \`PriceCalc\`:

\`\`\`java
assertEquals(30, calc.total(3, 10));
assertThrows(IllegalArgumentException.class, () -> calc.total(-1, 10));
\`\`\`

UI (\`CheckoutPage\`) и API (\`OrderClient\`) — отдельные упражнения выше.`
    );
    const e3 = L.exercises.find((e) => e.id === "e3");
    if (e3) {
      setDesc(e3, [
        "Дано:",
        "- класс OrderFlowTest + PriceCalc",
        "- режим junit",
        "",
        "Задание:",
        "Проверь calc.total: нормальный кейс и отрицательное qty → IllegalArgumentException. См. «К практике».",
        "",
        "Результат:",
        "- все @Test зелёные"
      ]);
      e3.hints = ["Используй assertEquals и assertThrows", "Отрицательное количество — ошибка"];
    }
  },

  "middle/m-allure.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Маскировка токена для аттачей:

\`\`\`java
static String mask(String token) {
    if (token == null || token.length() <= 4) return "****";
    return token.substring(0, 2) + "****" + token.substring(token.length() - 2);
}
\`\`\`

Пример: \`"abcdef"\` → \`"ab****ef"\`.`
    );
    for (const e of L.exercises) pointDesc(e, "SecretMask.mask");
  },

  "middle/m-allure-steps.json"(L) {
    appendBridge(
      L,
      `${MARKER}

\`AllureLite\` — учебный рекордер шагов:

- \`step(name)\` добавляет имя в список
- \`getSteps()\` возвращает копию списка
- \`maskToken(token)\` — как в уроке Allure: коротко → \`****\`, иначе \`ab****ef\`

В тесте проверь и запись шагов, и маску.`
    );
    for (const e of L.exercises) pointDesc(e, "AllureLite");
  },

  "senior/s-contract.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Клиентская проверка версии:

\`\`\`java
String version = given().when().get(baseUrl + "/contract")
    .then().statusCode(200).extract().path("version");
return version != null && version.startsWith("2.");
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "version startsWith 2.");
  },

  "senior/s-testcontainers.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Матрица профиля:

\`\`\`java
if (!needsRealDb) return "unit";
if (hasDocker && ciMinutes >= 8) return "integration-tc";
return "integration-mock";
\`\`\``
    );
    for (const e of L.exercises) pointDesc(e, "TcPolicy.profile");
  },

  "senior/s-pyramid.json"(L) {
    appendBridge(
      L,
      `${MARKER}

YAML-политика пирамиды (без password):

\`\`\`yaml
unit_share: 70
api_share: 20
ui_share: 10
shift_left: true
\`\`\``
    );
    const e1 = L.exercises[0];
    if (e1) {
      setDesc(e1, [
        "Дано:",
        "- артефакт PyramidPolicy (YAML)",
        "",
        "Задание:",
        "Заполни доли пирамиды и shift_left. Ключи — в теории «К практике». Без секретов.",
        "",
        "Результат:",
        "- unit_share / api_share / ui_share / shift_left присутствуют"
      ]);
      e1.hints = ["Числа — доли в процентах", "shift_left должен быть true"];
    }
  },

  "senior/s-metrics.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Quality gate (порядок проверок важен):

\`\`\`java
if (flakeRate > 5) return "RED:flake";
if (feedbackMin > 15) return "RED:feedback";
if (passRate < 95) return "RED:passrate";
return "GREEN";
\`\`\`

GREEN только если flakeRate ≤ 5, feedbackMin ≤ 15, passRate ≥ 95.`
    );
    for (const e of L.exercises) pointDesc(e, "QualityGate.verdict");
  },

  "senior/s-performance-basics.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Алгоритм \`PerfGate.evaluate(samples, budgetMs)\`:

1. Пустой/null samples или \`budgetMs <= 0\` → \`IllegalArgumentException\`
2. Скопируй и \`Arrays.sort\`
3. \`p50 = arr[floor(0.5 * (n-1))]\`, \`p95 = arr[ceil(0.95 * (n-1))]\`
4. \`"OK"\` если \`p95 <= budgetMs\` **и** \`p50 <= budgetMs * 0.6\`, иначе \`"SLOW"\``
    );
    for (const e of L.exercises) pointDesc(e, "p50/p95 gate");
  },

  "senior/s-observability.json"(L) {
    appendBridge(
      L,
      `${MARKER}

\`TraceIds.requestId(testName, ts)\`:

1. Пустое имя или \`ts <= 0\` → \`IllegalArgumentException\`
2. slug = lower-case → заменить не \`[a-z0-9]\` на \`-\` → обрезать краевые \`-\`
3. обрезать slug до 20 символов
4. вернуть \`"qa-" + slug + "-" + ts\`

Пример: \`"Login Checkout", 100\` → \`"qa-login-checkout-100"\`.`
    );
    for (const e of L.exercises) pointDesc(e, "TraceIds.requestId");
  },

  "senior/s-codereview.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Агрегатор находок:

- \`add(severity, msg)\` считает только \`HIGH\` / \`MEDIUM\` / \`LOW\` (остальное игнор)
- \`summary()\` → \`"HIGH:x;MEDIUM:y;LOW:z"\` через \`getOrDefault\`

\`\`\`java
counts.merge(severity, 1, Integer::sum);
return "HIGH:" + counts.getOrDefault("HIGH", 0)
    + ";MEDIUM:" + counts.getOrDefault("MEDIUM", 0)
    + ";LOW:" + counts.getOrDefault("LOW", 0);
\`\`\``
    );
    const e1 = L.exercises[0];
    if (e1) {
      setDesc(e1, [
        "Дано:",
        "- класс ReviewReportTest",
        "- режим junit",
        "",
        "Задание:",
        "Реализуй ReviewReport.add/summary как в теории «К практике» (считай HIGH/MEDIUM/LOW, остальное пропускай).",
        "",
        "Результат:",
        '- summary после набора add → "HIGH:2;MEDIUM:1;LOW:1"'
      ]);
      e1.hints = ["Игнорируй severity вне HIGH/MEDIUM/LOW", "summary всегда в фиксированном формате"];
    }
  },

  "senior/s-security-qa.json"(L) {
    appendBridge(
      L,
      `${MARKER}

Матрица доступа через Bearer:

\`\`\`java
return given()
    .header("Authorization", "Bearer " + token)
    .when().get(baseUrl + "/secure")
    .then().extract().statusCode();
\`\`\`

Ожидания verifier: плохой токен → 401, без роли → 403, admin → 200.`
    );
    for (const e of L.exercises) pointDesc(e, "Bearer /secure");
  }
};

let touched = 0;
for (const [rel, fn] of Object.entries(patches)) {
  const { file, lesson } = load(rel);
  const before = JSON.stringify(lesson);
  fn(lesson);
  if (JSON.stringify(lesson) !== before) {
    save(file, lesson);
    touched++;
    console.log("patched", rel);
  } else {
    console.log("unchanged", rel);
  }
}
console.log("done", { touched, total: Object.keys(patches).length });
