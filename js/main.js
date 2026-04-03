// ====================== js/main.js ======================
// NĒXUS • DARK MOON — Главный файл управления вкладками

function switchTab(tab) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById(tab + '-screen');
    if (screen) screen.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    // Специальные действия при переключении вкладок
    if (tab === 'club') renderClubScreen();
    else if (tab === 'game') {
        if (typeof initOverworld === 'function') initOverworld();
    }
    else if (tab === 'archive') {
        if (typeof showLunadexSection === 'function') showLunadexSection('lunadex');
    }
}

function renderClubScreen() {
    const content = document.getElementById('club-content');
    content.innerHTML = `
        <div style="padding:20px;text-align:center;">
            <h2 style="color:#C084FC;margin-bottom:25px;">🏠 КЛУБ DARK MOON</h2>
            <div onclick="openLink('https://t.me/mangabuff')" style="background:#1a0033;border:2px solid #C084FC;border-radius:16px;padding:18px;margin:12px 0;display:flex;align-items:center;gap:15px;cursor:pointer;">
                <span style="font-size:32px;">📰</span>
                <div><strong>Новости mangabuff.ru</strong><br><span style="color:#aaa;font-size:13px;">Свежие обновления</span></div>
            </div>
            <div onclick="openLink('https://t.me/mangabuff_chat')" style="background:#1a0033;border:2px solid #C084FC;border-radius:16px;padding:18px;margin:12px 0;display:flex;align-items:center;gap:15px;cursor:pointer;">
                <span style="font-size:32px;">💬</span>
                <div><strong>Чатик модераторов</strong><br><span style="color:#aaa;font-size:13px;">Общение и помощь</span></div>
            </div>
            <div onclick="openLink('https://t.me/mangabuff_podslushano')" style="background:#1a0033;border:2px solid #C084FC;border-radius:16px;padding:18px;margin:12px 0;display:flex;align-items:center;gap:15px;cursor:pointer;">
                <span style="font-size:32px;">👂</span>
                <div><strong>Подслушано на mangabuff</strong><br><span style="color:#aaa;font-size:13px;">Секреты и мемы</span></div>
            </div>
        </div>
    `;
}

function openLink(url) {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.openLink(url);
    } else {
        window.open(url, '_blank');
    }
}

// ====================== ЗАКРЫТИЕ БОЯ ======================
function closeBattleScreen() {
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.innerHTML = `<div id="overworld-container" style="width:480px;height:480px;margin:0 auto;"></div>`;
    }
    if (typeof initOverworld === 'function') {
        setTimeout(initOverworld, 100);
    }
    console.log('%c🔄 Бой закрыт, возвращаемся в оверворлд', 'color:#C084FC');
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initMain() {
    console.log('%c🚀 MAIN.JS v2.6 загружен — NĒXUS • DARK MOON', 'color:#C084FC; font-size:16px');
    
    // Переключаемся на Архив по умолчанию
    switchTab('archive');
    
    // Глобальные экспорты
    window.switchTab = switchTab;
    window.openLink = openLink;
    window.closeBattleScreen = closeBattleScreen;
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initMain);
}
