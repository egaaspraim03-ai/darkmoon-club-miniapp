// js/party.js
// Управление командой игрока (Party Menu)

let currentParty = window.currentParty || [];

// Открыть меню команды
function openPartyMenu(fromBattle = false) {
  const container = document.getElementById('party-container') || 
                    document.createElement('div');
  
  if (!document.getElementById('party-container')) {
    container.id = 'party-container';
    container.className = 'tab-content';
    document.body.appendChild(container); // на случай если контейнер ещё не создан
  }

  let html = `
    <div class="party-header">
      <h2>Твоя команда</h2>
      <button onclick="closePartyMenu()">Закрыть</button>
    </div>
    <div class="party-grid">
  `;

  currentParty.forEach((pokemon, index) => {
    const hpPercent = Math.max(0, Math.min(100, (pokemon.hp / pokemon.maxHp) * 100));
    
    html += `
      <div class="party-card ${hpPercent === 0 ? 'fainted' : ''}">
        <div class="party-info">
          <span class="party-name">${pokemon.name || pokemon.ru || 'Покемон'}</span>
          <span class="party-level">Lv.${pokemon.level || 5}</span>
        </div>
        
        <div class="hp-container">
          <div class="hp-bar">
            <div class="hp-fill ${hpPercent > 50 ? 'green' : hpPercent > 20 ? 'yellow' : 'red'}" 
                 style="width: ${hpPercent}%"></div>
          </div>
          <span class="hp-text">${pokemon.hp} / ${pokemon.maxHp}</span>
        </div>

        <div class="party-types">
          ${(pokemon.types || []).map(t => `<span class="type ${t.toLowerCase()}">${t}</span>`).join('')}
        </div>

        <button onclick="switchPokemonInParty(${index})" class="switch-btn">
          Выбрать в бой
        </button>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
  container.style.display = 'block';
}

// Переключить покемона (используется и в бою, и в меню)
function switchPokemonInParty(index) {
  if (index < 0 || index >= currentParty.length) return;
  
  const newMon = currentParty[index];
  
  // Если вызвано из боя
  if (window.currentBattle) {
    window.currentBattle.playerMon = newMon;
    addLog(`В бой вышел ${newMon.name || newMon.ru}!`);
    window.renderBattleScreen();
    closePartyMenu();
  } else {
    // Просто уведомление
    alert(`Теперь главный покемон: ${newMon.name || newMon.ru}`);
    closePartyMenu();
  }
}

function closePartyMenu() {
  const container = document.getElementById('party-container');
  if (container) container.style.display = 'none';
}

// Глобальные функции
window.openPartyMenu = openPartyMenu;
window.switchPokemonInParty = switchPokemonInParty;
window.closePartyMenu = closePartyMenu;
window.currentParty = currentParty; // обновляем глобальную ссылку
