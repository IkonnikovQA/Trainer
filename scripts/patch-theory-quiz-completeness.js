/**
 * Patch theory to cover quiz/practice facts (completeness pass).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");

function load(rel) {
  const file = path.join(ROOT, rel);
  return { file, lesson: JSON.parse(fs.readFileSync(file, "utf8")) };
}

function save(file, lesson) {
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
}

function insertBefore(theory, marker, block) {
  if (theory.includes(block.trim().slice(0, 40))) return theory;
  const idx = theory.indexOf(marker);
  if (idx >= 0) return theory.slice(0, idx) + block + theory.slice(idx);
  return theory.trimEnd() + "\n\n" + block;
}

function appendIfMissing(theory, needle, block) {
  if (theory.includes(needle)) return theory;
  return theory.trimEnd() + "\n\n" + block.trim() + "\n";
}

function ensureKeyPoint(lesson, point) {
  if (!Array.isArray(lesson.keyPoints)) lesson.keyPoints = [];
  if (!lesson.keyPoints.some((k) => k.includes(point.slice(0, 24)))) {
    lesson.keyPoints = [point, ...lesson.keyPoints].slice(0, 4);
  }
}

let n = 0;

// --- JUNIOR ---
{
  const { file, lesson } = load("junior/j-types.json");
  let t = lesson.theoryMarkdown;
  const primitivesBlock = `В Java ровно **8 примитивов**: \`byte\`, \`short\`, \`int\`, \`long\`, \`float\`, \`double\`, \`char\`, \`boolean\`. Всё остальное — объекты (ссылочные типы), в том числе \`String\` и \`Integer\`.\n\n`;
  if (!t.includes("8 примитивов") && !t.includes("`byte`, `short`")) {
    t = t.replace(
      "В Java переменная всегда имеет **тип**. Для практики сейчас важны три:\n\n",
      "В Java переменная всегда имеет **тип**.\n\n" +
        primitivesBlock +
        "Для практики сейчас важны три:\n\n"
    );
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "Примитивов ровно 8: byte short int long float double char boolean");
  save(file, lesson);
  console.log("patched j-types");
  n++;
}

{
  const { file, lesson } = load("junior/j-collections.json");
  lesson.theoryMarkdown = appendIfMissing(
    lesson.theoryMarkdown,
    "Map.of",
    `## Map.of\n\n\`Map.of("email", "a@b.c", "pass", "secret")\` создаёт **неизменяемую** map фиксированного набора пар. Добавить ключ через \`put\` нельзя — будет исключение. Для изменяемого словаря используй \`new HashMap<>()\`.`
  );
  // also ensure example in theory body near streams - already may have Map.of in example
  if (!lesson.theoryMarkdown.includes("неизменяемую")) {
    lesson.theoryMarkdown = lesson.theoryMarkdown.replace(
      "## Частые операции",
      "## Map.of\n\n`Map.of(...)` создаёт **неизменяемую** map фиксированного набора. Для изменяемой — `new HashMap<>()`.\n\n## Частые операции"
    );
  }
  ensureKeyPoint(lesson, "Map.of — неизменяемая map фиксированного набора");
  save(file, lesson);
  console.log("patched j-collections");
  n++;
}

{
  const { file, lesson } = load("junior/j-exceptions.json");
  lesson.theoryMarkdown = lesson.theoryMarkdown.replace(
    "- `NoSuchElementException` — плохой локатор или нет ожидания",
    "- `NoSuchElementException` — плохой локатор или нет ожидания; это **unchecked** (`RuntimeException`)"
  );
  if (!lesson.theoryMarkdown.includes("unchecked")) {
    lesson.theoryMarkdown = lesson.theoryMarkdown.replace(
      "`Throwable` → `Error` | `Exception` → `RuntimeException` (unchecked)",
      "`Throwable` → `Error` | `Exception` → `RuntimeException` (unchecked). Например, `NoSuchElementException` — unchecked."
    );
  }
  ensureKeyPoint(lesson, "NoSuchElementException — unchecked (RuntimeException)");
  save(file, lesson);
  console.log("patched j-exceptions");
  n++;
}

{
  const { file, lesson } = load("junior/j-assertions.json");
  let t = lesson.theoryMarkdown;
  if (!t.includes("assertSame")) {
    t = t.replace(
      "## Anti-patterns",
      `## assertEquals vs assertSame\n\n- \`assertEquals(a, b)\` — сравнение по \`equals\` (значение/содержимое)\n- \`assertSame(a, b)\` — сравнение **ссылок** (тот же объект в памяти)\n\n## AssertJ contains\n\n\`\`\`java\nassertThat(response.body()).contains("ok");\nassertThat(response.id()).isNotBlank();\n\`\`\`\n\n## Anti-patterns`
    );
  }
  if (!t.includes(".contains(")) {
    t = t.replace(
      "assertThat(response.jsonPath().getString(\"id\")).isNotBlank();",
      "assertThat(response.jsonPath().getString(\"id\")).isNotBlank();\nassertThat(response.body()).contains(\"ok\");"
    );
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "assertSame сравнивает ссылки, не equals");
  save(file, lesson);
  console.log("patched j-assertions");
  n++;
}

// --- MIDDLE ---
{
  const { file, lesson } = load("middle/m-mockito.json");
  lesson.theoryMarkdown = appendIfMissing(
    lesson.theoryMarkdown,
    "реальный WebDriver",
    `## Mock и UI E2E\n\nВ **UI E2E** нужен **реальный** браузер/\`WebDriver\`. Мокать \`WebDriver\` в E2E бессмысленно: ты перестаёшь проверять настоящий UI. Mockito уместен для сервисов, клиентов API, изоляции юнит-слоя — не для «сквозного» UI.`
  );
  ensureKeyPoint(lesson, "UI E2E: реальный WebDriver, не mock");
  save(file, lesson);
  console.log("patched m-mockito");
  n++;
}

{
  const { file, lesson } = load("middle/m-mockmvc.json");
  let t = lesson.theoryMarkdown;
  if (!t.includes("headers")) {
    t = insertBefore(
      t,
      "## К практике",
      `## Что проверяют в MockMvc / FakeMvc\n\nТипичные проверки ответа: **status**, **body** (JSON path), **headers**.\n\n`
    );
  }
  if (!t.includes("jsonPath(") || !t.includes("perform")) {
    // enrich practice section
    if (t.includes("## К практике")) {
      t = t.replace(
        "## К практике",
        `## К практике\n\nПример проверки health:\n\n\`\`\`java\nvar res = fakeMvc.perform("GET", "/health");\nassertEquals(200, res.status());\nassertEquals("UP", res.jsonPath("status"));\n\`\`\`\n\nТакже можно проверить headers ответа, если контракт их задаёт.`
      );
    } else {
      t += `\n\n## К практике\n\n\`\`\`java\nvar res = fakeMvc.perform("GET", "/health");\nassertEquals(200, res.status());\nassertEquals("UP", res.jsonPath("status"));\n\`\`\`\n`;
    }
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "MockMvc: status, body, headers");
  save(file, lesson);
  console.log("patched m-mockmvc");
  n++;
}

{
  const { file, lesson } = load("middle/m-restassured.json");
  let t = lesson.theoryMarkdown;
  if (!t.includes("401")) {
    t = insertBefore(
      t,
      "## К практике",
      `## Коды ответа\n\n**401 Unauthorized** — запрос без (или с неверной) аутентификации: «кто ты?» не принято.\n403 — аутентифицирован, но нет прав.\n\n`
    );
  }
  if (!t.includes("/health") || !t.includes("statusCode()")) {
    const health = `\n\n### checkHealth (GET)\n\n\`\`\`java\nreturn given()\n    .when()\n    .get(baseUrl + "/health")\n    .then()\n    .statusCode(200)\n    .extract().statusCode();\n\`\`\`\n`;
    if (t.includes("## К практике")) {
      t = t.replace("## К практике", "## К практике" + health);
    } else {
      t += "\n## К практике" + health;
    }
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "401 = не аутентифицирован");
  save(file, lesson);
  console.log("patched m-restassured");
  n++;
}

{
  const { file, lesson } = load("middle/m-stale-flaky.json");
  lesson.theoryMarkdown = appendIfMissing(
    lesson.theoryMarkdown,
    "quarantine",
    `## Антифлейк-практики\n\n- **Изоляция данных**: каждый тест готовит свои данные и не зависит от чужого порядка.\n- **Quarantine с тикетом**: флакающий тест временно в quarantine только вместе с заведённым тикетом на починку — иначе «тихо умер» навсегда.`
  );
  ensureKeyPoint(lesson, "Антифлейк: изоляция данных и quarantine с тикетом");
  save(file, lesson);
  console.log("patched m-stale-flaky");
  n++;
}

{
  const { file, lesson } = load("middle/m-capstone.json");
  let t = lesson.theoryMarkdown;
  const templates = `### CheckoutPage (e1)\n\n\`\`\`java\npublic String placeOrder(String email) {\n    driver.findElement(By.id("email")).sendKeys(email);\n    driver.findElement(By.id("place")).click();\n    return driver.findElement(By.id("order-banner")).getText();\n}\n\`\`\`\n\n### OrderClient (e2)\n\n\`\`\`java\nString body = "{\\"sku\\":\\"" + sku + "\\"}";\nreturn given().contentType(ContentType.JSON).body(body)\n    .when().post(baseUrl + "/orders")\n    .then().statusCode(201).extract().path("orderId");\n\`\`\`\n`;
  if (!t.includes("CheckoutPage (e1)") && !t.includes('By.id("email")')) {
    if (t.includes("## К практике")) {
      t = t.replace("## К практике", "## К практике\n\n" + templates);
    } else {
      t += "\n\n## К практике\n\n" + templates;
    }
  }
  lesson.theoryMarkdown = t;
  save(file, lesson);
  console.log("patched m-capstone");
  n++;
}

{
  const { file, lesson } = load("middle/m-cucumber.json");
  let t = lesson.theoryMarkdown;
  if (!t.includes("verifyNoInteractions")) {
    const mockBlock = `\n\nВ тесте шагов используй Mockito:\n\n\`\`\`java\nLoginActions actions = mock(LoginActions.class);\nassertEquals("OK", new Steps().run("Given user opens", actions));\nverify(actions).open();\n\nassertEquals("UNKNOWN", new Steps().run("Maybe later", actions));\nverifyNoInteractions(actions); // для неизвестной строки — отдельный тест с новым mock\n\`\`\`\n`;
    if (t.includes("## К практике")) {
      t = t.replace(/## К практике/, "## К практике" + mockBlock);
    } else {
      t += "\n## К практике" + mockBlock;
    }
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "Steps-тест: mock / verify / verifyNoInteractions");
  save(file, lesson);
  console.log("patched m-cucumber");
  n++;
}

{
  const { file, lesson } = load("middle/m-pom-fluent.json");
  // Align theory with actual lab API (global findElement)
  let t = lesson.theoryMarkdown;
  if (t.includes("относительно root") || t.includes("root-relative")) {
    t = t.replace(/относительно root[^\n]*/g, "через driver.findElement (как в лабе Header)");
  }
  // Ensure practice text matches solution
  if (!t.includes("By.className(\"logo\")") && !t.includes("By.className('logo')")) {
    if (t.includes("## К практике")) {
      // already has openLogo from earlier bridge - ensure wording
      t = t.replace(
        /driver\.findElement\(root\)\.findElement[^\n]*/g,
        'driver.findElement(By.className("logo")).click()'
      );
    }
  }
  // Fix exercise description if it claims root-scoped lookup incorrectly
  for (const ex of lesson.exercises || []) {
    if (ex.description && /внутри root|relative to root|в пределах root/i.test(ex.description)) {
      ex.description = ex.description.replace(
        /внутри root[^\n]*/gi,
        "кликни logo и верни текст page-title (см. «К практике»)"
      );
    }
    if (ex.description && !ex.description.includes("К практике")) {
      ex.description = ex.description.replace(
        "Задание:\n",
        "Задание:\nСм. теорию «К практике» (Header.openLogo).\n"
      );
    }
  }
  lesson.theoryMarkdown = t;
  save(file, lesson);
  console.log("patched m-pom-fluent");
  n++;
}

