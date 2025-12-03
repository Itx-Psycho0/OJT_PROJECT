import * as THREE from 'three';
import { Colors, Textures } from '../constants.js';

export class Background {
    constructor(scene) {
        this.scene = scene;
        this.stars = null;
        this.planet1 = null;
        this.planet2 = null;
        this.loader = new THREE.TextureLoader();
        this.init();
    }

    init() {
        // 1. BACKGROUND
        const bgTexture = this.loader.load(Textures.background);
        const bgGeom = new THREE.SphereGeometry(900, 32, 32);
        const bgMat = new THREE.MeshBasicMaterial({
            map: bgTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6 
        });
        const skyDome = new THREE.Mesh(bgGeom, bgMat);
        this.scene.add(skyDome);

        // 2. TWINKLING STARS (Shader)
        const starCount = 3000;
        const starGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const shifts = new Float32Array(starCount);

        for(let i=0; i<starCount; i++) {
            positions[i*3] = (Math.random() - 0.5) * 2000; 
            positions[i*3+1] = (Math.random() - 0.5) * 2000; 
            positions[i*3+2] = -600 - Math.random() * 1000; 
            sizes[i] = Math.random() * 4; 
            shifts[i] = Math.random() * Math.PI; 
        }

        starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        starGeom.setAttribute('shift', new THREE.BufferAttribute(shifts, 1));

        const starMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xffffff) }
            },
            vertexShader: `
                attribute float size;
                attribute float shift;
                uniform float time;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_PointSize = size * ( 300.0 / -mvPosition.z );
                    gl_Position = projectionMatrix * mvPosition;
                    vAlpha = 0.5 + 0.5 * sin(time * 2.0 + shift); 
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    gl_FragColor = vec4( color, vAlpha );
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(starGeom, starMat);
        this.scene.add(this.stars);

        // --- GLOW FIX FOR PLANETS ---

        // 3. PLANET 1
        const p1Geom = new THREE.SphereGeometry(80, 64, 64);
        const p1Tex = this.loader.load(Textures.planet1);
        const p1Mat = new THREE.MeshStandardMaterial({ 
            map: p1Tex,
            
            // Glow Settings
            emissive: 0xffffff,      // White base allows texture colors to show
            emissiveMap: p1Tex,      // The TEXTURE itself glows
            emissiveIntensity: 0.8,  // High intensity
            
            roughness: 0.5,
            metalness: 0.1
        });
        this.planet1 = new THREE.Mesh(p1Geom, p1Mat);
        this.planet1.position.set(-300, 200, -800);
        this.scene.add(this.planet1);

        // 4. PLANET 2
        const p2Geom = new THREE.SphereGeometry(40, 64, 64);
        const p2Tex = this.loader.load(Textures.planet2);
        const p2Mat = new THREE.MeshStandardMaterial({ 
            map: p2Tex,
            
            // Glow Settings
            emissive: 0xffffff,
            emissiveMap: p2Tex,
            emissiveIntensity: 0.6,
            
            roughness: 0.6
        });
        this.planet2 = new THREE.Mesh(p2Geom, p2Mat);
        this.planet2.position.set(300, 100, -900);
        this.scene.add(this.planet2);
    }

    tick(elapsedTime) {
        if(this.stars) this.stars.material.uniforms.time.value = elapsedTime;
        if(this.planet1) this.planet1.rotation.y += 0.001;
        if(this.planet2) this.planet2.rotation.y -= 0.002;
    }
}