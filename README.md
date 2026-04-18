# Red Box Browser Game

A small Kaboom.js platform game where you move a red square character, collect moving objects, and complete the level as quickly as possible.

## Project Structure

- `index.html` – page shell, canvas mount point, mobile control buttons, and inline CSS.
- `game.js` – all gameplay logic (initialization, scene setup, entities, controls, scoring, and win flow).
- `sprites/` – image assets currently present in the repo, though the active game logic uses primitive shapes.
- `prompt.txt` – original prompt describing the game concept.

## Running Locally

Because this project loads Kaboom from a CDN, you can run it with a simple static server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

(Opening `index.html` directly can work in many browsers, but a local server is more reliable.)

## Gameplay Overview

- Move with **Left / Right arrow keys**.
- Jump with **Space**.
- On touch devices, use the on-screen left, jump, and right buttons.
- Collect all moving objects:
  - **Gold balls** (+5 points each)
  - **Pink triangles** (+10 points each)
- The HUD tracks score, elapsed time, best time (per run), and remaining collectibles.
- Falling off-screen respawns the player at the start.

## Code Walkthrough Highlights

- Kaboom is initialized in `game.js` with fixed dimensions (`800x600`) and gravity.
- A single scene (`"game"`) defines all objects and behavior.
- Player controls combine keyboard state and touch-button state flags.
- Collectibles are spawned with randomized positions and simple bounce movement against screen bounds.
- Level completion triggers when all collectibles are gathered and shows a restart message.

## Good Next Steps for Contributors

1. **Persist best time across restarts** using `localStorage`.
2. **Split `game.js` into modules** (`player.js`, `collectibles.js`, `ui.js`) for maintainability.
3. **Add multiple levels** and scene transitions.
4. **Introduce hazards/enemies** for failure states and richer gameplay.
5. **Add automated checks** (linting with ESLint and formatting with Prettier).

## Notes

The previous README had unresolved merge-conflict markers; this version consolidates the intended project documentation.
