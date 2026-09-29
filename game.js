// HIGH NOON prototype v0.1
// The renderer is intentionally media-agnostic so temporary art can later
// be replaced with images, GIFs, or MP4/WebM video without changing game logic.

const GAME_CONFIG = {
  maxAmmo: 6,
  startingLives: 3,
  enemyVisibleMs: 1450,
  betweenEnemiesMinMs: 450,
  betweenEnemiesMaxMs: 900,
  hitDisplayMs: 360,
  enemyFireDisplayMs: 520,
  scorePerHit: 100,

  scene: {
    background: {
      type: "css",
      src: "western-town",
      loop: true
      // Future example:
      // type: "video",
      // src: "assets/video/town-loop.mp4",
      // loop: true
    },

    spawnPoints: [
      { x: 17, y: 63 },
      { x: 33, y: 56 },
      { x: 50, y: 63 },
      { x: 65, y: 55 },
      { x: 80, y: 63 },
      { x: 91, y: 58 }
    ]
  },

  enemy: {
    alive: { type: "css", src: "outlaw" },
    hit:   { type: "css", src: "outlaw-hit" },
    fire:  { type: "css", src: "outlaw-fire" }

    // Later these can become:
    // alive: { type: "video", src: "assets/video/outlaw-appears.mp4" },
    // hit:   { type: "video", src: "assets/video/outlaw-shot.mp4" },
    // fire:  { type: "video", src: "assets/video/outlaw-fires.mp4" }
  }
};

