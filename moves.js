// ====================== moves.js ======================
const movesData = {
  tackle: { base_power: 40, type: "Normal", category: "Physical", name: "Толчок" },
  growl: { base_power: 0, type: "Normal", category: "Status", name: "Рык" },
  vine_whip: { base_power: 45, type: "Grass", category: "Physical", name: "Плеть лозы" },
  ember: { base_power: 40, type: "Fire", category: "Special", name: "Уголь" },
  water_gun: { base_power: 40, type: "Water", category: "Special", name: "Водяной пистолет" },
  thunder_shock: { base_power: 40, type: "Electric", category: "Special", name: "Электрошок" },
  quick_attack: { base_power: 40, type: "Normal", category: "Physical", name: "Быстрая атака" },
  // Добавь больше по желанию — сейчас достаточно для теста
};

console.log(`✅ moves.js загружен — ${Object.keys(movesData).length} приёмов`);
