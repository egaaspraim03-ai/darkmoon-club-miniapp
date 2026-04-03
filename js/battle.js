// ====================== BATTLE.JS — v2.9 СТАБИЛЬНЫЙ ======================
// Ждёт загрузки данных + исправлено отображение мувов

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

// ====================== СТАТУСЫ ======================
const STATUS_EFFECTS = {
    brn: { name: 'Ожог', dmg: 0.0625, color: '#FF4500' },
    par: { name: 'Паралич', speedMod: 0.5, missChance: 0.25, color: '#FFD700' },
    psn: { name: 'Отравление', dmg: 0.125, color: '#800080' },
    tox: { name: 'Токсик', dmg: 0.0625, color: '#4B0082' },
    slp: { name: 'Сон', color: '#4682B4' },
    frz: { name: 'Заморозка', color: '#00BFFF' }
};

function applyStatus(target, status) {
    if (target.status) return false;
    const eff = STATUS_EFFECTS[status];
    if (!eff) return false;
    target.status = status;
    if (status === 'tox') target.toxic_n = 1;
    if (status === 'slp') target.sleep_n = Math.floor(Math.random() * 3) + 2;
    addLog(`💥 ${target.ru || target.name} <span style="color:${eff.color}">${eff.name}</span>`);
    return true;
}

function processStatusDamage(pokemon) {
    if (!pokemon.status) return;
    const eff = STATUS_EFFECTS[pokemon.status];
    let dmg = 0;
    if (eff.dmg) {
        dmg = Math.floor(pokemon.maxhp * eff.dmg * (pokemon.toxic_n || 1));
        if (pokemon.status === 'tox') pokemon.toxic_n = Math.min(pokemon.toxic_n + 1, 16);
        pokemon.hp = Math.max(0, pokemon.hp - dmg);
        addLog(`☠️ ${pokemon.ru || pokemon.name} страдает от ${eff.name} (-${dmg})`);
    }
    if (pokemon.hp <= 0) endBattle(false);
}

// ====================== УРОН ======================
function calculateDamage(user, target, move) {
    if (!move || move.category === 'Status') return 0;

    const level = user.level || 50;
    let basePower = move.base_power || 40;

    const stab = (user.types && user.types.includes(move.type)) ? 1.5 : 1.0;

    let typeMod = 1.0;
    if (target.types) {
        target.types.forEach(t => {
            const chart = typechartData[t];
            if (chart?.damage_taken?.[move.type] !== undefined) typeMod *= chart.damage_taken[move.type];
        });
    }

    const atk = move.category === 'Physical' ? (user.attack || 80) : (user.specialattack || 80);
    const def = move.category === 'Physical' ? (target.defense || 80) : (target.specialdefense || 80);

    let dmg = Math.floor((((2 * level / 5 + 2) * basePower * atk / def) / 50) + 2);
    dmg = Math.floor(dmg * stab * typeMod);

    if (Math.random() < 0.0625) dmg = Math.floor(dmg * 1.5);

    const synergy = getNEXUSMultiplier(currentBattle?.party || [user]);
    dmg = Math.floor(dmg * synergy);

    return Math.max(1, dmg);
}

// ====================== ЛОГ И HP ======================
function addLog(text) {
    battleLog.unshift(text);
    if (battleLog.length > 10) battleLog.pop();
    const el = document.getElementById('battle-log');
    if (el) el.innerHTML = battleLog.join('<br>');
}

function updateHPBars() {
    if (!currentBattle) return;
    const p = document.getElementById('player-hp-bar');
    const e = document.getElementById('enemy-hp-bar');
    if (p) p.style.width = Math.max(0, (currentBattle.player.hp / currentBattle.player.maxhp) * 100) + '%';
    if (e) e.style.width = Math.max(0, (currentBattle.enemy.hp / currentBattle.enemy.maxhp) * 100) + '%';
}

// ====================== ЭКРАН БИТВЫ ======================
function showBattleScreen() {
    const html = `
        <div style="background:#0a001f; padding:15px; border-radius:20px; border:3px solid #C084FC; min-height:100%; display:flex; flex-direction:column;">
            <h2 style="text-align:center; color:#C084FC; margin:10px 0 20px;">⚔️ БИТВА</h2>

            <!-- Враг -->
            <div style="background:#1a0033; padding:12px; border-radius:12px; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${currentBattle.enemy.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                    <div>
                        <strong>${currentBattle.enemy.ru || currentBattle.enemy.name}</strong><br>
                        <span style="color:#C084FC;">Lv.${currentBattle.enemy.level || 10}</span>
                    </div>
                </div>
                <div style="height:14px; background:#333; border-radius:8px; margin-top:8px; overflow:hidden;">
                    <div id="enemy-hp-bar" style="height:100%; width:100%; background:#ff4444;"></div>
                </div>
            </div>

            <!-- Игрок -->
            <div style="background:#1a0033; padding:12px; border-radius:12px; margin-bottom:25px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${currentBattle.player.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                    <div>
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

            <!-- Кнопки мувов -->
            <div id="moves-container" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>

            <!-- Предметы -->
            <div style="margin-top:15px; display:flex; gap:10px;">
                <button onclick="useItem('potion')" style="flex:1; padding:14px; background:#4B0082; color:white; border:none; border-radius:12px;">🧪 Зелье</button>
                <button onclick="useItem('pokeball')" style="flex:1; padding:14px; background:#4B0082; color:white; border:none; border-radius:12px;">🎣 Покебол</button>
            </div>
        </div>
    `;

    const screen = document.getElementById('game-screen');
    if (screen) screen.innerHTML = html;

    renderMoveButtons();
}

