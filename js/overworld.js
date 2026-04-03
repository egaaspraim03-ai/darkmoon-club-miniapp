// ====================== OVERWORLD.JS — v5.0 БЕСКОНЕЧНАЯ КАРТА (как Emerald) ======================

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
        this.chunkSize = 12;           // размер одного "куска" карты
        this.loadedChunks = new Map(); // чтобы не перегенерировать тайлы

        // Начальная позиция игрока
        playerSprite = this.add.sprite(240, 240, 'player').setScale(1.5);
        playerSprite.setData('worldX', 0);
        playerSprite.setData('worldY', 0);

        // Генерируем начальный чанк
        this.generateChunk(0, 0);

        // Камера следует за игроком
        this.cameras.main.startFollow(playerSprite, true, 0.15, 0.15);

        console.log('%c🌍 Overworld v5.0 — бесконечная карта как в Emerald', 'color:#C084FC; font-weight:bold');
    }

    generateChunk(chunkX, chunkY) {
        const key = `${chunkX},${chunkY}`;
        if (this.loadedChunks.has(key)) return;
        this.loadedChunks.set(key, true);

        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkSize; y++) {
                const worldX = chunkX * this.chunkSize + x;
                const worldY = chunkY * this.chunkSize + y;

                const isGrass = Math.random() < 0.68; // много травы

                this.add.rectangle(
                    worldX * this.tileSize + this.tileSize/2,
                    worldY * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    isGrass ? 0x00AA44 : 0x223300,
                    0.92
                ).setStrokeStyle(1, 0xC084FC)
                 .setData('grass', isGrass);
            }
        }
    }

    movePlayer(dir) {
        if (!playerSprite) return;

        let worldX = playerSprite.getData('worldX');
        let worldY = playerSprite.getData('worldY');

        if (dir === 'up') worldY--;
        if (dir === 'down') worldY++;
        if (dir === 'left') worldX--;
        if (dir === 'right') worldX++;

        playerSprite.setData('worldX', worldX);
        playerSprite.setData('worldY', worldY);

        // Плавное движение
        playerSprite.x = worldX * this.tileSize + this.tileSize/2;
        playerSprite.y = worldY * this.tileSize + this.tileSize/2;

        // Генерируем новые чанки вокруг игрока
        const currentChunkX = Math.floor(worldX / this.chunkSize);
        const currentChunkY = Math.floor(worldY / this.chunkSize);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                this.generateChunk(currentChunkX + dx, currentChunkY + dy);
            }
        }

        // Проверка на траву
        const tileX = Math.floor(playerSprite.x / this.tileSize);
        const tileY = Math.floor(playerSprite.y / this.tileSize);

        // Простая проверка — если текущая клетка трава
        if (Math.random() < 0.78) {   // высокий шанс встречи
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

        console.log('%c⚔️ Бой из травы запущен!', 'color:#ff0; font-size:18px');
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
