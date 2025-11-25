import * as THREE from "three";
import { SpaceShip } from "./Objects/SpaceShip.js";


let mousePos = { x: 0, y: 0 };


// 1. Create the Scene, Camera, and Renderer
const scene = new THREE.Scene();
// Add some fog for depth (matches the background color you might add later)
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
// FOV: 75, Aspect: Window Width/Height, Near: 0.1, Far: 1000
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// IMPORTANT: We must move the camera back! 
// By default, the camera and objects spawn at (0,0,0). 
// If the camera is inside the object, we won't see it.
camera.position.z = 10;
// --- FIX: LOOK AT THE WORLD ---
camera.lookAt(0, 0, 0); 
// -----------------------------

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);// Make it full screen
const world = document.getElementById("world");
world.appendChild(renderer.domElement);

// Create the SpaceShip and add it to the scene
const myShip = new SpaceShip();
scene.add(myShip);
myShip.rotation.y = -90 * (Math.PI / 180) + mousePos.x * 0.5;
// // 2. Create the Geometry (Cube)
// const test = new THREE.Group(); // Default is 1x1x1 cube
// const geometry = new THREE.BoxGeometry(1, 3, 1);
// // 3. Create the Material (Basic color)
// const material = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Green color
// // 4. Create the Mesh (Geometry + Material)
// const cube = new THREE.Mesh(geometry, material);
// // Add the cube to the scene
// test.add(cube);

// const wingGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.1);
// const wingMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
// leftWing.position.set(-1, 0, 0);
// test.add(leftWing);
// const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
// rightWing.position.set(1, 0, 0);
// test.add(rightWing);
// scene.add(test);

// use mouse move to rotate the ship
document.addEventListener('mousemove', (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
//how i set mouse position to rotate the ship
// BY using :-The Formula:
// Divide by Width: clientX / window.innerWidth -> gives you 0.0 to 1.0.
// Multiply by 2: -> gives you 0.0 to 2.0.
// Subtract 1: -> gives you -1.0 (Left) to +1.0 (Right).
// This is called Normalized Device Coordinates (NDC).






// 3. Add Lighting to the Scene
// Lighting (so we can see the 3D shapes properly)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// // Create the Sea
// const sea = new Sea();
// scene.add(sea.mesh);



// --- 5. HELPER FUNCTION (The Math) ---
// This maps a value from one range (like -1 to 1) to another (like -75 to 75)
// Helper Function: Normalization (The Translator)
// v: The value we have (e.g., Mouse X)
// vmin, vmax: The range it comes FROM (e.g., -1 to 1)
// tmin, tmax: The range we want it to go TO (e.g., -75 to 75)

function normalize(v, vmin, vmax, tmin, tmax) {
    // 1. Clamp: Ensure 'v' doesn't go outside the min/max limits
    const clampedValue = Math.max(Math.min(v, vmax), vmin);
    
    // 2. Percentage: Calculate how far 'v' is between vmin and vmax (0.0 to 1.0)
    // Example: If range is 0 to 100, and v is 50, percentage is 0.5
    const rangeOriginal = vmax - vmin;
    const percentage = (clampedValue - vmin) / rangeOriginal;
    
    // 3. Map: Apply that percentage to the new range
    const rangeTarget = tmax - tmin;
    const finalValue = tmin + (percentage * rangeTarget);
    
    return finalValue;
}



// 5. The Initial Render (Taking the photo)
function animate() {
    // 1. Schedule next frame
    requestAnimationFrame(animate);

    // 2. Calculate Targets (Where we WANT to be)
    // -75 to 75 is the range of the world
    let targetX = normalize(mousePos.x, -0.75, 0.75, -3, 3);
    let targetY = normalize(mousePos.y, -0.75, 0.75, -5, 5);

    // 3. Move the Ship (Lerp)
    // We check if .mesh exists, otherwise we use myShip directly
    let shipObj = myShip.mesh || myShip; 

    // Move Position
    // Current = Current + (Gap * Speed)
    shipObj.position.y += (targetY - shipObj.position.y) * 0.1;
    shipObj.position.x += (targetX - shipObj.position.x) * 0.1;

    // 4. Rotate the Ship (Physics Feel)
    // PITCH: moving Up/Down (Y) affects X rotation
    // We calculate the gap (targetY - currentY) to know how "hard" we are pulling up
    shipObj.rotation.x = (shipObj.position.y - targetY) * 0.0064;

    // ROLL: moving Left/Right (X) affects Z rotation
    // We calculate the gap (targetX - currentX) to know how hard to bank
    shipObj.rotation.z = (targetY - shipObj.position.y) * 0.0128; // <--- WAIT! This is wrong in your code too.
    
    // CORRECT ROLL LOGIC:
    // If I move Right (Positive X), I should roll Right (Negative Z usually)
    shipObj.rotation.z = (shipObj.position.x - targetX) * 0.0064;

    // Rotate the sea to create the illusion of speed
    // sea.mesh.rotation.z += 0.005;


    // 5. Render
    renderer.render(scene, camera);
}

// 4. Kickstart the loop
animate();