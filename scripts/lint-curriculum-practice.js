const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const STRICT = process.argv.includes("--strict");

const LEVELS = ["junior", "middle", "senior"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isReadablePracticeDescription(text) {
  if (!text || typeof text !== "string") return false;
  const hasDano = /(^|\n)Дано:\s*(\n|$)/.test(text);
  const hasZadanie = /(^|\n)Задание:\s*(\n|$)/.test(text);
  const hasResult = /(^|\n)Результат:\s*(\n|$)/.test(text);
  const hasOldEn =
    /input:/i.test(text) ||
    /output:/i.test(text) ||
    /expected behavior:/i.test(text);
  return hasDano && hasZadanie && hasResult && !hasOldEn;
}

function looksLikeSolutionLeak(hint) {
  if (!hint) return false;
  const h = hint.trim().toLowerCase();
  const suspiciousTokens = ["return ", "assertequals(", "assertthrows(", "given().", "by.xpath("];
  if (suspiciousTokens.some((t) => h.includes(t))) return true;
  return false;
}

function expectedReveal(level, difficulty) {
  if (!difficulty) return null;
  const d = difficulty.toLowerCase();
  if (level === "senior" && d === "hard") return 2; // policy from latest pass
  if ((level === "junior" || level === "middle") && (d === "easy" || d === "medium" || d === "hard")) return 2;
  return null;
}

const errors = [];
const warns = [];
let exercisesChecked = 0;

for (const level of LEVELS) {
  const dir = path.join(ROOT, level);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  for (const fileName of files) {
    const fullPath = path.join(dir, fileName);
    const lesson = readJson(fullPath);
    for (const ex of lesson.exercises || []) {
      exercisesChecked++;
      const key = `${lesson.id}::${ex.id}`;

      if (!ex.solutionCode || !String(ex.solutionCode).trim()) {
        errors.push(`${key}: missing solutionCode`);
      }

      if (!isReadablePracticeDescription(ex.description)) {
        warns.push(`${key}: description missing Дано/Задание/Результат (or still has Input/Output)`);
      }

      if (!Array.isArray(ex.hints) || ex.hints.length < 2) {
        warns.push(`${key}: less than 2 hints`);
      } else if (looksLikeSolutionLeak(ex.hints[0])) {
        warns.push(`${key}: first hint looks like solution leak`);
      }

      const expected = expectedReveal(level, ex.difficulty);
      if (expected != null && ex.revealAfterFails !== expected) {
        warns.push(`${key}: revealAfterFails=${ex.revealAfterFails ?? "missing"}, expected ${expected}`);
      }

      if (level === "junior" && String(ex.difficulty).toLowerCase() === "hard") {
        errors.push(`${key}: junior task marked hard`);
      }
    }
  }
}

console.log(`Practice lint checked exercises: ${exercisesChecked}`);
console.log(`Errors: ${errors.length}`);
errors.forEach((e) => console.log("  ERR", e));
console.log(`Warnings: ${warns.length}`);
warns.forEach((w) => console.log("  WARN", w));

if (errors.length > 0 || (STRICT && warns.length > 0)) {
  process.exit(1);
}
