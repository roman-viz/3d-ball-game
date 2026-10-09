# BALLRUN — 3D Ball Rolling Game

BALLRUN is a browser-based 3D ball game built with React, Three.js, and React
Three Fiber. Roll a ball across narrow platforms, sharp turns, gaps, and
ramps in a colorful, physics-based obstacle course. Play with keyboard controls
on desktop or a touch joystick on mobile, and make it through all three levels.

## Features

- Real-time 3D gameplay with Rapier physics
- Three handcrafted obstacle-course levels with turns, slopes, and gaps
- Keyboard controls and a touch-friendly virtual joystick
- Follow camera, game progress HUD, and retry/next-level flow
- Optional game audio
- A surprise screamer event hidden in the final level
- Responsive browser game UI

## Controls

| Action | Controls |
| --- | --- |
| Move | `W` `A` `S` `D` or the arrow keys |
| Move on touch devices | Drag the on-screen joystick |
| Start or continue | Select the on-screen button |
| Toggle audio | Select the sound button |

## Play locally

You’ll need Node.js and npm installed.

```bash
git clone https://github.com/roman-viz/3d-ball-game.git
cd 3d-ball-game
npm install
npm run dev
```

Open the local URL printed by Vite to play.

## Build

```bash
npm run build
npm run preview
```

## Tech stack

React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and Rapier.

## Contributing

To add a level, create a `levelN.ts` file in `src/levels/` and export a
`LevelSegment[]` as its default export. The game loads and orders level files
by their number.