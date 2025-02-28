import {
    dance,
    stopdance
} from "./script.js";

export class CharacterControls {

    // temporary data
    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuarternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();

    //constants 
    fadeDuration = 0.5;
    runVelocity = 3;
    walkVelocity = 1.5;

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
    }

    update(delta, keysPressed) {
        let play = "";
        if ((keysPressed["w"] && keysPressed["shift"]) ||
            (keysPressed["a"] && keysPressed["shift"]) ||
            (keysPressed["s"] && keysPressed["shift"]) ||
            (keysPressed["d"] && keysPressed["shift"])) {
            play = "run";
        } else
        if (keysPressed["w"] || keysPressed["a"] || keysPressed["s"] || keysPressed["d"]) {
            play = "walk";
        } else
        if (keysPressed[" "]) {
            play = "dance"
            dance(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
        } else
        if (keysPressed["e"]) {
            play = "extra1"
        } else
        if (keysPressed["q"]) {
            play = "extra2"
        } else {
            play = "idle1";
            stopdance();
        }



        if (this.currentAction != play) {
            const toPlay = this.animationsMap.get(play);
            const current = this.animationsMap.get(this.currentAction);
            if (current) {
                toPlay.time = 0.0;
                toPlay.enabled = true;
                toPlay.setEffectiveTimeScale(1.0);
                toPlay.setEffectiveWeight(1.0);
                toPlay.crossFadeFrom(current, 0.5, true);
                toPlay.play();
            }
            this.currentAction = play;
            // console.log(this.currentAction);
        }

        this.mixer.update(delta);

        if (this.currentAction == "run" || this.currentAction == "walk") {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2((this.camera.position.x - this.model.position.x), (this.camera.position.z - this.model.position.z));
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed);
            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset + Math.PI);
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.1);
            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);

            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

            // run/walk velocity
            var velocity = this.currentAction == 'run' ? this.runVelocity : this.walkVelocity;

            // move model & camera
            var moveX = this.walkDirection.x * velocity * delta;
            var moveZ = this.walkDirection.z * velocity * delta;

            //boundaries
            if (this.model.position.z >= 48) {
                this.model.position.z = 47.999;
            }
            if (this.model.position.z <= -3.5) {
                this.model.position.z = -3.499;
            }
            if (this.model.position.x >= 3.2) {
                this.model.position.x = 3.199;
            }
            if (this.model.position.x <= -9) {
                this.model.position.x = -8.999;
            }
            this.model.position.z += moveZ;
            this.model.position.x += moveX;
            this.updateCameraTarget(moveX, moveZ);
        }
    }

    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.camera.position.x += moveX;
        this.camera.position.z += moveZ;
        // update camera target
        this.cameraTarget.x = this.model.position.x;
        this.cameraTarget.y = this.model.position.y + 1.7;
        this.cameraTarget.z = this.model.position.z;
        this.orbitControl.target = this.cameraTarget;
    }

    getCharacterPosition() {
        return this.cameraTarget;
    }

    directionOffset(keysPressed) {
        var directionOffset = 0; // w
        if (keysPressed["w"]) {
            if (keysPressed["a"]) {
                directionOffset = Math.PI / 4; // w+a
            } else if (keysPressed["d"]) {
                directionOffset = -Math.PI / 4; // w+d
            }
        } else if (keysPressed["s"]) {
            if (keysPressed["a"]) {
                directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
            } else if (keysPressed["d"]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
            } else {
                directionOffset = Math.PI; // s
            }
        } else if (keysPressed["a"]) {
            directionOffset = Math.PI / 2; // a
        } else if (keysPressed["d"]) {
            directionOffset = -Math.PI / 2; // d
        }
        return directionOffset;
    }
}