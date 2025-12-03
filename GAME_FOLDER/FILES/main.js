import * as THREE from "three";
import { Colors } from "./constants.js";
import { normalize } from "./utils.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { Sea } from "./Objects/Sea.js";
import { Sky } from "./Objects/Sky.js";
import {Airplane} from "./Objects/Airplane.js";
import { Coin } from "./objects/Coin.js";
import { Enemy } from "./Objects/Enemy.js";
import { AmmoPack } from "./Objects/AmmoPack.js";
import { Bullet } from "./Objects/Bullet.js";
import { Boss } from "./Objects/Boss.js";
import { Background } from "./Objects/Background.js";
import { ParticleManager } from "./Objects/ParticleManager.js";
import { SoundManager } from "./SoundManager.js";

// --- LEVEL CONFIG ---
const LEVEL_CONFIG = {
  1: { target: 500, enemyChance: 0.02 },
  2: { target: 1500, enemyChance: 0.04 },
  3: { target: 3000, enemyChance: 0.07 },
  4: { target: 6000, enemyChance: 0.1 },
  5: { target: 12000, enemyChance: 0.15 },
  6: { target: 999999, enemyChance: 0.2 },
};

class Game {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;

    this.sea = null;
    this.sky = null;
    this.airplane = null;
    this.background = null;
    this.particles = null;
    this.soundManager = null;

    this.mousePos = { x: 0, y: 0 };
    this.coins = [];
    this.enemies = [];
    this.ammoPacks = [];
    this.bullets = [];
    this.activeBoss = null;

    this.score = 0;
    this.energy = 100;
    this.ammo = 30;
    this.level = 1;

    this.baseSpeed = 1.6;
    this.gameSpeed = 1.6;

    this.status = "waiting";
    this.elapsedTime = 0;
    this.shakeIntensity = 0;

    this.coinPattern = { active: false, count: 0, type: "random", timer: 0 };

