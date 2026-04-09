// js/core/save-system.js
// Система сохранений для Telegram Mini App

const SAVE_KEY = 'darkmoon_save_v1';

// Основные данные для сохранения
let saveData = {
  money: 3000,
  currentParty: [],
  inventory: [],
  unlockedZones: ['saffron-city'],
  pokedexSeen: [],           // номера увиденных покемонов
  pokedexCaught: [],         // номера пойманных покемонов
  playTime: 0,
  lastSaveTime: Date.now(),
  settings: {
    music: true,
    sound: true,
    language: 'ru'
  }
};

// Загрузка сохранения
function loadSave() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    saveData = { ...saveData, ...JSON.parse(saved) };
    console.log('💾 Сохранение загружено');
  }

  // Обновляем глобальные переменные
  window.currentParty = saveData.currentParty.length > 0 ? saveData.currentParty : window.currentParty || [];
  window.inventory = saveData.inventory.length > 0 ? saveData.inventory : window.inventory || [];

  return saveData;
}

// Сохранение
function saveGame() {
  saveData.currentParty = window.currentParty || [];
  saveData.inventory = window.inventory || [];
  saveData.lastSaveTime = Date.now();
  saveData.playTime += Math.floor((Date.now() - saveData.lastSaveTime) / 1000);

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  console.log('💾 Игра сохранена');
  
  if (window.showNotification) {
    window.showNotification('✅ Игра сохранена', 'success');
  }
}

// Автосохранение каждые 30 секунд
function startAutoSave() {
  setInterval(() => {
    if (window.currentParty) saveGame();
  }, 30000);
}

// Удалить сохранение (для отладки)
function deleteSave() {
  if (confirm('Удалить ВСЕ сохранения? Это действие нельзя отменить!')) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
}

// Экспорт функций
window.loadSave = loadSave;
window.saveGame = saveGame;
window.startAutoSave = startAutoSave;
window.deleteSave = deleteSave;
window.saveData = saveData;

// Автозагрузка при старте
window.addEventListener('load', () => {
  loadSave();
  startAutoSave();
  console.log('💾 save-system.js полностью загружен');
});
