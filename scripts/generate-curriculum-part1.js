/**
 * Generates full curriculum JSON lessons for QA Forge trainer.
 * Run: node scripts/generate-curriculum.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function writeLesson(level, file, lesson) {
  const dir = path.join(ROOT, level);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), JSON.stringify(lesson, null, 2), 'utf8');
}

function q(id, question, options, correctIndexes, explanation, hint, type = 'single') {
  return { id, type, question, options, correctIndexes, explanation, hint };
}

function ex(partial) {
  return {
    difficulty: 'easy',
    hints: [],
    testCases: [],
    verifierCode: null,
    solutionCode: null,
    methodName: null,
    ...partial
  };
}

const lessons = [];

function add(levelId, moduleId, file, lesson) {
  lesson.levelId = levelId;
  lesson.moduleId = moduleId;
  lessons.push({ levelId, moduleId, file, lesson });
  writeLesson(levelId, file, lesson);
}

// ===================== JUNIOR =====================

add('junior', 'java-basics', 'j-types.json', {
  id: 'j-types',
  title: 'Типы данных и переменные',
  summary: 'Примитивы, ссылочные типы, boxing/unboxing — фундамент для чтения тест-кода.',
  estimatedMinutes: 25,
  theoryMarkdown: `# Типы данных и переменные

В Java есть **8 примитивов**: \`byte\`, \`short\`, \`int\`, \`long\`, \`float\`, \`double\`, \`char\`, \`boolean\`.

Всё остальное — **объекты** (ссылочные типы): \`String\`, \`Integer\`, массивы, твои классы.

## Важное для автотестов

- \`int actual = 5;\` vs \`Integer actual = 5;\` — boxing создаёт объект.
- Сравнение: для примитивов \`==\`, для объектов обычно \`equals\`.
- \`String\` неизменяемый (immutable): каждая «модификация» создаёт новую строку.
- \`final\` переменная не может быть переприсвоена (ссылка), но объект по ссылке может меняться.

## Пример

\`\`\`java
int status = 200;
String body = "{\\"ok\\":true}";
boolean passed = status == 200;
Integer boxed = status; // autoboxing
\`\`\`

## Локальные переменные

С Java 10 можно \`var\` — тип выводится компилятором:

\`\`\`java
var driver = new ChromeDriver(); // тип ChromeDriver
\`\`\`

Используй \`var\` когда тип очевиден, не когда читаемость падает.
`,
  keyPoints: [
    'Примитивы хранят значение, объекты — ссылку',
    'String сравнивай через equals, не через ==',
    'Autoboxing: int ↔ Integer автоматически'
  ],
  interviewTips: [
    'Спросим: почему "a" == "a" иногда true? (String pool)',
    'Объясни разницу int и Integer и NPE при unboxing null'
  ],
  quiz: [
    q('q1', 'Что хранит переменная ссылочного типа?',
      ['Само значение объекта', 'Ссылку (адрес) на объект в heap', 'Только hashCode', 'Копию всех полей'],
      [1], 'Ссылочная переменная хранит ссылку на объект.', 'Подумай про heap vs stack.'),
    q('q2', 'Как правильно сравнить содержимое двух String?',
      ['s1 == s2', 's1.equals(s2)', 's1.compare(s2)', 'Objects == s2'],
      [1], 'equals сравнивает содержимое (если переопределён).', '== для объектов — про ссылки.'),
    q('q3', 'Сколько примитивных типов в Java?',
      ['6', '7', '8', '10'], [2], 'byte short int long float double char boolean — 8.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Сумма и тип',
      description: 'Реализуй метод sum(int a, int b), возвращающий сумму.',
      className: 'Basics',
      starterCode: 'public class Basics {\n    public int sum(int a, int b) {\n        // TODO\n        return 0;\n    }\n}\n',
      solutionCode: 'public class Basics {\n    public int sum(int a, int b) {\n        return a + b;\n    }\n}\n',
      hints: ['Просто верни a + b', 'Сигнатура уже есть — не меняй имя метода'],
      testCases: [
        { name: '2+3', callExpression: 'sum(2, 3)', expected: '5', expectedType: 'int' },
        { name: 'отрицательные', callExpression: 'sum(-1, 1)', expected: '0', expectedType: 'int' },
        { name: 'нули', callExpression: 'sum(0, 0)', expected: '0', expectedType: 'int' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'Формат статуса',
      description: 'Метод formatStatus(int code, boolean ok) → строка вида "code=200;ok=true".',
      className: 'Basics',
      starterCode: 'public class Basics {\n    public String formatStatus(int code, boolean ok) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['Конкатенация: "code=" + code + ";ok=" + ok', 'Или String.format'],
      testCases: [
        { name: '200 ok', callExpression: 'formatStatus(200, true)', expected: 'code=200;ok=true', expectedType: 'string' },
        { name: '500 fail', callExpression: 'formatStatus(500, false)', expected: 'code=500;ok=false', expectedType: 'string' }
      ]
    })
  ]
});

add('junior', 'java-basics', 'j-control.json', {
  id: 'j-control',
  title: 'Условия, циклы, switch',
  summary: 'Управляющие конструкции — основа валидаций и обхода коллекций в тестах.',
  theoryMarkdown: `# Условия и циклы

## if / else

\`\`\`java
if (status == 200) {
    // ok
} else if (status == 404) {
    // not found
} else {
    // other
}
\`\`\`

## Тернарный оператор

\`\`\`java
String result = ok ? "PASS" : "FAIL";
\`\`\`

## Циклы

- \`for\` — когда известен диапазон
- \`for-each\` — обход коллекций/массивов
- \`while\` / \`do-while\` — пока условие истинно

\`\`\`java
for (WebElement el : elements) {
    assertTrue(el.isDisplayed());
}
\`\`\`

## switch

С Java 14+ удобен switch expression:

\`\`\`java
String type = switch (code) {
    case 200, 201 -> "success";
    case 400, 404 -> "client";
    default -> "other";
};
\`\`\`

## Частые ошибки в тестах

- Бесконечный while без условия выхода
- Сравнение String через ==
- Off-by-one в индексах массива
`,
  keyPoints: [
    'for-each удобен для списков элементов',
    'switch expression возвращает значение',
    'Избегай бесконечных циклов в ожиданиях — используй WebDriverWait'
  ],
  interviewTips: [
    'Чем for отличается от for-each?',
    'Когда while предпочтительнее for?'
  ],
  quiz: [
    q('q1', 'Какой цикл лучше для обхода List<WebElement>?',
      ['Бесконечный while', 'for-each', 'только do-while', 'goto'],
      [1], 'for-each читаем и безопасен по индексам.', null),
    q('q2', 'Что вернёт выражение: true ? "A" : "B"?',
      ['B', 'A', 'true', 'ошибка компиляции'], [1], 'Тернарный оператор выбирает ветку true.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Классификация HTTP',
      description: 'classify(int code): "success" для 2xx, "client" для 4xx, "server" для 5xx, иначе "other".',
      className: 'HttpClass',
      difficulty: 'medium',
      starterCode: 'public class HttpClass {\n    public String classify(int code) {\n        // TODO\n        return "other";\n    }\n}\n',
      hints: ['2xx: code >= 200 && code < 300', 'Можно через if-else цепочку'],
      testCases: [
        { name: '200', callExpression: 'classify(200)', expected: 'success', expectedType: 'string' },
        { name: '201', callExpression: 'classify(201)', expected: 'success', expectedType: 'string' },
        { name: '404', callExpression: 'classify(404)', expected: 'client', expectedType: 'string' },
        { name: '500', callExpression: 'classify(500)', expected: 'server', expectedType: 'string' },
        { name: '100', callExpression: 'classify(100)', expected: 'other', expectedType: 'string' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'Сумма массива',
      description: 'sum(int[] nums) — сумма элементов. Для null или пустого — 0.',
      className: 'ArraysTask',
      starterCode: 'public class ArraysTask {\n    public int sum(int[] nums) {\n        // TODO\n        return 0;\n    }\n}\n',
      hints: ['Проверь nums == null || nums.length == 0', 'for (int n : nums) sum += n'],
      testCases: [
        { name: 'обычный', callExpression: 'sum({1,2,3})', expected: '6', expectedType: 'int' },
        { name: 'пустой', callExpression: 'sum({})', expected: '0', expectedType: 'int' },
        { name: 'один', callExpression: 'sum({10})', expected: '10', expectedType: 'int' }
      ]
    })
  ]
});

add('junior', 'java-basics', 'j-oop.json', {
  id: 'j-oop',
  title: 'ООП: классы, наследование, полиморфизм',
  summary: 'Без OOP не понять Page Object, базовые тест-классы и фреймворки.',
  theoryMarkdown: `# ООП для автоматизатора

## Инкапсуляция

Скрываем детали: поля \`private\`, доступ через методы.

В Page Object локаторы часто \`private final By...\`, снаружи — бизнес-методы \`login()\`.

## Наследование

\`class LoginPage extends BasePage\`

Базовый класс держит \`WebDriver\`, общие waits, \`open(url)\`.

## Полиморфизм

Один интерфейс — разные реализации: \`DriverFactory\` возвращает Chrome/Firefox как \`WebDriver\`.

## Абстракция

\`abstract class BaseTest\` с \`@BeforeEach\`/\`@AfterEach\`.

## Композиция vs наследование

Часто **композиция лучше**: \`LoginPage\` *имеет* \`HeaderComponent\`, а не наследует всё подряд.

\`\`\`java
public class BasePage {
    protected final WebDriver driver;
    public BasePage(WebDriver driver) { this.driver = driver; }
}
\`\`\`
`,
  keyPoints: [
    'Page Object = инкапсуляция UI',
    'Базовые классы через наследование или композицию',
    'Программируй к интерфейсам (WebDriver, Waits)'
  ],
  interviewTips: [
    'Объясни 4 принципа OOP на примере тестового фреймворка',
    'Почему композиция часто лучше глубокого наследования страниц?'
  ],
  quiz: [
    q('q1', 'Какой принцип OOP прячет детали реализации Page Object?',
      ['Полиморфизм', 'Инкапсуляция', 'Сериализация', 'Рефлексия'], [1],
      'Инкапсуляция скрывает локаторы и внутренности.', null),
    q('q2', 'WebDriver chrome = new ChromeDriver() — это пример?',
      ['Наследования только', 'Полиморфизма (работа через интерфейс/родителя)', 'Нарушения OOP', 'Autoboxing'],
      [1], 'Переменная типа родителя/интерфейса указывает на реализацию.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Класс User',
      description: 'Класс User с полями name, age; конструктор; getters; метод isAdult() (age >= 18).',
      className: 'User',
      difficulty: 'medium',
      starterCode: 'public class User {\n    // TODO: fields, constructor, getters, isAdult()\n}\n',
      hints: [
        'private String name; private int age;',
        'public boolean isAdult() { return age >= 18; }',
        'Нужны getName() и getAge()'
      ],
      verifierCode: `import java.util.*;
public class ExerciseVerifier {
  public List<String> verify(Class<?> cls) throws Exception {
    List<String> fails = new ArrayList<>();
    Object u = cls.getConstructor(String.class, int.class).newInstance("Ann", 20);
    Object u2 = cls.getConstructor(String.class, int.class).newInstance("Bob", 16);
    Object name = cls.getMethod("getName").invoke(u);
    Object age = cls.getMethod("getAge").invoke(u);
    Object adult = cls.getMethod("isAdult").invoke(u);
    Object adult2 = cls.getMethod("isAdult").invoke(u2);
    if (!"Ann".equals(name)) fails.add("getName: expected Ann");
    if (!Integer.valueOf(20).equals(age)) fails.add("getAge: expected 20");
    if (!Boolean.TRUE.equals(adult)) fails.add("isAdult(20) should be true");
    if (!Boolean.FALSE.equals(adult2)) fails.add("isAdult(16) should be false");
    return fails;
  }
}`
    })
  ]
});

add('junior', 'java-basics', 'j-collections.json', {
  id: 'j-collections',
  title: 'Коллекции: List, Set, Map',
  summary: 'Коллекции нужны каждый день: списки элементов, уникальные значения, словари тестовых данных.',
  theoryMarkdown: `# Коллекции

| Интерфейс | Реализации | Когда |
|-----------|------------|-------|
| List | ArrayList, LinkedList | Порядок, дубликаты, индекс |
| Set | HashSet, LinkedHashSet, TreeSet | Уникальность |
| Map | HashMap, LinkedHashMap, TreeMap | Ключ → значение |

## В тестах

\`\`\`java
List<WebElement> rows = driver.findElements(By.cssSelector("tr"));
assertEquals(3, rows.size());

Map<String, String> user = Map.of("email", "a@b.c", "pass", "secret");
\`\`\`

## Частые операции

- \`list.add\`, \`get\`, \`size\`, \`contains\`
- \`map.put\`, \`get\`, \`containsKey\`
- \`set.add\` — не добавит дубликат

## Java Streams (кратко)

\`\`\`java
List<String> texts = elements.stream()
    .map(WebElement::getText)
    .filter(t -> !t.isBlank())
    .toList();
\`\`\`
`,
  keyPoints: [
    'ArrayList — дефолтный List',
    'HashMap — быстрый словарь',
    'Streams удобны для map/filter над списками элементов'
  ],
  interviewTips: [
    'ArrayList vs LinkedList',
    'HashMap: как работает, что с null-ключом',
    'Чем ConcurrentHashMap отличается от HashMap?'
  ],
  quiz: [
    q('q1', 'Какая структура гарантирует уникальность элементов?',
      ['List', 'Set', 'Queue только', 'Массив int'], [1], 'Set не допускает дубликаты.', null),
    q('q2', 'Map.of(...) создаёт:',
      ['Изменяемую HashMap', 'Неизменяемую map фиксированного набора', 'TreeMap', 'Vector'],
      [1], 'Map.of — immutable map.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Уникальные строки',
      description: 'uniqueCount(String[] items) — сколько уникальных строк. null → 0.',
      className: 'CollectionTasks',
      starterCode: 'import java.util.*;\npublic class CollectionTasks {\n    public int uniqueCount(String[] items) {\n        // TODO: используй Set\n        return 0;\n    }\n}\n',
      hints: ['if (items == null) return 0;', 'return new HashSet<>(Arrays.asList(items)).size();'],
      testCases: [
        { name: 'с дублями', callExpression: 'uniqueCount({"a","b","a"})', expected: '2', expectedType: 'int' },
        { name: 'все уникальны', callExpression: 'uniqueCount({"x","y"})', expected: '2', expectedType: 'int' },
        { name: 'пустой', callExpression: 'uniqueCount({})', expected: '0', expectedType: 'int' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'Частотный словарь',
      description: 'freq(String[] words) верни Map слово→количество. Порядок не важен. Для проверки используем getCount.',
      className: 'CollectionTasks',
      difficulty: 'medium',
      starterCode: 'import java.util.*;\npublic class CollectionTasks {\n    public Map<String, Integer> freq(String[] words) {\n        // TODO\n        return Map.of();\n    }\n    public int getCount(String[] words, String key) {\n        return freq(words).getOrDefault(key, 0);\n    }\n}\n',
      hints: ['new HashMap<>()', 'for (String w : words) map.merge(w, 1, Integer::sum)'],
      testCases: [
        { name: 'a дважды', callExpression: 'getCount({"a","b","a"}, "a")', expected: '2', expectedType: 'int' },
        { name: 'нет ключа', callExpression: 'getCount({"a"}, "z")', expected: '0', expectedType: 'int' }
      ]
    })
  ]
});

add('junior', 'java-basics', 'j-exceptions.json', {
  id: 'j-exceptions',
  title: 'Исключения и обработка ошибок',
  summary: 'В тестах исключения — сигнал падения. Важно отличать fail теста от инфраструктурной ошибки.',
  theoryMarkdown: `# Исключения

## Иерархия

\`Throwable\` → \`Error\` | \`Exception\` → \`RuntimeException\` (unchecked)

## try / catch / finally / try-with-resources

\`\`\`java
try (WebDriver driver = openDriver()) {
    // test
} catch (NoSuchElementException e) {
    // элемент не найден
} 
\`\`\`

## В автотестах

- \`NoSuchElementException\` — плохой локатор или нет ожидания
- \`TimeoutException\` — условие wait не выполнилось
- \`AssertionError\` — ассерт не прошёл (это и есть failing test)

Не глотай исключения пустым catch — потеряешь сигнал.
`,
  keyPoints: [
    'AssertionError = упавший ассерт',
    'Не проглатывай исключения без лога',
    'try-with-resources закрывает AutoCloseable'
  ],
  interviewTips: [
    'checked vs unchecked',
    'Что будет если exception в @AfterEach?'
  ],
  quiz: [
    q('q1', 'NoSuchElementException — это:',
      ['checked', 'unchecked (RuntimeException)', 'Error', 'не исключение'],
      [1], 'Это runtime exception Selenium/Java.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'parseIntSafe',
      description: 'parseIntSafe(String s): если число — верни его, иначе -1. Используй try/catch NumberFormatException.',
      className: 'SafeParse',
      starterCode: 'public class SafeParse {\n    public int parseIntSafe(String s) {\n        // TODO\n        return -1;\n    }\n}\n',
      hints: ['try { return Integer.parseInt(s); } catch (NumberFormatException e) { return -1; }', 'Учти null → тоже -1'],
      testCases: [
        { name: 'число', callExpression: 'parseIntSafe("42")', expected: '42', expectedType: 'int' },
        { name: 'мусор', callExpression: 'parseIntSafe("x")', expected: '-1', expectedType: 'int' },
        { name: 'пустая', callExpression: 'parseIntSafe("")', expected: '-1', expectedType: 'int' }
      ]
    })
  ]
});

add('junior', 'java-basics', 'j-strings.json', {
  id: 'j-strings',
  title: 'Строки, регулярры, форматирование',
  summary: 'Парсинг текстов UI, регулярлов, JSON-строк — ежедневная рутина QA Auto.',
  theoryMarkdown: `# Строки

Полезные методы: \`contains\`, \`startsWith\`, \`trim\`, \`split\`, \`replace\`, \`formatted\`.

\`\`\`java
String price = el.getText().replace("₽", "").trim();
\`\`\`

## StringBuilder

Когда много конкатенаций в цикле — \`StringBuilder\`.

## Регулярки

\`\`\`java
boolean ok = text.matches("Order #\\\\d+");
\`\`\`
`,
  keyPoints: ['String immutable', 'trim() убирает пробелы по краям', 'split возвращает массив'],
  interviewTips: ['String vs StringBuilder vs StringBuffer', 'Почему String в pool?'],
  quiz: [
    q('q1', 'Что вернёт "  hi  ".trim()?',
      ['"  hi  "', '"hi"', '"hi  "', 'null'], [1], 'trim убирает leading/trailing whitespace.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Нормализация email',
      description: 'normalizeEmail(String email): trim + lower case. null → "".',
      className: 'TextUtils',
      starterCode: 'public class TextUtils {\n    public String normalizeEmail(String email) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['if (email == null) return "";', 'return email.trim().toLowerCase();'],
      testCases: [
        { name: 'норма', callExpression: 'normalizeEmail("  A@B.C ")', expected: 'a@b.c', expectedType: 'string' },
        { name: 'null', callExpression: 'normalizeEmail(null)', expected: '', expectedType: 'string' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'Извлечь число из цены',
      description: 'extractInt(String price) — достань первое целое из строки "Total: 1 250 rub" → 1250. Если нет — -1.',
      className: 'TextUtils',
      difficulty: 'hard',
      starterCode: 'public class TextUtils {\n    public int extractInt(String price) {\n        // TODO: убери пробелы/нецифры логично и распарсь\n        return -1;\n    }\n}\n',
      hints: [
        'Можно заменить всё кроме цифр: price.replaceAll("[^0-9]", "")',
        'Если пусто после очистки — верни -1'
      ],
      testCases: [
        { name: 'с пробелом', callExpression: 'extractInt("Total: 1 250 rub")', expected: '1250', expectedType: 'int' },
        { name: 'просто', callExpression: 'extractInt("99")', expected: '99', expectedType: 'int' },
        { name: 'нет цифр', callExpression: 'extractInt("none")', expected: '-1', expectedType: 'int' }
      ]
    })
  ]
});

console.log('Part 1 written, continuing...');
