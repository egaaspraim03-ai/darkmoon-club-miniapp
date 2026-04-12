// js/overworld.js — ОБНОВЛЁННАЯ ВЕРСИЯ (полноэкранная + камера по центру)

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

    // === ИГРОК ===
    this.player = this.add.sprite(0, 0, 'player').setDepth(10);
    this.player.setOrigin(0.5);

    // === КАМЕРА ВСЕГДА ПО ЦЕНТРУ ИГРОКА ===
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2); // чуть ближе — выглядит лучше на телефоне

    // Управление
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // Стартовые чанки
    this.generateChunk(0, 0);

    console.log('🌍 Overworld загружен (полноэкранный режим)');
  }

  generateChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.chunks.has(key)) return;

    const chunk = this.add.container(cx * this.chunkSize * this.tileSize, cy * this.chunkSize * this.tileSize);

    for (let x = 0; x < this.chunkSize; x++) {
      for (let y = 0; y < this.chunkSize; y++) {
        const isTree = Math.random() < 0.08;
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

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          this.generateChunk(cx + x, cy + y);
        }
      }

      // Запуск боя
      if (Math.random() < 0.018) {
        this.triggerBattle();
      }
    }
  }

  triggerBattle() {
    window.switchTab('battle');
    if (window.startBattle) window.startBattle();
  }
}

// Инициализация с адаптивным размером
function initOverworld() {
  if (window.overworldGame) return;

  const container = document.getElementById('overworld-container');
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  window.overworldGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'overworld-container',
    scene: OverworldScene,
    backgroundColor: '#1a3d1a',
    scale: {
      mode: Phaser.Scale.RESIZE,     // автоматически подстраивается под размер окна
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
