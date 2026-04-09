// js/core/data-loader.js
// Загружает все JSON-файлы из data/ и делает их доступными глобально

let pokedexData = {};
let movesData = {};
let typeChartData = {};
let abilitiesData = {};
let itemsData = {};
let smesharikiData = [];
let darkmoonData = [];

async function loadAllGameData() {
  try {
    const [
      pokedexRes,
      movesRes,
      typechartRes,
      abilitiesRes,
      itemsRes,
      smesharikiRes,
      darkmoonRes
    ] = await Promise.all([
      fetch('data/pokedex.json'),
      fetch('data/moves.json'),
      fetch('data/typechart.json'),
      fetch('data/abilities.json'),
      fetch('data/items.json'),
      fetch('data/smeshariki.json'),
      fetch('data/darkmoon.json')
    ]);

    pokedexData = await pokedexRes.json();
    movesData = await movesRes.json();
    typeChartData = await typechartRes.json();
    abilitiesData = await abilitiesRes.json();
    itemsData = await itemsRes.json();
    smesharikiData = (await smesharikiRes.json()).smeshariki || [];
    darkmoonData = (await darkmoonRes.json()).darkmoon || [];

    console.log('✅ Все данные успешно загружены!');
    return true;
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    return false;
  }
}

// Экспортируем для других файлов
window.loadAllGameData = loadAllGameData;
window.pokedexData = pokedexData;
window.movesData = movesData;
window.typeChartData = typeChartData;
window.abilitiesData = abilitiesData;
window.itemsData = itemsData;
window.smesharikiData = smesharikiData;
window.darkmoonData = darkmoonData;
