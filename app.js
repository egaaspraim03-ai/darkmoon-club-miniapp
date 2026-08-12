/* ============================================================
   The Blood Moon Mini App — v1.3
   Ranks 0-9 (Пирамида Нечисти) + Prize Reel (server-ready)
   Stack: HTML + Vanilla JS + modular CSS | Bot: Python
   ============================================================ */
(function () {
  'use strict';

  /* ===================== CONFIG ===================== */
  var CONFIG = {
    HAS_ACTIVE_QUEST: false,
    CLUB_NAME: 'The Blood Moon',
    INVITE_TEXT: '🌑 Вступай в The Blood Moon — клуб Императоров и Вампирских Графов.',
    STORAGE_KEY: 'bloodmoon_v13',
    DEMO_TOTAL_CARDS: 120,
    REEL_API_URL: '',
    REEL_COOLDOWN_MS: 5000,
    TIPS: [
      'Внеси карты на склад — даже 10 E уже шаг к Обане.',
      '3E = 1D. Считай вклады, прежде чем хвастаться.',
      'Император Тьмы — 7000+ карт. Пирамида почти пустая наверху.',
      'Лента призов: реальный приз решает только сервер.',
      'Обана — когда остальные говорят «как так можно?»'
    ],
    DEMO_TOP: { week: [], month: [], all: [] },
    RANK_NAMES: ['E', 'D', 'C', 'B', 'A', 'S', 'G', 'P', 'X'],
    PYRAMID: [
      { id: 'emperor', title: '🩸 Император', sub: 'Топ-1', quota: 1, width: '42%' },
      { id: 'counts', title: '👑 Высшие Графы', sub: 'Топ 2–6', quota: 5, width: '55%' },
      { id: 'lords', title: '⚔️ Лорды крови', sub: '~5%', quota: '5%', width: '70%' },
      { id: 'hunters', title: '🌑 Охотники', sub: '~20%', quota: '20%', width: '85%' },
      { id: 'servants', title: '🕯️ Слуги Тьмы', sub: '~74%', quota: '74%', width: '100%' }
    ],
    REEL_PRIZES: [
      { id: 'e10', name: '10 E', ico: '🃏', rarity: 'common', weight: 40 },
      { id: 'e50', name: '50 E', ico: '🃏', rarity: 'common', weight: 25 },
      { id: 'e100', name: '100 E', ico: '🃏', rarity: 'common', weight: 15 },
      { id: 'd1', name: '1 D', ico: '💎', rarity: 'rare', weight: 12 },
      { id: 'c1', name: '1 C', ico: '💜', rarity: 'rare', weight: 8 },
      { id: 'soap', name: 'Святое мыло', ico: '🧼', rarity: 'epic', weight: 4 },
      { id: 'title', name: 'Титул ночи', ico: '🌙', rarity: 'epic', weight: 3 },
      { id: 'obana', name: 'Шанс Обаны', ico: '😱', rarity: 'legend', weight: 2 },
      { id: 'blood', name: 'Кровь ×3', ico: '🩸', rarity: 'legend', weight: 1 }
    ]
  };

  var NECRO_RANKS = [
    { level: 0, name: 'Смертный', min_cards: 0, aura: '#808080', special: null },
    { level: 1, name: 'Блуждающий Дух Крови', min_cards: 50, aura: '#ff9999', special: null },
    { level: 2, name: 'Злобный Упырь', min_cards: 150, aura: '#ffa500', special: null },
    { level: 3, name: 'Полувампир', min_cards: 300, aura: '#ffff00', special: null },
    { level: 4, name: 'Истинный Вампир', min_cards: 500, aura: '#00ff00', special: null },
    { level: 5, name: 'Офицер Тьмы', min_cards: 800, aura: '#00ffff', special: null },
    { level: 6, name: 'Генерал Ночи', min_cards: 1500, aura: '#0000ff', special: null },
    { level: 7, name: 'Святой Прародитель', min_cards: 3500, aura: '#8a2be2', special: null },
    { level: 8, name: 'Король Кровавой Луны', min_cards: 5000, aura: null, special: 'glass' },
    { level: 9, name: 'Император Тьмы', min_cards: 7000, aura: null, special: 'glitch' }
  ];

  function getUserRank(totalCards) {
    var total = Math.max(0, parseInt(totalCards, 10) || 0);
    var current = NECRO_RANKS[0];
    for (var i = 0; i < NECRO_RANKS.length; i++) {
      if (total >= NECRO_RANKS[i].min_cards) current = NECRO_RANKS[i];
      else break;
    }
    if (current.level >= 9) {
      return Object.assign({}, current, {
        total_cards: total, next_min: null, next_name: null,
        progress_pct: 100, cards_to_next: 0, is_max: true
      });
    }
    var nxt = NECRO_RANKS[current.level + 1];
    var span = nxt.min_cards - current.min_cards;
    var done = total - current.min_cards;
    var pct = span <= 0 ? 0 : Math.min(100, Math.max(0, (done / span) * 100));
    return Object.assign({}, current, {
      total_cards: total, next_min: nxt.min_cards, next_name: nxt.name,
      progress_pct: Math.round(pct * 10) / 10,
      cards_to_next: Math.max(0, nxt.min_cards - total), is_max: false
    });
  }

  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

  function haptic(kind) {
    try {
      if (!tg || !tg.HapticFeedback) return;
      if (kind === 'success' || kind === 'warning' || kind === 'error')
        tg.HapticFeedback.notificationOccurred(kind);
      else tg.HapticFeedback.impactOccurred(kind || 'light');
    } catch (e) {}
  }

  function toast(msg, ms) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, ms || 2400);
  }

  function openExt(url) {
    if (!url || url === 'https://t.me/' || url === 'https://t.me') {
      toast('Вставь реальную ссылку в index.html');
      haptic('warning');
      return;
    }
    try {
      if (tg && /t\.me\//i.test(url) && tg.openTelegramLink) { tg.openTelegramLink(url); return; }
      if (tg && tg.openLink) { tg.openLink(url, { try_instant_view: false }); return; }
    } catch (e) {}
    window.open(url, '_blank', 'noopener');
  }

  function initTelegram() {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
      tg.setHeaderColor('#050001');
      tg.setBackgroundColor('#050001');
      if (tg.setBottomBarColor) tg.setBottomBarColor('#050001');
    } catch (e) {}
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { visits: 0, streak: 0, lastDay: '', tipIdx: 0, totalCards: CONFIG.DEMO_TOTAL_CARDS };
  }
  function saveState(s) {
    try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function bumpRetention() {
    var s = loadState();
    var today = todayKey();
    s.visits = (s.visits || 0) + 1;
    if (typeof s.totalCards !== 'number') s.totalCards = CONFIG.DEMO_TOTAL_CARDS;
    if (s.lastDay !== today) {
      var y = new Date();
      y.setDate(y.getDate() - 1);
      var yKey = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
      s.streak = (s.lastDay === yKey) ? (s.streak || 0) + 1 : 1;
      s.lastDay = today;
      s.tipIdx = ((s.tipIdx || 0) + 1) % CONFIG.TIPS.length;
    }
    saveState(s);
    return s;
  }

  var CHAR_TEXTS = {
    inquisitor: '<div class="char-name">⚔️ Инквизитор</div><p>Мужик, священным мечом крушит нечисть, любит мыло.</p>',
    emperor: '<div class="char-name">🩸 Император</div><p>Бессмертное существо, которое любит искать мыло для инквизитора.</p>',
    eye: '<div class="char-name">👁️ Всевидящее Око</div><p>Поговаривают, она видит всё и даже для чего нужно инквизитору мыло.</p>',
    punisher: '<div class="char-name">🔥 Каратель</div><p>Она наказывает тех, у кого найдёт мыло.</p>',
    galya: '<div class="char-name">🧼 Галя</div><p>Девушка, которая всегда помогает главе, особенно когда дело касается возраста мыла бракованного.</p>',
    cheshire: '<div class="char-name">😺 Чеширский Кот</div><p>Начальник стражи и живёт там, где кормит.</p>'
  };
  var EVENTS = [
    { ico: '🩸', title: 'Кровавый влог', left: '11 ч 16 мин', pct: 28 },
    { ico: '🔥', title: 'Жатва карт', left: '3 ч 40 мин', pct: 62 },
    { ico: '⚔️', title: 'Охота на нечисть', left: '6 ч 5 мин', pct: 45 },
    { ico: '👑', title: 'Дар Императору', left: '14 ч 2 мин', pct: 18 }
  ];
  var ACHIEVEMENTS = [
    { ico: '🩸', name: 'Кровавая жатва', cur: 0, max: 5 },
    { ico: '📦', name: 'Склад Империи', cur: 0, max: 10 },
    { ico: '🌑', name: 'Под луной', cur: 0, max: 3 },
    { ico: '🔥', name: 'Огонь арены', cur: 0, max: 7 }
  ];
  var TASKS = [
    { ico: '🩸', name: 'Кровавый влог', desc: 'Выполни 1 кровавый влог', count: '0 / 1', reward: '+50 крови' },
    { ico: '📦', name: 'Дань складу', desc: 'Внеси карты на склад', count: '0 / 10', reward: '+ранг' },
    { ico: '⚔️', name: 'Трибута альянсу', desc: 'Вложи в альянс за день', count: '0 / 500 E', reward: 'слава' }
  ];
   function toE(amount, rankIdx) {
    var n = Math.max(0, Number(amount) || 0), e = n, i;
    for (i = 0; i < rankIdx; i++) e *= 3;
    return e;
  }
  function fromE(eValue, targetIdx) {
    var e = eValue, i;
    for (i = 0; i < targetIdx; i++) e /= 3;
    return e;
  }
  function formatRankBreakdown(amount, rankIdx) {
    var names = CONFIG.RANK_NAMES, e = toE(amount, rankIdx), lines = [], t, v;
    lines.push('<strong>' + amount + ' ' + names[rankIdx] + '</strong> ≈ <strong>' + Math.round(e) + ' E</strong>');
    for (t = 0; t < names.length; t++) {
      if (t === rankIdx) continue;
      v = fromE(e, t);
      if (v >= 0.01) lines.push('≈ ' + (v >= 10 ? Math.round(v) : Math.round(v * 100) / 100) + ' ' + names[t]);
    }
    return lines.join('<br>');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function getTgUser() {
    try {
      var u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (u) return { name: u.first_name || u.username || 'гость', photo: u.photo_url || '', id: u.id };
    } catch (e) {}
    return { name: 'гость', photo: '', id: null };
  }
  function getTotalCards() {
    var s = loadState();
    return typeof s.totalCards === 'number' ? s.totalCards : CONFIG.DEMO_TOTAL_CARDS;
  }

  function renderUserProfileCard(rootId, data) {
    var root = document.getElementById(rootId || 'profile-root');
    if (!root) return;
    data = data || {};
    var name = data.name || getTgUser().name;
    var photo = data.photo != null ? data.photo : getTgUser().photo;
    var total = data.totalCards != null ? data.totalCards : getTotalCards();
    var rank = getUserRank(total);
    var specialClass = '';
    if (rank.special === 'glass') specialClass = ' special-glass';
    if (rank.special === 'glitch') specialClass = ' special-glitch';
    var aura = rank.aura || 'rgba(255,45,85,0.5)';
    var ringStyle = rank.special
      ? (rank.special === 'glass'
        ? 'box-shadow: 0 0 0 2px rgba(255,255,255,0.35), 0 0 24px rgba(255,255,255,0.12), 0 0 40px rgba(255,45,85,0.2);'
        : 'box-shadow: 3px 0 12px rgba(255,45,85,0.5), -3px 0 12px rgba(0,220,255,0.35), 0 0 28px rgba(120,0,40,0.5);')
      : 'box-shadow: 0 0 0 2px ' + aura + ', 0 0 18px ' + aura + ', 0 0 36px ' + aura + ';';
    var rankColor = rank.aura || 'var(--neon)';
    var nextLine = rank.is_max
      ? 'Максимум. Император Тьмы.'
      : ('До «' + rank.next_name + '»: <b>' + rank.cards_to_next + '</b> карт · ' + rank.progress_pct + '%');
    var avatarHtml = photo
      ? '<img class="profile-avatar" src="' + escapeHtml(photo) + '" alt="" />'
      : '<div class="profile-avatar-fallback">🩸</div>';
    root.innerHTML =
      '<div class="profile-card' + specialClass + '">' +
      '<div class="profile-avatar-wrap"><div class="ring" style="' + ringStyle + '"></div>' + avatarHtml + '</div>' +
      '<div class="profile-name">' + escapeHtml(name) + '</div>' +
      '<div class="profile-rank" style="color:' + rankColor + '">Lv.' + rank.level + ' · ' + escapeHtml(rank.name) + '</div>' +
      '<div class="profile-cards">Карт (вклад): <b style="color:var(--neon)">' + total + '</b></div>' +
      '<div class="profile-progress-wrap">' +
      '<div class="profile-progress-labels"><span>Прогресс</span><b>' + rank.progress_pct + '%</b></div>' +
      '<div class="progress"><i style="width:' + rank.progress_pct + '%;background:' + (rank.aura ? 'linear-gradient(90deg,' + rank.aura + ',#ff1f45)' : 'var(--bar-fill)') + '"></i></div>' +
      '<p class="muted" style="margin-top:8px;margin-bottom:0;font-size:12px">' + nextLine + '</p>' +
      '</div></div>';
  }

  function renderRankLadder() {
    var box = document.getElementById('rank-ladder');
    if (!box) return;
    var total = getTotalCards();
    var cur = getUserRank(total).level;
    box.innerHTML = NECRO_RANKS.map(function (r) {
      var cls = r.level === cur ? ' current' : '';
      var dotCls = r.special === 'glass' ? ' glass' : (r.special === 'glitch' ? ' glitch' : '');
      var bg = r.aura ? 'background:' + r.aura : '';
      return (
        '<div class="rl-row' + cls + '">' +
        '<span class="dot' + dotCls + '" style="' + bg + '"></span>' +
        '<span><b>Lv.' + r.level + '</b> ' + r.name + '</span>' +
        '<span style="margin-left:auto;color:var(--muted)">' + r.min_cards + '+</span></div>'
      );
    }).join('');
  }

  var stack = ['home'];

  function showScreen(id, push) {
    if (push === undefined) push = true;
    var el = document.getElementById('screen-' + id);
    if (!el) return;
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    el.classList.add('active');

    var tabId = id;
    if (id === 'chronicles' || id === 'characters' || id === 'rules') tabId = 'archives';
    if (id === 'quest' || id === 'pyramid' || id === 'reel' || id === 'profile' || id === 'snake') tabId = 'hall';

    document.querySelectorAll('.tab').forEach(function (t) {
      var ds = t.getAttribute('data-screen');
      t.classList.toggle('active', ds === tabId || ds === id);
    });

    var back = document.getElementById('btn-back');
    if (back) {
      if (id === 'home') back.classList.add('hidden');
      else back.classList.remove('hidden');
    }
    try {
      if (tg && tg.BackButton) {
        if (id === 'home') tg.BackButton.hide();
        else tg.BackButton.show();
      }
    } catch (e) {}

    if (id === 'characters') {
      var detail = document.getElementById('char-detail');
      if (detail) detail.classList.add('hidden');
      if (window.BloodCourt && window.BloodCourt.onShow) window.BloodCourt.onShow();
    }
    if (id === 'quest') renderQuest();
    if (id === 'obana') renderObana('week');
    if (id === 'site') updateRankCalc();
    if (id === 'pyramid') renderPyramid();
    if (id === 'reel') ensureReelBuilt();
    if (id === 'snake' && window.BloodSnake && window.BloodSnake.onShow) window.BloodSnake.onShow();
    if (id !== 'snake' && window.BloodSnake && window.BloodSnake.onHide) window.BloodSnake.onHide();
    if (id === 'profile') {
      renderUserProfileCard('profile-root');
      renderRankLadder();
    }

    if (push && stack[stack.length - 1] !== id) stack.push(id);
    var main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;
    updateMainButton(id);
  }

  function goBack() {
    if (stack.length > 1) stack.pop();
    showScreen(stack[stack.length - 1] || 'home', false);
    haptic('light');
  }

  function updateMainButton(id) {
    if (!tg || !tg.MainButton) return;
    try {
      if (id === 'obana' || id === 'quest' || id === 'hall' || id === 'reel') {
        tg.MainButton.setText(id === 'reel' ? '🎰 Крутить' : (id === 'obana' ? '😱 Обана' : '🩸 К вкладам'));
        tg.MainButton.show();
        tg.MainButton.onClick(function () {
          if (id === 'reel') spinReel();
          else { haptic('medium'); toast('Скоро через бота · пока — чат Blood Moon'); }
        });
      } else tg.MainButton.hide();
    } catch (e) {}
  }

  function renderQuest() {
    var empty = document.getElementById('quest-empty');
    var active = document.getElementById('quest-active');
    if (!empty || !active) return;
    if (!CONFIG.HAS_ACTIVE_QUEST) {
      empty.classList.remove('hidden');
      active.classList.add('hidden');
      return;
    }
    empty.classList.add('hidden');
    active.classList.remove('hidden');
    var timers = document.getElementById('event-timers');
    if (timers) {
      timers.innerHTML = EVENTS.map(function (e) {
        return '<div class="event-card"><div class="event-top"><div class="event-title"><span class="ico">' + e.ico + '</span>' + e.title +
          '</div><div class="event-time">Осталось <strong>' + e.left + '</strong></div></div><div class="progress"><i style="width:' + e.pct + '%"></i></div></div>';
      }).join('');
    }
    var grid = document.getElementById('ach-grid');
    if (grid) {
      grid.innerHTML = ACHIEVEMENTS.map(function (a) {
        return '<div class="ach-card"><div class="ach-ico">' + a.ico + '</div><div class="ach-name">' + a.name +
          '</div><div class="ach-prog"><b>' + a.cur + '</b> / ' + a.max + '</div></div>';
      }).join('');
    }
     var tlist = document.getElementById('task-list');
    if (tlist) {
      tlist.innerHTML = TASKS.map(function (t) {
        return '<div class="task-card"><div class="task-ico">' + t.ico + '</div><div class="task-body"><div class="task-name">' + t.name +
          '</div><div class="task-desc">' + t.desc + '</div></div><div class="task-meta"><div class="task-count">' + t.count +
          '</div><div class="task-reward">' + t.reward + '</div></div></div>';
      }).join('');
    }
  }

  function renderObana(period) {
    var box = document.getElementById('obana-result');
    if (!box) return;
    var names = { week: 'неделю', month: 'месяц', all: 'всё время' };
    var list = (CONFIG.DEMO_TOP && CONFIG.DEMO_TOP[period]) || [];
    var html = '<div class="char-name">😱 Топ за ' + (names[period] || period) + '</div>';
    if (!list.length) {
      html += '<p class="muted" style="margin-top:8px">Пока пусто — стань <b style="color:var(--neon)">первой кровью</b>.</p>' +
        '<div class="lb">' +
        '<div class="lb-row top1"><div class="pos">1</div><div><div class="who">Место свободно</div><div class="meta">вклад · моды</div></div><div class="val">—</div></div>' +
        '<div class="lb-row"><div class="pos">2</div><div><div class="who">—</div><div class="meta">ждёт</div></div><div class="val">—</div></div>' +
        '<div class="lb-row"><div class="pos">3</div><div><div class="who">—</div><div class="meta">ждёт</div></div><div class="val">—</div></div></div>';
    } else {
      html += '<div class="lb">' + list.map(function (row, i) {
        return '<div class="lb-row' + (i === 0 ? ' top1' : '') + '"><div class="pos">' + (i + 1) +
          '</div><div><div class="who">' + row.name + '</div><div class="meta">' + (row.meta || '') +
          '</div></div><div class="val">' + row.val + '</div></div>';
      }).join('') + '</div>';
    }
    box.innerHTML = html;
  }

  function updateRankCalc() {
    var amountEl = document.getElementById('rank-amount');
    var fromEl = document.getElementById('rank-from');
    var out = document.getElementById('rank-out');
    if (!amountEl || !fromEl || !out) return;
    out.innerHTML = formatRankBreakdown(amountEl.value, parseInt(fromEl.value, 10) || 0);
  }

  function renderPyramid() {
    var box = document.getElementById('pyramid-box');
    if (!box) return;
    var rank = getUserRank(getTotalCards());
    var layer = 4;
    if (rank.level >= 9) layer = 0;
    else if (rank.level >= 7) layer = 1;
    else if (rank.level >= 5) layer = 2;
    else if (rank.level >= 2) layer = 3;
    box.innerHTML = CONFIG.PYRAMID.map(function (tier, i) {
      var me = (i === layer) ? ' me' : '';
      var apex = (i === 0) ? ' apex' : '';
      return '<div class="pyr-tier' + me + apex + '" style="--w:' + tier.width + '">' +
        '<div class="pyr-left"><div class="pyr-title">' + tier.title + '</div><div class="pyr-sub">' + tier.sub +
        '</div></div><div class="pyr-right"><div class="pyr-count">' + tier.quota +
        '</div><div class="pyr-pct">квота</div></div></div>';
    }).join('');
    var bar = document.getElementById('xp-bar');
    var lab = document.getElementById('xp-label');
    if (bar) bar.style.width = rank.progress_pct + '%';
    if (lab) lab.textContent = rank.is_max ? 'MAX' : (rank.progress_pct + '% → ' + rank.next_name);
    var leg = document.getElementById('pyr-legend');
    if (leg) leg.innerHTML = 'Твой путь: <b style="color:var(--neon)">' + rank.name + '</b> (Lv.' + rank.level + ')';
  }

  var reelBuilt = false;
  var reelBusy = false;
  var reelCards = [];
  var STRIP_LEN = 56;

  function weightedPick(prizes) {
    var total = 0, i, r, acc = 0;
    for (i = 0; i < prizes.length; i++) total += prizes[i].weight;
    r = Math.random() * total;
    for (i = 0; i < prizes.length; i++) {
      acc += prizes[i].weight;
      if (r <= acc) return prizes[i];
    }
    return prizes[prizes.length - 1];
  }

  function ensureReelBuilt(forcePrizeId, forceIndex) {
    var track = document.getElementById('reel-track');
    if (!track) return;
    var pool = CONFIG.REEL_PRIZES;
    var strip = [];
    var i;
    for (i = 0; i < STRIP_LEN; i++) strip.push(pool[i % pool.length]);
    if (forcePrizeId != null && forceIndex != null) {
      var prize = null;
      for (i = 0; i < pool.length; i++) if (pool[i].id === forcePrizeId) prize = pool[i];
      if (prize) strip[forceIndex] = prize;
    }
    reelCards = strip;
    track.innerHTML = strip.map(function (p) {
      return '<div class="reel-card r-' + p.rarity + '" data-id="' + p.id + '">' +
        '<div class="ri">' + p.ico + '</div><div class="rn">' + p.name + '</div></div>';
    }).join('');
    track.style.transform = 'translate3d(0,0,0)';
    track.classList.remove('spinning');
    reelBuilt = true;
  }

  function requestSpinResult() {
    if (CONFIG.REEL_API_URL) {
      return fetch(CONFIG.REEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: (tg && tg.initData) || '' })
      }).then(function (r) {
        if (!r.ok) throw new Error('spin failed');
        return r.json();
      }).then(function (data) {
        return {
          prize_id: data.prize_id || data.prizeId,
          strip_index: data.strip_index != null ? data.strip_index : data.stripIndex,
          prize: data.prize
        };
      });
    }
    var prize = weightedPick(CONFIG.REEL_PRIZES);
    var idx = 42 + Math.floor(Math.random() * 8);
    if (idx >= STRIP_LEN) idx = STRIP_LEN - 3;
    return Promise.resolve({ prize_id: prize.id, strip_index: idx, prize: prize });
  }

  function spinReel() {
    if (reelBusy) return;
    var track = document.getElementById('reel-track');
    var result = document.getElementById('reel-result');
    var btn = document.getElementById('btn-spin');
    if (!track || !result) return;

    reelBusy = true;
    if (btn) btn.disabled = true;
    result.innerHTML = '<span class="muted">Кровь решает…</span>';
    haptic('medium');

    requestSpinResult().then(function (res) {
      var prize = res.prize;
      if (!prize) {
        for (var i = 0; i < CONFIG.REEL_PRIZES.length; i++) {
          if (CONFIG.REEL_PRIZES[i].id === res.prize_id) { prize = CONFIG.REEL_PRIZES[i]; break; }
        }
      }
      if (!prize) prize = CONFIG.REEL_PRIZES[0];
      var targetIndex = res.strip_index != null ? res.strip_index : 45;

      ensureReelBuilt(prize.id, targetIndex);

      var cardW = 98;
      var winEl = track.parentElement;
      var center = winEl ? winEl.clientWidth / 2 : 160;
      var offset = targetIndex * cardW - center + 44 + 12;

      track.classList.remove('spinning');
      track.style.transform = 'translate3d(0,0,0)';
      void track.offsetWidth;
      track.classList.add('spinning');
      track.style.transition = 'transform ' + (CONFIG.REEL_COOLDOWN_MS / 1000) + 's cubic-bezier(0.15, 0.9, 0.15, 1)';
      track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';

      setTimeout(function () {
        result.innerHTML = '<div class="win">' + prize.ico + ' ' + prize.name + '</div>' +
          '<div class="muted">Редкость: ' + prize.rarity + (CONFIG.REEL_API_URL ? '' : ' · демо') + '</div>';
        toast('Выпало: ' + prize.name);
        haptic('success');
        reelBusy = false;
        if (btn) btn.disabled = false;
        setTimeout(function () { track.classList.remove('spinning'); }, 80);
      }, CONFIG.REEL_COOLDOWN_MS);
    }).catch(function () {
      toast('Спин недоступен. Попробуй позже.');
      haptic('error');
      reelBusy = false;
      if (btn) btn.disabled = false;
      result.innerHTML = '<span class="muted">Ошибка спина</span>';
    });
  }

  function applyUserHome() {
    var u = getTgUser();
    var w = document.getElementById('welcome');
    if (w) w.innerHTML = 'Добро пожаловать в ночь, <b>' + escapeHtml(u.name) + '</b>';
    var img = document.getElementById('avatar');
    var fb = document.getElementById('avatar-fallback');
    if (u.photo && img) {
      img.src = u.photo;
      img.classList.remove('hidden');
      if (fb) fb.classList.add('hidden');
      img.onerror = function () { img.classList.add('hidden'); if (fb) fb.classList.remove('hidden'); };
    }
  }
   function applyRetentionUI(s) {
    var rank = getUserRank(s.totalCards != null ? s.totalCards : getTotalCards());
    var v = document.getElementById('stat-visits');
    var st = document.getElementById('stat-streak');
    var r = document.getElementById('stat-rank');
    if (v) v.textContent = String(s.visits || 1);
    if (st) st.textContent = String(s.streak || 1);
    if (r) r.textContent = 'L' + rank.level;
    var tip = document.getElementById('tip-text');
    if (tip) tip.textContent = CONFIG.TIPS[s.tipIdx % CONFIG.TIPS.length];
    var badge = document.getElementById('hall-badge');
    if (badge) {
      if (CONFIG.HAS_ACTIVE_QUEST) badge.classList.remove('hidden');
      else badge.classList.add('hidden');
    }
    var mini = document.getElementById('home-rank-mini');
    if (mini) mini.textContent = rank.name;
  }

  function shareInvite() {
    haptic('medium');
    var text = CONFIG.INVITE_TEXT;
    try {
      if (tg && tg.switchInlineQuery) { tg.switchInlineQuery(text, ['users', 'groups', 'channels']); return; }
    } catch (e) {}
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('Приглашение скопировано'); });
        return;
      }
    } catch (e) {}
    toast(text, 4000);
  }

  function resolveStartScreen() {
    try {
      var sp = (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) || '';
      if (!sp) {
        var q = new URLSearchParams(location.search);
        sp = q.get('startapp') || q.get('screen') || '';
      }
      sp = String(sp).toLowerCase();
      var allowed = {
        home: 1, site: 1, archives: 1, hall: 1, quest: 1, obana: 1,
        chronicles: 1, characters: 1, rules: 1, pyramid: 1, reel: 1, profile: 1, snake: 1
      };
      if (allowed[sp]) return sp;
    } catch (e) {}
    return 'home';
  }

  function bind() {
    initTelegram();
    var state = bumpRetention();
    applyUserHome();
    applyRetentionUI(state);

    setTimeout(function () {
      var sp = document.getElementById('splash');
      if (sp) sp.classList.add('hide');
    }, 850);

    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var id = tab.getAttribute('data-screen');
        if (!id) return;
        stack = [id];
        showScreen(id, false);
        haptic('light');
      });
    });

    document.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var go = btn.getAttribute('data-go');
        if (go) { showScreen(go, true); haptic('medium'); }
      });
    });

    var btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.addEventListener('click', function (e) { e.preventDefault(); goBack(); });
    try { if (tg && tg.BackButton) tg.BackButton.onClick(goBack); } catch (e) {}

    document.querySelectorAll('.char-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-char');
        var detail = document.getElementById('char-detail');
        var list = document.getElementById('char-list');
        if (!detail || !list) return;
        list.classList.add('hidden');
        detail.classList.remove('hidden');
        detail.innerHTML = (CHAR_TEXTS[key] || '<p class="muted">Нет описания</p>') +
          '<button class="btn-secondary" id="char-back" type="button" style="margin-top:12px">← Назад к двору</button>';
        var backChar = document.getElementById('char-back');
        if (backChar) backChar.onclick = function () {
          list.classList.remove('hidden');
          detail.classList.add('hidden');
          haptic('light');
        };
        haptic('medium');
      });
    });

    var laws = document.getElementById('btn-laws');
    if (laws) laws.addEventListener('click', function () {
      var box = document.getElementById('laws-box');
      if (box) box.classList.toggle('hidden');
      haptic('light');
    });

    var allAch = document.getElementById('btn-all-ach');
    if (allAch) allAch.addEventListener('click', function () {
      var msg = 'Полный список достижений — в чате Blood Moon';
      if (tg && tg.showAlert) tg.showAlert(msg); else alert(msg);
      haptic('light');
    });

    document.querySelectorAll('.top-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        renderObana(btn.getAttribute('data-period') || 'week');
        haptic('medium');
      });
    });

    var claim = document.getElementById('btn-claim');
    if (claim) claim.addEventListener('click', function () {
      haptic('success');
      toast('Модам: «Хочу в Обану» + скрин вклада');
    });

    var share = document.getElementById('btn-share');
    if (share) share.addEventListener('click', shareInvite);

    var spinBtn = document.getElementById('btn-spin');
    if (spinBtn) spinBtn.addEventListener('click', function () { spinReel(); });

    var sim = document.getElementById('sim-cards');
    if (sim) {
      sim.addEventListener('change', function () {
        var s = loadState();
        s.totalCards = parseInt(sim.value, 10) || 0;
        saveState(s);
        applyRetentionUI(s);
        renderUserProfileCard('profile-root');
        renderRankLadder();
        renderPyramid();
        toast('Карт (демо): ' + s.totalCards);
      });
    }

    var help = document.getElementById('btn-help');
    if (help) help.addEventListener('click', function () {
      var msg = CONFIG.CLUB_NAME + '\nПирамида Нечисти · Обана · Лента призов\nНавигация — снизу.';
      try {
        if (tg && tg.showPopup) tg.showPopup({ title: 'Blood Moon', message: msg, buttons: [{ type: 'close' }] });
        else if (tg && tg.showAlert) tg.showAlert(msg);
        else alert(msg);
      } catch (e) { alert(msg); }
      haptic('light');
    });

    document.querySelectorAll('a[data-ext], a[href^="http"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openExt(a.getAttribute('href'));
        haptic('light');
      });
    });

    var btnRank = document.getElementById('btn-rank-calc');
    if (btnRank) btnRank.addEventListener('click', function () { updateRankCalc(); haptic('light'); });
    var amount = document.getElementById('rank-amount');
    var from = document.getElementById('rank-from');
    if (amount) amount.addEventListener('input', updateRankCalc);
    if (from) from.addEventListener('change', updateRankCalc);

    var start = resolveStartScreen();
    stack = ['home'];
    if (start !== 'home') {
      stack = ['home', start];
      showScreen(start, false);
    } else showScreen('home', false);
  }

  window.BloodMoon = {
    getUserRank: getUserRank,
    spinReel: spinReel,
    CONFIG: CONFIG,
    NECRO_RANKS: NECRO_RANKS
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
     
     
