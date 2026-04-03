// ====================== LUNADEx.JS — ИСПРАВЛЕННЫЙ ======================

let myHeroes = JSON.parse(localStorage.getItem('myHeroes')) || [];
let currentParty = JSON.parse(localStorage.getItem('currentParty')) || [];

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
                </div>
                <div onclick="selectWorld('smeshariki')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:20px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🦔</div>
                    <h3>Мир Смешариков</h3>
                </div>
                <div onclick="selectWorld('darkmoon')" style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:20px; text-align:center; cursor:pointer;">
                    <div style="font-size:42px;">🌑</div>
                    <h3>Бездна Dark Moon</h3>
                </div>
            </div>
        `;
    }
}

function selectWorld(worldKey) {
    const content = document.getElementById('lunadex-content');

    if (!window.dataLoaded) {
        content.innerHTML = `<p style="color:#ff4444; text-align:center; padding:60px 20px;">Данные ещё загружаются...<br>Подожди 2 секунды и попробуй снова.</p>`;
        return;
    }

    const data = getDataForWorld(worldKey);
    let html = `<h2 style="color:#C084FC; text-align:center;">Мир: ${worldKey.toUpperCase()}</h2><div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:12px; padding:15px;">`;

    data.forEach(hero => {
        html += `
            <div onclick="showHeroDetail('${hero.num}', '${worldKey}')" style="background:#1a0033; border:2px solid #C084FC; border-radius:12px; padding:8px; text-align:center; cursor:pointer;">
                <img src="${hero.sprite}" style="width:80px;height:80px;">
                <div style="font-size:13px; margin-top:6px;">${hero.ru}</div>
            </div>`;
    });

    html += `</div>`;
    content.innerHTML = html;
}

function showHeroDetail(id, worldKey) {
    const data = getDataForWorld(worldKey);
    const hero = data.find(h => h.num === id);
    if (!hero) return;

    const modalHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,0,31,0.95); z-index:9999; display:flex; align-items:center; justify-content:center;">
            <div style="background:#1a0033; border:3px solid #C084FC; border-radius:20px; width:92%; max-width:420px; padding:20px;">
                <h2>${hero.ru}</h2>
                <img src="${hero.sprite}" style="width:160px;height:160px; display:block; margin:0 auto 15px;">
                <div style="display:flex; gap:10px;">
                    <button onclick="startBattleFromLunadex('${hero.num}', '${worldKey}');this.closest('div[style*=\"z-index:9999\"]').remove()" style="flex:1;padding:14px;background:#C084FC;color:#0a001f;border:none;border-radius:12px;">⚔️ Сразиться</button>
                    <button onclick="catchHeroFromLunadexDirect('${hero.num}', '${worldKey}');this.closest('div[style*=\"z-index:9999\"]').remove()" style="flex:1;padding:14px;background:#4B0082;color:white;border:none;border-radius:12px;">🎣 Поймать</button>
                </div>
                <button onclick="this.closest('div[style*=\"z-index:9999\"]').remove()" style="width:100%;margin-top:15px;padding:12px;background:#333;color:#C084FC;border:none;border-radius:12px;">Закрыть</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function startBattleFromLunadex(heroId, worldKey) {
    const data = getDataForWorld(worldKey);
    const enemy = data.find(h => h.num === heroId);
    if (!enemy) return;
    const player = currentParty[0] || myHeroes[0];
    if (typeof startBattle === 'function') startBattle(player, enemy, currentParty);
}

function catchHeroFromLunadexDirect(heroId, worldKey) {
    const data = getDataForWorld(worldKey);
    const newHero = data.find(h => h.num === heroId);
    if (newHero) {
        myHeroes.unshift(newHero);
        saveMyHeroes();
    }
}

function initLunadex() {
    console.log('%c🌑 Lunadex готов', 'color:#C084FC');
}

window.showLunadexSection = showLunadexSection;
window.selectWorld = selectWorld;
window.showHeroDetail = showHeroDetail;
window.startBattleFromLunadex = startBattleFromLunadex;
window.catchHeroFromLunadexDirect = catchHeroFromLunadexDirect;

if (typeof window !== 'undefined') window.addEventListener('load', initLunadex);
