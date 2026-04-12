// js/overworld.js — ИСПРАВЛЕННАЯ И УЛУЧШЕННАЯ ВЕРСИЯ

class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
    this.currentZone = 'saffron-city'; // можно будет менять позже
  }

  preload() {
    // === СПРАЙТЫ ИГРОКА (локальные пути — рекомендуется) ===
    this.load.image('player_down',  'assets/sprites/player/boy_down.png');
    this.load.image('player_up',    'assets/sprites/player/boy_up.png');
    this.load.image('player_left',  'assets/sprites/player/boy_left.png');
    this.load.image('player_right', 'assets/sprites/player/boy_right.png');

    // Тайлы (пока заглушка, позже заменишь на свой tileset)
    this.load.image('grass', 'https://via.placeholder.com/48x48/00aa00/000000?text=G');
    this.load.image('tree',  'https://via.placeholder.com/48x48/006600/ffffff?text=T');
  }

  create() {
    this.chunkSize = 12;
    this.tileSize = 48;
    this.chunks = new Map();

    // Игрок
    this.player = this.add.sprite(400, 300, 'player_down').setDepth(10);
    this.player.setOrigin(0.5);

    // Камера
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setZoom(1.1);

    // Управление (создаём клавиши ОДИН РАЗ)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.generateChunk(0, 0);

    console.log('🌍 OverworldScene загружена (исправленная версия)');
  }

  generateChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.chunks.has(key)) return;

    const chunk = this.add.container(cx * this.chunkSize * this.tileSize, cy * this.chunkSize * this.tileSize);

    for (let x = 0; x < this.chunkSize; x++) {
      for (let y = 0; y < this.chunkSize; y++) {
        const isTree = Math.random() < 0.12;
        const tile = this.add.image(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          isTree ? 'tree' : 'grass'
        );
        chunk.add(tile);
      }
    }
    this.chunks.set(key, chunk);
  }

  update() {
    if (!this.player) return;

    const speed = 5;
    let dx = 0, dy = 0;
    let direction = 'down';

    if (this.cursors.left.isDown || this.keys.A.isDown) { dx = -1; direction = 'left'; }
    if (this.cursors.right.isDown || this.keys.D.isDown) { dx = 1; direction = 'right'; }
    if (this.cursors.up.isDown || this.keys.W.isDown) { dy = -1; direction = 'up'; }
    if (this.cursors.down.isDown || this.keys.S.isDown) { dy = 1; direction = 'down'; }

    if (dx !== 0 || dy !== 0) {
      this.player.x += dx * speed;
      this.player.y += dy * speed;

      // Смена спрайта направления
      if (direction === 'up') this.player.setTexture('player_up');
      else if (direction === 'down') this.player.setTexture('player_down');
      else if (direction === 'left') this.player.setTexture('player_left');
      else if (direction === 'right') this.player.setTexture('player_right');

      // Генерация новых чанков
      const cx = Math.floor(this.player.x / (this.chunkSize * this.tileSize));
      const cy = Math.floor(this.player.y / (this.chunkSize * this.tileSize));

      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          this.generateChunk(cx + x, cy + y);
        }
      }

      // Случайный бой
      if (Math.random() < 0.022) this.triggerBattle();
    }
  }

  triggerBattle() {
    window.switchTab('battle');
    if (window.startBattle) window.startBattle();
  }
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initOverworld() {
  if (window.overworldGame) return;

  window.overworldGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: document.getElementById('overworld-container').clientWidth || 800,
    height: document.getElementById('overworld-container').clientHeight || 600,
    parent: 'overworld-container',
    scene: OverworldScene,
    backgroundColor: '#1a3d1a',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  });
}

function destroyOverworld() {
  if (window.overworldGame) {
    window.overworldGame.destroy(true);
    window.overworldGame = null;
  }
}

window.initOverworld = initOverworld;
window.destroyOverworld = destroyOverworld;
