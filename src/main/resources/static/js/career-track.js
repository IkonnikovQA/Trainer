(() => {
  const root = document.getElementById('careerTrack');
  if (!root) return;
  const completed = new Set((window.__COMPLETED_LESSONS__ || []).map(String));
  const titles = window.__LESSON_TITLES__ || {};

  fetch('/career-track.json')
    .then((r) => r.json())
    .then((track) => {
      const lessons = track.lessons || [];
      const done = lessons.filter((id) => completed.has(id)).length;
      const pct = lessons.length ? Math.round((done * 100) / lessons.length) : 0;
      const next = lessons.find((id) => !completed.has(id));

      const badgesHtml = (track.badges || [])
        .map((b) => {
          const ok = (b.lessons || []).every((id) => completed.has(id));
          return `<span class="career-badge${ok ? ' on' : ''}">${b.label}${ok ? ' ✓' : ''}</span>`;
        })
        .join('');

      let mockDone = false;
      try {
        mockDone = localStorage.getItem('qa-forge-mock-interview-done') === '1';
      } catch (_) { /* ignore */ }

      const gaps = lessons.filter((id) => !completed.has(id)).slice(0, 4);
      const gapText = gaps.length
        ? gaps.map((id) => titles[id] || id).join(' · ') + (lessons.length - done > 4 ? '…' : '')
        : 'Трек закрыт — добей портфолио и mock-сессию';

      const list = lessons
        .map((id) => {
          const ok = completed.has(id);
          const title = titles[id] || id;
          return `<li class="${ok ? 'done' : ''}"><a href="/lesson/${id}"><span class="dot"></span><span class="lesson-title">${title}</span></a></li>`;
        })
        .join('');

      root.innerHTML = `
        <div class="career-head">
          <div class="career-head-text">
            <span class="level-badge">К офферу</span>
            <h2>${track.title || 'К офферу'}</h2>
            <p class="career-desc">${track.description || ''}</p>
          </div>
          <div class="career-head-meta">
            <p class="module-progress">${done}/${lessons.length} · ${pct}%</p>
            <div class="meter career-meter"><div class="meter-fill" style="width:${pct}%"></div></div>
            ${next ? `<a class="btn primary career-cta" href="/lesson/${next}">Дальше: ${titles[next] || next}</a>` : '<a class="btn primary career-cta" href="/interview">Mock-сессия</a>'}
          </div>
        </div>
        <div class="career-badges">${badgesHtml}
          <span class="career-badge${mockDone ? ' on' : ''}">Mock interview${mockDone ? ' ✓' : ''}</span>
        </div>
        <p class="muted career-gaps"><strong>Ещё до оффера:</strong> ${gapText}</p>
        <p class="muted career-links">
          <a href="/interview">Собеседование</a>
          <span aria-hidden="true">·</span>
          <span>CAREER.md</span>
          <span aria-hidden="true">·</span>
          <code>examples/portfolio-starter</code>
        </p>
        <details class="career-details">
          <summary>Все must-pass уроки (${lessons.length})</summary>
          <ul class="lesson-list career-list">${list}</ul>
        </details>
      `;
    })
    .catch(() => {
      root.innerHTML = '<p class="muted">Не удалось загрузить career-track.json</p>';
    });
})();
