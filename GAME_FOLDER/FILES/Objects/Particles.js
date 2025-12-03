import * as THREE from 'three';

export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    // Standard Explosion (Coins/Enemies)
    spawn(pos, color, count = 15) {
        const geom = new THREE.TetrahedronGeometry(3, 0); 
        const mat = new THREE.MeshBasicMaterial({ color: color }); // Basic is cheaper/brighter

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.copy(pos);
            mesh.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5
                ),
                life: 1.0,
                decay: 0.03
            };
            this.scene.add(mesh);
            this.particles.push(mesh);
        }
    }

    // NEW: Engine Exhaust (Continuous Stream)
    spawnExhaust(pos, color, scale = 1) {
        // Simple Cube or Tetrahedron for exhaust
        const geom = new THREE.BoxGeometry(1, 1, 1); 
        const mat = new THREE.MeshBasicMaterial({ color: color });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(pos);
        
        // Add some randomness to spawn position so it's not a straight line
        mesh.position.x += (Math.random() - 0.5) * 2;
        mesh.position.y += (Math.random() - 0.5) * 2;

        mesh.scale.setScalar(scale);

        mesh.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5, // Slight spread X
                (Math.random() - 0.5) * 0.5, // Slight spread Y
                5 + Math.random() * 2        // Fast movement Backwards (Z)
            ),
            life: 1.0,
            decay: 0.08 // Fade fast
        };
        
        this.scene.add(mesh);
        this.particles.push(mesh);
    }

    tick() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Move
            p.position.add(p.userData.velocity);
            
            // Rotate
            p.rotation.x += 0.2;
            p.rotation.z += 0.2;
            
            // Shrink
            p.userData.life -= p.userData.decay;
            p.scale.setScalar(p.userData.life * (p.userData.scale || 1)); // Maintain relative scale

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
                // Clean up memory for heavy load
                if(p.geometry) p.geometry.dispose();
            }
        }
    }
}