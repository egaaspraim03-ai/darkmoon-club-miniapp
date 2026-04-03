// ====================== OVERWORLD.JS — v3.5 ИСПРАВЛЕННЫЙ ======================

let currentZone = 'pokemon';
let gameScene = null;
let playerSprite = null;
let positionText = null;   // ← текст с координатами для отладки
let overworldSceneInstance = null;

class OverworldScene extends Phaser.Scene {
    constructor() {
        super('OverworldScene');
    }

    preload() {
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png');
    }

    create() {
        overworldSceneInstance = this;

        this.gridSize = 10;
        this.tileSize = 48;
        this.updateZoneBackground();

        // Тайлы
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

        // Отладочный текст (показывает координаты)
        positionText = this.add.text(10, 10, 'X: 240  Y: 240', {
            fontSize: '18px', color: '#C084FC', fontFamily: 'Arial'
        }).setScrollFactor(0);

        console.log('%c🌍 Overworld v3.5 — движение должно работать', 'color:#C084FC');
    }

    updateZoneBackground() {
        const colors = { pokemon: 0x112200, smeshariki: 0x00BB99, darkmoon: 0x110022 };
        this.cameras.main.setBackgroundColor(colors[currentZone] || 0x110022);
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

        // Обновляем текст координат
        if (positionText) positionText.setText(`X: ${Math.round(playerSprite.x)}  Y: ${Math.round(playerSprite.y)}`);

        console.log(`%c➡️ movePlayer: ${dir} → (${Math.round(playerSprite.x)}, ${Math.round(playerSprite.y)})`, 'color:#C084FC');

        // Проверка травы
        const tile = this.tiles.find(t => Math.abs(t.x - playerSprite.x) < 25 && Math.abs(t.y - playerSprite.y) < 25);
        if (tile && tile.getData('grass') && Math.random() < 0.45) {
            this.triggerZoneBattle();
        }
    }

    triggerZoneBattle() {
        const pool = window.pokedexData || [];
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        const playerHero = currentParty[0] || { ru: "Пикачу", types: ["Electric"], hp: 130, maxhp: 130, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" };
        if (typeof startBattle === 'function') startBattle(playerHero, enemy, currentParty);
    }
}

// ====================== КНОПКИ ======================
function createControls() {
    const container = document.getElementById('overworld-container');
    if (!container) return;

    const controls = document.createElement('div');
    controls.id = 'overworld-controls';
    controls.style.cssText = `position:absolute; bottom:30px; left:50%; transform:translateX(-50%); display:grid; grid-template-columns:62px 62px 62px; gap:10px; z-index:9999;`;
    controls.innerHTML = `
        <div></div>
        <button onclick="window.moveDirection('up')" style="width:62px;height:62px;font-size:34px;background:rgba(192,132,252,0.8);color:white;border:none;border-radius:16px;">↑</button>
        <div></div>
        <button onclick="window.moveDirection('left')" style="width:62px;height:62px;font-size:34px;background:rgba(192,132,252,0.8);color:white;border:none;border-radius:16px;">←</button>
        <button onclick="window.moveDirection('down')" style="width:62px;height:62px;font-size:34px;background:rgba(192,132,252,0.8);color:white;border:none;border-radius:16px;">↓</button>
        <button onclick="window.moveDirection('right')" style="width:62px;height:62px;font-size:34px;background:rgba(192,132,252,0.8);color:white;border:none;border-radius:16px;">→</button>
    `;
    container.appendChild(controls);
}

function initOverworld() {
    if (typeof Phaser === 'undefined') return console.error('Phaser не загружен');

    const config = { type: Phaser.AUTO, width: 480, height: 480, parent: 'overworld-container', scene: OverworldScene };
    gameScene = new Phaser.Game(config);

    setTimeout(createControls, 600);
}

if (typeof window !== 'undefined') window.addEventListener('load', initOverworld);

window.changeZone = function(newZone) { currentZone = newZone; if (gameScene) gameScene.scene.restart(); };
window.moveDirection = function(dir) { if (overworldSceneInstance) overworldSceneInstance.movePlayer(dir); };
