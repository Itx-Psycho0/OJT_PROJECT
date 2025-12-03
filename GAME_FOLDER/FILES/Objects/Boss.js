import * as THREE from 'three';
import { Colors, Textures } from '../constants.js';

export class Boss {
    constructor() {
        this.mesh = new THREE.Group();
        this.hp = 20;
        this.maxHp = 20;
        this.init();
    }

    init() {
        // Massive Jagged Rock
        const geom = new THREE.DodecahedronGeometry(35, 0); // Low poly look
        
        const loader = new THREE.TextureLoader();
        const texture = loader.load(Textures.asteroid);

        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.2,
            flatShading: true,
            emissive: 0xff0000,
            emissiveIntensity: 0.2 // Low red glow by default
        });

        this.body = new THREE.Mesh(geom, mat);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.mesh.add(this.body);
    }

    tick() {
        this.body.rotation.z += 0.01;
        this.body.rotation.y += 0.01;

        // Flash effect decay
        if (this.body.material.emissiveIntensity > 0.2) {
            this.body.material.emissiveIntensity -= 0.05;
        }
    }

    takeDamage() {
        this.hp--;
        // Flash Bright Red
        this.body.material.emissiveIntensity = 2.0;
        // Shake effect
        this.mesh.position.x += 2; 
    }
}