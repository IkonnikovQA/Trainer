/**
 * Rewrite all exercise.description into readable Russian blocks:
 * Дано / Задание / Результат
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const LEVELS = ["junior", "middle", "senior"];

function load(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function stripBoilerplate(desc) {
  if (!desc) return "";
  let t = String(desc).trim();

  // Extract "Expected behavior: ..." core if present
  const m = t.match(/Expected behavior:\s*(.+?)(?:\s*Edge cases:|$)/is);
  if (m) t = m[1].trim();

  t = t
    .replace(/^Input:\s*implement\s+[^.]*\.\s*/i, "")
    .replace(/^Output:\s*behavior verified by built-in checker\/tests\.\s*/i, "")
    .replace(/\s*Edge cases:\s*.+$/i, "")
    .replace(/^Input:\s*/i, "")
    .replace(/^Output:\s*/i, "")
    .trim();

  return t;
}

function modeGiven(mode) {
  switch (mode) {
    case "selenium-fake":
      return "режим selenium-fake (in-memory FakeDriver)";
    case "http":
      return "режим http (RestAssured + MockWebServer)";
    case "junit":
      return "режим junit (класс с @Test)";
    case "artifact":
      return "режим artifact (текст файла / YAML / Jenkinsfile)";
    case "java":
    default:
      return "режим java (класс с методами)";
  }
}

function extractTaskCore(ex) {
  const cleaned = stripBoilerplate(ex.description);
  if (cleaned && cleaned.length > 12 && !/^implement /i.test(cleaned)) {
    return cleaned;
  }
  // Fallbacks by title/class
  if (ex.title) return `Выполни практику «${ex.title}» в классе ${ex.className || "указанном в starter"}.`;
  return "Допиши код по starter и пройди автопроверку.";
}

function resultFromTestCases(ex) {
  const cases = Array.isArray(ex.testCases) ? ex.testCases : [];
  if (cases.length === 0) return null;
  return cases.slice(0, 4).map((tc) => {
    const call = (tc.callExpression || "").trim();
    const exp = tc.expected;
    if (call && exp !== undefined && exp !== null) return `- ${call} → ${exp}`;
    if (call) return `- ${call}`;
    return `- ${tc.name || "кейс"}`;
  });
}

function resultFromArtifact(ex) {
  if (ex.mode !== "artifact") return null;
  const rules = Array.isArray(ex.artifactRules) ? ex.artifactRules : [];
  const keys = rules
    .filter((r) => String(r).startsWith("contains:"))
    .map((r) => String(r).slice("contains:".length))
    .slice(0, 6);
  if (keys.length === 0) return ["- артефакт проходит правила проверки"];
  return keys.map((k) => `- в тексте есть: ${k}`);
}

function buildDescription(ex) {
  const className = ex.className || "класс из starter";
  const mode = ex.mode || "java";
  const given = [
    `- класс / артефакт: ${className}`,
    `- ${modeGiven(mode)}`
  ];
  if (ex.fixtureJson) given.push("- DOM fixture уже подготовлен тренажёром");
  if (ex.httpStubJson) given.push("- HTTP stub уже подготовлен тренажёром");
  if (ex.supportSources && Object.keys(ex.supportSources).length) {
    given.push(`- вспомогательные классы: ${Object.keys(ex.supportSources).join(", ")}`);
  }

  const task = extractTaskCore(ex);

  let resultLines = resultFromTestCases(ex) || resultFromArtifact(ex);
  if (!resultLines) {
    if (mode === "junit") resultLines = ["- все @Test в классе зелёные"];
    else if (mode === "http") resultLines = ["- verifier проверяет ответы через MockWebServer"];
    else if (mode === "selenium-fake") resultLines = ["- verifier проверяет действия на FakeDriver"];
    else resultLines = ["- автопроверка тренажёра проходит"];
  }

  return [
    "Дано:",
    ...given,
    "",
    "Задание:",
    task,
    "",
    "Результат:",
    ...resultLines
  ].join("\n");
}

function cleanHints(ex) {
  if (!Array.isArray(ex.hints)) return;
  ex.hints = ex.hints
    .map((h) => String(h).trim())
    .filter((h) => h && !/Finalize with deterministic output/i.test(h));
}

let files = 0;
let exercises = 0;

for (const level of LEVELS) {
  const dir = path.join(ROOT, level);
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const file = path.join(dir, name);
    const lesson = load(file);
    if (!Array.isArray(lesson.exercises) || !lesson.exercises.length) continue;
    let changed = false;
    for (const ex of lesson.exercises) {
      const next = buildDescription(ex);
      if (ex.description !== next) {
        ex.description = next;
        changed = true;
        exercises++;
      }
      const beforeHints = JSON.stringify(ex.hints || []);
      cleanHints(ex);
      if (JSON.stringify(ex.hints || []) !== beforeHints) changed = true;
    }
    if (changed) {
      save(file, lesson);
      files++;
      console.log("updated", path.relative(ROOT, file));
    }
  }
}

console.log("done", { files, exercises });
