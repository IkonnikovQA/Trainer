/**
 * P0: s-interview-soft artifact, s-framework LayerPolicy, s-async idempotent
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

// --- s-interview-soft ---
{
  const l = load('senior/s-interview-soft.json');
  l.theoryMarkdown = `# Как отвечать на Senior-интервью

## STAR

- **S**ituation — контекст команды/продукта
- **T**ask — твоя цель/ответственность
- **A**ction — что сделал (конкретно), какие trade-offs
- **R**esult — эффект + **метрика** (flake%, время feedback, coverage критичных путей)

## Структура длинного ответа

1. Контекст  
2. Проблема/риск  
3. Варианты и trade-offs  
4. Решение и твоя роль  
5. Результат (цифры)

## Типовые темы

Снижение регресса, flaky, API-слой вместо UI, CI, менторство, legacy strangler.

## Чего избегать

«Мы просто написали много UI»; нет цифр; обвинение всех без своей роли.
`;
  l.exercises = [
    {
      id: 'e1',
      title: 'STAR checklist YAML',
      description:
        'YAML с ключами situation, task, action, result, metric. Без password.',
      difficulty: 'easy',
      mode: 'artifact',
      artifactKind: 'gha',
      artifactRules: [
        'contains:situation',
        'contains:task',
        'contains:action',
        'contains:result',
        'contains:metric',
        'noSecret:password'
      ],
      className: 'StarChecklist',
      starterCode: '# STAR answer skeleton\n# TODO\n',
      solutionCode:
        'situation: flake 8% on waits in nightly\ntask: reduce flake and speed feedback\naction: explicit waits, data isolation, quarantine tag\nresult: flake under 2%, feedback minus 15 min\nmetric: flake_rate\n',
      hints: [
        'situation: ...',
        'task: ...',
        'action: ...',
        'result: ...',
        'metric: ...'
      ]
    }
  ];
  save('senior/s-interview-soft.json', l);
}

// --- s-framework LayerPolicy ---
{
  const l = load('senior/s-framework.json');
  l.exercises = [
    {
      id: 'e1',
      title: 'LayerPolicy.allowed',
      description:
        'allowed(from, to): зависимости только «вниз». tests→pages OK, pages→tests forbid, pages→core OK, core→tests forbid. Слои: tests, pages, core.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'LayerPolicyTest',
      starterCode:
        "import org.junit.jupiter.api.Test;\n" +
        "import static org.junit.jupiter.api.Assertions.*;\n\n" +
        "class LayerPolicy {\n" +
        "    static boolean allowed(String from, String to) {\n" +
        "        // TODO: rank tests=0, pages=1, core=2; allow from.rank < to.rank? wait — tests depend on pages means from=tests to=pages, rank from < to\n" +
        "        return false;\n" +
        "    }\n" +
        "}\n\n" +
        "public class LayerPolicyTest {\n" +
        "    @Test\n" +
        "    void testsToPagesOk() { assertTrue(LayerPolicy.allowed(\"tests\", \"pages\")); }\n\n" +
        "    @Test\n" +
        "    void pagesToTestsForbid() { assertFalse(LayerPolicy.allowed(\"pages\", \"tests\")); }\n\n" +
        "    @Test\n" +
        "    void pagesToCoreOk() { assertTrue(LayerPolicy.allowed(\"pages\", \"core\")); }\n\n" +
        "    @Test\n" +
        "    void coreToTestsForbid() { assertFalse(LayerPolicy.allowed(\"core\", \"tests\")); }\n" +
        "}\n",
      solutionCode:
        "import org.junit.jupiter.api.Test;\n" +
        "import static org.junit.jupiter.api.Assertions.*;\n\n" +
        "class LayerPolicy {\n" +
        "    static int rank(String layer) {\n" +
        "        return switch (layer) {\n" +
        "            case \"tests\" -> 0;\n" +
        "            case \"pages\" -> 1;\n" +
        "            case \"core\" -> 2;\n" +
        "            default -> -1;\n" +
        "        };\n" +
        "    }\n\n" +
        "    static boolean allowed(String from, String to) {\n" +
        "        int a = rank(from);\n" +
        "        int b = rank(to);\n" +
        "        if (a < 0 || b < 0) return false;\n" +
        "        return a < b; // outer may depend on inner\n" +
        "    }\n" +
        "}\n\n" +
        "public class LayerPolicyTest {\n" +
        "    @Test\n" +
        "    void testsToPagesOk() { assertTrue(LayerPolicy.allowed(\"tests\", \"pages\")); }\n\n" +
        "    @Test\n" +
        "    void pagesToTestsForbid() { assertFalse(LayerPolicy.allowed(\"pages\", \"tests\")); }\n\n" +
        "    @Test\n" +
        "    void pagesToCoreOk() { assertTrue(LayerPolicy.allowed(\"pages\", \"core\")); }\n\n" +
        "    @Test\n" +
        "    void coreToTestsForbid() { assertFalse(LayerPolicy.allowed(\"core\", \"tests\")); }\n" +
        "}\n",
      hints: [
        'rank: tests=0, pages=1, core=2',
        'return rank(from) < rank(to);'
      ]
    }
  ];
  // clean starter comment - remove confusing wait text
  l.exercises[0].starterCode =
    "import org.junit.jupiter.api.Test;\n" +
    "import static org.junit.jupiter.api.Assertions.*;\n\n" +
    "class LayerPolicy {\n" +
    "    static int rank(String layer) {\n" +
    "        // TODO: tests=0, pages=1, core=2, else -1\n" +
    "        return -1;\n" +
    "    }\n\n" +
    "    static boolean allowed(String from, String to) {\n" +
    "        // TODO: allow only if rank(from) < rank(to)\n" +
    "        return false;\n" +
    "    }\n" +
    "}\n\n" +
    "public class LayerPolicyTest {\n" +
    "    @Test\n" +
    "    void testsToPagesOk() { assertTrue(LayerPolicy.allowed(\"tests\", \"pages\")); }\n\n" +
    "    @Test\n" +
    "    void pagesToTestsForbid() { assertFalse(LayerPolicy.allowed(\"pages\", \"tests\")); }\n\n" +
    "    @Test\n" +
    "    void pagesToCoreOk() { assertTrue(LayerPolicy.allowed(\"pages\", \"core\")); }\n\n" +
    "    @Test\n" +
    "    void coreToTestsForbid() { assertFalse(LayerPolicy.allowed(\"core\", \"tests\")); }\n" +
    "}\n";
  save('senior/s-framework.json', l);
}

// --- s-async-messaging idempotent ---
{
  const l = load('senior/s-async-messaging.json');
  l.theoryMarkdown = `# Async / messaging testing без брокера

## Стратегии

1. **Testcontainers Kafka** — ближе к прод, тяжелее CI
2. **Embedded / in-memory bus** — быстрые unit/integration
3. **Contract + outbox table** — проверяешь запись события, не брокер
4. **Await/poll** статуса/inbox до таймаута

## At-least-once и идемпотентность

Брокер может доставить сообщение **дважды**. Consumer должен обрабатывать duplicate безопасно:
хранить \`processedIds\` и не увеличивать счётчик повторно.

В этом lab — in-memory Inbox + идемпотентный \`accept(id)\` (не клон Awaitility-поллера).
`;
  l.quiz = [
    {
      id: 'q1',
      type: 'single',
      question: 'Вместо Thread.sleep в async-тесте лучше:',
      options: [
        'Увеличить sleep',
        'Poll/await условия с таймаутом',
        'Отключить тест',
        'Только UI'
      ],
      correctIndexes: [1],
      explanation: 'Ждём условие, не время.',
      hint: null
    },
    {
      id: 'q2',
      type: 'single',
      question: 'At-least-once доставка означает, что consumer должен:',
      options: [
        'Игнорировать дубли',
        'Быть идемпотентным к повторной доставке',
        'Всегда падать на втором сообщении',
        'Использовать только UI'
      ],
      correctIndexes: [1],
      explanation: 'Дубли возможны — обрабатывай безопасно.',
      hint: null
    }
  ];
  l.exercises = [
    {
      id: 'e1',
      title: 'Idempotent Inbox.accept',
      description:
        'Inbox.accept(id): первый раз увеличивает processedCount; повтор того же id — no-op. Тесты готовы.',
      difficulty: 'medium',
      mode: 'junit',
      className: 'InboxIdempotentTest',
      timeoutMs: 15000,
      starterCode:
        "import java.util.*;\n" +
        "import org.junit.jupiter.api.Test;\n" +
        "import static org.junit.jupiter.api.Assertions.*;\n\n" +
        "class Inbox {\n" +
        "    private final Set<String> seen = new HashSet<>();\n" +
        "    private int processedCount = 0;\n\n" +
        "    void accept(String id) {\n" +
        "        // TODO: if already seen — return; else mark seen and ++processedCount\n" +
        "    }\n\n" +
        "    int processedCount() { return processedCount; }\n" +
        "}\n\n" +
        "public class InboxIdempotentTest {\n" +
        "    @Test\n" +
        "    void firstDeliveryCounts() {\n" +
        "        Inbox inbox = new Inbox();\n" +
        "        inbox.accept(\"msg-1\");\n" +
        "        assertEquals(1, inbox.processedCount());\n" +
        "    }\n\n" +
        "    @Test\n" +
        "    void duplicateDoesNotDouble() {\n" +
        "        Inbox inbox = new Inbox();\n" +
        "        inbox.accept(\"msg-1\");\n" +
        "        inbox.accept(\"msg-1\");\n" +
        "        assertEquals(1, inbox.processedCount());\n" +
        "    }\n\n" +
        "    @Test\n" +
        "    void differentIdsCountSeparately() {\n" +
        "        Inbox inbox = new Inbox();\n" +
        "        inbox.accept(\"a\");\n" +
        "        inbox.accept(\"b\");\n" +
        "        assertEquals(2, inbox.processedCount());\n" +
        "    }\n" +
        "}\n",
      solutionCode:
        "import java.util.*;\n" +
        "import org.junit.jupiter.api.Test;\n" +
        "import static org.junit.jupiter.api.Assertions.*;\n\n" +
        "class Inbox {\n" +
        "    private final Set<String> seen = new HashSet<>();\n" +
        "    private int processedCount = 0;\n\n" +
        "    void accept(String id) {\n" +
        "        if (!seen.add(id)) return;\n" +
        "        processedCount++;\n" +
        "    }\n\n" +
        "    int processedCount() { return processedCount; }\n" +
        "}\n\n" +
        "public class InboxIdempotentTest {\n" +
        "    @Test\n" +
        "    void firstDeliveryCounts() {\n" +
        "        Inbox inbox = new Inbox();\n" +
        "        inbox.accept(\"msg-1\");\n" +
        "        assertEquals(1, inbox.processedCount());\n" +
        "    }\n\n" +
        "    @Test\n" +
        "    void duplicateDoesNotDouble() {\n" +
        "        Inbox inbox = new Inbox();\n" +
        "        inbox.accept(\"msg-1\");\n" +
        "        inbox.accept(\"msg-1\");\n" +
        "        assertEquals(1, inbox.processedCount());\n" +
        "    }\n\n" +
        "    @Test\n" +
        "    void differentIdsCountSeparately() {\n" +
        "        Inbox inbox = new Inbox();\n" +
        "        inbox.accept(\"a\");\n" +
        "        inbox.accept(\"b\");\n" +
        "        assertEquals(2, inbox.processedCount());\n" +
        "    }\n" +
        "}\n",
      hints: [
        'if (!seen.add(id)) return;',
        'processedCount++;'
      ]
    }
  ];
  save('senior/s-async-messaging.json', l);
}

console.log('P0 senior gaps done');
