/* ============================================================
   js/2-data.js — Blood Moon Pantheon v3.0
   6 Столпов · TCG stats · passives · lore · art
   EN keys: inquisitor | emperor | eye | punisher | lady | cheshire
   PART 1/2
   ============================================================ */
(function (global) {
  'use strict';

  var ART = {
    inquisitor: 'https://i.ibb.co/9HWX7byK/8801.jpg',
    emperor: 'https://i.ibb.co/MkZLDrzL/Airbrush-IMAGE-ENHANCER-1788666591134-1788666591135.jpg',
    eye: 'https://i.ibb.co/kgJ4ZBwv/8805.jpg',
    punisher: 'https://i.ibb.co/c05nksh/8806.jpg',
    lady: 'https://i.ibb.co/5hR7RQkq/8814.jpg',
    cheshire: 'https://i.ibb.co/9HMwqTmd/8817.jpg'
  };

  var PASSIVE = {
    TAUNT: 'taunt',
    BATTLECRY: 'battlecry',
    SHIELD: 'shield',
    HEAL: 'heal',
    VISION: 'vision',
    CHAOS: 'chaos'
  };

  var PILLARS = {
    inquisitor: {
      id: 'inquisitor',
      name: 'Инквизитор',
      nameEn: 'Inquisitor',
      title: 'Живая Печать',
      element: 'Печать',
      elementEn: 'SEAL',
      tier: '1/6',
      color: '#ff1f45',
      art: ART.inquisitor,
      atk: 1800,
      def: 1400,
      cost: 3,
      type: 'monster',
      passiveId: PASSIVE.TAUNT,
      passiveName: 'Провокация',
      passiveText: 'Пока эта карта на поле — враг обязан атаковать её. Удар в лицо запрещён.',
      short: 'Клинок Правосудия. Свет и Тьма в одной душе — двигатель Великой Печати.',
      lore:
        'Алекс Тёмная — Инквизитор, Живая Печать. Последняя из Двойственных.\n\n' +
        'Чтобы Неназываемый Враг не вернулся, мирозданию требовался замок. В час абсолютного отчаяния Алекс позволила Свету и Тьме внутри себя сцепиться насмерть, превратив собственную душу в вечный двигатель парадокса. Эта сила питает Великую Печать — барьер, запечатавший предводителя Пустоты в ядре Кровавой Луны.\n\n' +
        'Если Свет или Тьма однажды победит — Печать поглотит Алекс. Если победит свет, предводитель переродится; если тьма — восстанет он. Каждый миг — баланс на лезвии.\n\n' +
        'Днём — холодный Инквизитор: справедливый и милосердный. Ночью — Клинок Правосудия без пощады. Оружие выковано из осколка Луны. Страж — дракон Северин подо льдом кратеров.'
    },

    emperor: {
      id: 'emperor',
      name: 'Император',
      nameEn: 'Emperor',
      title: 'Архитектор Творения',
      element: 'Кровь',
      elementEn: 'BLOOD',
      tier: '2/6',
      color: '#c9a227',
      art: ART.emperor,
      atk: 2200,
      def: 1600,
      cost: 4,
      type: 'monster',
      passiveId: PASSIVE.BATTLECRY,
      passiveName: 'Боевой клич',
      passiveText: 'При призыве: наносит 500 урона вражескому LP (или 300 самому слабому монстру).',
      short: 'Без Имени. Формула Печати. Ходы — звёздные системы.',
      lore:
        'Император Без Имени — Архитектор Творения. Последнее Эхо.\n\n' +
        'Второй выживший. Слил Свет и Тьму в инструмент Созидания: тьма рвёт материю из небытия, свет плетёт судьбы. Он вывел формулу Живой Печати — сколько Алекс должна тратить на свет и тьму, чтобы миры жили.\n\n' +
        'Осознав ужас творения, отсёк собственное Имя и скрыл лицо под маской. Теперь он Творец: строит миры, расы и законы вокруг Кровавой Луны. Остановиться — значит признать, что жертва Алекс была напрасной.'
    },

    eye: {
      id: 'eye',
      name: 'Всевидящее Око',
      nameEn: 'All-Seeing Eye',
      title: 'Нити Судьбы',
      element: 'Узор',
      elementEn: 'PATTERN',
      tier: '3/6',
      color: '#ff3d6e',
      art: ART.eye,
      atk: 1200,
      def: 2000,
      cost: 2,
      type: 'monster',
      passiveId: PASSIVE.VISION,
      passiveName: 'Око',
      passiveText: 'В начале своего хода: открывает 1 случайную карту руки врага (в логе). +200 DEF, пока на поле.',
      short: 'Не видит мир — видит Узор. Слово = Закон.',
      lore:
        'Всевидящее Око — Нити Судьбы. Та, что пожертвовала настоящим ради будущего.\n\n' +
        'Когда-то Иссэра — смертная провидица. Заглянула за Грань — глаза сгорели, глазницы наполнил свет Истины. Теперь — сущность в Шпиле Откровений на краю Вселенной.\n\n' +
        'Созерцает Великий Узор — миллиарды нитей судьбы. Мягко сдвигает узлы, чтобы Упорядоченное шло по ветви, где катастрофа отсрочена. Молчит тысячелетиями: каждое слово становится непреложным Законом. Слепота — щит от безумия всезнания.'
    },

    punisher: {
      id: 'punisher',
      name: 'Каратель',
      nameEn: 'Punisher',
      title: 'Весы Мироздания',
      element: 'Весы',
      elementEn: 'SCALES',
      tier: '4/6',
      color: '#ff6b35',
      art: ART.punisher,
      atk: 1900,
      def: 1700,
      cost: 3,
      type: 'monster',
      passiveId: PASSIVE.SHIELD,
      passiveName: 'Весы',
      passiveText: 'Не может быть уничтожена одним ударом (первый летальный удар оставляет 100 HP). 1 раз за дуэль.',
      short: 'Громоотвод мироздания. Несёт тяжесть решений Инквизитора.',
      lore:
        'Каратель — Весы Мироздания. Последняя из Хранителей.\n\n' +
        'Орден Хранителей Весов был законом сохранения морали: зло без противовеса, благо без цены — нельзя. В Войне орден уничтожен. Выжила Элиара.\n\n' +
        'Стоит плечом к плечу с Алекс не как палач, а как щит: забирает «откат» страшных решений Инквизитора, чтобы грани миров не стёрлись. Где Алекс — Меч, Каратель — нерушимые Весы.'
    },

    lady: {
      id: 'lady',
      name: 'Призрачная Леди',
      nameEn: 'Phantom Lady',
      title: 'Связующая Нить',
      element: 'Туман',
      elementEn: 'MIST',
      tier: '5/6',
      color: '#b84dff',
      art: ART.lady,
      atk: 1400,
      def: 1500,
      cost: 2,
      type: 'monster',
      passiveId: PASSIVE.HEAL,
      passiveName: 'Мост',
      passiveText: 'При призыве или в конце твоего хода: восстанавливает 400 LP (не выше 4000).',
      short: 'Живой Мост. Ходит меж мирами. Помнит стёртое.',
      lore:
        'Призрачная Леди — Владычица Междумирья. Связующая Нить.\n\n' +
        'В миг закрытия Живой Печати странница оказалась в эпицентре. Слишком живая для духа, слишком призрачная для смертной — стала Живым Мостом.\n\n' +
        'Правит Туманными Пределами: прячет планеты, переправляет души, плетёт иллюзии. Наставница слуг Кровавой Луны. Хранит тайны, которые Император стёр, и ответы, которые Око не произнесёт.'
    },

    cheshire: {
      id: 'cheshire',
      name: 'Чеширский Кот',
      nameEn: 'Cheshire Cat',
      title: 'Хранитель Троп',
      element: 'Хаос',
      elementEn: 'CHAOS',
      tier: '6/6',
      color: '#9b59b6',
      art: ART.cheshire,
      atk: 1600,
      def: 1300,
      cost: 3,
      type: 'monster',
      passiveId: PASSIVE.CHAOS,
      passiveName: 'Улыбка Бездны',
      passiveText: 'При призыве: случайно +300 ATK союзнику или −300 ATK врагу. Пока на поле — +1 к максимальной мане (до 10).',
      short: 'Улыбка держит Тропы. Хаос, выбравший порядок.',
      lore:
        'Хранитель Троп — Улыбка Бездны.\n\n' +
        'Древний дух старше богов. Легенды зовут его Чеширским Котом, Смеющимся Зверем. Родился из хаоса, когда Луна ещё была серебряной.\n\n' +
        'После Печати собратья стали прахом — он остался. Исполинский призрачный кот с глазами-галактиками. Добровольно присягнул Двуродным, собрал Сумеречных Охотников, держит Тропы — гипертуннели между мирами.\n\n' +
        'Пока улыбка жива — Тропы открыты. Померкнет — миры отрезаны, Кровавая Луна во тьме одна. Почему хаос служит порядку? Даже Император не знает.'
    }
  };
   var PILLAR_ORDER = ['inquisitor', 'emperor', 'eye', 'punisher', 'lady', 'cheshire'];

  var STARTER_HAND = ['inquisitor', 'eye', 'lady', 'cheshire'];

  var DUEL_DEFAULTS = {
    playerLp: 4000,
    enemyLp: 4000,
    manaStart: 3,
    manaMaxStart: 5,
    manaMaxCap: 10,
    zonesMonster: 3,
    zonesSpell: 3
  };

  var RELICS = {
    cube: { id: 'cube', name: 'Куб Ока', bonus: 'contrib', value: 0.1, text: '+10% к вкладам' },
    seal: { id: 'seal', name: 'Печать Жизни', bonus: 'lp', value: 0.05, text: '+5% LP в дуэли' },
    scales: { id: 'scales', name: 'Весы Кары', bonus: 'atk', value: 250, text: '+250 ATK/DEF' },
    ring: { id: 'ring', name: 'Кольцо Троп', bonus: 'summon', value: 1, text: '+1 к призыву' },
    scepter: { id: 'scepter', name: 'Скипетр Императора', bonus: 'xp', value: 0.15, text: '+15% XP' },
    'eye-cube': { id: 'eye-cube', name: 'Глаз Куба', bonus: 'legend', value: 0.1, text: '+10% легендарный' }
  };

  function getPillar(id) {
    if (!id) return null;
    if (PILLARS[id]) return PILLARS[id];
    if (id === 'galya') return PILLARS.lady;
    if (id === 'allSeeingEye') return PILLARS.eye;
    if (id === 'phantomLady') return PILLARS.lady;
    return null;
  }

  function listPillars() {
    return PILLAR_ORDER.map(function (id) {
      return PILLARS[id];
    });
  }

  function cloneCard(id) {
    var p = getPillar(id);
    if (!p) return null;
    return {
      instanceId: id + '_' + Math.random().toString(36).slice(2, 9),
      pillarId: p.id,
      name: p.name,
      art: p.art,
      atk: p.atk,
      def: p.def,
      hp: p.def,
      cost: p.cost,
      type: p.type,
      passiveId: p.passiveId,
      passiveName: p.passiveName,
      passiveText: p.passiveText,
      element: p.element,
      taunt: p.passiveId === PASSIVE.TAUNT,
      shieldUsed: false,
      isRest: false
    };
  }

  global.BloodData = {
    ART: ART,
    PASSIVE: PASSIVE,
    PILLARS: PILLARS,
    PILLAR_ORDER: PILLAR_ORDER,
    STARTER_HAND: STARTER_HAND,
    DUEL_DEFAULTS: DUEL_DEFAULTS,
    RELICS: RELICS,
    getPillar: getPillar,
    listPillars: listPillars,
    cloneCard: cloneCard
  };

  global.PANTHEON_DATA = PILLARS;
  global.PASSIVES = {
    inquisitor: PILLARS.inquisitor.passiveText,
    emperor: PILLARS.emperor.passiveText,
    allSeeingEye: PILLARS.eye.passiveText,
    punisher: PILLARS.punisher.passiveText,
    phantomLady: PILLARS.lady.passiveText,
    cheshire: PILLARS.cheshire.passiveText
  };
})(typeof window !== 'undefined' ? window : this);
