const DATA = window.GAME_DATA;

const $ = (sel) => document.querySelector(sel);
const els = {
  game: $('#game'), sceneLayer: $('#sceneLayer'), enemyLayer: $('#enemyLayer'), coverLayer: $('#coverLayer'),
  damageFlash: $('#damageFlash'), hud: $('#hud'), hudLevel: $('#hudLevel'), lives: $('#lives'), score: $('#score'), ammo: $('#ammo'),
  reloadButton: $('#reloadButton'), reloadZone: $('#reloadZone'), message: $('#message'), muzzleFlash: $('#muzzleFlash'),
  titleScreen: $('#titleScreen'), storyScreen: $('#storyScreen'), storyTitle: $('#storyTitle'), storyText: $('#storyText'), storyButton: $('#storyButton'), storyNext: $('#storyNext'), storySkip: $('#storySkip'),
  menuScreen: $('#menuScreen'), levelGrid: $('#levelGrid'), progressText: $('#progressText'), bossButton: $('#bossButton'), bossStatus: $('#bossStatus'),
  levelIntro: $('#levelIntro'), levelIntroDifficulty: $('#levelIntroDifficulty'), levelIntroTitle: $('#levelIntroTitle'), levelIntroText: $('#levelIntroText'), levelStartButton: $('#levelStartButton'), levelBackButton: $('#levelBackButton'),
  lifeLostScreen: $('#lifeLostScreen'), lifeLostText: $('#lifeLostText'), retryButton: $('#retryButton'),
  levelClearScreen: $('#levelClearScreen'), clearTitle: $('#clearTitle'), clearText: $('#clearText'), clearContinue: $('#clearContinue'),
  gameOverScreen: $('#gameOverScreen'), gameOverButton: $('#gameOverButton')
};

const state = {
  lives: DATA.startingLives,
  score: 0,
  ammo: DATA.maxAmmo,
  completed: new Set(),
  currentLevel: null,
  enemyIndex: 0,
  activeEnemy: null,
  ambientActors: new Map(),
  running: false,
  storyIndex: 0,
  timers: new Set()
};

function timer(fn, ms) {
  const id = setTimeout(() => { state.timers.delete(id); fn(); }, ms);
  state.timers.add(id);
  return id;
}
function clearTimers() { state.timers.forEach(clearTimeout); state.timers.clear(); }
function hideAllOverlays() { document.querySelectorAll('.overlay').forEach(x => x.classList.add('hidden')); }
function show(el) { el.classList.remove('hidden'); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function formatScore(value) {
  const sign = value < 0 ? '-' : '';
  return sign + String(Math.abs(value)).padStart(4, '0');
}

function updateHud() {
  els.lives.textContent = '♥'.repeat(state.lives) + '♡'.repeat(DATA.startingLives - state.lives);
  els.score.textContent = formatScore(state.score);
  els.ammo.textContent = '●'.repeat(state.ammo) + '○'.repeat(DATA.maxAmmo - state.ammo);
  els.hudLevel.textContent = state.currentLevel ? state.currentLevel.name : '—';
}

function showMessage(text, ms=700) {
  els.message.textContent = text;
  els.message.classList.remove('hidden');
  timer(() => els.message.classList.add('hidden'), ms);
}

function flashShot(clientX, clientY) {
  const r = els.game.getBoundingClientRect();
  els.muzzleFlash.style.left = `${clientX-r.left}px`;
  els.muzzleFlash.style.top = `${clientY-r.top}px`;
  els.muzzleFlash.classList.remove('active');
  void els.muzzleFlash.offsetWidth;
  els.muzzleFlash.classList.add('active');
}

function playGunSound() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(52, ctx.currentTime + .08);
  gain.gain.setValueAtTime(.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .11);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .11);
  setTimeout(() => ctx.close(), 170);
}

function consumeBullet(clientX, clientY) {
  if (!state.running) return false;
  if (state.ammo <= 0) { showMessage('RELOAD!'); return false; }
  state.ammo--;
  updateHud(); flashShot(clientX, clientY); playGunSound();
  if (state.ammo === 0) timer(() => showMessage('RELOAD!'), 100);
  return true;
}

