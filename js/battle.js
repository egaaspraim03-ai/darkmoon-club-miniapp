// ====================== BATTLE.JS — v2.7 ИСПРАВЛЕННЫЙ ======================

let currentBattle = null;
let battleLog = [];

// Данные из data-loader
let typechartData = {};
let movesData = {};

// ====================== NEXUS BURST ======================
function getNEXUSMultiplier(party) {
    if (!party || party.length < 3) return 1.0;
    const types = new Set(party.map(h => h.types ? h.types[0] : h.type || 'Normal'));
    return types.size === 3 ? 1.4 : 1.0;
}

// ====================== СТАТУСЫ И УРОН (оставляем как было) ======================
// ... (весь код статусов, calculateDamage, addLog, updateHPBars и т.д. оставляем без изменений)
// Для экономии места я пропустил их здесь — просто скопируй их из своей предыдущей версии battle.js

// ====================== НОВЫЙ ЭКРАН БИТВЫ ======================
function showBattleScreen() {
    const html = `
        <div style="background:#0a001f; padding:15px; border-radius:20px; border:3px solid #C084FC; height:100%; display:flex; flex-direction:column;">
            <h2 style="text-align:center; color:#C084FC; margin:10px 0;">⚔️ БИТВА</h2>

            <!-- Враг -->
            <div style="background:#1a0033; padding:12px; border-radius:12px; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${currentBattle.enemy.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                    <div style="flex:1;">
                        <strong>${currentBattle.enemy.ru || currentBattle.enemy.name}</strong><br>
                        <span style="color:#C084FC;">Lv.${currentBattle.enemy.level || 10}</span>
                    </div>
                </div>
                <div style="height:14px; background:#333; border-radius:8px; margin-top:8px; overflow:hidden;">
                    <div id="enemy-hp-bar" style="height:100%; width:100%; background:#ff4444;"></div>
                </div>
            </div>

            <!-- Игрок -->
            <div style="background:#1a0033; padding:12px; border-radius:12px; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${currentBattle.player.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                    <div style="flex:1;">
                        <strong>${currentBattle.player.ru || currentBattle.player.name}</strong><br>
                        <span style="color:#C084FC;">Lv.${currentBattle.player.level || 10}</span>
                    </div>
                </div>
                <div style="height:14px; background:#333; border-radius:8px; margin-top:8px; overflow:hidden;">
                    <div id="player-hp-bar" style="height:100%; width:100%; background:#44ff44;"></div>
                </div>
            </div>

            <!-- Лог -->
            <div id="battle-log" style="flex:1; overflow-y:auto; background:#111; padding:12px; border-radius:12px; font-size:14px; margin-bottom:15px; border:1px solid #C084FC;"></div>

            <!-- Кнопки атак -->
            <div id="moves-container" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>

            <!-- Предметы -->
            <div style="margin-top:15px; display:flex; gap:10px;">
                <button onclick="battleAction('potion')" style="flex:1; padding:14px; background:#4B0082; color:white; border:none; border-radius:12px;">🧪 Зелье</button>
                <button onclick="battleAction('pokeball')" style="flex:1; padding:14px; background:#4B0082; color:white; border:none; border-radius:12px;">🎣 Покебол</button>
            </div>
        </div>
    `;

    const screen = document.getElementById('game-screen');
    if (screen) screen.innerHTML = html;

    renderMoveButtons();   // ← обязательно вызываем
}

function renderMoveButtons() {
    const container = document.getElementById('moves-container');
    if (!container || !currentBattle) return;

    const player = currentBattle.player;
    let html = '';

    player.moves.forEach((move, i) => {
        const pp = player.currentPP[move.id] !== undefined ? player.currentPP[move.id] : (move.pp || 20);
        html += `
            <button onclick="useMove(${i})" style="padding:14px; background:#1a0033; border:2px solid #C084FC; border-radius:12px; color:white;">
                <strong>${move.name || move.id}</strong><br>
                <small style="color:#aaa;">${move.type} • ${move.category} • PP: ${pp}</small>
            </button>`;
    });

    container.innerHTML = html || '<p style="text-align:center; color:#aaa; grid-column:1/-1;">Мувы не загрузились</p>';
}

function useMove(index) {
    // ... (код useMove остаётся тот же, что был в v2.6)
    if (!currentBattle) return;
    const player = currentBattle.player;
    const move = player.moves[index];
    if (!move) return;

    if (!player.currentPP[move.id]) player.currentPP[move.id] = move.pp || 20;
    player.currentPP[move.id]--;

    const dmg = calculateDamage(player, currentBattle.enemy, move);
    currentBattle.enemy.hp = Math.max(0, currentBattle.enemy.hp - dmg);

    addLog(`📌 ${player.ru} использует <strong>${move.name || move.id}</strong>! (-${dmg})`);

    updateHPBars();
    renderMoveButtons();

    if (currentBattle.enemy.hp <= 0) {
        addLog(`🎉 ПОБЕДА!`);
        giveExp(player, currentBattle.enemy);
        setTimeout(() => endBattle(true), 800);
        return;
    }

    setTimeout(enemyTurn, 600);
}

// ====================== Остальной код (AI, startBattle, endBattle и т.д.) ======================
// Вставь сюда весь остальной код из предыдущей версии v2.6 (enemyAI, startBattle, endBattle, initBattleSystem и т.д.)

// (Чтобы не делать сообщение слишком длинным, скопируй их из своей старой версии battle.js — они остались без изменений)

console.log('%c✅ battle.js v2.7 — кнопки атаки исправлены', 'color:#C084FC');
