// ====================== LUNADEx.JS — ИНТЕГРАЦИЯ С BATTLE v2.1 ======================
// NĒXUS • DARK MOON — Полная связь Lunadex + бой + партия + catch

let myHeroes = JSON.parse(localStorage.getItem('myHeroes')) || [];
let currentParty = JSON.parse(localStorage.getItem('currentParty')) || [];

// Сохраняем героев
function saveMyHeroes() {
    localStorage.setItem('myHeroes', JSON.stringify(myHeroes));
    localStorage.setItem('currentParty', JSON.stringify(currentParty));
    renderPartyWithSynergy();
}

// ====================== ОСНОВНЫЕ ФУНКЦИИ LUNADEx ======================
function showLunadexSection(section) {
    const content = document.getElementById('lunadex-content');
    if (!content) return;

    content.innerHTML = '';

    if (section === 'lunadex') {
        // Главный экран Лунной базы данных (как ты просил)
        content.innerHTML = `
            <h2 style="color:#C084FC; text-align:center; margin:20px 0;">🌑 ЛУННАЯ БАЗА ДАННЫХ</h2>
            <div class="world-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:15px; padding:15px;">
                <div class="world-card" onclick="selectWorld('pokemon')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:15px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🌲</div>
                    <h3>Мир Покемонов</h3>
                    <p>Классика 1-2 поколения</p>
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
    // другие секции по желанию...
}

function selectWorld(worldKey) {
    const content = document.getElementById('lunadex-content');
    let data = [];

    if (worldKey === 'pokemon') data = window.pokedexData || window.gameData?.universes?.pokemon || [];
    else if (worldKey === 'smeshariki') data = window.smesharikiData || [];
    else if (worldKey === 'darkmoon') data = window.darkmoonData || [];

    let html = `<h2 style="color:#C084FC;">Выбран мир: ${worldKey.toUpperCase()}</h2><div class="pokedex-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:12px; padding:15px;">`;

    data.forEach(hero => {
        html += `
            <div class="hero-card" onclick="showHeroDetail('${hero.num || hero.id}', '${worldKey}')" 
                 style="background:#1a0033; border:2px solid #C084FC; border-radius:12px; padding:8px; text-align:center; cursor:pointer;">
                <img src="${hero.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                <div style="font-size:13px; margin-top:6px;">#${hero.num || hero.id} ${hero.ru || hero.name}</div>
                <div style="font-size:11px; color:#C084FC;">${hero.type || hero.types ? hero.types[0] : '???'}</div>
            </div>`;
    });

    html += `</div>`;
    content.innerHTML = html;
}

function showHeroDetail(id, worldKey) {
    // Находим героя
    let hero = null;
    if (worldKey === 'pokemon') hero = (window.pokedexData || []).find(h => h.num === id);
    else if (worldKey === 'smeshariki') hero = (window.smesharikiData || []).find(h => h.id === id);
    else if (worldKey === 'darkmoon') hero = (window.darkmoonData || []).find(h => h.id === id);

    if (!hero) return;

    // Модальное окно с деталями + кнопка "Сразиться"
    const modalHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,0,31,0.95); z-index:9999; display:flex; align-items:center; justify-content:center;">
            <div style="background:#1a0033; border:3px solid #C084FC; border-radius:20px; width:92%; max-width:420px; padding:20px; color:white;">
                <h2>${hero.ru || hero.name}</h2>
                <img src="${hero.sprite}" style="width:160px; height:160px; image-rendering:pixelated; display:block; margin:0 auto 15px;">
                <p><strong>Тип:</strong> ${hero.types ? hero.types.join('/') : hero.type}</p>
                <p><strong>HP:</strong> ${hero.hp || hero.stats?.hp || 100}</p>
                
                <div style="display:flex; gap:10px; margin:25px 0;">
                    <button onclick="startBattleFromLunadex('${hero.num || hero.id}', '${worldKey}');" 
                            style="flex:1; padding:14px; background:#C084FC; color:#0a001f; border:none; border-radius:12px; font-weight:bold;">
                        ⚔️ СРАЗИТЬСЯ
                    </button>
                    <button onclick="catchHeroFromLunadexDirect('${hero.num || hero.id}', '${worldKey}');" 
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

// ====================== ЗАПУСК БОЯ ИЗ LUNADEx ======================
function startBattleFromLunadex(heroId, worldKey) {
    // Закрываем модалку
    const modal = document.querySelector('div[style*="z-index:9999"]');
    if (modal) modal.remove();

    // Находим героя для боя
    let enemyHero = null;
    if (worldKey === 'pokemon') enemyHero = (window.pokedexData || []).find(h => h.num === heroId);
    else if (worldKey === 'smeshariki') enemyHero = (window.smesharikiData || []).find(h => h.id === heroId);
    else if (worldKey === 'darkmoon') enemyHero = (window.darkmoonData || []).find(h => h.id === heroId);

    if (!enemyHero) return;

    // Берём первого из партии как игрока
    const playerHero = currentParty[0] || myHeroes[0] || { ru: "Пикачу", types: ["Electric"], hp: 120, maxhp: 120, attack: 80 };

    // Запускаем бой
    startBattle(playerHero, enemyHero, currentParty);
}

// ====================== ПОИМКА ======================
function catchHeroFromLunadexDirect(heroId, worldKey) {
    const modal = document.querySelector('div[style*="z-index:9999"]');
    if (modal) modal.remove();

    let newHero = null;
    if (worldKey === 'pokemon') newHero = (window.pokedexData || []).find(h => h.num === heroId);
    else if (worldKey === 'smeshariki') newHero = (window.smesharikiData || []).find(h => h.id === heroId);
    else if (worldKey === 'darkmoon') newHero = (window.darkmoonData || []).find(h => h.id === heroId);

    if (!newHero) return;

    myHeroes.unshift(newHero);
    if (myHeroes.length > 30) myHeroes.pop(); // лимит

    saveMyHeroes();
    addLog(`🎉 ${newHero.ru || newHero.name} пойман и добавлен в архив!`);
}

// ====================== ОТРИСОВКА ПАРТИИ ======================
function renderPartyWithSynergy() {
    const container = document.getElementById('party-container');
    if (!container) return;

    let html = `<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">`;
    currentParty.forEach((hero, i) => {
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

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initLunadex() {
    console.log('%c🌑 Lunadex полностью интегрирован с battle.js v2.1', 'color:#C084FC; font-weight:bold');
    renderPartyWithSynergy();
    // Автосохранение каждые 30 сек
    setInterval(saveMyHeroes, 30000);
}

if (typeof window !== 'undefined') window.addEventListener('load', initLunadex);

// Экспорт для battle.js
window.catchHeroFromLunadex = catchHeroFromLunadexDirect;
window.saveMyHeroes = saveMyHeroes;
window.renderPartyWithSynergy = renderPartyWithSynergy;
