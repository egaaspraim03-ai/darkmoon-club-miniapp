// ====================== MAIN.JS — ФИНАЛЬНАЯ ВЕРСИЯ (ФАЗА 6) ======================
// Центральный файл: загрузка данных, переключение вкладок, инициализация всех систем.
// Чистый, стабильный, без глобального мусора.

let currentParty = [];
let pokedexData = [];
let movesData = [];

// ====================== ЗАГРУЗКА ДАННЫХ ======================
async function loadAllData() {
    try {
        const [pokedexRes, movesRes] = await Promise.all([
            fetch('data/pokedex.json'),
            fetch('data/moves.json')
        ]);

        pokedexData = await pokedexRes.json();
        movesData = await movesRes.json();

        window.pokedexData = pokedexData;
        window.movesData = movesData;

        console.log('%c📦 Все данные загружены успешно (Фаза 6)', 'color:#C084FC; font-weight:bold');
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
}

// ====================== УПРАВЛЕНИЕ ВКЛАДКАМИ ======================
function switchTab(tab) {
    // Скрываем все контейнеры
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');

    const container = document.getElementById(tab + '-container');
    if (container) container.style.display = 'block';

    // Очистка предыдущих систем
    if (typeof destroyOverworld === 'function') destroyOverworld();

    // Запуск нужной системы
    if (tab === 'game') {
        if (typeof initOverworld === 'function') initOverworld();
    } else if (tab === 'battle') {
        // battle запускается только через startBattle
    } else if (tab === 'lunadex') {
        if (typeof renderLunadex === 'function') renderLunadex();
    }
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
async function initApp() {
    await loadAllData();

    // Пример стартовой партии (можно потом сохранить в localStorage)
    currentParty = [
        { ru: "Нардуак", level: 69, hp: 190, maxhp: 190, types: ["Dark", "Fairy"], moves: [
            { name: "Тёмный удар", pp: 15, maxpp: 15 },
            { name: "Лунный луч", pp: 10, maxpp: 10 },
            { name: "Психический", pp: 12, maxpp: 12 },
            { name: "Защита", pp: 20, maxpp: 20 }
        ] }
    ];
    window.currentParty = currentParty;

    // Стартовое переключение на overworld
    switchTab('game');

    console.log('%c🚀 NÉXUS • DARK MOON запущен и готов к релизу (Фаза 6)', 'color:#C084FC; font-weight:bold');
}

// ====================== ГЛОБАЛЬНЫЕ ЭКСПОРТЫ ======================
window.switchTab = switchTab;
window.startBattle = startBattle; // из battle.js
window.currentParty = currentParty;

// Автозапуск
window.onload = initApp;
