// js/main.js
// Главный файл приложения — точка входа

let currentTab = 'overworld';
let currentParty = [];
let overworldGame = null;

// Инициализация всего приложения
async function initApp() {
  const loaded = await loadAllGameData();
  if (!loaded) {
    console.error('Не удалось загрузить данные игры');
    return;
  }

  // Пример стартовой команды (можно будет менять позже)
  currentParty = [
    {
      id: 1,
      name: "Бульбазавр",
      hp: 45,
      maxHp: 45,
      level: 5,
      types: ["Grass", "Poison"]
    },
    {
      id: 4,
      name: "Чармандер",
      hp: 39,
      maxHp: 39,
      level: 5,
      types: ["Fire"]
    }
  ];

  console.log('🎮 Приложение инициализировано');
  console.log('Текущая команда:', currentParty);

  // Переключаемся на первую вкладку
  switchTab('overworld');
}

// Переключение между вкладками (Overworld / Battle / Lunadex и т.д.)
function switchTab(tab) {
  currentTab = tab;

  // Скрываем все контейнеры
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });

  // Показываем нужный
  const target = document.getElementById(tab + '-container');
  if (target) target.classList.add('active');

  // Специальная обработка для overworld
  if (tab === 'overworld') {
    if (!overworldGame) {
      initOverworld();
    }
  }

  // Если выходим из боя — уничтожаем сцену боя
  if (tab !== 'battle' && window.destroyBattle) {
    window.destroyBattle();
  }
}

// Глобальные функции для других файлов
window.initApp = initApp;
window.switchTab = switchTab;
window.currentParty = currentParty;

// Автозапуск при загрузке страницы
window.addEventListener('load', () => {
  initApp();
});
