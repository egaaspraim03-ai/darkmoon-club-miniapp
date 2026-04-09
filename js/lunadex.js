// js/lunadex.js
// Lunadex — полноценный покедекс с поиском и фильтрами

function renderLunadex() {
  const container = document.getElementById('lunadex-container');
  if (!container) return;

  let html = `
    <div class="lunadex-header">
      <input type="text" id="lunadex-search" placeholder="🔎 Поиск по имени или номеру..." 
             onkeyup="filterLunadex()">
      <div class="filters">
        <button onclick="filterByCategory('all')" class="active">Все</button>
        <button onclick="filterByCategory('pokemon')">Покемоны</button>
        <button onclick="filterByCategory('smesharik')">Смешарики</button>
        <button onclick="filterByCategory('darkmoon')">Dark Moon</button>
      </div>
    </div>
    <div id="lunadex-grid" class="lunadex-grid"></div>
  `;

  container.innerHTML = html;
  showAllMons();
}

function showAllMons(filteredMons = null) {
  const grid = document.getElementById('lunadex-grid');
  grid.innerHTML = '';

  let mons = filteredMons || getAllMons();

  mons.forEach(mon => {
    const card = document.createElement('div');
    card.className = 'lunadex-card';
    card.innerHTML = `
      <img src="${mon.sprite || 'https://via.placeholder.com/80x80/222/fff?text=?'}" 
           alt="${mon.ru || mon.name}">
      <div class="card-info">
        <span class="number">#${String(mon.id || mon.num).padStart(3, '0')}</span>
        <span class="name">${mon.ru || mon.name}</span>
        <div class="types">
          ${(mon.types || []).map(type => `<span class="type ${type.toLowerCase()}">${type}</span>`).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  if (mons.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">Ничего не найдено</p>`;
  }
}

function getAllMons() {
  const pokedex = Object.values(window.pokedexData || {});
  return [
    ...pokedex.map(p => ({ ...p, category: 'pokemon' })),
    ...window.smesharikiData.map(s => ({ ...s, category: 'smesharik' })),
    ...window.darkmoonData.map(d => ({ ...d, category: 'darkmoon' }))
  ];
}

function filterLunadex() {
  const search = document.getElementById('lunadex-search').value.toLowerCase().trim();
  const mons = getAllMons();

  const filtered = mons.filter(mon => {
    const name = (mon.ru || mon.name || '').toLowerCase();
    const num = String(mon.id || mon.num || '');
    return name.includes(search) || num.includes(search);
  });

  showAllMons(filtered);
}

function filterByCategory(cat) {
  // Снимаем active со всех кнопок
  document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
  
  // Ставим active на нажатую
  event.currentTarget.classList.add('active');

  let mons = getAllMons();

  if (cat !== 'all') {
    mons = mons.filter(m => m.category === cat);
  }

  showAllMons(mons);
}

// Глобальные функции
window.renderLunadex = renderLunadex;
window.filterLunadex = filterLunadex;
window.filterByCategory = filterByCategory;
