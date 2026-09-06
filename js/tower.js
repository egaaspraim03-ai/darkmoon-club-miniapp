/* ============================================================
   js/tower.js — Башня Разлома (UI + демо-логика)
   ============================================================ */
(function (global) {
  'use strict';

  var state = {
    level: 10,
    lp: 40000,
    path: [15, 5, 2, 3, 5],
    pathIndex: 0,
    diff: 1,
    running: false
  };

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    if (global.BloodDuel && global.BloodDuel.toast) return global.BloodDuel.toast(msg);
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function render() {
    var pathEl = $('tower-path');
    if (pathEl) {
      pathEl.innerHTML = state.path.map(function (n, i) {
        var cur = i === state.pathIndex ? ' style="color:#ffd700;text-shadow:0 0 10px #ffd700"' : '';
        return '<span' + cur + '>' + n + '</span>';
      }).join(' <span style="opacity:.5">→</span> ');
    }
    if ($('tower-level')) $('tower-level').textContent = String(state.level);
    if ($('tower-lp')) $('tower-lp').textContent = String(Math.floor(state.lp));

    document.querySelectorAll('#tower-diff .chip').forEach(function (btn) {
      var d = parseFloat(btn.getAttribute('data-diff'));
      btn.classList.toggle('active', d === state.diff);
    });
  }

  function bind() {
    var diff = $('tower-diff');
    if (diff && !diff._bm) {
      diff._bm = true;
      diff.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-diff]');
        if (!btn) return;
        state.diff = parseFloat(btn.getAttribute('data-diff')) || 1;
        render();
        toast('Сложность ×' + state.diff);
      });
    }

    var start = $('btn-tower-start');
    if (start && !start._bm) {
      start._bm = true;
      start.addEventListener('click', function () {
        if (state.running) return;
        runStage();
      });
    }
  }

  function runStage() {
    state.running = true;
    var stage = state.path[state.pathIndex] || 1;
    var reward = Math.floor(80 * stage * state.diff);
    var risk = Math.floor(200 * state.diff * (1 + state.pathIndex * 0.3));

    toast('🩸 Отряд уходит на этаж ' + stage + '…');
    if ($('btn-tower-start')) $('btn-tower-start').disabled = true;

    setTimeout(function () {
      var win = Math.random() > (0.15 * state.diff - 0.05);
      if (win) {
        state.lp = Math.min(99999, state.lp + reward);
        state.level += 1;
        toast('Победа на этаже ' + stage + '! +' + reward + ' LP · Lv.' + state.level);
        state.pathIndex = Math.min(state.path.length - 1, state.pathIndex + 1);
        if (state.pathIndex >= state.path.length - 1 && state.path[state.pathIndex] === stage) {
          /* loop path demo */
          if (state.pathIndex === state.path.length - 1) {
            toast('Узел пути пройден. Новый виток Разлома.');
            state.pathIndex = 0;
          }
        }
      } else {
        state.lp = Math.max(0, state.lp - risk);
        toast('Отряд потрёпан… −' + risk + ' LP');
        if (state.lp <= 0) {
          state.lp = 10000;
          state.level = Math.max(1, state.level - 1);
          toast('Эвакуация. Башня даёт второй шанс.');
        }
      }
      state.running = false;
      if ($('btn-tower-start')) $('btn-tower-start').disabled = false;
      render();
      save();
    }, 1400);
  }

  function save() {
    try {
      localStorage.setItem('bm_tower', JSON.stringify({
        level: state.level,
        lp: state.lp,
        pathIndex: state.pathIndex,
        diff: state.diff
      }));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem('bm_tower');
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d.level) state.level = d.level;
      if (d.lp) state.lp = d.lp;
      if (d.pathIndex != null) state.pathIndex = d.pathIndex;
      if (d.diff) state.diff = d.diff;
    } catch (e) {}
  }

  function onShow() {
    load();
    bind();
    render();
  }

  global.BloodTower = {
    onShow: onShow,
    state: state,
    render: render
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bind(); load(); });
  } else {
    bind();
    load();
  }
})(typeof window !== 'undefined' ? window : this);
