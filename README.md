# ✈️ Ejected Cube : A Fast-Paced Three.js Air Combat Runner

Ejected Cube is a fully interactive endless flying game built with **Three.js**, featuring smooth animations, boss fights, particle effects, bloom rendering, dynamic environments, enemy AI, and a polished UI/UX.

This game challenges your reflexes while immersing you in a glowing, futuristic sky world.

---

## 🚀 Features

### 🎯 Core Gameplay
- Smooth airplane movement via mouse
- Increasing game speed based on distance
- Health, ammo, and energy systems
- Procedural coin + enemy spawning
- Ammo packs, score tracking, and hit effects

### 👹 Boss Fights
- Boss spawns at each level threshold  
- Custom HP bar + danger flash  
- Scaling HP + size per level  
- Bullet collision + boss movement AI  

### ⚡ Visual Effects
- **Unreal Bloom Pass** for glowing effects  
- Particle explosion system  
- Animated sky + background  
- Color-coded collectibles & enemies  

### 🔊 Sound Effects
- Shooting  
- Coin pickup  
- Crashes  
- Background ambience  

### 🧠 Progression System
- 6 unlockable levels  
- Enemy spawn rate increases each level  
- Boss fights introduce new challenge spikes  

---

## 📁 Project Structure

GAME_FOLDER/FILES
│
├── **node_modules/**  
│   Dependencies installed by npm.
│
├── **src/**  
│   All JavaScript game logic.  
│   │  
│   ├── **Objects/**  
│   │   Contains 3D models and game entity classes.  
│   │  
│   ├── **utils.js**  
│   │   Helper functions used throughout the game.  
│   │  
│   ├── **constants.js**  
│   │   Stores reusable constant values such as colors, speeds, limits, etc.  
│   │  
│   ├── **SoundManager.js**  
│   │   Handles sound effects and audio playback.  
│   │  
│   └── **main.js**  
│       Main game file — initializes the scene, renderer, camera, game loop, etc.
│
├── **.gitignore**  
│   Git ignore rules for excluding files like node_modules.  
│
├── **index.html**  
│   Main HTML entry point of the game.
│
├── **style.css**  
│   UI and styling used in the HTML elements.
│
├── **package.json**  
│   Project metadata, npm scripts, and dependencies.
│
├── **package-lock.json**  
│   Locked versions of installed dependencies.
│
└── **README.md**  
    Documentation for the project.

