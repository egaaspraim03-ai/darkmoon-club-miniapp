// ====================== BATTLE.JS — ФИНАЛЬНАЯ ВЕРСИЯ 2.1 (NEXUS EDITION) ======================
// Pokémon × Smeshariki × Dark Moon — сделано для души
// Полная механика из твоего Python-движка + NEXUS BURST + статусы

let currentBattle = null;
let battleLog = [];

// Глобальные данные
let typechartData = window.typechartData || {};
let movesData = window.movesData || {};

// ====================== NEXUS BURST ======================
function getNEXUSMultiplier(party) {
    if (!party || party.length < 3) return 1.0;
    const types = new Set();
    party.forEach(hero => {
        const t = hero.types ? hero.types[0] : (hero.type || 'Normal');
        types.add(t);
    });
    return types.size === 3 ? 1.4 : 1.0;
}

// ====================== СТАТУСЫ (полная система из Python) ======================
const STATUS_EFFECTS = {
    brn: { name: 'Ожог', dmg: 0.0625, color: '#FF4500' },
    par: { name: 'Паралич', speedMod: 0.5, chanceMiss: 0.25, color: '#FFD700' },
    psn: { name: 'Отравление', dmg: 0.125, color: '#800080' },
    tox: { name: 'Токсичное отравление', dmg: 0.0625, toxic_n: 1, color: '#4B0082' },
    slp: { name: 'Сон', color: '#4682B4' },
    frz: { name: 'Заморозка', color: '#00BFFF' }
};

function applyStatus(target, status) {
    if (target.status) return false;
    const effect = STATUS_EFFECTS[status];
    if (!effect) return false;

    target.status = status;
    if (status === 'tox') target.toxic_n = 1;
    if (status === 'slp') target.sleep_n = Math.floor(Math.random() * 3) + 1;

    addLog(`💥 ${target.ru || target.name} получил статус: <span style="color:${effect.color}">${effect.name}</span>`);
    return true;
}

function processStatusDamage(pokemon) {
    if (!pokemon.status) return;
    const effect = STATUS_EFFECTS[pokemon.status];
    if (!effect) return;

    let dmg = 0;
    if (effect.dmg) {
        if (pokemon.status === 'tox') {
            dmg = Math.floor(pokemon.maxhp * effect.dmg * pokemon.toxic_n);
            pokemon.toxic_n = Math.min(pokemon.toxic_n + 1, 16);
        } else {
            dmg = Math.floor(pokemon.maxhp * effect.dmg);
        }
        pokemon.hp = Math.max(0, pokemon.hp - dmg);
        addLog(`☠️ ${pokemon.ru || pokemon.name} страдает от ${effect.name} (-${dmg} HP)`);
    }
    if (pokemon.hp <= 0) endBattle(false);
}

// ====================== ОСНОВНАЯ ФОРМУЛА УРОНА ======================
function calculateDamage(user, target, move) {
    if (!move || move.category === 'Status') return 0;

    const level = user.level || 50;
    let basePower = move.base_power || 40;

    // STAB
    let stab = 1.0;
    if (user.types && user.types.includes(move.type)) stab = 1.5;

    // Type effectiveness
    let typeMod = 1.0;
    if (target.types) {
        target.types.forEach(t => {
            const chart = typechartData[t];
            if (chart && chart.damage_taken && chart.damage_taken[move.type] !== undefined) {
                typeMod *= chart.damage_taken[move.type];
            }
        });
    }

    const attackStat = move.category === 'Physical' 
        ? (user.attack || user.stats?.attack || 80) 
        : (user.specialattack || user.stats?.specialattack || 80);
    const defenseStat = move.category === 'Physical' 
        ? (target.defense || target.stats?.defense || 80) 
        : (target.specialdefense || target.stats?.specialdefense || 80);

    let damage = Math.floor((((2 * level / 5 + 2) * basePower * attackStat / defenseStat) / 50) + 2);
    damage = Math.floor(damage * stab * typeMod);

    // Крит
    if (Math.random() < 0.0625) damage = Math.floor(damage * 1.5);

    // NEXUS BURST
    const synergy = getNEXUSMultiplier(currentBattle ? currentBattle.party : [user]);
    damage = Math.floor(damage * synergy);

    return Math.max(1, damage);
}

// ====================== ЛОГ И HP ======================
function addLog(text) {
    battleLog.unshift(text);
    if (battleLog.length > 10) battleLog.pop();
    const logEl = document.getElementById('battle-log');
    if (logEl) logEl.innerHTML = battleLog.join('<br>');
}

function updateHPBars() {
    if (!currentBattle) return;
    const pBar = document.getElementById('player-hp-bar');
    const eBar = document.getElementById('enemy-hp-bar');
    if (pBar) pBar.style.width = Math.max(0, (currentBattle.player.hp / currentBattle.player.maxhp) * 100) + '%';
    if (eBar) eBar.style.width = Math.max(0, (currentBattle.enemy.hp / currentBattle.enemy.maxhp) * 100) + '%';
}

