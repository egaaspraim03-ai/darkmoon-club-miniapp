// battle.js — полный бой

let currentBattle = null;

function spawnBattle() {
  const allKeys = Object.keys(gameData.universes);
  const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
  const pool = gameData.universes[randomKey];
  const enemyData = pool[Math.floor(Math.random() * pool.length)];

  const enemy = {...enemyData, hp: 130, maxHp: 130, attack: 48, defense: 38, level: 1, exp: 0};
  const player = {...myHeroes[0]};
  currentBattle = { player, enemy, log: [] };
  showBattleScreen();
}

function showBattleScreen() {
  const html = `
    <div class="battle-container">
      <div class="battle-field">
        <img src="${currentBattle.enemy.sprite}" class="enemy-sprite" id="enemy-sprite">
        <div style="position:absolute;top:10px;right:10px;color:#fff;font-size:14px;">${currentBattle.enemy.ru} Lv.${currentBattle.enemy.level}<br>
          <div class="hp-bar-outer" style="width:140px;"><div class="hp-bar-inner" id="enemy-hp-bar" style="width:100%;background:#ff4444;"></div></div>
        </div>
        <img src="${currentBattle.player.sprite}" class="player-sprite" id="player-sprite">
        <div style="position:absolute;bottom:10px;left:10px;color:#fff;font-size:14px;">${currentBattle.player.ru} Lv.${currentBattle.player.level}<br>
          <div class="hp-bar-outer" style="width:140px;"><div class="hp-bar-inner" id="player-hp-bar" style="width:100%;background:#44ff44;"></div></div>
        </div>
      </div>
      <div class="log" id="battle-log"></div>
      <div class="battle-buttons">
        <div class="battle-btn" onclick="battleAction('attack')">⚔️ Атака</div>
        <div class="battle-btn" onclick="battleAction('skill')">✨ Навык</div>
        <div class="battle-btn" onclick="battleAction('item')">🧪 Предметы</div>
        <div class="battle-btn" onclick="battleAction('catch')">🎣 Поймать</div>
      </div>
      <button onclick="endBattle(false)" style="margin-top:15px;width:100%;background:#9B59B6;padding:12px;border-radius:12px;">Сбежать</button>
    </div>`;
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal').style.display = 'flex';
  addLog(`🐾 Дикий ${currentBattle.enemy.ru} появился!`);
  updateHPBars();
}

function addLog(text) {
  const logEl = document.getElementById('battle-log');
  if (!logEl) return;
  currentBattle.log.push(text);
  logEl.innerHTML = currentBattle.log.map(l => `> ${l}`).join('<br>');
  logEl.scrollTop = logEl.scrollHeight;
}

function updateHPBars() {
  const pPercent = Math.max(0, Math.floor((currentBattle.player.hp / currentBattle.player.maxHp) * 100));
  const ePercent = Math.max(0, Math.floor((currentBattle.enemy.hp / currentBattle.enemy.maxHp) * 100));
  document.getElementById('player-hp-bar').style.width = pPercent + '%';
  document.getElementById('enemy-hp-bar').style.width = ePercent + '%';
}

function battleAction(action) {
  if (!currentBattle) return;
  const player = currentBattle.player;
  const enemy = currentBattle.enemy;

  if (action === 'attack' || action === 'skill') {
    const multiplier = getDamageMultiplier(player.type, enemy.type);
    let damage = Math.max(1, Math.floor((player.attack * multiplier) - (enemy.defense / 2)));
    if (action === 'skill') damage = Math.floor(damage * 1.4);

    enemy.hp = Math.max(0, enemy.hp - damage);

    const enemySprite = document.getElementById('enemy-sprite');
    enemySprite.classList.add('shake');
    setTimeout(() => enemySprite.classList.remove('shake'), 450);

    addLog(`📌 ${player.ru} ${action === 'skill' ? 'использует Навык' : 'атакует'}! (-${damage} HP)`);
  }

  if (action === 'item') {
    player.hp = Math.min(player.maxHp, player.hp + 65);
    addLog(`🧪 ${player.ru} восстановил 65 HP!`);
  }

  if (action === 'catch') {
    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
    const catchChance = hpPercent < 20 ? 75 : hpPercent < 40 ? 50 : 25;
    if (Math.random() * 100 < catchChance) {
      myHeroes.push({...enemy, hp: enemy.maxHp, level: 1, exp: 0});
      saveMyHeroes();
      addLog(`🎣 ${enemy.ru} ПОЙМАН!`);
      setTimeout(() => showBattleResult(true), 800);
      return;
    } else addLog(`❌ Не удалось поймать...`);
  }

  updateHPBars();

  if (enemy.hp <= 0) {
    addLog(`🎉 ${enemy.ru} побеждён!`);
    setTimeout(() => showBattleResult(true), 900);
    return;
  }

  setTimeout(() => {
    const multiplier = getDamageMultiplier(enemy.type, player.type);
    const enemyDamage = Math.max(1, Math.floor((enemy.attack * multiplier) - (player.defense / 2)));
    player.hp = Math.max(0, player.hp - enemyDamage);
    addLog(`💥 ${enemy.ru} атакует! (-${enemyDamage} HP)`);
    updateHPBars();

    if (player.hp <= 0) {
      addLog(`💀 Ты проиграл...`);
      setTimeout(() => showBattleResult(false), 900);
    }
  }, 700);
}

function showBattleResult(won) {
  if (won) {
    const player = currentBattle.player;
    player.exp = (player.exp || 0) + 50;
    addLog(`+50 EXP`);
    if (player.exp >= player.level * 100) {
      player.level++;
      player.attack = Math.floor(player.attack * 1.1);
      player.maxHp = Math.floor(player.maxHp * 1.1);
      player.hp = player.maxHp;
      addLog(`🎉 Lv.${player.level} УРОВЕНЬ ПОВЫШЕН!`);
    }
  }
  const resultHTML = `
    <div style="text-align:center;padding:30px 20px;">
      <h2 style="color:${won ? '#00ff88' : '#ff4444'};">${won ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ'}</h2>
      <button onclick="endBattle(${won})" style="background:#6B1E9C;width:100%;padding:18px;border-radius:16px;font-size:18px;margin-top:20px;">Продолжить путь</button>
    </div>`;
  document.getElementById('modal-content').innerHTML = resultHTML;
}

function endBattle(won) {
  closeModal();
  currentBattle = null;
}

// Таблица эффективности (нужна для battleAction)
const getDamageMultiplier = (attackerType, defenderType) => {
  if (attackerType === 'chaos' && defenderType === 'nature') return 1.5;
  if (attackerType === 'nature' && defenderType === 'toon') return 1.5;
  if (attackerType === 'toon' && defenderType === 'chaos') return 1.5;
  return 1;
};
