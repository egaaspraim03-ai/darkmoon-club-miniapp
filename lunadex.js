function showLunadexSection(section) {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = '';

  if (section === 'lunadex') {
    content.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#1a0033;border-radius:24px;border:4px solid #C084FC;">
        <h2 style="color:#C084FC;margin-bottom:30px;">🌑 Лунная база данных</h2>
        <button onclick="selectWorld('pokemon')" class="big-button" style="margin:12px 0;">🌲 Мир Покемонов</button>
        <button onclick="selectWorld('smeshariki')" class="big-button" style="margin:12px 0;">🌼 Мир Смешариков</button>
        <button onclick="selectWorld('darkmoon')" class="big-button" style="margin:12px 0;">🌑 Бездна Dark Moon</button>
      </div>`;
  } 
  else if (section === 'my') {
    renderParty();
  }
}

function selectWorld(world) {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = `<h3 style="color:#C084FC;text-align:center;margin:20px 0;">${world === 'pokemon' ? '🌲 Мир Покемонов' : world === 'smeshariki' ? '🌼 Мир Смешариков' : '🌑 Бездна Dark Moon'}</h3>`;
  
  const grid = document.createElement('div');
  grid.className = 'pokedex-grid';
  content.appendChild(grid);

  gameData.universes[world].forEach(h => {
    const card = document.createElement('div');
    card.className = 'pokedex-card';
    card.innerHTML = `<img src="${h.sprite}" style="width:100%;height:120px;object-fit:contain;"><strong>${h.num}</strong><br><span>${h.ru}</span>`;
    card.onclick = () => showHeroDetail(h);
    grid.appendChild(card);
  });
}

function renderParty() {
  const content = document.getElementById('lunadex-content');
  content.innerHTML = `<h3 style="margin-bottom:15px;color:#C084FC;">👤 Мои герои (${myHeroes.length})</h3>`;
  const container = document.createElement('div');
  myHeroes.forEach(h => {
    const div = document.createElement('div');
    div.className = 'party-card';
    div.innerHTML = `<img src="${h.sprite}" style="width:70px;height:70px;"><div><strong>#${h.num} ${h.ru}</strong><br>Lv.${h.level}</div></div>`;
    container.appendChild(div);
  });
  content.appendChild(container);
}

function showHeroDetail(h) {
  const caught = myHeroes.some(m => m.num === h.num);
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:20px;">
      <img src="${h.sprite}" style="width:180px;height:180px;">
      <h2>#${h.num} ${h.ru}</h2>
      <p style="color:#C084FC">${h.en || ''}</p>
      ${caught ? '<p style="color:#00ff88;">✓ Уже пойман</p>' : `<button onclick="catchHeroFromLunadex('${h.num}','${h.ru}','${h.sprite}')" class="big-button" style="background:#00cc66;">🔥 Поймать</button>`}
      <button onclick="closeModal()" class="big-button" style="background:#9B59B6;">Закрыть</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

function catchHeroFromLunadex(num, ru, sprite) {
  myHeroes.push({num, ru, sprite, hp:180, maxHp:180, level:1, attack:50, defense:40, exp:0, type:'nature'});
  saveMyHeroes();
  closeModal();
  alert(`✅ ${ru} пойман и добавлен в Архив!`);
}
