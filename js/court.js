/* Blood Moon — Двор Императора
   Луна · стеклянные узлы · SVG-лучи · осколки
   window.BloodCourt = { onShow, redraw }
*/
(function () {
  'use strict';

  var LINKS = [
    ['inquisitor', 'emperor'],
    ['emperor', 'eye'],
    ['eye', 'punisher'],
    ['eye', 'galya'],
    ['punisher', 'cheshire'],
    ['galya', 'cheshire'],
    ['emperor', 'cheshire']
  ];

  var CHAR_TEXTS = {
    inquisitor: '<div class="char-name">⚔️ Инквизитор</div><p>Мужик, священным мечом крушит нечисть, любит мыло.</p>',
    emperor: '<div class="char-name">🩸 Император</div><p>Бессмертное существо, которое любит искать мыло для инквизитора.</p>',
    eye: '<div class="char-name">👁️ Всевидящее Око</div><p>Поговаривают, она видит всё и даже для чего нужно инквизитору мыло.</p>',
    punisher: '<div class="char-name">🔥 Каратель</div><p>Она наказывает тех, у кого найдёт мыло.</p>',
    galya: '<div class="char-name">🧼 Галя</div><p>Девушка, которая всегда помогает главе, особенно когда дело касается возраста мыла бракованного.</p>',
    cheshire: '<div class="char-name">😺 Чеширский Кот</div><p>Начальник стражи и живёт там, где кормит.</p>'
  };

  var shards = [];
  var raf = null;
  var shatterReady = false;

  function haptic(k) {
    try {
      var tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.HapticFeedback) {
        if (k === 'success' || k === 'error' || k === 'warning') tg.HapticFeedback.notificationOccurred(k);
        else tg.HapticFeedback.impactOccurred(k || 'light');
      }
    } catch (e) {}
  }

  function nodeCenter(btn, stage) {
    var r = btn.getBoundingClientRect();
    var s = stage.getBoundingClientRect();
    if (!s.width || !s.height) return { x: 180, y: 280 };
    return {
      x: ((r.left + r.width / 2) - s.left) / s.width * 360,
      y: ((r.top + r.height / 2) - s.top) / s.height * 560
    };
  }

  function drawRays() {
    var stage = document.getElementById('court-stage');
    var g = document.getElementById('ray-group');
    if (!stage || !g) return;
    var map = {};
    stage.querySelectorAll('.court-node').forEach(function (btn) {
      map[btn.getAttribute('data-char')] = nodeCenter(btn, stage);
    });
    g.innerHTML = '';
    LINKS.forEach(function (pair, idx) {
      var a = map[pair[0]], b = map[pair[1]];
      if (!a || !b) return;
      var mx = (a.x + b.x) / 2 + (idx % 2 ? 14 : -14);
      var my = (a.y + b.y) / 2;
      var d = 'M' + a.x.toFixed(1) + ',' + a.y.toFixed(1) +
        ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' +
        b.x.toFixed(1) + ',' + b.y.toFixed(1);
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', d);
      line.setAttribute('class', 'ray-line');
      line.setAttribute('data-ray', String(idx));
      g.appendChild(line);
      var hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'ray-hit');
      hit.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        explodeRay(line, a, b);
        haptic('medium');
      });
      g.appendChild(hit);
    });
  }

  function explodeRay(line, a, b) {
    var g = document.getElementById('ray-group');
    if (!g) return;
    line.classList.add('fly');
    var mx = (a.x + b.x) / 2;
    var my = (a.y + b.y) / 2;
    var dirs = [[-32, -20], [34, -14], [6, 36]];
    dirs.forEach(function (dir) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + mx + ',' + my + ' L' + (mx + dir[0]) + ',' + (my + dir[1]));
      p.setAttribute('class', 'ray-line fly');
      p.style.strokeDasharray = '5 4';
      g.appendChild(p);
      setTimeout(function () { try { p.remove(); } catch (e) {} }, 780);
    });
    setTimeout(function () { line.classList.remove('fly'); }, 720);
  }

  function initShatter() {
    var canvas = document.getElementById('cs-canvas');
    if (!canvas || shatterReady) return;
    shatterReady = true;
    var ctx = canvas.getContext('2d');

    function resize() {
      var w = canvas.clientWidth || 120;
      var h = canvas.clientHeight || 200;
      if (w < 8 || h < 8) return;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);
    var img = document.getElementById('cs-img');
    if (img) img.addEventListener('load', resize);

    function spawn() {
      var w = canvas.width, h = canvas.height;
      if (w < 10) return;
      for (var i = 0; i < 2; i++) {
        shards.push({
          x: w * (0.42 + Math.random() * 0.52),
          y: h * (0.12 + Math.random() * 0.58),
          vx: 0.35 + Math.random() * 1.35,
          vy: (Math.random() - 0.42) * 1.5,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.1,
          life: 70 + Math.random() * 110,
          age: 0,
          s: 2 + Math.random() * 4.5,
          c: Math.random() > 0.45 ? 'rgba(255,45,85,0.9)' : 'rgba(255,190,205,0.75)'
        });
      }
      if (shards.length > 130) shards.splice(0, shards.length - 130);
    }

    function tick() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var screen = document.getElementById('screen-characters');
      if (!screen || !screen.classList.contains('active')) {
        raf = requestAnimationFrame(tick);
        return;
      }
      spawn();
      for (var i = shards.length - 1; i >= 0; i--) {
        var p = shards[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.014;
        p.rot += p.vr;
        var a = 1 - p.age / p.life;
        if (a <= 0 || p.x > w + 12 || p.y > h + 12) {
          shards.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.65);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function openChar(key) {
    var detail = document.getElementById('char-detail');
    if (!detail) return;
    detail.classList.remove('hidden');
    detail.innerHTML = (CHAR_TEXTS[key] || '<p class="muted">Нет описания</p>') +
      '<button class="btn-secondary" type="button" id="char-back" style="margin-top:12px">← Закрыть</button>';
    var back = document.getElementById('char-back');
    if (back) {
      back.onclick = function () {
        detail.classList.add('hidden');
        haptic('light');
      };
    }
    haptic('medium');
  }

  function bindNodes() {
    var stage = document.getElementById('court-stage');
    if (!stage || stage._courtBound) return;
    stage._courtBound = true;
    stage.querySelectorAll('.court-node').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openChar(btn.getAttribute('data-char'));
      });
    });
  }

  function onShow() {
    bindNodes();
    initShatter();
    setTimeout(drawRays, 30);
    setTimeout(drawRays, 180);
    setTimeout(drawRays, 400);
  }

  function patchNav() {
    var el = document.getElementById('screen-characters');
    if (!el) return;
    var obs = new MutationObserver(function () {
      if (el.classList.contains('active')) onShow();
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function () {
      if (el.classList.contains('active')) drawRays();
    });
    if (el.classList.contains('active')) onShow();
  }

  window.BloodCourt = { onShow: onShow, redraw: drawRays };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchNav);
  } else {
    patchNav();
  }
})();
