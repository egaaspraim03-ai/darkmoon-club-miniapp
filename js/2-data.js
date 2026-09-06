/* ============================================================
   js/2-data.js — The Blood Moon v3.0
   Столпы · карты TCG · пассивы · лор · арт
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
    cheshire: 'https://i.ibb.co/9HMwqTmd/8817.jpg',
    back: 'https://i.ibb.co/MkZLDrzL/Airbrush-IMAGE-ENHANCER-1788666591134-1788666591135.jpg'
  };

  /* --- пассивы (TCG) --- */
  var PASSIVES = {
    taunt: {
      id: 'taunt',
      name: 'Провокация',
      icon: '🛡️',
      desc: 'Пока эта карта на поле, противник обязан атаковать её. Удар в лицо (LP) запрещён.'
    },
    battlecry: {
      id: 'battlecry',
      name: 'Боевой клич',
      icon: '📢',
      desc: 'При призыве: наносит 300 урона LP противника (или 500, если есть реликвия Глаз Куба).'
    },
    foresight: {
      id: 'foresight',
      name: 'Узор',
      icon: '👁️',
      desc: 'В начале твоего Main: +1 мана (макс. +2 за дуэль).'
    },
    scales: {
      id: 'scales',
      name: 'Весы',
      icon: '⚖️',
      desc: 'Первый летальный удар по этой карте в ход оставляет 1 HP (один раз).'
    },
    bridge: {
      id: 'bridge',
      name: 'Мост',
      icon: '🌫️',
      desc: 'При смерти: верни 1 ману. Раз в ход.'
    },
    smile: {
      id: 'smile',
      name: 'Улыбка',
      icon: '😺',
      desc: 'При призыве: случайный союзник +200 ATK до конца хода.'
    }
  };

  /* --- 6 Столпов (EN-ключи = data-id) --- */
  var PILLARS = {
    inquisitor: {
      id: 'inquisitor',
      name: 'Инквизитор',
      fullName: 'Алекс Тёмная — Инквизитор',
      title: 'Живая Печать',
      element: 'Печать',
      tier: '1/6',
      color: '#ff2d55',
      art: ART.inquisitor,
      atk: 1800,
      def: 1400,
      cost: 2,
      type: 'monster',
      passive: PASSIVES.taunt,
      short: 'Клинок Правосудия. Свет днём, тьма ночью. Любит мыло.',
      lore:
        'Алекс Тёмная — Инквизитор, Живая Печать. Последняя из Двойственных.\n\n' +
        'Чтобы Неназываемый Враг не вернулся, мирозданию требовался замок. В час отчаяния Алекс позволила Свету и Тьме внутри себя сцепиться насмерть, превратив душу в двигатель Великой Печати — барьера в ядре Кровавой Луны.\n\n' +
        'Если одна сторона победит — Печать поглотит её; если другая — Враг восстанет. Каждый миг — баланс на лезвии.\n\n' +
        'Днём — холодная справедливость. Ночью — Клинок без пощады. Оружие — осколок Луны. Под кратерами спит дракон Северин.'
    },
    emperor: {
      id: 'emperor',
      name: 'Император',
      fullName: 'Император Без Имени',
      title: 'Архитектор Творения',
      element: 'Кровь',
      tier: '2/6',
      color: '#c9a227',
      art: ART.emperor,
      atk: 2000,
      def: 1600,
      cost: 3,
      type: 'monster',
      passive: PASSIVES.battlecry,
      short: 'Безымянный. Формула Печати. Ищет мыло для Инквизитора.',
      lore:
        'Император Без Имени — Архитектор Творения. Последнее Эхо.\n\n' +
        'Второй выживший. Слил Свет и Тьму в Созидание: тьма рвёт материю из небытия, свет плетёт судьбы.\n\n' +
        'Он вывел формулу Живой Печати — сколько Алекс должна тратить на свет и тьму. Отсёк собственное Имя и скрыл лицо под маской.\n\n' +
        'Строит миры вокруг Кровавой Луны. Остановиться = признать жертву Алекс напрасной. Его партия — звёздные системы.'
    },
    eye: {
      id: 'eye',
      name: 'Всевидящее Око',
      fullName: 'Иссэра — Всевидящее Око',
      title: 'Нити Судьбы',
      element: 'Узор',
      tier: '3/6',
      color: '#a855f7',
      art: ART.eye,
      atk: 1200,
      def: 2000,
      cost: 2,
      type: 'monster',
      passive: PASSIVES.foresight,
      short: 'Видит Узор. Молчит: слово = закон.',
      lore:
        'Всевидящее Око — Нити Судьбы. Та, что пожертвовала настоящим ради будущего.\n\n' +
        'Когда-то смертная провидица Иссэра заглянула за Грань. Глаза сгорели; глазницы наполнил свет Истины.\n\n' +
        'Теперь она в Шпиле Откровений. Не видит «вчера/завтра» — только Великий Узор: миллиарды нитей.\n\n' +
        'Сдвигает микро-узлы, чтобы катастрофа была отсрочена. Молчит тысячелетиями: каждое слово отсекает миллионы будущих.'
    },
    punisher: {
      id: 'punisher',
      name: 'Каратель',
      fullName: 'Элиара — Каратель',
      title: 'Весы Мироздания',
      element: 'Весы',
      tier: '4/6',
      color: '#ff6b35',
      art: ART.punisher,
      atk: 1900,
      def: 1500,
      cost: 3,
      type: 'monster',
      passive: PASSIVES.scales,
      short: 'Громоотвод решений Инквизитора. Наказывает за мыло.',
      lore:
        'Каратель — Весы Мироздания. Последняя из Хранителей.\n\n' +
        'Орден Весов хранил закон: зло без противовеса, благо без цены — нельзя. В Войне орден пал. Выжила Элиара.\n\n' +
        'Стоит рядом с Алекс не как палач, а как щит: забирает «откат» страшных решений, чтобы грани миров не стёрлись.\n\n' +
        'Где Инквизитор — Меч, Каратель — нерушимые Весы.'
    },
    lady: {
      id: 'lady',
      name: 'Призрачная Леди',
      fullName: 'Призрачная Леди · Галя',
      title: 'Связующая Нить',
      element: 'Туман',
      tier: '5/6',
      color: '#b84dff',
      art: ART.lady,
      atk: 1400,
      def: 1800,
      cost: 2,
      type: 'monster',
      passive: PASSIVES.bridge,
      short: 'Живой Мост. Туманные Пределы. Помогает с «возрастом мыла».',
      lore:
        'Призрачная Леди — Владычица Междумирья. Связующая Нить.\n\n' +
        'В момент закрытия Печати странница стала Живым Мостом — слишком живая для духа, слишком призрачная для смертной.\n\n' +
        'Правит Туманными Пределами: прячет планеты, переправляет души, учит слуг Луны.\n\n' +
        'Помнит тайны, которые Император стёр, и ответы, которые Око не произнесёт.'
    },
    cheshire: {
      id: 'cheshire',
      name: 'Чеширский Кот',
      fullName: 'Хранитель Троп',
      title: 'Улыбка Бездны',
      element: 'Хаос',
      tier: '6/6',
      color: '#9b59b6',
      art: ART.cheshire,
      atk: 1600,
      def: 1600,
      cost: 2,
      type: 'monster',
      passive: PASSIVES.smile,
      short: 'Тропы между мирами. Улыбка = жизнь. Живёт, где кормит.',
      lore:
        'Хранитель Троп — Улыбка Бездны. Дух старше богов, рождён из хаоса, когда Луна ещё была серебряной.\n\n' +
        'После Печати собратья стали прахом. Он остался: призрачный кот с глазами-галактиками, присягнул Двуродным.\n\n' +
        'Держит Тропы — гипертуннели Упорядоченного. Пока улыбка жива — миры связаны. Померкнет — Луна одна.\n\n' +
        'Почему хаос служит порядку? Даже Император не знает. Кот щурится… и улыбается шире.'
    }
  };

  var PILLAR_ORDER = ['inquisitor', 'emperor', 'eye', 'punisher', 'lady', 'cheshire'];

  /* --- deck builder helpers --- */
  function pillarToCard(id) {
    var p = PILLARS[id];
    if (!p) return null;
    return {
      id: p.id,
      instanceId: null,
      name: p.name,
      art: p.art,
      atk: p.atk,
      def: p.def,
      cost: p.cost,
      type: p.type,
      element: p.element,
      passiveId: p.passive.id,
      passive: p.passive,
      hasTaunt: p.passive.id === 'taunt',
      hasBattlecry: p.passive.id === 'battlecry',
      short: p.short,
      lore: p.lore,
      color: p.color,
      resting: false,
      scalesUsed: false
    };
  }

  function makeInstance(id) {
    var c = pillarToCard(id);
    if (!c) return null;
    c.instanceId = id + '_' + Math.random().toString(36).slice(2, 9);
    return c;
  }

  function starterDeck() {
    /* 2 копии ключевых + по 1 остальным = 8 карт в «колоде», в руку 5 */
    var ids = [
      'inquisitor', 'inquisitor',
      'emperor',
      'eye', 'eye',
      'punisher',
      'lady',
      'cheshire'
    ];
    return ids.map(makeInstance).filter(Boolean);
  }

  function defaultHand() {
    return [
      makeInstance('inquisitor'),
      makeInstance('emperor'),
      makeInstance('eye'),
      makeInstance('lady'),
      makeInstance('cheshire')
    ];
  }

  global.BloodData = {
    ART: ART,
    PASSIVES: PASSIVES,
    PILLARS: PILLARS,
    PILLAR_ORDER: PILLAR_ORDER,
    pillarToCard: pillarToCard,
    makeInstance: makeInstance,
    starterDeck: starterDeck,
    defaultHand: defaultHand
  };
})(typeof window !== 'undefined' ? window : this);
