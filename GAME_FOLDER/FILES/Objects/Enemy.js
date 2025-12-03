import * as THREE from "three";

export class Enemy {
    constructor() {
        // TetrahedronGeometry(radius, detail)
        // detail=0 gives it a sharp, pyramid look.
        const geom = new THREE.TetrahedronGeometry(8, 2);
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf25346, // Red
            flatShading: true,
        });

        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.castShadow = true;
    }
    
    // We add a specific function to handle its movement
    tick() {
        // Rotate slightly to look dynamic
        this.mesh.rotation.x += 0.02;
        this.mesh.rotation.y += 0.02;
        
        // Move to the Left
        this.mesh.position.x -= 2; 
    }
}