// ====================== js/core/data-loader.js ======================
// Загружает данные и присваивает покемонам стартовые мувы

async function loadAllData() {
    console.log('%c📥 Загрузка данных...', 'color:#C084FC; font-weight:bold');

    try {
        const [pokedexRes, movesRes, typechartRes] = await Promise.all([
            fetch('data/pokedex.json'),
            fetch('data/moves.json'),
            fetch('data/typechart.json')
        ]);

        window.rawPokedex = await pokedexRes.json();
        window.movesData = await movesRes.json();
        window.typechartData = await typechartRes.json();

        // Преобразуем в массив покемонов + даём 4 стартовых мува
        window.pokedexData = Object.keys(window.rawPokedex).map(key => {
            const p = window.rawPokedex[key];
            const stats = p.baseStats || {};

            // Берём первые 4 мува, которые подходят по типу (или любые)
            let starterMoves = Object.values(window.movesData)
                .filter(m => m.type && p.types && p.types.includes(m.type))
                .slice(0, 4);

            if (starterMoves.length < 4) {
                starterMoves = Object.values(window.movesData).slice(0, 4);
            }

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
                moves: starterMoves,
                currentPP: {}
            };
        });

        console.log(`%c✅ Загружено ${window.pokedexData.length} покемонов с мувами`, 'color:#C084FC; font-size:16px');

    } catch (e) {
        console.error('❌ Ошибка загрузки данных', e);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', loadAllData);
}
