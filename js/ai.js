/* ============================================================
   js/ai.js — честный ИИ врага (Blood Moon TCG)
   1) Есть Taunt у игрока → только Taunt
   2) Можно добить face (ATK >= playerLp) и нет Taunt → face
   3) Иначе — самый слабый / выгодный обмен
   ============================================================ */
(function (global) {
  'use strict';

  function pickSummon(state, pool) {
    pool = pool || ['punisher', 'eye', 'cheshire', 'lady', 'inquisitor', 'emperor'];
    var empty = 0;
    (state.enemy.monsters || []).forEach(function (c) { if (!c) empty++; });
    if (empty === 0) return null;

    var needTaunt = false;
    var playerAtk = totalAtk(state.player);
    if (playerAtk >= state.enemyLp * 0.5) needTaunt = true;

    if (needTaunt && pool.indexOf('inquisitor') >= 0) return 'inquisitor';
    if (state.playerLp <= 2500 && pool.indexOf('emperor') >= 0) return 'emperor';
    if (state.enemyLp < 2000 && pool.indexOf('punisher') >= 0) return 'punisher';
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function totalAtk(side) {
    var s = 0;
    (side.monsters || []).forEach(function (c) {
      if (c) s += (c.atk | 0);
    });
    return s;
  }

  function planAttacks(state) {
    var plan = [];
    var monsters = state.enemy.monsters || [];
    var P = global.BloodPassives;

    monsters.forEach(function (attacker, aIdx) {
      if (!attacker || attacker.isRest) return;

      var targets = P && P.legalTargets
        ? P.legalTargets(state, 'enemy')
        : defaultTargets(state);

      /* can lethal face? */
      var faceOk = targets.some(function (t) { return t.type === 'face'; });
      if (faceOk && (attacker.atk | 0) >= state.playerLp) {
        plan.push({ attacker: attacker, aIdx: aIdx, face: true });
        return;
      }

      /* monster targets only */
      var mTargets = targets.filter(function (t) { return t.type === 'monster'; });
      if (!mTargets.length) {
        if (faceOk) plan.push({ attacker: attacker, aIdx: aIdx, face: true });
        return;
      }

      /* kill if possible, else lowest HP */
      var kill = null;
      var weak = mTargets[0];
      var weakHp = 99999;
      mTargets.forEach(function (t) {
        var hp = t.card.hp != null ? t.card.hp : t.card.def;
        if ((attacker.atk | 0) >= hp) {
          if (!kill || (t.card.atk | 0) > (kill.card.atk | 0)) kill = t;
        }
        if (hp < weakHp) {
          weakHp = hp;
          weak = t;
        }
      });
      var choice = kill || weak;
      plan.push({
        attacker: attacker,
        aIdx: aIdx,
        face: false,
        defender: choice.card,
        dIdx: choice.idx
      });
    });

    return plan;
  }

  function defaultTargets(state) {
    var list = [];
    var hasTaunt = false;
    (state.player.monsters || []).forEach(function (c) {
      if (c && (c.taunt || c.passiveId === 'taunt')) hasTaunt = true;
    });
    (state.player.monsters || []).forEach(function (c, i) {
      if (!c) return;
      if (hasTaunt && !(c.taunt || c.passiveId === 'taunt')) return;
      list.push({ type: 'monster', idx: i, card: c });
    });
    if (!hasTaunt) list.push({ type: 'face' });
    return list;
  }

  global.BloodAI = {
    pickSummon: pickSummon,
    planAttacks: planAttacks,
    totalAtk: totalAtk
  };
})(typeof window !== 'undefined' ? window : this);