function reload() {
  if (!state.running) return;
  if (state.ammo === DATA.maxAmmo) { showMessage('FULL CHAMBER', 450); return; }
  state.ammo = DATA.maxAmmo; updateHud(); showMessage('RELOADED', 450);
}

function renderMenu() {
  hideAllOverlays();
  state.running = false;
  els.hud.classList.add('hidden');
  els.reloadZone.classList.add('hidden');
  els.enemyLayer.replaceChildren(); els.coverLayer.replaceChildren(); state.ambientActors.clear();
  els.sceneLayer.className = 'scene-layer scene-town-map';
  els.sceneLayer.style.backgroundImage = '';
  els.sceneLayer.style.backgroundSize = '';
  els.sceneLayer.style.backgroundPosition = '';
  els.levelGrid.innerHTML = '';

  DATA.levels.forEach(level => {
    const done = state.completed.has(level.id);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `level-card ${done ? 'cleared' : ''}`;
    b.innerHTML = `<span class="level-number">${level.order}</span><strong>${level.name}</strong><span>${level.difficulty.replace(/LEVEL \d — /,'')}</span><small>${done ? 'CLEARED ✓' : 'SELECT LOCATION'}</small>`;
    b.addEventListener('click', () => openLevelIntro(level));
    els.levelGrid.appendChild(b);
  });

  els.progressText.textContent = `${state.completed.size} / 4 cleared`;
  const bossUnlocked = state.completed.size === DATA.levels.length;
  els.bossButton.disabled = !bossUnlocked;
  els.bossButton.classList.toggle('locked', !bossUnlocked);
  els.bossStatus.textContent = bossUnlocked ? 'Crowe has nowhere left to run. Enter the hideout.' : 'Clear all four locations to unlock the boss.';
  show(els.menuScreen);
}

function openLevelIntro(level) {
  state.currentLevel = level;
  els.levelIntroDifficulty.textContent = level.difficulty;
  els.levelIntroTitle.textContent = level.name;
  els.levelIntroText.textContent = level.description;
  hideAllOverlays(); show(els.levelIntro);
}

function resolveAnchor(level, actor, key = 'anchor') {
  const name = actor && actor[key];
  if (name && level.scene && level.scene.anchors && level.scene.anchors[name]) return level.scene.anchors[name];
  return actor || { x: 50, y: 60, scale: 1 };
}

function applyAnchor(el, anchor) {
  el.style.left = `${anchor.x}%`;
  el.style.top = `${anchor.y}%`;
  el.style.setProperty('--enemy-scale', anchor.scale || 1);
  if (anchor.z) el.style.zIndex = String(anchor.z);
}

function resolveSlot(level, anchor) {
  const slotName = anchor && anchor.slot;
  if (!slotName || !level.scene || !level.scene.slots) return null;
  return { id: slotName, ...(level.scene.slots[slotName] || {}) };
}

function mountActor(level, actorEl, anchor) {
  const slot = resolveSlot(level, anchor);
  if (!slot) return { node: actorEl, actorEl };
  const viewport = document.createElement('div');
  viewport.className = `actor-viewport slot-${slot.id}`;
  viewport.style.clipPath = slot.clipPath;
  viewport.style.webkitClipPath = slot.clipPath;
  viewport.style.zIndex = String(slot.z || anchor.z || 20);
  viewport.appendChild(actorEl);
  return { node: viewport, actorEl };
}

function renderScene(level) {
  els.sceneLayer.className = `scene-layer ${level.sceneClass || ''}`;
  els.sceneLayer.style.backgroundImage = '';
  els.sceneLayer.style.backgroundSize = '';
  els.sceneLayer.style.backgroundPosition = '';
  els.coverLayer.innerHTML = '';

  if (level.scene && level.scene.background) {
    els.sceneLayer.style.backgroundImage = `url("${level.scene.background}")`;
    els.sceneLayer.style.backgroundSize = 'cover';
    els.sceneLayer.style.backgroundPosition = 'center center';
    (level.scene.occluders || []).forEach(o => {
      const img = document.createElement('img');
      img.className = 'scene-occluder';
      img.src = o.src;
      img.alt = '';
      img.dataset.occluder = o.id || '';
      els.coverLayer.appendChild(img);
    });
    return;
  }

  (level.cover || []).forEach(c => {
    const el = document.createElement('div');
    el.className = `cover ${c.type}`;
    el.style.left = `${c.x}%`; el.style.top = `${c.y}%`; el.style.width = `${c.w}%`; el.style.height = `${c.h}%`;
    els.coverLayer.appendChild(el);
  });
}

