const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');

function load(r) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, r), 'utf8'));
}
function save(r, o) {
  fs.writeFileSync(path.join(ROOT, r), JSON.stringify(o, null, 2) + '\n');
  console.log(r, (o.theoryMarkdown || '').length);
}

const jwt = load('middle/m-jwt-auth.json');
const q2 = jwt.quiz.find((x) => x.id === 'q2');
if (q2) {
  q2.options = ['200 OK', '403 Forbidden', '301 Redirect', '204 No Content'];
}
save('middle/m-jwt-auth.json', jwt);

const bumps = {
  'middle/m-allure.json':
    '\n## Практика\n\nИмена suite/feature отражай в аннотациях; flaky помечай тегом и ссылкой на тикет в описании теста.\n',
  'middle/m-allure-steps.json':
    '\n## Пример\n\nStep на бизнес-действии (create order via API); UI-step отдельно. В отчёте виден сценарий без шума findElement.\n',
  'senior/s-swagger-coverage.json':
    '\n## Интервью\n\nCoverage операций — радар дыр. Дальше приоритизируем бизнес-риск, а не гонимся за 100%.\n',
  'senior/s-codereview.json':
    '\n## Чеклист ревьюера\n\n1) Есть ли смысл сценария? 2) Стабилен ли wait? 3) Данные изолированы? 4) Секреты? 5) Время CI?\n'
};

for (const [f, extra] of Object.entries(bumps)) {
  const l = load(f);
  if (!l.theoryMarkdown.includes(extra.trim().slice(0, 20))) {
    l.theoryMarkdown += extra;
  }
  save(f, l);
}
