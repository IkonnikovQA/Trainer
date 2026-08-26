# QA Forge Portfolio Starter

Шаблон портфолио Auto QA (Java) для GitHub. Цель — показать рекрутеру/техлиду **реальные** UI + API тесты и CI.

Скопируй папку в отдельный репозиторий и замени `<you>` в README.

## Стек

- Java 17, Maven, JUnit 5
- Selenium 4 + WebDriverManager (реальный Chrome)
- RestAssured (demo API [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com))
- UI demo: [the-internet.herokuapp.com](https://the-internet.herokuapp.com)
- GitHub Actions (`mvn -B test`)

## Быстрый старт

```bash
cd examples/portfolio-starter
mvn -B test
```

Нужны: JDK 17+, Chrome (или Chromium), сеть.

UI-тесты можно отключить:

```bash
mvn -B test -DskipUi=true
```

## Структура

```
src/test/java/com/portfolio/
  ui/          # Page Objects + UI tests
  api/         # RestAssured clients + tests
  core/        # config, correlation id, drivers
```

## Что покрыто (must-have для Junior+)

| # | Сценарий | Где |
|---|----------|-----|
| 1 | Login form (valid / invalid) | UI |
| 2 | Checkboxes / basic interaction | UI |
| 3 | GET users list 200 | API |
| 4 | POST create user 201 | API |
| 5 | Negative: missing auth header style check | API |
| 6 | Correlation `X-Request-Id` на запросе | API filter |
| 7 | JSON field contract smoke | API |
| 8 | CI workflow | `.github/workflows/tests.yml` |

## Связь с тренажёром

В QA Forge пройди урок **«Портфолио к офферу»** (`m-portfolio`) и capstone, затем перенеси идеи сюда.  
FakeDriver / MockWebServer в тренажёре — для скорости; этот репозиторий — для найма.

## Резюме (вставь ссылку)

После push: добавь badge Actions и URL репо в резюме (см. корневой `CAREER.md`).