function createActorVisual(actor, anchor) {
  const el = document.createElement('div');
  const kind = actor.kind || 'villain';
  const role = actor.role || (kind === 'civilian' ? 'poker' : 'outlaw');
  const motion = actor.motion || (actor.reveal === 'left' ? 'leanLeft' : actor.reveal === 'right' ? 'leanRight' : 'rise');
  const pose = actor.pose || 'standing';
  el.className = `enemy actor kind-${kind} role-${role} motion-${motion} pose-${pose} ${actor.boss ? 'boss-enemy' : ''}`;
  applyAnchor(el, anchor);

  if (kind === 'civilian') {
    if (role === 'bartender') {
      el.innerHTML = `<div class="civilian bartender"><div class="hair"></div><div class="head"></div><div class="mustache"></div><div class="torso"></div><div class="apron"></div><div class="hand left"></div><div class="hand right"></div></div><div class="shot-target"></div>`;
    } else {
      el.innerHTML = `<div class="civilian poker"><div class="hat"></div><div class="head"></div><div class="mustache"></div><div class="torso"></div><div class="vest"></div><div class="hand left"></div><div class="hand right"></div></div><div class="shot-target"></div>`;
    }
  } else {
    el.innerHTML = `<div class="outlaw"><div class="hat"></div><div class="head"></div><div class="body"></div><div class="arm"></div><div class="gun"></div></div><div class="shot-target"></div>`;
  }
  const hitbox = actor.hitbox || {};
  el.style.setProperty('--hit-left', `${hitbox.left ?? 0}%`);
  el.style.setProperty('--hit-right', `${hitbox.right ?? 0}%`);
  el.style.setProperty('--hit-top', `${hitbox.top ?? 0}%`);
  el.style.setProperty('--hit-bottom', `${hitbox.bottom ?? 0}%`);
  return el;
}

function penalizeCivilian(actorRecord, event) {
  event.preventDefault(); event.stopPropagation();
  if (!state.running || actorRecord.shot) return;
  if (!consumeBullet(event.clientX, event.clientY)) return;
  actorRecord.shot = true;
  state.score -= 500;
  updateHud();
  showMessage('INNOCENT! -500', 900);
  actorRecord.el.classList.add('civilian-hit');

  const active = state.activeEnemy;
  const isActiveActor = active && active.ambientId === actorRecord.data.id;
  if (isActiveActor) {
    state.enemyIndex++;
    state.activeEnemy = null;
    timer(() => {
      actorRecord.node.remove();
      state.ambientActors.delete(actorRecord.data.id);
      timer(spawnNextEnemy, DATA.betweenEnemiesMs);
    }, DATA.hitDisplayMs);
  } else {
    timer(() => {
      actorRecord.node.remove();
      state.ambientActors.delete(actorRecord.data.id);
    }, DATA.hitDisplayMs);
  }
}

function renderAmbientActors(level) {
  state.ambientActors.clear();
  const actors = level.scene?.ambientActors || [];
  actors.forEach(data => {
    const anchor = resolveAnchor(level, data);
    const el = createActorVisual(data, anchor);
    el.classList.add('ambient-actor', 'revealed');
    const mounted = mountActor(level, el, anchor);
    els.enemyLayer.appendChild(mounted.node);
    const record = { data, el, node: mounted.node, shot: false };
    state.ambientActors.set(data.id, record);
    el.querySelector('.shot-target').addEventListener('pointerdown', e => penalizeCivilian(record, e));
  });
}

function beginLevel(level) {
  clearTimers(); hideAllOverlays();
  state.currentLevel = level; state.enemyIndex = 0; state.activeEnemy = null; state.running = true; state.ammo = DATA.maxAmmo;
  els.enemyLayer.replaceChildren(); state.ambientActors.clear();
  renderScene(level); renderAmbientActors(level);
  els.hud.classList.remove('hidden'); els.reloadZone.classList.remove('hidden'); updateHud();
  showMessage(level.id === 'hideout' ? 'CROWE IS HERE' : 'DRAW!', 700);
  timer(spawnNextEnemy, 850);
}

