// ====================== OVERWORLD.JS — v4.0 ЧИСТАЯ ВЕРСИЯ (как в Pokémon Emerald) ======================

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
        // Полностью очищаем предыдущий контент
        this.cameras.main.setBackgroundColor(0x112200);

        this.gridSize = 10;
        this.tileSize = 48;

        // Создаём тайлы
        this.tiles = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const isGrass = Math.random() < 0.65; // много травы для теста
                const tile = this.add.rectangle(
                    x * this.tileSize + this.tileSize/2,
                    y * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    isGrass ? 0x00AA44 : 0x223300,
                    0.9
                ).setStrokeStyle(2, 0xC084FC);

                if (isGrass) tile.setData('grass', true);
                this.tiles.push(tile);
            }
        }

        // Игрок
        playerSprite = this.add.sprite(240, 240, 'player').setScale(1.5);
        playerSprite.x = 5 * this.tileSize;
        playerSprite.y = 5 * this.tileSize;

        console.log('%c🌍 Overworld v4.0 — чистая версия загружена', 'color:#C084FC; font-weight:bold');
    }

    movePlayer(dir) {
        if (!playerSprite) return;

        let newX = playerSprite.x;
        let newY = playerSprite.y;

        if (dir === 'up') newY -= this.tileSize;
        if (dir === 'down') newY += this.tileSize;
        if (dir === 'left') newX -= this.tileSize;
        if (dir === 'right') newX += this.tileSize;

        if (newX < 0 || newX >= 480 || newY < 0 || newY >= 480) return;

        playerSprite.x = newX;
        playerSprite.y = newY;

        // Проверка травы
        const tile = this.tiles.find(t => Math.abs(t.x - playerSprite.x) < 25 && Math.abs(t.y - playerSprite.y) < 25);
        if (tile && tile.getData('grass')) {
            if (Math.random() < 0.8) { // очень высокий шанс
                this.triggerZoneBattle();
            }
        }
    }

    triggerZoneBattle() {
        const pool = window.pokedexData || [];
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        const playerHero = currentParty[0] || { ru: "Пикачу", types: ["Electric"], hp: 130, maxhp: 130, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" };

        console.log('%c⚔️ БОЙ ЗАПУСКАЕТСЯ!', 'color:#ff0; font-size:18px');
        if (typeof startBattle === 'function') startBattle(playerHero, enemy, currentParty);
    }
}

// ====================== КНОПКИ ======================
function createControls() {
    const container = document.getElementById('overworld-container');
    if (!container) return;

    // Удаляем всё предыдущее
    container.innerHTML = '';

    const controlsHTML = `
        <div style="position:absolute; bottom:30px; left:50%; transform:translateX(-50%); display:grid; grid-template-columns:62px 62px 62px; gap:12px; z-index:9999;">
            <div></div>
            <button onclick="window.moveDirection('up')" style="width:62px;height:62px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:16px;box-shadow:0 6px 20px rgba(192,132,252,0.7);">↑</button>
            <div></div>
            <button onclick="window.moveDirection('left')" style="width:62px;height:62px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:16px;box-shadow:0 6px 20px rgba(192,132,252,0.7);">←</button>
            <button onclick="window.moveDirection('down')" style="width:62px;height:62px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:16px;box-shadow:0 6px 20px rgba(192,132,252,0.7);">↓</button>
            <button onclick="window.moveDirection('right')" style="width:62px;height:62px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:16px;box-shadow:0 6px 20px rgba(192,132,252,0.7);">→</button>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = controlsHTML;
    container.appendChild(div.firstElementChild);
}

function initOverworld() {
    if (typeof Phaser === 'undefined') return console.error('Phaser не загружен');

    // Полностью очищаем контейнер перед запуском
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

window.changeZone = function(newZone) {
    currentZone = newZone;
    if (gameScene) gameScene.scene.restart();
};

window.moveDirection = function(dir) {
    if (sceneInstance) sceneInstance.movePlayer(dir); // sceneInstance будет определена ниже
};
