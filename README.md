# 🌐 NEON SPHERE 3D

```text
  _   _  ______ ____  _   _    _____ _____  _    _ ______ _____  ______ 
 | \ | ||  ____/ __ \| \ | |  / ____|  __ \| |  | |  ____|  __ \|  ____|
 |  \| || |__ | |  | |  \| | | (___ | |__) | |__| | |__  | |__) | |__   
 | . ` ||  __|| |  | | . ` |  \___ \|  ___/|  __  |  __| |  _  /|  __|  
 | |\  || |___| |__| | |\  |  ____) | |    | |  | | |____| | \ \| |____ 
 |_| \_||______\____/|_| \_| |_____/|_|    |_|  |_|______|_|  \_\______|
                             
```

> **A high-speed 3D retro arcade wireframe runner built with Three.js, React 19, and Tailwind CSS.**  
> Dodge lethal magenta hazards, weave across cyber grid lanes, and survive the digital abyss.

---

## ⚡ Overview

**NEON SPHERE 3D** is an adrenaline-fueled endless runner set in a glowing cyberpunk metropolis. Pilot a high-velocity geodesic sphere along an infinite 5-lane highway flanked by towering skyscrapers with illuminated window check grids and hot neon pink canyon borders.

The game is engineered for instant reflex arcade gameplay with zero latency, responsive device scaling, and rock-solid 60 FPS WebGL rendering.

---

## 🎮 Key Features

- **🌆 Procedural Synthwave Canyon**: Continuous procedural skyscraper skyline with vector window check grids, illuminated roadside neon pillars, and glowing pink curb runners.
- **🏎️ Dynamic Velocity & HUD**: Speedometer smoothly accelerates from `0 KM/H` upwards as your survival time increases, displayed in an electric cyan sci-fi HUD frame.
- **🛑 Magenta Hazard Blocks**: Lethal magenta cross-braced cubes that drop from the sky, slide across lanes, and force split-second lane switches.
- **🎯 5-Lane High-Precision Controls**: Snappy horizontal physics with velocity damping for pinpoint lane weaving.
- **📱 Universal Responsiveness**: Auto-adapting camera FOV (`computeBaseFov`) ensures the full track, ball, and skyscrapers are framed across smartphones, tablets, laptops, and ultra-wide desktops.
- **🔇 Clean Mobile Touch Steering**: 100% transparent touch zones with disabled browser tap-highlight and `touch-action: none` for smooth control.
- **🕹️ Retro Synthwave Audio**: Custom procedural Web Audio oscillator sound effects for countdown beeps, button interactions, whooshes, and crash explosions (no external audio assets required).
- **✨ Secret Easter Egg**: Discover the hidden developer credits card on the home screen!

---

## 🕹️ Controls

| Platform | Controls | Action |
| :--- | :--- | :--- |
| **Desktop / Laptop** | `[A]` or `[◄]` (Left Arrow) | Steer Left |
| **Desktop / Laptop** | `[D]` or `[►]` (Right Arrow) | Steer Right |
| **Mobile / Tablet** | Tap / Hold **Left Half** of Screen | Steer Left |
| **Mobile / Tablet** | Tap / Hold **Right Half** of Screen | Steer Right |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/) (WebGL)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (real-time synthesized retro SFX)

---

## 📂 Project Structure

```text
├── src/
│   ├── components/         # UI HUD & reusable arcade components
│   │   ├── ArcadeButton.tsx # Sci-fi octagonal clip-path buttons
│   │   └── HeaderHUD.tsx    # Speedometer, Score & High-score top bar
│   ├── game/               # Core Three.js game engine
│   │   ├── Collision.ts     # AABB obstacle & player hitboxes
│   │   ├── GameManager.ts   # Main loop, timing, difficulty & lifecycle
│   │   ├── GameScene.ts     # Three.js camera, renderer & responsive FOV
│   │   ├── Obstacles.ts     # Dynamic hazard spawners & movement
│   │   ├── Player.ts        # Geodesic sphere physics & shatter FX
│   │   ├── ScoreManager.ts  # Session scoring & record keeper
│   │   └── World.ts         # Digital highway grid & skyscraper canyon
│   ├── screens/            # Overlay views
│   │   ├── GameOverScreen.tsx
│   │   ├── GameScreen.tsx   # Canvas root & touch controllers
│   │   ├── HowToPlayScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   └── StartScreen.tsx  # Title, menu & credits easter egg
│   ├── sound/              # Synthesized Web Audio sound manager
│   ├── types.ts            # Core TypeScript interfaces & game states
│   ├── App.tsx             # Root React container
│   └── main.tsx            # Application entry point
├── index.html              # HTML shell with Google Fonts & viewport meta
└── package.json            # Dependencies and scripts
```
