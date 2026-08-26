/**
 * Second pass: cover remaining quiz explanations that soft-lint flagged.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");

function patch(rel, mut) {
  const file = path.join(ROOT, rel);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  mut(lesson);
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
  console.log("patched", rel);
}

function add(theory, needle, block) {
  if (theory.includes(needle)) return theory;
  return theory.trimEnd() + "\n\n" + block.trim() + "\n";
}

patch("junior/j-debug.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "свежая ссылка",
    `## StaleElementReferenceException\n\nDOM обновился — элемент «протух». Нужна **свежая ссылка** (найти элемент заново) и wait на условие.`
  );
});

patch("junior/j-junit.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "Параметризация",
    `## Параметризация\n\nДля набора входных данных лучше \`@ParameterizedTest\` / \`@CsvSource\` — параметризация убирает дубли тестовых методов.`
  );
});

patch("junior/j-locators.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "Absolute XPath",
    `## Absolute XPath\n\nПуть вида \`/html/body/...\` плох: малейшее изменение DOM ломает путь. Предпочитай \`data-testid\`, CSS, относительный XPath.`
  );
});

patch("junior/j-oop.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "WebDriver chrome",
    `## Полиморфизм на примере драйвера\n\n\`WebDriver chrome = new ChromeDriver();\` — переменная типа интерфейса/родителя указывает на конкретную реализацию.`
  );
});

patch("junior/j-selenium4.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "относительно якоря",
    `## Relative locators\n\nНужны, чтобы искать элемент **относительно якоря** (above/below/near), а не только по абсолютному локатору.`
  );
});

patch("junior/j-waits.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "фиксированное время",
    `## Почему не Thread.sleep\n\nФиксированное время не равно условию готовности: либо ждёшь лишнее, либо мало. Используй явное ожидание условия.`
  );
});

patch("middle/m-advanced-selenium.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "defaultContent",
    `## Frames\n\nПосле работы в iframe вернись в главный документ: \`driver.switchTo().defaultContent()\`.`
  );
});

patch("middle/m-api-clients.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "одна точка правды",
    `## baseUrl\n\nbaseUrl сервиса лучше брать из конфига/property — **одна точка правды**, а не хардкод в каждом тесте.`
  );
});

patch("middle/m-awaitility.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "либо ждёт лишнее",
    `## Sleep vs await\n\n\`Thread.sleep(5000)\` плох: фиксированный sleep либо ждёт лишнее, либо мало. Awaitility ждёт условие с таймаутом.`
  );
});

patch("middle/m-parallel.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "Shared mutable",
    `## static WebDriver\n\n\`static WebDriver\` в параллели опасен: **shared mutable state** между потоками. Держи драйвер в ThreadLocal.`
  );
});

patch("middle/m-ra-filter.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "filterChain",
    `## Filter chain\n\nFilter должен вызвать следующий в цепочке (\`filterChain\` / \`ctx.next()\`), иначе цепочка оборвётся.`
  );
});

patch("middle/m-restassured-deep.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "RequestSpecification",
    `## RequestSpecification\n\nПолезен для **переиспользования настроек запроса** (baseUri, headers, auth) между тестами.`
  );
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "403",
    `## 403 Forbidden\n\n403 — авторизован, но нет permission (в отличие от 401 — нет/невалидна аутентификация).`
  );
});

patch("middle/m-restassured.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "ближе к логике",
    `## Где проверять бизнес-правило\n\nРасчёт цены и доменные правила — **ближе к логике** (unit/API), UI E2E для этого дороже.`
  );
});

patch("middle/m-stale-flaky.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "Retries без фикса",
    `## Retries\n\nRetries без фикса корневой причины — плохо: маскируют флейк. Сначала стабилизируй тест/продукт.`
  );
});

patch("senior/s-async-messaging.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "ждём условие",
    `## Ожидание в async\n\nВместо Thread.sleep лучше ждать **условие**, не время (poll/await на появление сообщения).`
  );
});

patch("senior/s-docker.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    ".dockerignore",
    `## .dockerignore\n\nНужен, чтобы уменьшить build context: меньше context = быстрее и чище build.`
  );
});

patch("senior/s-metrics.json", (L) => {
  L.theoryMarkdown = add(
    L.theoryMarkdown,
    "PR-гейт",
    `## Метрика для PR-гейта\n\nСамая полезная — быстрый и стабильный сигнал (pass rate / flake), а не «красивый» дашборд без действия.`
  );
});
