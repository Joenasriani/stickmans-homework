# Stickman's Homework

Stickman's Homework is a notebook-styled browser platformer built with React, TypeScript, Vite, PixiJS, Motion, and Tailwind CSS.

The player moves a drawn stick figure through a sequence of math-themed platforming levels, avoids hazards, collects number values, and reaches each level goal.

## Project identity

This repository is a distinct game project. It is not the same game or code lineage as:

- `Joenasriani/stickman`
- `Joenasriani/threadbound-game`

The projects share a stick-figure visual language but use different implementations and game structures.

## Current implementation

The game currently defines 11 levels, from `origin_0` through `final_10`.

Implemented mechanics include:

- horizontal acceleration and friction
- gravity
- coyote time
- jump buffering
- triple jump
- fast-fall input
- directional dash with cooldown
- moving hazards
- falling platforms
- spike and saw collision
- pit death
- particle effects
- screen shake
- animated stickman poses
- idle pose changes
- level narrative overlays
- game-over, level-complete, and final-victory states

## Math mechanic

Each level generates a target sum when the level state is initialized.

Three number entities are placed on platforms:

- two values are generated to add up to the target;
- a third value is generated as a distractor.

Collecting number entities updates the player's collected count and sum. After two numbers have been collected, an incorrect total triggers the game-over state.

## Levels

The authored level set includes:

1. `(0,0) - The Origin`
2. `Approaching the Limit`
3. `Topological Rupture`
4. `The First Derivative`
5. `Gradient Descent`
6. `Vector Field Interference`
7. `Complex Transformation`
8. `Convergent Series`
9. `The Entropy Gauntlet`
10. `Event Horizon`
11. `Q.E.D. - The Universal Truth`

Level geometry and hazards are defined in `src/levels.ts`.

## Controls

Desktop controls implemented by the game:

- **Left / Right Arrow** or **A / D** — move
- **W / Up Arrow / Space** — jump
- **S / Down Arrow** — fast fall
- **Shift + horizontal direction** — dash
- **R** — reset the current state

On smaller screens, the interface also exposes touch controls for left, right, and jump input.

## Rendering

The game renders through PixiJS using `@pixi/react`.

The presentation uses an intentionally sketch-like visual system. `src/game/Renderer.ts` generates irregular duplicate line paths for ink-style geometry and computes stickman poses from movement, game-over state, and idle duration.

Additional interface transitions and overlays use Motion. Completion feedback also uses `canvas-confetti`.

## Physics and hazards

`src/game/Physics.ts` contains the main movement and collision update.

It handles:

- ground and air acceleration
- speed limiting
- ground and air friction
- gravity and variable jump height
- coyote-time and jump-buffer counters
- dash state
- moving saw paths
- falling-platform timers
- platform collision
- hazard collision
- number collection
- particle updates
- level-boundary and pit checks

The game operates on an 800×600 logical playfield.

## Save data

Save and load behavior is implemented with browser `localStorage`.

The saved state currently records:

- level index
- player position
- player velocity
- score
- remaining jumps
- timestamp

The storage key is defined in `src/lib/storage.ts`.

## Technology

- React 19
- TypeScript
- Vite
- PixiJS
- `@pixi/react`
- Motion
- Tailwind CSS
- canvas-confetti

## Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run the TypeScript no-emit check configured by the repository:

```bash
npm run lint
```

## Repository structure

Key implementation files include:

```text
src/
├── App.tsx
├── components/
│   └── GameCanvas.tsx
├── game/
│   ├── Physics.ts
│   └── Renderer.ts
├── lib/
│   └── storage.ts
├── levels.ts
└── types.ts
```

`GameCanvas.tsx` coordinates the active game state, PixiJS world rendering, level transitions, overlays, save/load controls, replay state, and mobile input.
