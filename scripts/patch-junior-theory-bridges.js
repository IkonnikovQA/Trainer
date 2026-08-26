const fs = require("fs");
const path = require("path");

function load(rel) {
  const file = path.join(__dirname, "..", "src", "main", "resources", "curriculum", "junior", rel);
  return { file, lesson: JSON.parse(fs.readFileSync(file, "utf8")) };
}

function save(file, lesson) {
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
}

{
  const { file, lesson } = load("j-strings.json");
  lesson.theoryMarkdown = `# Строки и регулярки

В автотестах постоянно чистишь текст с UI/API: пробелы, регистр, цифры из цены.

## Нормализация email (практика 1)

1. \`null\` → сразу верни пустую строку \`""\`.
2. \`trim()\` убирает пробелы по краям.
3. \`toLowerCase()\` приводит к нижнему регистру.

\`\`\`java
String normalizeEmail(String email) {
    if (email == null) return "";
    return email.trim().toLowerCase();
}
\`\`\`

## Извлечь число из цены (практика 2)

Оставь только цифры через \`replaceAll\`, потом \`Integer.parseInt\`. Если цифр нет — верни \`-1\`.

\`\`\`java
String digits = price.replaceAll("[^0-9]", ""); // "Total: 1 250 rub" -> "1250"
if (digits.isEmpty()) return -1;
return Integer.parseInt(digits);
\`\`\`

Полезные методы рядом: \`contains\`, \`startsWith\`, \`split\`, \`replace\`, \`formatted\`.

## StringBuilder

Когда много склеек в цикле — \`StringBuilder\` (\`String\` immutable).
`;
  lesson.keyPoints = [
    "null → \"\", потом trim + toLowerCase",
    "replaceAll(\"[^0-9]\", \"\") вытаскивает цифры",
    "String immutable; в цикле — StringBuilder"
  ];
  save(file, lesson);
  console.log("patched j-strings");
}

{
  const { file, lesson } = load("j-collections.json");
  lesson.theoryMarkdown = `# Коллекции

| Интерфейс | Реализации | Когда |
|-----------|------------|-------|
| List | ArrayList, LinkedList | Порядок, дубликаты, индекс |
| Set | HashSet, LinkedHashSet, TreeSet | Уникальность |
| Map | HashMap, LinkedHashMap, TreeMap | Ключ → значение |

## Уникальные строки (практика 1)

\`HashSet\` сам отбрасывает дубликаты. Можно собрать из массива/списка:

\`\`\`java
Set<String> unique = new HashSet<>(Arrays.asList(items));
// или: new HashSet<>(list);
\`\`\`

## Частотный словарь (практика 2)

Считаем, сколько раз встретилось каждое слово. Удобный приём — \`getOrDefault\` или \`merge\`:

\`\`\`java
Map<String, Integer> freq = new HashMap<>();
for (String word : words) {
    freq.put(word, freq.getOrDefault(word, 0) + 1);
    // то же: freq.merge(word, 1, Integer::sum);
}
\`\`\`

## Частые операции

- \`list.add\`, \`get\`, \`size\`, \`contains\`
- \`map.put\`, \`get\`, \`containsKey\`, \`getOrDefault\`, \`merge\`
- \`set.add\` — не добавит дубликат

## Java Streams (кратко)

\`\`\`java
List<String> texts = elements.stream()
    .map(WebElement::getText)
    .filter(t -> !t.isBlank())
    .toList();
\`\`\`
`;
  lesson.keyPoints = [
    "HashSet убирает дубликаты",
    "Частоты: getOrDefault или merge",
    "ArrayList — дефолтный List, HashMap — быстрый словарь"
  ];
  save(file, lesson);
  console.log("patched j-collections");
}
