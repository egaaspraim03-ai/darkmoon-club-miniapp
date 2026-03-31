function showLunadexSection(section) {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = '';

  if (section === 'lunadex') {
    content.innerHTML = `
      <div style="text-align:center;padding:30px 20px;background:#1a0033;border-radius:24px;box-shadow:0 0 40px #C084FC;">
        <h2 style="color:#C084FC;">🌑 Лунная база данных</h2>
        <button onclick="selectWorld('pokemon')" class="big-button">🌲 Мир Покемонов</button>
        <button onclick="selectWorld('smeshariki')" class="big-button">🌼 Мир Смешариков</button>
        <button onclick="selectWorld('darkmoon')" class="big-button">🌑 Бездна Dark Moon</button>
      </div>`;
  } 
  else if (section === 'my') {
    renderPartyWithSynergy();
  }
  // остальные разделы пока пустые (можно расширить позже)
}

function selectWorld(world) {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = `<h3 style="color:#C084FC;text-align:center;margin:20px 0;">${world === 'pokemon' ? '🌲 Мир Покемонов' : world === 'smeshariki' ? '🌼 Мир Смешариков' : '🌑 Бездна Dark Moon'}</h3>`;
  const grid = document.createElement('div');
  grid.className = 'pokedex-grid';
  grid.id = 'world-grid';
  content.appendChild(grid);
  renderWorldGrid(world);
}

function renderWorldGrid(world) {
  const grid = document.getElementById('world-grid');
  grid.innerHTML = '';
  gameData.universes[world].forEach(h => {
    const card = document.createElement('div');
    card.className = 'pokedex-card';
    card.innerHTML = `<img src="${h.sprite}" style="width:100%;height:120px;object-fit:contain;"><strong>${h.num || ''}</strong><br><span>${h.ru}</span>`;
    card.onclick = () => showHeroDetail(h);
    grid.appendChild(card);
  });
}

function showHeroDetail(h) {
  const caught = myHeroes.some(m => m.num === h.num);
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:20px;">
      <img src="${h.sprite}" style="width:200px;height:200px;margin:15px auto;display:block;">
      <h2>#${h.num} ${h.ru}</h2>
      ${caught ? '<p style="color:#00ff88;">✓ Уже в партии</p>' : `<button onclick="catchHeroFromLunadex('${h.num || h.ru}', '${h.ru}', '${h.sprite}')" style="background:#00cc66;width:100%;padding:18px;border-radius:18px;font-size:19px;margin:15px 0;">🔥 Поймать</button>`}
      <button onclick="closeModal()" style="width:100%;padding:15px;border-radius:18px;">Закрыть</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

function catchHeroFromLunadex(num, ru, sprite) {
  myHeroes.push({num, ru, sprite, hp:180, maxHp:180, level:1, attack:50, defense:40, exp:0, type: 'nature'});
  saveMyHeroes();
  currentParty = myHeroes.slice(0, 3);
  closeModal();
  alert(`✅ ${ru} пойман!`);
  showLunadexSection('my');
}

function renderPartyWithSynergy() {
  const synergy = getNEXUSMultiplier(currentParty);
  let html = `<h3 style="color:#C084FC;text-align:center;">👤 Моя партия (${currentParty.length}/3) — NEXUS ×${synergy}</h3>`;
  currentParty.forEach(h => {
    html += `<div class="party-card"><img src="${h.sprite}" style="width:70px;height:70px;"><div><strong>#${h.num} ${h.ru}</strong><br>Lv.${h.level}</div></div>`;
  });
  document.getElementById('lunadex-content').innerHTML = html;
}
