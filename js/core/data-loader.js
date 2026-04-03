// ====================== LUNADEx.JS — v2.6 ИСПРАВЛЕННЫЙ ======================

let myHeroes = JSON.parse(localStorage.getItem('myHeroes')) || [];
let currentParty = JSON.parse(localStorage.getItem('currentParty')) || [];

// Получаем данные из data-loader
function getDataForWorld(worldKey) {
    if (worldKey === 'pokemon') return window.pokedexData || [];
    if (worldKey === 'smeshariki') return window.smesharikiData || [];
    if (worldKey === 'darkmoon') return window.darkmoonData || [];
    return [];
}

function saveMyHeroes() {
    localStorage.setItem('myHeroes', JSON.stringify(myHeroes));
    localStorage.setItem('currentParty', JSON.stringify(currentParty));
}

function showLunadexSection(section) {
    const content = document.getElementById('lunadex-content');
    if (!content) return;
    content.innerHTML = '';

    if (section === 'lunadex') {
        content.innerHTML = `
            <h2 style="color:#C084FC; text-align:center; margin:20px 0;">🌑 ЛУННАЯ БАЗА ДАННЫХ</h2>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:15px; padding:15px;">
                <div onclick="selectWorld('pokemon')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:20px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🌲</div>
                    <h3>Мир Покемонов</h3>
                    <p>1–2 поколение</p>
                </div>
                <div onclick="selectWorld('smeshariki')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:20px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🦔</div>
                    <h3>Мир Смешариков</h3>
                    <p>Тоон-мир</p>
                </div>
                <div onclick="selectWorld('darkmoon')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:20px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🌑</div>
                    <h3>Бездна Dark Moon</h3>
                    <p>Хаос и тьма</p>
                </div>
            </div>
        `;
    }
}

function selectWorld(worldKey) {
    const content = document.getElementById('lunadex-content');
    const data = getDataForWorld(worldKey);

    if (!data || data.length === 0) {
        content.innerHTML = `<p style="color:#ff4444; text-align:center; padding:40px;">Данные ещё не загрузились.<br>Перезагрузи страницу.</p>`;
        return;
    }

    let html = `<h2 style="color:#C084FC; text-align:center; margin:20px 0;">Выбран мир: ${worldKey.toUpperCase()}</h2>
                <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:12px; padding:15px;">`;

    data.forEach(hero => {
        html += `
            <div onclick="showHeroDetail('${hero.num || hero.id}', '${worldKey}')" 
                 style="background:#1a0033; border:2px solid #C084FC; border-radius:12px; padding:8px; text-align:center; cursor:pointer;">
                <img src="${hero.sprite}" style="width:80px;height:80px; image-rendering:pixelated;">
                <div style="font-size:13px; margin-top:6px;">#${hero.num} ${hero.ru || hero.name}</div>
                <div style="font-size:11px; color:#C084FC;">${(hero.types || []).join('/')}</div>
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
                <p><strong>Тип:</strong> ${(hero.types || []).join('/')}</p>
                <p><strong>HP:</strong> ${hero.hp || 100}</p>
                
                <div style="display:flex; gap:10px; margin:25px 0;">
                    <button onclick="startBattleFromLunadex('${hero.num}', '${worldKey}'); this.closest('.modal').remove();" 
                            style="flex:1; padding:14px; background:#C084FC; color:#0a001f; border:none; border-radius:12px; font-weight:bold;">
                        ⚔️ СРАЗИТЬСЯ
                    </button>
                    <button onclick="catchHeroFromLunadexDirect('${hero.num}', '${worldKey}'); this.closest('.modal').remove();" 
                            style="flex:1; padding:14px; background:#4B0082; color:white; border:none; border-radius:12px; font-weight:bold;">
                        🎣 ПОЙМАТЬ
                    </button>
                </div>
                
                <button onclick="this.closest('.modal').remove()" style="width:100%; padding:12px; background:#333; color:#C084FC; border:none; border-radius:12px;">
                    Закрыть
                </button>
            </div>
        </div>`;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
}

function startBattleFromLunadex(heroId, worldKey) {
    const data = getDataForWorld(worldKey);
    const enemyHero = data.find(h => h.num === heroId);
    if (!enemyHero) return;

    const playerHero = currentParty[0] || myHeroes[0] || { ru: "Пикачу", types: ["Electric"], hp: 120, maxhp: 120 };
    if (typeof startBattle === 'function') startBattle(playerHero, enemyHero, currentParty);
}

function catchHeroFromLunadexDirect(heroId, worldKey) {
    const data = getDataForWorld(worldKey);
    const newHero = data.find(h => h.num === heroId);
    if (!newHero) return;

    myHeroes.unshift(newHero);
    if (myHeroes.length > 30) myHeroes.pop();
    saveMyHeroes();
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initLunadex() {
    console.log('%c🌑 Lunadex v2.6 загружен', 'color:#C084FC');
}

if (typeof window !== 'undefined') window.addEventListener('load', initLunadex);

window.showLunadexSection = showLunadexSection;
window.selectWorld = selectWorld;
window.showHeroDetail = showHeroDetail;
window.startBattleFromLunadex = startBattleFromLunadex;
window.catchHeroFromLunadexDirect = catchHeroFromLunadexDirect;
window.saveMyHeroes = saveMyHeroes;
