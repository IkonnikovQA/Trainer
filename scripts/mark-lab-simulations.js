/**
 * Mark simulated labs honestly: lab shortcut vs real job / portfolio.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const MARKER = "## В работе vs лаба";

const NOTES = {
  "selenium-fake":
    "В лабе — **FakeDriver** (быстрый DOM в памяти). В работе и в `examples/portfolio-starter` — **реальный Chrome** + явные waits.",
  artifact:
    "В лабе проверяется **текст артефакта** (структура YAML/Jenkinsfile). В работе pipeline должен **реально выполняться** в CI (см. портфолио GHA).",
  http:
    "В лабе — **MockWebServer**. В работе — стенд/demo API; контракты и негативы гоняй против живого baseUrl (reqres в портфолио).",
  policy:
    "Урок учит **решению/политике**. Мышцы автоматизации наращивай в портфолио и на реальном проекте."
};

function noteFor(lesson) {
  const modes = new Set((lesson.exercises || []).map((e) => e.mode));
  const parts = [];
  if (modes.has("selenium-fake")) parts.push(NOTES["selenium-fake"]);
  if (modes.has("artifact")) parts.push(NOTES.artifact);
  if (modes.has("http")) parts.push(NOTES.http);
  // Senior-ish policy heavy ids
  if (/^s-/.test(lesson.id) && (modes.has("junit") || modes.has("artifact"))) {
    const theory = lesson.theoryMarkdown || "";
    if (/policy|политик|матриц/i.test(theory + (lesson.title || ""))) {
      parts.push(NOTES.policy);
    }
  }
  return parts.length ? [...new Set(parts)].join("\n\n") : null;
}

let n = 0;
for (const level of ["junior", "middle", "senior"]) {
  const dir = path.join(ROOT, level);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const file = path.join(dir, f);
    const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
    if ((lesson.theoryMarkdown || "").includes(MARKER)) continue;
    const body = noteFor(lesson);
    if (!body) continue;
    const block = `\n\n${MARKER}\n\n${body}\n`;
    const t = lesson.theoryMarkdown || "";
    if (t.includes("## К практике")) {
      lesson.theoryMarkdown = t.replace("## К практике", block + "## К практике");
    } else {
      lesson.theoryMarkdown = t.trimEnd() + block;
    }
    fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
    n++;
    console.log("marked", lesson.id);
  }
}
console.log("done", n);
