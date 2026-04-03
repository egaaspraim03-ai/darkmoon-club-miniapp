// ====================== js/core/data-loader.js ======================
// Загружает все JSON из папки data/ и делает их доступными глобально

async function loadAllData() {
    console.log('%c📥 Загрузка данных из data/...', 'color:#C084FC; font-weight:bold');

    const files = {
        pokedexData: 'data/pokedex.json',
        movesData: 'data/moves.json',
        typechartData: 'data/typechart.json',
        abilitiesData: 'data/abilities.json',
        itemsData: 'data/items.json'
    };

    for (const [key, path] of Object.entries(files)) {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            window[key] = await res.json();
            console.log(`✅ ${key} загружен (${Array.isArray(window[key]) ? window[key].length : Object.keys(window[key]).length} записей)`);
        } catch (e) {
            console.error(`❌ Не удалось загрузить ${path}`, e);
            window[key] = {};
        }
    }

    // Совместимость со старым кодом
    window.pokedexData = window.pokedexData || [];
    window.johtoData = window.pokedexData.filter(p => parseInt(p.num) >= 152); // если нужно
    window.smesharikiData = window.smesharikiData || []; // добавим позже
    window.darkmoonData = window.darkmoonData || [];
    window.typechartData = window.typechartData || {};
    window.movesData = window.movesData || {};

    console.log('%c🚀 Все данные загружены и готовы!', 'color:#C084FC; font-size:16px');
    return true;
}

// Автозагрузка при старте
if (typeof window !== 'undefined') {
    window.addEventListener('load', loadAllData);
}
