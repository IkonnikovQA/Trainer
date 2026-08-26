# CAREER.md — путь от QA Forge к офферу Auto QA

Цель: **Strong Junior / Junior+ Auto QA (Java)** — UI + API тесты, CI, портфолио на GitHub, техсобес.

Тренажёр даёт знания и каты (FakeDriver / MockWebServer). Оффер требует ещё **реальный стек в GitHub** и практику собеса.

## Темп

| Режим | Часов/неделя | Ориентир до откликов |
|-------|--------------|----------------------|
| Интенсив | 12–15 | 8–12 недель |
| Спокойный | 6–8 | 3–4 месяца |

Не пытайся пройти все 70 уроков подряд. Сначала **трек «К офферу»** на главной (~18 must-pass), параллельно копируй `examples/portfolio-starter` в свой GitHub.

## Когда стартовать портфолио

После модулей Junior: Java basics + JUnit + Selenium (локаторы, waits, POM) + начало RestAssured.

Шаблон: [`examples/portfolio-starter`](examples/portfolio-starter/README.md).

## Порядок (must-pass)

1. Junior core: types → control → collections → junit → assertions → selenium-intro → locators → waits → pom-intro → git → debug  
2. Middle core: restassured → restassured-deep → jwt-auth → pom-fluent → flaky → stale-flaky → soft-assert → capstone → **portfolio**  
3. CI кругозор: github-actions (в тренажёре + реальный workflow в портфолио)  
4. Soft: interview-soft + mock-сессии на `/interview`

## Чеклист самооценки (к откликам)

- [ ] Junior ≥ 80% уроков закрыт  
- [ ] Пишешь Page Object и WebDriverWait без sleep  
- [ ] RestAssured: given/when/then, 401 vs 403  
- [ ] GitHub-репо: `mvn test` зелёный (Chrome UI + API)  
- [ ] GitHub Actions badge зелёный  
- [ ] README портфолио: стек, как запустить, что покрыто  
- [ ] 2 mock-сессии 30–45 мин на `/interview` без провала по базе  
- [ ] Резюме 1 стр. + ссылка на GitHub + 3 STAR-истории  

## Качество контента тренажёра

```bash
node scripts/lint-curriculum-practice.js
node scripts/lint-curriculum-completeness.js
```

Или одной командой: `node scripts/check-curriculum.js`  
CI: `.github/workflows/curriculum-lint.yml`

## Симуляции vs работа

| В тренажёре | На работе / в портфолио |
|-------------|-------------------------|
| FakeDriver | Реальный Chrome |
| MockWebServer | Живой/demo API |
| artifact YAML (GHA/Jenkins) | Реальный pipeline |
| policy/kata Senior | Кругозор; мышцы — в портфолио |

В уроках с симуляцией смотри блок **«В работе»** / пометку lab-упрощения.

## Резюме (черновик)

```
Auto QA Engineer (Java) | Junior+
Стек: Java 17, Maven, JUnit 5, Selenium 4, RestAssured, GitHub Actions
Портфолио: https://github.com/<you>/<repo> — UI smoke + API tests, CI
- Page Object + явные ожидания; без Thread.sleep в UI
- API: auth 401/403, CRUD через RestAssured
- CI: PR → mvn test, артефакты отчётов
```

STAR: Situation → Task → Action → Result (с цифрой: flake%, время CI).

## Definition of Done roadmap

См. чеклист выше + умение за 10 минут вслух объяснить свой фреймворк и один упавший тест.
