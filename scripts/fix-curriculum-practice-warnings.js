const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const LEVELS = ["junior", "middle", "senior"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function hasReadableTemplate(desc) {
  if (!desc) return false;
  return (
    /(^|\n)Дано:\s*(\n|$)/.test(desc) &&
    /(^|\n)Задание:\s*(\n|$)/.test(desc) &&
    /(^|\n)Результат:\s*(\n|$)/.test(desc) &&
    !/input:/i.test(desc) &&
    !/output:/i.test(desc) &&
    !/expected behavior:/i.test(desc)
  );
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

function stripOldEn(desc) {
  if (!desc) return "";
  let t = String(desc).trim();
  const m = t.match(/Expected behavior:\s*(.+?)(?:\s*Edge cases:|$)/is);
  if (m) t = m[1].trim();
  return t
    .replace(/^Input:\s*implement\s+[^.]*\.\s*/i, "")
    .replace(/^Output:\s*behavior verified by built-in checker\/tests\.\s*/i, "")
    .replace(/\s*Edge cases:\s*.+$/i, "")
    .trim();
}

function resultFromTestCases(ex) {
  const cases = Array.isArray(ex.testCases) ? ex.testCases : [];
  if (!cases.length) return null;
  return cases.slice(0, 4).map((tc) => {
    const call = (tc.callExpression || "").trim();
    const exp = tc.expected;
    if (call && exp !== undefined && exp !== null) return `- ${call} → ${exp}`;
    if (call) return `- ${call}`;
    return `- ${tc.name || "кейс"}`;
  });
}

function normalizeDescription(ex) {
  const base = (ex.description || "").trim();
  if (hasReadableTemplate(base)) return base;

  const className = ex.className || "класс из starter";
  const mode = ex.mode || "java";
  const task =
    stripOldEn(base) ||
    (ex.title
      ? `Выполни практику «${ex.title}» в классе ${className}.`
      : "Допиши код по starter и пройди автопроверку.");

  let resultLines = resultFromTestCases(ex);
  if (!resultLines) {
    if (mode === "junit") resultLines = ["- все @Test в классе зелёные"];
    else if (mode === "http") resultLines = ["- verifier проверяет ответы через MockWebServer"];
    else if (mode === "selenium-fake") resultLines = ["- verifier проверяет действия на FakeDriver"];
    else if (mode === "artifact") resultLines = ["- артефакт проходит правила проверки"];
    else resultLines = ["- автопроверка тренажёра проходит"];
  }

  return [
    "Дано:",
    `- класс / артефакт: ${className}`,
    `- ${modeGiven(mode)}`,
    "",
    "Задание:",
    task,
    "",
    "Результат:",
    ...resultLines
  ].join("\n");
}

function looksLeak(hint) {
  if (!hint) return false;
  const h = hint.toLowerCase();
  return (
    h.includes("return ") ||
    h.includes("assertthrows(") ||
    h.includes("assertequals(") ||
    h.includes("given().") ||
    h.includes("by.xpath(")
  );
}

function expectedReveal(level, difficulty) {
  if (!difficulty) return 2;
  const d = String(difficulty).toLowerCase();
  if (level === "senior" && d === "hard") return 2;
  if (["easy", "medium", "hard"].includes(d)) return 2;
  return 2;
}

function normalizeHints(ex) {
  let hints = Array.isArray(ex.hints) ? ex.hints.filter(Boolean).map(String) : [];
  hints = hints.filter((h) => !/Finalize with deterministic output/i.test(h));
  if (hints.length === 0) {
    hints = [
      "Начни с контракта метода и ожидаемого поведения.",
      "Сначала сделай самый простой проходящий вариант.",
      "Проверь граничные случаи из описания."
    ];
  } else {
    if (looksLeak(hints[0])) {
      hints.unshift("Сначала пойми контракт и цель, потом пиши точные конструкции.");
    }
    if (hints.length === 1) {
      hints.push("Используй API/паттерн, который требует режим урока.");
      hints.push("Доведи до детерминированного результата из раздела «Результат».");
    } else if (hints.length === 2) {
      hints.push("Доведи до детерминированного результата из раздела «Результат».");
    }
  }
  const uniq = [];
  for (const h of hints) {
    if (!uniq.includes(h)) uniq.push(h);
  }
  return uniq;
}

let filesTouched = 0;
let exercisesTouched = 0;

for (const level of LEVELS) {
  const dir = path.join(ROOT, level);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  for (const fileName of files) {
    const fullPath = path.join(dir, fileName);
    const lesson = readJson(fullPath);
    if (!Array.isArray(lesson.exercises) || lesson.exercises.length === 0) continue;
    let changed = false;

    for (const ex of lesson.exercises) {
      const before = JSON.stringify(ex);

      ex.description = normalizeDescription(ex);
      ex.hints = normalizeHints(ex);
      ex.revealAfterFails = expectedReveal(level, ex.difficulty);

      const after = JSON.stringify(ex);
      if (before !== after) {
        changed = true;
        exercisesTouched++;
      }
    }

    if (changed) {
      filesTouched++;
      writeJson(fullPath, lesson);
      console.log("updated", path.relative(ROOT, fullPath));
    }
  }
}

console.log("done", { filesTouched, exercisesTouched });