// --- SENIOR ---
{
  const { file, lesson } = load("senior/s-jenkinsfile.json");
  lesson.theoryMarkdown = appendIfMissing(
    lesson.theoryMarkdown,
    "Multibranch",
    `## Multibranch Pipeline\n\n**Multibranch Pipeline** автоматически создаёт Jenkins-джобы на каждую ветку/PR по \`Jenkinsfile\` в репозитории. Не нужно вручную заводить job на каждую feature-ветку.`
  );
  ensureKeyPoint(lesson, "Multibranch Pipeline: джобы на ветку/PR из Jenkinsfile");
  save(file, lesson);
  console.log("patched s-jenkinsfile");
  n++;
}

{
  const { file, lesson } = load("senior/s-github-actions.json");
  lesson.theoryMarkdown = appendIfMissing(
    lesson.theoryMarkdown,
    "cache: maven",
    `## cache: maven\n\nВ setup-java опция \`cache: maven\` кэширует локальный репозиторий **\.m2**, чтобы на каждом CI-прогоне **не скачивать зависимости заново**.`
  );
  // fix escape if needed
  lesson.theoryMarkdown = lesson.theoryMarkdown.replace("**\\.m2**", "`.m2`");
  ensureKeyPoint(lesson, "cache: maven — кэш .m2, быстрее CI");
  save(file, lesson);
  console.log("patched s-github-actions");
  n++;
}