function reactionTime(enemy) {
  const jitter = Math.floor(Math.random() * (DATA.reactionJitterMs*2+1)) - DATA.reactionJitterMs;
  return clamp(enemy.reactionMs + jitter, 300, 3000);
}

function finishAmbientEncounter(active, actorRecord) {
  if (!state.running || state.activeEnemy !== active) return;
  state.enemyIndex++;
  state.activeEnemy = null;
  actorRecord.node.remove();
  state.ambientActors.delete(actorRecord.data.id);
  timer(spawnNextEnemy, DATA.betweenEnemiesMs);
}

function runAmbientEncounter(encounter) {
  const actorRecord = state.ambientActors.get(encounter.actorId);
  if (!actorRecord || !actorRecord.el.isConnected || actorRecord.shot) {
    state.enemyIndex++;
    timer(spawnNextEnemy, 180);
    return;
  }

  const el = actorRecord.el;
  const active = { data: encounter, el, kind: 'civilian', ambientId: encounter.actorId, hit: false, fired: false };
  state.activeEnemy = active;
  el.classList.add('active-encounter');

  if (encounter.motion === 'standExitLeft' || encounter.motion === 'standExitRight') {
    el.classList.remove('pose-seated');
    el.classList.add('pose-standing', 'civilian-standing');
    timer(() => {
      if (!state.running || state.activeEnemy !== active || actorRecord.shot) return;
      el.classList.add(encounter.motion === 'standExitLeft' ? 'exit-left' : 'exit-right');
    }, 520);
  }

  timer(() => {
    if (!state.running || state.activeEnemy !== active || actorRecord.shot) return;
    finishAmbientEncounter(active, actorRecord);
  }, encounter.visibleMs || DATA.civilianVisibleMs || 1350);
}

function spawnDynamicEncounter(encounter) {
  const level = state.currentLevel;
  const targetAnchor = resolveAnchor(level, encounter, 'anchor');
  const startAnchor = encounter.startAnchor ? resolveAnchor(level, encounter, 'startAnchor') : targetAnchor;
  const el = createActorVisual(encounter, startAnchor);
  const mounted = mountActor(level, el, targetAnchor);
  els.enemyLayer.appendChild(mounted.node);

  const moveMs = encounter.startAnchor ? (encounter.moveMs || 700) : 0;
  if (moveMs) el.style.setProperty('--move-ms', `${moveMs}ms`);

  requestAnimationFrame(() => {
    el.classList.add('revealed');
    if (moveMs) applyAnchor(el, targetAnchor);
  });

  const active = { data: encounter, el, node: mounted.node, hit: false, fired: false, kind: encounter.kind || 'villain' };
  state.activeEnemy = active;

  el.querySelector('.shot-target').addEventListener('pointerdown', event => {
    event.preventDefault(); event.stopPropagation();
    if (!state.running || active.fired) return;
    if (!consumeBullet(event.clientX, event.clientY)) return;
    el.classList.remove('repeat-hit'); void el.offsetWidth; el.classList.add('repeat-hit');
    if (active.hit) return;

    if (active.kind === 'civilian') {
      active.hit = true;
      state.score -= 500;
      updateHud(); showMessage('INNOCENT! -500', 900); el.classList.add('civilian-hit');
    } else {
      active.hit = true;
      state.score += encounter.boss ? 500 : DATA.scorePerHit;
      updateHud(); el.classList.add('hit');
    }

    state.enemyIndex++;
    timer(() => {
      if (mounted.node.isConnected) mounted.node.remove();
      state.activeEnemy = null;
      timer(spawnNextEnemy, DATA.betweenEnemiesMs);
    }, DATA.hitDisplayMs);
  });

  if ((encounter.kind || 'villain') === 'civilian') {
    timer(() => {
      if (!state.running || active.hit || state.activeEnemy !== active) return;
      state.enemyIndex++;
      state.activeEnemy = null;
      el.classList.add('civilian-exit');
      timer(() => { mounted.node.remove(); timer(spawnNextEnemy, DATA.betweenEnemiesMs); }, 220);
    }, moveMs + (encounter.visibleMs || DATA.civilianVisibleMs || 1350));
    return;
  }

  timer(() => {
    if (!state.running || active.hit || active.fired || state.activeEnemy !== active) return;
    active.fired = true; el.classList.add('firing');
    timer(() => loseLife(), 150);
  }, moveMs + reactionTime(encounter));
}

