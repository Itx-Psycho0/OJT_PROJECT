//Load a 3d model in THREE


/*Taking input of keys 
keys={} this dictionary will store the keys pressed and release values
Example: If W pressed then its value would be true , if released then it would be changed to false
*/

let keys = {};

window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);


//Movement Logic
const speed = 0.05;
let isWalking = false;

function updateCharacter(delta) {
    if (!character) return;

    const forward = new THREE.Vector3(); //forward tells the direction the character is facing.
    character.getWorldDirection(forward);

    isWalking = false;

    // W = forward
    if (keys["w"]) {
        character.position.add(forward.multiplyScalar(speed));
        isWalking = true;
    }

    // S = backward
    if (keys["s"]) {
        character.position.add(forward.multiplyScalar(-speed));
        isWalking = true;
    }

    // A = rotate left
    if (keys["a"]) {
        character.rotation.y += 0.05;
        isWalking = true;
    }

    // D = rotate right
    if (keys["d"]) {
        character.rotation.y -= 0.05;
        isWalking = true;
    }

    // Play or stop walk animation
    if (mixer && walkingAction) { //walking action is the animation in blender model
        if (isWalking) {
            walkingAction.play();
        } else {
            walkingAction.stop();
        }
    }
}
