const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "src",
  "main",
  "resources",
  "curriculum",
  "junior",
  "j-types.json"
);

const lesson = JSON.parse(fs.readFileSync(file, "utf8"));

lesson.summary =
  "Примитивы, переменные и сборка строк через + — то, с чего начинается любой тест-код.";
lesson.estimatedMinutes = 20;

lesson.theoryMarkdown = `# Типы данных и переменные

В Java переменная всегда имеет **тип**. Для практики сейчас важны три:

| Тип | Что хранит | Пример |
|---|---|---|
| \`int\` | целое число | \`int code = 200;\` |
| \`boolean\` | true / false | \`boolean ok = true;\` |
| \`String\` | текст | \`String msg = "pass";\` |

\`int\` и \`boolean\` — **примитивы** (значение лежит в переменной).
\`String\` — **объект** (в переменной лежит ссылка на текст).

## Практика 1: складываем числа

Оператор \`+\` для двух чисел — обычное сложение:

\`\`\`java
int a = 2;
int b = 3;
int sum = a + b; // 5
\`\`\`

Именно это нужно в методе \`sum(int a, int b)\`: верни \`a + b\`.

## Практика 2: собираем строку из частей

Если слева от \`+\` уже есть **строка**, Java склеивает текст. Число и \`boolean\` при этом сами превращаются в текст:

\`\`\`java
int code = 200;
boolean ok = true;

String s1 = "code=" + code;          // "code=200"
String s2 = s1 + ";ok=" + ok;        // "code=200;ok=true"

// то же самое в одну строку:
String status = "code=" + code + ";ok=" + ok;
\`\`\`

Порядок важен: \`code + ok\` без строки слева — это не склейка текста, а ошибка типов.
Всегда начинай с литерала в кавычках.

Готовый шаблон для задания «Формат статуса»:

\`\`\`java
return "code=" + code + ";ok=" + ok;
\`\`\`

## Коротко на потом (для чтения тест-кода)

- Примитив \`int\` vs объект \`Integer\` — boxing. Сравнивать \`String\` лучше через \`equals\`, не через \`==\`.
- С Java 10 можно \`var x = 200;\` — тип выведется сам, если он очевиден.
`;

lesson.keyPoints = [
  "int / boolean — примитивы, String — объект",
  "Для чисел + складывает; если слева строка — склеивает текст",
  'Шаблон статуса: "code=" + code + ";ok=" + ok'
];

lesson.interviewTips = [
  'Почему "a" == "a" иногда true? (String pool)',
  "Чем int отличается от Integer и когда бывает NPE при unboxing"
];

const e1 = lesson.exercises.find((e) => e.id === "e1");
e1.description = [
  "Дано:",
  "- класс Basics",
  "- метод sum(int a, int b)",
  "",
  "Задание:",
  "Верни сумму аргументов. Для двух int оператор + — это сложение (см. «Практика 1» в теории).",
  "",
  "Результат:",
  "- sum(2, 3) → 5",
  "- sum(-1, 1) → 0",
  "- sum(0, 0) → 0"
].join("\n");
e1.hints = [
  "В теле метода достаточно: return a + b;",
  "Сигнатуру метода не меняй — имя и типы уже правильные"
];

const e2 = lesson.exercises.find((e) => e.id === "e2");
e2.description = [
  "Дано:",
  "- класс Basics",
  "- метод formatStatus(int code, boolean ok)",
  '- в теории уже есть пример склейки "code=" + code + ";ok=" + ok',
  "",
  "Задание:",
  "Собери и верни одну строку ровно в формате code=<число>;ok=<true|false>.",
  "Используй конкатенацию через + (число и boolean сами станут текстом).",
  "",
  "Результат:",
  "- formatStatus(200, true) → code=200;ok=true",
  "- formatStatus(500, false) → code=500;ok=false"
].join("\n");
e2.hints = [
  'Начни с литерала в кавычках: return "code=" + ...',
  'Полный шаблон из теории: return "code=" + code + ";ok=" + ok;'
];

// Quiz: keep type basics, replace one with concatenation bridge
lesson.quiz = [
  {
    id: "q1",
    type: "single",
    question: "Что хранит переменная типа String?",
    options: [
      "Само значение текста прямо в стеке как у int",
      "Ссылку на объект String в heap",
      "Только hashCode",
      "Массив char без объекта"
    ],
    correctIndexes: [1],
    explanation: "String — ссылочный тип: в переменной лежит ссылка.",
    hint: "Примитив vs объект."
  },
  {
    id: "q2",
    type: "single",
    question: 'Что получится в выражении "code=" + 200 + ";ok=" + true?',
    options: [
      "Ошибка компиляции",
      "code=200;ok=true",
      "code=200true",
      "201"
    ],
    correctIndexes: [1],
    explanation: "Слева строка — дальше всё склеивается в текст.",
    hint: "Смотри раздел «Практика 2»."
  },
  {
    id: "q3",
    type: "single",
    question: "Сколько примитивных типов в Java?",
    options: ["6", "7", "8", "10"],
    correctIndexes: [2],
    explanation: "byte short int long float double char boolean — 8.",
    hint: null
  }
];

fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
console.log("patched", file);
