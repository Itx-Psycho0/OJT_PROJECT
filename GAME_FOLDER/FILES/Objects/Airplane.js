import * as THREE from 'three';
import { Colors } from '../constants.js';
import { Pilot } from './Pilot.js';

export class Spaceship {
    constructor() {
        this.mesh = new THREE.Group();
        
        this.rotorL = null;
        this.rotorR = null;
        this.engineGlows = [];
        this.hullMesh = null; // Reference for flashing red
        this.pilot = null;
        
        // PHYSICS STATE
        this.shakeTimer = 0;
        
        this.init();
    }

    init() {
        // Materials
        const matHull = new THREE.MeshStandardMaterial({
            color: Colors.ship, 
            roughness: 0.4,
            metalness: 0.8,
            flatShading: true
        });

        const matDark = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.6,
            metalness: 0.5,
            flatShading: true
        });

        const matGlow = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2.0,
            toneMapped: false
        });

        // 1. Hull
        const geomHull = new THREE.BoxGeometry(35, 12, 12);
        this.hullMesh = new THREE.Mesh(geomHull, matHull.clone()); // Clone to allow color flash
        this.hullMesh.castShadow = true;
        this.hullMesh.receiveShadow = true;
        this.mesh.add(this.hullMesh);

        // 2. Nose
        const geomNose = new THREE.BoxGeometry(10, 6, 8);
        const nose = new THREE.Mesh(geomNose, matDark);
        nose.position.set(20, 0, 0); 
        nose.castShadow = true;
        this.mesh.add(nose);

        // 3. Wings
        const geomWing = new THREE.BoxGeometry(10, 4, 60);
        const wings = new THREE.Mesh(geomWing, matHull);
        wings.position.set(-5, 4, 0); 
        wings.castShadow = true;
        this.mesh.add(wings);

        // 4. Rotors
        const createRotorAssembly = (zPos) => {
            const assembly = new THREE.Group();
            assembly.position.set(-5, 6, zPos);

            const geomPod = new THREE.CylinderGeometry(6, 4, 10, 8);
            const pod = new THREE.Mesh(geomPod, matDark);
            pod.castShadow = true;
            assembly.add(pod);

            const spinner = new THREE.Group();
            spinner.position.y = 6;

            const geomBlade = new THREE.BoxGeometry(36, 0.5, 4);
            const blade1 = new THREE.Mesh(geomBlade, matHull);
            const blade2 = blade1.clone();
            blade2.rotation.y = Math.PI / 2;

            spinner.add(blade1);
            spinner.add(blade2);

            const geomTip = new THREE.BoxGeometry(2, 1, 2);
            const tips = [16, -16];
            tips.forEach(x => {
                const t1 = new THREE.Mesh(geomTip, matGlow); t1.position.x = x; spinner.add(t1);
                const t2 = new THREE.Mesh(geomTip, matGlow); t2.position.z = x; spinner.add(t2);
            });

            assembly.add(spinner);
            return { assembly, spinner };
        };

        const leftRotor = createRotorAssembly(28);
        this.mesh.add(leftRotor.assembly);
        this.rotorL = leftRotor.spinner;

        const rightRotor = createRotorAssembly(-28);
        this.mesh.add(rightRotor.assembly);
        this.rotorR = rightRotor.spinner;

        // 5. Rear Engines
        const geomThrustBlock = new THREE.BoxGeometry(8, 8, 8);
        const thrustL = new THREE.Mesh(geomThrustBlock, matDark);
        thrustL.position.set(-18, 0, 8);
        this.mesh.add(thrustL);

        const thrustR = new THREE.Mesh(geomThrustBlock, matDark);
        thrustR.position.set(-18, 0, -8);
        this.mesh.add(thrustR);

        const geomPlate = new THREE.PlaneGeometry(8, 8);
        geomPlate.rotateY(-Math.PI / 2);

        const glowL = new THREE.Mesh(geomPlate, matGlow.clone());
        glowL.position.set(-22.5, 0, 8);
        this.mesh.add(glowL);
        this.engineGlows.push(glowL);

        const glowR = new THREE.Mesh(geomPlate, matGlow.clone());
        glowR.position.set(-22.5, 0, -8);
        this.mesh.add(glowR);
        this.engineGlows.push(glowR);

        // 6. Cockpit & Pilot
        const geomCockpitBase = new THREE.BoxGeometry(12, 8, 10);
        const cockpitBase = new THREE.Mesh(geomCockpitBase, matHull);
        cockpitBase.position.set(10, 5, 0);
        this.mesh.add(cockpitBase);

        const geomGlass = new THREE.BoxGeometry(10, 6, 8);
        const matGlass = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.0,
            transmission: 0.7,
            transparent: true,
            opacity: 0.5
        });
        const glass = new THREE.Mesh(geomGlass, matGlass);
        glass.position.set(10, 8, 0);
        this.mesh.add(glass);

        this.pilot = new Pilot();
        this.pilot.mesh.scale.set(0.25, 0.25, 0.25);
        this.pilot.mesh.position.set(10, 7, 0);
        this.pilot.mesh.rotation.y = -Math.PI / 2;
        this.mesh.add(this.pilot.mesh);

        // 7. Railgun
        const geomGun = new THREE.BoxGeometry(18, 3, 3);
        const gun = new THREE.Mesh(geomGun, matDark);
        gun.position.set(15, -5, 0);
        this.mesh.add(gun);

        const geomMuzzle = new THREE.BoxGeometry(2, 4, 4);
        const matRed = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 2 });
        const muzzle = new THREE.Mesh(geomMuzzle, matRed);
        muzzle.position.set(24, -5, 0);
        this.mesh.add(muzzle);
    }

    // --- STRONG COLLISION REACTION ---
    hit() {
        this.shakeTimer = 20; // Duration of shake
        // Flash Hull Red
        this.hullMesh.material.emissive.setHex(0xff0000);
        this.hullMesh.material.emissiveIntensity = 2.0;
    }

    tick(particleManager) {
        // 1. Standard Animation
        if(this.rotorL) this.rotorL.rotation.y += 0.4;
        if(this.rotorR) this.rotorR.rotation.y -= 0.4;

        const flicker = 1.5 + Math.random() * 0.5; 
        this.engineGlows.forEach(glow => {
            glow.material.emissiveIntensity = flicker;
            glow.scale.setScalar(0.9 + Math.random() * 0.1);
        });

        // 2. Handle Shake & Bounce
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
            
            // --- CHANGE: Stronger Vibration (0.1 -> 0.8) ---
            this.mesh.rotation.z = (Math.random() - 0.5) * 0.8; 
            this.mesh.rotation.x = (Math.random() - 0.5) * 0.8; 
            
            // --- CHANGE: Stronger Pushback (1.5 -> 3.0) ---
            this.mesh.position.x -= 3.0; 

            // Fade out red flash
            if(this.hullMesh.material.emissiveIntensity > 0) {
                this.hullMesh.material.emissiveIntensity -= 0.1;
            }
        } else {
            // Reset to stable state
            this.mesh.rotation.z = 0; 
            this.mesh.rotation.x = 0;
            // Ensure emissive is off
            this.hullMesh.material.emissive.setHex(0x000000);
            this.hullMesh.material.emissiveIntensity = 0;
        }

        // 3. Particles
        if (particleManager) {
            const posL = new THREE.Vector3(); this.engineGlows[0].getWorldPosition(posL);
            particleManager.spawnExhaust(posL, 0x00ffff, 2.0);
            const posR = new THREE.Vector3(); this.engineGlows[1].getWorldPosition(posR);
            particleManager.spawnExhaust(posR, 0x00ffff, 2.0);
        }
    }
}