const els = {
  game: document.querySelector("#game"),
  backgroundLayer: document.querySelector("#backgroundLayer"),
  enemyLayer: document.querySelector("#enemyLayer"),
  score: document.querySelector("#score"),
  lives: document.querySelector("#lives"),
  ammo: document.querySelector("#ammo"),
  reloadButton: document.querySelector("#reloadButton"),
  startScreen: document.querySelector("#startScreen"),
  gameOverScreen: document.querySelector("#gameOverScreen"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  finalScore: document.querySelector("#finalScore"),
  message: document.querySelector("#message"),
  damageFlash: document.querySelector("#damageFlash"),
  muzzleFlash: document.querySelector("#muzzleFlash")
};

const state = {
  running: false,
  score: 0,
  lives: GAME_CONFIG.startingLives,
  ammo: GAME_CONFIG.maxAmmo,
  activeEnemy: null,
  enemyTimer: null,
  nextSpawnTimer: null,
  messageTimer: null
};

function makeCssAsset(name) {
  if (name === "western-town") {
    const el = document.createElement("div");
    el.className = "placeholder-town";
    return el;
  }

  const el = document.createElement("div");
  el.className = "placeholder-outlaw";

  if (name === "outlaw-hit") el.classList.add("hit");
  if (name === "outlaw-fire") el.classList.add("fire");

  el.innerHTML = `
    <div class="hat"></div>
    <div class="head"></div>
    <div class="body"></div>
    <div class="gun"></div>
  `;
  return el;
}

function makeMediaAsset(asset, { background = false } = {}) {
  if (!asset) return document.createElement("div");

  if (asset.type === "css") {
    return makeCssAsset(asset.src);
  }

  if (asset.type === "image") {
    const img = document.createElement("img");
    img.src = asset.src;
    img.alt = "";
    img.draggable = false;
    if (background) img.className = "media-fill";
    return img;
  }

  if (asset.type === "video") {
    const video = document.createElement("video");
    video.src = asset.src;
    video.autoplay = true;
    video.muted = asset.muted ?? true;
    video.loop = asset.loop ?? false;
    video.playsInline = true;
    video.preload = "auto";
    if (background) video.className = "media-fill";
    return video;
  }

  throw new Error(`Unsupported asset type: ${asset.type}`);
}

function renderBackground() {
  els.backgroundLayer.replaceChildren(
    makeMediaAsset(GAME_CONFIG.scene.background, { background: true })
  );
}

function renderEnemyState(enemyEl, asset) {
  enemyEl.replaceChildren(makeMediaAsset(asset));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSpawnPoint() {
  const points = GAME_CONFIG.scene.spawnPoints;
  return points[Math.floor(Math.random() * points.length)];
}

function updateHud() {
  els.score.textContent = String(state.score).padStart(4, "0");
  els.lives.textContent = "♥".repeat(Math.max(0, state.lives)) || "—";
  els.ammo.textContent =
    "●".repeat(state.ammo) + "○".repeat(GAME_CONFIG.maxAmmo - state.ammo);
}

function showMessage(text, ms = 700) {
  clearTimeout(state.messageTimer);
  els.message.textContent = text;
  els.message.classList.remove("hidden");
  state.messageTimer = setTimeout(() => {
    els.message.classList.add("hidden");
  }, ms);
}

function flashShot(clientX, clientY) {
  const rect = els.game.getBoundingClientRect();
  els.muzzleFlash.style.left = `${clientX - rect.left}px`;
  els.muzzleFlash.style.top = `${clientY - rect.top}px`;
  els.muzzleFlash.classList.remove("active");
  void els.muzzleFlash.offsetWidth;
  els.muzzleFlash.classList.add("active");
}

function playGunSound() {
  // Placeholder synthesized sound. Replace later with an audio file if desired.
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(135, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
  setTimeout(() => ctx.close(), 160);
}

function consumeBullet(clientX, clientY) {
  if (!state.running) return false;

  if (state.ammo <= 0) {
    showMessage("RELOAD!");
    return false;
  }

  state.ammo -= 1;
  updateHud();
  flashShot(clientX, clientY);
  playGunSound();

  if (state.ammo === 0) {
    setTimeout(() => showMessage("RELOAD!"), 100);
  }

  return true;
}

function clearActiveEnemy() {
  clearTimeout(state.enemyTimer);
  state.enemyTimer = null;

  if (state.activeEnemy?.el?.isConnected) {
    state.activeEnemy.el.remove();
  }

  state.activeEnemy = null;
}

function scheduleNextEnemy() {
  if (!state.running) return;

  clearTimeout(state.nextSpawnTimer);
  state.nextSpawnTimer = setTimeout(
    spawnEnemy,
    randomBetween(
      GAME_CONFIG.betweenEnemiesMinMs,
      GAME_CONFIG.betweenEnemiesMaxMs
    )
  );
}

function spawnEnemy() {
  if (!state.running) return;

  clearActiveEnemy();

  const point = pickSpawnPoint();
  const enemyEl = document.createElement("div");
  enemyEl.className = "enemy";
  enemyEl.style.left = `${point.x}%`;
  enemyEl.style.top = `${point.y}%`;

  renderEnemyState(enemyEl, GAME_CONFIG.enemy.alive);
  els.enemyLayer.append(enemyEl);

  const enemy = {
    el: enemyEl,
    resolved: false
  };

  state.activeEnemy = enemy;

  enemyEl.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (enemy.resolved || !state.running) return;
    if (!consumeBullet(event.clientX, event.clientY)) return;

    enemy.resolved = true;
    clearTimeout(state.enemyTimer);

    state.score += GAME_CONFIG.scorePerHit;
    updateHud();
    renderEnemyState(enemyEl, GAME_CONFIG.enemy.hit);

    setTimeout(() => {
      if (state.activeEnemy === enemy) {
        clearActiveEnemy();
        scheduleNextEnemy();
      }
    }, GAME_CONFIG.hitDisplayMs);
  });

  state.enemyTimer = setTimeout(() => {
    if (enemy.resolved || !state.running) return;

    enemy.resolved = true;
    renderEnemyState(enemyEl, GAME_CONFIG.enemy.fire);
    state.lives -= 1;
    updateHud();

    els.damageFlash.classList.add("active");
    setTimeout(() => els.damageFlash.classList.remove("active"), 130);

    if (state.lives <= 0) {
      setTimeout(endGame, GAME_CONFIG.enemyFireDisplayMs);
      return;
    }

    setTimeout(() => {
      if (state.activeEnemy === enemy) {
        clearActiveEnemy();
        scheduleNextEnemy();
      }
    }, GAME_CONFIG.enemyFireDisplayMs);
  }, GAME_CONFIG.enemyVisibleMs);
}

function reload() {
  if (!state.running) return;

  if (state.ammo === GAME_CONFIG.maxAmmo) {
    showMessage("FULL CHAMBER", 500);
    return;
  }

  state.ammo = GAME_CONFIG.maxAmmo;
  updateHud();
  showMessage("RELOADED", 500);
}

function startGame() {
  clearTimeout(state.nextSpawnTimer);
  clearActiveEnemy();

  state.running = true;
  state.score = 0;
  state.lives = GAME_CONFIG.startingLives;
  state.ammo = GAME_CONFIG.maxAmmo;

  els.startScreen.classList.add("hidden");
  els.gameOverScreen.classList.add("hidden");

  updateHud();
  renderBackground();
  showMessage("DRAW!", 650);
  scheduleNextEnemy();
}

function endGame() {
  state.running = false;
  clearTimeout(state.nextSpawnTimer);
  clearActiveEnemy();

  els.finalScore.textContent = state.score;
  els.gameOverScreen.classList.remove("hidden");
}

els.game.addEventListener("pointerdown", (event) => {
  if (!state.running) return;
  if (event.target.closest("button")) return;

  // A miss still spends a bullet.
  consumeBullet(event.clientX, event.clientY);
});

els.reloadButton.addEventListener("click", (event) => {
  event.stopPropagation();
  reload();
});

els.startButton.addEventListener("click", startGame);
els.restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") reload();
});

renderBackground();
updateHud();
