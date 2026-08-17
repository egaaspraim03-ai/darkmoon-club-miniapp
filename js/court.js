/* ============================================================
   Blood Moon — Двор Императора  v1.4
   window.BloodCourt = { onShow, onHide, redraw, setFocus, openChar }
   + rays · ambient beams · spark · shatter shards · focus glow
   ============================================================ */
(function () {
  'use strict';

  /* hierarchy lines (mockup tree) */
  var LINKS = [
    ['inquisitor', 'emperor'],
    ['emperor', 'eye'],
    ['eye', 'punisher'],
    ['eye', 'galya'],
    ['punisher', 'cheshire'],
    ['galya', 'cheshire'],
    ['emperor', 'cheshire'],
    ['inquisitor', 'eye']
  ];

  /* full cards — title, role, lore, optional art path */
  var CHAR_DATA = {
    inquisitor: {
      ico: '⚔️',
      name: 'Инквизитор',
      role: 'Клинок Правосудия',
      art: 'assets/chars/inquisitor.png',
      html:
        '<div class="char-name">⚔️ Инквизитор</div>' +
        '<p class="char-role">Клинок Правосудия · Двор Императора</p>' +
        '<p>Мужик, священным мечом крушит нечисть, любит мыло.</p>' +
        '<p class="muted">Его клинок не прощает. Мыло — священный артефакт расследования.</p>'
    },
    emperor: {
      ico: '🩸',
      name: 'Император',
      role: 'Бессмертный',
      art: 'assets/chars/emperor.png',
      html:
        '<div class="char-name">🩸 Император</div>' +
        '<p class="char-role">Владыка Кровавой Луны</p>' +
        '<p>Бессмертное существо, которое любит искать мыло для инквизитора.</p>' +
        '<p class="muted">Дань принимается. Слабость — нет. Под луной все равны… кроме Него.</p>'
    },
    eye: {
      ico: '👁️',
      name: 'Всевидящее Око',
      role: 'Видит всё',
      art: 'assets/chars/eye.png',
      html:
        '<div class="char-name">👁️ Всевидящее Око</div>' +
        '<p class="char-role">Страж тайны и предсказаний</p>' +
        '<p>Поговаривают, она видит всё и даже для чего нужно инквизитору мыло.</p>' +
        '<p class="muted">Взгляд Ока — приговор. Ускользнуть нельзя.</p>'
    },
    punisher: {
      ico: '🔥',
      name: 'Каратель',
      role: 'Наказание',
      art: 'assets/chars/punisher.png',
      html:
        '<div class="char-name">🔥 Каратель</div>' +
        '<p class="char-role">Огонь приговора</p>' +
        '<p>Она наказывает тех, у кого найдёт мыло.</p>' +
        '<p class="muted">Список штрафников ведёт именно она. Оплати — или удвой норму.</p>'
    },
    galya: {
      ico: '📜',
      name: 'Галя',
      role: 'Помощница Главы',
      art: 'assets/chars/galya.png',
      html:
        '<div class="char-name">🧼 Галя</div>' +
        '<p class="char-role">Хранительница порядка и мыла</p>' +
        '<p>Девушка, которая всегда помогает главе, особенно когда дело касается возраста мыла бракованного.</p>' +
        '<p class="muted">Без Гали двор тонет в хаосе. С ней — в крови, но по регламенту.</p>'
    },
    cheshire: {
      ico: '😺',
      name: 'Чеширский Кот',
      role: 'Начальник Стражи',
      art: 'assets/chars/cheshire.png',
      html:
        '<div class="char-name">😺 Чеширский Кот</div>' +
        '<p class="char-role">Начальник стражи · «живёт там, где кормит»</p>' +
        '<p>Начальник стражи и живёт там, где кормит.</p>' +
        '<p class="muted">Улыбка остаётся. След — нет. Стража верна тому, кто кормит лучше.</p>'
    }
  };

  var shards = [];
  var raf = null;
  var shatterReady = false;
  var ambientTimer = null;
  var pulseTimer = null;
  var currentFocus = null;
  var reducedMotion = false;

  try {
    reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

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

  function moonCenter(stage) {
    var moon = stage.querySelector('.court-moon');
    if (!moon) return { x: 180, y: 210 };
    return nodeCenter(moon, stage);
  }

  function drawRays() {
    var stage = document.getElementById('court-stage');
    var g = document.getElementById('ray-group');
    if (!stage || !g) return;
    var map = {};
    stage.querySelectorAll('.court-node').forEach(function (btn) {
      var k = btn.getAttribute('data-char');
      if (k) map[k] = nodeCenter(btn, stage);
    });
    g.innerHTML = '';

    LINKS.forEach(function (pair, idx) {
      var a = map[pair[0]], b = map[pair[1]];
      if (!a || !b) return;
      var mx = (a.x + b.x) / 2 + (idx % 2 ? 18 : -18);
      var my = (a.y + b.y) / 2 + (idx % 3 === 0 ? -10 : 8);
      var d = 'M' + a.x.toFixed(1) + ',' + a.y.toFixed(1) +
        ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' +
        b.x.toFixed(1) + ',' + b.y.toFixed(1);

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', d);
      line.setAttribute('class', 'ray-line');
      line.setAttribute('data-from', pair[0]);
      line.setAttribute('data-to', pair[1]);
      g.appendChild(line);

      var hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'ray-hit');
      hit.style.pointerEvents = 'stroke';
      hit.style.stroke = 'transparent';
      hit.style.strokeWidth = '18';
      hit.style.fill = 'none';
      hit.style.cursor = 'pointer';
      (function (lineRef, pa, pb) {
        hit.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          explodeRay(lineRef, pa, pb);
          haptic('medium');
        });
      })(line, a, b);
      g.appendChild(hit);
    });

    if (!reducedMotion) drawAmbientRays(g, stage);
  }

  function drawAmbientRays(g, stage) {
    var m = moonCenter(stage);
    var n = 6 + Math.floor(Math.random() * 5);
    for (var i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.55;
      var len = 36 + Math.random() * 70;
      var x2 = m.x + Math.cos(ang) * len;
      var y2 = m.y + Math.sin(ang) * len;
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + m.x.toFixed(1) + ',' + m.y.toFixed(1) + ' L' + x2.toFixed(1) + ',' + y2.toFixed(1));
      p.setAttribute('class', 'ray-ambient');
      p.style.animationDelay = (Math.random() * 2.8) + 's';
      g.appendChild(p);
    }
  }

  function explodeRay(line, a, b) {
    var g = document.getElementById('ray-group');
    if (!g) return;
    line.classList.add('fly');
    var mx = (a.x + b.x) / 2;
    var my = (a.y + b.y) / 2;
    var dirs = [
      [-30 - Math.random() * 20, -18 - Math.random() * 16],
      [28 + Math.random() * 22, -14 - Math.random() * 18],
      [(Math.random() - 0.5) * 20, 30 + Math.random() * 24]
    ];
    dirs.forEach(function (dir) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + mx.toFixed(1) + ',' + my.toFixed(1) +
        ' L' + (mx + dir[0]).toFixed(1) + ',' + (my + dir[1]).toFixed(1));
      p.setAttribute('class', 'ray-line fly');
      p.style.strokeDasharray = '5 4';
      g.appendChild(p);
      setTimeout(function () { try { p.remove(); } catch (e) {} }, 820);
    });
    setTimeout(function () { line.classList.remove('fly'); }, 750);
  }

  function spawnSparks() {
    var stage = document.getElementById('court-stage');
    if (!stage || reducedMotion) return;
    stage.querySelectorAll('.court-spark').forEach(function (el) { el.remove(); });
    if (!stage.querySelector('.court-moon')) return;
    var count = 10;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'court-spark';
      var ang = Math.random() * Math.PI * 2;
      var dist = 70 + Math.random() * 140;
      s.style.left = '50%';
      s.style.top = '38%';
      s.style.setProperty('--sx', (Math.cos(ang) * dist) + 'px');
      s.style.setProperty('--sy', (Math.sin(ang) * dist) + 'px');
      s.style.animationDelay = (Math.random() * 3.2) + 's';
      s.style.animationDuration = (2.8 + Math.random() * 2.8) + 's';
      stage.appendChild(s);
    }
  }

  function bindMoon() {
    var stage = document.getElementById('court-stage');
    if (!stage || stage._moonBound) return;
    stage._moonBound = true;
    var moon = stage.querySelector('.court-moon');
    if (!moon) return;
    moon.style.cursor = 'pointer';
    moon.setAttribute('role', 'button');
    moon.setAttribute('aria-label', 'Кровавая Луна');
    moon.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      moon.classList.add('moon-pulse-hit');
      setTimeout(function () { moon.classList.remove('moon-pulse-hit'); }, 600);
      drawRays();
      spawnSparks();
      burstShards(18);
      haptic('medium');
    });
  }
   function initShatter() {
    var canvas = document.getElementById('cs-canvas');
    if (!canvas || shatterReady) return;
    shatterReady = true;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      var w = canvas.clientWidth || 120;
      var h = canvas.clientHeight || 200;
      if (w < 8 || h < 8) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    var img = document.getElementById('cs-img');
    if (img) img.addEventListener('load', resize);

    function spawn() {
      if (reducedMotion) return;
      var w = canvas.clientWidth || canvas.width;
      var h = canvas.clientHeight || canvas.height;
      if (w < 10) return;
      for (var i = 0; i < 2; i++) {
        shards.push({
          x: w * (0.40 + Math.random() * 0.55),
          y: h * (0.10 + Math.random() * 0.60),
          vx: 0.4 + Math.random() * 1.5,
          vy: (Math.random() - 0.4) * 1.6,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.12,
          life: 70 + Math.random() * 120,
          age: 0,
          s: 2 + Math.random() * 5,
          c: Math.random() > 0.4 ? 'rgba(255,45,85,0.92)' : 'rgba(255,190,205,0.78)'
        });
      }
      if (shards.length > 140) shards.splice(0, shards.length - 140);
    }

    function tick() {
      var w = canvas.clientWidth || 1;
      var h = canvas.clientHeight || 1;
      ctx.clearRect(0, 0, w + 2, h + 2);
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
        p.vy += 0.015;
        p.rot += p.vr;
        var a = 1 - p.age / p.life;
        if (a <= 0 || p.x > w + 14 || p.y > h + 14 || p.y < -10) {
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

  function burstShards(n) {
    var canvas = document.getElementById('cs-canvas');
    if (!canvas || reducedMotion) return;
    var w = canvas.clientWidth || 100;
    var h = canvas.clientHeight || 160;
    for (var i = 0; i < (n || 12); i++) {
      shards.push({
        x: w * (0.35 + Math.random() * 0.5),
        y: h * (0.2 + Math.random() * 0.5),
        vx: 0.8 + Math.random() * 2.2,
        vy: (Math.random() - 0.5) * 2.4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.18,
        life: 50 + Math.random() * 80,
        age: 0,
        s: 3 + Math.random() * 6,
        c: Math.random() > 0.35 ? 'rgba(255,30,70,0.95)' : 'rgba(255,200,210,0.85)'
      });
    }
  }

  function setPortrait(key) {
    var data = CHAR_DATA[key];
    var img = document.getElementById('cs-img');
    var solid = document.querySelector('.court-shatter .cs-solid');
    if (!img) return;
    if (data && data.art) {
      img.style.display = '';
      img.onerror = function () {
        img.style.display = 'none';
        if (solid) solid.setAttribute('data-fallback', data.ico || '🩸');
      };
      img.src = data.art;
    } else {
      img.style.display = 'none';
    }
  }

  function openChar(key) {
    var detail = document.getElementById('char-detail');
    if (!detail) return;
    var data = CHAR_DATA[key];
    var body = data
      ? data.html
      : '<p class="muted">Нет описания</p>';

    detail.classList.remove('hidden');
    detail.innerHTML =
      body +
      '<button class="btn-secondary" type="button" id="char-back" style="margin-top:12px">← Закрыть</button>';

    var back = document.getElementById('char-back');
    if (back) {
      back.onclick = function () {
        detail.classList.add('hidden');
        document.querySelectorAll('.court-node').forEach(function (n) {
          n.classList.remove('focus');
        });
        currentFocus = null;
        haptic('light');
      };
    }

    setPortrait(key);
    burstShards(10);
    haptic('medium');
  }

  function setFocus(key) {
    if (!key) return;
    currentFocus = key;
    document.querySelectorAll('.court-node').forEach(function (n) {
      n.classList.toggle('focus', n.getAttribute('data-char') === key);
    });
    openChar(key);
  }

  function bindNodes() {
    var stage = document.getElementById('court-stage');
    if (!stage || stage._courtBound) return;
    stage._courtBound = true;

    stage.querySelectorAll('.court-node').forEach(function (btn) {
      btn.setAttribute('type', 'button');
      if (!btn.getAttribute('aria-label')) {
        var k = btn.getAttribute('data-char');
        var d = CHAR_DATA[k];
        btn.setAttribute('aria-label', d ? d.name + ' — ' + d.role : k);
      }
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var key = btn.getAttribute('data-char');
        setFocus(key);
      });
    });

    bindMoon();
  }

  function onShow() {
    bindNodes();
    initShatter();
    spawnSparks();
    setTimeout(drawRays, 30);
    setTimeout(drawRays, 180);
    setTimeout(drawRays, 420);

    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = setInterval(function () {
      var el = document.getElementById('screen-characters');
      if (el && el.classList.contains('active')) {
        drawRays();
        spawnSparks();
      }
    }, 4200);

    if (pulseTimer) clearInterval(pulseTimer);
    if (!reducedMotion) {
      pulseTimer = setInterval(function () {
        var moon = document.querySelector('#court-stage .court-moon');
        if (!moon) return;
        var el = document.getElementById('screen-characters');
        if (!el || !el.classList.contains('active')) return;
        moon.classList.add('moon-breathe');
        setTimeout(function () { moon.classList.remove('moon-breathe'); }, 900);
      }, 5200);
    }
  }

  function onHide() {
    if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
    if (pulseTimer) { clearInterval(pulseTimer); pulseTimer = null; }
  }

  function patchNav() {
    var el = document.getElementById('screen-characters');
    if (!el) return;
    var obs = new MutationObserver(function () {
      if (el.classList.contains('active')) onShow();
      else onHide();
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        if (el.classList.contains('active')) drawRays();
      }, 120);
    });

    if (el.classList.contains('active')) onShow();
  }

  window.BloodCourt = {
    onShow: onShow,
    onHide: onHide,
    redraw: drawRays,
    setFocus: setFocus,
    openChar: openChar,
    CHAR_DATA: CHAR_DATA
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchNav);
  } else {
    patchNav();
  }
})();
