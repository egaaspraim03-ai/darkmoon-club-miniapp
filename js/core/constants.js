// js/core/constants.js
// Все глобальные константы игры в одном месте

const GAME_CONSTANTS = {
  // Основные настройки
  MAX_LEVEL: 100,
  START_MONEY: 3000,
  MAX_PARTY_SIZE: 6,

  // Бои
  BATTLE_CHANCE_ON_MOVE: 0.15,        // шанс боя при шаге в overworld
  MAX_PP: 30,                         // максимум PP у хода
  CRITICAL_HIT_CHANCE: 0.0625,        // 1/16

  // Экономика и предметы
  MONEY_PER_BATTLE_WIN: 250,
  MONEY_PER_BATTLE_LOSS: 100,

  // Overworld
  CHUNK_SIZE: 12,
  TILE_SIZE: 48,
  PLAYER_SPEED: 4,

  // Визуал
  TYPE_COLORS: {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Grass: '#78C850',
    Electric: '#F8D030',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC'
  },

  // Категории покемонов
  CATEGORIES: {
    POKEMON: 'pokemon',
    SMESHARIK: 'smesharik',
    DARKMOON: 'darkmoon'
  },

  // Сообщения
  MESSAGES: {
    BATTLE_START: 'Дикий покемон появился!',
    BATTLE_WIN: 'Победа! Ты получил',
    BATTLE_LOSE: 'Ты проиграл бой...',
    LEVEL_UP: 'покемон вырос до уровня',
    EVOLVE: 'покемон эволюционировал в'
  }
};

// Удобные короткие экспорты
const C = GAME_CONSTANTS;

// Глобальные константы
window.GAME_CONSTANTS = GAME_CONSTANTS;
window.C = C;

console.log('📌 constants.js загружен — все константы готовы');
