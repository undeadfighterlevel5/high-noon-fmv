# High Noon — FMV Western Shooter Prototype

This is a no-build, beginner-friendly browser game prototype inspired by 1990s live-action light-gun / FMV Western games.

## What version 0.1 includes

- Title screen
- Western scene
- Random outlaw spawn locations
- Click/tap shooting
- Six-shot ammo system
- `R` or on-screen reload
- Score
- Three lives
- Outlaw hit state
- Outlaw firing state
- Game-over / restart loop
- Asset renderer designed for **CSS placeholders, still images, or video**

## Run it

The simplest method is to double-click `index.html`.

For GitHub Pages later, upload all files to the repository root and publish the repository with GitHub Pages.

## Why the asset system matters

Game rules live in `game.js`, while media choices are described in `GAME_CONFIG`.

Current placeholder background:

```js
background: {
  type: "css",
  src: "western-town",
  loop: true
}
```

Future moving background:

```js
background: {
  type: "video",
  src: "assets/video/town-loop.mp4",
  loop: true
}
```

Current placeholder enemy:

```js
alive: { type: "css", src: "outlaw" }
```

Future filmed enemy:

```js
alive: {
  type: "video",
  src: "assets/video/outlaw-appears.mp4"
}
```

The shooting, score, lives, timing, and reload code do not need to change just because the artwork becomes video.

## Suggested next milestones

1. Replace placeholder town with a real image.
2. Replace outlaw with transparent PNG artwork.
3. Add multiple enemy types.
4. Add civilians that must **not** be shot.
5. Add real gunshot/reload audio.
6. Add a second scene.
7. Add video backgrounds.
8. Add filmed enemy appear / hit / fire clips.
9. Add branching FMV scene transitions.
10. Add boss encounters.

See `assets/README.md` for the planned asset structure.
