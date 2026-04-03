// ====================== OVERWORLD.JS — v4.1 МИНИМАЛЬНАЯ РАБОЧАЯ ======================

let currentZone = 'pokemon';
let gameScene = null;

class OverworldScene extends Phaser.Scene {
    constructor() { super('OverworldScene'); }

    preload() {
        this.load.image('player', 'https://i.postimg.cc/0yY7zZ0K/player.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x112200);

        // Тайлы
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const grass = Math.random() < 0.6;
                this.add.rectangle(
                    x * 48 + 24, y * 48 + 24,
                    48, 48,
                    grass ? 0x00AA44 : 0x223300, 0.9
                ).setStrokeStyle(1, 0xC084FC);
            }
        }

        // Игрок
        const player = this.add.sprite(240, 240, 'player').setScale(1.5);
        player.setData('x', 5);
        player.setData('y', 5);

        window.playerRef = player; // для кнопок
        console.log('%c🌍 Overworld v4.1 — должен быть виден', 'color:#C084FC');
    }
}

function initOverworld() {
    const container = document.getElementById('overworld-container');
    if (!container) return;

    // Полностью очищаем
    container.innerHTML = '';

    const config = {
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: 'overworld-container',
        scene: OverworldScene
    };

    gameScene = new Phaser.Game(config);

    // Добавляем кнопки через 1 секунду
    setTimeout(() => {
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
    }, 1000);
}

window.moveDirection = function(dir) {
    if (!window.playerRef) return;
    let x = window.playerRef.getData('x');
    let y = window.playerRef.getData('y');

    if (dir === 'up') y--;
    if (dir === 'down') y++;
    if (dir === 'left') x--;
    if (dir === 'right') x++;

    if (x < 0 || x > 9 || y < 0 || y > 9) return;

    window.playerRef.setData('x', x);
    window.playerRef.setData('y', y);
    window.playerRef.x = x * 48 + 24;
    window.playerRef.y = y * 48 + 24;

    // Шанс боя
    if (Math.random() < 0.75) {
        const pool = window.pokedexData || [];
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        const playerHero = currentParty[0] || { ru: "Пикачу", types: ["Electric"], hp: 130, maxhp: 130 };
        if (typeof startBattle === 'function') startBattle(playerHero, enemy, currentParty);
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('load', initOverworld);
}
