// ====================== LUNADEx.JS — v2.5 JSON VERSION ======================
// Полная интеграция с battle + party + catch + данные из data/pokedex.json

let myHeroes = JSON.parse(localStorage.getItem('myHeroes')) || [];
let currentParty = JSON.parse(localStorage.getItem('currentParty')) || [];

// ====================== ПОЛУЧЕНИЕ ДАННЫХ ИЗ JSON ======================
function getDataForWorld(worldKey) {
    if (worldKey === 'pokemon') return window.pokedexData || [];
    if (worldKey === 'smeshariki') return window.smesharikiData || [];   // пока пусто — добавим позже
    if (worldKey === 'darkmoon') return window.darkmoonData || [];       // пока пусто
    return [];
}

// ====================== СОХРАНЕНИЕ ======================
function saveMyHeroes() {
    localStorage.setItem('myHeroes', JSON.stringify(myHeroes));
    localStorage.setItem('currentParty', JSON.stringify(currentParty));
    renderPartyWithSynergy();
}

// ====================== ОСНОВНЫЕ ЭКРАНЫ ======================
function showLunadexSection(section) {
    const content = document.getElementById('lunadex-content');
    if (!content) return;
    content.innerHTML = '';

    if (section === 'lunadex') {
        content.innerHTML = `
            <h2 style="color:#C084FC; text-align:center; margin:20px 0;">🌑 ЛУННАЯ БАЗА ДАННЫХ</h2>
            <div class="world-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:15px; padding:15px;">
                <div class="world-card" onclick="selectWorld('pokemon')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:15px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🌲</div>
                    <h3>Мир Покемонов</h3>
                    <p>1–2 поколение</p>
                </div>
                <div class="world-card" onclick="selectWorld('smeshariki')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:15px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🦔</div>
                    <h3>Мир Смешариков</h3>
                    <p>Тоон-мир</p>
                </div>
                <div class="world-card" onclick="selectWorld('darkmoon')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:15px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🌑</div>
                    <h3>Бездна Dark Moon</h3>
                    <p>Хаос и тьма</p>
                </div>
            </div>
        `;
    } else if (section === 'myheroes') {
        renderMyHeroes(content);
    } else if (section === 'party') {
        renderParty(content);
    }
}

function selectWorld(worldKey) {
    const content = document.getElementById('lunadex-content');
    const data = getDataForWorld(worldKey);

    let html = `<h2 style="color:#C084FC; text-align:center;">Выбран мир: ${worldKey.toUpperCase()}</h2>
                <div class="pokedex-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:12px; padding:15px;">`;

    data.forEach(hero => {
        const types = hero.types ? hero.types.join('/') : (hero.type || '???');
        html += `
            <div class="hero-card" onclick="showHeroDetail('${hero.num || hero.id}', '${worldKey}')" 
                 style="background:#1a0033; border:2px solid #C084FC; border-radius:12px; padding:8px; text-align:center; cursor:pointer;">
                <img src="${hero.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                <div style="font-size:13px; margin-top:6px;">#${hero.num || hero.id} ${hero.ru || hero.name}</div>
                <div style="font-size:11px; color:#C084FC;">${types}</div>
            </div>`;
    });

    html += `</div>`;
    content.innerHTML = html;
}

function showHeroDetail(id, worldKey) {
    const data = getDataForWorld(worldKey);
    const hero = data.find(h => (h.num || h.id) === id);
    if (!hero) return;

    const modalHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,0,31,0.95); z-index:9999; display:flex; align-items:center; justify-content:center;">
            <div style="background:#1a0033; border:3px solid #C084FC; border-radius:20px; width:92%; max-width:420px; padding:20px; color:white;">
                <h2>${hero.ru || hero.name}</h2>
                <img src="${hero.sprite}" style="width:160px; height:160px; image-rendering:pixelated; display:block; margin:0 auto 15px;">
                <p><strong>Тип:</strong> ${hero.types ? hero.types.join('/') : hero.type || '???'}</p>
                <p><strong>HP:</strong> ${hero.hp || hero.stats?.hp || 100}</p>
                
                <div style="display:flex; gap:10px; margin:25px 0;">
                    <button onclick="startBattleFromLunadex('${hero.num || hero.id}', '${worldKey}'); this.parentElement.parentElement.parentElement.remove();" 
                            style="flex:1; padding:14px; background:#C084FC; color:#0a001f; border:none; border-radius:12px; font-weight:bold;">
                        ⚔️ СРАЗИТЬСЯ
                    </button>
                    <button onclick="catchHeroFromLunadexDirect('${hero.num || hero.id}', '${worldKey}'); this.parentElement.parentElement.parentElement.remove();" 
                            style="flex:1; padding:14px; background:#4B0082; color:white; border:none; border-radius:12px; font-weight:bold;">
                        🎣 ПОЙМАТЬ
                    </button>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="width:100%; padding:12px; background:#333; color:#C084FC; border:none; border-radius:12px;">
                    Закрыть
                </button>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ====================== БОЙ ИЗ LUNADEx ======================
function startBattleFromLunadex(heroId, worldKey) {
    const data = getDataForWorld(worldKey);
    const enemyHero = data.find(h => (h.num || h.id) === heroId);
    if (!enemyHero) return;

    const playerHero = currentParty[0] || myHeroes[0] || { ru: "Пикачу", types: ["Electric"], hp: 120, maxhp: 120, attack: 80 };

    if (typeof startBattle === 'function') {
        startBattle(playerHero, enemyHero, currentParty);
    }
}

function catchHeroFromLunadexDirect(heroId, worldKey) {
    const data = getDataForWorld(worldKey);
    const newHero = data.find(h => (h.num || h.id) === heroId);
    if (!newHero) return;

    myHeroes.unshift(newHero);
    if (myHeroes.length > 30) myHeroes.pop();

    saveMyHeroes();
    addLog(`🎉 ${newHero.ru || newHero.name} пойман и добавлен в архив!`);
}

// ====================== ОТРИСОВКА ПАРТИИ ======================
function renderPartyWithSynergy() {
    const container = document.getElementById('party-container');
    if (!container) return;

    let html = `<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">`;
    currentParty.forEach(hero => {
        html += `
            <div style="background:#1a0033; border:2px solid #C084FC; border-radius:12px; padding:8px; width:88px; text-align:center;">
                <img src="${hero.sprite}" style="width:64px;height:64px;">
                <div style="font-size:12px;">${hero.ru || hero.name}</div>
                <div style="font-size:10px; color:#C084FC;">${hero.types ? hero.types[0] : hero.type}</div>
            </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderMyHeroes(content) {
    // Можно добавить позже, если нужно
    content.innerHTML = `<p style="text-align:center; color:#aaa;">Мои герои (${myHeroes.length}) — скоро будет полный список</p>`;
}

function renderParty(content) {
    content.innerHTML = `<div id="party-container"></div>`;
    renderPartyWithSynergy();
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initLunadex() {
    console.log('%c🌑 Lunadex v2.5 — полностью на JSON', 'color:#C084FC; font-weight:bold');
    renderPartyWithSynergy();
    setInterval(saveMyHeroes, 30000); // автосохранение
}

if (typeof window !== 'undefined') window.addEventListener('load', initLunadex);

// Экспорт для других файлов
window.saveMyHeroes = saveMyHeroes;
window.renderPartyWithSynergy = renderPartyWithSynergy;
window.catchHeroFromLunadex = catchHeroFromLunadexDirect;
window.startBattleFromLunadex = startBattleFromLunadex;
