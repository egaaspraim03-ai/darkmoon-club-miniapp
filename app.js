const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0A0000');
  tg.setBackgroundColor('#0A0000');
}

const CHAR_TEXTS = {
  inquisitor: '⚔️ <b>Инквизитор</b><br><br>Мужик, священным мечом крушит нечисть, любит мыло.',
  emperor: '🩸 <b>Император</b><br><br>Бессмертное существо, которое любит искать мыло для инквизитора.',
  eye: '👁️ <b>Всевидящее Око</b><br><br>Поговаривают, она видит всё и даже для чего нужно инквизитору мыло.',
  punisher: '🔥 <b>Каратель</b><br><br>Она наказывает тех, у кого найдёт мыло.',
  galya: '🧼 <b>Галя</b><br><br>Девушка, которая всегда помогает главе, особенно когда дело касается возраста мыла бракованного.',
  cheshire: '😺 <b>Чеширский Кот</b><br><br>Начальник стражи и живёт там, где кормит.'
};

const historyStack = ['home'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) el.classList.add('active');

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === id);
  });

  const back = document.getElementById('btn-back');
  back.style.visibility = id === 'home' ? 'hidden' : 'visible';

  // reset char detail
  if (id === 'characters') {
    document.getElementById('char-list').classList.remove('hidden');
    document.getElementById('char-detail').classList.add('hidden');
  }
}

document.querySelectorAll('[data-screen]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.screen;
    historyStack.push(id);
    showScreen(id);
  });
});

document.getElementById('btn-back').addEventListener('click', () => {
  if (historyStack.length > 1) historyStack.pop();
  showScreen(historyStack[historyStack.length - 1] || 'home');
});

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.char;
    const detail = document.getElementById('char-detail');
    document.getElementById('char-list').classList.add('hidden');
    detail.classList.remove('hidden');
    detail.innerHTML = CHAR_TEXTS[key] || '';
  });
});

document.getElementById('btn-help').addEventListener('click', () => {
  alert('Blood Moon — Клуб Императоров и Вампирских Графов');
});
