// ====================== MAIN.JS — ФИНАЛЬНАЯ ВЕРСИЯ ======================
let currentParty = [];

async function loadAllData() {
    try {
        const res = await fetch('data/pokedex.json');
        window.pokedexData = await res.json();
        console.log('%c📦 Данные загружены', 'color:#C084FC');
    } catch (e) {
        console.error('Ошибка загрузки данных', e);
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    const container = document.getElementById(tab + '-container');
    if (container) container.style.display = 'block';

    if (tab === 'game' && typeof initOverworld === 'function') {
        initOverworld();
    }
}

async function initApp() {
    await loadAllData();

    // Пример стартовой партии
    currentParty = [
        { ru: "Нардуак", level: 69, hp: 190, maxhp: 190, types: ["Dark", "Fairy"] }
    ];
    window.currentParty = currentParty;

    switchTab('game');
    console.log('%c🚀 NÉXUS • DARK MOON запущен', 'color:#C084FC; font-weight:bold');
}

window.switchTab = switchTab;
window.onload = initApp;
