import * as THREE from 'three';

const canvas  = document.getElementById('experience-canvas')
const sizes = {
    width : window.innerWidth,
    height : window.innerHeight
}
// for viewing any thing we need three thing scene,camera,and render
//scene
const scene = new THREE.Scene(); //here i have stored blank scene 

//camera
const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.1,100);//here i stored camera with FOV,aspect ratio and near,far values.

//renderer
const renderer = new THREE.WebGLRenderer({canvas:canvas});// here i stored renderer component

renderer.setSize(sizes.height,sizes.width);// here i define the size of render output , in set size is there a third attribute also called false it will use for render the our app on half resolution => setSize(window.innerWidth/2, window.innerHeight/2, false)

renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));//it define the pixel value how the computer take resolution in one pixel in every computer if any device have capability but it takes only according to this code

// document.body.appendChild(renderer.domElement)// this is a canvas element that will be add in body of html

//so all three component set but where the object we see and how

//add cube
const geometry = new THREE.BoxGeometry(1,1,1);// to create cube used boxGeometry method that contains vertices and faces like blender

//add material
const material = new THREE.MeshBasicMaterial({color:0xffa500})// so its add material on obj that we created there are many way to make material in three js but for now we used mesh basic material it takes object as property

//add both material and geometry on mesh(like a object) that define cube

//making line
const material_line = new THREE.LineBasicMaterial({color:0xff0000});//stored line material

const points = [];
points.push(new THREE.Vector3(-1,0,0));
points.push(new THREE.Vector3(0,1,0));
points.push(new THREE.Vector3(1,0,0));

const geometry_line = new THREE.BufferGeometry().setFromPoints( points );//geometry 
const line = new THREE.Line( geometry_line, material_line );//combine both as we do in prevoius


const cube = new THREE.Mesh(geometry,material);// it takes geometry that deifne the mesh and material for color and texturing the mesh

//add cube and line in scene
scene.add(cube,line)

//camera positioning
camera.position.z= 5;

//for resizing or responsive sizing we use event listener resize on window

window.addEventListener('resize',handleResize)// its event listener use on window obj to resize the canvas and changes the value according to the resizing in the handlerfunction

function handleResize(){
    //define size of canvas and update prjection of camera according to window size .
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
}






//cube created and all components called but wouldn't we able see anything . solution
//because we doesnt rendering anything

//for render we use render or animation loop
function animate(){
    cube.rotation.x += 0.01 ////rendering done now lets look on animate and modifing the obj
    // cube.position.x +=0.002
    // cube.position.y +=0.003
    // camera.position.z +=0.01
    renderer.render(scene,camera);//its render the cube in our web page , its take scene and camera as argument 
}
renderer.setAnimationLoop(animate);//This will create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second).




