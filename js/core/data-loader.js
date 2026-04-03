// ====================== js/core/data-loader.js ======================
// NĒXUS • DARK MOON — ЗАГРУЗКА JSON + ПРЕОБРАЗОВАНИЕ ДАННЫХ

async function loadAllData() {
    console.log('%c📥 Загрузка данных из data/ (pokedex.json + moves.json)', 'color:#C084FC; font-weight:bold');

    // 1. Загружаем все JSON
    const files = {
        rawPokedex: 'data/pokedex.json',
        movesData: 'data/moves.json',
        typechartData: 'data/typechart.json',
        abilitiesData: 'data/abilities.json',
        itemsData: 'data/items.json'
    };

    for (const [key, path] of Object.entries(files)) {
        try {
            const res = await fetch(path);
            window[key] = await res.json();
            console.log(`✅ ${key} загружен`);
        } catch (e) {
            console.error(`❌ ${path}`, e);
            window[key] = key === 'rawPokedex' ? {} : [];
        }
    }

    // 2. Преобразуем pokedex в удобный массив (как было раньше)
    window.pokedexData = Object.keys(window.rawPokedex).map(key => {
        const p = window.rawPokedex[key];
        return {
            num: String(p.num).padStart(4, '0'),
            ru: p.species || key,                    // пока английское имя (можно добавить ru позже)
            en: p.species || key,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png`,
            types: p.types || ['Normal'],
            hp: p.baseStats?.hp || 60,
            maxhp: p.baseStats?.hp || 60,
            attack: p.baseStats?.atk || 60,
            defense: p.baseStats?.def || 60,
            specialattack: p.baseStats?.spa || 60,
            specialdefense: p.baseStats?.spd || 60,
            speed: p.baseStats?.spe || 60,
            level: 10,
            exp: 0,
            evolution: p.evos ? { ru: p.evos[0] } : null,   // простая эволюция
            baseStats: p.baseStats
        };
    });

    // 3. Глобальные переменные для совместимости
    window.movesData = window.movesData || {};
    window.typechartData = window.typechartData || {};
    window.smesharikiData = window.smesharikiData || [];   // пока пусто
    window.darkmoonData = window.darkmoonData || [];

    console.log(`%c🚀 Данные готовы! ${window.pokedexData.length} покемонов с реальными статами`, 'color:#C084FC; font-size:16px');
    return true;
}

// Автозагрузка
if (typeof window !== 'undefined') {
    window.addEventListener('load', loadAllData);
}
