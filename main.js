// ====================== MAIN.JS — v2.1 NEXUS ULTIMATE ======================
// Центр управления: табы, клуб, зоны, Telegram-ссылки

function switchTab(tab) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    // Показываем нужный
    const screen = document.getElementById(tab + '-screen');
    if (screen) screen.style.display = 'block';

    // Активная кнопка внизу
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    // Специальные действия при открытии табов
    if (tab === 'club') {
        renderClubScreen();
    } else if (tab === 'game') {
        // Перезапуск overworld при возврате в игру
        if (typeof initOverworld === 'function') initOverworld();
    } else if (tab === 'archive') {
        showLunadexSection('lunadex');
    }
}

// ====================== КЛУБ — 3 КНОПКИ ДЛЯ TELEGRAM ======================
function renderClubScreen() {
    const content = document.getElementById('club-content');
    if (!content) return;

    content.innerHTML = `
        <div style="padding:20px; text-align:center;">
            <h2 style="color:#C084FC; margin-bottom:25px;">🏠 КЛУБ DARK MOON</h2>
            
            <div onclick="openLink('https://t.me/mangabuff')" 
                 style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:18px; margin:12px 0; display:flex; align-items:center; gap:15px; cursor:pointer;">
                <span style="font-size:32px;">📰</span>
                <div>
                    <strong>Новости mangabuff.ru</strong><br>
                    <span style="color:#aaa; font-size:13px;">Свежие обновления и анонсы</span>
                </div>
            </div>

            <div onclick="openLink('https://t.me/mangabuff_chat')" 
                 style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:18px; margin:12px 0; display:flex; align-items:center; gap:15px; cursor:pointer;">
                <span style="font-size:32px;">💬</span>
                <div>
                    <strong>Чатик модераторов</strong><br>
                    <span style="color:#aaa; font-size:13px;">Общение и помощь</span>
                </div>
            </div>

            <div onclick="openLink('https://t.me/mangabuff_podslushano')" 
                 style="background:#1a0033; border:2px solid #C084FC; border-radius:16px; padding:18px; margin:12px 0; display:flex; align-items:center; gap:15px; cursor:pointer;">
                <span style="font-size:32px;">👂</span>
                <div>
                    <strong>Подслушано на mangabuff</strong><br>
                    <span style="color:#aaa; font-size:13px;">Секреты и мемы</span>
                </div>
            </div>

            <p style="margin-top:30px; color:#C084FC; font-size:13px;">
                Твой ранг: <strong id="user-rank">Тень</strong><br>
                Вклад в клуб: <strong id="user-contribution">0</strong>
            </p>
        </div>
    `;
}

// ====================== ОТКРЫТИЕ ССЫЛОК В TELEGRAM ======================
function openLink(url) {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.openLink(url);
    } else {
        window.open(url, '_blank');
    }
}

// ====================== ПЕРЕКЛЮЧЕНИЕ ЗОН В ИГРЕ ======================
function selectZone(zone) {
    currentZone = zone;
    changeZone(zone); // из overworld.js
    addLog(`🔄 Ты вошёл в зону: <strong>${zone === 'pokemon' ? '🌲 Мир Покемонов' : zone === 'smeshariki' ? '🦔 Мир Смешариков' : '🌑 Бездна Dark Moon'}</strong>`);
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initMain() {
    console.log('%c🚀 MAIN.JS v2.1 — табы, клуб и зоны загружены', 'color:#C084FC; font-weight:bold');
    
    // Открываем первый таб по умолчанию
    switchTab('archive'); // или 'game' — как хочешь

    // Показываем ранг из бота (можно синхронизировать позже)
    document.getElementById('user-rank').textContent = 'Нокт';
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initMain);
}

// Глобальные функции для HTML
window.switchTab = switchTab;
window.openLink = openLink;
window.selectZone = selectZone;