    this.init();
  }

  init() {
    this.createScene();
    this.createLights();

    this.particles = new ParticleManager(this.scene);
    this.soundManager = new SoundManager();
    this.background = new Background(this.scene);

    this.createSea();
    this.createSky();
    this.createPlane();

    document.addEventListener(
      "mousemove",
      (e) => this.handleMouseMove(e),
      false
    );
    window.addEventListener("resize", () => this.handleWindowResize(), false);

    document.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        this.shoot();
      },
      false
    );

    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const startScreen = document.getElementById("start-screen");
        if (startScreen) {
          startScreen.style.opacity = "0";
          startScreen.style.pointerEvents = "none";
        }
        this.status = "starting";
        if (this.soundManager) this.soundManager.resume();
        setTimeout(() => {
          if (startScreen) startScreen.style.display = "none";
        }, 500);
      });
    }

    this.updateLevelUI();
    this.updateAmmoUI();
    this.loop();
  }

  createScene() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(Colors.spaceDark);
    this.scene.fog = new THREE.Fog(Colors.spaceDark, 100, 950);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      1,
      10000
    );
    this.camera.position.set(0, 150, 400);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    const container = document.getElementById("world") || document.body;
    container.appendChild(this.renderer.domElement);
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.5,
      0.4,
      0.1
    );
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
  }

  createLights() {
    this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
    this.scene.add(this.hemisphereLight);
    this.shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.shadowLight.position.set(150, 350, 350);
    this.shadowLight.castShadow = true;
    this.shadowLight.shadow.camera.left = -400;
    this.shadowLight.shadow.camera.right = 400;
    this.shadowLight.shadow.camera.top = 400;
    this.shadowLight.shadow.camera.bottom = -400;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 1000;
    this.shadowLight.shadow.mapSize.width = 2048;
    this.shadowLight.shadow.mapSize.height = 2048;
    this.ambientLight = new THREE.AmbientLight(Colors.spaceLight, 0.2);
    this.scene.add(this.ambientLight);
    this.scene.add(this.shadowLight);
  }
  createSea() {
    this.sea = new Sea();
    this.scene.add(this.sea.mesh);
  }
  createSky() {
    this.sky = new Sky();
    this.sky.mesh.position.y = -600;
    this.scene.add(this.sky.mesh);
  }
  createPlane() {
    this.airplane = new Airplane();
    this.airplane.mesh.scale.set(0.75, 0.75, 0.75);
    this.airplane.mesh.position.y = -200;
    this.scene.add(this.airplane.mesh);
  }

  // --- GAME LOOP ---
  loop() {
    this.sea.tick();
    this.sky.tick();
    if (this.particles) this.particles.tick();
    this.updateEnvironment();

    if (this.status === "waiting") {
      // Menu idle animation
    } else if (this.status === "starting") {
      this.camera.position.z -= 2;
      this.camera.position.y -= 0.5;
      this.airplane.mesh.position.y += 2.5;
      if (this.camera.position.z <= 200) {
        this.camera.position.z = 200;
        this.camera.position.y = 100;
        this.airplane.mesh.position.y = 100;
        this.status = "playing";
        ["dashboard", "ammo-ui", "bottom-text"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.classList.remove("hidden");
        });
      }
      this.airplane.tick(this.particles);
    } else if (this.status === "playing") {
      // --- CRITICAL FIX: Check Level Up every frame ---
      this.score += this.gameSpeed * 0.1;
      this.checkLevelUp(); // <--- This ensures Boss spawns when distance is reached

      this.updatePlane();
      this.spawnCoins();
      this.updateCoins();
      this.spawnEnemies();
      this.updateEnemies();
      this.spawnAmmoPacks();
      this.updateAmmoPacks();
      this.updateBullets();
      this.updateEnergyLoop();
      this.updateLevelUI();
    } else if (this.status === "boss_fight") {
      this.updatePlane();
      this.updateBoss();
      this.updateBullets();
      this.updateEnergyLoop();
    } else if (this.status === "gameover") {
      this.airplane.mesh.rotation.z += 0.05;
      this.airplane.mesh.rotation.y += 0.05;
      this.airplane.mesh.position.y -= 2;
      if (this.airplane.mesh.position.y < -50)
        this.airplane.mesh.position.y = -50;
    }

    this.composer.render();
    requestAnimationFrame(() => this.loop());
  }

  // --- BOSS LOGIC ---
  spawnBoss() {
    if (this.activeBoss || this.status === "boss_fight") return;
    this.status = "boss_fight";

    // 1. Trigger Danger Flash
    const danger = document.getElementById("danger-screen");
    if (danger) {
      danger.classList.remove("danger-pulse");
      void danger.offsetWidth; // Reset animation
      danger.classList.add("danger-pulse");
    }

    // 2. Show HUD
    const bossHud = document.getElementById("boss-hud");
    if (bossHud) bossHud.classList.remove("hidden");
    const bossBar = document.getElementById("boss-health-fill");
    if (bossBar) bossBar.style.width = "100%";

    // 3. Create Boss
    this.activeBoss = new Boss();
    this.activeBoss.maxHp = 20 + this.level * 10;
    this.activeBoss.hp = this.activeBoss.maxHp;

    const scaleMod = 1 + this.level * 0.2;
    this.activeBoss.mesh.scale.setScalar(scaleMod);

    // Spawn at X=400 so it flies into view
    this.activeBoss.mesh.position.set(400, 100, 0);
    this.scene.add(this.activeBoss.mesh);

    // Slow down game speed for "Focus Mode"
    this.gameSpeed = 0.5;
  }

  updateBoss() {
    if (!this.activeBoss) return;
    this.activeBoss.tick();

    // Boss moves towards player
    this.activeBoss.mesh.position.x -= 1.0;

    // 1. Check Collision with Player
    const dist = this.airplane.mesh.position.distanceTo(
      this.activeBoss.mesh.position
    );
    const hitRadius = 40 * this.activeBoss.mesh.scale.x;

    if (dist < hitRadius) {
      this.removeEnergy(100); // Insta-Death
      this.airplane.hit();
      this.gameOver();
      return;
    }

    // 2. Check if Boss passed the player (Escape)
    if (this.activeBoss.mesh.position.x < this.airplane.mesh.position.x - 50) {
      this.energy = Math.floor(this.energy / 2); // Penalty
      this.updateUI();
      this.airplane.hit(); // Shake screen
      this.killBoss(); // Level Up anyway (but punished)
    }
  }

  killBoss() {
    // Explosion FX
    this.particles.spawn(this.activeBoss.mesh.position, 0xff0000, 100);
    if (this.soundManager) this.soundManager.playCrash();

    this.scene.remove(this.activeBoss.mesh);
    this.activeBoss = null;

    // Hide HUD
    const bossHud = document.getElementById("boss-hud");
    if (bossHud) bossHud.classList.add("hidden");

    // Advance Level
    this.status = "playing";
    this.level++;

    // Restore Speed
    this.checkSpeedUp();
    this.gameSpeed += 0.5; // Bonus speed for next level

    this.ammo = 30; // Refill ammo
    this.updateAmmoUI();
    this.updateLevelUI();
  }

  updateBossUI() {
    if (this.activeBoss) {
      const pct = (this.activeBoss.hp / this.activeBoss.maxHp) * 100;
      const bar = document.getElementById("boss-health-fill");
      if (bar) bar.style.width = `${pct}%`;
    }
  }

  // --- PROGRESSION CHECKS ---
  checkLevelUp() {
    if (this.activeBoss) return;

    const config = LEVEL_CONFIG[this.level];
    // Safety check: Ensure we don't crash if level > 6
    if (config && this.score >= config.target) {
      if (this.level < 6) {
        this.spawnBoss();
      }
    } else if (!config && this.level >= 6) {
      // Infinite mode logic (optional)
    }
  }

  checkSpeedUp() {
    const speedStep = Math.floor(this.score / 200);
    this.gameSpeed = this.baseSpeed + speedStep * 0.5;
  }

  // --- HELPERS ---
  spawnCoins() {
    if (this.activeBoss) return;
    if (!this.coinPattern.active) {
      if (Math.random() < 0.005) {
        this.coinPattern.active = true;
        this.coinPattern.count = 10 + Math.floor(Math.random() * 5);
        const types = ["sine", "arrow", "scatter"];
        this.coinPattern.type = types[Math.floor(Math.random() * types.length)];
        this.coinPattern.timer = 0;
      }
    } else {
      if (this.coinPattern.count > 0) {
        if (this.coinPattern.timer % 10 === 0) {
          const coin = new Coin();
          coin.mesh.position.x = this.width / 2 + 50;
          const t = this.coinPattern.timer;
          const jitter = (Math.random() - 0.5) * 30;
          switch (this.coinPattern.type) {
            case "sine":
              coin.mesh.position.y = 100 + Math.sin(t * 0.3) * 50 + jitter;
              break;
            case "arrow":
              coin.mesh.position.y =
                100 + Math.abs((t % 20) - 10) * 15 - 50 + jitter;
              break;
            default:
              coin.mesh.position.y = Math.random() * (175 - 25) + 25;
              break;
          }
          this.scene.add(coin.mesh);
          this.coins.push(coin);
          this.coinPattern.count--;
        }
        this.coinPattern.timer++;
      } else {
        this.coinPattern.active = false;
      }
    }
  }
  shoot() {
    if (this.status !== "playing" && this.status !== "boss_fight") return;
    const now = Date.now();
    if (now - (this.lastShot || 0) < 150) return;
    this.lastShot = now;
    if (this.ammo > 0) {
      this.ammo--;
      this.updateAmmoUI();
      const bullet = new Bullet();
      bullet.mesh.position.copy(this.airplane.mesh.position);
      bullet.mesh.position.x += 25;
      bullet.mesh.position.y -= 4;
      this.scene.add(bullet.mesh);
      this.bullets.push(bullet);
    }
  }
  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.tick();
      if (this.activeBoss) {
        const d = b.mesh.position.distanceTo(this.activeBoss.mesh.position);
        const r = 35 * this.activeBoss.mesh.scale.x + 10;
        if (d < r) {
          this.activeBoss.takeDamage();
          this.updateBossUI();
          this.particles.spawn(b.mesh.position, 0xff0055, 15);
          this.scene.remove(b.mesh);
          this.bullets.splice(i, 1);
          if (this.activeBoss.hp <= 0) this.killBoss();
          continue;
        }
      }
      let h = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        if (b.mesh.position.distanceTo(this.enemies[j].mesh.position) < 15) {
          this.particles.spawn(this.enemies[j].mesh.position, Colors.enemy, 10);
          this.scene.remove(this.enemies[j].mesh);
          this.enemies.splice(j, 1);
          this.scene.remove(b.mesh);
          this.bullets.splice(i, 1);
          h = true;
          break;
        }
      }
      if (h) continue;
      if (b.mesh.position.x > this.width / 2 + 100) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }
  }
  updateCoins() {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.mesh.position.x -= 2 * this.gameSpeed;
      c.tick();
      if (this.airplane.mesh.position.distanceTo(c.mesh.position) < 35) {
        this.addEnergy(10);
        this.particles.spawn(c.mesh.position, Colors.coin, 10);
        if (this.soundManager) this.soundManager.playCoin();
        this.scene.remove(c.mesh);
        this.coins.splice(i, 1);
        continue;
      }
      if (c.mesh.position.x < -200) {
        this.scene.remove(c.mesh);
        this.coins.splice(i, 1);
      }
    }
  }
  spawnEnemies() {
    if (this.activeBoss) return;
    const cfg = LEVEL_CONFIG[this.level] || LEVEL_CONFIG[6];
    if (Math.random() < cfg.enemyChance) {
      const e = new Enemy();
      e.mesh.position.set(
        this.width / 2 + 50,
        Math.random() * (175 - 25) + 25,
        0
      );
      const s = 1 + this.level * 0.1;
      e.mesh.scale.setScalar(s);
      this.scene.add(e.mesh);
      this.enemies.push(e);
    }
  }
  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.mesh.position.x -= 3 * this.gameSpeed;
      e.tick();
      if (this.airplane.mesh.position.distanceTo(e.mesh.position) < 25) {
        this.removeEnergy();
        this.airplane.hit();
        this.particles.spawn(e.mesh.position, Colors.enemy, 20);
        this.soundManager.playCrash();
        this.scene.remove(e.mesh);
        this.enemies.splice(i, 1);
        continue;
      }
      if (e.mesh.position.x < -200) {
        this.scene.remove(e.mesh);
        this.enemies.splice(i, 1);
      }
    }
  }
  spawnAmmoPacks() {
    if (Math.random() < 0.002) {
      const p = new AmmoPack();
      p.mesh.position.set(
        this.width / 2 + 50,
        Math.random() * (175 - 25) + 25,
        0
      );
      this.scene.add(p.mesh);
      this.ammoPacks.push(p);
    }
  }
  updateAmmoPacks() {
    for (let i = this.ammoPacks.length - 1; i >= 0; i--) {
      const p = this.ammoPacks[i];
      p.mesh.position.x -= 2 * this.gameSpeed;
      p.tick();
      if (this.airplane.mesh.position.distanceTo(p.mesh.position) < 25) {
        this.ammo += 10;
        this.updateAmmoUI();
        this.particles.spawn(p.mesh.position, 0xffff00, 10);
        this.scene.remove(p.mesh);
        this.ammoPacks.splice(i, 1);
        continue;
      }
      if (p.mesh.position.x < -200) {
        this.scene.remove(p.mesh);
        this.ammoPacks.splice(i, 1);
      }
    }
  }
  addEnergy(amount) {
    this.energy = Math.min(this.energy + amount, 100);
    this.updateUI();
  }
  removeEnergy(amount = 15) {
    this.energy -= amount;
    this.energy = Math.max(0, this.energy);
    const ui = document.querySelector(".game-ui");
    if (ui) {
      ui.style.transform = "translate(5px, 5px)";
      setTimeout(() => (ui.style.transform = "translate(0,0)"), 100);
    }
    this.updateUI();
  }
  updateEnergyLoop() {
    if (this.status === "gameover") return;
    const drain = this.status === "boss_fight" ? 0.01 : 0.05 * this.gameSpeed;
    this.energy -= drain;
    if (this.energy <= 0) {
      this.energy = 0;
      this.gameOver();
    }
    this.updateUI();
  }
  updateUI() {
    const scoreEl = document.getElementById("score-value");
    const energyEl = document.getElementById("energy-fill");
    if (scoreEl) scoreEl.innerText = Math.floor(this.score);
    if (energyEl) energyEl.style.width = `${this.energy}%`;
  }
  updateAmmoUI() {
    const el = document.getElementById("ammo-value");
    if (el) el.innerText = this.ammo;
  }
  updateEnvironment() {
    this.elapsedTime += 0.01;
    this.airplane.tick(this.particles);
    this.coins.forEach((c) => {
      if (c.mesh.material)
        c.mesh.material.emissiveIntensity =
          0.8 + Math.sin(this.elapsedTime * 5) * 0.5;
    });
    if (this.background) this.background.tick(this.elapsedTime);
  }
  gameOver() {
    this.status = "gameover";
    const ui = document.getElementById("game-over-screen");
    const finalScore = document.getElementById("final-score");
    if (ui) ui.classList.remove("hidden");
    if (finalScore)
      finalScore.innerText = `Distance: ${Math.floor(this.score)}`;
    if (this.soundManager) this.soundManager.playCrash();
    const btn = document.getElementById("replay-btn");
    if (btn) btn.onclick = () => this.resetGame();
  }
  resetGame() {
    const ui = document.getElementById("game-over-screen");
    if (ui) ui.classList.add("hidden");
    document.getElementById("boss-hud").classList.add("hidden");
    this.status = "playing";
    this.energy = 100;
    this.score = 0;
    this.level = 1;
    this.ammo = 30;
    this.gameSpeed = this.baseSpeed;
    this.updateUI();
    this.updateLevelUI();
    this.updateAmmoUI();
    this.airplane.mesh.position.set(0, 100, 0);
    this.airplane.mesh.rotation.set(0, 0, 0);
    if (this.activeBoss) {
      this.scene.remove(this.activeBoss.mesh);
      this.activeBoss = null;
    }
    this.enemies.forEach((e) => this.scene.remove(e.mesh));
    this.coins.forEach((c) => this.scene.remove(c.mesh));
    this.ammoPacks.forEach((a) => this.scene.remove(a.mesh));
    this.bullets.forEach((b) => this.scene.remove(b.mesh));
    this.enemies = [];
    this.coins = [];
    this.ammoPacks = [];
    this.bullets = [];
  }
  handleMouseMove(event) {
    const tx = -1 + (event.clientX / this.width) * 2;
    const ty = 1 - (event.clientY / this.height) * 2;
    this.mousePos = { x: tx, y: ty };
  }
  handleWindowResize() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }
  updatePlane() {
    const targetY = normalize(this.mousePos.y, -0.75, 0.75, 25, 175);
    const targetX = normalize(this.mousePos.x, -0.75, 0.75, -100, 100);
    this.airplane.mesh.position.y +=
      (targetY - this.airplane.mesh.position.y) * 0.1;
    this.airplane.mesh.position.x +=
      (targetX - this.airplane.mesh.position.x) * 0.1;
    this.airplane.mesh.rotation.z =
      (targetY - this.airplane.mesh.position.y) * 0.0128;
    this.airplane.mesh.rotation.x =
      (this.airplane.mesh.position.y - targetY) * 0.0064;
    this.airplane.tick(this.particles);
  }

  updateLevelUI() {
    const levelEl = document.getElementById("level-value");
    const nextEl = document.getElementById("next-level-score");
    const distEl = document.getElementById("dist-value");
    const ringEl = document.getElementById("level-ring");

    if (levelEl) levelEl.innerText = this.level;
    if (distEl) distEl.innerText = Math.floor(this.score);

    const config = LEVEL_CONFIG[this.level] || LEVEL_CONFIG[6];
    const prevConfig = LEVEL_CONFIG[this.level - 1];
    let prevTarget = prevConfig ? prevConfig.target : 0;
    let nextTarget = config.target;

    const distanceLeft = Math.max(0, nextTarget - Math.floor(this.score));
    if (nextEl) nextEl.innerText = `Goal: ${distanceLeft}m`;

    const total = nextTarget - prevTarget;
    const current = this.score - prevTarget;
    let percent = (current / total) * 100;
    percent = Math.min(100, Math.max(0, percent));

    if (ringEl) {
      const circumference = 163;
      const offset = circumference - (percent / 100) * circumference;
      ringEl.style.strokeDashoffset = offset;
    }
  }
}

window.addEventListener("load", () => {
  new Game();
});
