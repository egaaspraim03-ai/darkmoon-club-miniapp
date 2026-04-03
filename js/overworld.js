// ====================== OVERWORLD.JS — v3.2 КНОПКИ ВСЕГДА ВИДНЫ ======================

let currentZone = 'pokemon';
let gameScene = null;
let playerSprite = null;

class OverworldScene extends Phaser.Scene {
    constructor() {
        super('OverworldScene');
    }

    preload() {
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png');
    }

    create() {
        this.gridSize = 10;
        this.tileSize = 48;
        this.updateZoneBackground();

        // Тайлы + трава
        this.tiles = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const isGrass = Math.random() < 0.45;
                const tile = this.add.rectangle(
                    x * this.tileSize + this.tileSize/2,
                    y * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    isGrass ? 0x00AA44 : 0x223300, 0.85
                ).setStrokeStyle(1, 0xC084FC);
                if (isGrass) tile.setData('grass', true);
                this.tiles.push(tile);
            }
        }

        // Игрок
        playerSprite = this.add.sprite(240, 240, 'player').setScale(1.4);
        playerSprite.x = 5 * this.tileSize;
        playerSprite.y = 5 * this.tileSize;

        console.log(`%c🌍 Overworld v3.2 готов (зона: ${currentZone})`, 'color:#C084FC');
    }

    updateZoneBackground() {
        const colors = { pokemon: 0x112200, smeshariki: 0x00BB99, darkmoon: 0x110022 };
        this.cameras.main.setBackgroundColor(colors[currentZone] || 0x110022);
    }

    movePlayer(dir) {
        let newX = playerSprite.x;
        let newY = playerSprite.y;

        if (dir === 'up') newY -= this.tileSize;
        if (dir === 'down') newY += this.tileSize;
        if (dir === 'left') newX -= this.tileSize;
        if (dir === 'right') newX += this.tileSize;

        if (newX < 0 || newX >= 480 || newY < 0 || newY >= 480) return;

        playerSprite.x = newX;
        playerSprite.y = newY;

        const tile = this.tiles.find(t => Math.abs(t.x - playerSprite.x) < 24 && Math.abs(t.y - playerSprite.y) < 24);
        if (tile && tile.getData('grass') && Math.random() < 0.45) {
            this.triggerZoneBattle();
        }
    }

    triggerZoneBattle() {
        const pool = window.pokedexData || [];
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        const playerHero = currentParty[0] || { ru: "Пикачу", types: ["Electric"], hp: 130, maxhp: 130 };
        if (typeof startBattle === 'function') startBattle(playerHero, enemy, currentParty);
    }
}

// ====================== КНОПКИ УПРАВЛЕНИЯ ======================
function createControls() {
    const container = document.getElementById('overworld-container');
    if (!container) return;

    const controls = document.createElement('div');
    controls.id = 'overworld-controls';
    controls.style.cssText = `
        position: absolute; 
        bottom: 25px; 
        left: 50%; 
        transform: translateX(-50%); 
        display: grid; 
        grid-template-columns: 55px 55px 55px; 
        gap: 8px; 
        z-index: 9999;
    `;
    controls.innerHTML = `
        <div></div>
        <button onclick="window.moveDirection('up')" style="width:55px;height:55px;font-size:32px;background:#C084FC;color:#0a001f;border:none;border-radius:14px;box-shadow:0 4px 10px rgba(192,132,252,0.5);">↑</button>
        <div></div>
        
        <button onclick="window.moveDirection('left')" style="width:55px;height:55px;font-size:32px;background:#C084FC;color:#0a001f;border:none;border-radius:14px;box-shadow:0 4px 10px rgba(192,132,252,0.5);">←</button>
        <button onclick="window.moveDirection('down')" style="width:55px;height:55px;font-size:32px;background:#C084FC;color:#0a001f;border:none;border-radius:14px;box-shadow:0 4px 10px rgba(192,132,252,0.5);">↓</button>
        <button onclick="window.moveDirection('right')" style="width:55px;height:55px;font-size:32px;background:#C084FC;color:#0a001f;border:none;border-radius:14px;box-shadow:0 4px 10px rgba(192,132,252,0.5);">→</button>
    `;

    container.appendChild(controls);
    console.log('%c✅ Кнопки управления добавлены', 'color:#C084FC');
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initOverworld() {
    if (typeof Phaser === 'undefined') return console.error('Phaser не загружен');

    const config = {
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: 'overworld-container',
        scene: OverworldScene
    };

    gameScene = new Phaser.Game(config);

    // Кнопки появляются чуть позже, чтобы canvas был готов
    setTimeout(createControls, 800);

    console.log('%c🎮 Overworld v3.2 с большими кнопками загружен!', 'color:#C084FC; font-weight:bold');
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initOverworld);
}

window.changeZone = function(newZone) {
    currentZone = newZone;
    if (gameScene) gameScene.scene.restart();
    setTimeout(createControls, 1000); // перерисовываем кнопки при смене зоны
};

window.moveDirection = function(dir) {
    if (gameScene && gameScene.scene.getScene('OverworldScene')) {
        gameScene.scene.getScene('OverworldScene').movePlayer(dir);
    }
};
