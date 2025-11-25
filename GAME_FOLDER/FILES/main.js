import * as THREE from "three";
import { SpaceShip } from "./Objects/SpaceShip.js";

// 1. Create the Scene, Camera, and Renderer
const scene = new THREE.Scene();
// FOV: 75, Aspect: Window Width/Height, Near: 0.1, Far: 1000
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// IMPORTANT: We must move the camera back! 
// By default, the camera and objects spawn at (0,0,0). 
// If the camera is inside the object, we won't see it.
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);// Make it full screen
const world = document.getElementById("world");
world.appendChild(renderer.domElement);

// Create the SpaceShip and add it to the scene
const myShip = new SpaceShip();
scene.add(myShip);

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
// 5. The Initial Render (Taking the photo)
function animate() {
    // 1. Schedule the NEXT frame immediately
    requestAnimationFrame(animate);

    // 2. Update Logic (Move things)
    ship.rotation.x += 0.01;
    ship.rotation.y += 0.01;

    // 3. Render (Take the picture)
    renderer.render(scene, camera);
}

// 4. Kickstart the loop
animate();