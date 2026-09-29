# Asset Folder Plan

Nothing important is stored here yet. The prototype intentionally uses code-drawn placeholders.

As the game grows, use folders like:

```text
assets/
  images/
    town/
      town-main.jpg
    enemies/
      outlaw-01.png
      outlaw-01-hit.png

  video/
    scenes/
      town-loop.mp4
      saloon-loop.mp4
    enemies/
      outlaw-01-appears.webm
      outlaw-01-hit.webm
      outlaw-01-fires.webm

  audio/
    gunshot-01.mp3
    reload.mp3
    ricochet.mp3
    music-theme.mp3
```

## Important FMV note

Transparent video is possible, but browser support and file size need planning. A very practical future approach is either:

1. Film enemies against green screen and export transparent WebM where supported, or
2. Make the enemy video occupy a rectangular "window" that naturally belongs in the scene.

Do not rename or replace game code just to change media. Update the asset entries in `GAME_CONFIG` instead.
