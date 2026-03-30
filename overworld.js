// overworld.js — карта + движение + встречи

let phaserGame = null, currentZone = null, playerGridX = 5, playerGridY = 5, playerSprite = null;
const mapData = [[1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,1,0,0,1],[1,0,0,0,0,1,0,0,0,1],[1,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,0,0,0,0,1],[1,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1]];

class OverworldScene extends Phaser.Scene {
  constructor() { super('OverworldScene'); }
  preload() {
    const first = gameData.universes.pokemon[0];
    this.load.image('player', first.sprite);
  }
  create() {
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const color = mapData[y][x] === 0 ? 0x228B22 : 0x8B4513;
      this.add.rectangle(x*32+16, y*32+16, 32, 32, color).setStrokeStyle(3, 0x000000);
    }
    playerSprite = this.add.image(playerGridX*32+16, playerGridY*32+16, 'player');
    playerSprite.setDisplaySize(32, 32);
  }
}

function startOverworld(zone) {
  currentZone = zone;
  document.getElementById('current-zone-name').innerHTML = `🌍 ${zone === 'pokemon' ? 'Лес Покемонов' : zone === 'smeshariki' ? 'Ромашковая Долина' : 'Бездна Dark Moon'}`;
  if (phaserGame) phaserGame.destroy(true);
  phaserGame = new Phaser.Game({type: Phaser.AUTO, width: 320, height: 320, parent: 'overworld-container', backgroundColor: '#0a001f', scene: OverworldScene});

  window.moveDirection = function(dir) {
    if (!playerSprite) return;
    let nx = playerGridX, ny = playerGridY;
    if (dir==='up') ny--; if (dir==='down') ny++; if (dir==='left') nx--; if (dir==='right') nx++;
    if (nx<0||nx>9||ny<0||ny>9||mapData[ny][nx]===1) return;

    playerGridX = nx; playerGridY = ny;
    playerSprite.x = nx*32+16; playerSprite.y = ny*32+16;

    if (mapData[ny][nx] === 0 && Math.random() < 0.25) spawnBattle();
  };
}

function exitOverworld() {
  if (phaserGame) phaserGame.destroy(true);
  phaserGame = null; playerSprite = null;
  document.getElementById('overworld-wrapper').style.display = 'none';
}
