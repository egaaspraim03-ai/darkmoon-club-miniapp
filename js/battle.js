// js/battle.js — МИНИМАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ (чёрный экран должен исчезнуть)

let currentBattle = null;

function startBattle() {
  console.log("🚀 startBattle вызван");

  currentBattle = {
    playerMon: { name: "Твой покемон", hp: 45, maxHp: 45 },
    enemyMon: { name: "Дикий враг", hp: 50, maxHp: 50 },
    logs: []
  };

  const container = document.getElementById('battle-container');
  if (!container) {
    console.error("❌ battle-container не найден!");
    return;
  }

  container.innerHTML = `
    <div style="height:100%; background:#112211; color:white; padding:20px; display:flex; flex-direction:column;">
      <h2 style="text-align:center; color:#ffcc00;">⚔️ БОЙ</h2>
      
      <div style="margin:20px 0;">
        <strong>Враг:</strong> ${currentBattle.enemyMon.name}<br>
        <div style="height:20px; background:#333; border:3px solid #ffcc00; border-radius:10px; margin:8px 0;">
          <div style="height:100%; width:80%; background:#cc0000;"></div>
        </div>
      </div>

      <div id="battle-log" style="flex:1; background:#00000088; padding:15px; border-radius:10px; overflow-y:auto; margin-bottom:15px;">
        Бой начался!<br>
      </div>

      <div style="display:flex; gap:10px;">
        <button onclick="useMove()" style="flex:1; padding:15px; font-size:18px;">АТАКА</button>
        <button onclick="runFromBattle()" style="flex:1; padding:15px; font-size:18px;">БЕЖАТЬ</button>
      </div>
    </div>
  `;

  console.log("✅ Battle UI вставлен");
  addLog("Бой начался!");
}

function addLog(text) {
  const log = document.getElementById('battle-log');
  if (log) log.innerHTML += text + "<br>";
}

function useMove() {
  addLog("Ты нанёс урон!");
  // Можно позже расширить
}

function runFromBattle() {
  addLog("Ты сбежал!");
  setTimeout(() => {
    window.switchTab('overworld');
  }, 800);
}

// Экспорт
window.startBattle = startBattle;
window.destroyBattle = () => { currentBattle = null; };

console.log("📌 battle.js загружен (упрощённая версия)");
