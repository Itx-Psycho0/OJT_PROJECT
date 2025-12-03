# ✈️ SkyRunner 3D – A Fast-Paced Three.js Air Combat Runner

SkyRunner 3D is a fully interactive endless flying game built with **Three.js**, featuring smooth animations, boss fights, particle effects, bloom rendering, dynamic environments, enemy AI, and a polished UI/UX.

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

GAME_FOLDER
│
├── node_modules/              ← Dependencies installed by npm
│
├── src/                       ← All JavaScript game logic
│   ├── Objects/               ← 3D models & game entities
│   ├── utils.js
│   ├── constants.js
│   ├── SoundManager.js
│   └── main.js                ← Main game file
│
├── .gitignore                 ← Git ignore rules
├── index.html                 ← Main HTML entry
├── style.css                  ← UI / styling
├── package.json               ← Project metadata + scripts
├── package-lock.json          ← Exact dependency versions
└── README.md                  ← Documentation
## 🎮 Gameplay Preview
<video controls src="./Assets/DemoVideo.mp4" title="Title"></video>