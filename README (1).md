# High Noon FMV — Prototype v0.2

This version turns the original shooting test into a small campaign framework.

## Added in v0.2
- Start screen and skippable story
- Town map with four selectable locations
- Four fixed-difficulty levels
- Boss hideout unlocks after all four are cleared
- Fixed enemy order and fixed spawn positions for memory-mapping
- Per-enemy reaction times with only tiny timing jitter
- Scene-specific cover objects
- Enemies emerge from behind cover / doors / counters
- Three-life system
- Taking a hit costs one life and restarts the whole selected level
- Game over resets the campaign and returns to the map
- Repeat shots are allowed after an enemy is hit; only the first hit scores
- Sidebar HUD for lives, ammo, score, and location
- Bottom-screen reload zone with a reload cursor
- `R` and the sidebar button still reload

## Important architecture
`game-data.js` contains the story, levels, fixed enemy sequence, positions, and response times. `game.js` contains the engine. This is deliberate: later, still images and FMV clips can replace the temporary CSS scenes without rebuilding the rules.

The four current scenes are placeholder CSS art. The next asset pass can replace each scene with a 16:9 background image and later with looping video.

## Upload to GitHub
Replace these files in the repo root:
- `index.html`
- `styles.css`
- `game.js`

And add:
- `game-data.js`

GitHub Pages will redeploy automatically after the commit.
