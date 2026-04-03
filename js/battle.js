// ====================== BATTLE.JS — v2.5 NEXUS JSON ======================
// AI + Mega + Z-move + EXP + Левелинг + Эволюция + ПРЕДМЕТЫ
// Данные берутся из data-loader.js (pokedex.json + moves.json + typechart.json)

let currentBattle = null;
let battleLog = [];

// Глобальные данные (будут заполнены из data-loader.js)
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

    // STAB
    const stab = (user.types && user.types.includes(move.type)) ? 1.5 : 1.0;

    // Type effectiveness
    let typeMod = 1.0;
    if (target.types) {
        target.types.forEach(t => {
            const chart = typechartData[t];
            if (chart?.damage_taken?.[move.type] !== undefined) {
                typeMod *= chart.damage_taken[move.type];
            }
        });
    }

    const atk = move.category === 'Physical' 
        ? (user.attack || user.base_attack || 80) 
        : (user.specialattack || user.base_specialattack || 80);

    const def = move.category === 'Physical' 
        ? (target.defense || target.base_defense || 80) 
        : (target.specialdefense || target.base_specialdefense || 80);

    let dmg = Math.floor((((2 * level / 5 + 2) * basePower * atk / def) / 50) + 2);
    dmg = Math.floor(dmg * stab * typeMod);

    // Критический удар (6.25%)
    if (Math.random() < 0.0625) dmg = Math.floor(dmg * 1.5);

    // Синергия партии
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

// ====================== MEGA + Z-MOVE ======================
let megaUsed = false;
let zMoveUsed = false;

function tryMegaEvolve(user) {
    if (megaUsed) return false;
    megaUsed = true;
    user.name = (user.ru || user.name) + " Mega";
    addLog(`🔥 MEGA ЭВОЛЮЦИЯ! ${user.name}`);
    return true;
}

function tryZMove(user, move) {
    if (zMoveUsed) return move;
    zMoveUsed = true;
    const zPower = Math.floor((move.base_power || 40) * 1.5);
    addLog(`✨ Z-MOVE АКТИВИРОВАН!`);
    return { ...move, base_power: zPower };
}

// ====================== EXP + ЛЕВЕЛИНГ + ЭВОЛЮЦИЯ ======================
function giveExp(winner, loser) {
    const baseExp = 35 + Math.floor(loser.level || 50) * 2;
    const expGain = Math.floor(baseExp * (1 + getNEXUSMultiplier(currentBattle?.party || []) - 1));
    winner.exp = (winner.exp || 0) + expGain;
    addLog(`✨ +${expGain} EXP`);

    const expToNext = winner.level * 25 + 50;
    if (winner.exp >= expToNext) {
        winner.level++;
        winner.exp = 0;
        winner.hp = Math.floor(winner.hp * 1.12);
        winner.maxhp = winner.hp;
        winner.attack = Math.floor((winner.attack || 80) * 1.08);
        winner.specialattack = Math.floor((winner.specialattack || 80) * 1.08);
        addLog(`🎉 ${winner.ru || winner.name} → уровень ${winner.level}!`);

        if (winner.level >= 16 && winner.evolution) {
            const evolved = { ...winner, ...winner.evolution };
            addLog(`🌟 ЭВОЛЮЦИЯ! ${winner.ru || winner.name} → ${evolved.ru}`);
            Object.assign(winner, evolved);
        }
    }
}

// ====================== ПРЕДМЕТЫ ======================
let inventory = JSON.parse(localStorage.getItem('inventory')) || { pokeball: 5, potion: 3 };

