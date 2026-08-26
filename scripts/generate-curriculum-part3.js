/**
 * Part 3: Senior lessons + index.json
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function writeLesson(level, file, lesson) {
  fs.mkdirSync(path.join(ROOT, level), { recursive: true });
  fs.writeFileSync(path.join(ROOT, level, file), JSON.stringify(lesson, null, 2), 'utf8');
}
function q(id, question, options, correctIndexes, explanation, hint, type = 'single') {
  return { id, type, question, options, correctIndexes, explanation, hint };
}
function ex(p) {
  return { difficulty: 'easy', hints: [], testCases: [], verifierCode: null, solutionCode: null, methodName: null, ...p };
}
function add(levelId, moduleId, file, lesson) {
  lesson.levelId = levelId;
  lesson.moduleId = moduleId;
  writeLesson(levelId, file, lesson);
}

add('senior', 'architecture', 's-framework.json', {
  id: 's-framework',
  title: 'Архитектура тестового фреймворка',
  summary: 'Слои, границы ответственности, расширяемость и стоимость поддержки.',
  theoryMarkdown: `# Архитектура фреймворка

## Слои

1. **Tests** — сценарии, ассерты высокого уровня
2. **Business / Steps / Flows** — пользовательские действия
3. **Pages / API clients** — технический доступ
4. **Core** — driver, http, config, waits, retry
5. **Infra** — reporting, CI helpers

## Принципы

- Зависимости направлены внутрь (tests → core, не наоборот)
- Конфиг через env/profiles (local/ci/stage)
- Параллель by design
- Быстрый feedback: теги smoke/regression

## Anti-patterns

- God class Utils
- Static state повсюду
- UI для всего
- Нет владельца качества тестов
`,
  keyPoints: ['Слои и границы', 'Config/profiles', 'Smoke отдельно от полного регресса'],
  interviewTips: ['Нарисуй архитектуру своего фреймворка', 'Как добавляешь новый тип проверок?'],
  quiz: [
    q('q1', 'Тест-класс должен зависеть от:',
      ['Jenkins internals напрямую', 'Бизнес/page API, не от CSS', 'Абсолютных xpath в каждом тесте', 'Thread.sleep утилит'],
      [1], 'Тесты говорят бизнес-языком.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Выбор набора тегов',
      description: 'selectSuite(isPr): для PR верни "smoke", иначе "regression".',
      className: 'SuiteSelect',
      starterCode: 'public class SuiteSelect {\n    public String selectSuite(boolean isPr) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['return isPr ? "smoke" : "regression";'],
      testCases: [
        { name: 'pr', callExpression: 'selectSuite(true)', expected: 'smoke', expectedType: 'string' },
        { name: 'nightly', callExpression: 'selectSuite(false)', expected: 'regression', expectedType: 'string' }
      ]
    })
  ]
});

add('senior', 'architecture', 's-pyramid.json', {
  id: 's-pyramid',
  title: 'Пирамида тестирования и стратегия покрытия',
  summary: 'Senior выбирает уровень проверки по риску и стоимости.',
  theoryMarkdown: `# Пирамида

\`\`\`
    UI E2E (мало)
   API / Integration
  Unit / Component (много)
\`\`\`

## Практика

- Бизнес-правила — unit/API
- Критические user journeys — UI
- Не дублируй одну проверку на всех уровнях без причины

## Risk-based

Критичность × вероятность → приоритет автоматизации.
`,
  keyPoints: ['UI дорогой', 'API даёт ROI', 'Риск важнее % coverage'],
  interviewTips: ['Как решаешь, что автоматизировать?', 'Что оставишь ручным?'],
  quiz: [
    q('q1', 'Самый дорогой в поддержке обычно уровень:',
      ['Unit', 'API', 'UI E2E', 'Статический анализ'], [2], 'UI хрупкий и медленный.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Risk score',
      description: 'score(criticality, likelihood) = criticality * likelihood (1..3).',
      className: 'Risk',
      starterCode: 'public class Risk {\n    public int score(int criticality, int likelihood) {\n        // TODO\n        return 0;\n    }\n}\n',
      hints: ['return criticality * likelihood;'],
      testCases: [
        { name: 'high', callExpression: 'score(3, 3)', expected: '9', expectedType: 'int' },
        { name: 'low', callExpression: 'score(1, 2)', expected: '2', expectedType: 'int' }
      ]
    })
  ]
});

add('senior', 'ci', 's-jenkins.json', {
  id: 's-jenkins',
  title: 'Jenkins CI: job, pipeline, артефакты',
  summary: 'Настройка CI — обязательный Senior-скилл: пайплайны, агенты, отчёты.',
  theoryMarkdown: `# Jenkins для автотестов

## Declarative Pipeline

\`\`\`groovy
pipeline {
  agent any
  stages {
    stage('Build') { steps { sh 'mvn -B -DskipTests package' } }
    stage('Test')  { steps { sh 'mvn -B test' } }
  }
  post {
    always {
      junit '**/surefire-reports/*.xml'
      archiveArtifacts artifacts: '**/allure-results/**', allowEmptyArchive: true
    }
  }
}
\`\`\`

## Важное

- Отдельный agent/label с браузерами или Docker
- Credentials plugin для секретов
- Параметры: suite, env, browser
- Таймауты стадии
- Уведомления (Slack/email) при fail

## PR checks vs Nightly

PR: smoke быстрый. Nightly: полный регресс + отчёт.
`,
  keyPoints: ['Pipeline as code', 'junit/allure в post', 'Секреты через credentials'],
  interviewTips: ['Declarative vs Scripted', 'Как параллелишь stages?', 'Blue Ocean/controllers'],
  quiz: [
    q('q1', 'Где обычно публикуют JUnit XML?',
      ['stage checkout только', 'post { junit ... }', 'в README', 'в CSS'], [1], 'post always/failure/success.', null),
    q('q2', 'Секреты в Jenkins лучше хранить в:',
      ['Jenkinsfile plaintext', 'Credentials store', 'git commit', 'скриншоте'], [1], 'Credentials plugin.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Команда Maven suite',
      description: 'mvnCmd(suite): "mvn -B test -Dgroups=" + suite',
      className: 'JenkinsCmds',
      starterCode: 'public class JenkinsCmds {\n    public String mvnCmd(String suite) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['"mvn -B test -Dgroups=" + suite'],
      testCases: [
        { name: 'smoke', callExpression: 'mvnCmd("smoke")', expected: 'mvn -B test -Dgroups=smoke', expectedType: 'string' }
      ]
    }),
    ex({
      id: 'e2',
      title: 'Нужен ли nightly полный прогон?',
      description: 'fullNightly(dayOfWeek): true для всех дней кроме Sunday(7) — для тренировки: false только если day==7.',
      className: 'JenkinsCmds',
      starterCode: 'public class JenkinsCmds {\n    public boolean fullNightly(int dayOfWeek) {\n        // TODO\n        return false;\n    }\n}\n',
      hints: ['return dayOfWeek != 7;'],
      testCases: [
        { name: 'mon', callExpression: 'fullNightly(1)', expected: 'true', expectedType: 'boolean' },
        { name: 'sun', callExpression: 'fullNightly(7)', expected: 'false', expectedType: 'boolean' }
      ]
    })
  ]
});

add('senior', 'ci', 's-jenkinsfile.json', {
  id: 's-jenkinsfile',
  title: 'Jenkinsfile на практике: параметры и параллель',
  summary: 'Пишем пайплайн как продукт: параметры, matrix, fail-fast.',
  theoryMarkdown: `# Jenkinsfile practices

## parameters

\`choice(name: 'ENV', choices: ['stage','prod-like'])\`

## parallel

\`\`\`groovy
parallel(
  chrome: { sh 'mvn test -Dbrowser=chrome' },
  api:    { sh 'mvn test -Dgroups=api' }
)
\`\`\`

## failFast

Имеет смысл для smoke; для сбора всех сигналов nightly иногда выключают.

## agent docker

\`agent { docker { image 'maven:3.9-eclipse-temurin-17' } }\`
`,
  keyPoints: ['Параметры запуска', 'parallel stages', 'Docker agent для воспроизводимости'],
  interviewTips: ['Как кэшируешь .m2?', 'Multibranch pipeline'],
  quiz: [
    q('q1', 'Multibranch Pipeline нужен чтобы:',
      ['Хранить пароли в git', 'Автоматически строить jobs для веток', 'Заменить Maven', 'Отключить тесты'],
      [1], 'Job на каждую ветку/PR.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Matrix label',
      description: 'matrixLabel(browser, env) → browser + "@" + env',
      className: 'Matrix',
      starterCode: 'public class Matrix {\n    public String matrixLabel(String browser, String env) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['browser + "@" + env'],
      testCases: [
        { name: 'ok', callExpression: 'matrixLabel("chrome", "stage")', expected: 'chrome@stage', expectedType: 'string' }
      ]
    })
  ]
});

add('senior', 'docker', 's-docker.json', {
  id: 's-docker',
  title: 'Docker для автотестов',
  summary: 'Контейнеры выравнивают окружение JDK/браузера/зависимостей.',
  theoryMarkdown: `# Docker

## Зачем QA

- Одинаковый runtime в CI и локально
- Поднятие зависимостей (БД, mock-server)
- Selenium Grid / standalone chrome

## Базовые команды

\`\`\`
docker build -t qa-tests .
docker run --rm qa-tests
docker compose up -d
\`\`\`

## Dockerfile (идея)

\`FROM maven:3.9-eclipse-temurin-17\` → copy pom → dependency:go-offline → copy src → \`mvn test\`

## Важно

- Не клади секреты в image layers
- .dockerignore для target/
- Версионируй образы
`,
  keyPoints: ['Воспроизводимость', 'compose для зависимостей', 'Секреты не в образе'],
  interviewTips: ['IMAGE vs container', 'Как дебажить падение в контейнере?', 'Volumes'],
  quiz: [
    q('q1', 'Зачем .dockerignore?',
      ['Ускорить сеть браузера', 'Не отправлять мусор (target/, .git) в build context', 'Заменить pom', 'Нужен только Windows'],
      [1], 'Меньше context = быстрее/чище build.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'docker run команда',
      description: 'runCmd(image, suite): "docker run --rm -e SUITE=" + suite + " " + image',
      className: 'DockerCmds',
      starterCode: 'public class DockerCmds {\n    public String runCmd(String image, String suite) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['Склей строку точно по описанию'],
      testCases: [
        { name: 'ok', callExpression: 'runCmd("qa:1", "smoke")', expected: 'docker run --rm -e SUITE=smoke qa:1', expectedType: 'string' }
      ]
    })
  ]
});

add('senior', 'docker', 's-compose-grid.json', {
  id: 's-compose-grid',
  title: 'Docker Compose и Selenium Grid',
  summary: 'Сетка браузеров и сервисы через compose — типичный Senior-сетап.',
  theoryMarkdown: `# Compose + Grid

## Идея

\`docker-compose.yml\`: hub + chrome/firefox nodes + mockapi.

Тесты в CI указывают \`remoteUrl=http://hub:4444\`.

## Selenium Grid 4

Router/Distributor/Nodes... Для практики часто используют готовые образы selenium.

## Проблемы

- Нехватка shared memory для Chrome (\`--shm-size\`)
- Сеть между сервисами
- Старт гонки: wait-for-hub

## Облако

BrowserStack/LambdaTest — альтернатива своему Grid.
`,
  keyPoints: ['remote WebDriver URL', 'shm-size для Chrome', 'Healthcheck/wait сервисов'],
  interviewTips: ['Grid vs облако', 'Как масштабировать nodes?', 'VNC для дебага'],
  quiz: [
    q('q1', 'Тесты на Grid используют:',
      ['Только локальный ChromeDriver всегда', 'RemoteWebDriver на hub URL', 'Internet Explorer only', 'Без драйвера'],
      [1], 'RemoteWebDriver.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Remote URL',
      description: 'hubUrl(host, port) → "http://" + host + ":" + port + "/wd/hub" (классический путь; для Grid4 часто /). Для тренажёра используй /wd/hub.',
      className: 'GridUrl',
      starterCode: 'public class GridUrl {\n    public String hubUrl(String host, int port) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['"http://" + host + ":" + port + "/wd/hub"'],
      testCases: [
        { name: 'ok', callExpression: 'hubUrl("localhost", 4444)', expected: 'http://localhost:4444/wd/hub', expectedType: 'string' }
      ]
    })
  ]
});

add('senior', 'docker', 's-dockerfile-practice.json', {
  id: 's-dockerfile-practice',
  title: 'Dockerfile и кэш зависимостей Maven',
  summary: 'Правильный порядок слоёв ускоряет CI в разы.',
  theoryMarkdown: `# Dockerfile caching

Плохо: COPY . /app сразу — любой чих в исходниках сбрасывает кэш зависимостей.

Хорошо:

1. COPY pom.xml
2. RUN mvn -B dependency:go-offline
3. COPY src
4. RUN mvn -B test

## Multi-stage

Иногда build stage отдельно от runtime — для тестов чаще один Maven image.
`,
  keyPoints: ['Сначала pom — кэш deps', 'dockerignore', 'Детерминированные версии'],
  interviewTips: ['Как ускорял CI image build?', 'Layer caching'],
  quiz: [
    q('q1', 'Почему сначала копируют pom.xml?',
      ['Так красивее', 'Чтобы кэшировать слой зависимостей', 'Требование Docker Hub', 'Без src нельзя'],
      [1], 'deps слой переиспользуется.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Порядок слоёв',
      description: 'better(a,b): верни true если a=="pom-first" и b=="src-second".',
      className: 'DockerOrder',
      starterCode: 'public class DockerOrder {\n    public boolean better(String step1, String step2) {\n        // TODO\n        return false;\n    }\n}\n',
      hints: ['"pom-first".equals(step1) && "src-second".equals(step2)'],
      testCases: [
        { name: 'good', callExpression: 'better("pom-first", "src-second")', expected: 'true', expectedType: 'boolean' },
        { name: 'bad', callExpression: 'better("src-first", "pom-second")', expected: 'false', expectedType: 'boolean' }
      ]
    })
  ]
});

add('senior', 'process', 's-codereview.json', {
  id: 's-codereview',
  title: 'Code review автотестов',
  summary: 'Senior растит команду через ревью: стабильность, ценность, ясность.',
  theoryMarkdown: `# Review checklist

- Тест независим?
- Есть ли смысл/риск?
- Локаторы стабильны?
- Waits корректны, нет sleep?
- Данные уникальны/чистятся?
- Ассерты проверяют поведение?
- Логи/секреты ок?
- Не раздувает время CI без нужды?

## Тон

Ревью про продукт качества, не про «мой стиль единственный».
`,
  keyPoints: ['Ценность теста', 'Стабильность', 'Читаемость'],
  interviewTips: ['Как даёшь фидбек junior?', 'Когда просишь переписать?'],
  quiz: [
    q('q1', 'Thread.sleep(10000) в PR — действие ревьюера:',
      ['Approve сразу', 'Попросить заменить на явное ожидание/условие', 'Игнорировать', 'Удалить весь репозиторий'],
      [1], 'Sleep — red flag.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Severity finding',
      description: 'severity(String issue): sleep→HIGH, duplicated locator→MEDIUM, naming→LOW, else INFO.',
      className: 'Review',
      starterCode: 'public class Review {\n    public String severity(String issue) {\n        // TODO\n        return "INFO";\n    }\n}\n',
      hints: ['сравни строки issue'],
      testCases: [
        { name: 'sleep', callExpression: 'severity("sleep")', expected: 'HIGH', expectedType: 'string' },
        { name: 'dup', callExpression: 'severity("duplicated locator")', expected: 'MEDIUM', expectedType: 'string' },
        { name: 'name', callExpression: 'severity("naming")', expected: 'LOW', expectedType: 'string' }
      ]
    })
  ]
});

add('senior', 'process', 's-metrics.json', {
  id: 's-metrics',
  title: 'Метрики качества автоматизации',
  summary: 'Управляй автоматизацией цифрами: сигнал, скорость, flake, ROI.',
  theoryMarkdown: `# Метрики

- **Time to feedback** — сколько ждём результат PR
- **Flake rate**
- **Pass rate критичного набора**
- **MTTR** разбора падений
- **% green builds** (осторожно с gaming)
- **Автоматизированные риск-области**, не просто число тестов

## Ловушка

«У нас 5000 UI тестов» ≠ зрелость.
`,
  keyPoints: ['Скорость фидбека', 'Flake rate', 'Риск-покрытие'],
  interviewTips: ['Какие метрики показываешь менеджеру?', 'Как защищаешь ROI автоматизации?'],
  quiz: [
    q('q1', 'Самая полезная метрика для PR-гейта:',
      ['Число Thread.sleep', 'Время feedback + стабильность smoke', 'LOC тестов', 'Число PageObject'],
      [1], 'Быстрый и стабильный сигнал.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Feedback minutes',
      description: 'feedbackMin(queueSec, runSec) = (queueSec+runSec+59)/60 целые минуты вверх.',
      className: 'Metrics',
      starterCode: 'public class Metrics {\n    public int feedbackMin(int queueSec, int runSec) {\n        // TODO\n        return 0;\n    }\n}\n',
      hints: ['(queueSec + runSec + 59) / 60'],
      testCases: [
        { name: '90s', callExpression: 'feedbackMin(30, 60)', expected: '2', expectedType: 'int' },
        { name: 'exact', callExpression: 'feedbackMin(0, 60)', expected: '1', expectedType: 'int' }
      ]
    })
  ]
});

add('senior', 'process', 's-interview-soft.json', {
  id: 's-interview-soft',
  title: 'Собеседование: системные ответы Senior',
  summary: 'Как структурировать ответы: STAR, trade-offs, метрики, влияние.',
  theoryMarkdown: `# Как отвечать на Senior-интервью

## Структура

1. Контекст
2. Проблема/риск
3. Варианты и trade-offs
4. Решение
5. Результат (метрика)

## Типовые темы

- Снижение времени регресса
- Борьба с flaky
- Внедрение API слоя
- Построение CI
- Менторство

## Чего избегать

- «Мы просто написали много UI»
- Нет цифр/эффекта
- Обвинение всех вокруг без своей роли
`,
  keyPoints: ['Trade-offs', 'Метрики эффекта', 'Твоя роль в результате'],
  interviewTips: ['Подготовь 3 кейса STAR', 'Будь готов к live coding waits/POM/API'],
  quiz: [
    q('q1', 'Хороший Senior-ответ содержит:',
      ['Только названия инструментов', 'Проблему, варианты, выбор, эффект', 'Мемы', 'Список всех аннотаций JUnit'],
      [1], 'Структура и trade-offs.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Сжатие STAR',
      description: 'star(s,t,a,r) → "S:"+s+"|T:"+t+"|A:"+a+"|R:"+r',
      className: 'Star',
      starterCode: 'public class Star {\n    public String star(String s, String t, String a, String r) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['Склей по формату'],
      testCases: [
        { name: 'ok', callExpression: 'star("c","p","d","m")', expected: 'S:c|T:p|A:d|R:m', expectedType: 'string' }
      ]
    })
  ]
});

add('senior', 'advanced', 's-contract.json', {
  id: 's-contract',
  title: 'Контрактное тестирование',
  summary: 'Ловим ломающие API-изменения раньше полного E2E.',
  theoryMarkdown: `# Contract testing

Consumer задаёт ожидания к API provider. Проверяется совместимость контракта (Pact и др.).

## Ценность

- Быстрее полного стенда
- Чёткие соглашения команд
- Меньше сюрпризов на интеграции

## Не заменяет

E2E на критических потоках всё равно нужны.
`,
  keyPoints: ['Consumer/provider', 'Ранний сигнал совместимости', 'Дополнение пирамиды'],
  interviewTips: ['Pact flow', 'Чем отличается от schema validation?'],
  quiz: [
    q('q1', 'Контрактные тесты в первую очередь проверяют:',
      ['Пиксели UI', 'Совместимость ожиданий consumer и API provider', 'Скорость CSS', 'Jenkins UI'],
      [1], 'Соглашение сторон API.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Совместимость версий',
      description: 'compatible(reqMajor, provMajor): true если равны major.',
      className: 'Contract',
      starterCode: 'public class Contract {\n    public boolean compatible(int reqMajor, int provMajor) {\n        // TODO\n        return false;\n    }\n}\n',
      hints: ['return reqMajor == provMajor;'],
      testCases: [
        { name: 'ok', callExpression: 'compatible(2, 2)', expected: 'true', expectedType: 'boolean' },
        { name: 'bad', callExpression: 'compatible(2, 3)', expected: 'false', expectedType: 'boolean' }
      ]
    })
  ]
});

add('senior', 'advanced', 's-performance-basics.json', {
  id: 's-performance-basics',
  title: 'Основы performance для QA Auto',
  summary: 'Не путай функциональные UI-тесты с нагрузочными. Знай базу метрик.',
  theoryMarkdown: `# Performance basics

## Метрики

- latency (p50/p95/p99)
- throughput (RPS)
- error rate
- saturation (CPU/IO)

## Инструменты (обзор)

JMeter, Gatling, k6. Для фронта — Lighthouse (не нагрузка бэка).

## Роль автоматизатора

Иногда встраивает smoke perf в CI (не полный load), следит за деградацией p95.
`,
  keyPoints: ['p95 важнее среднего', 'Нагрузка ≠ UI selenium loop', 'Smoke perf в CI возможен'],
  interviewTips: ['Что такое percentile?', 'Как отличить perf баг от функционального?'],
  quiz: [
    q('q1', 'p95 latency — это:',
      ['Среднее', '95-й процентиль времени ответа', 'Максимум всегда', 'CPU'], [1], 'Percentile.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Простая p-оценка',
      description: 'isSlow(p95, budget): true если p95 > budget.',
      className: 'Perf',
      starterCode: 'public class Perf {\n    public boolean isSlow(int p95, int budget) {\n        // TODO\n        return false;\n    }\n}\n',
      hints: ['return p95 > budget;'],
      testCases: [
        { name: 'slow', callExpression: 'isSlow(900, 500)', expected: 'true', expectedType: 'boolean' },
        { name: 'ok', callExpression: 'isSlow(400, 500)', expected: 'false', expectedType: 'boolean' }
      ]
    })
  ]
});

add('senior', 'advanced', 's-security-qa.json', {
  id: 's-security-qa',
  title: 'Security awareness для автоматизатора',
  summary: 'База: секреты, OWASP top risks, что проверять в API/UI тестах.',
  theoryMarkdown: `# Security для QA Auto

## Must

- Не коммитить токены/пароли
- Маскировать секреты в логах/Allure
- Проверять authZ: 401/403 на защищённых ресурсах
- Не отключать SSL проверки «навсегда» без понимания

## Полезно знать

OWASP Top 10: injection, broken auth, XSS, SSRF...

Автотесты не заменяют security audit, но ловят регрессии контроля доступа.
`,
  keyPoints: ['Секреты', 'Проверки доступа', 'Регрессии authZ'],
  interviewTips: ['Как храните secrets в CI?', 'Пример теста на 403'],
  quiz: [
    q('q1', 'Access token в Allure attachment — это:',
      ['Best practice', 'Утечка секрета, нужно маскировать', 'Требование JUnit', 'Ускоряет тест'],
      [1], 'Секреты маскируем.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Ожидаемый код доступа',
      description: 'expectedCode(boolean authenticated, boolean allowed): 401 если !authenticated, 403 если auth но !allowed, иначе 200.',
      className: 'Authz',
      difficulty: 'medium',
      starterCode: 'public class Authz {\n    public int expectedCode(boolean authenticated, boolean allowed) {\n        // TODO\n        return 200;\n    }\n}\n',
      hints: ['сначала проверка authenticated', 'потом allowed'],
      testCases: [
        { name: 'unauth', callExpression: 'expectedCode(false, true)', expected: '401', expectedType: 'int' },
        { name: 'forbidden', callExpression: 'expectedCode(true, false)', expected: '403', expectedType: 'int' },
        { name: 'ok', callExpression: 'expectedCode(true, true)', expected: '200', expectedType: 'int' }
      ]
    })
  ]
});

add('senior', 'advanced', 's-observability.json', {
  id: 's-observability',
  title: 'Логи, трейсы, стабильность прогонов',
  summary: 'Senior связывает падения тестов с наблюдаемостью системы.',
  theoryMarkdown: `# Observability ↔ Tests

Когда падает E2E, полезны:

- correlation id в запросах
- логи сервиса за период теста
- метрики ошибок

## В тестах

Прокидывай \`X-Request-Id\` / trace header, прикладывай в отчёт.

Это сокращает MTTR.
`,
  keyPoints: ['Correlation id', 'Артефакты + логи системы', 'MTTR'],
  interviewTips: ['Как расследуешь падение только на CI?', 'Что такое distributed tracing?'],
  quiz: [
    q('q1', 'Correlation id помогает:',
      ['Ускорить Chrome', 'Связать действия теста с логами backend', 'Заменить ассерты', 'Скрыть флейки'],
      [1], 'Сквозная трассировка.', null)
  ],
  exercises: [
    ex({
      id: 'e1',
      title: 'Request id',
      description: 'requestId(testName, ts): testName + "-" + ts',
      className: 'Trace',
      starterCode: 'public class Trace {\n    public String requestId(String testName, long ts) {\n        // TODO\n        return "";\n    }\n}\n',
      hints: ['testName + "-" + ts'],
      testCases: [
        { name: 'ok', callExpression: 'requestId("login", 100)', expected: 'login-100', expectedType: 'string' }
      ]
    })
  ]
});

// Build index.json from filesystem + curated structure
const index = {
  title: 'QA Forge — Java Automation Trainer',
  description: 'Локальный тренажёр Junior → Middle → Senior: теория, квизы с мгновенной проверкой, практика Java с автотестами и подсказками. От базы языка до Jenkins, Docker и стратегии качества.',
  levels: [
    {
      id: 'junior',
      name: 'Junior',
      title: 'Фундамент Java и UI/API тестирования',
      description: 'Язык, Maven, JUnit, Selenium, локаторы, waits, POM, Git и отладка.',
      color: '#1f6f5b',
      modules: [
        {
          id: 'java-basics',
          title: 'Java с нуля для автотестов',
          description: 'Типы, контроль потока, OOP, коллекции, исключения, строки, streams.',
          lessons: [
            { id: 'j-types', title: 'Типы данных и переменные', file: 'junior/j-types.json', estimatedMinutes: 25 },
            { id: 'j-control', title: 'Условия, циклы, switch', file: 'junior/j-control.json', estimatedMinutes: 25 },
            { id: 'j-oop', title: 'ООП: классы и полиморфизм', file: 'junior/j-oop.json', estimatedMinutes: 35 },
            { id: 'j-collections', title: 'Коллекции List/Set/Map', file: 'junior/j-collections.json', estimatedMinutes: 30 },
            { id: 'j-exceptions', title: 'Исключения', file: 'junior/j-exceptions.json', estimatedMinutes: 20 },
            { id: 'j-strings', title: 'Строки и парсинг', file: 'junior/j-strings.json', estimatedMinutes: 25 },
            { id: 'j-streams', title: 'Java Streams API', file: 'junior/j-streams.json', estimatedMinutes: 25 }
          ]
        },
        {
          id: 'maven-junit',
          title: 'Maven и JUnit 5',
          description: 'Сборка, зависимости, жизненный цикл теста и ассерты.',
          lessons: [
            { id: 'j-maven', title: 'Maven основы', file: 'junior/j-maven.json', estimatedMinutes: 25 },
            { id: 'j-junit', title: 'JUnit 5', file: 'junior/j-junit.json', estimatedMinutes: 30 },
            { id: 'j-assertions', title: 'Ассерты и проверки', file: 'junior/j-assertions.json', estimatedMinutes: 20 }
          ]
        },
        {
          id: 'selenium',
          title: 'Selenium WebDriver',
          description: 'Старт, локаторы, ожидания, Page Object.',
          lessons: [
            { id: 'j-selenium-intro', title: 'Selenium введение', file: 'junior/j-selenium-intro.json', estimatedMinutes: 30 },
            { id: 'j-locators', title: 'Локаторы', file: 'junior/j-locators.json', estimatedMinutes: 35 },
            { id: 'j-waits', title: 'Ожидания', file: 'junior/j-waits.json', estimatedMinutes: 30 },
            { id: 'j-pom-intro', title: 'Page Object Model', file: 'junior/j-pom-intro.json', estimatedMinutes: 30 }
          ]
        },
        {
          id: 'tools',
          title: 'Инструменты Junior',
          description: 'Git и системная отладка падений.',
          lessons: [
            { id: 'j-git', title: 'Git для QA', file: 'junior/j-git.json', estimatedMinutes: 20 },
            { id: 'j-debug', title: 'Отладка тестов', file: 'junior/j-debug.json', estimatedMinutes: 25 }
          ]
        }
      ]
    },
    {
      id: 'middle',
      name: 'Middle',
      title: 'Сильный практик автоматизации',
      description: 'Advanced Selenium, API, данные, Allure, параллель, Mockito, BDD, DB, Selenide, паттерны, flaky.',
      color: '#2a5f8f',
      modules: [
        {
          id: 'selenium-adv',
          title: 'UI уровень Middle',
          description: 'Сложный Selenium и масштабируемый POM.',
          lessons: [
            { id: 'm-advanced-selenium', title: 'Advanced Selenium', file: 'middle/m-advanced-selenium.json', estimatedMinutes: 35 },
            { id: 'm-pom-fluent', title: 'Fluent POM и компоненты', file: 'middle/m-pom-fluent.json', estimatedMinutes: 30 }
          ]
        },
        {
          id: 'api',
          title: 'API и данные',
          description: 'RestAssured и стратегии тестовых данных.',
          lessons: [
            { id: 'm-restassured', title: 'RestAssured', file: 'middle/m-restassured.json', estimatedMinutes: 40 },
            { id: 'm-testdata', title: 'Тестовые данные', file: 'middle/m-testdata.json', estimatedMinutes: 30 }
          ]
        },
        {
          id: 'reporting',
          title: 'Отчёты и скорость',
          description: 'Allure и параллельный запуск.',
          lessons: [
            { id: 'm-allure', title: 'Allure', file: 'middle/m-allure.json', estimatedMinutes: 25 },
            { id: 'm-parallel', title: 'Параллель и ThreadLocal', file: 'middle/m-parallel.json', estimatedMinutes: 30 }
          ]
        },
        {
          id: 'quality',
          title: 'Качество Mid-уровня',
          description: 'Моки, BDD, DB, Selenide, паттерны, flaky.',
          lessons: [
            { id: 'm-mockito', title: 'Mockito', file: 'middle/m-mockito.json', estimatedMinutes: 25 },
            { id: 'm-cucumber', title: 'Cucumber BDD', file: 'middle/m-cucumber.json', estimatedMinutes: 30 },
            { id: 'm-db', title: 'Проверки БД', file: 'middle/m-db.json', estimatedMinutes: 25 },
            { id: 'm-selenide', title: 'Selenide', file: 'middle/m-selenide.json', estimatedMinutes: 25 },
            { id: 'm-patterns', title: 'Паттерны фреймворка', file: 'middle/m-patterns.json', estimatedMinutes: 30 },
            { id: 'm-flaky', title: 'Flaky tests', file: 'middle/m-flaky.json', estimatedMinutes: 30 }
          ]
        }
      ]
    },
    {
      id: 'senior',
      name: 'Senior',
      title: 'Стратегия, CI/CD, инфраструктура',
      description: 'Архитектура, пирамида, Jenkins, Docker, Grid, метрики, ревью, контракты, perf/security.',
      color: '#8b3a4a',
      modules: [
        {
          id: 'architecture',
          title: 'Стратегия и архитектура',
          description: 'Фреймворк и пирамида.',
          lessons: [
            { id: 's-framework', title: 'Архитектура фреймворка', file: 'senior/s-framework.json', estimatedMinutes: 35 },
            { id: 's-pyramid', title: 'Пирамида тестирования', file: 'senior/s-pyramid.json', estimatedMinutes: 25 }
          ]
        },
        {
          id: 'ci',
          title: 'Jenkins CI/CD',
          description: 'Пайплайны, артефакты, параметры.',
          lessons: [
            { id: 's-jenkins', title: 'Jenkins основы', file: 'senior/s-jenkins.json', estimatedMinutes: 40 },
            { id: 's-jenkinsfile', title: 'Jenkinsfile практика', file: 'senior/s-jenkinsfile.json', estimatedMinutes: 35 }
          ]
        },
        {
          id: 'docker',
          title: 'Docker и Grid',
          description: 'Контейнеры, compose, Selenium Grid.',
          lessons: [
            { id: 's-docker', title: 'Docker для тестов', file: 'senior/s-docker.json', estimatedMinutes: 35 },
            { id: 's-compose-grid', title: 'Compose и Grid', file: 'senior/s-compose-grid.json', estimatedMinutes: 35 },
            { id: 's-dockerfile-practice', title: 'Dockerfile и кэш', file: 'senior/s-dockerfile-practice.json', estimatedMinutes: 25 }
          ]
        },
        {
          id: 'process',
          title: 'Процессы Senior',
          description: 'Ревью, метрики, собеседования.',
          lessons: [
            { id: 's-codereview', title: 'Code review тестов', file: 'senior/s-codereview.json', estimatedMinutes: 25 },
            { id: 's-metrics', title: 'Метрики автоматизации', file: 'senior/s-metrics.json', estimatedMinutes: 25 },
            { id: 's-interview-soft', title: 'Ответы на собеседовании', file: 'senior/s-interview-soft.json', estimatedMinutes: 25 }
          ]
        },
        {
          id: 'advanced',
          title: 'Расширенные темы',
          description: 'Контракты, perf, security, observability.',
          lessons: [
            { id: 's-contract', title: 'Контрактное тестирование', file: 'senior/s-contract.json', estimatedMinutes: 25 },
            { id: 's-performance-basics', title: 'Performance basics', file: 'senior/s-performance-basics.json', estimatedMinutes: 25 },
            { id: 's-security-qa', title: 'Security awareness', file: 'senior/s-security-qa.json', estimatedMinutes: 25 },
            { id: 's-observability', title: 'Observability', file: 'senior/s-observability.json', estimatedMinutes: 20 }
          ]
        }
      ]
    }
  ]
};

fs.writeFileSync(path.join(ROOT, 'index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log('Part 3 + index done');
