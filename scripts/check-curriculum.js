/**
 * Run curriculum quality gates used for career-ready content.
 * Usage: node scripts/check-curriculum.js [--strict]
 */
const { spawnSync } = require("child_process");
const path = require("path");

const strict = process.argv.includes("--strict");
const scripts = [
  "lint-curriculum-practice.js",
  "lint-curriculum-completeness.js"
];

let failed = false;
for (const name of scripts) {
  const args = [path.join(__dirname, name)];
  if (strict && name.includes("completeness")) args.push("--strict");
  console.log("\n===", name, "===");
  const r = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (r.status !== 0) failed = true;
}

if (failed) {
  console.error("\nCurriculum checks FAILED");
  process.exit(1);
}
console.log("\nCurriculum checks OK");