function useItem(itemType) {
    if (!currentBattle) return;

    if (itemType === 'potion' && inventory.potion > 0) {
        inventory.potion--;
        currentBattle.player.hp = Math.min(currentBattle.player.maxhp, currentBattle.player.hp + 60);
        addLog(`🧪 Использовано ЗЕЛЬЕ (+60 HP)`);
        updateHPBars();
        saveInventory();
    }

    if (itemType === 'pokeball' && inventory.pokeball > 0) {
        inventory.pokeball--;
        addLog(`🎣 БРОСАЕМ ПОКЕБОЛ...`);
        saveInventory();

        const catchRate = Math.random();
        const hpPercent = currentBattle.enemy.hp / currentBattle.enemy.maxhp;

        if (catchRate > hpPercent * 0.7) {
            addLog(`🎉 ${currentBattle.enemy.ru || currentBattle.enemy.name} пойман!`);
            if (window.myHeroes) window.myHeroes.unshift(currentBattle.enemy);
            if (window.saveMyHeroes) window.saveMyHeroes();
            setTimeout(() => endBattle(true), 800);
        } else {
            addLog(`❌ Покебол не сработал...`);
        }
    }
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// ====================== AI ======================
function enemyAI() {
    const { enemy, player } = currentBattle;
    let move = { 
        base_power: 60, 
        type: enemy.types ? enemy.types[0] : 'Normal', 
        category: 'Physical' 
    };

    if (Math.random() < 0.35 && !player.status) {
        move = { base_power: 0, category: 'Status', status: Math.random() > 0.5 ? 'par' : 'psn' };
    } else if (Math.random() < 0.4) {
        move = { 
            base_power: 90, 
            type: enemy.types ? enemy.types[0] : 'Normal', 
            category: 'Special' 
        };
    }

    const dmg = calculateDamage(enemy, player, move);
    player.hp = Math.max(0, player.hp - dmg);
    addLog(`💥 ${enemy.ru || enemy.name} использует ${move.category === 'Status' ? 'СТАТУС' : 'АТАКУ'}! (-${dmg} HP)`);
    if (move.status) applyStatus(player, move.status);
}

// ====================== БОЙ ======================
function startBattle(playerHero, enemyHero, party = []) {
    currentBattle = {
        player: JSON.parse(JSON.stringify(playerHero)),
        enemy: JSON.parse(JSON.stringify(enemyHero)),
        party: party.length ? party : [playerHero],
        turn: 0,
        ended: false
    };

    // Устанавливаем базовые HP и статы, если их нет
    currentBattle.player.hp = currentBattle.player.hp || currentBattle.player.maxhp || 120;
    currentBattle.player.maxhp = currentBattle.player.maxhp || currentBattle.player.hp;
    currentBattle.enemy.hp = currentBattle.enemy.hp || currentBattle.enemy.maxhp || 120;
    currentBattle.enemy.maxhp = currentBattle.enemy.maxhp || currentBattle.enemy.hp;

    megaUsed = false;
    zMoveUsed = false;
    battleLog = [];

    addLog(`🌑 БИТВА НАЧАЛАСЬ! ${playerHero.ru || playerHero.name} vs ${enemyHero.ru || enemyHero.name}`);
    if (typeof showBattleScreen === 'function') showBattleScreen();
    updateHPBars();
}

function battleAction(actionType) {
    if (!currentBattle || currentBattle.ended) return;
    const { player, enemy } = currentBattle;

    if (actionType === 'potion' || actionType === 'pokeball') {
        useItem(actionType);
        setTimeout(enemyTurn, 400);
        return;
    }

    let move = actionType === 'attack' 
        ? { base_power: 60, type: player.types ? player.types[0] : 'Normal', category: 'Physical' }
        : { base_power: 95, type: player.types ? player.types[0] : 'Normal', category: 'Special' };

    if (actionType === 'mega' && tryMegaEvolve(player)) return battleAction('attack');
    if (actionType === 'zmove') move = tryZMove(player, move);

    const dmg = calculateDamage(player, enemy, move);
    enemy.hp = Math.max(0, enemy.hp - dmg);
    addLog(`📌 ${player.ru || player.name} → ${actionType.toUpperCase()}! (-${dmg} HP)`);

    const sprite = document.getElementById('enemy-sprite');
    if (sprite) {
        sprite.classList.add('shake');
        setTimeout(() => sprite.classList.remove('shake'), 420);
    }

    updateHPBars();
    if (enemy.hp <= 0) {
        addLog(`🎉 ПОБЕДА!`);
        giveExp(player, enemy);
        setTimeout(() => endBattle(true), 900);
        return;
    }

    setTimeout(enemyTurn, 650);
}

function enemyTurn() {
    if (!currentBattle) return;
    enemyAI();
    updateHPBars();
    processStatusDamage(currentBattle.player);
    if (currentBattle.player.hp <= 0) endBattle(false);
}

function endBattle(win) {
    currentBattle.ended = true;
    if (win) addLog(`🌟 NEXUS BURST ПОБЕДИЛ!`);
    else addLog(`🌑 Тьма победила...`);

    if (window.saveMyHeroes) window.saveMyHeroes();
    if (typeof closeBattleScreen === 'function') setTimeout(closeBattleScreen, 1800);
    currentBattle = null;
}

// ====================== ЗАПУСК ======================
async function initBattleSystem() {
    // Ждём загрузки данных из data-loader.js
    if (!window.typechartData || Object.keys(window.typechartData).length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    typechartData = window.typechartData || {};
    movesData = window.movesData || {};

    console.log('%c🚀 BATTLE v2.5 — JSON данные загружены успешно', 'color:#C084FC; font-weight:bold');
    
    window.startBattle = startBattle;
    window.battleAction = battleAction;
    window.endBattle = endBattle;
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initBattleSystem);
}

console.log('%c✅ battle.js v2.5 готов (работает с JSON)', 'color:#C084FC; font-size:16px');