function renderMoveButtons() {
    const container = document.getElementById('moves-container');
    if (!container || !currentBattle) return;

    const player = currentBattle.player;
    const moves = player.moves || [];

    let html = '';

    moves.forEach((move, i) => {
        const pp = player.currentPP[move.id] !== undefined ? player.currentPP[move.id] : (move.pp || 20);
        html += `
            <button onclick="useMove(${i})" style="padding:14px; background:#1a0033; border:2px solid #C084FC; border-radius:12px; color:white; text-align:left;">
                <strong>${move.name || move.id}</strong><br>
                <small>${move.type} • ${move.category} • PP: ${pp}</small>
            </button>`;
    });

    container.innerHTML = html || '<p style="color:#aaa; text-align:center; grid-column:1/-1; padding:20px;">Мувы не загружены</p>';
}

function useMove(index) {
    if (!currentBattle || currentBattle.ended) return;
    const player = currentBattle.player;
    const move = player.moves[index];
    if (!move) return;

    if (!player.currentPP[move.id]) player.currentPP[move.id] = move.pp || 20;
    if (player.currentPP[move.id] <= 0) return;

    player.currentPP[move.id]--;

    const dmg = calculateDamage(player, currentBattle.enemy, move);
    currentBattle.enemy.hp = Math.max(0, currentBattle.enemy.hp - dmg);

    addLog(`📌 ${player.ru || player.name} использует <strong>${move.name || move.id}</strong>! (-${dmg} HP)`);

    updateHPBars();
    renderMoveButtons();

    if (currentBattle.enemy.hp <= 0) {
        addLog(`🎉 ПОБЕДА!`);
        giveExp(player, currentBattle.enemy);
        setTimeout(() => endBattle(true), 900);
        return;
    }

    setTimeout(enemyTurn, 650);
}

// ====================== AI ======================
function enemyAI() {
    const { enemy, player } = currentBattle;
    const moves = enemy.moves || Object.values(movesData).slice(0, 4);
    const move = moves[Math.floor(Math.random() * moves.length)];

    const dmg = calculateDamage(enemy, player, move);
    player.hp = Math.max(0, player.hp - dmg);

    addLog(`💥 ${enemy.ru || enemy.name} использует <strong>${move.name || move.id}</strong>! (-${dmg} HP)`);
}

// ====================== БОЙ ======================
function startBattle(playerHero, enemyHero, party = []) {
    currentBattle = {
        player: JSON.parse(JSON.stringify(playerHero)),
        enemy: JSON.parse(JSON.stringify(enemyHero)),
        party: party.length ? party : [playerHero],
        ended: false
    };

    currentBattle.player.hp = currentBattle.player.hp || currentBattle.player.maxhp || 120;
    currentBattle.player.maxhp = currentBattle.player.maxhp || currentBattle.player.hp;
    currentBattle.enemy.hp = currentBattle.enemy.hp || currentBattle.enemy.maxhp || 120;
    currentBattle.enemy.maxhp = currentBattle.enemy.maxhp || currentBattle.enemy.hp;

    currentBattle.player.currentPP = {};
    currentBattle.enemy.currentPP = {};

    battleLog = [];
    addLog(`🌑 БИТВА НАЧАЛАСЬ! ${playerHero.ru || playerHero.name} vs ${enemyHero.ru || enemyHero.name}`);

    showBattleScreen();
    updateHPBars();
}

function enemyTurn() {
    if (!currentBattle) return;
    enemyAI();
    updateHPBars();
    processStatusDamage(currentBattle.player);
    if (currentBattle.player.hp <= 0) endBattle(false);
    else renderMoveButtons();
}

function endBattle(win) {
    currentBattle.ended = true;
    if (win) addLog(`🌟 NEXUS BURST ПОБЕДИЛ!`);
    else addLog(`🌑 Тьма победила...`);

    if (window.saveMyHeroes) window.saveMyHeroes();
    if (typeof closeBattleScreen === 'function') setTimeout(closeBattleScreen, 1500);
    currentBattle = null;
}

function useItem(itemType) {
    if (!currentBattle) return;
    if (itemType === 'potion') {
        currentBattle.player.hp = Math.min(currentBattle.player.maxhp, currentBattle.player.hp + 60);
        addLog(`🧪 Зелье (+60 HP)`);
        updateHPBars();
    }
}

// ====================== ЗАПУСК ======================
async function initBattleSystem() {
    // Ждём загрузки данных
    while (!window.dataLoaded) {
        await new Promise(r => setTimeout(r, 300));
    }

    typechartData = window.typechartData || {};
    movesData = window.movesData || {};

    console.log('%c🚀 BATTLE v2.9 — готов', 'color:#C084FC; font-weight:bold');

    window.startBattle = startBattle;
    window.useItem = useItem;
}

if (typeof window !== 'undefined') window.addEventListener('load', initBattleSystem);
