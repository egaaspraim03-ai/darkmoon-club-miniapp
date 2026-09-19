/* ============================================================
   js/bot.js — Blood Moon · мост Telegram WebApp ↔ бот
   - initData
   - профиль / ранг / вклад
   - deep-link startapp
   ============================================================ */
(function (global) {
  'use strict';

  /** URL бэкенда бота (смени на свой) */
  var API_BASE = (function () {
    try {
      var m = document.querySelector('meta[name="bm-api"]');
      if (m && m.content) return m.content.replace(/\/$/, '');
    } catch (e) {}
    /* пример: https://your-domain.com */
    return '';
  })();

  var profile = {
    tgId: null,
    username: null,
    firstName: null,
    rank: 'E',
    cards: 0,
    contrib: 0,
    lpBonus: 0,
    raw: null
  };

  function tg() {
    try {
      return (window.Telegram && window.Telegram.WebApp) || null;
    } catch (e) {
      return null;
    }
  }

  function initData() {
    var w = tg();
    return (w && w.initData) || '';
  }

  function userFromWebApp() {
    var w = tg();
    var u = w && w.initDataUnsafe && w.initDataUnsafe.user;
    if (!u) return null;
    return {
      id: u.id,
      username: u.username || null,
      first_name: u.first_name || null,
      last_name: u.last_name || null,
      photo_url: u.photo_url || null,
      language_code: u.language_code || 'ru'
    };
  }

  function toast(msg) {
    if (typeof global.showToast === 'function') {
      try {
        global.showToast(msg);
        return;
      } catch (e) {}
    }
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    t.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      t.classList.remove('show');
      t.style.opacity = '0';
    }, 2200);
  }

  function headers() {
    var h = { 'Content-Type': 'application/json' };
    var d = initData();
    if (d) h['X-Telegram-Init-Data'] = d;
    return h;
  }

  function api(path, opts) {
    opts = opts || {};
    if (!API_BASE) {
      return Promise.reject(new Error('API_BASE empty — set meta bm-api or BloodBot.setApiBase'));
    }
    var url = API_BASE + path;
    return fetch(url, {
      method: opts.method || 'GET',
      headers: headers(),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: 'omit'
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var err = new Error((j && j.error) || r.statusText || 'api error');
          err.status = r.status;
          err.payload = j;
          throw err;
        }
        return j;
      });
    });
  }

  function applyProfileLocal(p) {
    if (!p) return;
    profile.raw = p;
    if (p.tgId != null) profile.tgId = p.tgId;
    if (p.username != null) profile.username = p.username;
    if (p.firstName != null) profile.firstName = p.firstName;
    if (p.rank) profile.rank = p.rank;
    if (p.cards != null) profile.cards = p.cards;
    if (p.contrib != null) profile.contrib = p.contrib;
    if (p.lpBonus != null) profile.lpBonus = p.lpBonus;

    var rankEls = ['stat-rank', 'home-rank-mini'];
    rankEls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = profile.rank;
    });

    var w = document.getElementById('welcome');
    if (w && profile.firstName) {
      w.innerHTML =
        'Добро пожаловать в ночь, <b>' +
        String(profile.firstName).replace(/[<>&]/g, '') +
        '</b>';
    }

    var av = document.getElementById('avatar');
    var fb = document.getElementById('avatar-fallback');
    var photo = p.photo_url || (userFromWebApp() && userFromWebApp().photo_url);
    if (photo && av) {
      av.src = photo;
      av.classList.remove('hidden');
      if (fb) fb.classList.add('hidden');
    }
  }

  /** Офлайн-демо профиль из WebApp + localStorage */
  function hydrateOffline() {
    var u = userFromWebApp();
    var local = null;
    try {
      local = JSON.parse(localStorage.getItem('bm_profile') || 'null');
    } catch (e) {}
    var p = {
      tgId: u && u.id,
      username: u && u.username,
      firstName: (u && u.first_name) || (local && local.firstName) || 'гость',
      photo_url: u && u.photo_url,
      rank: (local && local.rank) || 'E',
      cards: (local && local.cards) || 0,
      contrib: (local && local.contrib) || 0,
      lpBonus: (local && local.lpBonus) || 0
    };
    applyProfileLocal(p);
    return p;
  }

  function saveLocal() {
    try {
      localStorage.setItem(
        'bm_profile',
        JSON.stringify({
          rank: profile.rank,
          cards: profile.cards,
          contrib: profile.contrib,
          lpBonus: profile.lpBonus,
          firstName: profile.firstName
        })
      );
    } catch (e) {}
  }

  function fetchProfile() {
    if (!API_BASE) {
      hydrateOffline();
      return Promise.resolve(profile);
    }
    return api('/api/me')
      .then(function (j) {
        applyProfileLocal(j.user || j);
        saveLocal();
        return profile;
      })
      .catch(function (err) {
        console.warn('[BloodBot] profile fallback', err && err.message);
        hydrateOffline();
        toast('Офлайн-профиль (бот недоступен)');
        return profile;
      });
  }

  function postContrib(amount) {
    amount = Math.max(0, parseInt(amount, 10) || 0);
    if (!API_BASE) {
      profile.contrib += amount;
      saveLocal();
      toast('Вклад +' + amount + ' (локально)');
      return Promise.resolve({ ok: true, local: true, contrib: profile.contrib });
    }
    return api('/api/contrib', { method: 'POST', body: { amount: amount } }).then(function (j) {
      if (j.user) applyProfileLocal(j.user);
      saveLocal();
      toast('Вклад учтён');
      return j;
    });
  }

  function postDuelResult(payload) {
    payload = payload || {};
    /* { win: true, turns: n, enemyLpLeft: 0 } */
    if (!API_BASE) {
      if (payload.win) {
        profile.cards += 1;
        saveLocal();
        toast('Победа записана локально');
      }
      return Promise.resolve({ ok: true, local: true });
    }
    return api('/api/duel/result', { method: 'POST', body: payload }).then(function (j) {
      if (j.user) applyProfileLocal(j.user);
      saveLocal();
      return j;
    });
  }

  /** start_param: duel | tower | relics | hall */
  function handleStartParam() {
    var w = tg();
    var sp =
      (w && w.initDataUnsafe && w.initDataUnsafe.start_param) ||
      (function () {
        var h = (location.hash || '').replace(/^#/, '');
        return h || '';
      })();
    if (!sp) return null;
    var map = {
      duel: 'duel',
      tower: 'tower',
      relics: 'relics',
      hall: 'hall',
      reel: 'reel',
      profile: 'profile'
    };
    var screen = map[String(sp).toLowerCase()] || null;
    if (screen && typeof global.showScreen === 'function') {
      setTimeout(function () {
        global.showScreen(screen);
      }, 50);
    }
    return screen;
  }

  function readyUi() {
    var w = tg();
    if (!w) return;
    try {
      w.ready();
      w.expand();
      if (w.setHeaderColor) w.setHeaderColor('#0a0508');
      if (w.setBackgroundColor) w.setBackgroundColor('#0a0508');
      if (w.enableClosingConfirmation) w.enableClosingConfirmation();
    } catch (e) {}
  }

  function setApiBase(url) {
    API_BASE = String(url || '').replace(/\/$/, '');
  }

  function boot() {
    readyUi();
    hydrateOffline();
    fetchProfile().then(function () {
      handleStartParam();
    });
  }

  /** Хук победы/поражения из duel.js */
  function onDuelEnd(win) {
    var st = global.BloodDuel && global.BloodDuel.state;
    postDuelResult({
      win: !!win,
      turns: st ? st.turn : 0,
      playerLp: st ? st.playerLp : 0,
      enemyLp: st ? st.enemyLp : 0
    }).catch(function () {});
  }

  global.BloodBot = {
    boot: boot,
    api: api,
    setApiBase: setApiBase,
    fetchProfile: fetchProfile,
    postContrib: postContrib,
    postDuelResult: postDuelResult,
    onDuelEnd: onDuelEnd,
    handleStartParam: handleStartParam,
    getProfile: function () {
      return profile;
    },
    getApiBase: function () {
      return API_BASE;
    },
    initData: initData,
    userFromWebApp: userFromWebApp
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
