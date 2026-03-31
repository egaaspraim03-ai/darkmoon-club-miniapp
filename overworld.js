let phaserGame = null, currentZone = null, playerGridX = 5, playerGridY = 5, playerSprite = null;
const mapData = [[1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,1,0,0,1],[1,0,0,0,0,1,0,0,0,1],[1,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,0,0,0,0,1],[1,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1]];

class OverworldScene extends Phaser.Scene {
  constructor() { super('OverworldScene'); }
  preload() {
    const first = gameData.universes.pokemon[0];
    this.load.image('player', first.sprite);
  }
  create() {
    const isNight = new Date().getHours() > 20 || new Date().getHours() < 6;
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const color = mapData[y][x] === 0 ? (isNight ? 0x1a0033 : 0x228B22) : 0x8B4513;
      this.add.rectangle(x*32+16, y*32+16, 32, 32, color).setStrokeStyle(3, 0x000000);
    }
    playerSprite = this.add.image(playerGridX*32+16, playerGridY*32+16, 'player');
    playerSprite.setDisplaySize(32, 32);
    this.stepCounter = 0;
  }
}

function startOverworld(zone) {
  currentZone = zone;
  document.getElementById('zone-selection').style.display = 'none';
  document.getElementById('overworld-wrapper').style.display = 'block';
  document.getElementById('current-zone-name').innerHTML = `🌍 ${zone === 'pokemon' ? 'Лес Покемонов' : zone === 'smeshariki' ? 'Ромашковая Долина' : 'Бездна Dark Moon'}`;

  if (phaserGame) phaserGame.destroy(true);

  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    parent: 'overworld-container',
    backgroundColor: '#0a001f',
    scene: OverworldScene
  });

  window.moveDirection = function(dir) {
    if (!playerSprite) return;
    let nx = playerGridX, ny = playerGridY;
    if (dir==='up') ny--; if (dir==='down') ny++; if (dir==='left') nx--; if (dir==='right') nx++;
    if (nx<0||nx>9||ny<0||ny>9||mapData[ny][nx]===1) return;

    playerGridX = nx; playerGridY = ny;
    playerSprite.x = nx*32+16; playerSprite.y = ny*32+16;

    window.stepCounter = (window.stepCounter || 0) + 1;
    if (window.stepCounter % 8 === 0 && Math.random() < 0.6) spawnWorldEvent();
    if (mapData[ny][nx] === 0 && Math.random() < 0.25) spawnBattle();
  };
}

function spawnWorldEvent() {
  const events = [
    "🌟 Появился портал в Разлом! +1 NEXUS-очко",
    "🦔 Ёжик предлагает дружбу (+10 HP всей партии)",
    "🔥 Рунический Палач даёт квест"
  ];
  alert(events[Math.floor(Math.random()*events.length)]);
}

function exitOverworld() {
  if (phaserGame) phaserGame.destroy(true);
  phaserGame = null; playerSprite = null;
  document.getElementById('overworld-wrapper').style.display = 'none';
  document.getElementById('zone-selection').style.display = 'block';
}
