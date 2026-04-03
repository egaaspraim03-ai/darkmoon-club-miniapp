// ====================== js/core/data-loader.js ======================
// Загружает все данные из data/ и подготавливает их для игры

async function loadAllData() {
    console.log('%c📥 Загрузка данных из data/...', 'color:#C084FC; font-weight:bold');

    try {
        // Загружаем основные файлы
        const [pokedexRes, movesRes, typechartRes] = await Promise.all([
            fetch('data/pokedex.json'),
            fetch('data/moves.json'),
            fetch('data/typechart.json')
        ]);

        window.rawPokedex = await pokedexRes.json();
        window.movesData = await movesRes.json();
        window.typechartData = await typechartRes.json();

        // Преобразуем pokedex в удобный массив
        window.pokedexData = Object.keys(window.rawPokedex).map(key => {
            const p = window.rawPokedex[key];
            const stats = p.baseStats || {};

            return {
                num: String(p.num).padStart(4, '0'),
                ru: p.species || key,
                en: p.species || key,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png`,
                types: p.types || ['Normal'],
                hp: stats.hp || 60,
                maxhp: stats.hp || 60,
                attack: stats.atk || 60,
                defense: stats.def || 60,
                specialattack: stats.spa || 60,
                specialdefense: stats.spd || 60,
                speed: stats.spe || 60,
                level: 10,
                exp: 0,
                moves: [], // пока пусто, заполним позже
                currentPP: {}
            };
        });

        console.log(`%c✅ Загружено: ${window.pokedexData.length} покемонов, ${Object.keys(window.movesData).length} мувов`, 'color:#C084FC; font-size:16px');

    } catch (e) {
        console.error('❌ Ошибка загрузки данных', e);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', loadAllData);
}
