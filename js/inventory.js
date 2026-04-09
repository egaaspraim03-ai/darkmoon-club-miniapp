// js/inventory.js
// Инвентарь — просмотр и использование предметов

let inventory = [
  { id: "potion", quantity: 5 },
  { id: "superpotion", quantity: 3 },
  { id: "fullheal", quantity: 2 },
  { id: "revive", quantity: 1 },
  { id: "pokeball", quantity: 10 }
];

function openInventory() {
  const container = document.getElementById('inventory-container') || 
                    document.createElement('div');
  
  if (!document.getElementById('inventory-container')) {
    container.id = 'inventory-container';
    container.className = 'tab-content';
    document.body.appendChild(container);
  }

  let html = `
    <div class="inventory-header">
      <h2>Инвентарь</h2>
      <button onclick="closeInventory()">Закрыть</button>
    </div>
    <div class="inventory-grid">
  `;

  inventory.forEach((item, index) => {
    const itemData = window.itemsData.items ? 
      window.itemsData.items.find(i => i.id === item.id) : null;
    
    if (!itemData) return;

    html += `
      <div class="inventory-item">
        <span class="item-name">${itemData.ru} ×${item.quantity}</span>
        <span class="item-desc">${itemData.description}</span>
        <div class="item-actions">
          <button onclick="useItem(${index})">Использовать</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
  container.style.display = 'block';
}

function useItem(index) {
  const item = inventory[index];
  if (!item || item.quantity <= 0) return;

  const itemData = window.itemsData.items.find(i => i.id === item.id);
  if (!itemData) return;

  // Пример использования на первого покемона в команде
  if (window.currentParty && window.currentParty.length > 0) {
    const mon = window.currentParty[0];

    if (itemData.type === "heal") {
      mon.hp = Math.min(mon.maxHp, mon.hp + itemData.value);
      addLog(`Использовано ${itemData.ru}. HP восстановлено!`);
    } 
    else if (itemData.type === "status") {
      addLog(`Использовано ${itemData.ru}. Статус снят!`);
    } 
    else if (itemData.type === "revive") {
      if (mon.hp <= 0) {
        mon.hp = Math.floor(mon.maxHp * itemData.value);
        addLog(`Использовано ${itemData.ru}. Покемон оживлён!`);
      }
    }

    item.quantity--;
    if (item.quantity <= 0) {
      inventory.splice(index, 1);
    }
  }

  // Обновляем интерфейс
  openInventory();
}

function closeInventory() {
  const container = document.getElementById('inventory-container');
  if (container) container.style.display = 'none';
}

// Глобальные функции
window.openInventory = openInventory;
window.useItem = useItem;
window.closeInventory = closeInventory;
window.inventory = inventory; // для доступа из других файлов
