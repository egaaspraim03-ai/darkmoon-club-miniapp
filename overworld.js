// ====================== OVERWORLD.JS — v2.1 NEXUS ULTIMATE ======================
// Три мира + зоны + интеграция с battle.js v2.3

let currentZone = 'pokemon'; // по умолчанию
let gameScene = null;

class OverworldScene extends Phaser.Scene {
    constructor() {
        super('OverworldScene');
    }

    preload() {
        // Можно добавить свои спрайты позже
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png');
    }

    create() {
        this.gridSize = 10;
        this.tileSize = 48;

        this.updateZoneBackground();

        // Тайлы
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.add.rectangle(
                    x * this.tileSize + this.tileSize/2,
                    y * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    currentZone === 'pokemon' ? 0x223300 :
                    currentZone === 'smeshariki' ? 0x00AA88 : 0x110033,
                    0.7
                ).setStrokeStyle(2, 0xC084FC);
            }
        }

        // Игрок
        this.player = this.add.sprite(240, 240, 'player').setScale(1.3);
        this.player.x = 5 * this.tileSize;
        this.player.y = 5 * this.tileSize;

        // Джойстик (твой старый код)
        window.moveDirection = (dir) => this.movePlayer(dir);

        // День/ночь
        this.time.addEvent({ delay: 45000, callback: this.toggleDayNight, callbackScope: this, loop: true });

        console.log(`%c🌍 Overworld v2.1 загружен. Текущая зона: ${currentZone}`, 'color:#C084FC');
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
        let newX = this.player.x;
        let newY = this.player.y;

        if (dir === 'up') newY -= this.tileSize;
        if (dir === 'down') newY += this.tileSize;
        if (dir === 'left') newX -= this.tileSize;
        if (dir === 'right') newX += this.tileSize;

        if (newX < 0 || newX >= 480 || newY < 0 || newY >= 480) return;

        this.player.x = newX;
        this.player.y = newY;

        // Случайная битва (25%)
        if (Math.random() < 0.25) {
            this.triggerZoneBattle();
        }
    }

    triggerZoneBattle() {
        let enemyPool = [];

        if (currentZone === 'pokemon') {
            enemyPool = window.pokedexData || window.gameData?.universes?.pokemon || [];
        } else if (currentZone === 'smeshariki') {
            enemyPool = window.smesharikiData || [];
        } else if (currentZone === 'darkmoon') {
            enemyPool = window.darkmoonData || [];
        }

        if (!enemyPool.length) {
            enemyPool = window.pokedexData || []; // fallback
        }

        const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];

        const playerHero = currentParty[0] || myHeroes[0] || {
            ru: "Пикачу",
            types: ["Electric"],
            hp: 130,
            maxhp: 130,
            attack: 85,
            specialattack: 75,
            level: 10
        };

        if (typeof startBattle === 'function') {
            startBattle(playerHero, randomEnemy, currentParty);
        }
    }

    toggleDayNight() {
        // Можно добавить визуальные эффекты позже
        console.log(currentZone === 'darkmoon' ? '🌑 Ночь в Бездне' : '☀️ День');
    }
}

// ====================== УПРАВЛЕНИЕ ЗОНАМИ ======================
function changeZone(newZone) {
    currentZone = newZone;
    if (gameScene) {
        gameScene.scene.restart();
    }
    console.log(`%c🔄 Переход в зону: ${newZone}`, 'color:#C084FC; font-weight:bold');
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
    console.log('%c🎮 Overworld v2.1 готов (три мира + случайные битвы)', 'color:#C084FC; font-weight:bold');
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initOverworld);
}

// Экспорт для вызова из других файлов
window.changeZone = changeZone;
window.triggerRandomBattle = () => {
    if (gameScene) gameScene.scene.getScene('OverworldScene').triggerZoneBattle();
};
