// ====================== OVERWORLD.JS — NEXUS EDITION v2.1 ======================
// Полная интеграция с battle.js + Lunadex + партия

let gameScene = null;
let stepCounter = 0;
let isDay = true; // День/ночь

// ====================== PHASER СЦЕНА ======================
class OverworldScene extends Phaser.Scene {
    constructor() {
        super('OverworldScene');
    }

    preload() {
        // Если нужны спрайты — загрузи здесь
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png'); // замени на свой
        this.load.image('grass', 'https://i.postimg.cc/3xKzL5vJ/grass-tile.png');
    }

    create() {
        // 10x10 grid (как было раньше)
        this.gridSize = 10;
        this.tileSize = 48;

        // Фон
        this.add.rectangle(240, 240, 480, 480, isDay ? 0x112200 : 0x110022).setDepth(-1);

        // Тайлы
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.add.rectangle(x * this.tileSize + this.tileSize/2, 
                                 y * this.tileSize + this.tileSize/2, 
                                 this.tileSize, this.tileSize, 
                                 0x223300, 0.6).setStrokeStyle(1, 0xC084FC);
            }
        }

        // Игрок
        this.player = this.add.sprite(240, 240, 'player').setScale(1.2);
        this.player.x = 5 * this.tileSize;
        this.player.y = 5 * this.tileSize;

        // Джойстик (твой старый код)
        window.moveDirection = (dir) => this.movePlayer(dir);

        // Запуск цикла дня/ночи
        this.time.addEvent({ delay: 60000, callback: this.toggleDayNight, callbackScope: this, loop: true });

        console.log('%c🌲 Overworld загружен и готов к случайным битвам', 'color:#C084FC');
    }

    movePlayer(dir) {
        let newX = this.player.x;
        let newY = this.player.y;

        if (dir === 'up') newY -= this.tileSize;
        if (dir === 'down') newY += this.tileSize;
        if (dir === 'left') newX -= this.tileSize;
        if (dir === 'right') newX += this.tileSize;

        // Границы
        if (newX < 0 || newX >= 480 || newY < 0 || newY >= 480) return;

        this.player.x = newX;
        this.player.y = newY;

        stepCounter++;

        // Случайная битва (25% шанс, как в Pokémon)
        if (Math.random() < 0.25) {
            this.triggerRandomBattle();
        }
    }

    triggerRandomBattle() {
        // Берём случайного врага из текущего мира (или любого)
        let enemyPool = window.pokedexData || window.gameData?.universes?.pokemon || [];
        const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];

        // Игрок — первый из партии
        const playerHero = currentParty[0] || myHeroes[0] || { 
            ru: "Пикачу", 
            types: ["Electric"], 
            hp: 120, 
            maxhp: 120, 
            attack: 85, 
            specialattack: 70 
        };

        // Запускаем бой
        if (typeof startBattle === 'function') {
            startBattle(playerHero, randomEnemy, currentParty);
        } else {
            console.error('startBattle не найден!');
        }
    }

    toggleDayNight() {
        isDay = !isDay;
        const color = isDay ? 0x112200 : 0x110022;
        this.cameras.main.setBackgroundColor(color);
        console.log(isDay ? '☀️ День' : '🌑 Ночь в NEXUS');
    }
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
function initOverworld() {
    if (typeof Phaser === 'undefined') {
        console.error('Phaser не загружен!');
        return;
    }

    const config = {
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: 'overworld-container', // div в index.html
        scene: OverworldScene,
        physics: { default: 'arcade' }
    };

    gameScene = new Phaser.Game(config);
    console.log('%c🎮 Overworld v2.1 готов (случайные битвы + день/ночь)', 'color:#C084FC; font-weight:bold');
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', initOverworld);
}

// Экспорт
window.triggerRandomBattle = () => { if (gameScene) gameScene.scene.getScene('OverworldScene').triggerRandomBattle(); };
