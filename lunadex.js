// lunadex.js — вся логика Lunadex

function showLunadexSection(section) {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = '';
  if (section === 'lunadex') {
    content.innerHTML = `<div style="text-align:center;padding:30px 20px;background:#1a0033;border-radius:20px;">
      <h2 style="color:#C084FC;">🌑 Лунная База Данных Бездны</h2>
      <p style="line-height:1.6;margin:20px 0;">Здесь собраны все сущности...<br>Какой мир ты хочешь узреть?</p>
      <button onclick="selectWorld('pokemon')" class="big-button">Мир Покемонов</button>
      <button onclick="selectWorld('smeshariki')" class="big-button">Мир Смешарики</button>
      <button onclick="selectWorld('darkmoon')" class="big-button">Мир Dark Moon</button>
    </div>`;
  } else if (section === 'my') {
    content.innerHTML = `<h3 style="margin-bottom:15px;">👤 Мои герои (${myHeroes.length})</h3><div id="party-list"></div>`;
    renderParty();
  }
}

function selectWorld(world) {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = `<h3 style="margin-bottom:15px;">🌐 ${world === 'pokemon' ? 'Мир Покемонов' : world === 'smeshariki' ? 'Мир Смешарики' : 'Мир Dark Moon'}</h3>`;
  const grid = document.createElement('div'); grid.className = 'pokedex-grid'; grid.id = 'world-grid';
  content.appendChild(grid);
  renderWorldGrid(world);
}

function renderWorldGrid(world) {
  const grid = document.getElementById('world-grid');
  grid.innerHTML = '';
  gameData.universes[world].forEach(h => {
    const card = document.createElement('div');
    card.className = 'pokedex-card';
    card.innerHTML = `<img src="${h.sprite}" alt="${h.ru}"><strong>${h.num || ''}</strong><br><span>${h.ru}</span>`;
    card.onclick = () => showHeroDetail(h);
    grid.appendChild(card);
  });
}

function showHeroDetail(h) {
  const caught = myHeroes.some(m => m.num === h.num);
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;">
      <img src="${h.sprite}" style="width:170px;height:170px;margin:15px auto;display:block;">
      <h2>#${h.num || ''} ${h.ru}</h2>
      <p style="color:#C084FC">${h.en || ''}</p>
      ${caught ? '<p style="color:#00cc66;">✓ Уже в Архиве Тьмы</p>' : ''}
      ${!caught ? `<button onclick="catchHeroFromLunadex('${h.num || h.ru}', '${h.ru}', '${h.sprite}')" style="background:#00cc66;width:100%;padding:18px;margin:10px 0;border-radius:16px;font-size:18px;">🔥 Поймать</button>` : ''}
      <button onclick="closeModal()" style="width:100%;">Закрыть</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

function catchHeroFromLunadex(num, ru, sprite) {
  myHeroes.push({num, ru, sprite, hp:180, maxHp:180, level:1, attack:50, defense:40, exp:0, type: 'nature'});
  saveMyHeroes();
  closeModal();
  alert(`✅ ${ru} добавлен в Архив Тьмы!`);
}

function renderParty() {
  const container = document.getElementById('party-list') || document.createElement('div');
  container.id = 'party-list'; container.innerHTML = '';
  myHeroes.forEach(h => {
    const percent = Math.floor((h.hp / h.maxHp) * 100);
    const div = document.createElement('div');
    div.className = 'party-card';
    div.innerHTML = `<img src="${h.sprite}" alt="${h.ru}"><div class="party-info"><div class="party-name">#${h.num} ${h.ru}</div><div class="party-lv">Lv.${h.level}</div><div class="hp-bar"><div class="hp-fill" style="width:${percent}%"></div></div><small>${h.hp}/${h.maxHp} HP</small></div>`;
    container.appendChild(div);
  });
  if (!document.getElementById('party-list')) document.getElementById('lunadex-content').appendChild(container);
}
