/* ============================================================
   js/relics.js — Реликвии Пантеона + модалка Столпа
   ============================================================ */
(function (global) {
  'use strict';

  var active = {}; /* relicId -> true */

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

  function load() {
    try {
      var raw = localStorage.getItem('bm_relics');
      if (raw) active = JSON.parse(raw) || {};
    } catch (e) { active = {}; }
  }

  function save() {
    try { localStorage.setItem('bm_relics', JSON.stringify(active)); } catch (e) {}
  }

  function countActive() {
    return Object.keys(active).filter(function (k) { return active[k]; }).length;
  }

  function render() {
    document.querySelectorAll('#relics-grid .relic-card').forEach(function (btn) {
      var id = btn.getAttribute('data-relic');
      var on = !!active[id];
      btn.classList.toggle('active', on);
      var st = btn.querySelector('.relic-state');
      if (st) st.textContent = on ? 'АКТИВНО' : 'НЕАКТИВНО';
    });
    var c = $('relics-active');
    if (c) c.textContent = String(countActive());
  }

  function toggle(id) {
    if (!id) return;
    active[id] = !active[id];
    save();
    render();
    var names = {
      cube: 'Куб Ока', seal: 'Печать Жизни', scales: 'Весы Кары',
      ring: 'Кольцо Троп', scepter: 'Скипетр Императора', 'eye-cube': 'Глаз Куба'
    };
    toast((active[id] ? 'Активировано: ' : 'Снято: ') + (names[id] || id));
  }

  function isActive(id) { return !!active[id]; }

  /** Бонусы для дуэли / башни */
  function getBonuses() {
    return {
      lpMult: active.seal ? 1.05 : 1,
      atkFlat: active.scales ? 250 : 0,
      xpMult: active.scepter ? 1.15 : 1,
      contribMult: active.cube ? 1.1 : 1,
      extraSummon: active.ring ? 1 : 0,
      legendChance: active['eye-cube'] ? 0.1 : 0
    };
  }

  function bindRelics() {
    var grid = $('relics-grid');
    if (!grid || grid._bm) return;
    grid._bm = true;
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-relic]');
      if (!btn) return;
      toggle(btn.getAttribute('data-relic'));
    });
  }

  /* ---------- модалка лора Столпа ---------- */
  function openPillar(id) {
    var data = global.BloodData && global.BloodData.getPillar
      ? global.BloodData.getPillar(id)
      : (global.BloodData && global.BloodData.PILLARS && global.BloodData.PILLARS[id]);
    if (!data) {
      toast('Столп не найден');
      return;
    }
    var modal = $('pillar-modal');
    if (!modal) {
      toast(data.name + ': ' + (data.passiveName || ''));
      return;
    }
    var art = $('pillar-art');
    var name = $('pillar-name');
    var pas = $('pillar-passive');
    var lore = $('pillar-lore');
    if (art) art.style.backgroundImage = 'url("' + (data.art || '') + '")';
    if (name) name.textContent = data.name + (data.title ? ' · ' + data.title : '');
    if (pas) pas.textContent = (data.passiveName || '') + ' — ' + (data.passiveText || data.short || '');
    if (lore) lore.textContent = data.lore || data.short || '';
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closePillar() {
    var modal = $('pillar-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  function bindPillarUi() {
    var close = $('btn-close-pillar');
    if (close && !close._bm) {
      close._bm = true;
      close.addEventListener('click', closePillar);
    }
    var modal = $('pillar-modal');
    if (modal && !modal._bm) {
      modal._bm = true;
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closePillar();
      });
    }

    document.addEventListener('click', function (e) {
      var stele = e.target.closest && e.target.closest('[data-pantheon]');
      if (!stele) return;
      var id = stele.getAttribute('data-pantheon');
      if (id) openPillar(id);
    });
  }

  function onShow() {
    load();
    bindRelics();
    render();
  }

  global.BloodRelics = {
    onShow: onShow,
    toggle: toggle,
    isActive: isActive,
    getBonuses: getBonuses,
    openPillar: openPillar,
    closePillar: closePillar,
    render: render
  };

  /* back-compat */
  global.openPantheonDetail = openPillar;
  global.closePantheonDetail = closePillar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      load();
      bindRelics();
      bindPillarUi();
      render();
    });
  } else {
    load();
    bindRelics();
    bindPillarUi();
    render();
  }
})(typeof window !== 'undefined' ? window : this);
