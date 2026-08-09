const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#070203');
    tg.setBackgroundColor('#070203');
  } catch (e) {}
}

const CHAR_TEXTS = {
  inquisitor: '<div class="char-name">⚔️ Инквизитор</div><p>Мужик, священным мечом крушит нечисть, любит мыло.</p>',
  emperor: '<div class="char-name">🩸 Император</div><p>Бессмертное существо, которое любит искать мыло для инквизитора.</p>',
  eye: '<div class="char-name">👁️ Всевидящее Око</div><p>Поговаривают, она видит всё и даже для чего нужно инквизитору мыло.</p>',
  punisher: '<div class="char-name">🔥 Каратель</div><p>Она наказывает тех, у кого найдёт мыло.</p>',
  galya: '<div class="char-name">🧼 Галя</div><p>Девушка, которая всегда помогает главе, особенно когда дело касается возраста мыла бракованного.</p>',
  cheshire: '<div class="char-name">😺 Чеширский Кот</div><p>Начальник стражи и живёт там, где кормит.</p>'
};

const stack = ['home'];

function showScreen(id, push = true) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (!el) return;
  el.classList.add('active');

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === id);
  });

  const back = document.getElementById('btn-back');
  if (id === 'home') back.classList.add('hidden');
  else back.classList.remove('hidden');

  if (id === 'characters') {
    document.getElementById('char-list').classList.remove('hidden');
    document.getElementById('char-detail').classList.add('hidden');
  }
  if (id === 'quest') document.getElementById('laws-box')?.classList.add('hidden');
  if (id === 'obana') document.getElementById('obana-result')?.classList.add('hidden');

  if (push && stack[stack.length - 1] !== id) stack.push(id);
  window.scrollTo(0, 0);
}

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
  const msg = 'The Blood Moon\nКлуб Императоров и Вампирских Графов\n\nПод кроваво-красной луной пробуждается ночь…';
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
});
