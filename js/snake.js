/* js/snake.js — stub mini-game */
(function (global) {
  'use strict';

  function onShow() {
    var root = document.getElementById('snake-root');
    if (root && !root.dataset.ready) {
      root.dataset.ready = '1';
      root.innerHTML =
        '<p style="font-size:12px;opacity:.7;margin:8px 0 0;">Змей пока в режиме заглушки. Полная игра подключится позже.</p>';
    }
  }

  global.BloodSnake = {
    onShow: onShow
  };
})(typeof window !== 'undefined' ? window : this);
