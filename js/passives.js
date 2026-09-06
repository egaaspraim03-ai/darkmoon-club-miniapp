/* ============================================================
   js/passives.js — Blood Moon TCG
   Taunt · Battlecry · Shield · Heal · Vision · Chaos
   ============================================================ */
(function (global) {
  'use strict';

  function onSummon(card, state, side) {
    if (!card || !state) return;
    var pid = card.passiveId;
    var isPlayer = side === 'player';

    if (pid === 'battlecry') {
      var dmg = 500;
      if (isPlayer) {
        state.enemyLp = Math.max(0, state.enemyLp - dmg);
      } else {
        state.playerLp = Math.max(0, state.playerLp - dmg);
      }
      msg(state, card.name + ' · Боевой клич! −' + dmg + ' LP');
      sfx('hurt');
      shake();
    }

    if (pid === 'heal' && isPlayer) {
      state.playerLp = Math.min(4000, state.playerLp + 400);
      msg(state, card.name + ' · Мост: +400 LP');
    }

    if (pid === 'chaos' && isPlayer) {
      state.manaMax = Math.min(10, state.manaMax + 1);
      var allies = (state.player.monsters || []).filter(Boolean);
      var foes = (state.enemy.monsters || []).filter(Boolean);
      if (Math.random() < 0.5 && allies.length) {
        var a = allies[Math.floor(Math.random() * allies.length)];
        a.atk = (a.atk | 0) + 300;
        msg(state, card.name + ' · Улыбка: ' + a.name + ' +300 ATK');
      } else if (foes.length) {
        var f = foes[Math.floor(Math.random() * foes.length)];
        f.atk = Math.max(0, (f.atk | 0) - 300);
        msg(state, card.name + ' · Улыбка: ' + f.name + ' −300 ATK');
      } else {
        msg(state, card.name + ' · Улыбка: макс. мана ' + state.manaMax);
      }
    }

    if (pid === 'taunt') {
      card.taunt = true;
      msg(state, card.name + ' · Провокация активна');
    }

    if (pid === 'vision' && isPlayer) {
      msg(state, card.name + ' · Узор: в начале хода +1 мана');
    }

    if (pid === 'shield') {
      card.shieldUsed = false;
      msg(state, card.name + ' · Весы готовы');
    }
  }

  function onDeath(card, state, side) {
    if (!card || !state) return;
    if (card.passiveId === 'heal' && side === 'player') {
      state.mana = Math.min(state.manaMax, (state.mana | 0) + 1);
      msg(state, card.name + ' · Мост (смерть): +1 мана');
    }
  }

  function onTurnStart(state, side) {
    if (!state) return;
    var arr = side === 'player' ? state.player.monsters : state.enemy.monsters;
    (arr || []).forEach(function (c) {
      if (!c) return;
      if (c.passiveId === 'vision' && side === 'player') {
        state.mana = Math.min(state.manaMax, (state.mana | 0) + 1);
        msg(state, c.name + ' · Узор: +1 мана');
      }
      if (c.passiveId === 'heal' && side === 'player') {
        state.playerLp = Math.min(4000, state.playerLp + 400);
        msg(state, c.name + ' · Мост: +400 LP');
      }
    });
  }

  function onLethal(defender, incomingAtk) {
    if (!defender) return { hp: 0, blocked: false };
    var hp = defender.hp != null ? defender.hp : defender.def;
    if (incomingAtk >= hp && defender.passiveId === 'shield' && !defender.shieldUsed) {
      defender.shieldUsed = true;
      defender.hp = 100;
      return { hp: 100, blocked: true };
    }
    return { hp: hp - incomingAtk, blocked: false };
  }

  function canAttackFace(state, attackerSide) {
    var foe = attackerSide === 'player' ? state.enemy : state.player;
    return !hasTaunt(foe);
  }

  function hasTaunt(sideObj) {
    if (!sideObj || !sideObj.monsters) return false;
    return sideObj.monsters.some(function (c) {
      return c && (c.taunt || c.passiveId === 'taunt');
    });
  }

  function legalTargets(state, attackerSide) {
    var foe = attackerSide === 'player' ? state.enemy : state.player;
    var monsters = foe.monsters || [];
    if (hasTaunt(foe)) {
      return monsters
        .map(function (c, i) {
          return c && (c.taunt || c.passiveId === 'taunt') ? i : -1;
        })
        .filter(function (i) {
          return i >= 0;
        })
        .map(function (i) {
          return { type: 'monster', idx: i, card: monsters[i] };
        });
    }
    var list = monsters
      .map(function (c, i) {
        return c ? { type: 'monster', idx: i, card: c } : null;
      })
      .filter(Boolean);
    list.push({ type: 'face' });
    return list;
  }

  function msg(state, text) {
    if (global.BloodDuel && global.BloodDuel.log) global.BloodDuel.log(text);
  }

  function sfx(t) {
    if (global.BloodDuel && global.BloodDuel.playSfx) global.BloodDuel.playSfx(t);
  }

  function shake() {
    if (global.BloodDuel && global.BloodDuel.shake) global.BloodDuel.shake();
  }

  global.BloodPassives = {
    onSummon: onSummon,
    onDeath: onDeath,
    onTurnStart: onTurnStart,
    onLethal: onLethal,
    canAttackFace: canAttackFace,
    hasTaunt: hasTaunt,
    legalTargets: legalTargets
  };
})(typeof window !== 'undefined' ? window : this);
