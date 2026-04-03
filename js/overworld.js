// ====================== OVERWORLD.JS — v3.0 ЖИВОЙ МИР ======================
// Три мира + высокая трава + разные зоны + улучшенное управление

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

        // === ТАЙЛЫ ===
        this.tiles = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const isGrass = (currentZone === 'pokemon' && Math.random() < 0.4) ||
                                (currentZone === 'smeshariki' && Math.random() < 0.35) ||
                                (currentZone === 'darkmoon' && Math.random() < 0.25);

                const tile = this.add.rectangle(
                    x * this.tileSize + this.tileSize/2,
                    y * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    isGrass ? 0x00AA44 : 
                    currentZone === 'pokemon' ? 0x223300 :
                    currentZone === 'smeshariki' ? 0x00AA88 : 0x220033,
                    0.85
                ).setStrokeStyle(1, 0xC084FC);

                if (isGrass) tile.setData('grass', true);
                this.tiles.push(tile);
            }
        }

        // === ИГРОК ===
        playerSprite = this.add.sprite(240, 240, 'player').setScale(1.4);
        playerSprite.x = 5 * this.tileSize;
        playerSprite.y = 5 * this.tileSize;

        // Управление (джойстик из Telegram)
        window.moveDirection = (dir) => this.movePlayer(dir);

        console.log(`%c🌍 Overworld v3.0 — зона: ${currentZone} (с травой!)`, 'color:#C084FC; font-weight:bold');
    }

    updateZoneBackground() {
        const colors = {
            pokemon: 0x112200,
            smeshariki: 0x00BB99,
            darkmoon: 0x110022
        };
        this.cameras.main.setBackgroundColor(colors[currentZone] || 0x110022);
    }

    movePlayer(dir) {
        let newX = playerSprite.x;
        let newY = playerSprite.y;

        if (dir === 'up') newY -= this.tileSize;
        if (dir === 'down') newY += this.tileSize;
        if (dir === 'left') newX -= this.tileSize;
        if (dir === 'right') newX += this.tileSize;

        // Границы карты
        if (newX < 0 || newX >= 480 || newY < 0 || newY >= 480) return;

        playerSprite.x = newX;
        playerSprite.y = newY;

        // Проверка на траву
        const tile = this.tiles.find(t => 
            Math.abs(t.x - playerSprite.x) < 24 && Math.abs(t.y - playerSprite.y) < 24
        );

        if (tile && tile.getData('grass')) {
            if (Math.random() < 0.45) { // 45% шанс боя в траве
                this.triggerZoneBattle();
            }
        }
    }

    triggerZoneBattle() {
        let enemyPool = [];

        if (currentZone === 'pokemon') enemyPool = window.pokedexData || [];
        else if (currentZone === 'smeshariki') enemyPool = window.smesharikiData || [];
        else if (currentZone === 'darkmoon') enemyPool = window.darkmoonData || [];

        if (!enemyPool.length) enemyPool = window.pokedexData || [];

        const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];

        const playerHero = currentParty[0] || myHeroes[0] || {
            ru: "Пикачу", types: ["Electric"], hp: 130, maxhp: 130, attack: 85, level: 10
        };

        if (typeof startBattle === 'function') {
            startBattle(playerHero, randomEnemy, currentParty);
        }
    }
}

// ====================== СМЕНА ЗОН ======================
function changeZone(newZone) {
    currentZone = newZone;
    if (gameScene) gameScene.scene.restart();
    console.log(`%c🔄 Переход в зону: ${newZone.toUpperCase()}`, 'color:#C084FC; font-weight:bold');
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initOverworld() {
    if (typeof Phaser === 'undefined') return console.error('Phaser не загружен');

    const config = {
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: 'overworld-container',
        scene: OverworldScene,
        physics: { default: 'arcade' }
    };

    gameScene = new Phaser.Game(config);
    console.log('%c🎮 Overworld v3.0 загружен (трава + 3 мира)', 'color:#C084FC; font-weight:bold');
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initOverworld);
}

window.changeZone = changeZone;