function spawnNextEnemy() {
  if (!state.running) return;
  const sequence = (state.currentLevel.encounters && state.currentLevel.encounters.length)
    ? state.currentLevel.encounters
    : state.currentLevel.enemies;
  if (state.enemyIndex >= sequence.length) { clearLevel(); return; }

  const encounter = sequence[state.enemyIndex];
  if (encounter.actorId) runAmbientEncounter(encounter);
  else spawnDynamicEncounter(encounter);
}

function loseLife() {
  if (!state.running) return;
  state.running = false; clearTimers();
  state.lives--;
  updateHud();
  els.damageFlash.classList.add('active'); setTimeout(() => els.damageFlash.classList.remove('active'), 160);
  if (state.lives <= 0) {
    timer(() => {
      state.completed.clear(); state.score = 0; state.lives = DATA.startingLives; state.currentLevel = null;
      hideAllOverlays(); show(els.gameOverScreen); els.hud.classList.add('hidden'); els.reloadZone.classList.add('hidden');
    }, 350);
    return;
  }
  const word = state.lives === 1 ? 'life' : 'lives';
  els.lifeLostText.textContent = `Careful — you only have ${state.lives} ${word} left. This location will restart from the beginning.`;
  timer(() => { hideAllOverlays(); show(els.lifeLostScreen); els.hud.classList.add('hidden'); els.reloadZone.classList.add('hidden'); }, 350);
}

function clearLevel() {
  state.running = false; clearTimers();
  const isBoss = state.currentLevel.id === DATA.boss.id;
  if (isBoss) {
    els.clearTitle.textContent = 'CROWE IS DOWN';
    els.clearText.textContent = 'Mercy\'s Run is free. Prototype campaign complete.';
  } else {
    state.completed.add(state.currentLevel.id);
    els.clearTitle.textContent = `${state.currentLevel.name.toUpperCase()} CLEARED`;
    els.clearText.textContent = state.completed.size === DATA.levels.length ? 'All four locations are clear. Crowe\'s hideout is now unlocked.' : `${state.completed.size} of 4 locations cleared.`;
  }
  hideAllOverlays(); show(els.levelClearScreen); els.hud.classList.add('hidden'); els.reloadZone.classList.add('hidden');
}

function resetCampaign() {
  clearTimers(); state.lives = DATA.startingLives; state.score = 0; state.ammo = DATA.maxAmmo; state.completed.clear(); state.currentLevel = null; state.enemyIndex = 0; state.activeEnemy = null; state.ambientActors.clear(); state.running = false; renderMenu();
}

function renderStory() {
  const page = DATA.story[state.storyIndex];
  els.storyTitle.textContent = page.title; els.storyText.textContent = page.text;
  els.storyNext.textContent = state.storyIndex === DATA.story.length - 1 ? 'GO TO TOWN MAP' : 'CONTINUE';
}

els.storyButton.addEventListener('click', () => { state.storyIndex = 0; hideAllOverlays(); renderStory(); show(els.storyScreen); });
els.storyNext.addEventListener('click', () => { if (state.storyIndex < DATA.story.length - 1) { state.storyIndex++; renderStory(); } else renderMenu(); });
els.storySkip.addEventListener('click', renderMenu);
els.levelBackButton.addEventListener('click', renderMenu);
els.levelStartButton.addEventListener('click', () => beginLevel(state.currentLevel));
els.retryButton.addEventListener('click', () => beginLevel(state.currentLevel));
els.clearContinue.addEventListener('click', renderMenu);
els.gameOverButton.addEventListener('click', resetCampaign);
els.bossButton.addEventListener('click', () => { if (!els.bossButton.disabled) openLevelIntro(DATA.boss); });
els.reloadButton.addEventListener('click', (e) => { e.stopPropagation(); reload(); });
els.reloadZone.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); reload(); });
els.game.addEventListener('pointerdown', (e) => { if (!state.running) return; if (e.target.closest('button') || e.target.closest('#reloadZone')) return; consumeBullet(e.clientX, e.clientY); });
document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'r') reload(); });

updateHud();
