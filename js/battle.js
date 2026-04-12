// js/battle.js — ИСПРАВЛЕННАЯ ВЕРСИЯ (чёрный экран должен исчезнуть)

let currentBattle = null;

function startBattle() {
  const enemy = getRandomWildPokemon();
  
  currentBattle = {
    playerMon: window.currentParty[0],
    enemyMon: enemy,
    logs: [],
    turn: 'player'
  };

  const container = document.getElementById('battle-container');
  if (container) {
    container.innerHTML = `
      <div class="battle-ui" style="height:100%; display:flex; flex-direction:column; background:#112211; padding:15px;">
        <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
          
          <!-- Враг -->
          <div style="text-align:center;">
            <div style="font-size:18px; margin-bottom:8px;">${currentBattle.enemyMon.name} Lv.${currentBattle.enemyMon.level}</div>
            <div style="height:20px; background:#333; border:3px solid #ffcc00; border-radius:9999px; overflow:hidden;">
              <div id="enemy-hp-bar" style="height:100%; width:100%; background:#00cc00;"></div>
            </div>
          </div>

          <!-- Лог -->
          <div id="battle-log" style="flex:1; background:#00000088; margin:15px 0; padding:12px; border-radius:12px; overflow-y:auto; font-size:15px; line-height:1.5;"></div>

          <!-- Игрок -->
          <div style="text-align:center;">
            <div style="height:20px; background:#333; border:3px solid #ffcc00; border-radius:9999px; overflow:hidden;">
              <div id="player-hp-bar" style="height:100%; width:100%; background:#00cc00;"></div>
            </div>
            <div style="font-size:18px; margin-top:8px;">${currentBattle.playerMon.name} Lv.${currentBattle.playerMon.level}</div>
          </div>
        </div>

        <!-- Кнопки -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
          <button onclick="useMove()" style="padding:15px; font-size:16px;">Атака</button>
          <button onclick="openPartyMenu(true)" style="padding:15px; font-size:16px;">Сменить</button>
          <button onclick="runFromBattle()" style="padding:15px; font-size:16px; grid-column:span 2;">Бежать</button>
        </div>
      </div>
    `;
  }

  updateBattleUI();
  addLog(`Появился дикий ${currentBattle.enemyMon.name}!`);
}

function getRandomWildPokemon() {
  const all = [
    ...Object.values(window.pokedexData || {}),
    ...window.smesharikiData || [],
    ...window.darkmoonData || []
  ];
  const mon = all[Math.floor(Math.random() * all.length)];
  return {
    name: mon.ru || mon.species || "Неизвестный",
    level: 7,
    hp: 65,
    maxHp: 65,
    types: mon.types || ["Normal"]
  };
}

function updateBattleUI() {
  if (!currentBattle) return;
  const playerPercent = Math.max(0, (currentBattle.playerMon.hp / currentBattle.playerMon.maxHp) * 100);
  const enemyPercent = Math.max(0, (currentBattle.enemyMon.hp / currentBattle.enemyMon.maxHp) * 100);
  
  const playerBar = document.getElementById('player-hp-bar');
  const enemyBar = document.getElementById('enemy-hp-bar');
  if (playerBar) playerBar.style.width = playerPercent + '%';
  if (enemyBar) enemyBar.style.width = enemyPercent + '%';
}

function addLog(text) {
  if (!currentBattle) return;
  currentBattle.logs.push(text);
  const log = document.getElementById('battle-log');
  if (log) {
    log.innerHTML = currentBattle.logs.map(l => `<div>${l}</div>`).join('');
    log.scrollTop = log.scrollHeight;
  }
}

function useMove() {
  if (!currentBattle || currentBattle.turn !== 'player') return;
  
  const dmg = Math.floor(Math.random() * 32) + 28;
  currentBattle.enemyMon.hp -= dmg;
  addLog(`Твой покемон нанёс ${dmg} урона!`);

  if (currentBattle.enemyMon.hp <= 0) {
    addLog(`Победа! ${currentBattle.enemyMon.name} побеждён.`);
    setTimeout(() => endBattle(true), 1200);
    return;
  }

  currentBattle.turn = 'enemy';
  setTimeout(enemyTurn, 700);
  updateBattleUI();
}

function enemyTurn() {
  const dmg = Math.floor(Math.random() * 25) + 18;
  currentBattle.playerMon.hp -= dmg;
  addLog(`Враг нанёс ${dmg} урона!`);

  if (currentBattle.playerMon.hp <= 0) {
    addLog(`Твой покемон побеждён...`);
    setTimeout(() => endBattle(false), 1200);
    return;
  }

  currentBattle.turn = 'player';
  updateBattleUI();
}

function runFromBattle() {
  addLog('Ты сбежал!');
  endBattle(false);
}

function endBattle(playerWon) {
  currentBattle = null;
  setTimeout(() => {
    window.switchTab('overworld');
  }, 1500);
}

function openPartyMenu(fromBattle = false) {
  // Пока просто заглушка
  alert('Меню смены покемона (будет улучшено позже)');
}

// Экспорт
window.startBattle = startBattle;
window.destroyBattle = () => { currentBattle = null; };
