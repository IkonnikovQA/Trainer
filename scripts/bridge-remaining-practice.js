/**
 * For lessons still lacking "## К практике" / "## Практика",
 * append a bridge built from exercise solutions (pedagogical worked examples).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const LEVELS = ["junior", "middle", "senior"];

function hasPracticeBridge(theory) {
  if (!theory) return false;
  return (
    /##\s*К практике/i.test(theory) ||
    /##\s*Практика(\s+\d+)?\s*:/i.test(theory) ||
    /##\s*Практика\s/i.test(theory) ||
    /\(практика\s*\d+\)/i.test(theory) ||
    /##\s*Нормализация email/i.test(theory)
  );
}

function stripTests(code) {
  if (!code) return "";
  let c = String(code);
  // Drop pure junit test classes when a helper class also exists
  if (/class\s+\w+Test\b/.test(c) && /class\s+(?!.*Test)\w+/.test(c)) {
    // keep non-test top-level types roughly: remove public class XxxTest { ... } blocks is hard;
    // instead remove @Test methods' class if solution is only tests + nested helper — keep as-is truncated
  }
  // Prefer artifact plain text
  if (!c.includes("class ") && !c.includes("import ") && c.length < 500) return c.trim();
  return c.trim();
}

function shorten(code, max = 900) {
  const c = stripTests(code);
  if (c.length <= max) return c;
  return c.slice(0, max) + "\n// ...";
}

function fence(lang, body) {
  return "```" + lang + "\n" + body + "\n```";
}

let touched = 0;

for (const level of LEVELS) {
  const dir = path.join(ROOT, level);
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const file = path.join(dir, name);
    const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(lesson.exercises) || !lesson.exercises.length) continue;
    if (hasPracticeBridge(lesson.theoryMarkdown || "")) continue;

    const parts = [`## К практике`, ``, `Ниже — рабочие шаблоны ровно под задания этого урока. Сначала прочитай пример, потом пиши код.`];

    for (const ex of lesson.exercises) {
      parts.push(``, `### ${ex.title || ex.id}`);
      const mode = ex.mode || "java";
      if (mode === "artifact") {
        parts.push(`Заполни артефакт по образцу:`);
        parts.push(fence("text", shorten(ex.solutionCode || "", 400)));
      } else if (ex.supportSources && Object.keys(ex.supportSources).length) {
        parts.push(`Вспомогательные классы / логика:`);
        for (const [k, v] of Object.entries(ex.supportSources)) {
          parts.push(`**${k}**`);
          parts.push(fence("java", shorten(v, 700)));
        }
        if (ex.solutionCode && /@Test/.test(ex.solutionCode)) {
          parts.push(`В тестах проверь поведение через assert/verify (см. starter).`);
        }
      } else {
        parts.push(fence("java", shorten(ex.solutionCode || "// см. starter и описание задания", 900)));
      }
    }

    lesson.theoryMarkdown = (lesson.theoryMarkdown || "").trimEnd() + "\n\n" + parts.join("\n") + "\n";

    for (const ex of lesson.exercises) {
      if (!ex.description) continue;
      if (ex.description.includes("К практике")) continue;
      if (ex.description.includes("Задание:\n")) {
        ex.description = ex.description.replace(
          "Задание:\n",
          `Задание:\nСм. теорию «К практике» (${ex.title || ex.id}).\n`
        );
      }
    }

    // Keep keyPoints practical if too abstract
    if (Array.isArray(lesson.keyPoints) && lesson.keyPoints.length) {
      const firstTitle = lesson.exercises[0]?.title;
      if (firstTitle && !lesson.keyPoints.some((k) => /практик|задани|шаблон/i.test(k))) {
        lesson.keyPoints = [...lesson.keyPoints.slice(0, 2), `Шаблон к заданию «${firstTitle}» — в разделе «К практике»`];
      }
    }

    fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
    touched++;
    console.log("bridged", path.relative(ROOT, file));
  }
}

console.log("done", { touched });
