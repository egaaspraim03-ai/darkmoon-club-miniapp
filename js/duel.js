/* ============================================================
   js/duel.js — Blood Moon Pantheon TCG v3.0
   12 zones · LP 4000 · MAIN / BATTLE / END
   PART 1/2 — state · render · hand · summon
   Depends: js/2-data.js (BloodData)
   ============================================================ */
(function (global) {
  'use strict';

  var D = global.BloodData || null;

  function defaults() {
    return (D && D.DUEL_DEFAULTS) || {
      playerLp: 4000, enemyLp: 4000,
      manaStart: 3, manaMaxStart: 5, manaMaxCap: 10
    };
  }

  var state = {
    active: false,
    phase: 'MAIN',       // MAIN | BATTLE | END
    turn: 1,
    isPlayerTurn: true,
    playerLp: 4000,
    enemyLp: 4000,
    mana: 3,
    manaMax: 5,
    hand: [],
    /* monster[3], spell[3] — null or card instance */
    player: { monsters: [null, null, null], spells: [null, null, null] },
    enemy:  { monsters: [null, null, null], spells: [null, null, null] },
    selectedHand: null,  // instanceId
    selectedAttacker: null, // { side, idx }
    attackedThisTurn: {},   // instanceId -> true
    log: [],
    busy: false
  };

  function log(msg) {
    state.log.unshift(msg);
    if (state.log.length > 40) state.log.pop();
    var el = document.getElementById('duel-log');
    if (el) el.textContent = msg;
  }

  function toast(msg) {
    if (global.BloodMoon && typeof global.showToast === 'function') {
      try { global.showToast(msg); return; } catch (e) {}
    }
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function shake() {
    var board = document.getElementById('duel-board');
    var app = document.getElementById('app-container') || document.body;
    var target = board || app;
    target.classList.add('duel-shake');
    setTimeout(function () { target.classList.remove('duel-shake'); }, 400);
  }

  function playSfx(type) {
    try {
      if (global.BloodDuelAudio && global.BloodDuelAudio.play) {
        global.BloodDuelAudio.play(type);
        return;
      }
    } catch (e) {}
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!playSfx.ctx) playSfx.ctx = new Ctx();
      var ctx = playSfx.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if (type === 'summon') { o.frequency.value = 880; g.gain.value = 0.25; o.type = 'sine'; }
      else if (type === 'attack') { o.frequency.value = 160; g.gain.value = 0.35; o.type = 'sawtooth'; }
      else if (type === 'hurt') { o.frequency.value = 90; g.gain.value = 0.3; o.type = 'square'; }
      else { o.frequency.value = 440; g.gain.value = 0.15; o.type = 'triangle'; }
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.stop(ctx.currentTime + 0.26);
    } catch (e2) {}
  }

  /* ---------- helpers ---------- */
  function emptySide() {
    return { monsters: [null, null, null], spells: [null, null, null] };
  }

  function firstEmpty(arr) {
    for (var i = 0; i < arr.length; i++) if (!arr[i]) return i;
    return -1;
  }

  function allMonsters(sideObj) {
    return sideObj.monsters.filter(Boolean);
  }

  function hasTaunt(sideObj) {
    return allMonsters(sideObj).some(function (c) { return c.taunt || c.passiveId === 'taunt'; });
  }

  function tauntTargets(sideObj) {
    return sideObj.monsters
      .map(function (c, i) { return c && (c.taunt || c.passiveId === 'taunt') ? i : -1; })
      .filter(function (i) { return i >= 0; });
  }

  function cloneFromData(id) {
    if (D && typeof D.cloneCard === 'function') return D.cloneCard(id);
    var p = D && D.PILLARS && D.PILLARS[id];
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
      type: 'monster',
      passiveId: p.passiveId,
      passiveName: p.passiveName,
      passiveText: p.passiveText,
      taunt: p.passiveId === 'taunt',
      shieldUsed: false,
      isRest: false
    };
  }

  /* ---------- render ---------- */
  function cardHtml(card, compact) {
    if (!card) return '';
    var tauntCls = (card.taunt || card.passiveId === 'taunt') ? ' has-taunt' : '';
    var restCls = card.isRest ? ' resting' : '';
    if (compact) {
      return (
        '<div class="slot-card' + tauntCls + restCls + '" data-iid="' + card.instanceId + '">' +
        '<div class="sc-art" style="background-image:url(\'' + (card.art || '') + '\')"></div>' +
        '<div class="sc-name">' + esc(card.name) + '</div>' +
        '<div class="sc-stats"><span>⚔' + card.atk + '</span><span>♥' + (card.hp != null ? card.hp : card.def) + '</span></div>' +
        (card.taunt || card.passiveId === 'taunt' ? '<span class="sc-badge">🛡</span>' : '') +
        '</div>'
      );
    }
    return (
      '<div class="hand-card" data-iid="' + card.instanceId + '">' +
      '<span class="hc-cost">' + card.cost + '</span>' +
      '<div class="hc-art" style="background-image:url(\'' + (card.art || '') + '\')"></div>' +
      '<div class="hc-name">' + esc(card.name) + '</div>' +
      '</div>'
    );
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function fillZoneRow(rowId, cards, side) {
    var row = document.getElementById(rowId);
    if (!row) return;
    var slots = row.querySelectorAll('.card-slot');
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      var card = cards[i];
      slot.classList.toggle('filled', !!card);
      slot.classList.remove('selectable', 'targetable');
      slot.innerHTML = card ? cardHtml(card, true) : '';
      slot.dataset.side = side;
      slot.dataset.idx = String(i);
    }
  }

  function renderHand() {
    var hand = document.getElementById('duel-hand');
    if (!hand) return;
    hand.innerHTML = state.hand.map(function (c) {
      var sel = state.selectedHand === c.instanceId ? ' selected' : '';
      return cardHtml(c, false).replace('class="hand-card"', 'class="hand-card' + sel + '"');
    }).join('');

    hand.querySelectorAll('.hand-card').forEach(function (el) {
      el.addEventListener('click', function () {
        if (!state.isPlayerTurn || state.phase !== 'MAIN' || state.busy) return;
        var iid = el.getAttribute('data-iid');
        state.selectedHand = (state.selectedHand === iid) ? null : iid;
        state.selectedAttacker = null;
        renderAll();
      });
    });
  }

  function renderUi() {
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(v);
    };
    set('player-lp', state.playerLp);
    set('enemy-lp', state.enemyLp);
    set('player-mana', state.mana);
    set('player-mana-max', state.manaMax);
    set('duel-phase', state.phase);
    set('duel-turn', state.turn);

    document.querySelectorAll('.btn-duel').forEach(function (b) {
      b.classList.remove('active');
    });
    var map = { MAIN: 'btn-duel-main', BATTLE: 'btn-duel-battle', END: 'btn-duel-end' };
    var btn = document.getElementById(map[state.phase]);
    if (btn) btn.classList.add('active');
  }

  function highlightSlots() {
    /* summon targets */
    if (state.isPlayerTurn && state.phase === 'MAIN' && state.selectedHand) {
      var card = state.hand.find(function (c) { return c.instanceId === state.selectedHand; });
      if (card) {
        var row = document.getElementById(card.type === 'spell' ? 'player-spells' : 'player-monsters');
        if (row) {
          row.querySelectorAll('.card-slot').forEach(function (slot, i) {
            var arr = card.type === 'spell' ? state.player.spells : state.player.monsters;
            if (!arr[i]) slot.classList.add('selectable');
          });
        }
      }
    }
    /* attack targets */
    if (state.isPlayerTurn && state.phase === 'BATTLE' && state.selectedAttacker) {
      var must = hasTaunt(state.enemy);
      state.enemy.monsters.forEach(function (c, i) {
        if (!c) return;
        if (must && !(c.taunt || c.passiveId === 'taunt')) return;
        var row = document.getElementById('enemy-monsters');
        if (row && row.children[i]) row.children[i].classList.add('targetable');
      });
      /* face if no taunt */
      if (!must) {
        var top = document.querySelector('.duel-topbar');
        if (top) top.classList.add('face-target');
      }
    } else {
      var top2 = document.querySelector('.duel-topbar');
      if (top2) top2.classList.remove('face-target');
    }
  }

  function renderAll() {
    fillZoneRow('enemy-monsters', state.enemy.monsters, 'enemy');
    fillZoneRow('enemy-spells', state.enemy.spells, 'enemy');
    fillZoneRow('player-monsters', state.player.monsters, 'player');
    fillZoneRow('player-spells', state.player.spells, 'player');
    renderHand();
    renderUi();
    highlightSlots();
    bindZoneClicks();
  }

  function bindZoneClicks() {
    document.querySelectorAll('#duel-board .card-slot').forEach(function (slot) {
      slot.onclick = function () {
        onSlotClick(slot);
      };
    });
  }

  function onSlotClick(slot) {
    if (state.busy || !state.isPlayerTurn) return;
    var side = slot.getAttribute('data-side');
    var type = slot.getAttribute('data-type');
    var idx = parseInt(slot.getAttribute('data-idx'), 10) || 0;

    /* SUMMON */
    if (state.phase === 'MAIN' && state.selectedHand && side === 'player') {
      trySummon(type, idx);
      return;
    }

    /* select attacker */
    if (state.phase === 'BATTLE' && side === 'player' && type === 'monster') {
      var atkCard = state.player.monsters[idx];
      if (!atkCard || atkCard.isRest) return;
      if (state.attackedThisTurn[atkCard.instanceId]) {
        toast('Уже атаковала в этот ход');
        return;
      }
      state.selectedAttacker = { side: 'player', idx: idx };
      state.selectedHand = null;
      renderAll();
      log('Выбери цель для «' + atkCard.name + '»');
      return;
    }

    /* attack enemy monster */
    if (state.phase === 'BATTLE' && state.selectedAttacker && side === 'enemy' && type === 'monster') {
      tryAttackMonster(idx);
    }
  }

  function trySummon(type, idx) {
    var card = state.hand.find(function (c) { return c.instanceId === state.selectedHand; });
    if (!card) return;
    if (card.cost > state.mana) {
      toast('Недостаточно маны (крови)');
      return;
    }
    var arr = type === 'spell' ? state.player.spells : state.player.monsters;
    if (type === 'spell' && card.type !== 'spell') {
      /* all pillars are monsters for now — force monster row */
      type = 'monster';
      arr = state.player.monsters;
      idx = firstEmpty(arr);
      if (idx < 0) {
        toast('Нет свободной Monster Zone');
        return;
      }
    }
    if (arr[idx]) {
      toast('Зона занята');
      return;
    }
    if (type === 'monster' && firstEmpty(state.player.monsters) < 0 && arr[idx]) {
      toast('Нет места');
      return;
    }

    state.mana -= card.cost;
    state.hand = state.hand.filter(function (c) { return c.instanceId !== card.instanceId; });
    card.hp = card.def;
    card.isRest = false;
    arr[idx] = card;
    state.selectedHand = null;

    playSfx('summon');
    shake();
    log('Призыв: ' + card.name + ' (' + card.cost + '🩸)');
    toast('Призван: ' + card.name);

    /* battlecry / passives on summon */
    if (global.BloodPassives && global.BloodPassives.onSummon) {
      global.BloodPassives.onSummon(card, state, 'player');
    } else {
      applySummonPassive(card, 'player');
    }

    renderAll();
    checkWin();
  }

  function applySummonPassive(card, side) {
    if (!card) return;
    if (card.passiveId === 'battlecry') {
      var dmg = 500;
      state.enemyLp = Math.max(0, state.enemyLp - dmg);
      log(card.name + ' · Боевой клич! −' + dmg + ' LP');
      playSfx('hurt');
      shake();
    }
    if (card.passiveId === 'heal') {
      state.playerLp = Math.min(4000, state.playerLp + 400);
      log(card.name + ' · Мост: +400 LP');
    }
    if (card.passiveId === 'chaos') {
      state.manaMax = Math.min(10, state.manaMax + 1);
      log(card.name + ' · Улыбка: макс. мана ' + state.manaMax);
    }
  }

  /* ---------- start / enter ---------- */
  function startDuel(opts) {
    opts = opts || {};
    var def = defaults();
    state.active = true;
    state.phase = 'MAIN';
    state.turn = 1;
    state.isPlayerTurn = true;
    state.playerLp = def.playerLp;
    state.enemyLp = def.enemyLp;
    state.mana = def.manaStart;
    state.manaMax = def.manaMaxStart;
    state.player = emptySide();
    state.enemy = emptySide();
    state.selectedHand = null;
    state.selectedAttacker = null;
    state.attackedThisTurn = {};
    state.log = [];
    state.busy = false;

    var handIds = (opts.hand || (D && D.STARTER_HAND) || ['inquisitor', 'eye', 'lady', 'cheshire']);
    state.hand = handIds.map(cloneFromData).filter(Boolean);

    /* enemy pre-summon 1–2 weak threats */
    seedEnemy();

    document.body.classList.add('duel-mode');
    log('Дуэль начата. LP 4000 · MAIN Phase');
    toast('⚔️ Дуэль Пантеона');
    renderAll();
  }

  function seedEnemy() {
    var pool = ['punisher', 'emperor', 'cheshire', 'eye'];
    var n = 1 + Math.floor(Math.random() * 2);
    for (var i = 0; i < n; i++) {
      var id = pool[Math.floor(Math.random() * pool.length)];
      var c = cloneFromData(id);
      if (c) {
        c.hp = c.def;
        state.enemy.monsters[i] = c;
      }
    }
  }

  function endDuel() {
    state.active = false;
    document.body.classList.remove('duel-mode');
  }

  function onShow() {
    if (!state.active) startDuel();
    else renderAll();
  }

  function onHide() {
    /* keep state for rematch; only leave duel-mode chrome */
    document.body.classList.remove('duel-mode');
  }

  /* export partial — PART 2 adds attack / phases / AI */
  global.BloodDuel = {
    state: state,
    start: startDuel,
    end: endDuel,
    onShow: onShow,
    onHide: onHide,
    renderAll: renderAll,
    log: log,
    toast: toast,
    shake: shake,
    playSfx: playSfx,
    hasTaunt: hasTaunt,
    tauntTargets: tauntTargets,
    allMonsters: allMonsters,
    cloneFromData: cloneFromData,
    checkWin: checkWin,
    applySummonPassive: applySummonPassive,
    /* filled in PART 2 */
    tryAttackMonster: null,
    tryAttackFace: null,
    setPhase: null,
    endTurn: null
  };

  function checkWin() {
    if (state.enemyLp <= 0) {
      state.enemyLp = 0;
      log('🏆 ПОБЕДА! Враг пал.');
      toast('ПОБЕДА');
      state.busy = true;
      playSfx('summon');
      return true;
    }
    if (state.playerLp <= 0) {
      state.playerLp = 0;
      log('💀 ПОРАЖЕНИЕ…');
      toast('ПОРАЖЕНИЕ');
      state.busy = true;
      playSfx('hurt');
      return true;
    }
    return false;
  }

  /* face click on enemy LP bar */
  function bindFaceAttack() {
    var top = document.querySelector('.duel-topbar');
    if (!top || top._bmFace) return;
    top._bmFace = true;
    top.addEventListener('click', function () {
      if (!state.isPlayerTurn || state.phase !== 'BATTLE' || !state.selectedAttacker) return;
      if (hasTaunt(state.enemy)) {
        toast('Провокация! Бей Taunt-цель');
        return;
      }
      if (typeof global.BloodDuel.tryAttackFace === 'function') {
        global.BloodDuel.tryAttackFace();
      }
    });
  }

  function bindPhaseButtons() {
    var main = document.getElementById('btn-duel-main');
    var battle = document.getElementById('btn-duel-battle');
    var end = document.getElementById('btn-duel-end');
    if (main && !main._bm) {
      main._bm = true;
      main.addEventListener('click', function () {
        if (global.BloodDuel.setPhase) global.BloodDuel.setPhase('MAIN');
      });
    }
    if (battle && !battle._bm) {
      battle._bm = true;
      battle.addEventListener('click', function () {
        if (global.BloodDuel.setPhase) global.BloodDuel.setPhase('BATTLE');
      });
    }
    if (end && !end._bm) {
      end._bm = true;
      end.addEventListener('click', function () {
        if (global.BloodDuel.endTurn) global.BloodDuel.endTurn();
      });
    }
  }

  function boot() {
    bindPhaseButtons();
    bindFaceAttack();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
   /* ============================================================
   js/duel.js — PART 2/2
   attack · face · phases · enemy AI · BloodDuel API
   ============================================================ */

  function findCardByIid(iid) {
    var sides = [state.player, state.enemy];
    for (var s = 0; s < sides.length; s++) {
      var m = sides[s].monsters;
      for (var i = 0; i < m.length; i++) {
        if (m[i] && m[i].instanceId === iid) {
          return { card: m[i], side: s === 0 ? 'player' : 'enemy', idx: i, zone: 'monsters' };
        }
      }
    }
    return null;
  }

  function destroyMonster(side, idx) {
    var arr = side === 'player' ? state.player.monsters : state.enemy.monsters;
    var dead = arr[idx];
    arr[idx] = null;
    if (dead && global.BloodPassives && global.BloodPassives.onDeath) {
      global.BloodPassives.onDeath(dead, state, side);
    } else if (dead && dead.passiveId === 'heal' && side === 'player') {
      /* bridge on death handled in passives; fallback */
      state.mana = Math.min(state.manaMax, state.mana + 1);
      log(dead.name + ' · Мост: +1 мана');
    }
    return dead;
  }

  function tryAttackMonster(targetIdx) {
    if (state.busy || !state.isPlayerTurn || state.phase !== 'BATTLE') return;
    if (!state.selectedAttacker) return;

    var aIdx = state.selectedAttacker.idx;
    var attacker = state.player.monsters[aIdx];
    var defender = state.enemy.monsters[targetIdx];
    if (!attacker || !defender) return;
    if (attacker.isRest || state.attackedThisTurn[attacker.instanceId]) {
      toast('Нельзя атаковать');
      return;
    }

    /* Taunt rule */
    if (hasTaunt(state.enemy) && !(defender.taunt || defender.passiveId === 'taunt')) {
      toast('Провокация! Бей Taunt-цель');
      return;
    }

    resolveCombat(attacker, aIdx, 'player', defender, targetIdx, 'enemy');
  }

  function tryAttackFace() {
    if (state.busy || !state.isPlayerTurn || state.phase !== 'BATTLE') return;
    if (!state.selectedAttacker) return;
    if (hasTaunt(state.enemy)) {
      toast('Провокация! Бей Taunt-цель');
      return;
    }
    var aIdx = state.selectedAttacker.idx;
    var attacker = state.player.monsters[aIdx];
    if (!attacker || attacker.isRest || state.attackedThisTurn[attacker.instanceId]) return;

    var dmg = attacker.atk | 0;
    state.enemyLp = Math.max(0, state.enemyLp - dmg);
    state.attackedThisTurn[attacker.instanceId] = true;
    attacker.isRest = true;
    state.selectedAttacker = null;

    playSfx('attack');
    shake();
    log(attacker.name + ' бьёт в лицо! −' + dmg + ' LP');
    toast('−' + dmg + ' LP врагу');
    renderAll();
    checkWin();
  }

  function resolveCombat(attacker, aIdx, aSide, defender, dIdx, dSide) {
    state.busy = true;
    var atk = attacker.atk | 0;
    var defHp = defender.hp != null ? defender.hp : defender.def;

    /* Scales shield: first lethal leaves 100 HP once */
    var lethal = atk >= defHp;
    if (lethal && defender.passiveId === 'shield' && !defender.shieldUsed) {
      defender.shieldUsed = true;
      defender.hp = 100;
      log(defender.name + ' · Весы! Остаётся 100 HP');
      playSfx('hurt');
      shake();
      state.attackedThisTurn[attacker.instanceId] = true;
      attacker.isRest = true;
      state.selectedAttacker = null;
      state.busy = false;
      renderAll();
      return;
    }

    defender.hp = defHp - atk;
    log(attacker.name + ' → ' + defender.name + ' (−' + atk + ')');
    playSfx('attack');
    shake();

    state.attackedThisTurn[attacker.instanceId] = true;
    attacker.isRest = true;
    state.selectedAttacker = null;

    if (defender.hp <= 0) {
      destroyMonster(dSide, dIdx);
      log(defender.name + ' уничтожен');
      toast(defender.name + ' пал');
      /* excess damage does NOT go to face (classic YGO monster battle) */
    } else {
      /* counter if defender survives — optional light chip: none for simplicity */
    }

    state.busy = false;
    renderAll();
    checkWin();
  }

  /* Enemy attacks player monster / face */
  function enemyResolveAttack(attacker, aIdx, defender, dIdx) {
    if (!attacker) return;
    if (defender) {
      resolveCombatEnemy(attacker, aIdx, defender, dIdx);
    } else {
      var dmg = attacker.atk | 0;
      state.playerLp = Math.max(0, state.playerLp - dmg);
      log('Враг: ' + attacker.name + ' в лицо! −' + dmg);
      playSfx('hurt');
      shake();
      renderAll();
      checkWin();
    }
  }

  function resolveCombatEnemy(attacker, aIdx, defender, dIdx) {
    var atk = attacker.atk | 0;
    var defHp = defender.hp != null ? defender.hp : defender.def;
    var lethal = atk >= defHp;
    if (lethal && defender.passiveId === 'shield' && !defender.shieldUsed) {
      defender.shieldUsed = true;
      defender.hp = 100;
      log(defender.name + ' · Весы! 100 HP');
      renderAll();
      return;
    }
    defender.hp = defHp - atk;
    log('Враг: ' + attacker.name + ' → ' + defender.name + ' (−' + atk + ')');
    playSfx('attack');
    shake();
    if (defender.hp <= 0) {
      destroyMonster('player', dIdx);
      log(defender.name + ' уничтожен');
    }
    renderAll();
    checkWin();
  }

  function setPhase(phase) {
    if (!state.active || state.busy) return;
    if (!state.isPlayerTurn) {
      toast('Ход врага');
      return;
    }
    if (phase === 'MAIN') {
      state.phase = 'MAIN';
      state.selectedAttacker = null;
      log('Phase: MAIN');
      renderAll();
      return;
    }
    if (phase === 'BATTLE') {
      state.phase = 'BATTLE';
      state.selectedHand = null;
      log('Phase: BATTLE — выбери атакующего');
      toast('⚔️ BATTLE');
      renderAll();
      return;
    }
  }

  function endTurn() {
    if (!state.active || state.busy) return;
    if (!state.isPlayerTurn) return;

    state.phase = 'END';
    state.selectedHand = null;
    state.selectedAttacker = null;
    log('END → ход врага…');
    renderAll();

    state.busy = true;
    setTimeout(function () {
      runEnemyTurn();
    }, 700);
  }

  function wakeMonsters(sideObj) {
    sideObj.monsters.forEach(function (c) {
      if (c) c.isRest = false;
    });
  }

  function runEnemyTurn() {
    if (checkWin()) {
      state.busy = false;
      return;
    }

    state.isPlayerTurn = false;
    state.phase = 'MAIN';
    log('Ход врага');

    /* 1) summon if empty slot */
    setTimeout(function () {
      enemyTrySummon();
      renderAll();

      setTimeout(function () {
        /* 2) battle */
        state.phase = 'BATTLE';
        enemyDoBattles();

        setTimeout(function () {
          /* 3) back to player */
          finishEnemyTurn();
        }, 900);
      }, 600);
    }, 400);
  }

  function enemyTrySummon() {
    var slot = firstEmpty(state.enemy.monsters);
    if (slot < 0) return;
    var pool = ['punisher', 'eye', 'cheshire', 'lady', 'inquisitor', 'emperor'];
    /* prefer not filling all; 50% skip if already 2+ */
    var count = allMonsters(state.enemy).length;
    if (count >= 2 && Math.random() < 0.4) return;

    var id = pool[Math.floor(Math.random() * pool.length)];
    if (global.BloodAI && global.BloodAI.pickSummon) {
      id = global.BloodAI.pickSummon(state, pool) || id;
    }
    var c = cloneFromData(id);
    if (!c) return;
    c.hp = c.def;
    state.enemy.monsters[slot] = c;
    log('Враг призывает: ' + c.name);
    playSfx('summon');
    if (c.passiveId === 'battlecry') {
      var dmg = 500;
      state.playerLp = Math.max(0, state.playerLp - dmg);
      log(c.name + ' · Боевой клич! −' + dmg + ' тебе');
      shake();
    }
  }

  function enemyDoBattles() {
    var attackers = [];
    state.enemy.monsters.forEach(function (c, i) {
      if (c && !c.isRest) attackers.push({ card: c, idx: i });
    });

    if (global.BloodAI && global.BloodAI.planAttacks) {
      var plan = global.BloodAI.planAttacks(state);
      if (plan && plan.length) {
        plan.forEach(function (p) {
          if (p.face) enemyResolveAttack(p.attacker, p.aIdx, null, -1);
          else enemyResolveAttack(p.attacker, p.aIdx, p.defender, p.dIdx);
        });
        return;
      }
    }

    /* default AI */
    attackers.forEach(function (a) {
      if (checkWin()) return;
      var targets;
      if (hasTaunt(state.player)) {
        targets = tauntTargets(state.player);
      } else {
        targets = state.player.monsters
          .map(function (c, i) { return c ? i : -1; })
          .filter(function (i) { return i >= 0; });
      }

      if (targets.length) {
        /* hit lowest HP */
        var best = targets[0];
        var bestHp = 99999;
        targets.forEach(function (i) {
          var c = state.player.monsters[i];
          var hp = c.hp != null ? c.hp : c.def;
          if (hp < bestHp) { bestHp = hp; best = i; }
        });
        enemyResolveAttack(a.card, a.idx, state.player.monsters[best], best);
      } else {
        /* face */
        enemyResolveAttack(a.card, a.idx, null, -1);
      }
    });
  }

  function finishEnemyTurn() {
    if (checkWin()) {
      state.busy = false;
      renderAll();
      return;
    }

    state.turn += 1;
    state.isPlayerTurn = true;
    state.phase = 'MAIN';
    state.attackedThisTurn = {};
    wakeMonsters(state.player);
    wakeMonsters(state.enemy);

    /* mana ramp */
    state.manaMax = Math.min(10, state.manaMax + 1);
    state.mana = state.manaMax;

    /* draw 1 if hand < 6 */
    if (state.hand.length < 6) {
      var ids = (D && D.PILLAR_ORDER) || ['inquisitor', 'emperor', 'eye', 'punisher', 'lady', 'cheshire'];
      var draw = cloneFromData(ids[Math.floor(Math.random() * ids.length)]);
      if (draw) {
        state.hand.push(draw);
        log('Добор: ' + draw.name);
      }
    }

    /* vision passive */
    state.player.monsters.forEach(function (c) {
      if (c && c.passiveId === 'vision') {
        state.mana = Math.min(state.manaMax, state.mana + 1);
        log(c.name + ' · Узор: +1 мана');
      }
      if (c && c.passiveId === 'heal') {
        state.playerLp = Math.min(4000, state.playerLp + 400);
        log(c.name + ' · Мост: +400 LP');
      }
    });

    state.busy = false;
    log('Твой ход ' + state.turn + ' · MAIN · мана ' + state.mana + '/' + state.manaMax);
    toast('Твой ход');
    renderAll();
  }

  function checkWin() {
    if (state.enemyLp <= 0) {
      state.enemyLp = 0;
      log('🏆 ПОБЕДА! Пантеон склоняется перед тобой.');
      toast('🏆 ПОБЕДА');
      state.busy = true;
      playSfx('summon');
      return true;
    }
    if (state.playerLp <= 0) {
      state.playerLp = 0;
      log('💀 ПОРАЖЕНИЕ… Кровавая Луна гаснет.');
      toast('💀 ПОРАЖЕНИЕ');
      state.busy = true;
      playSfx('hurt');
      return true;
    }
    return false;
  }

  /* ---------- API ---------- */
  global.BloodDuel = {
    state: state,
    start: startDuel,
    end: endDuel,
    onShow: onShow,
    onHide: onHide,
    renderAll: renderAll,
    log: log,
    toast: toast,
    shake: shake,
    playSfx: playSfx,
    hasTaunt: hasTaunt,
    tauntTargets: tauntTargets,
    allMonsters: allMonsters,
    cloneFromData: cloneFromData,
    checkWin: checkWin,
    applySummonPassive: applySummonPassive,
    tryAttackMonster: tryAttackMonster,
    tryAttackFace: tryAttackFace,
    setPhase: setPhase,
    endTurn: endTurn,
    runEnemyTurn: runEnemyTurn
  };

  function bindFaceAttack() {
    var top = document.querySelector('.duel-topbar');
    if (!top || top._bmFace) return;
    top._bmFace = true;
    top.style.cursor = 'pointer';
    top.title = 'Клик = атака в лицо (BATTLE, без Taunt)';
    top.addEventListener('click', function () {
      tryAttackFace();
    });
  }

  function bindPhaseButtons() {
    var main = document.getElementById('btn-duel-main');
    var battle = document.getElementById('btn-duel-battle');
    var end = document.getElementById('btn-duel-end');
    if (main && !main._bm) {
      main._bm = true;
      main.addEventListener('click', function () { setPhase('MAIN'); });
    }
    if (battle && !battle._bm) {
      battle._bm = true;
      battle.addEventListener('click', function () { setPhase('BATTLE'); });
    }
    if (end && !end._bm) {
      end._bm = true;
      end.addEventListener('click', function () { endTurn(); });
    }
  }

  function boot() {
    bindPhaseButtons();
    bindFaceAttack();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
})(typeof window !== 'undefined' ? window : this);
