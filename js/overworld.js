// js/overworld.js — ИСПРАВЛЕННАЯ ВЕРСИЯ (полноэкранная + центрирование)

class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  preload() {
    this.load.image('player', 'https://via.placeholder.com/48x48/00ff00/000000?text=P');
    this.load.image('grass', 'https://via.placeholder.com/48x48/00aa00/000000?text=G');
    this.load.image('tree', 'https://via.placeholder.com/48x48/006600/ffffff?text=T');
  }

  create() {
    this.chunkSize = 12;
    this.tileSize = 48;
    this.chunks = new Map();

    // Игрок
    this.player = this.add.sprite(0, 0, 'player').setDepth(10);
    this.player.setOrigin(0.5);

    // Камера всегда следует за игроком и центрирует его
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setZoom(1.1);

    // Управление
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // Генерируем начальные чанки
    this.generateChunk(0, 0);

    console.log('🌍 Overworld загружен (исправленная версия)');
  }

  generateChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.chunks.has(key)) return;

    const chunk = this.add.container(cx * this.chunkSize * this.tileSize, cy * this.chunkSize * this.tileSize);

    for (let x = 0; x < this.chunkSize; x++) {
      for (let y = 0; y < this.chunkSize; y++) {
        const isTree = Math.random() < 0.08;
        const tile = this.add.image(
          x * this.tileSize + this.tileSize/2,
          y * this.tileSize + this.tileSize/2,
          isTree ? 'tree' : 'grass'
        );
        chunk.add(tile);
      }
    }
    this.chunks.set(key, chunk);
  }

  update() {
    const speed = 5;
    let dx = 0, dy = 0;

    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.player.x += dx * speed;
      this.player.y += dy * speed;

      const cx = Math.floor(this.player.x / (this.chunkSize * this.tileSize));
      const cy = Math.floor(this.player.y / (this.chunkSize * this.tileSize));

      for (let x = -2; x <= 2; x++) {        // чуть больше чанков для плавности
        for (let y = -2; y <= 2; y++) {
          this.generateChunk(cx + x, cy + y);
        }
      }

      if (Math.random() < 0.022) this.triggerBattle();
    }
  }

  triggerBattle() {
    window.switchTab('battle');
    if (window.startBattle) window.startBattle();
  }
}

// === ИСПРАВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ ===
function initOverworld() {
  if (window.overworldGame) return;

  const container = document.getElementById('overworld-container');

  window.overworldGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: container.clientWidth,
    height: container.clientHeight,
    parent: 'overworld-container',
    scene: OverworldScene,
    backgroundColor: '#1a3d1a',
    scale: {
      mode: Phaser.Scale.RESIZE,        // автоматически растягивает на весь контейнер
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
