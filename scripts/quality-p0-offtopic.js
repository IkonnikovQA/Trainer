/**
 * P0: rewrite j-git / j-debug / j-testng practice to match lesson topic
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function save(rel, obj) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2) + '\n');
  console.log('saved', rel);
}

// --- j-git: artifact checklist + richer theory ---
{
  const l = load('junior/j-git.json');
  l.theoryMarkdown = `# Git essentials для QA

## База

\`\`\`
git status
git pull
git checkout -b feature/QA-12-login-smoke
git add .
git commit -m "Add login smoke tests"
git push -u origin HEAD
\`\`\`

## Ветки и PR

- Имя ветки: \`feature/TICKET-short-slug\` (единообразие в команде)
- PR: описание что тестируем + как прогнать; дождись CI
- Не коммить \`target/\`, \`.idea/\`, \`*.env\`, секреты

## Конфликты в автотестах

Чаще всего в локаторах и общих util. Разрешай осознанно, прогони smoke локально.

## .gitignore

Минимум: артефакты сборки, IDE, локальные env-файлы.
`;
  l.quiz = [
    {
      id: 'q1',
      type: 'single',
      question: 'Что обычно добавляют в .gitignore автотестов?',
      options: ['src/test/java', 'target/, .idea/, *.env', 'pom.xml', 'README'],
      correctIndexes: [1],
      explanation: 'Артефакты сборки и локальные файлы.',
      hint: null
    },
    {
      id: 'q2',
      type: 'single',
      question: 'Перед merge PR с автотестами лучше:',
      options: [
        'Зафорсить без CI',
        'Дождаться зелёного CI и коротко описать сценарий',
        'Закоммитить target/',
        'Удалить все ассерты'
      ],
      correctIndexes: [1],
      explanation: 'CI + понятный PR — базовый гигиенический минимум.',
      hint: null
    }
  ];
  l.exercises = [
    {
      id: 'e1',
      title: 'Git hygiene checklist YAML',
      description:
        'YAML-чеклист для QA-репо: branch_pattern, gitignore_entries, pr_requires_ci. Без password/секретов.',
      difficulty: 'easy',
      mode: 'artifact',
      artifactKind: 'gha',
      artifactRules: [
        'contains:branch_pattern',
        'contains:gitignore_entries',
        'contains:pr_requires_ci',
        'noSecret:password'
      ],
      className: 'GitHygiene',
      starterCode: '# git hygiene for QA repo\n# TODO\n',
      solutionCode:
        'branch_pattern: feature/TICKET-slug\ngitignore_entries: target/, .idea/, *.env\npr_requires_ci: true\n',
      hints: [
        'branch_pattern: feature/TICKET-slug',
        'gitignore_entries: target/, .idea/, *.env',
        'pr_requires_ci: true'
      ]
    }
  ];
  save('junior/j-git.json', l);
}

// --- j-debug: keep classify + expand theory/quiz ---
{
  const l = load('junior/j-debug.json');
  l.theoryMarkdown = `# Дебаг UI/API теста

## Чеклист

1. Падение стабильно или flaky?
2. Что именно упало: ассерт / timeout / locator / infra?
3. Есть скрин, HTML dump, request/response, video?
4. Воспроизводится локально на том же окружении?
5. Данные теста валидны?

## Читай stacktrace

- \`TimeoutException\` / \`waiting\` → условие wait не наступило (WAIT)
- \`AssertionError\` / \`Assert\` → ожидание не совпало с фактом (ASSERT)
- \`NoSuchElementException\` → локатор/DOM (LOCATOR)
- \`StaleElementReferenceException\` → элемент протух после обновления DOM — refetch + wait
- Connection / 5xx → infra/окружение (OTHER)

## Инструменты

Логи WebDriver, breakpoints, Allure attachments, browser console.

## Не делай

Sleep без понимания; skip без тикета.
`;
  if (!l.exercises[0].mode) l.exercises[0].mode = 'java';
  l.quiz = [
    {
      id: 'q1',
      type: 'single',
      question: 'TimeoutException чаще всего значит:',
      options: [
        'JVM сломалась',
        'Ожидаемое условие не наступило вовремя',
        'JUnit баг',
        'Maven не установлен'
      ],
      correctIndexes: [1],
      explanation: 'Wait не дождался условия.',
      hint: null
    },
    {
      id: 'q2',
      type: 'single',
      question: 'StaleElementReferenceException — что делать?',
      options: [
        'Увеличить Thread.sleep и кэшировать WebElement',
        'Не кэшировать элемент надолго: refetch + явное ожидание',
        'Игнорировать',
        'Удалить локатор'
      ],
      correctIndexes: [1],
      explanation: 'DOM обновился — нужна свежая ссылка и wait.',
      hint: null
    }
  ];
  save('junior/j-debug.json', l);
}

// --- j-testng-vs-junit: junit mini lab + stronger quiz ---
{
  const l = load('junior/j-testng-vs-junit.json');
  l.quiz.push({
    id: 'q3',
    type: 'single',
    question: 'Когда разумнее оставить TestNG, а не мигрировать на JUnit 5?',
    options: [
      'Всегда в 2026',
      'Уже есть сложные testng.xml suites и зрелая параллель',
      'Только если нет Maven',
      'Никогда'
    ],
    correctIndexes: [1],
    explanation: 'Контекст legacy suites/parallel важнее моды.',
    hint: null
  });
  l.exercises = [
    {
      id: 'e1',
      title: 'JUnit 5: выбор раннера в тесте',
      description:
        'RunnerPolicy.choose(hasTestNgXml): testng если XML есть, иначе junit5. Проверь тремя @Test.',
      difficulty: 'easy',
      mode: 'junit',
      className: 'RunnerPolicyTest',
      starterCode:
        "import org.junit.jupiter.api.Test;\n" +
        "import static org.junit.jupiter.api.Assertions.*;\n\n" +
        "class RunnerPolicy {\n" +
        "    static String choose(boolean hasTestNgXml) {\n" +
        "        // TODO\n" +
        "        return \"\";\n" +
        "    }\n" +
        "}\n\n" +
        "public class RunnerPolicyTest {\n" +
        "    @Test\n" +
        "    void prefersTestNgWhenXml() {\n" +
        "        assertEquals(\"testng\", RunnerPolicy.choose(true));\n" +
        "    }\n\n" +
        "    @Test\n" +
        "    void defaultJunit5() {\n" +
        "        assertEquals(\"junit5\", RunnerPolicy.choose(false));\n" +
        "    }\n" +
        "}\n",
      solutionCode:
        "import org.junit.jupiter.api.Test;\n" +
        "import static org.junit.jupiter.api.Assertions.*;\n\n" +
        "class RunnerPolicy {\n" +
        "    static String choose(boolean hasTestNgXml) {\n" +
        "        return hasTestNgXml ? \"testng\" : \"junit5\";\n" +
        "    }\n" +
        "}\n\n" +
        "public class RunnerPolicyTest {\n" +
        "    @Test\n" +
        "    void prefersTestNgWhenXml() {\n" +
        "        assertEquals(\"testng\", RunnerPolicy.choose(true));\n" +
        "    }\n\n" +
        "    @Test\n" +
        "    void defaultJunit5() {\n" +
        "        assertEquals(\"junit5\", RunnerPolicy.choose(false));\n" +
        "    }\n" +
        "}\n",
      hints: ['return hasTestNgXml ? "testng" : "junit5";']
    }
  ];
  save('junior/j-testng-vs-junit.json', l);
}

console.log('P0 offtopic junior done');
