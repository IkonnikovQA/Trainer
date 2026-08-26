const fs = require("fs");
const path = require("path");

function patch(rel, mut) {
  const file = path.join(__dirname, "..", "src", "main", "resources", "curriculum", "junior", rel);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  mut(lesson);
  fs.writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
  console.log("patched", rel);
}

patch("j-strings.json", (L) => {
  for (const e of L.exercises) {
    if (e.id === "e1") {
      e.description = [
        "Дано:",
        "- класс TextUtils",
        "- метод normalizeEmail(String email)",
        "- в теории раздел «Нормализация email»",
        "",
        "Задание:",
        "Если email == null — верни пустую строку. Иначе trim + toLowerCase.",
        "",
        "Результат:",
        '- normalizeEmail("  A@B.C ") → a@b.c',
        "- normalizeEmail(null) → (пустая строка)"
      ].join("\n");
      e.hints = ["Сначала проверь null", "Потом trim и toLowerCase"];
    }
    if (e.id === "e2") {
      e.description = [
        "Дано:",
        "- класс TextUtils",
        "- метод extractInt(String price)",
        "- в теории раздел «Извлечь число из цены»",
        "",
        "Задание:",
        "Оставь только цифры (replaceAll), распарсь в int. Если цифр нет — верни -1.",
        "",
        "Результат:",
        '- extractInt("Total: 1 250 rub") → 1250',
        '- extractInt("99") → 99',
        '- extractInt("none") → -1'
      ].join("\n");
      e.hints = ["Сначала вырежи всё кроме цифр", "Пустая строка цифр → -1"];
    }
  }
});

patch("j-collections.json", (L) => {
  for (const e of L.exercises) {
    const title = e.title || "";
    if (/уник/i.test(title)) {
      if (!e.description.includes("Уникальные строки")) {
        e.description = e.description.replace(
          "Задание:\n",
          "Задание:\nСм. теорию «Уникальные строки».\n"
        );
      }
    }
    if (/частот/i.test(title)) {
      if (!e.description.includes("Частотный словарь")) {
        e.description = e.description.replace(
          "Задание:\n",
          "Задание:\nСм. теорию «Частотный словарь» (getOrDefault / merge).\n"
        );
      }
    }
  }
});
