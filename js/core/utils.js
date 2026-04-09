// js/core/utils.js
// Общие утилиты и вспомогательные функции для всей игры

// Получить эффективность типа (typechart)
function getTypeEffectiveness(moveType, targetTypes) {
  if (!window.typeChartData) return 1;

  let multiplier = 1;

  targetTypes.forEach(targetType => {
    const chart = window.typeChartData[targetType];
    if (chart && chart.damage_taken && chart.damage_taken[moveType] !== undefined) {
      multiplier *= chart.damage_taken[moveType];
    }
  });

  return multiplier;
}

// Случайное число в диапазоне
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Случайный элемент из массива
function randomElement(array) {
  return array[random(0, array.length - 1)];
}

// Клонирование объекта (глубокое)
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Проверка, жив ли покемон
function isAlive(pokemon) {
  return pokemon && pokemon.hp > 0;
}

// Вычисление урона (упрощённая, но рабочая формула)
function calculateDamage(attacker, defender, move) {
  const basePower = move.base_power || 60;
  const attackStat = attacker.atk || attacker.baseStats?.atk || 50;
  const defenseStat = defender.def || defender.baseStats?.def || 50;

  let damage = Math.floor(((2 * 5 / 5 + 2) * basePower * attackStat / defenseStat) / 50 + 2);

  // Случайный разброс 85-100%
  damage = Math.floor(damage * (random(85, 100) / 100));

  // Учёт типа
  const effectiveness = getTypeEffectiveness(move.type || "Normal", defender.types || ["Normal"]);
  damage = Math.floor(damage * effectiveness);

  return Math.max(1, damage);
}

// Форматирование номера покемона (#001)
function formatNumber(num) {
  return '#' + String(num || 0).padStart(3, '0');
}

// Логирование в консоль + уведомление
function logGame(message) {
  console.log(`[GAME] ${message}`);
  if (window.showNotification) {
    window.showNotification(message, 'info', 2000);
  }
}

// Глобальные функции
window.getTypeEffectiveness = getTypeEffectiveness;
window.random = random;
window.randomElement = randomElement;
window.deepClone = deepClone;
window.isAlive = isAlive;
window.calculateDamage = calculateDamage;
window.formatNumber = formatNumber;
window.logGame = logGame;

console.log('🛠️ utils.js загружен');
