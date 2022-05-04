import {
    loadCharacter, loadControls, loadLights, loadObjects, loadPictures, loadWorld, loadaudio, addRain
} from "./script.js"

function init() {
    loadWorld();
    loadLights();
    loadControls();
    loadObjects();
    loadCharacter();
    addRain();
    loadaudio();
    loadPictures();
}

init();

