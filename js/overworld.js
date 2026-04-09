// js/overworld.js
// Phaser-сцена для открытого мира (Phase 0)

class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  preload() {
    // Пока используем простые цветные прямоугольники (потом заменишь на спрайты)
    this.load.image('player', 'https://via.placeholder.com/32x32/00ff00/000000?text=P');
    this.load.image('grass', 'https://via.placeholder.com/48x48/00aa00/000000?text=G');
    this.load.image('tree', 'https://via.placeholder.com/48x48/006600/ffffff?text=T');
  }

  create() {
    this.chunkSize = 12;           // чанк 12x12 тайлов
    this.tileSize = 48;
    this.chunks = new Map();       // храним загруженные чанки

    // Игрок
    this.player = this.add.sprite(400, 300, 'player').setDepth(10);
    this.player.setOrigin(0.5);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, 99999, 99999);

    // Управление стрелками + WASD
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // Генерируем стартовые чанки
    this.generateChunk(0, 0);
    this.generateChunk(1, 0);
    this.generateChunk(0, 1);
    this.generateChunk(-1, 0);

    console.log('🌍 OverworldScene создана');
  }

  generateChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.chunks.has(key)) return;

    const chunk = this.add.container(cx * this.chunkSize * this.tileSize, cy * this.chunkSize * this.tileSize);

    for (let x = 0; x < this.chunkSize; x++) {
      for (let y = 0; y < this.chunkSize; y++) {
        const tileX = cx * this.chunkSize + x;
        const tileY = cy * this.chunkSize + y;

        // Простая генерация (трава + редкие деревья)
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
    const speed = 4;

    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.player.x += dx * speed;
      this.player.y += dy * speed;

      // Загружаем новые чанки по мере движения
      const playerChunkX = Math.floor(this.player.x / (this.chunkSize * this.tileSize));
      const playerChunkY = Math.floor(this.player.y / (this.chunkSize * this.tileSize));

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          this.generateChunk(playerChunkX + x, playerChunkY + y);
        }
      }

      // Случайный бой при движении (15% шанс каждый кадр)
      if (Math.random() < 0.015) {
        this.triggerBattle();
      }
    }
  }

  triggerBattle() {
    // Переключаемся на бой
    window.switchTab('battle');
    if (window.startBattle) {
      window.startBattle();
    }
  }
}

// Инициализация и уничтожение сцены
function initOverworld() {
  if (window.overworldGame) return;

  window.overworldGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'overworld-container',
    scene: OverworldScene,
    backgroundColor: '#2a5f2a',
    physics: { default: 'arcade', arcade: { debug: false } }
  });

  console.log('🚀 Overworld инициализирован');
}

function destroyOverworld() {
  if (window.overworldGame) {
    window.overworldGame.destroy(true);
    window.overworldGame = null;
  }
}

// Экспорт
window.initOverworld = initOverworld;
window.destroyOverworld = destroyOverworld;
