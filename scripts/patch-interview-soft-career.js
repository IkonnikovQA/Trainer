const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "..",
  "src",
  "main",
  "resources",
  "curriculum",
  "senior",
  "s-interview-soft.json"
);
const L = JSON.parse(fs.readFileSync(file, "utf8"));
if (!L.theoryMarkdown.includes("Резюме Auto QA")) {
  L.theoryMarkdown =
    L.theoryMarkdown.trimEnd() +
    `

## Резюме Auto QA (черновик)

1 страница: роль, стек (Java/JUnit/Selenium/RA/CI), ссылка на GitHub, 3 буллета достижений.

## STAR на собесе

- **S**ituation — контекст (flake 8% на login)
- **T**ask — цель (снизить до <2%)
- **A**ction — waits, изоляция данных, quarantine с тикетом
- **R**esult — цифра (flake, время CI)

Подробный путь: CAREER.md в корне тренажёра. Mock-сессии — вкладка /interview → «Сессия».
`;
  fs.writeFileSync(file, JSON.stringify(L, null, 2) + "\n");
  console.log("enriched s-interview-soft");
} else {
  console.log("already enriched");
}
