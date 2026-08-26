/**
 * Lint: quiz facts and practice pointers must be covered by theory.
 * Errors fail the process; soft explanation-token mismatches are warnings.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "main", "resources", "curriculum");
const LEVELS = ["junior", "middle", "senior"];
const STRICT = process.argv.includes("--strict");

const STOP = new Set(
  (
    "это этот эта эти того этой этом этом том так как или для при притом " +
    "that this with from have been were will would should could through " +
    "тест тесты теста тестовый также только если когда после перед между " +
    "using used under over into onto about after before"
  ).split(/\s+/)
);

const errors = [];
const warns = [];

function theoryCorpus(lesson) {
  const keys = (lesson.keyPoints || []).join("\n");
  return `${lesson.theoryMarkdown || ""}\n${keys}`.toLowerCase();
}

function significantTokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[`"'*()[\]{}.,:;!?/\\+=<>|]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
}

function hasPracticeBlock(theory) {
  return (
    /##\s*к практике/i.test(theory) ||
    /##\s*практика/i.test(theory) ||
    /\(практика\s*\d+\)/i.test(theory)
  );
}

/** Hard rules: known quiz facts that must appear in theory */
function hardRules(lesson, corpus) {
  const id = lesson.id;
  for (const q of lesson.quiz || []) {
    const expl = (q.explanation || "").toLowerCase();
    const question = (q.question || "").toLowerCase();
    const key = `${id}::${q.id}`;

    if (
      (question.includes("примитив") && question.includes("сколько")) ||
      expl.includes("byte short int long")
    ) {
      if (!corpus.includes("byte") || !corpus.includes("boolean") || !/8\s*примитив|примитив[^\n]*8|ровно\s*\*\*8\*\*|ровно 8/.test(corpus)) {
        errors.push(`${key}: theory must state there are 8 primitives including byte…boolean`);
      }
    }

    if (question.includes("assertsame") || expl.includes("ссыл")) {
      if (question.includes("assertsame") && !corpus.includes("assertsame")) {
        errors.push(`${key}: theory must mention assertSame`);
      }
    }

    if (question.includes("map.of") && !corpus.includes("map.of")) {
      errors.push(`${key}: theory must mention Map.of`);
    }

    if (question.includes("nosuchelementexception") && !corpus.includes("unchecked")) {
      errors.push(`${key}: theory must say NoSuchElementException is unchecked`);
    }

    if ((question.includes("401") || expl.includes("401")) && question.includes("unauth") || (question.includes("401") && !corpus.includes("401"))) {
      if (question.includes("401") && !corpus.includes("401")) {
        errors.push(`${key}: theory must explain HTTP 401`);
      }
    }

    if (question.includes("multibranch") && !corpus.includes("multibranch")) {
      errors.push(`${key}: theory must explain Multibranch Pipeline`);
    }

    if (question.includes("cache") && question.includes("maven") && !corpus.includes("cache: maven") && !corpus.includes("cache:maven")) {
      if (!corpus.includes(".m2") && !corpus.includes("m2")) {
        errors.push(`${key}: theory must explain cache: maven / .m2`);
      }
    }

    if ((question.includes("p95") || question.includes("p95")) && !/p95|процентил/.test(corpus)) {
      errors.push(`${key}: theory must define p95 percentile`);
    }
  }
}

let lessons = 0;
let quizzes = 0;

for (const level of LEVELS) {
  const dir = path.join(ROOT, level);
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const lesson = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    lessons++;
    const corpus = theoryCorpus(lesson);
    const theory = lesson.theoryMarkdown || "";

    hardRules(lesson, corpus);

    for (const q of lesson.quiz || []) {
      quizzes++;
      const correct = (q.correctIndexes || [])
        .map((i) => (q.options || [])[i])
        .filter(Boolean)
        .join(" ");
      const tokens = significantTokens(`${q.explanation || ""} ${correct}`);
      if (tokens.length < 2) continue;
      const hit = tokens.filter((tok) => corpus.includes(tok));
      const ratio = hit.length / tokens.length;
      // Soft: at least one meaningful token from explanation/correct answer in theory
      if (hit.length === 0) {
        warns.push(
          `${lesson.id}::${q.id}: quiz answer/explanation not reflected in theory`
        );
      } else if (ratio < 0.15 && tokens.length >= 6) {
        warns.push(
          `${lesson.id}::${q.id}: weak theory coverage (${hit.length}/${tokens.length} tokens)`
        );
      }
    }

    for (const ex of lesson.exercises || []) {
      const desc = ex.description || "";
      if (/см\.\s*теорию/i.test(desc) && !hasPracticeBlock(theory)) {
        errors.push(`${lesson.id}::${ex.id}: description points to theory but no «К практике»/Практика block`);
      }
    }
  }
}

console.log(`Completeness lint: lessons=${lessons}, quizQuestions=${quizzes}`);
console.log(`Errors: ${errors.length}`);
errors.forEach((e) => console.log("  ERR", e));
console.log(`Warnings: ${warns.length}`);
warns.slice(0, 40).forEach((w) => console.log("  WARN", w));
if (warns.length > 40) console.log(`  ... +${warns.length - 40} more`);

if (errors.length > 0 || (STRICT && warns.length > 0)) process.exit(1);
