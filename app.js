/* js / 1 — INIT (Telegram WebApp) */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#050001');
    tg.setBackgroundColor('#050001');
  } catch (e) {}
}

/* js / 2 — DATA */
const CHAR_TEXTS = {
  inquisitor: '<div class="char-name">⚔️ Инквизитор</div><p>Мужик, священным мечом крушит нечисть, любит мыло.</p>',
  emperor: '<div class="char-name">🩸 Император</div><p>Бессмертное существо, которое любит искать мыло для инквизитора.</p>',
  eye: '<div class="char-name">👁️ Всевидящее Око</div><p>Поговаривают, она видит всё и даже для чего нужно инквизитору мыло.</p>',
  punisher: '<div class="char-name">🔥 Каратель</div><p>Она наказывает тех, у кого найдёт мыло.</p>',
  galya: '<div class="char-name">🧼 Галя</div><p>Девушка, которая всегда помогает главе, особенно когда дело касается возраста мыла бракованного.</p>',
  cheshire: '<div class="char-name">😺 Чеширский Кот</div><p>Начальник стражи и живёт там, где кормит.</p>'
};

const HAS_ACTIVE = false;

const EVENTS = [
  { ico: '🩸', title: 'Кровавый влог', left: '11 ч 16 мин', pct: 28 },
  { ico: '🔥', title: 'Жатва карт', left: '3 ч 40 мин', pct: 62 },
  { ico: '⚔️', title: 'Охота на нечисть', left: '6 ч 5 мин', pct: 45 },
  { ico: '👑', title: 'Дар Императору', left: '14 ч 2 мин', pct: 18 }
];

const ACHIEVEMENTS = [
  { ico: '🩸', name: 'Кровавая жатва', cur: 0, max: 5 },
  { ico: '📦', name: 'Склад Империи', cur: 0, max: 10 },
  { ico: '🌑', name: 'Под луной', cur: 0, max: 3 },
  { ico: '🔥', name: 'Огонь арены', cur: 0, max: 7 }
];

const TASKS = [
  { ico: '🩸', name: 'Кровавый влог', desc: 'Выполни 1 кровавый влог', count: '0 / 1', reward: '+50 крови' },
  { ico: '📦', name: 'Дань складу', desc: 'Внеси карты на склад клуба', count: '0 / 10', reward: '+ранг' },
  { ico: '⚔️', name: 'Трибута альянсу', desc: 'Вложи карты в альянс за день', count: '0 / 500 E', reward: 'слава' }
];

const stack = ['home'];

/* js / 3 — NAV / SCREENS */
function showScreen(id, push = true) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (!el) return;
  el.classList.add('active');

  let tabId = id;
  if (id === 'chronicles' || id === 'characters') tabId = 'archives';
  if (id === 'quest') tabId = 'hall';

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === tabId || t.dataset.screen === id);
  });

  const back = document.getElementById('btn-back');
  if (id === 'home') back.classList.add('hidden');
  else back.classList.remove('hidden');

  if (id === 'characters') {
    document.getElementById('char-list').classList.remove('hidden');
    document.getElementById('char-detail').classList.add('hidden');
  }
  if (id === 'quest') renderQuest();
  if (id === 'obana') document.getElementById('obana-result')?.classList.add('hidden');

  if (push && stack[stack.length - 1] !== id) stack.push(id);
  window.scrollTo(0, 0);
}

function renderQuest() {
  const empty = document.getElementById('quest-empty');
  const active = document.getElementById('quest-active');
  if (!empty || !active) return;

  if (!HAS_ACTIVE) {
    empty.classList.remove('hidden');
    active.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  active.classList.remove('hidden');

  document.getElementById('event-timers').innerHTML = EVENTS.map(e => `
    <div class="event-card">
      <div class="event-top">
        <div class="event-title"><span class="ico">\( {e.ico}</span> \){e.title}</div>
        <div class="event-time">Осталось <strong>${e.left}</strong></div>
      </div>
      <div class="progress"><i style="width:${e.pct}%"></i></div>
    </div>
  `).join('');

  document.getElementById('ach-grid').innerHTML = ACHIEVEMENTS.map(a => `
    <div class="ach-card">
      <div class="ach-ico">${a.ico}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-prog"><b>${a.cur}</b> / ${a.max}</div>
    </div>
  `).join('');

  document.getElementById('task-list').innerHTML = TASKS.map(t => `
    <div class="task-card">
      <div class="task-ico">${t.ico}</div>
      <div class="task-body">
        <div class="task-name">${t.name}</div>
        <div class="task-desc">${t.desc}</div>
      </div>
      <div class="task-meta">
        <div class="task-count">${t.count}</div>
        <div class="task-reward">${t.reward}</div>
      </div>
    </div>
  `).join('');
}

/* js / 4 — EVENTS */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.screen;
    stack.length = 0;
    stack.push(id);
    showScreen(id, false);
  });
});

document.querySelectorAll('[data-go]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.go, true));
});

document.getElementById('btn-back').addEventListener('click', () => {
  if (stack.length > 1) stack.pop();
  showScreen(stack[stack.length - 1] || 'home', false);
});

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.char;
    const detail = document.getElementById('char-detail');
    document.getElementById('char-list').classList.add('hidden');
    detail.classList.remove('hidden');
    detail.innerHTML =
      (CHAR_TEXTS[key] || '') +
      '<button class="btn-secondary" id="char-back" type="button" style="margin-top:12px">← Назад к двору</button>';
    document.getElementById('char-back').onclick = () => {
      document.getElementById('char-list').classList.remove('hidden');
      detail.classList.add('hidden');
    };
  });
});

document.getElementById('btn-laws')?.addEventListener('click', () => {
  document.getElementById('laws-box').classList.toggle('hidden');
});

document.getElementById('btn-all-ach')?.addEventListener('click', () => {
  if (tg?.showAlert) tg.showAlert('Полный список достижений — в чате Blood Moon');
  else alert('Полный список достижений — в чате Blood Moon');
});

document.querySelectorAll('.top-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const period = btn.dataset.period;
    const names = { week: 'неделю', month: 'месяц', all: 'всё время' };
    const box = document.getElementById('obana-result');
    box.classList.remove('hidden');
    box.innerHTML =
      '<div class="char-name">😱 Топ за ' + (names[period] || period) + '</div>' +
      '<p class="muted">Пока никто не внёс карты.<br>Будь первым и заставь всех сказать «Обана».</p>';
  });
});

document.getElementById('btn-help').addEventListener('click', () => {
  const msg = 'The Blood Moon\nКлуб Императоров и Вампирских Графов';
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
});
