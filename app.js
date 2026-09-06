/* ============================================================
   app.js — The Blood Moon Mini App v3.0
   Навигация · showScreen · хуки duel/tower/relics
   PART 1/2
   ============================================================ */
(function () {
  'use strict';

  var SCREENS = {
    home: 1,
    site: 1,
    rules: 1,
    archives: 1,
    chronicles: 1,
    characters: 1,
    hall: 1,
    quest: 1,
    obana: 1,
    profile: 1,
    pyramid: 1,
    skills: 1,
    snake: 1,
    reel: 1,
    duel: 1,
    tower: 1,
    relics: 1
  };

  var navStack = ['home'];

  function $(id) {
    return document.getElementById(id);
  }

  function tabForScreen(id) {
    if (id === 'home') return 'home';
    if (
      id === 'archives' ||
      id === 'chronicles' ||
      id === 'characters' ||
      id === 'rules' ||
      id === 'skills'
    ) {
      return 'archives';
    }
    if (id === 'obana') return 'obana';
    if (id === 'site') return 'site';
    if (
      id === 'hall' ||
      id === 'quest' ||
      id === 'profile' ||
      id === 'pyramid' ||
      id === 'reel' ||
      id === 'snake' ||
      id === 'duel' ||
      id === 'tower' ||
      id === 'relics'
    ) {
      return 'hall';
    }
    return 'home';
  }

  function showToast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    t.style.opacity = '1';
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      t.style.opacity = '0';
      t.classList.remove('show');
    }, 2200);
  }
  window.showToast = showToast;

  function showScreen(id) {
    if (!id || !SCREENS[id]) {
      id = 'home';
    }

    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('active', s.id === 'screen-' + id);
    });

    var back = $('btn-back');
    if (back) {
      back.classList.toggle('hidden', id === 'home');
    }

    var tabId = tabForScreen(id);
    document.querySelectorAll('#bottom-nav .tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-screen') === tabId);
    });

    /* hooks v3 */
    if (id === 'duel') {
      document.body.classList.add('duel-mode');
      if (window.BloodDuel && typeof window.BloodDuel.onShow === 'function') {
        window.BloodDuel.onShow();
      }
    } else {
      document.body.classList.remove('duel-mode');
      if (window.BloodDuel && typeof window.BloodDuel.onHide === 'function') {
        window.BloodDuel.onHide();
      }
    }

    if (id === 'tower' && window.BloodTower && window.BloodTower.onShow) {
      window.BloodTower.onShow();
    }
    if (id === 'relics' && window.BloodRelics && window.BloodRelics.onShow) {
      window.BloodRelics.onShow();
    }
    if (id === 'snake' && window.BloodSnake && window.BloodSnake.onShow) {
      window.BloodSnake.onShow();
    }
    if (id === 'characters' && window.BloodCourt && window.BloodCourt.onShow) {
      window.BloodCourt.onShow();
    }

    try {
      if (history.replaceState) {
        history.replaceState(null, '', '#' + id);
      }
    } catch (e) {}

    window.scrollTo(0, 0);
    var main = $('main-content');
    if (main) main.scrollTop = 0;

    if (navStack[navStack.length - 1] !== id) {
      navStack.push(id);
      if (navStack.length > 40) navStack.shift();
    }
  }
  window.showScreen = showScreen;

  function goBack() {
    if (navStack.length > 1) navStack.pop();
    var prev = navStack[navStack.length - 1] || 'home';
    showScreen(prev);
  }

  function hideSplash() {
    var sp = $('splash');
    if (!sp) return;
    sp.classList.add('hide');
    setTimeout(function () {
      sp.style.display = 'none';
    }, 600);
  }

  function bindNav() {
    document.addEventListener('click', function (e) {
      var go = e.target.closest && e.target.closest('[data-go]');
      if (go) {
        var id = go.getAttribute('data-go');
        if (id) {
          e.preventDefault();
          showScreen(id);
        }
        return;
      }
      var tab = e.target.closest && e.target.closest('#bottom-nav .tab');
      if (tab) {
        var sid = tab.getAttribute('data-screen');
        if (sid) {
          e.preventDefault();
          showScreen(sid);
        }
      }
    });

    var back = $('btn-back');
    if (back) back.addEventListener('click', goBack);

    var help = $('btn-help');
    if (help) {
      help.addEventListener('click', function () {
        showScreen('rules');
      });
    }
  }

  function bindRankCalc() {
    var btn = $('btn-rank-calc');
    var out = $('rank-out');
    var amount = $('rank-amount');
    var from = $('rank-from');
    var mode = 'merge';

    document.querySelectorAll('#calc-modes .calc-mode').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#calc-modes .calc-mode').forEach(function (x) {
          x.classList.remove('active');
        });
        b.classList.add('active');
        mode = b.getAttribute('data-mode') || 'merge';
        runCalc();
      });
    });

    function runCalc() {
      if (!out || !amount || !from) return;
      var n = parseInt(amount.value, 10) || 0;
      var r = parseInt(from.value, 10) || 0;
      var names = ['E', 'D', 'C', 'B', 'A', 'S', 'G', 'P', 'X'];
      if (mode === 'merge') {
        if (r >= 8) {
          out.textContent = n + ' X — вершина';
          return;
        }
        var up = Math.floor(n / 3);
        var rem = n % 3;
        out.textContent =
          n +
          ' ' +
          names[r] +
          ' → ' +
          up +
          ' ' +
          names[r + 1] +
          (rem ? ' + ' + rem + ' ' + names[r] : '') +
          ' (правка)';
      } else if (mode === 'split') {
        if (r <= 0) {
          out.textContent = 'E нельзя расколоть';
          return;
        }
        out.textContent = n + ' ' + names[r] + ' → ' + n * 2 + ' ' + names[r - 1] + ' (раскол)';
      } else {
        out.textContent = n + ' ' + names[r] + ' на рынке НН ≈ ' + n * 3 + ' E-экв. (демо)';
      }
    }

    if (btn) btn.addEventListener('click', runCalc);
    if (amount) amount.addEventListener('input', runCalc);
    if (from) from.addEventListener('change', runCalc);
  }

  function bindReel() {
    var track = $('reel-track');
    var btn = $('btn-spin');
    var result = $('reel-result');
    if (!track || !btn) return;

    var prizes = [
      { t: '10 E', c: '#888' },
      { t: '50 E', c: '#6a6' },
      { t: 'Мыло', c: '#9cf' },
      { t: '100 E', c: '#6a6' },
      { t: 'Реликвия?', c: '#c9a227' },
      { t: 'Пусто', c: '#444' },
      { t: '250 E', c: '#4af' },
      { t: 'Кровь +1', c: '#ff2d55' },
      { t: 'Титул-демо', c: '#a85' },
      { t: 'Осколок', c: '#a55' }
    ];

    function build() {
      var html = '';
      for (var i = 0; i < 40; i++) {
        var p = prizes[i % prizes.length];
        html +=
          '<div class="reel-item" style="border-color:' +
          p.c +
          '"><span>' +
          p.t +
          '</span></div>';
      }
      track.innerHTML = html;
    }
    build();

    var spinning = false;
    btn.addEventListener('click', function () {
      if (spinning) return;
      spinning = true;
      btn.disabled = true;
      var itemW = 96;
      var winIndex = 20 + Math.floor(Math.random() * 8);
      var offset = winIndex * itemW - (window.innerWidth / 2 - itemW / 2);
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      void track.offsetWidth;
      track.style.transition = 'transform 3.2s cubic-bezier(0.12,0.75,0.1,1)';
      track.style.transform = 'translateX(-' + offset + 'px)';
      setTimeout(function () {
        var p = prizes[winIndex % prizes.length];
        if (result) {
          result.innerHTML = '<b style="color:#ff2d55">Выпало:</b> ' + p.t;
        }
        showToast('🎰 ' + p.t);
        spinning = false;
        btn.disabled = false;
      }, 3300);
    });
  }

  function bindProfileDemo() {
    var sim = $('sim-cards');
    if (!sim) return;
    sim.addEventListener('input', function () {
      var n = parseInt(sim.value, 10) || 0;
      var rank = 'E';
      if (n >= 5000) rank = 'X';
      else if (n >= 2500) rank = 'P';
      else if (n >= 1200) rank = 'G';
      else if (n >= 600) rank = 'S';
      else if (n >= 300) rank = 'A';
      else if (n >= 150) rank = 'B';
      else if (n >= 60) rank = 'C';
      else if (n >= 20) rank = 'D';
      var el = $('stat-rank');
      if (el) el.textContent = rank;
      var mini = $('home-rank-mini');
      if (mini) mini.textContent = rank;
    });
  }

  function bindLaws() {
    var btn = $('btn-laws');
    var box = $('laws-box');
    if (btn && box) {
      btn.addEventListener('click', function () {
        box.classList.toggle('hidden');
      });
    }
  }

  function initTelegram() {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        var u = window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
        if (u) {
          var w = $('welcome');
          if (w) {
            w.innerHTML =
              'Добро пожаловать в ночь, <b>' +
              (u.first_name || u.username || 'гость') +
              '</b>';
          }
          var av = $('avatar');
          var fb = $('avatar-fallback');
          if (u.photo_url && av) {
            av.src = u.photo_url;
            av.classList.remove('hidden');
            if (fb) fb.classList.add('hidden');
          }
        }
      }
    } catch (e) {}
  }

  function boot() {
    bindNav();
    bindRankCalc();
    bindReel();
    bindProfileDemo();
    bindLaws();
    initTelegram();

    var hash = (location.hash || '').replace(/^#/, '');
    var start = SCREENS[hash] ? hash : 'home';
    showScreen(start);

    setTimeout(hideSplash, 900);

    var share = $('btn-share');
    if (share) {
      share.addEventListener('click', function () {
        var url = 'https://t.me/mangabuff';
        if (navigator.share) {
          navigator.share({ title: 'The Blood Moon', url: url }).catch(function () {});
        } else {
          showToast('Пригласи в Blood Moon · t.me');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
