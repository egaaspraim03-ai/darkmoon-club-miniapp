// js/overworld.js — Полная версия с реальными локациями (zones)

class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
    this.currentZone = 'saffron-city';   // стартовая локация
    this.player = null;
  }

  preload() {
    // Спрайты игрока (4 направления)
    this.load.image('player_down',  'assets/sprites/player/boy_down.png');
    this.load.image('player_up',    'assets/sprites/player/boy_up.png');
    this.load.image('player_left',  'assets/sprites/player/boy_left.png');
    this.load.image('player_right', 'assets/sprites/player/boy_right.png');

    // Тайлы (можно добавить свой tileset позже)
    this.load.image('grass', 'https://via.placeholder.com/48x48/00aa00/000000?text=G');
    this.load.image('tree',  'https://via.placeholder.com/48x48/006600/ffffff?text=T');
  }

  async create() {
    await this.loadZone(this.currentZone);
  }

  async loadZone(zoneName) {
    try {
      const res = await fetch(`data/zones/${zoneName}.json`);
      const zoneData = await res.json();

      this.currentZoneData = zoneData;

      // Очищаем старую карту
      if (this.map) this.map.destroy();

      // Создаём тайловую карту
      this.map = this.make.tilemap({
        key: 'map',
        tileWidth: 48,
        tileHeight: 48
      });

      const tileset = this.map.addTilesetImage('grass'); // пока используем grass как базовый тайл
      this.layer = this.map.createLayer(0, tileset, 0, 0);

      // Игрок
      if (!this.player) {
        this.player = this.add.sprite(zoneData.playerStart.x, zoneData.playerStart.y, 'player_down')
          .setDepth(10);
      } else {
        this.player.setPosition(zoneData.playerStart.x, zoneData.playerStart.y);
      }

      this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
      this.cameras.main.setZoom(1.1);

      console.log(`✅ Загружена локация: ${zoneData.name || zoneName}`);
    } catch (err) {
      console.error(`❌ Не удалось загрузить зону ${zoneName}`, err);
    }
  }

  update() {
    if (!this.player) return;

    const speed = 5;
    let dx = 0, dy = 0;
    let direction = 'down';

    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) { dx = -1; direction = 'left'; }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) { dx = 1; direction = 'right'; }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP).isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) { dy = -1; direction = 'up'; }
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN).isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) { dy = 1; direction = 'down'; }

    if (dx !== 0 || dy !== 0) {
      this.player.x += dx * speed;
      this.player.y += dy * speed;

      // Смена спрайта
      if (direction === 'up') this.player.setTexture('player_up');
      else if (direction === 'down') this.player.setTexture('player_down');
      else if (direction === 'left') this.player.setTexture('player_left');
      else if (direction === 'right') this.player.setTexture('player_right');

      // Случайный бой
      if (Math.random() < 0.018) this.triggerBattle();
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
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
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
