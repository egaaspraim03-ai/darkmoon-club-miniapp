// js/battle.js — УЛУЧШЕННАЯ ВЕРСИЯ

let currentBattle = null;

function startBattle() {
  const enemy = getRandomWildPokemon();

  currentBattle = {
    playerMon: window.currentParty[0],
    enemyMon: enemy,
    logs: [],
    turn: 'player'
  };

  renderBattleUI();
  addLog(`Появился дикий ${currentBattle.enemyMon.name}!`);
}

function getRandomWildPokemon() {
  const allMons = [
    ...Object.values(window.pokedexData || {}),
    ...window.smesharikiData || [],
    ...window.darkmoonData || []
  ];
  const mon = allMons[Math.floor(Math.random() * allMons.length)];

  return {
    name: mon.ru || mon.species || "Неизвестный",
    level: 6 + Math.floor(Math.random() * 4),
    hp: 55,
    maxHp: 55,
    types: mon.types || ["Normal"]
  };
}

function renderBattleUI() {
  const container = document.getElementById('battle-container');
  if (!container) return;

  container.innerHTML = `
    <div class="battle-ui">
      <div class="battle-header">⚔️ БОЙ</div>

      <!-- Враг -->
      <div class="enemy-info">
        <div class="name-level">${currentBattle.enemyMon.name} Lv.${currentBattle.enemyMon.level}</div>
        <div class="hp-bar-outer">
          <div class="hp-bar-inner" id="enemy-hp-bar" style="width:100%"></div>
        </div>
      </div>

      <!-- Лог -->
      <div id="battle-log" class="battle-log"></div>

      <!-- Игрок -->
      <div class="player-info">
        <div class="hp-bar-outer">
          <div class="hp-bar-inner" id="player-hp-bar" style="width:100%"></div>
        </div>
        <div class="name-level">${currentBattle.playerMon.name} Lv.${currentBattle.playerMon.level || 5}</div>
      </div>

      <!-- Кнопки действий -->
      <div class="battle-actions">
        <button onclick="useMove(0)">Удар</button>
        <button onclick="useMove(1)">Сильный удар</button>
        <button onclick="useMove(2)">Специальная атака</button>
        <button onclick="openPartyMenu(true)">Сменить покемона</button>
        <button onclick="runFromBattle()">Бежать</button>
      </div>
    </div>
  `;

  updateHPBars();
}

function updateHPBars() {
  if (!currentBattle) return;
  const playerPercent = Math.max(0, (currentBattle.playerMon.hp / currentBattle.playerMon.maxHp) * 100);
  const enemyPercent = Math.max(0, (currentBattle.enemyMon.hp / currentBattle.enemyMon.maxHp) * 100);

  document.getElementById('player-hp-bar').style.width = playerPercent + '%';
  document.getElementById('enemy-hp-bar').style.width = enemyPercent + '%';
}

function addLog(text) {
  if (!currentBattle) return;
  currentBattle.logs.unshift(text);
  const logEl = document.getElementById('battle-log');
  if (logEl) logEl.innerHTML = currentBattle.logs.map(l => `<div>${l}</div>`).join('');
}

function useMove(slot) {
  if (currentBattle.turn !== 'player') return;

  let damage = 25;
  if (slot === 1) damage = 38;
  if (slot === 2) damage = 45;

  currentBattle.enemyMon.hp -= damage;
  addLog(`Твой покемон использовал атаку и нанёс ${damage} урона!`);

  if (currentBattle.enemyMon.hp <= 0) {
    addLog(`🎉 ${currentBattle.enemyMon.name} побеждён!`);
    setTimeout(() => endBattle(true), 1500);
    return;
  }

  currentBattle.turn = 'enemy';
  setTimeout(enemyTurn, 900);
  updateHPBars();
}

function enemyTurn() {
  const damage = 22 + Math.floor(Math.random() * 18);
  currentBattle.playerMon.hp -= damage;
  addLog(`Враг нанёс тебе ${damage} урона!`);

  if (currentBattle.playerMon.hp <= 0) {
    addLog(`💀 Твой покемон побеждён...`);
    setTimeout(() => endBattle(false), 1500);
    return;
  }

  currentBattle.turn = 'player';
  updateHPBars();
}

function runFromBattle() {
  addLog('Ты успешно сбежал!');
  endBattle(false);
}

function endBattle(playerWon) {
  currentBattle = null;
  setTimeout(() => window.switchTab('overworld'), 1200);
}

function openPartyMenu() {
  alert('Меню смены покемона будет улучшено в следующем обновлении');
}

// Экспорт
window.startBattle = startBattle;
window.destroyBattle = () => { currentBattle = null; };
