# NÉXUS • DARK MOON

**Telegram Mini App** — игра в стиле Pokémon Emerald с элементами Смешариков и тёмного фэнтези Dark Moon.

### Что уже готово

- Полноценный **Overworld** на Phaser 3 (бесконечные чанки, движение, случайные бои)
- **Боевая система** с HP-барами, логами и сменой покемонов
- **Lunadex** с поиском и фильтрами (официальные покемоны + Смешарики + Dark Moon)
- **Партия** (смена покемонов)
- **Инвентарь** с использованием предметов
- **Система сохранений** (автосохранение каждые 30 сек)
- Полная загрузка данных из JSON
- Адаптивный интерфейс под Telegram Mini App

### Структура проекта
darkmoon-club-miniapp/
├── data/
│   ├── pokedex.json
│   ├── moves.json
│   ├── typechart.json
│   ├── abilities.json
│   ├── items.json
│   ├── smeshariki.json
│   └── darkmoon.json
├── js/
│   ├── core/
│   │   ├── constants.js
│   │   ├── utils.js
│   │   ├── data-loader.js
│   │   └── save-system.js
│   ├── overworld.js
│   ├── battle.js
│   ├── lunadex.js
│   ├── main.js
│   ├── party.js
│   ├── inventory.js
│   └── ui.js
├── assets/sprites/          ← сюда добавляй изображения
├── index.html
├── style.css
├── README.md
└── .gitignore
text### Как запустить

1. Открой проект в браузере (рекомендую Live Server в VS Code)
2. Или загрузи на GitHub Pages / Vercel / Netlify
3. Для Telegram Mini App — укажи ссылку на `index.html` в BotFather

### Как добавить своих покемонов / Смешариков

- Добавляй записи в `data/smeshariki.json` или `data/darkmoon.json`
- Клади спрайты в папку `assets/sprites/`
- Перезагружай страницу — всё подхватится автоматически

### Дальнейшие планы (по желанию)

- Добавление новых зон (`zones/` папка)
- Система эволюции и опыта
- Предметы в бою
- Музыка и звуки
- Telegram Cloud сохранения

---

**Что делать:**

1. Зайди в свой репозиторий → `README.md`
2. **Удалить всё старое содержимое**
3. Вставить текст выше
4. Нажать **Commit changes**

