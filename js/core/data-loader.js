// ====================== js/core/data-loader.js ======================
// NĒXUS • DARK MOON — ЗАГРУЗКА JSON + СТАРТОВЫЕ МУВЫ

async function loadAllData() {
    console.log('%c📥 Загрузка данных из data/...', 'color:#C084FC; font-weight:bold');

    const files = {
        rawPokedex: 'data/pokedex.json',
        movesData: 'data/moves.json',
        typechartData: 'data/typechart.json'
    };

    for (const [key, path] of Object.entries(files)) {
        try {
            const res = await fetch(path);
            window[key] = await res.json();
            console.log(`✅ ${key} загружен`);
        } catch (e) {
            console.error(`❌ ${path}`, e);
        }
    }

    // Преобразуем pokedex в массив + добавляем статы и 4 стартовых мува
    window.pokedexData = Object.keys(window.rawPokedex).map(key => {
        const p = window.rawPokedex[key];
        const stats = p.baseStats || {};

        // Выбираем 4 стартовых мува (2 физ/спец + 1-2 статусных по типу)
        const pokemonTypes = p.types || ['Normal'];
        const starterMoves = Object.values(window.movesData || {})
            .filter(m => pokemonTypes.includes(m.type) && m.base_power !== undefined)
            .slice(0, 4);

        return {
            num: String(p.num).padStart(4, '0'),
            ru: p.species || key,
            en: p.species || key,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png`,
            types: pokemonTypes,
            hp: stats.hp || 60,
            maxhp: stats.hp || 60,
            attack: stats.atk || 60,
            defense: stats.def || 60,
            specialattack: stats.spa || 60,
            specialdefense: stats.spd || 60,
            speed: stats.spe || 60,
            level: 10,
            exp: 0,
            moves: starterMoves.length ? starterMoves : Object.values(window.movesData || {}).slice(0, 4), // fallback
            currentPP: {}, // будет заполнено ниже
            evolution: p.evos ? { ru: p.evos[0] } : null
        };
    });

    window.movesData = window.movesData || {};
    window.typechartData = window.typechartData || {};

    console.log(`%c🚀 Данные готовы! ${window.pokedexData.length} покемонов с 4 мувами`, 'color:#C084FC; font-size:16px');
    return true;
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', loadAllData);
}
