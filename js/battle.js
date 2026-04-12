// js/battle.js — НАДЁЖНАЯ ВЕРСИЯ (без классов CSS, только inline)

let currentBattle = null;

function startBattle() {
  console.log("🚀 startBattle запущен");

  currentBattle = {
    playerMon: window.currentParty[0] || { name: "Твой покемон", hp: 45, maxHp: 45 },
    enemyMon: { name: "Дикий враг", hp: 55, maxHp: 55, level: 7 },
    logs: []
  };

  const container = document.getElementById('battle-container');
  if (!container) {
    console.error("battle-container не найден!");
    return;
  }

  container.innerHTML = `
    <div style="height:100%; background:#0f1f0f; color:#fff; padding:15px; display:flex; flex-direction:column;">
      
      <div style="text-align:center; font-size:22px; margin-bottom:10px; color:#ffcc00;">⚔️ БОЙ</div>

      <!-- Враг -->
      <div style="background:#1a2a1a; padding:12px; border-radius:12px; margin-bottom:15px;">
        <div style="font-size:18px;">${currentBattle.enemyMon.name} Lv.${currentBattle.enemyMon.level}</div>
        <div style="height:22px; background:#222; border:3px solid #ffcc00; border-radius:9999px; margin-top:8px; overflow:hidden;">
          <div id="enemy-hp" style="height:100%; width:100%; background:#ff4444;"></div>
        </div>
      </div>

      <!-- Лог -->
      <div id="battle-log" style="flex:1; background:#00000088; padding:15px; border-radius:12px; overflow-y:auto; margin-bottom:15px; font-size:15px; line-height:1.5;">
      </div>

      <!-- Игрок -->
      <div style="background:#1a2a1a; padding:12px; border-radius:12px; margin-bottom:20px;">
        <div style="height:22px; background:#222; border:3px solid #ffcc00; border-radius:9999px; overflow:hidden;">
          <div id="player-hp" style="height:100%; width:100%; background:#44ff44;"></div>
        </div>
        <div style="font-size:18px; text-align:right; margin-top:8px;">${currentBattle.playerMon.name}</div>
      </div>

      <!-- Кнопки -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <button onclick="useMove()" style="padding:18px; font-size:18px; background:#ffcc00; color:#112211; border:none; border-radius:12px; font-weight:bold;">АТАКА</button>
        <button onclick="runFromBattle()" style="padding:18px; font-size:18px; background:#334422; color:#ffcc00; border:3px solid #ffcc00; border-radius:12px; font-weight:bold;">БЕЖАТЬ</button>
      </div>
    </div>
  `;

  updateHPBars();
  addLog("Бой начался!");
  console.log("✅ Бой успешно отображён");
}

function updateHPBars() {
  if (!currentBattle) return;
  const playerPercent = Math.max(0, (currentBattle.playerMon.hp / currentBattle.playerMon.maxHp) * 100);
  const enemyPercent = Math.max(0, (currentBattle.enemyMon.hp / currentBattle.enemyMon.maxHp) * 100);

  const pBar = document.getElementById('player-hp');
  const eBar = document.getElementById('enemy-hp');
  if (pBar) pBar.style.width = playerPercent + '%';
  if (eBar) eBar.style.width = enemyPercent + '%';
}

function addLog(text) {
  if (!currentBattle) return;
  currentBattle.logs.unshift(text);
  const log = document.getElementById('battle-log');
  if (log) log.innerHTML = currentBattle.logs.map(l => `<div>${l}</div>`).join('');
}

function useMove() {
  if (!currentBattle) return;
  const damage = 28 + Math.floor(Math.random() * 22);
  currentBattle.enemyMon.hp -= damage;
  addLog(`Ты нанёс ${damage} урона!`);

  if (currentBattle.enemyMon.hp <= 0) {
    addLog(`🎉 ${currentBattle.enemyMon.name} побеждён!`);
    setTimeout(() => endBattle(true), 1200);
    return;
  }

  setTimeout(enemyTurn, 800);
  updateHPBars();
}

function enemyTurn() {
  if (!currentBattle) return;
  const damage = 20 + Math.floor(Math.random() * 18);
  currentBattle.playerMon.hp -= damage;
  addLog(`Враг нанёс тебе ${damage} урона!`);

  if (currentBattle.playerMon.hp <= 0) {
    addLog(`💀 Ты проиграл...`);
    setTimeout(() => endBattle(false), 1200);
    return;
  }

  updateHPBars();
}

function runFromBattle() {
  if (!currentBattle) return;
  addLog("Ты успешно сбежал!");
  endBattle(false);
}

function endBattle() {
  currentBattle = null;
  setTimeout(() => window.switchTab('overworld'), 1000);
}

// Экспорт
window.startBattle = startBattle;
window.destroyBattle = () => { currentBattle = null; };

console.log("📌 battle.js загружен (надёжная версия)");
