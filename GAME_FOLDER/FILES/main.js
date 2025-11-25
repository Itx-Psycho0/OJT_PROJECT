import * as THREE from "three";

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

// 2. Create the Geometry (Cube)
const geometry = new THREE.BoxGeometry(); // Default is 1x1x1 cube
// 3. Create the Material (Basic color)
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Green color
// 4. Create the Mesh (Geometry + Material)
const cube = new THREE.Mesh(geometry, material);
// Add the cube to the scene
scene.add(cube);

// 5. The Initial Render (Taking the photo)
renderer.render(scene, camera);