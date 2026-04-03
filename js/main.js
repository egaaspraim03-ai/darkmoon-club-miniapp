function switchTab(tab) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById(tab + '-screen');
    if (screen) screen.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'club') renderClubScreen();
    else if (tab === 'game') { if (typeof initOverworld === 'function') initOverworld(); }
    else if (tab === 'archive') { if (typeof showLunadexSection === 'function') showLunadexSection('lunadex'); }
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
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) Telegram.WebApp.openLink(url);
    else window.open(url, '_blank');
}

function initMain() {
    console.log('%c🚀 MAIN.JS загружен', 'color:#C084FC');
    switchTab('archive');
}

window.switchTab = switchTab;
window.openLink = openLink;

if (typeof window !== 'undefined') window.addEventListener('load', initMain);
