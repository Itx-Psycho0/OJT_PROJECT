import * as THREE from 'three';

export class Bullet {
    constructor() {
        // Long thin capsule for a laser/bolt look
        const geom = new THREE.CapsuleGeometry(0.5, 4, 4, 8);
        geom.rotateZ(Math.PI / 2); // Point forward

        const mat = new THREE.MeshBasicMaterial({
            color: 0xff0055, // Hot Pink
        });

        this.mesh = new THREE.Mesh(geom, mat);
        this.speed = 8; // Very fast
    }

    tick() {
        this.mesh.position.x += this.speed; // Move forward (Right)
    }
}