{
  const { file, lesson } = load("senior/s-performance-basics.json");
  let t = lesson.theoryMarkdown;
  if (!t.includes("95-й процентиль") && !t.includes("95th") && !/p95[^\n]*процент/i.test(t)) {
    t = insertBefore(
      t,
      "## К практике",
      `## Что такое p95\n\n**p95 (95-й процентиль)** latency — значение, ниже которого лежат 95% замеров времени ответа. Пример: p95 = 200 мс значит, что 95% запросов ответили не медленнее 200 мс (а 5% — медленнее).\n\n`
    );
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "p95 — 95-й процентиль времени ответа");
  save(file, lesson);
  console.log("patched s-performance-basics");
  n++;
}

{
  const { file, lesson } = load("senior/s-swagger-coverage.json");
  let t = lesson.theoryMarkdown;
  if (!t.includes("declared == 0") && !t.includes("declared ==0")) {
    t = appendIfMissing(
      t,
      "declared",
      `## Формула coverage\n\n\`percent = declared == 0 ? 0 : hit * 100 / declared\`.\nЕсли в спецификации **0** операций (\`declared == 0\`) — покрытие считаем **0**, без деления на ноль.`
    );
    // if declared already mentioned, inject guard near formula
    if (t.includes("hit") && t.includes("declared") && !t.includes("declared == 0")) {
      t = t.replace(
        /hit\s*\*\s*100\s*\/\s*declared/i,
        "declared == 0 ? 0 : hit * 100 / declared"
      );
    }
  }
  lesson.theoryMarkdown = t;
  ensureKeyPoint(lesson, "coverage: declared == 0 → 0");
  save(file, lesson);
  console.log("patched s-swagger-coverage");
  n++;
}

console.log("done", { n });
