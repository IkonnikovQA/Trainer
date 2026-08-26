const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'src', 'main', 'resources', 'curriculum');
let quizOnly = [];
let juniorHard = [];
let lowQuiz = [];
const critical = new Set([
  'j-locators', 'j-waits', 'j-pom-intro', 'j-git', 'j-debug',
  'j-streams', 'j-records-fixtures', 'j-strings', 'm-capstone'
]);
for (const lvl of ['junior', 'middle', 'senior']) {
  for (const f of fs.readdirSync(path.join(ROOT, lvl)).filter((x) => x.endsWith('.json'))) {
    const l = JSON.parse(fs.readFileSync(path.join(ROOT, lvl, f), 'utf8'));
    const q = (l.quiz || []).length;
    const e = (l.exercises || []).length;
    if (e === 0) quizOnly.push(l.id);
    if (critical.has(l.id) && q < 2) lowQuiz.push(l.id + ':' + q);
    for (const ex of l.exercises || []) {
      if (lvl === 'junior' && ex.difficulty === 'hard') juniorHard.push(l.id + '::' + ex.id);
      if (!ex.solutionCode) console.log('NO SOL', l.id, ex.id);
    }
  }
}
const inv = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'main', 'resources', 'static', 'js', 'interview.js'),
  'utf8'
);
console.log('quizOnly', quizOnly);
console.log('juniorHard', juniorHard);
console.log('lowQuiz critical', lowQuiz);
console.log('bad senior m-flaky STAR', inv.includes("level: 'senior', lessonId: 'm-flaky', q: 'STAR"));
console.log('bad senior j-selenium4 CDP', /level: 'senior', lessonId: 'j-selenium4', q: 'Когда нужен CDP/.test(inv));
console.log('ok middle STAR', inv.includes("level: 'middle', lessonId: 'm-flaky', q: 'STAR"));
