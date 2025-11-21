import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 1. SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color('#87ceeb');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Updated Camera Position: Moved slightly to the side so we can see the X-axis movement better
camera.position.set(0, 3, 8); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

// 2. LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// 3. GRID HELPER
// This helps you see the floor moving so you know you are running linearly
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// 4. LOADING THE MODEL
const loader = new GLTFLoader();
let mixer; 
let runAction; 
let characterModel; // We need this variable globally to move the character in the loop

loader.load('/Run_malerig.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
        if (child.isMesh) child.castShadow = true;
    });

    // CHANGE 1: ROTATION
    // Rotate 90 degrees (Pi/2) so it faces the Positive X Axis
    model.rotation.y = Math.PI / 2; 

    scene.add(model);
    characterModel = model; // Save model to global variable

    // Animation Setup
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    const clip = clips[0]; 

    if (clip) {
        runAction = mixer.clipAction(clip);
    }
}, undefined, (error) => {
    console.error('An error occurred loading the model:', error);
});

// 5. INPUT LOGIC
const keys = {
    w: false,
    shift: false
};

window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyW') keys.w = true;
    if (event.key === 'Shift') keys.shift = true;
    checkInput();
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW') keys.w = false;
    if (event.key === 'Shift') keys.shift = false;
    checkInput();
});

function checkInput() {
    if (runAction) {
        if (keys.w && keys.shift) {
            // Play animation if not already playing
            if (!runAction.isRunning()) {
                runAction.reset().play();
                runAction.fadeIn(0.2); 
            }
        } else {
            runAction.fadeOut(0.2);
        }
    }
}

// 6. ANIMATION LOOP (PHYSICS MOVEMENT)
const clock = new THREE.Clock(); 
const runSpeed = 5; // Units per second

function animate() {
    requestAnimationFrame(animate); 

    const delta = clock.getDelta(); 

    if (mixer) {
        mixer.update(delta);
    }

    // CHANGE 2: LINEAR MOVEMENT
    // If the specific keys are pressed AND the model is loaded
    if (characterModel && keys.w && keys.shift) {
        // Move the actual model object along the X axis
        characterModel.position.x += runSpeed * delta;
        
        // Make the camera follow the player
        camera.position.x += runSpeed * delta;
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();