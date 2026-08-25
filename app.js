/* ============================================================
   The Blood Moon Mini App — v2.1
   Ranks · Calc (merge/split/market) · Quotes · Skill tree
   Stack: HTML + Vanilla JS + modular CSS
   ============================================================ */
(function () {
  'use strict';

  /* ===================== CONFIG ===================== */
  var CONFIG = {
    HAS_ACTIVE_QUEST: false,
    CLUB_NAME: 'The Blood Moon',
    INVITE_TEXT: '🌑 Вступай в The Blood Moon — клуб Императоров и Вампирских Графов.',
    LINKS: {
      site: 'https://mangabuff.ru',
      news: 'https://t.me/mangabuff',
      mods: 'https://t.me/modermangabuff',
      pod: 'https://t.me/podmbff',
      shop: 'https://mangabuff.ru/products/cover',
      tower: 'https://mangabuff.ru/tower',
      battle: 'https://mangabuff.ru/battle',
      imperator: 'https://t.me/IMPERATOR_3',
      alex: 'https://t.me/Alex_Darrk',
      club_chat: ''  /* private — bot only checks, never send to users */
    },
    STORAGE_KEY: 'bloodmoon_v21',
    DEMO_TOTAL_CARDS: 120,
    REEL_API_URL: '',
    REEL_COOLDOWN_MS: 5000,
    QUOTE_INTERVAL_MS: 45000,
    TIPS: [
      'Внеси карты на склад — даже 10 E уже шаг к Обане.',
      '3E = 1D. Считай вклады, прежде чем хвастаться.',
      'Император Тьмы — 7000+ карт. Пирамида почти пустая наверху.',
      'Лента призов: реальный приз решает только сервер.',
      'Обана — когда остальные говорят «как так можно?»'
    ],
    DEMO_TOP: { week: [], month: [], all: [] },
    RANK_NAMES: ['E', 'D', 'C', 'B', 'A', 'S', 'G', 'P', 'X'],
    MERGE_RATIO: 3,
    SPLIT_RATIO: 2,
    MARKET_NN: {
      X: { S: [5, 12], A: [10, 22], P: [25, 35], G: [40, 50], B: [50, 150], C: [40, 150], D: [55, 200], E: [75, 300] },
      S: { S: [2, 2], A: [2, 4], P: [4, 8], G: [5, 16], B: [6, 20], C: [3, 12], D: [3, 35], E: [3, 25] },
      A: { P: [2, 4], G: [3, 6], B: [4, 10], C: [3, 9], D: [3, 15], E: [5, 25] }
    },
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
    ],
    QUOTES: [
      { t: 'Не бывает безвыходных ситуаций. Бывают ситуации, выход из которых тебя не устраивает.', a: 'Шикамару · Naruto' },
      { t: 'Если ты не рискнёшь — никогда не узнаешь, на что способен.', a: 'Эдвард · Fullmetal Alchemist' },
      { t: 'Сила — не в том, чтобы никогда не падать, а в том, чтобы снова вставать.', a: 'Гоку · Dragon Ball' },
      { t: 'Тот, кто не ценит жизнь, не достоин жить.', a: 'Хисока · Hunter × Hunter' },
      { t: 'Боль — это то, что делает нас сильнее.', a: 'Итачи · Naruto' },
      { t: 'Даже в полной тьме можно найти свет, если не сдаваться.', a: 'Эрен · Attack on Titan' },
      { t: 'Судьба — это то, что мы выбираем, а не то, что нам дают.', a: 'Луффи · One Piece' },
      { t: 'Настоящая сила — защищать тех, кто тебе дорог.', a: 'Ичиго · Bleach' },
      { t: 'Страх — это цепь. Сломай её — и станешь свободным.', a: 'Кен · Tokyo Ghoul' },
      { t: 'Кровь не врёт. Она помнит каждый долг.', a: 'The Blood Moon' },
      { t: 'Император не просит — он принимает дань.', a: 'Двор Кровавой Луны' },
      { t: 'Мыло святое. Кто скрыл — тот уже виновен.', a: 'Инквизитор' }
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
      total_cards: total,
      next_min: nxt.min_cards,
      next_name: nxt.name,
      progress_pct: Math.round(pct * 10) / 10,
      cards_to_next: Math.max(0, nxt.min_cards - total),
      is_max: false
    });
  }


  /* ===================== PANTHEON (6 столпов) ===================== */
  var PANTHEON_ORDER = ['inquisitor', 'emperor', 'eye', 'punisher', 'lady', 'cheshire'];
  var pantheonIndex = 0;
  var pantheonTouchX = 0;

  var PANTHEON_DATA = {
    inquisitor: {
      id: 'inquisitor',
      title: 'Инквизитор',
      subtitle: 'Меч правосудия',
      role: 'Живая Печать',
      color: '#ff1f45',
      art: 'assets/pantheon/inquisitor.png',
      history:
        'Алекс Тёмная — Инквизитор, Живая Печать.\n\n' +
        'Последняя из Двойственных.\n\n' +
        'Она взвалила на свои плечи ношу, от которой с криком отшатнулись бы даже титаны.\n\n' +
        'Чтобы Неназываемый Враг не вернулся, мирозданию требовался замок. В час абсолютного отчаяния Алекс совершила невозможное: она позволила Свету и Тьме внутри себя сцепиться насмерть, превратив собственную душу в вечный двигатель парадокса. Эта бескрайняя сила питает Великую Печать — барьер, запечатовавший предводителя Пустоты в уснувшем ядре кровавой Луны.\n\n' +
        'Если Свет или Тьма внутри неё однажды победят, Печать поглотит Алекс. Если же победит свет, то предводитель переродится; ежели победит тьма — то восстанет он. Поэтому Алекс вынуждена балансировать на лезвии ножа каждую секунду своего существования.\n\n' +
        'Днём, когда над миром восходит солнце, в ней доминирует Свет. Она становится Инквизитором — холодной, беспристрастной, пугающе справедливой и милосердной. Но как только небеса чернеют, просыпается Клинок Правосудия. Ночная Алекс не ведает пощады, выжигая любую скверну, угрожающую Печати.\n\n' +
        'Её оружие выковано из осколка самой Луны, окроплённого кровью падших богов. А глубоко под кратерами уснувшего спутника лежит её верный страж — колоссальный дракон Северин, чьё дыхание сковало льдом тюрьму Врага. Он видит то же, что и его госпожа: видения о конце всего сущего.'
    },
    emperor: {
      id: 'emperor',
      title: 'Император',
      subtitle: 'Архитектор Творения',
      role: 'Последнее Эхо',
      color: '#c9a227',
      art: 'assets/pantheon/emperor.png',
      history:
        'Император Без Имени — Архитектор Творения.\n\n' +
        'Последнее Эхо.\n\n' +
        'Он был вторым выжившим. Но если Алекс сделала свою борьбу источником силы, он избрал иной путь.\n\n' +
        'Император обуздал своих внутренних демонов, слив Свет и Тьму в единый инструмент — Созидание. Тёмная сущность в нём вырывала материю из небытия, а Светлая сплетала из неё вероятности и судьбы на тысячелетия вперёд. Именно его гениальный мозг породил чудовищную формулу Живой Печати. Он точно высчитал, сколько должна Алекс тратить энергии на свет и тьму, чтобы миры продолжали жить. А верный спутник-дракон удерживает основу формулы.\n\n' +
        'Осознав весь ужас своего творения, он отсёк собственное Имя, отдав его как плату за равновесие, и скрыл лицо под маской. Теперь он Творец. Он создаёт новые миры, расы и законы мироздания, возводя всё новые стены вокруг кровавой Луны.\n\n' +
        'Он знает, что каждое его творение может нарушить баланс. Но остановиться — значит признать, что жертва Алекс была напрасной. И Император продолжает свою партию, где вместо шахматных фигур — звёздные системы.'
    },
    eye: {
      id: 'eye',
      title: 'Всевидящее Око',
      subtitle: 'Видит всё',
      role: 'Нити Судьбы',
      color: '#ff3d6e',
      art: 'assets/pantheon/eye.png',
      history:
        'Всевидящее Око — Нити Судьбы.\n\n' +
        'Та, что пожертвовала настоящим ради будущего.\n\n' +
        'В древности её звали Иссэра, и она была смертной провидицей, рискнувшей заглянуть за Грань во время Войны. То, что она увидела, выжгло её глаза, но наполнило пустые глазницы первозданным светом Истины.\n\n' +
        'Теперь она — Всевидящее Око, сущность, вросшая в Шпиль Откровений на краю Вселенной. Иссэра больше не видит материального мира. Для неё нет ни «вчера», ни «завтра». Она созерцает Великий Узор — миллиарды переплетающихся нитей судьбы.\n\n' +
        'Она видит, как в одной из реальностей Враг вырывается на свободу. В другой — Печать поглощает саму Алекс. Задача Ока — находить микроскопические узлы вероятностей и мягко направлять ход истории так, чтобы Упорядоченное двигалось по единственной ветви, где катастрофа отсрочена. Она молчит тысячелетиями, ибо каждое её слово мгновенно становится непреложным Законом, отсекающим миллионы иных будущих. Её слепота — щит, спасающий разум от безумия всезнания.'
    },
    punisher: {
      id: 'punisher',
      title: 'Каратель',
      subtitle: 'Наказание',
      role: 'Весы Мироздания',
      color: '#ff6b35',
      art: 'assets/pantheon/punisher.png',
      history:
        'Каратель — Весы Мироздания.\n\n' +
        'Последняя из Хранителей.\n\n' +
        'До начала войны существовал орден Хранителей весов мироздания. Они не были судьями или палачами. Они были воплощением границ вселенной — законом сохранения энергии в сфере морали и поступков. Их древнейший артефакт, Руна Кары, гарантировал: ни одно зло не останется без противовеса, ни одно благо — без последствия.\n\n' +
        'В Войне орден был уничтожен. Выжила лишь она — Элиара, Каратель. В её жилах течёт чистая, непреклонная кровь баланса.\n\n' +
        'Она не испытывает ни ярости, ни жажды мести. Каратель стоит плечом к плечу с Алекс не как её палач, а как её единственный щит перед лицом самой Вселенной. Когда Инквизитор вынуждена совершать страшные деяния ради сохранения Печати, откат мог бы раздавить её душу. Но Каратель забирает эту тяжесть на себя. Она — громоотвод мироздания, перераспределяющий тяжесть решений Алекс так, чтобы грани миров не стёрлись. Там, где Алекс — это Меч Упорядоченного, Каратель — его нерушимые Весы. Они связаны узами, которые крепче сестринских; они — два столпа, подпирающие вселенную.'
    },
    lady: {
      id: 'lady',
      title: 'Призрачная Леди',
      subtitle: 'Хранительница междумирья',
      role: 'Связующая Нить',
      color: '#b84dff',
      art: 'assets/pantheon/lady.png',
      history:
        'Призрачная Леди — Владычица Междумирья.\n\n' +
        'Связующая Нить.\n\n' +
        'Когда Живая Печать захлопнулась, чудовищный выброс энергии должен был разорвать тонкую грань вселенной. В тот миг загадочная странница оказалась в самом эпицентре ритуала. Слишком живая, чтобы стать духом, слишком призрачная, чтобы остаться смертной, она превратилась в Живой Мост.\n\n' +
        'Теперь Призрачная Леди правит Туманными Пределами. Она ходит меж мирами, сплетая иллюзии, пряча целые планеты от взора прислужников Пустоты и переправляя заблудшие души. Она — наставница для тех немногих, кто отваживается ступить на путь служения Кровавой Луне.\n\n' +
        'В её памяти хранятся тайны, которые Император стёр из своего разума, и ответы, которые Всевидящее Око не может произнести вслух.'
    },
    cheshire: {
      id: 'cheshire',
      title: 'Чеширский Кот',
      subtitle: 'Хранитель Троп',
      role: 'Улыбка Бездны',
      color: '#9b59b6',
      art: 'assets/pantheon/cheshire.png',
      history:
        'Хранитель Троп — Улыбка Бездны.\n\n' +
        'Древний дух, сущность которого старше самих богов. Легенды зовут его Чеширским Котом, Смеющимся Зверем. Он родился из первозданного хаоса, когда Луна ещё сияла невинным серебром.\n\n' +
        'После падения Печати большинство его собратьев превратились в прах или растворились в эфире. Но хранитель остался. В облике исполинского призрачного кота с глазами-галактиками он добровольно присягнул на верность последним Двуродным. Он собрал Сумеречных Охотников и теперь держит на своих плечах незримые Тропы — гиперпространственные туннели, связывающие миры Упорядоченного.\n\n' +
        'Пока Кот скалит зубы в своей загадочной, жутковатой улыбке — Тропы открыты, и защитники миров могут приходить друг другу на помощь. Если эта улыбка когда-нибудь померкнет, миры окажутся отрезаны друг от друга, а Кровавая Луна останется во тьме одна.\n\n' +
        'Почему сущность абсолютного хаоса выбрала служить порядку? Этого не знает даже Император. А Кот лишь щурится и улыбается шире, растворяясь в тумане.'
    }
  };

  /* original world lore (Blood Moon only — no foreign IPs) */
  var WORLD_LORE = [
    'Кровавая Луна — не светило. Это тюрьма. В её ядре спит Неназываемый. Пока Печать жива — миры дышат.',
    'Шесть Столпов — не боги. Они — цена, которую заплатило мироздание, чтобы не исчезнуть.',
    'Тропы Чеширского Кота связывают осколки Упорядоченного. Без улыбки Кота — вселенная рассыпается на острова тьмы.',
    'Каждая карта, внесённая в склад клуба, — капля крови в Печать. Массы внизу. Единицы наверху.',
    'Сумеречные Охотники ходят по Тропам. Их клинки помнят войну, которую уже почти никто не называет по имени.'
  ];

  var SITE_TIPS = [
    'Правило сайта: вклады на склад — через интерфейс клуба. Скриншот = доказательство.',
    'Башня Разлома: 4 пробуждённые карты · сложность · время · маршрут Рубеж.',
    'Штаб карточных боёв: собирай отряд, смотри силу и шанс успеха.',
    'Торговая площадка: лоты, заявки, PRO-лимиты. Не забывай проверять ранги.',
    'Магазин обложек: https://mangabuff.ru/products/cover',
    'День рождения: укажи дату при регистрации — клуб поздравит в стиле Кровавой Луны.',
    'Нужны карты для вкладов? Напиши @IMPERATOR_3 или @Alex_Darrk',
    'Хочу знать: https://t.me/mangabuff — официальный канал.',
    'Альянсы: до 3 клубов. Вклад в альянс качает общее Знамя.',
    'Колоды, аукцион, квиз, подборки — всё на mangabuff.ru'
  ];

  function getPantheonById(id) {
    return PANTHEON_DATA[id] || PANTHEON_DATA.inquisitor;
  }

  function openPantheonDetail(id) {
    var data = getPantheonById(id);
    pantheonIndex = Math.max(0, PANTHEON_ORDER.indexOf(id));
    var modal = document.getElementById('pantheon-detail');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pantheon-detail';
      modal.className = 'pantheon-detail-modal';
      document.body.appendChild(modal);
    }
    var quote = CONFIG.QUOTES[Math.floor(Math.random() * CONFIG.QUOTES.length)];
    var histHtml = escapeHtml(data.history).replace(/\n/g, '<br>');
    modal.innerHTML =
      '<div class="pd-backdrop" data-close-pd></div>' +
      '<div class="pd-sheet" style="--pd-accent:' + data.color + '">' +
      '<button type="button" class="pd-close" data-close-pd aria-label="Закрыть">✕</button>' +
      '<div class="pd-grid">' +
      '<div class="pd-art-wrap">' +
      '<img class="pd-art" src="' + data.art + '" alt="' + escapeHtml(data.title) + '" data-pd-art="1"/>' +
      '<div class="pd-art-fallback" style="display:none;border-color:' + data.color + '">' +
      escapeHtml(data.title.charAt(0)) + '</div>' +
      '<div class="pd-role">' + escapeHtml(data.role) + '</div>' +
      '</div>' +
      '<div class="pd-text">' +
      '<h2 class="pd-title">' + escapeHtml(data.title) + '</h2>' +
      '<p class="pd-sub">' + escapeHtml(data.subtitle) + '</p>' +
      '<div class="pd-history">' + histHtml + '</div>' +
      '<blockquote class="pd-quote">«' + escapeHtml(quote.t) + '»' +
      '<cite>— ' + escapeHtml(quote.a) + '</cite></blockquote>' +
      '</div></div>' +
      '<div class="pd-nav">' +
      '<button type="button" class="pd-prev" id="pd-prev">‹</button>' +
      '<span class="pd-dots" id="pd-dots"></span>' +
      '<button type="button" class="pd-next" id="pd-next">›</button>' +
      '</div></div>';

    modal.classList.add('open');
    document.body.classList.add('modal-open');
    modal.querySelectorAll('img.pd-art').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
        var f = img.nextElementSibling;
        if (f) f.style.display = 'flex';
      });
    });
    updatePdDots();
    haptic('medium');

    modal.querySelectorAll('[data-close-pd]').forEach(function (el) {
      el.addEventListener('click', closePantheonDetail);
    });
    var prev = document.getElementById('pd-prev');
    var next = document.getElementById('pd-next');
    if (prev) prev.onclick = function () { shiftPantheon(-1); };
    if (next) next.onclick = function () { shiftPantheon(1); };

    var sheet = modal.querySelector('.pd-sheet');
    if (sheet) {
      sheet.ontouchstart = function (e) {
        if (!e.touches[0]) return;
        pantheonTouchX = e.touches[0].clientX;
      };
      sheet.ontouchend = function (e) {
        if (!e.changedTouches[0]) return;
        var dx = e.changedTouches[0].clientX - pantheonTouchX;
        if (Math.abs(dx) > 60) shiftPantheon(dx < 0 ? 1 : -1);
      };
    }
  }

  function updatePdDots() {
    var dots = document.getElementById('pd-dots');
    if (!dots) return;
    dots.innerHTML = PANTHEON_ORDER.map(function (_, i) {
      return '<i class="' + (i === pantheonIndex ? 'on' : '') + '"></i>';
    }).join('');
  }

  function shiftPantheon(dir) {
    pantheonIndex = (pantheonIndex + dir + PANTHEON_ORDER.length) % PANTHEON_ORDER.length;
    openPantheonDetail(PANTHEON_ORDER[pantheonIndex]);
  }
  /* ===== app.js v2.1 — PART 2/4  (склей после части 1) ===== */
  function closePantheonDetail() {
    var modal = document.getElementById('pantheon-detail');
    if (modal) {
      modal.classList.remove('open');
      setTimeout(function () { if (modal && !modal.classList.contains('open')) modal.innerHTML = ''; }, 280);
    }
    document.body.classList.remove('modal-open');
    haptic('light');
  }

  function bindPantheonSteles() {
    document.querySelectorAll('[data-pantheon], .stele, .pantheon-card, .char-node').forEach(function (el) {
      if (el._pdBound) return;
      el._pdBound = true;
      el.addEventListener('click', function (e) {
        var id = el.getAttribute('data-pantheon') || el.getAttribute('data-char') || el.getAttribute('data-id');
        if (!id) {
          // try match by text
          var t = (el.textContent || '').toLowerCase();
          if (t.indexOf('инквиз') >= 0) id = 'inquisitor';
          else if (t.indexOf('императ') >= 0) id = 'emperor';
          else if (t.indexOf('око') >= 0 || t.indexOf('всевидящ') >= 0) id = 'eye';
          else if (t.indexOf('карател') >= 0) id = 'punisher';
          else if (t.indexOf('призрак') >= 0 || t.indexOf('леди') >= 0 || t.indexOf('галя') >= 0) id = 'lady';
          else if (t.indexOf('чешир') >= 0 || t.indexOf('кот') >= 0 || t.indexOf('троп') >= 0) id = 'cheshire';
        }
        if (id && PANTHEON_DATA[id]) {
          e.preventDefault();
          e.stopPropagation();
          openPantheonDetail(id);
        }
      });
    });
  }

  function rotateSiteTip() {
    var bar = document.getElementById('site-tip-bar');
    if (!bar) return;
    var tip = SITE_TIPS[Math.floor(Math.random() * SITE_TIPS.length)];
    bar.textContent = tip;
  }

  function rotateWorldLore() {
    var el = document.getElementById('world-lore-line');
    if (!el) return;
    el.textContent = WORLD_LORE[Math.floor(Math.random() * WORLD_LORE.length)];
  }

  function applyRankTheme() {
    var rank = getUserRank(getTotalCards());
    var root = document.documentElement;
    var c = rank.aura || '#ff1f45';
    if (rank.special === 'glass') c = '#e8e8ff';
    if (rank.special === 'glitch') c = '#00e5ff';
    root.style.setProperty('--rank-accent', c);
    root.style.setProperty('--neon', c);
    document.body.setAttribute('data-rank-level', String(rank.level));
  }

  function renderLibraryExtras() {
    var box = document.getElementById('library-extras');
    if (!box) return;
    box.innerHTML =
      '<a class="row lib-link" href="https://mangabuff.ru/tower" data-ext>' +
      '<span>🗼</span><div><b>Башня Разлома</b><small>Экспедиции · Штаб · Кристаллы тьмы</small></div><i>›</i></a>' +
      '<a class="row lib-link" href="https://mangabuff.ru/battle" data-ext>' +
      '<span>⚔️</span><div><b>Штаб карточных боёв</b><small>PvP · лиги · отряды</small></div><i>›</i></a>' +
      '<a class="row lib-link" href="https://mangabuff.ru/products/cover" data-ext>' +
      '<span>🛒</span><div><b>Магазин</b><small>Обложки и товары mangabuff</small></div><i>›</i></a>' +
      '<a class="row lib-link" href="https://t.me/mangabuff" data-ext>' +
      '<span>📢</span><div><b>Хочу знать</b><small>Официальный канал MangaBuff</small></div><i>›</i></a>' +
      '<button class="row" type="button" id="btn-birthdays"><span>🎂</span><div><b>Дни рождения</b><small>Кто сегодня в ночи</small></div><i>›</i></button>' +
      '<div class="tip-card tower-help">' +
      '<div class="tip-h">Как Башня Разлома</div>' +
      '<p class="muted" style="font-size:12px;line-height:1.45;margin:0">' +
      '1) 4 пробуждённые карты · 2) сложность (Обычная / Опасная / Кошмар) · 3) время 2–12 ч · ' +
      '4) маршрут Рубеж (прогресс) или Тренировка (с 10 этажа). Штаб: Натиск, Оплот, Знание, Наставление, Снабжение. ' +
      'Босс каждые 10 этажей. Подробнее — на сайте.</p></div>';
  }

  function renderDonateBlock() {
    var box = document.getElementById('donate-ask');
    if (!box) return;
    box.innerHTML =
      '<button class="btn-primary full" type="button" id="btn-donate-main">🩸 Внести вклад</button>' +
      '<p class="muted center" style="margin:10px 0 6px">Попросить карты для вкладов</p>' +
      '<div class="row-links">' +
      '<a class="btn-secondary" href="https://t.me/IMPERATOR_3" data-ext>@IMPERATOR_3</a>' +
      '<a class="btn-secondary" href="https://t.me/Alex_Darrk" data-ext>@Alex_Darrk</a>' +
      '</div>';
  }

  var calcMode = 'merge';

  function formatNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function calcMerge(amount, rankIdx) {
    var names = CONFIG.RANK_NAMES;
    if (rankIdx >= names.length - 1) {
      return amount + ' ' + names[rankIdx] + ' — выше некуда (X максимум)';
    }
    var up = Math.floor(amount / CONFIG.MERGE_RATIO);
    var rem = amount % CONFIG.MERGE_RATIO;
    var lines = [];
    if (up > 0) lines.push(formatNum(up) + ' ' + names[rankIdx + 1]);
    if (rem > 0) lines.push(formatNum(rem) + ' ' + names[rankIdx]);
    if (!lines.length) return '0';
    return formatNum(amount) + ' ' + names[rankIdx] + ' → ' + lines.join(' + ') + ' (правка)';
  }

  function calcSplit(amount, rankIdx) {
    var names = CONFIG.RANK_NAMES;
    if (rankIdx <= 0) return formatNum(amount) + ' E — ниже некуда';
    var out = amount * CONFIG.SPLIT_RATIO;
    return formatNum(amount) + ' ' + names[rankIdx] + ' → ' + formatNum(out) + ' ' + names[rankIdx - 1] + ' (раскол)';
  }

  function calcSplitToE(amount, rankIdx) {
    var names = CONFIG.RANK_NAMES;
    var n = amount;
    for (var i = rankIdx; i > 0; i--) n = n * CONFIG.SPLIT_RATIO;
    return formatNum(amount) + ' ' + names[rankIdx] + ' ≈ ' + formatNum(n) + ' E (полный раскол)';
  }

  function calcMarket(amount, rankIdx) {
    var names = CONFIG.RANK_NAMES;
    var name = names[rankIdx];
    var table = CONFIG.MARKET_NN[name];
    if (!table) return name + ': для рынка НН смотри X / S / A (или правку/раскол)';
    var parts = [];
    Object.keys(table).forEach(function (k) {
      var r = table[k];
      parts.push(formatNum(r[0] * amount) + '–' + formatNum(r[1] * amount) + ' ' + k);
    });
    return formatNum(amount) + ' ' + name + ' (НН) ≈ ' + parts.slice(0, 4).join(' · ') + (parts.length > 4 ? '…' : '');
  }

  function runRankCalc() {
    var amountEl = document.getElementById('rank-amount');
    var fromEl = document.getElementById('rank-from');
    var outEl = document.getElementById('rank-out');
    if (!amountEl || !fromEl || !outEl) return;
    var amount = Math.max(1, parseInt(amountEl.value, 10) || 1);
    if (amount > 99999999) amount = 99999999;
    amountEl.value = amount;
    var rankIdx = parseInt(fromEl.value, 10) || 0;
    var text;
    if (calcMode === 'split') {
      text = calcSplit(amount, rankIdx);
      if (rankIdx > 1) text += '\n' + calcSplitToE(amount, rankIdx);
    } else if (calcMode === 'market') {
      text = calcMarket(amount, rankIdx);
    } else {
      text = calcMerge(amount, rankIdx);
    }
    outEl.textContent = text;
  }

  function bindCalcModes() {
    var box = document.getElementById('calc-modes');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.calc-mode');
      if (!btn) return;
      calcMode = btn.getAttribute('data-mode') || 'merge';
      box.querySelectorAll('.calc-mode').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      runRankCalc();
      haptic('light');
    });
    var calcBtn = document.getElementById('btn-rank-calc');
    if (calcBtn) calcBtn.addEventListener('click', function () { runRankCalc(); haptic('light'); });
    var amount = document.getElementById('rank-amount');
    var from = document.getElementById('rank-from');
    if (amount) amount.addEventListener('input', runRankCalc);
    if (from) from.addEventListener('change', runRankCalc);
    runRankCalc();
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
    return { visits: 0, streak: 0, lastDay: '', tipIdx: 0, totalCards: CONFIG.DEMO_TOTAL_CARDS, skills: {} };
  }
  function saveState(s) {
    try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  
  function welcomeOnce(s) {
    if (!s || s.welcomed) return;
    s.welcomed = true;
    saveState(s);
    setTimeout(function () {
      toast('Добро пожаловать в ночь · ' + CONFIG.CLUB_NAME, 3200);
      showQuote();
    }, 1100);
  }

  function bumpRetention() {
    var s = loadState();
    var today = todayKey();
    s.visits = (s.visits || 0) + 1;
    if (typeof s.totalCards !== 'number') s.totalCards = CONFIG.DEMO_TOTAL_CARDS;
    if (!s.skills) s.skills = {};
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function showQuote() {
    var el = document.getElementById('quote-pop');
    if (!el || !CONFIG.QUOTES || !CONFIG.QUOTES.length) return;
    var q = CONFIG.QUOTES[Math.floor(Math.random() * CONFIG.QUOTES.length)];
    el.innerHTML = '«' + escapeHtml(q.t) + '»' +
      '<span class="q-src">— ' + escapeHtml(q.a || q.s || '') + '</span>';
    el.classList.add('show');
    clearTimeout(showQuote._t);
    showQuote._t = setTimeout(function () { el.classList.remove('show'); }, 7000);
  }
  function startQuotes() {
    setTimeout(showQuote, 8000);
    setInterval(showQuote, CONFIG.QUOTE_INTERVAL_MS || 45000);
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
  /* ===== app.js v2.1 — PART 3/4  (склей после части 2) ===== */
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
    if (id === 'quest' || id === 'pyramid' || id === 'reel' || id === 'profile' || id === 'snake' || id === 'skills') tabId = 'hall';

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

    applyRankTheme();
    bindPantheonSteles();

    if (id === 'characters' || id === 'hall' || id === 'pantheon') {
      var detail = document.getElementById('char-detail');
      if (detail) detail.classList.add('hidden');
      if (window.BloodCourt && window.BloodCourt.onShow) window.BloodCourt.onShow();
      bindPantheonSteles();
    }
    if (id === 'quest') renderQuest();
    if (id === 'obana') renderObana('week');
    if (id === 'site') runRankCalc();
    if (id === 'pyramid') renderPyramid();
    if (id === 'reel') ensureReelBuilt();
    if (id === 'skills') renderSkillTree();
    if (id === 'archives') {
      renderLibraryExtras();
      renderDonateBlock();
    }

    /* snake fullscreen isolation — hide nav/tips while playing */
    if (id === 'snake') {
      document.body.classList.add('snake-playing');
      if (window.BloodSnake && window.BloodSnake.onShow) window.BloodSnake.onShow();
    } else {
      document.body.classList.remove('snake-playing');
      if (window.BloodSnake && window.BloodSnake.onHide) window.BloodSnake.onHide();
    }
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
          if (id === 'reel') {
            var btn = document.getElementById('btn-spin');
            if (btn) btn.click();
          } else toast('Вклады — через бота / админку. Скоро API.');
        });
      } else {
        tg.MainButton.hide();
      }
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

  var obanaPeriod = 'week';
  function renderObana(period) {
    if (period) obanaPeriod = period;
    var box = document.getElementById('obana-result');
    var panel = document.getElementById('obana-panel');
    if (!box) return;
    document.querySelectorAll('.top-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-period') === obanaPeriod);
    });
    if (panel) {
      panel.classList.add('papyrus-roll');
      setTimeout(function () { panel.classList.remove('papyrus-roll'); panel.classList.add('papyrus-open'); }, 180);
      setTimeout(function () { panel.classList.remove('papyrus-open'); }, 700);
    }
    var names = { week: 'неделю', month: 'месяц', all: 'всё время' };
    var list = (CONFIG.DEMO_TOP && CONFIG.DEMO_TOP[obanaPeriod]) || [];
    var html = '<div class="char-name">😱 Топ за ' + (names[obanaPeriod] || obanaPeriod) + '</div>';
    if (!list.length) {
      html += '<p class="muted" style="margin-top:8px">Пока пусто — стань <b style="color:var(--neon)">первой кровью</b>.</p>' +
        '<div class="lb">' +
        '<div class="lb-row top1"><div class="pos">1</div><div><div class="who">Место свободно</div><div class="meta">вклад · моды</div></div><div class="val">—</div></div>' +
        '<div class="lb-row"><div class="pos">2</div><div><div class="who">—</div><div class="meta">ждёт</div></div><div class="val">—</div></div>' +
        '<div class="lb-row"><div class="pos">3</div><div><div class="who">—</div><div class="meta">ждёт</div></div><div class="val">—</div></div></div>';
    } else {
      html += '<div class="lb">' + list.map(function (row, i) {
        return '<div class="lb-row' + (i === 0 ? ' top1' : '') + '"><div class="pos">' + (i + 1) +
          '</div><div><div class="who">' + escapeHtml(row.name) + '</div><div class="meta">' + escapeHtml(row.meta || '') +
          '</div></div><div class="val">' + escapeHtml(String(row.val)) + '</div></div>';
      }).join('') + '</div>';
    }
    box.innerHTML = html;
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
  /* ===== app.js v2.1 — PART 4/4  (склей после части 3) ===== */
  var SKILL_BRANCHES = [
    { id: 'blood', name: '🩸 Кровь', nodes: ['Капля', 'Сгусток', 'Жила', 'Артерия', 'Сердце тьмы', 'Кровь Императора', 'Вечная жажда', 'Кровавый щит', 'Ритуал печати', 'Клятвенный долг'] },
    { id: 'shadow', name: '🌑 Тень', nodes: ['Шёпот', 'Плащ', 'Шаг в тени', 'Невидимость', 'Теневой удар', 'Поглощение', 'Теневой трон', 'Абсолютная тьма'] },
    { id: 'hunt', name: '⚔️ Охота', nodes: ['След', 'Клык', 'Засада', 'Погоня', 'Казнь', 'Охотник богов', 'Кровавая жатва'] },
    { id: 'seal', name: '🔮 Печать', nodes: ['Руна', 'Печать крови', 'Кодекс', 'Запрет', 'Печать Императора', 'Вечный закон'] },
    { id: 'relic', name: '🏺 Реликвии', nodes: ['Осколок', 'Клинок суда', 'Чаша', 'Корона', 'Сердце луны', 'Артефакт Бездны'] },
    { id: 'qi', name: '✨ Ци / Культ', nodes: ['Закалка', 'Конденсация', 'Основание', 'Золотое ядро', 'Душа', 'Вознесение', 'Дао-лорд'] },
    { id: 'demon', name: '😈 Демоны', nodes: ['Гниль', 'Зверь', 'Высший демон', 'Архидемон', 'Бедствие', 'Бог тьмы'] },
    { id: 'title', name: '👑 Титулы', nodes: ['Смертный', 'Упырь', 'Вампир', 'Офицер', 'Генерал', 'Прародитель', 'Король', 'Император'] }
  ];

  function expandSkillNodes() {
    var out = [];
    SKILL_BRANCHES.forEach(function (br) {
      br.nodes.forEach(function (n, i) {
        for (var lv = 1; lv <= 5; lv++) {
          out.push({
            id: br.id + '_' + i + '_l' + lv,
            branch: br.id,
            name: n + (lv > 1 ? ' · ' + lv : ''),
            cost: 10 + i * 15 + lv * 20,
            reqCards: (i + 1) * 50 * lv,
            desc: br.name + ' — ур. ' + lv
          });
        }
      });
    });
    return out;
  }
  var ALL_SKILLS = expandSkillNodes();

  function renderSkillTree() {
    var root = document.getElementById('skill-tree-root');
    if (!root) return;
    var state = loadState();
    var unlocked = state.skills || {};
    var total = getTotalCards();
    var html = '<p class="muted">Узлов: <b>' + ALL_SKILLS.length + '</b> · открытие от вкладов карт</p>';
    SKILL_BRANCHES.forEach(function (br) {
      html += '<div class="skill-branch"><div class="skill-br-title">' + br.name + '</div><div class="skill-nodes">';
      ALL_SKILLS.filter(function (s) { return s.branch === br.id; }).slice(0, 20).forEach(function (s) {
        var on = unlocked[s.id] || total >= s.reqCards;
        html += '<button type="button" class="skill-node' + (on ? ' on' : '') + '" data-skill="' + s.id + '" title="' + escapeHtml(s.desc) + ' · нужно ' + s.reqCards + ' карт">' +
          escapeHtml(s.name) + '<small>' + s.cost + ' крови</small></button>';
      });
      html += '</div></div>';
    });
    root.innerHTML = html;
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
    if (tip) tip.textContent = CONFIG.TIPS[(s.tipIdx || 0) % CONFIG.TIPS.length];
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
        chronicles: 1, characters: 1, rules: 1, pyramid: 1, reel: 1,
        profile: 1, snake: 1, skills: 1
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
    bindCalcModes();
    startQuotes();

    /* PNG icons: if loaded — hide emoji via .has-img */
    document.querySelectorAll('.tab-ico .tab-img').forEach(function (img) {
      function mark() {
        if (img.naturalWidth > 0) img.parentElement.classList.add('has-img');
      }
      if (img.complete) mark();
      else img.addEventListener('load', mark);
      img.addEventListener('error', function () {
        img.style.display = 'none';
        img.parentElement.classList.remove('has-img');
      });
    });

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

    document.addEventListener('click', function (e) {
      var node = e.target.closest && e.target.closest('.court-node[data-char]');
      if (!node) return;
      var key = node.getAttribute('data-char');
      // full lore card (v2.1)
      if (PANTHEON_DATA[key] || key === 'galya') {
        var map = { galya: 'lady' };
        openPantheonDetail(map[key] || key);
        return;
      }
      var detail = document.getElementById('char-detail');
      if (!detail) return;
      detail.classList.remove('hidden');
      detail.innerHTML = (CHAR_TEXTS[key] || '<p class="muted">Нет описания</p>') +
        '<button class="btn-secondary" id="char-back" type="button" style="margin-top:12px">← Закрыть</button>';
      var backChar = document.getElementById('char-back');
      if (backChar) backChar.onclick = function () {
        detail.classList.add('hidden');
        haptic('light');
      };
      if (window.BloodCourt && window.BloodCourt.setFocus) window.BloodCourt.setFocus(key);
      haptic('medium');
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

    document.querySelectorAll('.top-btn, .period-chip').forEach(function (btn) {
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
      sim.value = String(getTotalCards());
      sim.addEventListener('input', function () {
        var s = loadState();
        s.totalCards = parseInt(sim.value, 10) || 0;
        saveState(s);
        applyRetentionUI(s);
        renderUserProfileCard('profile-root');
        renderRankLadder();
        renderPyramid();
        applyRankTheme();
      });
    }

    var help = document.getElementById('btn-help');
    if (help) help.addEventListener('click', function () {
      var msg = CONFIG.CLUB_NAME + '\nПирамида Нечисти · Обана · Лента · Змейка · Дерево навыков\nНавигация — только снизу.';
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

    // v2.1 pantheon + library + donate + rank theme
    bindPantheonSteles();
    renderLibraryExtras();
    renderDonateBlock();
    applyRankTheme();
    rotateSiteTip();
    rotateWorldLore();
    setInterval(rotateSiteTip, 28000);
    setInterval(rotateWorldLore, 52000);

    var bday = document.getElementById('btn-birthdays');
    if (bday) bday.addEventListener('click', function () {
      toast('Дни рождения: укажи дату при регистрации в боте. Сегодня — список в Обане.');
      haptic('light');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePantheonDetail();
    });

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
    runRankCalc: runRankCalc,
    showQuote: showQuote,
    CONFIG: CONFIG,
    NECRO_RANKS: NECRO_RANKS,
    ALL_SKILLS: ALL_SKILLS,
    showScreen: showScreen,
    openPantheonDetail: openPantheonDetail,
    PANTHEON_DATA: PANTHEON_DATA,
    applyRankTheme: applyRankTheme,
    closePantheonDetail: closePantheonDetail
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
