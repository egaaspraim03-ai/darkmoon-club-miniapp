/* ============================================================
   bot/server.js — Blood Moon Telegram bot + Mini App API
   ENV:
     BOT_TOKEN=...
     WEBAPP_URL=https://your-static-host/index.html
     PORT=3000
     SECRET_SKIP=1   (только dev: не проверять initData)
   PART 1/2
   ============================================================ */
'use strict';

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://example.com/index.html';
const PORT = parseInt(process.env.PORT || '3000', 10);
const SECRET_SKIP = process.env.SECRET_SKIP === '1';

if (!BOT_TOKEN) {
  console.error('Set BOT_TOKEN');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

/** in-memory store (замени на SQLite/Postgres позже) */
const users = new Map();

function rankFromCards(n) {
  n = n | 0;
  if (n >= 5000) return 'X';
  if (n >= 2500) return 'P';
  if (n >= 1200) return 'G';
  if (n >= 600) return 'S';
  if (n >= 300) return 'A';
  if (n >= 150) return 'B';
  if (n >= 60) return 'C';
  if (n >= 20) return 'D';
  return 'E';
}

function ensureUser(tgUser) {
  const id = String(tgUser.id);
  let u = users.get(id);
  if (!u) {
    u = {
      tgId: tgUser.id,
      username: tgUser.username || null,
      firstName: tgUser.first_name || 'гость',
      photo_url: tgUser.photo_url || null,
      cards: 0,
      contrib: 0,
      lpBonus: 0,
      duelsWon: 0,
      duelsLost: 0,
      rank: 'E'
    };
    users.set(id, u);
  } else {
    u.username = tgUser.username || u.username;
    u.firstName = tgUser.first_name || u.firstName;
    if (tgUser.photo_url) u.photo_url = tgUser.photo_url;
  }
  u.rank = rankFromCards(u.cards);
  return u;
}

function publicUser(u) {
  return {
    tgId: u.tgId,
    username: u.username,
    firstName: u.firstName,
    photo_url: u.photo_url,
    cards: u.cards,
    contrib: u.contrib,
    lpBonus: u.lpBonus,
    duelsWon: u.duelsWon,
    duelsLost: u.duelsLost,
    rank: u.rank
  };
}

/** Validate Telegram WebApp initData
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function validateInitData(initData) {
  if (SECRET_SKIP) {
    return { ok: true, user: { id: 1, first_name: 'Dev' } };
  }
  if (!initData || typeof initData !== 'string') {
    return { ok: false, error: 'no initData' };
  }
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'no hash' };
  params.delete('hash');
  const entries = [];
  for (const [k, v] of params.entries()) entries.push(k + '=' + v);
  entries.sort();
  const dataCheckString = entries.join('\n');
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();
  const calc = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  if (calc !== hash) return { ok: false, error: 'bad hash' };

  let user = null;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch (e) {
    return { ok: false, error: 'bad user json' };
  }
  if (!user || !user.id) return { ok: false, error: 'no user' };
  return { ok: true, user: user, authDate: params.get('auth_date') };
}

function authMiddleware(req, res, next) {
  const initData = req.header('X-Telegram-Init-Data') || '';
  const v = validateInitData(initData);
  if (!v.ok) {
    return res.status(401).json({ error: 'unauthorized', detail: v.error });
  }
  req.tgUser = v.user;
  req.bmUser = ensureUser(v.user);
  next();
}
/* API */
app.get('/health', function (req, res) {
  res.json({ ok: true, service: 'blood-moon', users: users.size });
});

app.get('/api/me', authMiddleware, function (req, res) {
  res.json({ ok: true, user: publicUser(req.bmUser) });
});

app.post('/api/contrib', authMiddleware, function (req, res) {
  const amount = Math.max(0, parseInt(req.body && req.body.amount, 10) || 0);
  req.bmUser.contrib += amount;
  /* 10 cards per 100 contrib — demo */
  const gain = Math.floor(amount / 100);
  if (gain > 0) req.bmUser.cards += gain;
  req.bmUser.rank = rankFromCards(req.bmUser.cards);
  res.json({ ok: true, user: publicUser(req.bmUser), gain: gain });
});

app.post('/api/duel/result', authMiddleware, function (req, res) {
  const win = !!(req.body && req.body.win);
  if (win) {
    req.bmUser.duelsWon += 1;
    req.bmUser.cards += 3;
  } else {
    req.bmUser.duelsLost += 1;
    req.bmUser.cards += 1;
  }
  req.bmUser.rank = rankFromCards(req.bmUser.cards);
  res.json({ ok: true, user: publicUser(req.bmUser) });
});

app.post('/api/cards/set', authMiddleware, function (req, res) {
  /* admin/demo */
  const n = Math.max(0, parseInt(req.body && req.body.cards, 10) || 0);
  req.bmUser.cards = n;
  req.bmUser.rank = rankFromCards(n);
  res.json({ ok: true, user: publicUser(req.bmUser) });
});

/* Bot commands */
function webAppKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🩸 Открыть Blood Moon', WEBAPP_URL)],
    [
      Markup.button.webApp('⚔️ Дуэль', WEBAPP_URL + '#duel'),
      Markup.button.webApp('🗼 Башня', WEBAPP_URL + '#tower')
    ],
    [
      Markup.button.webApp('✦ Реликвии', WEBAPP_URL + '#relics'),
      Markup.button.webApp('🎰 Рулетка', WEBAPP_URL + '#reel')
    ]
  ]);
}

bot.start(async (ctx) => {
  const u = ensureUser(ctx.from);
  const payload = (ctx.startPayload || '').toLowerCase();
  let url = WEBAPP_URL;
  if (payload && ['duel', 'tower', 'relics', 'hall', 'reel', 'profile'].includes(payload)) {
    url = WEBAPP_URL + '#' + payload;
  }
  await ctx.reply(
    '🌑 <b>The Blood Moon</b>\n' +
      'Ранг: <b>' +
      u.rank +
      '</b> · карт: ' +
      u.cards +
      '\nПантеон ждёт. Выбери путь.',
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.webApp('🩸 Войти в ночь', url)]])
    }
  );
});

bot.command('app', async (ctx) => {
  await ctx.reply('Мини-приложение:', webAppKeyboard());
});

bot.command('rank', async (ctx) => {
  const u = ensureUser(ctx.from);
  await ctx.reply(
    'Ранг: ' + u.rank + '\nКарт: ' + u.cards + '\nВклад: ' + u.contrib +
      '\nДуэли: ' + u.duelsWon + 'W / ' + u.duelsLost + 'L'
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    '/start — вход\n/app — мини-апп\n/rank — ранг\n/help — это меню\n\n' +
      'Deep-link: t.me/YOUR_BOT?start=duel'
  );
});

bot.on('message', async (ctx) => {
  /* optional soft fallback */
});

app.use(bot.webhookCallback('/telegram/webhook'));

async function main() {
  const mode = process.env.BOT_MODE || 'polling';
  if (mode === 'webhook') {
    const domain = process.env.PUBLIC_URL;
    if (!domain) throw new Error('PUBLIC_URL required for webhook');
    await bot.telegram.setWebhook(domain.replace(/\/$/, '') + '/telegram/webhook');
    app.listen(PORT, () => console.log('webhook+api on', PORT));
  } else {
    app.listen(PORT, () => console.log('api on', PORT));
    await bot.launch();
    console.log('bot polling');
  }
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
