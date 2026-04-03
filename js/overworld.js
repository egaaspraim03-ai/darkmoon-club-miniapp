// ====================== OVERWORLD.JS — v4.2 ФИНАЛЬНАЯ ======================
// Камера следует за игроком + надёжный запуск боя

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

        this.gridSize = 15;     // чуть больше карты
        this.tileSize = 48;

        this.tiles = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const grass = Math.random() < 0.65;
                const tile = this.add.rectangle(
                    x * this.tileSize + this.tileSize/2,
                    y * this.tileSize + this.tileSize/2,
                    this.tileSize, this.tileSize,
                    grass ? 0x00AA44 : 0x223300, 0.9
                ).setStrokeStyle(1, 0xC084FC);
                if (grass) tile.setData('grass', true);
                this.tiles.push(tile);
            }
        }

        playerSprite = this.add.sprite(240, 240, 'player').setScale(1.5);
        playerSprite.x = 7 * this.tileSize;
        playerSprite.y = 7 * this.tileSize;

        // Камера следует за игроком
        this.cameras.main.startFollow(playerSprite);

        console.log('%c🌍 Overworld v4.2 — камера + бой готовы', 'color:#C084FC');
    }

    movePlayer(dir) {
        if (!playerSprite) return;

        let newX = playerSprite.x;
        let newY = playerSprite.y;

        if (dir === 'up') newY -= this.tileSize;
        if (dir === 'down') newY += this.tileSize;
        if (dir === 'left') newX -= this.tileSize;
        if (dir === 'right') newX += this.tileSize;

        playerSprite.x = newX;
        playerSprite.y = newY;

        // Проверка травы
        const tile = this.tiles.find(t => 
            Math.abs(t.x - playerSprite.x) < 30 && Math.abs(t.y - playerSprite.y) < 30
        );

        if (tile && tile.getData('grass') && Math.random() < 0.85) {
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

        console.log('%c⚔️ БОЙ ЗАПУСКАЕТСЯ!', 'color:#ff0; font-size:18px');
        if (typeof startBattle === 'function') startBattle(playerHero, enemy, currentParty);
    }
}

// ====================== КНОПКИ ======================
function createControls() {
    const container = document.getElementById('overworld-container');
    if (!container) return;

    container.innerHTML = ''; // очищаем всё предыдущее

    const controls = document.createElement('div');
    controls.style.cssText = `position:absolute; bottom:30px; left:50%; transform:translateX(-50%); display:grid; grid-template-columns:70px 70px 70px; gap:12px; z-index:9999;`;
    controls.innerHTML = `
        <div></div>
        <button onclick="window.moveDirection('up')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">↑</button>
        <div></div>
        <button onclick="window.moveDirection('left')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">←</button>
        <button onclick="window.moveDirection('down')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">↓</button>
        <button onclick="window.moveDirection('right')" style="width:70px;height:70px;font-size:36px;background:rgba(192,132,252,0.9);color:#0a001f;border:none;border-radius:18px;">→</button>
        
        <button onclick="window.forceBattle()" style="grid-column:1/-1; margin-top:15px; padding:14px; background:#C084FC; color:#0a001f; border:none; border-radius:18px; font-weight:bold;">⚔️ Запустить бой (тест)</button>
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
window.moveDirection = function(dir) { if (gameScene) gameScene.scene.getScene('OverworldScene').movePlayer(dir); };
window.forceBattle = function() { if (gameScene) gameScene.scene.getScene('OverworldScene').triggerZoneBattle(); };
