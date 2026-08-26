# QA Forge — Java Automation Trainer

Локальный тренажёр для автотестировщика на Java: **Junior → Middle → Senior**.

Теория, квизы, **реальная практика** (Selenium API на FakeDriver, RestAssured + MockWebServer, JUnit launcher, Jenkinsfile/Dockerfile/GHA checks), подсказки и банк собеседования.

**Путь к офферу:** см. [CAREER.md](CAREER.md) — темп, must-pass уроки, портфолио [`examples/portfolio-starter`](examples/portfolio-starter), mock-сессии на `/interview`.

## Требования

- JDK 17+ (именно JDK — нужен `javac`)
- Maven 3.9+
- Браузер

Monaco Editor вендорится локально в `static/vendor/monaco` (офлайн-редактор; CDN — запасной fallback).

## Запуск

```bash
mvn spring-boot:run
```

Открой: http://localhost:8080

```bash
mvn -DskipTests package
java -jar target/java-qa-trainer-1.0.0.jar
```

## Режимы практики

| mode | Что пишешь | Как проверяется |
|------|------------|-----------------|
| `java` | Обычный Java-класс | testCases / verifier |
| `selenium-fake` | Код с `WebDriver`/`By`/`WebDriverWait` | In-memory **FakeDriver** + DOM fixture |
| `http` | RestAssured-клиент | **MockWebServer** на случайном порту |
| `junit` | Класс с `@Test` | JUnit Platform Launcher |
| `artifact` | Dockerfile / Jenkinsfile / compose / GHA YAML | Правила структуры (не string-kata) |

Лимит выполнения student-кода ~5с (защита от бесконечных циклов).

После N неудачных попыток доступна кнопка **Показать решение** (отдельный API, без утечки в `/check`).  
Подсказки открываются только после хотя бы одной неудачной проверки.  
Урок нельзя «отметить пройденным» без квиза и практики.

Для проверки Selenium/RestAssured из `java -jar` нужны зависимости в `target/dependency` (копируются при `mvn package` / `mvn dependency:copy-dependencies`). Код студента выполняется в **отдельном JVM-процессе**.

## Горячие клавиши

- **Ctrl+Enter** в редакторе — проверить решение

## Прогресс

Файл: `workspace/progress.json` (код, подсказки, fail counts, completed, закладки).

На главной: **поиск уроков**, **экспорт/импорт** прогресса.

В уроке: шаги 1/2/3 (клавиши), мобильное меню «Курс», закладка ★, понятные ошибки компиляции.

## Темы

- **Junior:** Java, Maven, JUnit 5, TestNG vs JUnit, Selenium + Selenium 4, локаторы, waits, POM, Git, отладка  
- **Middle:** Advanced Selenium, Fluent POM, RestAssured (+ deep / JSON contract / MockMvc-стиль), данные, Allure, параллель, Mockito, Cucumber, DB, Selenide, паттерны, flaky/StaleElement, Awaitility-poll, soft asserts, **capstone UI+API+JUnit**  
- **Senior:** архитектура, пирамида, Jenkins, **GitHub Actions**, Docker, Compose/Grid, Testcontainers, Playwright strategy, cloud grid, metrics, security, contracts  

**Прогрессия:** Middle открывается после ~80% Junior, Senior — после ~80% Middle. Рекомендации и банк собеседования не прыгают вперёд.

Каждый урок = **теория + ≥1 quiz + ≥1 практика** (java / selenium-fake / http / junit / artifact).

Контент: `src/main/resources/curriculum/`.

Скрипты генерации/патчей: `scripts/`.

## Качество curriculum

```bash
node scripts/check-curriculum.js
```

Проверяет формат практики (Дано/Задание/Результат) и полноту теория↔квиз.  
CI: `.github/workflows/curriculum-lint.yml`.

## Портфолио (реальный Chrome + API + GHA)

Шаблон для GitHub: [`examples/portfolio-starter`](examples/portfolio-starter/README.md) — это мышцы для найма; тренажёр остаётся быстрыми катами.

## Важно

Всё локально. MockWebServer поднимается только на время проверки HTTP-упражнения и сразу закрывается.  
Часть Senior/CI-лаб — **симуляции** (artifact/policy); реальный pipeline собирай в портфолио.
