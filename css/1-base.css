/* ============================================
   style.css / 1  —  BASE
   Переменные, сброс, фон, оболочка app
   ============================================ */

:root {
  --bg: #050001;
  --card: #120508;
  --card2: #1a080c;
  --blood: #c4122e;
  --bright: #ff1f45;
  --neon: #ff2d55;
  --wine: #5a0a16;
  --gold: #c9a227;
  --text: #ffe8ec;
  --muted: #a07078;
  --line: rgba(255, 45, 85, 0.38);
  --glow: rgba(255, 45, 85, 0.55);
  --glow-soft: rgba(255, 45, 85, 0.22);
  --bar-bg: rgba(255, 45, 85, 0.12);
  --bar-fill: linear-gradient(90deg, #7a1020, #ff1f45, #ff6b85);
  --nav-h: 64px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

body {
  background:
    radial-gradient(ellipse 100% 55% at 50% -12%, rgba(180, 0, 40, 0.48), transparent 55%),
    radial-gradient(ellipse 70% 40% at 100% 80%, rgba(80, 0, 20, 0.4), transparent 50%),
    radial-gradient(ellipse 50% 30% at 0% 60%, rgba(120, 0, 30, 0.25), transparent 45%),
    var(--bg);
}

.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app::before {
  content: "";
  pointer-events: none;
  position: fixed;
  inset: 0;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: inset 0 0 80px rgba(255, 45, 85, 0.06);
  z-index: 50;
}

.content {
  flex: 1;
  padding: 18px 16px calc(var(--nav-h) + 28px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.screen { display: none; }
.screen.active { display: block; animation: rise 0.28s ease; }

@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

.hidden { display: none !important; }