// ====================== СТАРТ БОЯ ======================
function startBattle(playerHero, enemyHero, party = []) {
    currentBattle = {
        player: JSON.parse(JSON.stringify(playerHero)),
        enemy: JSON.parse(JSON.stringify(enemyHero)),
        party: party.length ? party : [playerHero],
        turn: 0,
        ended: false
    };

    currentBattle.player.hp = currentBattle.player.hp || currentBattle.player.maxhp || 100;
    currentBattle.player.maxhp = currentBattle.player.maxhp || currentBattle.player.hp;
    currentBattle.enemy.hp = currentBattle.enemy.hp || currentBattle.enemy.maxhp || 100;
    currentBattle.enemy.maxhp = currentBattle.enemy.maxhp || currentBattle.enemy.hp;

    battleLog = [];
    addLog(`🌑 NEXUS BURST АКТИВИРОВАН! ${playerHero.ru || playerHero.name} VS ${enemyHero.ru || enemyHero.name}`);
    if (typeof showBattleScreen === 'function') showBattleScreen();
    updateHPBars();
}

// ====================== ХОД ИГРОКА ======================
function battleAction(actionType) {
    if (!currentBattle || currentBattle.ended) return;

    const { player, enemy } = currentBattle;
    let move = null;

    if (actionType === 'attack') move = { base_power: 60, type: player.types ? player.types[0] : 'Normal', category: 'Physical' };
    else if (actionType === 'skill') move = { base_power: 95, type: player.types ? player.types[0] : 'Normal', category: 'Special' };
    else if (actionType === 'catch') {
        addLog(`🎣 Попытка поймать ${enemy.ru || enemy.name}...`);
        setTimeout(() => { if (Math.random() > 0.35) endBattle(true); }, 800);
        return;
    }

    if (!move) return;

    const damage = calculateDamage(player, enemy, move);
    enemy.hp = Math.max(0, enemy.hp - damage);
    addLog(`📌 ${player.ru || player.name} использует ${actionType === 'skill' ? 'МОЩНЫЙ НАВЫК' : 'АТАКУ'}! (-${damage} HP)`);

    const enemySprite = document.getElementById('enemy-sprite');
    if (enemySprite) { enemySprite.classList.add('shake'); setTimeout(() => enemySprite.classList.remove('shake'), 420); }

    updateHPBars();
    if (enemy.hp <= 0) { addLog(`🎉 ${enemy.ru || enemy.name} повержен!`); setTimeout(() => endBattle(true), 900); return; }

    setTimeout(enemyTurn, 680);
}

// ====================== ХОД ВРАГА + СТАТУСЫ ======================
function enemyTurn() {
    if (!currentBattle) return;
    const { player, enemy } = currentBattle;

    const move = { base_power: 55, type: enemy.types ? enemy.types[0] : 'Normal', category: Math.random() > 0.5 ? 'Physical' : 'Special' };
    const damage = calculateDamage(enemy, player, move);
    player.hp = Math.max(0, player.hp - damage);

    addLog(`💥 ${enemy.ru || enemy.name} контратакует! (-${damage} HP)`);
    updateHPBars();

    // Статус-урон
    processStatusDamage(player);

    if (player.hp <= 0) { addLog(`💀 Тьма победила...`); setTimeout(() => endBattle(false), 900); }
}

// ====================== ЗАВЕРШЕНИЕ БОЯ ======================
function endBattle(win) {
    if (!currentBattle) return;
    currentBattle.ended = true;

    if (win) {
        addLog(`🌟 ПОБЕДА! NEXUS BURST был на твоей стороне.`);
        const exp = Math.floor(30 + Math.random() * 40);
        addLog(`+${exp} EXP`);

        // Пример catch
        if (Math.random() > 0.45 && typeof catchHeroFromLunadex === 'function') {
            setTimeout(() => catchHeroFromLunadex(currentBattle.enemy), 1200);
        }
    } else {
        addLog(`🌑 Тьма поглотила тебя...`);
    }

    if (window.saveMyHeroes) window.saveMyHeroes();
    if (typeof closeBattleScreen === 'function') setTimeout(closeBattleScreen, 2000);

    currentBattle = null;
    battleLog = [];
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initBattleSystem() {
    console.log('%c🚀 NEXUS BATTLE SYSTEM v2.1 — Python engine + статусы + NEXUS BURST загружен', 'color:#C084FC; font-weight:bold');
    window.startBattle = startBattle;
    window.battleAction = battleAction;
    window.endBattle = endBattle;
}

if (typeof window !== 'undefined') window.addEventListener('load', initBattleSystem);

console.log('%c✅ battle.js v2.1 полностью готов к бою!', 'color:#C084FC; font-size:18px');
