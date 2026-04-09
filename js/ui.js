// js/ui.js
// UI-утилиты: модальные окна, уведомления, подтверждения

// Показать простое уведомление
function showNotification(message, type = 'info', duration = 3000) {
  let notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 300);
  }, duration);
}

// Показать модальное окно
function showModal(title, contentHTML, buttons = []) {
  // Удаляем старое модальное, если есть
  const oldModal = document.getElementById('custom-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'custom-modal';
  modal.className = 'modal-overlay';

  let btnHTML = buttons.map((btn, i) => `
    <button onclick="handleModalButton(${i})" class="${btn.style || 'default'}">
      ${btn.text}
    </button>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button onclick="closeModal()" class="close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${contentHTML}
      </div>
      <div class="modal-footer">
        ${btnHTML}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

// Закрыть текущее модальное
function closeModal() {
  const modal = document.getElementById('custom-modal');
  if (modal) modal.remove();
}

// Обработка кнопок в модальном (по индексу)
function handleModalButton(index) {
  // Можно расширять позже
  closeModal();
  if (typeof window.modalCallback === 'function') {
    window.modalCallback(index);
  }
}

// Пример: подтверждение действия
function confirmAction(title, message, onConfirm) {
  window.modalCallback = (choice) => {
    if (choice === 0) onConfirm();
  };

  showModal(title, `<p>${message}</p>`, [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Подтвердить', style: 'confirm' }
  ]);
}

// Глобальные стили (добавляются один раз)
function injectUIBaseStyles() {
  if (document.getElementById('ui-base-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'ui-base-styles';
  style.innerHTML = `
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 9999; }
    .modal-content { background: #1a1a1a; border: 3px solid #ffcc00; border-radius: 12px; width: 90%; max-width: 420px; color: #fff; }
    .modal-header { padding: 15px 20px; border-bottom: 2px solid #ffcc00; display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 20px; font-size: 15px; line-height: 1.4; }
    .modal-footer { padding: 15px; display: flex; gap: 10px; justify-content: flex-end; }
    .notification { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #222; color: #fff; padding: 14px 24px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 10000; font-weight: bold; }
    .notification.success { background: #00cc00; }
    .notification.error { background: #cc0000; }
  `;
  document.head.appendChild(style);
}

// Автозапуск стилей
window.addEventListener('load', injectUIBaseStyles);

// Экспорт
window.showNotification = showNotification;
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
