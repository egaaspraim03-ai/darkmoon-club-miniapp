// ====================== LUNADEx.JS — ФИНАЛЬНАЯ ВЕРСИЯ (ФАЗА 6) ======================
// Красивый Lunadex (аналог Pokédex) с поиском, фильтрами и карточками в стиле Pokémon Emerald

function renderLunadex() {
    const container = document.getElementById('lunadex-container');
    if (!container) return;

    const data = window.pokedexData || [];
    if (!data.length) {
        container.innerHTML = `<p style="color:#C084FC; padding:20px;">Данные ещё загружаются...</p>`;
        return;
    }

    let html = `
        <div class="lunadex-header">
            <h2>🌀 LUNADEx • DARK MOON</h2>
            <input type="text" id="lunadex-search" placeholder="Поиск по имени или типу..." 
                   onkeyup="filterLunadex()" style="width:100%; padding:10px; margin:10px 0; border-radius:8px;">
        </div>
        <div class="lunadex-grid" id="lunadex-grid"></div>
    `;

    container.innerHTML = html;
    renderLunadexGrid(data);
}

function renderLunadexGrid(data) {
    const grid = document.getElementById('lunadex-grid');
    let html = '';

    data.forEach(mon => {
        const types = mon.types ? mon.types.map(t => `<span class="type ${t.toLowerCase()}">${t}</span>`).join('') : '';
        
        html += `
            <div class="lunadex-card" onclick="showMonDetail(${mon.id || 0})">
                <div class="card-number">#${String(mon.id || 0).padStart(3, '0')}</div>
                <img src="${mon.sprite || 'https://i.postimg.cc/0yY7zZ0K/placeholder.png'}" alt="${mon.ru}">
                <div class="card-name">${mon.ru}</div>
                <div class="card-types">${types}</div>
            </div>
        `;
    });

    grid.innerHTML = html || `<p style="grid-column:1/-1; text-align:center; color:#C084FC;">Ничего не найдено</p>`;
}

function filterLunadex() {
    const query = document.getElementById('lunadex-search').value.toLowerCase().trim();
    const data = window.pokedexData || [];
    
    const filtered = data.filter(mon => 
        mon.ru.toLowerCase().includes(query) ||
        (mon.types && mon.types.some(t => t.toLowerCase().includes(query)))
    );

    renderLunadexGrid(filtered);
}

function showMonDetail(id) {
    const mon = (window.pokedexData || []).find(m => m.id === id);
    if (!mon) return;

    alert(`📋 ${mon.ru} #${String(mon.id).padStart(3,'0')}\n\nТипы: ${mon.types ? mon.types.join(', ') : '—'}\n\n${mon.description || 'Описание скоро...'}`);
    // В будущем здесь можно открыть модальное окно
}

// Экспорт
window.renderLunadex = renderLunadex;
