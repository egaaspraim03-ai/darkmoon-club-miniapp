/* Blood Moon — Змейка крови v2 (unique gameplay)
   Наград нет — только рейтинг чести.
   window.BloodSnake = { onShow, onHide, start, levels }
*/
(function () {
  'use strict';

  var STORAGE = 'bloodmoon_snake_v2';
  var COLS = 15;
  var ROWS = 18;

  /* Уровни: Сытый / Шалун / Голодный / Тебя кормят? */
  var LEVELS = [
    {
      id: 'shadow',
      title: '🌑 Тень',
      tag: 'Сытый',
      sub: 'Новичок. Стены-портал, мало камней, лунный ритм мягкий.',
      baseTick: 165,
      lengthSpeed: 2.0,
      maxSpeedMul: 1.5,
      stones: 3,
      wrap: true,
      frenzyChance: 0.04,
      soapChance: 0.03
    },
    {
      id: 'ghoul',
      title: '🦇 Упырь',
      tag: 'Шалун',
      sub: 'Аппетит шалит. Стены убивают. Комбо капель даёт бонус.',
      baseTick: 132,
      lengthSpeed: 2.8,
      maxSpeedMul: 1.8,
      stones: 6,
      wrap: false,
      frenzyChance: 0.06,
      soapChance: 0.04
    },
    {
      id: 'vampire',
      title: '🩸 Вампир',
      tag: 'Голодный',
      sub: 'Кости + камни. Жажда растёт — игнор жажды = штраф скорости.',
      baseTick: 108,
      lengthSpeed: 3.6,
      maxSpeedMul: 2.1,
      stones: 8,
      wrap: false,
      frenzyChance: 0.08,
      soapChance: 0.05
    },
    {
      id: 'emperor',
      title: '👑 Жажда Императора',
      tag: 'Тебя кормят?',
      sub: 'Ад. Камни плодятся, луна давит, ошибка = прах.',
      baseTick: 88,
      lengthSpeed: 4.4,
      maxSpeedMul: 2.4,
      stones: 11,
      wrap: false,
      frenzyChance: 0.1,
      soapChance: 0.06
    }
  ];

  /* Капли — уникальные эффекты */
  var DROPS = {
    red:    { color: '#ff2d55', glow: '#ff1f45', points: 10, speedMul: 1.0,  ms: 0,    label: 'Алая' },
    gold:   { color: '#c9a227', glow: '#ffd060', points: 28, speedMul: 0.82, ms: 2600, label: 'Золотая' },
    violet: { color: '#a855f7', glow: '#c084fc', points: 16, speedMul: 1.28, ms: 2400, label: 'Фиолет' },
    cyan:   { color: '#22d3ee', glow: '#67e8f9', points: 14, speedMul: 1.42, ms: 2200, label: 'Лунная' },
    black:  { color: '#3a0a14', glow: '#7f1d1d', points: 6,  speedMul: 0.72, ms: 2000, label: 'Сгусток', shrink: 2 },
    soap:   { color: '#f0f9ff', glow: '#e0f2fe', points: 40, speedMul: 1.0,  ms: 0,    label: 'Святое мыло', soap: true },
    frenzy: { color: '#fb7185', glow: '#ff1f45', points: 8,  speedMul: 1.55, ms: 3500, label: 'Жажда', frenzy: true }
  };

  var state = {
    running: false,
    paused: false,
    over: false,
    level: LEVELS[0],
    snake: [],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: null,
    stones: [],
    bones: [],
    score: 0,
    best: 0,
    tickMs: 160,
    tempSpeedMul: 1,
    tempUntil: 0,
    loopId: null,
    cell: 20,
    canvas: null,
    ctx: null,
    lastTs: 0,
    acc: 0,
    combo: 0,
    lastKind: null,
    hunger: 0,
    moonPhase: 0,
    shield: 0,
    frenzy: false,
    particles: [],
    stepsSinceFood: 0,
    invuln: 0
  };

  function loadBoard() {
    try {
      var raw = localStorage.getItem(STORAGE);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    try {
      var old = localStorage.getItem('bloodmoon_snake_v1');
      if (old) return JSON.parse(old);
    } catch (e2) {}
    return { best: 0, byLevel: {}, board: [] };
  }
  function saveBoard(b) {
    try { localStorage.setItem(STORAGE, JSON.stringify(b)); } catch (e) {}
  }

  function haptic(k) {
    try {
      var tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.HapticFeedback) {
        if (k === 'success' || k === 'error' || k === 'warning') tg.HapticFeedback.notificationOccurred(k);
        else tg.HapticFeedback.impactOccurred(k || 'light');
      }
    } catch (e) {}
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function randCell(exclude) {
    var free = [], x, y, k, blocked = {};
    exclude = exclude || [];
    for (k = 0; k < exclude.length; k++) blocked[exclude[k].x + ',' + exclude[k].y] = 1;
    for (y = 0; y < ROWS; y++) {
      for (x = 0; x < COLS; x++) {
        if (!blocked[x + ',' + y]) free.push({ x: x, y: y });
      }
    }
    if (!free.length) return { x: 0, y: 0 };
    return free[Math.floor(Math.random() * free.length)];
  }

  function pickDropType() {
    var r = Math.random();
    var lv = state.level;
    if (r < (lv.soapChance || 0.03)) return 'soap';
    if (r < (lv.soapChance || 0.03) + (lv.frenzyChance || 0.05)) return 'frenzy';
    r = Math.random();
    if (r < 0.48) return 'red';
    if (r < 0.66) return 'violet';
    if (r < 0.80) return 'cyan';
    if (r < 0.92) return 'gold';
    return 'black';
  }

  function spawnFood() {
    var exclude = state.snake.concat(state.stones).concat(state.bones);
    if (state.food) exclude.push(state.food);
    var c = randCell(exclude);
    state.food = { x: c.x, y: c.y, kind: pickDropType(), born: performance.now() };
  }

  function spawnHazards(nStones) {
    state.stones = [];
    state.bones = [];
    var exclude = state.snake.slice();
    var i, c;
    for (i = 0; i < nStones; i++) {
      c = randCell(exclude.concat(state.stones).concat(state.bones));
      state.stones.push(c);
    }
    var nBones = state.level.id === 'vampire' ? 2 : (state.level.id === 'emperor' ? 4 : (state.level.id === 'ghoul' ? 1 : 0));
    for (i = 0; i < nBones; i++) {
      c = randCell(exclude.concat(state.stones).concat(state.bones));
      state.bones.push(c);
    }
  }

  function burst(x, y, color, n) {
    var i;
    for (i = 0; i < (n || 8); i++) {
      state.particles.push({
        x: x * state.cell + state.cell / 2,
        y: y * state.cell + state.cell / 2,
        vx: (Math.random() - 0.5) * 3.5,
        vy: (Math.random() - 0.5) * 3.5,
        life: 400 + Math.random() * 300,
        age: 0,
        color: color
      });
    }
  }

  function resetSnake() {
    var midX = Math.floor(COLS / 2);
    var midY = Math.floor(ROWS / 2);
    state.snake = [
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
      { x: midX - 3, y: midY }
    ];
    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };
    state.score = 0;
    state.tempSpeedMul = 1;
    state.tempUntil = 0;
    state.over = false;
    state.paused = false;
    state.combo = 0;
    state.lastKind = null;
    state.hunger = 20;
    state.shield = 0;
    state.frenzy = false;
    state.particles = [];
    state.stepsSinceFood = 0;
    state.invuln = 0;
    spawnHazards(state.level.stones);
    spawnFood();
    updateHud();
  }

  function computeTick() {
    var len = state.snake.length;
    var base = state.level.baseTick;
    var speedFromLen = 1 + (len - 3) * (state.level.lengthSpeed / 100);
    if (speedFromLen > state.level.maxSpeedMul) speedFromLen = state.level.maxSpeedMul;
    var mul = speedFromLen * state.tempSpeedMul;
    if (state.hunger > 75) mul *= 0.88;
    else if (state.hunger < 25 && state.frenzy) mul *= 1.08;
    if (mul < 0.45) mul = 0.45;
    if (mul > 3.2) mul = 3.2;
    return Math.max(40, Math.round(base / mul));
  }

  function setDir(dx, dy) {
    if (!state.running || state.over) return;
    if (dx === -state.dir.x && dy === -state.dir.y) return;
    if (dx === 0 && dy === 0) return;
    state.nextDir = { x: dx, y: dy };
  }

  function hitHazard(reason) {
    if (state.invuln > 0) return false;
    if (state.shield > 0) {
      state.shield -= 1;
      state.invuln = 8;
      toast('🧼 Мыло спасло! Щит: ' + state.shield);
      haptic('warning');
      burst(state.snake[0].x, state.snake[0].y, '#e0f2fe', 12);
      return true;
    }
    gameOver(reason);
    return true;
  }

  function step() {
    if (!state.running || state.paused || state.over) return;

    state.dir = state.nextDir;
    var head = state.snake[0];
    var nx = head.x + state.dir.x;
    var ny = head.y + state.dir.y;

    if (state.level.wrap) {
      if (nx < 0) nx = COLS - 1;
      if (nx >= COLS) nx = 0;
      if (ny < 0) ny = ROWS - 1;
      if (ny >= ROWS) ny = 0;
    } else {
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
        hitHazard('Стена крови…');
        return;
      }
    }

    var i;
    for (i = 0; i < state.snake.length; i++) {
      if (state.snake[i].x === nx && state.snake[i].y === ny) {
        hitHazard('Сам себя…');
        return;
      }
    }
    for (i = 0; i < state.stones.length; i++) {
      if (state.stones[i].x === nx && state.stones[i].y === ny) {
        hitHazard('Камень вместо крови');
        return;
      }
    }
    for (i = 0; i < state.bones.length; i++) {
      if (state.bones[i].x === nx && state.bones[i].y === ny) {
        hitHazard('Кость Императора');
        return;
      }
    }

    if (state.over) return;

    state.snake.unshift({ x: nx, y: ny });
    if (state.invuln > 0) state.invuln -= 1;

    state.stepsSinceFood += 1;
    state.hunger = Math.min(100, state.hunger + (state.level.id === 'emperor' ? 2.2 : 1.4));

    var ate = state.food && state.food.x === nx && state.food.y === ny;
    if (ate) {
      var kindKey = state.food.kind;
      var kind = DROPS[kindKey] || DROPS.red;
      var pts = kind.points;

      if (state.lastKind === kindKey && kindKey !== 'soap' && kindKey !== 'frenzy') {
        state.combo += 1;
        pts += Math.min(30, state.combo * 5);
        if (state.combo >= 3) toast('🔥 Комбо ×' + state.combo + ' · +' + pts);
      } else {
        state.combo = 1;
      }
      state.lastKind = kindKey;

      state.score += pts;
      state.hunger = Math.max(0, state.hunger - 35);
      state.stepsSinceFood = 0;

      if (kind.ms) {
        state.tempSpeedMul = kind.speedMul;
        state.tempUntil = performance.now() + kind.ms;
      } else if (kind.speedMul && kind.speedMul !== 1) {
        state.tempSpeedMul = kind.speedMul;
        state.tempUntil = performance.now() + 2000;
      }

      if (kind.shrink) {
        var s = kind.shrink;
        while (s-- > 0 && state.snake.length > 3) state.snake.pop();
      }
      if (kind.soap) {
        state.shield += 1;
        toast('🧼 Святое мыло! Щит +1 (всего ' + state.shield + ')');
        haptic('success');
      }
      if (kind.frenzy) {
        state.frenzy = true;
        state.tempSpeedMul = 1.55;
        state.tempUntil = performance.now() + 3500;
        toast('🩸 ЖАЖДА! Скорость крови…');
      }

      burst(nx, ny, kind.glow || kind.color, 10);
      haptic(kind.soap ? 'success' : 'medium');
      spawnFood();

      if (state.level.id === 'emperor' && Math.random() < 0.14) {
        var c = randCell(state.snake.concat(state.stones).concat(state.bones).concat([state.food]));
        state.stones.push(c);
      }
      if (state.level.id === 'vampire' && state.bones.length && Math.random() < 0.1) {
        state.bones[Math.floor(Math.random() * state.bones.length)] =
          randCell(state.snake.concat(state.stones).concat(state.bones).concat([state.food]));
      }
    } else {
      state.snake.pop();
      if (state.stepsSinceFood > 40 && state.stepsSinceFood % 15 === 0) {
        state.score = Math.max(0, state.score - 2);
      }
    }

    if (state.tempUntil && performance.now() > state.tempUntil) {
      state.tempSpeedMul = 1;
      state.tempUntil = 0;
      state.frenzy = false;
    }

    if (state.hunger >= 100 && state.level.id === 'emperor') {
      gameOver('Императорский голод');
      return;
    }

    state.tickMs = computeTick();
    updateHud();
  }

  function gameOver(reason) {
    state.over = true;
    state.running = false;
    cancelAnim();
    haptic('error');
    var board = loadBoard();
    if (state.score > (board.best || 0)) board.best = state.score;
    if (!board.byLevel) board.byLevel = {};
    var lid = state.level.id;
    if (!board.byLevel[lid] || state.score > board.byLevel[lid]) board.byLevel[lid] = state.score;
    var nick = 'Гость';
    try {
      var u = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
      if (u) nick = u.first_name || u.username || nick;
    } catch (e) {}
    if (!board.board) board.board = [];
    board.board.push({
      name: nick,
      score: state.score,
      level: state.level.title,
      levelId: lid,
      at: Date.now()
    });
    board.board.sort(function (a, b) { return b.score - a.score; });
    board.board = board.board.slice(0, 15);
    saveBoard(board);
    state.best = board.best;
    showOverlay(
      '💀 ' + (reason || 'Конец'),
      'Кровь: <b style="color:var(--neon)">' + state.score + '</b><br>Рекорд: ' + state.best +
      (state.combo > 1 ? '<br>Макс. комбо в забеге учтён в очках' : '') +
      '<br><span class="muted">Наград нет — только честь</span>',
      true
    );
    renderScores();
    updateHud();
  }

  /* === END PART 1 — сразу PART 2 === */
 function cancelAnim() {
    if (state.loopId) {
      cancelAnimationFrame(state.loopId);
      state.loopId = null;
    }
  }

  function loop(ts) {
    if (!state.running || state.over) return;
    if (!state.lastTs) state.lastTs = ts;
    var dt = ts - state.lastTs;
    state.lastTs = ts;
    state.moonPhase = (state.moonPhase + dt * 0.001) % 1;

    var p, pi;
    for (pi = state.particles.length - 1; pi >= 0; pi--) {
      p = state.particles[pi];
      p.age += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      if (p.age >= p.life) state.particles.splice(pi, 1);
    }

    if (!state.paused) {
      state.acc += dt;
      while (state.acc >= state.tickMs) {
        state.acc -= state.tickMs;
        step();
        if (state.over) { draw(); return; }
      }
    }
    draw();
    state.loopId = requestAnimationFrame(loop);
  }

  function draw() {
    var ctx = state.ctx;
    var canvas = state.canvas;
    if (!ctx || !canvas) return;
    var w = canvas.width;
    var h = canvas.height;
    var cell = state.cell;
    var pad = 1;

    ctx.clearRect(0, 0, w, h);

    var pulse = 0.04 + Math.sin(state.moonPhase * Math.PI * 2) * 0.03;
    ctx.fillStyle = 'rgba(120,0,30,' + pulse + ')';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,45,85,0.06)';
    ctx.lineWidth = 1;
    var gx, gy;
    for (gx = 0; gx <= COLS; gx++) {
      ctx.beginPath();
      ctx.moveTo(gx * cell + 0.5, 0);
      ctx.lineTo(gx * cell + 0.5, h);
      ctx.stroke();
    }
    for (gy = 0; gy <= ROWS; gy++) {
      ctx.beginPath();
      ctx.moveTo(0, gy * cell + 0.5);
      ctx.lineTo(w, gy * cell + 0.5);
      ctx.stroke();
    }

    function drawCell(x, y, fill, glow, r) {
      var px = x * cell + pad;
      var py = y * cell + pad;
      var s = cell - pad * 2;
      ctx.shadowColor = glow || 'transparent';
      ctx.shadowBlur = glow ? 10 : 0;
      ctx.fillStyle = fill;
      if (r) {
        roundRect(ctx, px, py, s, s, r);
        ctx.fill();
      } else ctx.fillRect(px, py, s, s);
      ctx.shadowBlur = 0;
    }

    for (var si = 0; si < state.stones.length; si++) {
      var st = state.stones[si];
      drawCell(st.x, st.y, '#4a4a52', '#666', 4);
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(st.x * cell + cell * 0.3, st.y * cell + cell * 0.3, cell * 0.2, cell * 0.2);
    }
    for (var bi = 0; bi < state.bones.length; bi++) {
      var bn = state.bones[bi];
      drawCell(bn.x, bn.y, '#e8dcc8', '#fff8e7', 6);
    }

    if (state.food) {
      var d = DROPS[state.food.kind] || DROPS.red;
      var fx = state.food.x * cell + cell / 2;
      var fy = state.food.y * cell + cell / 2;
      var bob = Math.sin((performance.now() + (state.food.born || 0)) * 0.008) * 1.5;
      ctx.shadowColor = d.glow;
      ctx.shadowBlur = 14;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      var rr = cell * 0.32;
      var fy2 = fy + bob;
      ctx.moveTo(fx, fy2 - rr * 1.1);
      ctx.bezierCurveTo(fx + rr, fy2 - rr * 0.2, fx + rr * 0.9, fy2 + rr, fx, fy2 + rr * 1.05);
      ctx.bezierCurveTo(fx - rr * 0.9, fy2 + rr, fx - rr, fy2 - rr * 0.2, fx, fy2 - rr * 1.1);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (state.food.kind === 'soap') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold ' + Math.floor(cell * 0.45) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧼', fx, fy2);
      }
    }

    for (var i = 0; i < state.snake.length; i++) {
      var seg = state.snake[i];
      var t = i / Math.max(1, state.snake.length - 1);
      var isHead = i === 0;
      var fill = isHead ? (state.frenzy ? '#ff6b85' : '#ff1f45') : 'rgb(' + Math.floor(255 - t * 80) + ',' + Math.floor(20 + t * 10) + ',' + Math.floor(50 + t * 20) + ')';
      if (state.invuln > 0 && isHead) fill = '#e0f2fe';
      drawCell(seg.x, seg.y, fill, isHead ? '#ff2d55' : 'rgba(255,45,85,0.3)', isHead ? 6 : 4);
      if (isHead) {
        ctx.fillStyle = '#fff';
        var ex = seg.x * cell + cell * 0.35;
        var ey = seg.y * cell + cell * 0.35;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
        ctx.arc(ex + cell * 0.28, ey, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#050001';
        var ox = state.dir.x * 1.2, oy = state.dir.y * 1.2;
        ctx.beginPath();
        ctx.arc(ex + ox, ey + oy, 1.1, 0, Math.PI * 2);
        ctx.arc(ex + cell * 0.28 + ox, ey + oy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (var pi = 0; pi < state.particles.length; pi++) {
      p = state.particles[pi];
      var a = 1 - p.age / p.life;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * a, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(4, 4, w - 8, 5);
    var hg = state.hunger / 100;
    ctx.fillStyle = hg > 0.75 ? '#ff1f45' : (hg > 0.45 ? '#c9a227' : '#22c55e');
    ctx.fillRect(4, 4, (w - 8) * hg, 5);

    if (state.shield > 0) {
      ctx.fillStyle = 'rgba(224,242,254,0.9)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🧼×' + state.shield, w - 6, 18);
    }
    if (state.combo >= 2) {
      ctx.fillStyle = '#ff2d55';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('×' + state.combo, 6, 18);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function updateHud() {
    var sc = document.getElementById('snake-score');
    var best = document.getElementById('snake-best');
    var len = document.getElementById('snake-len');
    var spd = document.getElementById('snake-spd');
    var hun = document.getElementById('snake-hunger');
    if (sc) sc.textContent = String(state.score);
    if (best) best.textContent = String(state.best || 0);
    if (len) len.textContent = String(state.snake.length);
    if (spd) {
      var mul = state.level.baseTick / Math.max(1, state.tickMs);
      spd.textContent = mul.toFixed(1) + '×';
    }
    if (hun) hun.textContent = Math.round(state.hunger) + '%';
  }

  function showOverlay(title, html, showRestart) {
    var ov = document.getElementById('snake-overlay');
    var t = document.getElementById('snake-ov-title');
    var b = document.getElementById('snake-ov-body');
    var btn = document.getElementById('snake-btn-start');
    if (!ov) return;
    ov.classList.remove('hidden');
    if (t) t.innerHTML = title;
    if (b) b.innerHTML = html || '';
    if (btn) btn.textContent = showRestart ? '🩸 Ещё раз' : '🩸 Начать охоту';
  }
  function hideOverlay() {
    var ov = document.getElementById('snake-overlay');
    if (ov) ov.classList.add('hidden');
  }

  function renderScores() {
    var box = document.getElementById('snake-scoreboard');
    if (!box) return;
    var board = loadBoard();
    var list = board.board || [];
    if (!list.length) {
      box.innerHTML = '<p class="muted" style="margin:0">Пока пусто — стань первой кровью на арене.</p>';
      return;
    }
    box.innerHTML = '<div class="lb">' + list.slice(0, 8).map(function (row, i) {
      return '<div class="lb-row' + (i === 0 ? ' top1' : '') + '">' +
        '<div class="pos">' + (i + 1) + '</div>' +
        '<div><div class="who">' + escape(row.name) + '</div>' +
        '<div class="meta">' + escape(row.level || '') + '</div></div>' +
        '<div class="val">' + row.score + '</div></div>';
    }).join('') + '</div>';
  }

  function escape(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function fitCanvas() {
    var canvas = state.canvas;
    var wrap = document.getElementById('snake-stage');
    if (!canvas || !wrap) return;
    var cssW = wrap.clientWidth || 320;
    state.cell = Math.floor(cssW / COLS);
    if (state.cell < 14) state.cell = 14;
    canvas.width = state.cell * COLS;
    canvas.height = state.cell * ROWS;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    draw();
  }

  function startGame() {
    if (!state.canvas) initCanvas();
    fitCanvas();
    resetSnake();
    state.running = true;
    state.over = false;
    state.paused = false;
    state.lastTs = 0;
    state.acc = 0;
    state.tickMs = computeTick();
    hideOverlay();
    cancelAnim();
    state.loopId = requestAnimationFrame(loop);
    haptic('medium');
    toast(state.level.title + ' · охота');
  }

  function pauseToggle() {
    if (!state.running || state.over) return;
    state.paused = !state.paused;
    if (state.paused) {
      showOverlay('⏸ Пауза', 'Кровь замерла. Жажда: ' + Math.round(state.hunger) + '%', false);
      var btn = document.getElementById('snake-btn-start');
      if (btn) btn.textContent = '▶ Продолжить';
    } else {
      hideOverlay();
      state.lastTs = 0;
      if (!state.loopId) state.loopId = requestAnimationFrame(loop);
    }
  }

  function selectLevel(id) {
    var i, lv = LEVELS[0];
    for (i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) lv = LEVELS[i];
    state.level = lv;
    document.querySelectorAll('.snake-level-btn').forEach(function (b) {
      b.classList.toggle('selected', b.getAttribute('data-level') === id);
    });
    showOverlay(
      lv.title,
      lv.sub + '<br><br><span class="muted">Очки только для рейтинга — наград нет, только честь.</span><br>' +
      '<span class="muted">Комбо цвета · жажда · мыло-щит · лунная жажда</span>',
      false
    );
  }

  function initCanvas() {
    state.canvas = document.getElementById('snake-canvas');
    if (!state.canvas) return;
    state.ctx = state.canvas.getContext('2d');
  }

  function onKey(e) {
    var screen = document.getElementById('screen-snake');
    if (!screen || !screen.classList.contains('active')) return;
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); setDir(0, -1); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); setDir(0, 1); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); setDir(-1, 0); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); setDir(1, 0); }
    else if (k === ' ' || k === 'p' || k === 'P') { e.preventDefault(); pauseToggle(); }
  }

  var touchStart = null;
  function onTouchStart(e) {
    if (!e.touches || !e.touches[0]) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart) return;
    var t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    var dx = t.clientX - touchStart.x;
    var dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
  }

  var uiBound = false;
  function bindUI() {
    if (uiBound) return;
    uiBound = true;
    initCanvas();
    var board = loadBoard();
    state.best = board.best || 0;

    document.querySelectorAll('.snake-level-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectLevel(btn.getAttribute('data-level'));
        haptic('light');
      });
    });

    var start = document.getElementById('snake-btn-start');
    if (start) {
      start.addEventListener('click', function () {
        if (state.paused && state.running && !state.over) {
          state.paused = false;
          hideOverlay();
          state.lastTs = 0;
          if (!state.loopId) state.loopId = requestAnimationFrame(loop);
          return;
        }
        startGame();
      });
    }
    var pause = document.getElementById('snake-btn-pause');
    if (pause) pause.addEventListener('click', function () { pauseToggle(); haptic('light'); });

    var map = {
      'snake-up': [0, -1],
      'snake-down': [0, 1],
      'snake-left': [-1, 0],
      'snake-right': [1, 0]
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var d = map[id];
      el.addEventListener('click', function (e) {
        e.preventDefault();
        setDir(d[0], d[1]);
      });
    });

    var stage = document.getElementById('snake-stage');
    if (stage) {
      stage.addEventListener('touchstart', onTouchStart, { passive: true });
      stage.addEventListener('touchend', onTouchEnd, { passive: true });
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () {
      var s = document.getElementById('screen-snake');
      if (s && s.classList.contains('active')) fitCanvas();
    });

    selectLevel('shadow');
    renderScores();
    updateHud();
    setTimeout(fitCanvas, 50);
  }

  function onShow() {
    bindUI();
    initCanvas();
    fitCanvas();
    renderScores();
    updateHud();
    if (!state.running) {
      showOverlay(
        state.level.title,
        state.level.sub + '<br><br>Свайп / стрелки / кнопки. Капли = очки. Камень = смерть.<br>🧼 мыло = щит · комбо цвета · шкала жажды',
        false
      );
    }
  }

  function onHide() {
    if (state.running && !state.over) {
      state.paused = true;
      cancelAnim();
    }
  }

  window.BloodSnake = {
    onShow: onShow,
    onHide: onHide,
    start: startGame,
    levels: LEVELS
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('snake-canvas')) bindUI();
  });
  else if (document.getElementById('snake-canvas')) bindUI();
})();
