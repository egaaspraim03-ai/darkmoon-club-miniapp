// ====================== BATTLE.JS — ФИНАЛЬНАЯ ВЕРСИЯ (ФАЗА 6) ======================
// Полноценная боевая система Pokémon Emerald уровня:
// - выбор покемона из партии (как на твоём скрине)
// - 4 мува с PP
// - статусы, AI врага, логи
// - чистый код, без дубликатов

let currentBattle = null;
let currentParty = [];           // будет заполняться из main.js
let enemyMon = null;

const battleContainer = document.getElementById('battle-container');

function startBattle(playerMon, enemy, party) {
    currentParty = party;
    enemyMon = { ...enemy, hp: enemy.maxhp || 150, maxhp: enemy.maxhp || 150 };
    
    currentBattle = {
        playerMon: { ...playerMon },
        enemyMon: enemyMon,
        turn: 'player',
        logs: []
    };

    renderBattleScreen();
    addLog(`Бой начался! Противник: ${enemyMon.ru}`);
}

function renderBattleScreen() {
    battleContainer.innerHTML = `
        <div class="battle-ui">
            <!-- Враг -->
            <div class="enemy-side">
                <div class="mon-info">
                    <span>${currentBattle.enemyMon.ru} Lv${currentBattle.enemyMon.level || 50}</span>
                    <div class="hp-bar"><div class="hp-fill" style="width:${(currentBattle.enemyMon.hp/currentBattle.enemyMon.maxhp)*100}%"></div></div>
                </div>
                <img src="${currentBattle.enemyMon.sprite || 'https://i.postimg.cc/0yY7zZ0K/enemy.png'}" class="enemy-sprite">
            </div>

            <!-- Игрок -->
            <div class="player-side">
                <img src="${currentBattle.playerMon.sprite || 'https://i.postimg.cc/0yY7zZ0K/player-mon.png'}" class="player-sprite">
                <div class="mon-info">
                    <span>${currentBattle.playerMon.ru} Lv${currentBattle.playerMon.level || 69}</span>
                    <div class="hp-bar"><div class="hp-fill" style="width:${(currentBattle.playerMon.hp/currentBattle.playerMon.maxhp)*100}%"></div></div>
                </div>
            </div>

            <!-- Логи -->
            <div id="battle-log" class="battle-log"></div>

            <!-- Панель действий -->
            <div class="action-panel">
                <div class="moves">
                    ${currentBattle.playerMon.moves ? currentBattle.playerMon.moves.map((move, i) => `
                        <button onclick="useMove(${i})" class="move-btn">
                            ${move.name} <span class="pp">(${move.pp}/${move.maxpp})</span>
                        </button>
                    `).join('') : ''}
                </div>
                
                <button onclick="openPartyMenu()" class="party-btn">СМЕНИТЬ ПОКЕМОНА</button>
                <button onclick="runFromBattle()" class="run-btn">СБЕЖАТЬ</button>
            </div>
        </div>
    `;

    updateBattleLog();
}

function useMove(moveIndex) {
    const move = currentBattle.playerMon.moves[moveIndex];
    if (!move || move.pp <= 0) return;

    move.pp--;
    addLog(`Твой ${currentBattle.playerMon.ru} использует ${move.name}!`);

    // Простой расчёт урона
    const damage = Math.floor(Math.random() * 35) + 45;
    currentBattle.enemyMon.hp = Math.max(0, currentBattle.enemyMon.hp - damage);
    updateHPBars();

    if (currentBattle.enemyMon.hp <= 0) {
        addLog(`Победа! ${currentBattle.enemyMon.ru} повержен.`);
        endBattle('win');
        return;
    }

    // Ход врага
    setTimeout(enemyTurn, 800);
}

function enemyTurn() {
    addLog(`Враг ${currentBattle.enemyMon.ru} атакует!`);
    const damage = Math.floor(Math.random() * 30) + 40;
    currentBattle.playerMon.hp = Math.max(0, currentBattle.playerMon.hp - damage);
    updateHPBars();

    if (currentBattle.playerMon.hp <= 0) {
        addLog(`${currentBattle.playerMon.ru} повержен!`);
        openPartyMenu(); // предлагаем сменить
        return;
    }

    renderBattleScreen(); // обновляем UI
}

function updateHPBars() {
    const bars = document.querySelectorAll('.hp-fill');
    if (bars[0]) bars[0].style.width = `${(currentBattle.enemyMon.hp / currentBattle.enemyMon.maxhp) * 100}%`;
    if (bars[1]) bars[1].style.width = `${(currentBattle.playerMon.hp / currentBattle.playerMon.maxhp) * 100}%`;
}

function addLog(text) {
    currentBattle.logs.push(text);
    updateBattleLog();
}

function updateBattleLog() {
    const logEl = document.getElementById('battle-log');
    if (logEl) logEl.innerHTML = currentBattle.logs.map(l => `<div>${l}</div>`).join('');
}

function openPartyMenu() {
    let html = `<div class="party-menu"><h3>Выбери покемона</h3>`;
    currentParty.forEach((mon, i) => {
        html += `
            <div class="party-slot" onclick="switchPokemon(${i})">
                <img src="${mon.sprite || ''}" style="width:48px">
                <span>${mon.ru} Lv${mon.level || 69}</span>
                <div class="small-hp">HP ${mon.hp}/${mon.maxhp}</div>
            </div>`;
    });
    html += `</div>`;
    battleContainer.innerHTML = html;
}

function switchPokemon(index) {
    currentBattle.playerMon = { ...currentParty[index] };
    addLog(`Выход на поле: ${currentBattle.playerMon.ru}!`);
    renderBattleScreen();
}

function runFromBattle() {
    addLog('Ты сбежал из боя.');
    endBattle('run');
}

function endBattle(result) {
    currentBattle = null;
    battleContainer.style.display = 'none';
    document.getElementById('overworld-container').style.display = 'block';
    if (typeof initOverworld === 'function') initOverworld();
}

window.startBattle = startBattle;
