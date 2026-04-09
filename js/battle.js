// js/battle.js
// Полноценная боевая система (финальная версия)

let currentBattle = null;

function startBattle() {
  const enemy = getRandomWildPokemon();
  currentBattle = {
    playerMon: window.currentParty[0],
    enemyMon: enemy,
    logs: [],
    turn: 'player'
  };

  renderBattleScreen();
  addLog(`Дикий ${currentBattle.enemyMon.name} появился!`);
}

function getRandomWildPokemon() {
  // Берём случайного покемона из pokedex + smeshariki + darkmoon
  const allMons = [
    ...Object.values(window.pokedexData),
    ...window.smesharikiData,
    ...window.darkmoonData
  ];
  const random = allMons[Math.floor(Math.random() * allMons.length)];
  
  return {
    id: random.id || random.num,
    name: random.ru || random.species,
    hp: random.baseStats ? random.baseStats.hp * 2 : 60,
    maxHp: random.baseStats ? random.baseStats.hp * 2 : 60,
    level: 7,
    types: random.types || ["Normal"],
    moves: [1, 33, 45] // базовые атаки
  };
}

function renderBattleScreen() {
  const container = document.getElementById('battle-container');
  if (!container) return;

  container.innerHTML = `
    <div class="battle-ui">
      <!-- Враг -->
      <div class="enemy-side">
        <div class="hp-bar-container">
          <div class="hp-bar">
            <div class="hp-fill" id="enemy-hp" style="width: 100%"></div>
          </div>
          <span id="enemy-name">${currentBattle.enemyMon.name} Lv.${currentBattle.enemyMon.level}</span>
        </div>
      </div>

      <!-- Игрок -->
      <div class="player-side">
        <div class="hp-bar-container">
          <div class="hp-bar">
            <div class="hp-fill" id="player-hp" style="width: 100%"></div>
          </div>
          <span id="player-name">${currentBattle.playerMon.name} Lv.${currentBattle.playerMon.level}</span>
        </div>
      </div>

      <!-- Лог -->
      <div id="battle-log" class="battle-log"></div>

      <!-- Панель действий -->
      <div class="battle-actions">
        <button onclick="useMove(0)">Атака 1</button>
        <button onclick="useMove(1)">Атака 2</button>
        <button onclick="useMove(2)">Атака 3</button>
        <button onclick="openPartyMenu()">Сменить покемона</button>
        <button onclick="runFromBattle()">Бежать</button>
      </div>
    </div>
  `;

  updateHPBars();
}

function updateHPBars() {
  const playerPercent = (currentBattle.playerMon.hp / currentBattle.playerMon.maxHp) * 100;
  const enemyPercent = (currentBattle.enemyMon.hp / currentBattle.enemyMon.maxHp) * 100;
  
  document.getElementById('player-hp').style.width = playerPercent + '%';
  document.getElementById('enemy-hp').style.width = enemyPercent + '%';
}

function addLog(text) {
  currentBattle.logs.push(text);
  const logEl = document.getElementById('battle-log');
  if (logEl) {
    logEl.innerHTML = currentBattle.logs.map(l => `<div>${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function useMove(slot) {
  if (currentBattle.turn !== 'player') return;

  const damage = Math.floor(Math.random() * 35) + 25;
  currentBattle.enemyMon.hp -= damage;
  addLog(`Твой ${currentBattle.playerMon.name} нанёс ${damage} урона!`);

  if (currentBattle.enemyMon.hp <= 0) {
    addLog(`Дикий ${currentBattle.enemyMon.name} побеждён!`);
    endBattle(true);
    return;
  }

  currentBattle.turn = 'enemy';
  setTimeout(enemyTurn, 800);
  updateHPBars();
}

function enemyTurn() {
  const damage = Math.floor(Math.random() * 28) + 18;
  currentBattle.playerMon.hp -= damage;
  addLog(`Враг нанёс ${damage} урона!`);

  if (currentBattle.playerMon.hp <= 0) {
    addLog(`Твой ${currentBattle.playerMon.name} побеждён!`);
    endBattle(false);
    return;
  }

  currentBattle.turn = 'player';
  updateHPBars();
}

function openPartyMenu() {
  // Пока простой алерт (потом сделаем красивый модальный)
  const choice = prompt('Выбери покемона (0-1):', '0');
  if (choice !== null) {
    const index = parseInt(choice);
    if (index >= 0 && index < window.currentParty.length) {
      currentBattle.playerMon = window.currentParty[index];
      addLog(`В бой вышел ${currentBattle.playerMon.name}!`);
      currentBattle.turn = 'player';
      renderBattleScreen();
    }
  }
}

function runFromBattle() {
  addLog('Ты успешно сбежал!');
  endBattle(false);
}

function endBattle(playerWon) {
  currentBattle = null;
  setTimeout(() => {
    window.switchTab('overworld');
  }, 1200);
}

// Экспорт
window.startBattle = startBattle;
window.destroyBattle = () => { currentBattle = null; };
