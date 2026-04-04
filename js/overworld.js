// ====================== OVERWORLD.JS — ФИНАЛЬНАЯ ВЕРСИЯ (ФАЗА 6) ======================
let overworldGame = null;
let currentZone = 'pokemon';

class OverworldScene extends Phaser.Scene {
    constructor() { super('OverworldScene'); }

    preload() {
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png'); // замени на свой спрайт
    }

    create() {
        this.cameras.main.setBackgroundColor(0x112200);
        this.tileSize = 48;
        this.chunkSize = 12;
        this.loadedChunks = new Map();

        this.playerSprite = this.add.sprite(240, 240, 'player').setScale(1.5);
        this.playerSprite.setData('worldX', 0);
        this.playerSprite.setData('worldY', 0);

        this.generateChunk(0, 0);
        this.cameras.main.startFollow(this.playerSprite, true, 0.15, 0.15);

        console.log('%c🌍 Overworld готов к релизу (Фаза 6)', 'color:#C084FC; font-weight:bold');
    }

    generateChunk(chunkX, chunkY) {
        const key = `${chunkX},${chunkY}`;
        if (this.loadedChunks.has(key)) return;
        this.loadedChunks.set(key, true);

        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkSize; y++) {
                const wx = chunkX * this.chunkSize + x;
                const wy = chunkY * this.chunkSize + y;
                const isGrass = Math.random() < 0.68;

                this.add.rectangle(
                    wx * this.tileSize + this.tileSize / 2,
                    wy * this.tileSize + this.tileSize / 2,
                    this.tileSize, this.tileSize,
                    isGrass ? 0x00AA44 : 0x223300, 0.92
                ).setStrokeStyle(1, 0xC084FC).setData('grass', isGrass);
            }
        }
    }

    movePlayer(dir) {
        if (!this.playerSprite) return;
        let wx = this.playerSprite.getData('worldX');
        let wy = this.playerSprite.getData('worldY');

        if (dir === 'up') wy--;
        if (dir === 'down') wy++;
        if (dir === 'left') wx--;
        if (dir === 'right') wx++;

        this.playerSprite.setData('worldX', wx);
        this.playerSprite.setData('worldY', wy);
        this.playerSprite.x = wx * this.tileSize + this.tileSize / 2;
        this.playerSprite.y = wy * this.tileSize + this.tileSize / 2;

        const cx = Math.floor(wx / this.chunkSize);
        const cy = Math.floor(wy / this.chunkSize);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                this.generateChunk(cx + dx, cy + dy);
            }
        }

        if (Math.random() < 0.78) this.triggerBattle();
    }

    triggerBattle() {
        const pool = window.pokedexData || [];
        if (!pool.length) return;
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        const playerMon = currentParty?.[0] || { ru: "Пикачу", types: ["Electric"], hp: 130, maxhp: 130 };

        if (typeof startBattle === 'function') startBattle(playerMon, enemy, currentParty || []);
    }
}

function initOverworld() {
    const container = document.getElementById('overworld-container');
    if (!container) return;

    if (overworldGame) {
        overworldGame.destroy(true);
        overworldGame = null;
    }
    container.innerHTML = '';

    overworldGame = new Phaser.Game({
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: 'overworld-container',
        scene: OverworldScene
    });
}

function destroyOverworld() {
    if (overworldGame) {
        overworldGame.destroy(true);
        overworldGame = null;
    }
}

window.initOverworld = initOverworld;
window.destroyOverworld = destroyOverworld;
window.moveDirection = function(dir) {
    if (overworldGame) {
        const scene = overworldGame.scene.getScene('OverworldScene');
        if (scene) scene.movePlayer(dir);
    }
};
