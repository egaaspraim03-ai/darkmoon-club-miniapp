// ====================== OVERWORLD.JS — v5.0 КАК В POKÉMON EMERALD ======================
// Камера следует за игроком + бесконечная трава + частые бои

let currentZone = 'pokemon';
let gameScene = null;
let playerSprite = null;

class OverworldScene extends Phaser.Scene {
    constructor() { super('OverworldScene'); }

    preload() {
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x112200);

        this.tileSize = 48;
        this.viewTiles = 11; // сколько тайлов видно

        this.tiles = [];
        this.generateVisibleTiles(0, 0);

        // Игрок
        playerSprite = this.add.sprite(240, 240, 'player').setScale(1.5);
        playerSprite.setData('gridX', 0);
        playerSprite.setData('gridY', 0);

        // Камера следует за игроком
        this.cameras.main.startFollow(playerSprite, true, 0.1, 0.1);

        console.log('%c🌍 Overworld v5.0 — как в Pokémon Emerald', 'color:#C084FC; font-weight:bold');
    }

    generateVisibleTiles(centerX, centerY) {
        // Очищаем старые тайлы
        this.tiles.forEach(t => t.destroy());
        this.tiles = [];

        for (let x = -5; x <= 5; x++) {
            for (let y = -5; y <= 5; y++) {
                const worldX = centerX + x;
                const worldY = centerY + y;

                const isGrass = Math.random() < 0.7; // много кустов

                const tile = this.add.rectangle(
                    (centerX + x) * this.tileSize + this.tileSize/2,
                    (centerY + y) * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    isGrass ? 0x00AA44 : 0x223300, 0.92
                ).setStrokeStyle(1, 0xC084FC);

                if (isGrass) tile.setData('grass', true);
                this.tiles.push(tile);
            }
        }
    }

    movePlayer(dir) {
        if (!playerSprite) return;

        let gridX = playerSprite.getData('gridX');
        let gridY = playerSprite.getData('gridY');

        if (dir === 'up') gridY--;
        if (dir === 'down') gridY++;
        if (dir === 'left') gridX--;
        if (dir === 'right') gridX++;

        playerSprite.setData('gridX', gridX);
        playerSprite.setData('gridY', gridY);

        // Плавное движение
        playerSprite.x = gridX * this.tileSize + this.tileSize/2;
        playerSprite.y = gridY * this.tileSize + this.tileSize/2;

        // Генерируем новые тайлы при движении
        this.generateVisibleTiles(gridX, gridY);

        // Шанс боя в траве
        const currentTile = this.tiles.find(t => 
            Math.abs(t.x - playerSprite.x) < 30 && Math.abs(t.y - playerSprite.y) < 30
        );

        if (currentTile && currentTile.getData('grass') && Math.random() < 0.75) {
            this.triggerZoneBattle();
        }
    }

    triggerZoneBattle() {
        const pool = window.pokedexData || [];
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        const playerHero = currentParty[0] || { 
            ru: "Пикачу", 
            types: ["Electric"], 
            hp: 130, 
            maxhp: 130, 
            sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" 
        };

        console.log('%c⚔️ Бой запущен из травы!', 'color:#ff0; font-size:18px');
        if (typeof startBattle === 'function') startBattle(playerHero, enemy, currentParty);
    }
}

// ====================== КНОПКИ ======================
function createControls() {
    const container = document.getElementById('overworld-container');
    if (!container) return;
    container.innerHTML = '';

    const controls = document.createElement('div');
    controls.style.cssText = `position:absolute; bottom:30px; left:50%; transform:translateX(-50%); display:grid; grid-template-columns:70px 70px 70px; gap:12px; z-index:9999;`;
    controls.innerHTML = `
        <div></div>
        <button onclick="window.moveDirection('up')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">↑</button>
        <div></div>
        <button onclick="window.moveDirection('left')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">←</button>
        <button onclick="window.moveDirection('down')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">↓</button>
        <button onclick="window.moveDirection('right')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">→</button>
    `;
    container.appendChild(controls);
}

function initOverworld() {
    const container = document.getElementById('overworld-container');
    if (container) container.innerHTML = '';

    const config = {
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: 'overworld-container',
        scene: OverworldScene
    };

    gameScene = new Phaser.Game(config);

    setTimeout(createControls, 800);
}

if (typeof window !== 'undefined') window.addEventListener('load', initOverworld);

window.changeZone = function(newZone) { currentZone = newZone; if (gameScene) gameScene.scene.restart(); };
window.moveDirection = function(dir) { 
    if (gameScene) gameScene.scene.getScene('OverworldScene').movePlayer(dir); 
};
