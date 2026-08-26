(() => {
  const lessonId = window.__LESSON_ID__;
  const curriculum = window.__CURRICULUM__;
  const progress = window.__PROGRESS__ || { completedLessons: [], completedExercises: [] };

  const completedLessons = new Set(progress.completedLessons || []);
  const completedExercises = new Set(progress.completedExercises || []);
  const bookmarked = new Set(progress.bookmarkedLessonIds || []);
  const quizCorrect = new Set();

  const MODE_INFO = {
    java: {
      title: 'Java',
      short: 'Обычный класс и проверки',
      explain: 'Пишешь Java-класс. Проверка — по тестовым вызовам или verifier.'
    },
    'selenium-fake': {
      title: 'Selenium',
      short: 'WebDriver API без браузера',
      explain: 'Пишешь код с WebDriver/By/waits. Снизу — DOM-фикстура, против которой идёт проверка.'
    },
    http: {
      title: 'HTTP / RestAssured',
      short: 'API-клиент против stub',
      explain: 'Пишешь RestAssured. Поднимается MockWebServer со stub’ами из контекста lab.'
    },
    junit: {
      title: 'JUnit',
      short: 'Твои @Test',
      explain: 'Пишешь тестовый класс. Запускается JUnit Platform — зелёные тесты = успех.'
    },
    artifact: {
      title: 'Артефакт',
      short: 'Dockerfile / Jenkins / YAML',
      explain: 'Пишешь текст пайплайна или Dockerfile. Проверяются структура и обязательные части.'
    }
  };

  let state = {
    lesson: null,
    labContexts: {},
    codes: {},
    prevId: null,
    nextId: null,
    currentExerciseId: null,
    editor: null,
    starters: {},
    saveTimer: null
  };

  function toast(message, kind) {
    document.querySelectorAll('.toast').forEach(el => el.remove());
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function modeMeta(mode) {
    return MODE_INFO[mode] || MODE_INFO.java;
  }

  function buildSidebar() {
    const root = document.getElementById('sidebarTree');
    root.innerHTML = '';
    (curriculum.levels || []).forEach(level => {
      const details = document.createElement('details');
      details.className = 'side-level';
      details.open = (level.modules || []).some(m => (m.lessons || []).some(l => l.id === lessonId));
      details.innerHTML = `<summary>${level.name}</summary>`;
      (level.modules || []).forEach(mod => {
        const title = document.createElement('div');
        title.className = 'side-module';
        title.textContent = mod.title;
        details.appendChild(title);
        const ul = document.createElement('ul');
        ul.className = 'side-lessons';
        (mod.lessons || []).forEach(lesson => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `/lesson/${lesson.id}`;
          a.textContent = lesson.title;
          if (lesson.id === lessonId) a.classList.add('active');
          if (completedLessons.has(lesson.id)) a.classList.add('done');
          li.appendChild(a);
          ul.appendChild(li);
        });
        details.appendChild(ul);
      });
      root.appendChild(details);
    });
  }

  function practiceDoneCount() {
    const exercises = state.lesson?.exercises || [];
    return exercises.filter(e => completedExercises.has(`${lessonId}::${e.id}`)).length;
  }

  function updatePathStates() {
    const quizTotal = (state.lesson?.quiz || []).length;
    const quizDone = quizCorrect.size;
    const quizBtn = document.querySelector('#lessonPath [data-tab="quiz"]');
    const practiceBtn = document.querySelector('#lessonPath [data-tab="practice"]');
    const quizState = document.getElementById('pathQuizState');
    const practiceState = document.getElementById('pathPracticeState');
    const exTotal = (state.lesson?.exercises || []).length;
    const exDone = practiceDoneCount();

    if (quizState) {
      quizState.textContent = quizTotal
        ? `${quizDone}/${quizTotal} верно`
        : 'Квиза нет — можно сразу к практике';
    }
    if (practiceState) {
      practiceState.textContent = exTotal
        ? `${exDone}/${exTotal} заданий`
        : 'Практики нет';
    }
    if (quizBtn) quizBtn.classList.toggle('done', quizTotal === 0 || quizDone >= quizTotal);
    if (practiceBtn) practiceBtn.classList.toggle('done', exTotal === 0 || exDone >= exTotal);

    const hint = document.getElementById('completeHint');
    if (hint) {
      const quizOk = quizTotal === 0 || quizDone >= quizTotal;
      const practiceOk = exTotal === 0 || exDone >= exTotal;
      if (quizOk && practiceOk) {
        hint.textContent = 'Можно завершить урок';
      } else {
        const parts = [];
        if (!quizOk) parts.push(`квиз ${quizDone}/${quizTotal}`);
        if (!practiceOk) parts.push(`практика ${exDone}/${exTotal}`);
        hint.textContent = 'Ещё нужно: ' + parts.join(', ');
      }
    }
  }

  function updateQuizStatus() {
    const total = (state.lesson?.quiz || []).length;
    const el = document.getElementById('quizStatus');
    const meter = document.getElementById('quizMeter');
    if (el) el.textContent = total ? `Верно ${quizCorrect.size} из ${total}` : 'Квиза нет';
    if (meter) meter.style.width = total ? `${(quizCorrect.size * 100) / total}%` : '100%';
    updatePathStates();
  }

  function switchTab(name) {
    document.querySelectorAll('#lessonPath [data-tab]').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('tab-' + name);
    if (panel) panel.classList.add('active');
    if (name === 'practice' && state.editor) {
      setTimeout(() => state.editor.layout(), 50);
    }
  }

  function setSidebarOpen(open) {
    document.getElementById('sidebar')?.classList.toggle('open', open);
    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) backdrop.hidden = !open;
  }

  function refreshBookmarkBtn() {
    const btn = document.getElementById('bookmarkBtn');
    if (!btn) return;
    const on = bookmarked.has(lessonId);
    btn.textContent = on ? '★ В закладках' : '☆ В закладки';
    btn.classList.toggle('active', on);
  }

  function renderModeLegend(activeMode) {
    const root = document.getElementById('modeLegend');
    if (!root) return;
    const modesInLesson = new Set((state.lesson.exercises || []).map(e => e.mode || 'java'));
    root.innerHTML = '';
    Object.entries(MODE_INFO).forEach(([key, info]) => {
      if (!modesInLesson.has(key) && key !== (activeMode || '')) return;
      const div = document.createElement('div');
      div.className = 'mode-chip' + (key === activeMode ? ' hl' : '');
      div.innerHTML = `<strong>${info.title}</strong><span>${info.short}</span>`;
      root.appendChild(div);
    });
    if (!root.children.length) {
      Object.values(MODE_INFO).slice(0, 3).forEach(info => {
        const div = document.createElement('div');
        div.className = 'mode-chip';
        div.innerHTML = `<strong>${info.title}</strong><span>${info.short}</span>`;
        root.appendChild(div);
      });
    }
  }

  async function loadLesson() {
    const res = await fetch(`/api/lessons/${lessonId}`);
    if (!res.ok) {
      document.getElementById('lessonTitle').textContent = 'Урок не найден';
      return;
    }
    const data = await res.json();
    state.lesson = data.lesson;
    state.labContexts = data.labContexts || {};
    state.codes = data.codes || {};
    state.prevId = data.prevId;
    state.nextId = data.nextId;
    if (data.progress) {
      (data.progress.completedExercises || []).forEach(k => completedExercises.add(k));
      (data.progress.completedLessons || []).forEach(k => completedLessons.add(k));
      (data.progress.completedQuizzes || []).forEach(k => {
        if (k.startsWith(lessonId + '::')) quizCorrect.add(k.substring(lessonId.length + 2));
        if (k === lessonId) {
          (data.lesson.quiz || []).forEach(q => quizCorrect.add(q.id));
        }
      });
    }
    Object.entries(state.codes).forEach(([k, v]) => {
      state.starters[k] = data.lesson.exercises.find(e => e.id === k)?.starterCode || v;
    });

    const levelName = (curriculum.levels || []).find(l => l.id === data.lesson.levelId)?.name
      || data.lesson.levelId || '';
    document.getElementById('lessonTitle').textContent = data.lesson.title;
    document.getElementById('lessonSummary').textContent = data.lesson.summary || '';
    document.getElementById('lessonMeta').textContent = `${levelName} · ${data.lesson.moduleId || 'модуль'}`;
    document.getElementById('theoryHtml').innerHTML = data.theoryHtml || '';

    const kp = document.getElementById('keyPoints');
    kp.innerHTML = '';
    (data.lesson.keyPoints || []).forEach(p => {
      const div = document.createElement('div');
      div.className = 'point';
      div.textContent = p;
      kp.appendChild(div);
    });

    const tips = document.getElementById('interviewTips');
    tips.innerHTML = '';
    (data.lesson.interviewTips || []).forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      tips.appendChild(li);
    });
    if (!(data.lesson.interviewTips || []).length) {
      tips.innerHTML = '<li class="muted">Для этого урока отдельных подсказок к собеседованию нет.</li>';
    }

    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (state.prevId) prev.href = `/lesson/${state.prevId}`; else prev.style.visibility = 'hidden';
    if (state.nextId) next.href = `/lesson/${state.nextId}`; else next.style.visibility = 'hidden';

    updateQuizStatus();
    renderQuiz();
    renderExercises();
    renderModeLegend(null);
  }

  function renderQuiz() {
    const box = document.getElementById('quizBox');
    const quiz = state.lesson.quiz || [];
    if (!quiz.length) {
      box.innerHTML = '<p class="muted">В этом уроке нет квиза — переходи к практике.</p>';
      updateQuizStatus();
      return;
    }
    box.innerHTML = '';
    quiz.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      const multi = q.type === 'multiple';
      card.innerHTML = `<h3>Вопрос ${idx + 1} из ${quiz.length}</h3>
        <p>${escapeHtml(q.question)}</p>
        <div class="quiz-type">${multi ? 'Можно выбрать несколько вариантов' : 'Один правильный ответ'}</div>`;
      const opts = document.createElement('div');
      opts.className = 'quiz-options';
      (q.options || []).forEach((opt, i) => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="${multi ? 'checkbox' : 'radio'}" name="${q.id}" value="${i}"><span>${escapeHtml(opt)}</span>`;
        opts.appendChild(label);
      });
      card.appendChild(opts);
      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.type = 'button';
      btn.textContent = 'Проверить ответ';
      const feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';
      btn.addEventListener('click', async () => {
        const selected = [...card.querySelectorAll('input:checked')].map(el => Number(el.value));
        const res = await fetch('/api/quiz/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, questionId: q.id, selectedIndexes: selected })
        });
        const data = await res.json();
        feedback.className = 'quiz-feedback ' + (data.correct ? 'ok' : 'bad');
        feedback.innerHTML = data.correct
          ? `Верно. ${escapeHtml(data.explanation || '')}`
          : `Пока нет. ${escapeHtml(data.hint || 'Попробуй ещё раз.')}${data.explanation ? '<br>' + escapeHtml(data.explanation) : ''}`;
        if (data.correct) {
          quizCorrect.add(q.id);
          updateQuizStatus();
        }
      });
      card.appendChild(btn);
      card.appendChild(feedback);
      box.appendChild(card);
    });
    updateQuizStatus();
  }

  function refreshExercisePicker() {
    const list = document.getElementById('exerciseList');
    const exercises = state.lesson.exercises || [];
    const activeId = state.currentExerciseId;
    list.innerHTML = '';
    exercises.forEach((ex, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const done = completedExercises.has(`${lessonId}::${ex.id}`);
      const meta = modeMeta(ex.mode);
      btn.innerHTML = `<strong>${i + 1}. ${escapeHtml(ex.title)}</strong>${done ? ' · готово' : ''}<br><span class="muted" style="font-weight:400;font-size:0.78rem">${meta.title}</span>`;
      if (ex.id === activeId) btn.classList.add('active');
      if (done) btn.classList.add('done');
      btn.addEventListener('click', () => selectExercise(ex.id));
      list.appendChild(btn);
    });
    updatePathStates();
  }

  function renderExercises() {
    const exercises = state.lesson.exercises || [];
    if (!exercises.length) {
      document.getElementById('practiceArea').hidden = true;
      document.getElementById('exerciseList').innerHTML = '<p class="muted">Практических заданий в этом уроке нет — достаточно теории и квиза.</p>';
      updatePathStates();
      return;
    }
    selectExercise(exercises[0].id);
  }

  function editorLanguage(mode) {
    if (mode === 'artifact') return 'yaml';
    return 'java';
  }

  function showLabContext(ex) {
    const panel = document.getElementById('labPanel');
    const pre = document.getElementById('labContext');
    const explain = document.getElementById('labExplain');
    const ctx = state.labContexts[ex.id] || {};
    const meta = modeMeta(ex.mode);
    let text = '';
    let human = meta.explain;

    if (ctx.fixturePreview) {
      human = 'Это DOM, против которого крутится твой Selenium-код (FakeDriver).';
      text += ctx.fixturePreview;
    } else if (ctx.httpStubPreview) {
      human = 'Это ответы MockWebServer. Твой RestAssured ходит на временный baseUrl.';
      text += ctx.httpStubPreview;
    } else if (ctx.artifactKind) {
      human = `Нужен артефакт типа «${ctx.artifactKind}». Пиши текст в редакторе справа.`;
      text += 'kind: ' + ctx.artifactKind;
    } else if ((ex.mode || 'java') === 'junit') {
      human = 'Пиши @Test. Если в задании есть support-классы — они уже на classpath.';
      text = '';
    } else {
      human = meta.explain;
    }

    explain.textContent = human;
    if (text) {
      pre.hidden = false;
      pre.textContent = text.trim();
    } else {
      pre.hidden = true;
      pre.textContent = '';
    }
    panel.hidden = false;
  }

  function selectExercise(id) {
    if (state.editor && state.currentExerciseId) {
      state.codes[state.currentExerciseId] = state.editor.getValue();
    }
    const ex = state.lesson.exercises.find(e => e.id === id);
    if (!ex) return;
    state.currentExerciseId = id;
    document.getElementById('practiceArea').hidden = false;
    document.getElementById('exTitle').textContent = ex.title;
    document.getElementById('exDesc').textContent = ex.description || '';
    const meta = modeMeta(ex.mode);
    const diff = ex.difficulty ? String(ex.difficulty) : 'practice';
    document.getElementById('exDiff').innerHTML =
      `${meta.title} <code>${escapeHtml(ex.mode || 'java')}</code> · ${escapeHtml(diff)}`;
    document.getElementById('resultBox').className = 'result-box';
    document.getElementById('resultBox').textContent = '';
    document.getElementById('hintsBox').innerHTML = '';
    document.getElementById('solutionBtn').hidden = true;
    const langLabel = document.getElementById('editorLangLabel');
    if (langLabel) langLabel.textContent = ex.mode === 'artifact' ? 'YAML / текст' : 'Java';
    showLabContext(ex);
    renderModeLegend(ex.mode || 'java');
    refreshExercisePicker();

    const code = state.codes[id] || ex.starterCode || '';
    ensureEditor(() => {
      monaco.editor.setModelLanguage(state.editor.getModel(), editorLanguage(ex.mode));
      state.editor.setValue(code);
    });
  }

  async function saveCodeOnly() {
    if (!state.currentExerciseId || !state.editor) return;
    const code = state.editor.getValue();
    state.codes[state.currentExerciseId] = code;
    await fetch('/api/exercise/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, exerciseId: state.currentExerciseId, code })
    }).catch(() => {});
  }

  function ensureEditor(cb) {
    if (state.editor) {
      cb();
      return;
    }
    require.config({ paths: { vs: '/vendor/monaco/vs' } });
    require(['vs/editor/editor.main'], () => {
      state.editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'java',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'IBM Plex Mono, monospace',
        scrollBeyondLastLine: false
      });
      state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        document.getElementById('runBtn').click();
      });
      state.editor.onDidChangeModelContent(() => {
        clearTimeout(state.saveTimer);
        state.saveTimer = setTimeout(saveCodeOnly, 800);
      });
      cb();
    }, () => {
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
      require(['vs/editor/editor.main'], () => {
        state.editor = monaco.editor.create(document.getElementById('editor'), {
          value: '', language: 'java', theme: 'vs-dark', automaticLayout: true,
          minimap: { enabled: false }, fontSize: 14, fontFamily: 'IBM Plex Mono, monospace',
          scrollBeyondLastLine: false
        });
        state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          document.getElementById('runBtn').click();
        });
        state.editor.onDidChangeModelContent(() => {
          clearTimeout(state.saveTimer);
          state.saveTimer = setTimeout(saveCodeOnly, 800);
        });
        cb();
      });
    });
  }

  document.querySelectorAll('#lessonPath [data-tab]').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  document.getElementById('toQuizBtn')?.addEventListener('click', () => switchTab('quiz'));
  document.getElementById('toPracticeBtn')?.addEventListener('click', () => switchTab('practice'));
  document.getElementById('sidebarOpen')?.addEventListener('click', () => setSidebarOpen(true));
  document.getElementById('sidebarClose')?.addEventListener('click', () => setSidebarOpen(false));
  document.getElementById('sidebarBackdrop')?.addEventListener('click', () => setSidebarOpen(false));
  document.getElementById('bookmarkBtn')?.addEventListener('click', async () => {
    const res = await fetch('/api/progress/bookmark/' + encodeURIComponent(lessonId), { method: 'POST' });
    const data = await res.json();
    if (data.bookmarked) bookmarked.add(lessonId); else bookmarked.delete(lessonId);
    refreshBookmarkBtn();
  });

  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;
    if (typing) return;
    if (e.key === '1') switchTab('theory');
    if (e.key === '2') switchTab('quiz');
    if (e.key === '3') switchTab('practice');
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      const practice = document.getElementById('tab-practice');
      if (practice?.classList.contains('active')) document.getElementById('hintBtn')?.click();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.toast').forEach(el => el.remove());
      setSidebarOpen(false);
      const box = document.getElementById('resultBox');
      if (box && document.activeElement === box) box.blur();
    }
  });

  document.getElementById('runBtn').addEventListener('click', async () => {
    if (!state.currentExerciseId || !state.editor) return;
    const code = state.editor.getValue();
    state.codes[state.currentExerciseId] = code;
    const box = document.getElementById('resultBox');
    box.className = 'result-box';
    box.textContent = 'Проверка…';
    const res = await fetch('/api/exercise/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, exerciseId: state.currentExerciseId, code })
    });
    const data = await res.json();
    box.className = 'result-box ' + (data.success ? 'ok' : 'bad');
    let html = `<strong>${escapeHtml(data.message || '')}</strong>`;
    if (data.warning) {
      html += `<div class="result-warning">${escapeHtml(data.warning)}</div>`;
    }
    if (data.failCount) html += `<div class="muted">Неудачных попыток: ${data.failCount}</div>`;
    if (data.details && data.details.length) {
      const compileLike = data.details.some(d => /Line \d+:/i.test(d) || /строка/i.test(d));
      html += compileLike
        ? '<p class="section-label">Ошибки компиляции / детали</p><ul class="compile-errors">'
        : '<ul>';
      html += data.details.map(d => `<li>${escapeHtml(d)}</li>`).join('') + '</ul>';
    }
    if (data.availableHints && data.availableHints.length) {
      document.getElementById('hintsBox').innerHTML =
        '<strong>Открытые подсказки</strong><ul>' + data.availableHints.map(h => `<li>${escapeHtml(h)}</li>`).join('') + '</ul>';
    }
    box.innerHTML = html;
    document.getElementById('solutionBtn').hidden = !data.canRevealSolution;
    if (data.success) {
      completedExercises.add(`${lessonId}::${state.currentExerciseId}`);
      refreshExercisePicker();
      toast('Задание принято', 'ok');
    }
  });

  document.getElementById('hintBtn').addEventListener('click', async () => {
    if (!state.currentExerciseId) return;
    const res = await fetch('/api/exercise/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, exerciseId: state.currentExerciseId, code: '' })
    });
    const data = await res.json();
    if (data.error) {
      document.getElementById('hintsBox').innerHTML = `<span class="quiz-feedback bad">${escapeHtml(data.error)}</span>`;
      toast(data.error, 'bad');
      return;
    }
    document.getElementById('hintsBox').innerHTML =
      '<strong>Подсказки</strong><ul>' + (data.hints || []).map(h => `<li>${escapeHtml(h)}</li>`).join('') + '</ul>';
  });

  document.getElementById('solutionBtn').addEventListener('click', async () => {
    if (!state.currentExerciseId || !state.editor) return;
    const res = await fetch('/api/exercise/solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, exerciseId: state.currentExerciseId, code: '' })
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || 'Решение ещё недоступно', 'bad');
      return;
    }
    if (data.solutionCode) {
      state.editor.setValue(data.solutionCode);
      toast('Решение вставлено в редактор. Разбери его и проверь снова.');
    }
  });

  document.getElementById('resetCodeBtn').addEventListener('click', () => {
    if (!state.currentExerciseId || !state.editor) return;
    const ex = state.lesson.exercises.find(e => e.id === state.currentExerciseId);
    state.editor.setValue(ex?.starterCode || '');
  });

  document.getElementById('completeBtn').addEventListener('click', async () => {
    const res = await fetch(`/api/lesson/${lessonId}/complete`, { method: 'POST' });
    const data = await res.json();
    if (!data.ok) {
      toast(data.message || 'Сначала закрой квиз и практику.', 'bad');
      updatePathStates();
      return;
    }
    toast('Урок пройден. Переходим дальше…', 'ok');
    setTimeout(() => {
      location.href = state.nextId ? `/lesson/${state.nextId}` : '/';
    }, 700);
  });

  function escapeHtml(s) {
    return String(s || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  buildSidebar();
  refreshBookmarkBtn();
  loadLesson();
})();
