//import THREE from '/src/threejs/three.min.js';
// import { A, D, DIRECTIONS, S, W } from './utils'

export class CharacterControls {

    // temporary data
    // walkDirection = new THREE.Vector3();
    // rotateAngle = new THREE.Vector3(0, 1, 0);
    // rotateQuarternion = new THREE.Quaternion();
    // cameraTarget = new THREE.Vector3();

    //constants 
    fadeDuration = 0.5;
    runVelocity = 5;
    walkVelocity = 2;

    constructor(model, mixer, animationsMap, orbitControl, camera, currentAction) {
        this.model = model;
        this.mixer = mixer;
        this.animationsMap = animationsMap;
        this.currentAction = currentAction;
        this.animationsMap.forEach(function (value, key) {
            if (key == currentAction) {
                value.play();
            }
        });
        this.orbitControl = orbitControl;
        this.camera = camera;

    }

    switchRunToggle() {
        this.toggleRun = !this.toggleRun;
        console.log("switch");
    }

    update(delta, keysPressed) {
        let play = "";
        if ((keysPressed["w"] && keysPressed["shift"]) || 
        (keysPressed["a"] && this.toggleRun) || 
        (keysPressed["s"] && this.toggleRun) || 
        (keysPressed["d"] && this.toggleRun)) {
            play = "run";
        } else 
        if (keysPressed["w"] || keysPressed["a"] || keysPressed["s"] || keysPressed["d"]) {
            play = "walk1";
        } else {
            play = "idlebreath";
        }



        if (this.currentAction != play) {
            
            const toPlay = this.animationsMap.get(play);
            const current = this.animationsMap.get(this.currentAction);

            // current.fadeOut(this.fadeDuration);
            // toPlay.reset().fadeIn(this.fadeDuration).play();

            if(current){
                toPlay.time = 0.0;
                toPlay.enabled = true;
                toPlay.setEffectiveTimeScale(1.0);
                toPlay.setEffectiveWeight(1.0);
                toPlay.crossFadeFrom(current, 0.5, true);
                toPlay.play();
            }


            this.currentAction = play;
            
            console.log(this.currentAction);            
        }

        this.mixer.update(delta);
    }
}