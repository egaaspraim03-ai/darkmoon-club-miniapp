// ====================== BATTLE.JS — ФИНАЛЬНАЯ ВЕРСИЯ ======================
let currentBattle = null;
let currentParty = [];

function startBattle(playerMon, enemy, party) {
    currentParty = party || [];
    currentBattle = {
        playerMon: { ...playerMon },
        enemyMon: { ...enemy, hp: enemy.maxhp || 150, maxhp: enemy.maxhp || 150 },
        logs: []
    };

    document.getElementById('battle-container').style.display = 'block';
    document.getElementById('overworld-container').style.display = 'none';
    renderBattle();
}

function renderBattle() {
    const container = document.getElementById('battle-container');
    container.innerHTML = `
        <div style="padding:20px; color:#C084FC; text-align:center;">
            <h2>⚔️ Бой</h2>
            <p>Враг: ${currentBattle.enemyMon.ru} HP ${currentBattle.enemyMon.hp}/${currentBattle.enemyMon.maxhp}</p>
            <p>Твой: ${currentBattle.playerMon.ru} HP ${currentBattle.playerMon.hp}/${currentBattle.playerMon.maxhp}</p>
            
            <div id="battle-log" style="height:180px; overflow-y:auto; background:#111; margin:15px 0; padding:10px; text-align:left;"></div>
            
            <button onclick="useMove()" style="margin:8px; padding:12px 20px;">Атака</button>
            <button onclick="openPartyMenu()" style="margin:8px; padding:12px 20px;">Сменить покемона</button>
            <button onclick="endBattle()" style="margin:8px; padding:12px 20px;">Сбежать</button>
        </div>
    `;
    updateLog();
}

function useMove() {
    if (!currentBattle) return;
    addLog(`Твой покемон атакует!`);
    currentBattle.enemyMon.hp -= 50;
    if (currentBattle.enemyMon.hp <= 0) {
        addLog("Победа над врагом!");
        setTimeout(endBattle, 800);
        return;
    }
    setTimeout(() => {
        addLog("Враг атакует тебя!");
        currentBattle.playerMon.hp -= 40;
        renderBattle();
    }, 700);
}

function addLog(text) {
    if (!currentBattle) return;
    currentBattle.logs.push(text);
    updateLog();
}

function updateLog() {
    const logEl = document.getElementById('battle-log');
    if (logEl) logEl.innerHTML = currentBattle.logs.map(l => `<div>${l}</div>`).join('');
}

function openPartyMenu() {
    alert("Смена покемона из партии (будет улучшено позже)");
}

function endBattle() {
    currentBattle = null;
    document.getElementById('battle-container').style.display = 'none';
    document.getElementById('overworld-container').style.display = 'block';
    if (typeof initOverworld === 'function') initOverworld();
}

window.startBattle = startBattle;
