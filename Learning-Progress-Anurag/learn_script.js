import * as THREE from 'three';


// for viewing any thing we need three thing scene,camera,and render
//scene
const scene = new THREE.Scene(); //here i have stored blank scene 

//camera
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,100);//here i stored camera with FOV,aspect ratio and near,far values.

//renderer
const renderer = new THREE.WebGLRenderer();// here i stored renderer component

renderer.setSize(window.innerWidth,window.innerWidth);// here i define the size of render output , in set size is there a third attribute also called false it will use for render the our app on half resolution => setSize(window.innerWidth/2, window.innerHeight/2, false)

document.body.appendChild(renderer.domElement)// this is a canvas element that will be add in body of html

//so all three component set but where the object we see and how

//add cube
const geometry = new THREE.BoxGeometry(1,1,1);// to create cube used boxGeometry method that contains vertices and faces like blender

//add material
const material = new THREE.MeshBasicMaterial({color:0xffa500})// so its add material on obj that we created there are many way to make material in three js but for now we used mesh basic material it takes object as property

//add both material and geometry on mesh(like a object) that define cube

const cube = new THREE.Mesh(geometry,material);// it takes geometry that deifne the mesh and material for color and texturing the mesh

//add cube in scene
scene.add(cube)

//camera positioning
camera.position.z= 0;

//cube created and all components called but wouldn't we able see anything . solution
//because we dont rendering anything

//for render we use render or animation loop
function animate(){
    cube.rotation.x += 0.01 ////rendering done now lets look on animate and modifing the obj
    // cube.position.x +=0.002
    // cube.position.y +=0.003
    // camera.position.z +=0.01
    renderer.render(scene,camera);//its render the cube in our web page , its take scene and camera as argument 
}
renderer.setAnimationLoop(animate);//This will create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second).




