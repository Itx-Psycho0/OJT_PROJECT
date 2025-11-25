import * as THREE from "three";

export class Sea {
    constructor() {
        // 1. GEOMETRY
        // We reduced radius from 600 -> 300
        // We reduced length (width of sea) from 800 -> 400
        const radius = 100; 
        const length = 200; 
        
        const geom = new THREE.CylinderGeometry(radius, radius, length, 40, 10);
        geom.rotateX(-Math.PI / 2);

        // 2. MATERIAL
        const mat = new THREE.MeshPhongMaterial({
            color: 0x68c3c0,
            transparent: true,
            opacity: 0.6,
            flatShading: true,
        });

        // 3. MESH
        this.mesh = new THREE.Mesh(geom, mat);

        // 4. POSITION (CRITICAL FIX)
        // If the radius is 300, we must move it down by -300
        // so the top edge sits exactly at 0 (where the ship is).
        this.mesh.position.y = -radius; // -100
        
        this.mesh.receiveShadow = true;
    }
}