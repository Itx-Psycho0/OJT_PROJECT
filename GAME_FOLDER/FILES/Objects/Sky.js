import * as THREE from 'three';
import { Colors } from '../constants.js';

class Asteroid {
    constructor() {
        this.mesh = new THREE.Group();
        const geom = new THREE.DodecahedronGeometry(20, 1);
        
        // High roughness prevents them from looking like wet plastic during the day
        const mat = new THREE.MeshStandardMaterial({ 
            color: Colors.asteroid,
            roughness: 0.8,  // Maximum roughness for rock look
            metalness: 0.4,  // No metal shine
            flatShading: true
        });

        const nBlocs = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < nBlocs; i++) {
            const m = new THREE.Mesh(geom, mat);
            m.position.set(i * 10, Math.random() * 5, Math.random() * 5);
            m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            const s = 0.5 + Math.random() * 0.8;
            m.scale.set(s, s, s);
            m.castShadow = true;
            m.receiveShadow = true;
            this.mesh.add(m);
        }
    }
}

export class Sky {
    constructor() {
        this.mesh = new THREE.Group();
        this.nAsteroids = 25;
        this.init();
    }

    init() {
        const stepAngle = Math.PI * 2 / this.nAsteroids;
        for (let i = 0; i < this.nAsteroids; i++) {
            const c = new Asteroid();
            const a = stepAngle * i;
            const h = 750 + Math.random() * 200;
            c.mesh.position.set(Math.cos(a) * h, Math.sin(a) * h, -400 - Math.random() * 400);
            c.mesh.rotation.z = a + Math.PI / 2;
            const s = 1 + Math.random() * 2;
            c.mesh.scale.set(s, s, s);
            this.mesh.add(c.mesh);
        }
    }

    tick() {
        this.mesh.rotation.z += 0.003;
    }
}