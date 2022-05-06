import {
    CharacterControls
} from "./characterControls.js";
import {
    EffectComposer
} from 'https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/postprocessing/EffectComposer.js';
import {
    RenderPass
} from 'https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/postprocessing/RenderPass.js';
import {
    UnrealBloomPass
} from 'https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/postprocessing/UnrealBloomPass.js';

let container = document.querySelector(".scene");
let camera, renderer, composer, scene, clock, orbitControls, characterControls, keysPressed, loadingManager, pBar, flash, rainsound, thundersound, trainsound, announcment1, announcment2, announcment3, announcment4, soundarray = [], danceSound, passbytrain, billboardmixer, billboardmixer2, billboardmixer3, temporarysound, rain, rain1, raindropsunder, raindropsupper, raingeometry, raingeometry1, disco;

//CONTROLLS

//world
let worldwidth = 100,
    worldheight = 20,
    backColor = 0x060616,
    worldcenterx = -3,
    worldcenterz = 20,

    //light
    lightcolor = 0xbfcad8,
    hemisphereLightstrength = 0.2,

    //flash
    flashlightcolor = 0x062d89,
    flashlightintensity = 2000, //5-2000

    //rain and fog controlls
    raining = true,
    dropCount = 10000, //200 - 20000
    rainspeed = 0.2,
    dropsizemin = 0.05,
    dropsizemax = 0.2,
    fog = true,

    //starting volume sound
    tempsound = 0.1,

    //displacement 
    displacement = 0.15,
    displacestation = 1.1,

    characterx = -2,
    characterz = -1.5,

    //camera
    camerafov = 90,
    cameratargetheight = 1.7,
    camerafarlimit = 8,
    cameranearlimit = 1,
    camerafarlimitrender = 200,
    cameranearlimitrender = 0.1,

    //stationlength
    stationlength = 17.71,

    //debug
    debug = false;

export function loadObjects() {
    let loader = new THREE.GLTFLoader(loadingManager);
    loader.load("./src/3D/billboardPeter.glb", function (gltf) {
        let billboard = gltf.scene;
        let billboard2 = billboard.clone();
        let billboard3 = billboard.clone();

        billboardmixer = new THREE.AnimationMixer(billboard);
        billboardmixer2 = new THREE.AnimationMixer(billboard2);
        billboardmixer3 = new THREE.AnimationMixer(billboard3);

        billboard.position.set(-13, -2, 3);
        billboard2.position.set(-13, -2, 23);
        billboard3.position.set(-13, -2, 43);

        let anim = gltf.animations[0];
        let action = billboardmixer.clipAction(anim);
        let action2 = billboardmixer2.clipAction(anim);
        let action3 = billboardmixer3.clipAction(anim);

        scene.add(billboard, billboard2, billboard3);

        action.play();
        action2.play();
        action3.play();
    });
    loader.load("./src/3D/trainstation.glb", function (gltf) {
        let station = gltf.scene;
        station.traverse(function (node) {
            if (node.isMesh) {
                node.receiveShadow = true;
            }
        });
        let station2 = station.clone();
        let station3 = station.clone();
        let station4 = station.clone();
        let station5 = station.clone();
        station.position.set(-3, displacement, 5);
        station2.position.set(-3, displacement, 5 + stationlength);
        station3.position.set(-3, displacement, 5 + (stationlength * 2));
        station4.position.set(-3, displacement, 5 + (stationlength * 3));
        station5.position.set(-3, displacement, 5 - stationlength);
        scene.add(station, station2, station3, station4, station5);
    });
    loader.load("./src/3D/cocacola.glb", function (gltf) {
        let cocacola = gltf.scene;
        cocacola.position.set(-3, displacement + displacestation, 15);
        cocacola.rotateY(Math.PI);
        scene.add(cocacola);
    });
    loader.load("./src/3D/barrier.glb", function (gltf) {
        let barrier = gltf.scene;
        let barrier2 = barrier.clone();
        barrier.position.set(-3, displacement + displacestation, -4.4);
        barrier2.position.set(-3, displacement + displacestation, -4.4 + (stationlength * 3));
        scene.add(barrier, barrier2);
    });
    loader.load("./src/3D/descriptionAnton.glb", function (gltf) {
        let description = gltf.scene;
        description.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        description.position.set(characterx - 0.8, displacement + displacestation + 0.2, characterz + 0.4);
        description.rotateY(Math.PI);
        scene.add(description);
    });
    loader.load("./src/3D/deutscherBahnVerkehr.glb", function (gltf) {
        passbytrain = gltf.scene;
        passbytrain.position.set(-11.1, displacement, 301);
        passbytrain.rotateY(Math.PI / 2);
        scene.add(passbytrain);

        let standingtrain = passbytrain.clone();
        standingtrain.position.set(5, displacement, -3.5);
        standingtrain.rotateY(Math.PI);
        scene.add(standingtrain);
    });
}

export function loadaudio() {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    rainsound = new THREE.Audio(listener);
    thundersound = new THREE.Audio(listener);
    announcment1 = new THREE.Audio(listener);
    announcment2 = new THREE.Audio(listener);
    announcment3 = new THREE.Audio(listener);
    announcment4 = new THREE.Audio(listener);
    trainsound = new THREE.Audio(listener);
    danceSound = new THREE.Audio(listener);

    // load a sound and set it as the audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./src/audio/rain.wav', function (buffer) {
        rainsound.setBuffer(buffer);
        rainsound.setLoop(true);
        rainsound.setVolume(tempsound);
    });
    audioLoader.load('./src/audio/thunder1.wav', function (buffer) {
        thundersound.setBuffer(buffer);
        thundersound.setLoop(false);
        thundersound.setVolume(tempsound);
    });
    audioLoader.load('./src/audio/trainsound.mp3', function (buffer) {
        trainsound.setBuffer(buffer);
        trainsound.setLoop(false);
        trainsound.setVolume(0.1);
    });
    audioLoader.load('./src/audio/announcment1.mp3', function (buffer) {
        announcment1.setBuffer(buffer);
        announcment1.setLoop(false);
        announcment1.setVolume(tempsound);
    });
    audioLoader.load('./src/audio/announcment2.mp3', function (buffer) {
        announcment2.setBuffer(buffer);
        announcment2.setLoop(false);
        announcment2.setVolume(tempsound);
    });
    audioLoader.load('./src/audio/announcment3.mp3', function (buffer) {
        announcment3.setBuffer(buffer);
        announcment3.setLoop(false);
        announcment3.setVolume(tempsound);
    });
    audioLoader.load('./src/audio/announcment4.mp3', function (buffer) {
        announcment4.setBuffer(buffer);
        announcment4.setLoop(false);
        announcment4.setVolume(tempsound);
    });
    soundarray.push(announcment1, announcment2, announcment3, announcment4);
    audioLoader.load('./src/audio/music.mp3', function (buffer) {
        danceSound.setBuffer(buffer);
        danceSound.setLoop(true);
        danceSound.setVolume(tempsound);
    });

}

export function loadControls() {
    keysPressed = {};
    document.addEventListener("keydown", (e) => {
        switch (e.key.toLocaleLowerCase()) {
            case "w": //w
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("W").classList.add("active");
                break;
            case "a": //a
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("A").classList.add("active");
                break;
            case "s": //s
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("S").classList.add("active");
                break;
            case "d": //d
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("D").classList.add("active");
                break;
            case "q": //q
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("Q").classList.add("active");
                break;
            case "e": //e
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("E").classList.add("active");
                break;
            case " ": // SPACE
                (keysPressed)[e.key.toLocaleLowerCase()] = true;
                document.getElementById("space").classList.add("active");

                break;
            case "shift": // SHIFT
                if (characterControls) {
                    //characterControls.switchRunToggle(); 
                    (keysPressed)[e.key.toLocaleLowerCase()] = true;
                    document.getElementById("shift").classList.add("active");
                }
                break;
            default:
                console.log("irrelevant key");
                break;
        }
    }, false);
    document.addEventListener("keyup", (e) => {
        switch (e.key.toLocaleLowerCase()) {
            case "w": //w
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("W").classList.remove("active");
                break;
            case "a": //a
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("A").classList.remove("active");
                break;
            case "s": //s
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("S").classList.remove("active");
                break;
            case "d": //d
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("D").classList.remove("active");
                break;
            case "q": //q
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("Q").classList.remove("active");
                break;
            case "e": //e
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("E").classList.remove("active");
                break;
            case " ": // SPACE
                (keysPressed)[e.key.toLocaleLowerCase()] = false;
                document.getElementById("space").classList.remove("active");
                break;
            case "shift": // SHIFT
                if (characterControls) {
                    //characterControls.switchRunToggle();   
                    (keysPressed)[e.key.toLocaleLowerCase()] = false;
                    document.getElementById("shift").classList.remove("active");
                }
                break;
            default:
                console.log("irrelevant key");
                break;
        }
    }, false);

    //onclick buttons 
    //mousdown
    document.getElementById('W').addEventListener("mousedown", function () {
        (keysPressed)["w"] = true;
        document.getElementById("W").classList.add("active");
    });
    document.getElementById('A').addEventListener("mousedown", function () {
        (keysPressed)["a"] = true;
        document.getElementById("A").classList.add("active");
    });
    document.getElementById('S').addEventListener("mousedown", function () {
        (keysPressed)["s"] = true;
        document.getElementById("S").classList.add("active");
    });
    document.getElementById('D').addEventListener("mousedown", function () {
        (keysPressed)["d"] = true;
        document.getElementById("D").classList.add("active");
    });
    document.getElementById('shift').addEventListener("mousedown", function () {
        (keysPressed)["shift"] = true;
        document.getElementById("shift").classList.add("active");
    });
    document.getElementById('space').addEventListener("mousedown", function () {
        (keysPressed)[" "] = true;
        document.getElementById("space").classList.add("active");
    });
    document.getElementById('E').addEventListener("mousedown", function () {
        (keysPressed)["e"] = true;
        document.getElementById("E").classList.add("active");
    });
    document.getElementById('Q').addEventListener("mousedown", function () {
        (keysPressed)["q"] = true;
        document.getElementById("Q").classList.add("active");
    });
    //mouseup
    document.getElementById('W').addEventListener("mouseup", function () {
        (keysPressed)["w"] = false;
        document.getElementById("W").classList.remove("active");
    });
    document.getElementById('A').addEventListener("mouseup", function () {
        (keysPressed)["a"] = false;
        document.getElementById("A").classList.remove("active");
    });
    document.getElementById('S').addEventListener("mouseup", function () {
        (keysPressed)["s"] = false;
        document.getElementById("S").classList.remove("active");
    });
    document.getElementById('D').addEventListener("mouseup", function () {
        (keysPressed)["d"] = false;
        document.getElementById("D").classList.remove("active");
    });
    document.getElementById('shift').addEventListener("mouseup", function () {
        (keysPressed)["shift"] = false;
        document.getElementById("shift").classList.remove("active");
    });
    document.getElementById('space').addEventListener("mouseup", function () {
        (keysPressed)[" "] = false;
        document.getElementById("space").classList.remove("active");
    });
    document.getElementById('E').addEventListener("mouseup", function () {
        (keysPressed)["e"] = false;
        document.getElementById("E").classList.remove("active");
    });
    document.getElementById('Q').addEventListener("mouseup", function () {
        (keysPressed)["q"] = false;
        document.getElementById("Q").classList.remove("active");
    });
};

export function loadPictures() {
    //create a texture loader so we can load our image file
    var loader = new THREE.TextureLoader();

    //load an image file into a custom material
    var materialElle = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/bahnanzeigeElle.jpg')
    });

    var materialRgb = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/bahnanzeigeRgb.jpg')
    });

    //create a plane geometry for the image with a width of 10
    //and a height that preserves the image's aspect ratio
    var geometry = new THREE.PlaneGeometry(1.93, 0.9);

    //picture Ellhofen
    var pictureElleMesh1 = new THREE.Mesh(geometry, materialElle);
    var pictureElleMesh11 = pictureElleMesh1.clone();
    var pictureElleMesh2 = pictureElleMesh1.clone();
    var pictureElleMesh22 = pictureElleMesh1.clone();
    var pictureElleMesh3 = pictureElleMesh1.clone();
    var pictureElleMesh33 = pictureElleMesh1.clone();
    //picture Muenchen
    var pictureRgbMesh1 = new THREE.Mesh(geometry, materialRgb);
    var pictureRgbMesh11 = pictureRgbMesh1.clone();
    var pictureRgbMesh2 = pictureRgbMesh1.clone();
    var pictureRgbMesh22 = pictureRgbMesh1.clone();
    var pictureRgbMesh3 = pictureRgbMesh1.clone();
    var pictureRgbMesh33 = pictureRgbMesh1.clone();

    //set the position of the image mesh in the x,y,z dimensions
    pictureElleMesh1.position.set(2.15, 5.06, 10.1);
    pictureElleMesh11.position.set(2.15, 5.06, 10.33);
    pictureElleMesh2.position.set(2.15, 5.06, 27.81);
    pictureElleMesh22.position.set(2.15, 5.06, 28.04);
    pictureElleMesh3.position.set(2.15, 5.06, 45.521);
    pictureElleMesh33.position.set(2.15, 5.06, 45.753);
    pictureRgbMesh1.position.set(-8.15, 5.06, 10.1);
    pictureRgbMesh11.position.set(-8.15, 5.06, 10.33);
    pictureRgbMesh2.position.set(-8.15, 5.06, 27.81);
    pictureRgbMesh22.position.set(-8.15, 5.06, 28.04);
    pictureRgbMesh3.position.set(-8.15, 5.06, 45.521);
    pictureRgbMesh33.position.set(-8.15, 5.06, 45.753);
    pictureElleMesh1.rotateY(Math.PI);
    pictureElleMesh2.rotateY(Math.PI);
    pictureElleMesh3.rotateY(Math.PI);
    pictureRgbMesh1.rotateY(Math.PI);
    pictureRgbMesh2.rotateY(Math.PI);
    pictureRgbMesh3.rotateY(Math.PI);

    //add the image to the scene
    scene.add(pictureElleMesh1, pictureElleMesh11, pictureElleMesh2, pictureElleMesh22, pictureElleMesh3, pictureElleMesh33, pictureRgbMesh1, pictureRgbMesh11, pictureRgbMesh2, pictureRgbMesh22, pictureRgbMesh3, pictureRgbMesh33);

    //three.js AD
    var materialThreeJS = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/threejs.jpg')
    });
    var geometryThreeJS = new THREE.PlaneGeometry(0.95, 1.35);
    var pictureThreeJS = new THREE.Mesh(geometryThreeJS, materialThreeJS);
    pictureThreeJS.position.set(-6.155, 2.565, 9.943);
    pictureThreeJS.rotateY(Math.PI);

    //social media
    var materialSocialMedia = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/SocialMediaPeter.jpg')
    });
    var geometrySocialMedia = new THREE.PlaneGeometry(0.95, 1.35);
    var pictureSocialMedia = new THREE.Mesh(geometrySocialMedia, materialSocialMedia);
    pictureSocialMedia.position.set(-6.155, 2.565, 27.654);
    pictureSocialMedia.rotateY(Math.PI);

    //train scedule
    var materialTrainScedule = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/BahnPlan.jpg')
    });
    var geometryTrainScedule = new THREE.PlaneGeometry(0.95, 1.35);
    var pictureTrainSceduleMesh1 = new THREE.Mesh(geometryTrainScedule, materialTrainScedule);
    pictureTrainSceduleMesh1.position.set(-6.155, 2.565, 45.364);
    pictureTrainSceduleMesh1.rotateY(Math.PI);
    
    scene.add(pictureTrainSceduleMesh1, pictureThreeJS, pictureSocialMedia);
}

export function addRain() {
    raindropsunder = [];
    raindropsupper = [];
    for (let i = 0; i < dropCount / 2; i++) {
        let drop = new THREE.Vector3(
            THREE.MathUtils.randFloat(8, 14), //width
            THREE.MathUtils.randFloat(0, worldheight), //height
            THREE.MathUtils.randFloatSpread(worldwidth) //lenght
        );
        let dropsize = THREE.MathUtils.randFloat(dropsizemin, dropsizemax);
        raindropsunder.push(
            drop.x, drop.y, drop.z,
            drop.x, drop.y - dropsize, drop.z
        );
        raindropsupper.push(
            drop.x, drop.y, drop.z,
            drop.x, drop.y - dropsize, drop.z
        );
    }
    for (let i = 0; i < dropCount / 2; i++) {
        let drop1 = new THREE.Vector3(
            THREE.MathUtils.randFloat(-14, -8), //width
            THREE.MathUtils.randFloat(0, worldheight), //height
            THREE.MathUtils.randFloatSpread(worldwidth) //lenght
        );
        let dropsize = THREE.MathUtils.randFloat(dropsizemin, dropsizemax);
        raindropsunder.push(
            drop1.x, drop1.y, drop1.z,
            drop1.x, drop1.y - dropsize, drop1.z
        );
        raindropsupper.push(
            drop1.x, drop1.y, drop1.z,
            drop1.x, drop1.y - dropsize, drop1.z
        );
    }
    raingeometry = new THREE.BufferGeometry();
    raingeometry1 = new THREE.BufferGeometry();
    raingeometry.setAttribute("position", new THREE.Float32BufferAttribute(raindropsunder, 3));
    raingeometry1.setAttribute("position", new THREE.Float32BufferAttribute(raindropsupper, 3));
    let rainmaterial = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        linewidth: 2,
        transparent: true
    });
    rain = new THREE.LineSegments(raingeometry, rainmaterial);
    rain1 = new THREE.LineSegments(raingeometry1, rainmaterial);
    rain.position.set(worldcenterx, 0, worldcenterz);
    rain1.position.set(worldcenterx, -worldheight, worldcenterz);
    if (raining) {
        scene.add(rain, rain1);
    }
}

export function loadCharacter() {
    //load Model 
    let loader = new THREE.GLTFLoader(loadingManager);
    loader.load("./src/3D/peter.glb", function (gltf) {
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            const model = gltf.scene;
            model.position.set(characterx, displacement + displacestation, characterz);
            model.rotateY(Math.PI / 0.9);
            scene.add(model);
            const gltfAnimations = gltf.animations;
            const mixer = new THREE.AnimationMixer(model);
            var animationsMap = new Map();
            gltfAnimations.filter(function (a) {
                return a.name != "T-Pose";
            }).forEach(function (a) {
                animationsMap.set(a.name, mixer.clipAction(a));
            });
            characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, "idle2");
            if (debug) {
                const skeletonhelper = new THREE.SkeletonHelper(model);
                scene.add(skeletonhelper);
            }
        },
        // onProgress callback
        function (xhr) {
            if ((xhr.loaded / xhr.total) == 1) {
                console.log("Anton " + 100 + '% loaded');
            };
        },
        function (err) {
            console.error('Error Loading Model');
        });
}

export function dance(x, y, z) {
    let rand = Math.round(Math.random() * 10);
    disco.position.set(x, displacestation + 3, z);
    disco.target.position.set(x, y, z);
    disco.intensity = 5;
    if (rand == 10) {
        disco.color.set(Math.random() * 0xffffff);
    }
    if (!danceSound.isPlaying) {
        danceSound.play();
    }
}

export function stopdance() {
    disco.intensity = 0;
    disco.color.set(0x000000);
    danceSound.pause();
}

export function loadWorld() {
    //loadingManager
    loadingManager = new THREE.LoadingManager();
    pBar = document.querySelector(".progress");

    loadingManager.onProgress = function (item, loaded, total) {
        //console.log(item, loaded, total);
        let currentItem = loaded * (100 / total)
        //console.log(currentItem);
        updateProgressBar(pBar, currentItem)
    };

    //create scene
    scene = new THREE.Scene();

    //create clock
    clock = new THREE.Clock();

    //create camera
    const fov = camerafov;
    const aspect = container.clientWidth / container.clientHeight;
    const nearlimit = cameranearlimitrender;
    const farlimit = camerafarlimitrender;

    camera = new THREE.PerspectiveCamera(fov, aspect, nearlimit, farlimit);

    if (debug) {
        console.log("DEBUG MODE = TRUE")
    };

    camera.position.set(characterx - 0.5, displacement + displacestation + cameratargetheight + 0.5, characterz + -2.5);

    let texture = new THREE.MeshStandardMaterial({
        color: 0x000000
    });

    let geometry = new THREE.PlaneGeometry(worldwidth, worldwidth);
    const floortile = new THREE.Mesh(geometry, texture);
    floortile.geometry.attributes.uv2 = floortile.geometry.attributes.uv;
    floortile.castShadow = false;
    floortile.receiveShadow = false;
    floortile.rotation.x = -Math.PI / 2;
    floortile.position.set(worldcenterx, 0, worldcenterz);
    scene.add(floortile);

    //renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.decivePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1;
    bloomPass.radius = 0;
    composer = new EffectComposer(renderer);
    composer.renderToScreen = false;
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    //fog + background
    scene.background = new THREE.Color(backColor);
    if (fog) {
        scene.fog = new THREE.Fog(backColor, 1, 25);
    }

    //orbitcontrols
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.minDistance = cameranearlimit;
    orbitControls.maxDistance = camerafarlimit;
    orbitControls.enablePan = false;
    orbitControls.target.set(characterx, displacement + displacestation + cameratargetheight, characterz);
    orbitControls.maxPolarAngle = Math.PI / 2 + 0.1;
    //mouseLight.position.y += camera.position.y;
    //mouseLight.position.z += camera.position.z;
}

export function loadLights() {
    //flash
    flash = new THREE.PointLight(flashlightcolor, flashlightintensity, 470, 2);
    flash.position.set(200, 300, 100);
    scene.add(flash);

    //disco
    disco = new THREE.SpotLight(0xff0000, 0, 5, Math.PI / 4, 0.5, 1);
    disco.position.set(characterx, 3 + displacestation, characterz);
    disco.target.position.set(characterx, displacestation, characterz);
    disco.castShadow = true;
    scene.add(disco, disco.target);

    //startlight
    const startlight = new THREE.PointLight(0xffffff, 2, 7, 2);
    startlight.position.set(characterx - 2, displacestation + 2.5, characterz - 1);
    startlight.castShadow = true;
    scene.add(startlight);

    //AMBIENT
    const ambient = new THREE.AmbientLight(0xf2edd5, 0.2);
    scene.add(ambient);

    const axesHelper = new THREE.AxesHelper(5);
    //scene.add(axesHelper);

    //HEMISSPHERELIGHT
    const light = new THREE.HemisphereLight(lightcolor, lightcolor, hemisphereLightstrength);

    //Trainstationlight
    const lightwidth = 3;
    const lightheight = 55;

    let stationlight = new THREE.RectAreaLight(0x99ffff, 5, lightwidth, lightheight);
    stationlight.position.set(-3.5, 5, 20);
    stationlight.lookAt(-3.5, 0, 20);

    scene.add(stationlight);

    if (debug) {
        scene.add(hemissphereLightHelper);
        scene.add(helper);
    }

    //AdvertisingLight
    let advertasingLight1 = new THREE.PointLight(0xffffff, 20, 2, 2);
    advertasingLight1.position.set(-6.155, 2.565, 9.5);
    scene.add(advertasingLight1);
    let advertasingLight2 = new THREE.PointLight(0xffffff, 20, 2, 2);
    advertasingLight2.position.set(-6.155, 2.565, 27.212);
    scene.add(advertasingLight2);
    let advertasingLight3 = new THREE.PointLight(0xffffff, 20, 2, 2);
    advertasingLight3.position.set(-6.155, 2.565, 44.697);
    scene.add(advertasingLight3);

    //infoLights
    let color = 0xffffff;
    let intensity = 10;
    let range = 2;
    let decay = 2;
    let infoLightElle1 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightElle11 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightElle2 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightElle22 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightElle3 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightElle33 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightRgb1 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightRgb11 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightRgb2 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightRgb22 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightRgb3 = new THREE.PointLight(color, intensity, range, decay);
    let infoLightRgb33 = new THREE.PointLight(color, intensity, range, decay);

    let x1 = 2.15;
    let x2 = -8.15;
    let y = 5;
    let z1 = 9.3;
    let z2 = 11.13;

    infoLightElle1.position.set(x1, y, z1);
    infoLightElle11.position.set(x1, y, z2);
    infoLightElle2.position.set(x1, y, z1 + stationlength);
    infoLightElle22.position.set(x1, y, z2 + stationlength);
    infoLightElle3.position.set(x1, y, z1 + stationlength * 2);
    infoLightElle33.position.set(x1, y, z2 + stationlength * 2);
    infoLightRgb1.position.set(x2, y, z1);
    infoLightRgb11.position.set(x2, y, z2);
    infoLightRgb2.position.set(x2, y, z1 + stationlength);
    infoLightRgb22.position.set(x2, y, 11.13 + stationlength);
    infoLightRgb3.position.set(x2, y, z1 + stationlength * 2);
    infoLightRgb33.position.set(x2, y, z2 + stationlength * 2);

    scene.add(infoLightElle1, infoLightElle11, infoLightElle2, infoLightElle22, infoLightElle3, infoLightElle33, infoLightRgb1, infoLightRgb11, infoLightRgb2, infoLightRgb22, infoLightRgb3, infoLightRgb33);
}

function updateProgressBar(progressBar, value) {
    progressBar.querySelector(".progress-value").style.width = `${value}%`;
    if (value == 100) {
        setTimeout(function () {
            startSequence();
        }, 200);
    }
    //loadingbody = document.querySelector(".loadingBody")  
}

function startSequence() {
    document.querySelector(".loadingBody").classList.remove("active");
    document.querySelector(".controlls").classList.add("active");
    document.querySelector(".contact").classList.add("active");
    document.querySelector(".audioContainer").classList.add("active");
    rainsound.play();
    setInterval(function () {
        thundersound.play();
    }, 80000);
    rainsound.play();
    setInterval(function () {
        animateTrain();
    }, 60000);
    setInterval(function () {
        const randomElement = soundarray[Math.floor(Math.random() * soundarray.length)];
        randomElement.play();
    }, 90000);

    animate();
}

function animateTrain() {
    trainsound.play();
    passbytrain.position.set(-11.1, displacement, -100);
}

//audio slider
var volumeSlider = document.getElementById("volumeSlider");
var muteButton = document.getElementById("muteButton");
var volumeSymbol = document.getElementById("volumeSymbol");

muteButton.addEventListener("click", muteAudio);
volumeSlider.addEventListener("input", setVol);

function muteAudio() {
    //unmute
    if (muteButton.classList.contains("mute")) {
        muteButton.classList.remove("mute");
        volumeSymbol.classList.remove("fa-volume-xmark");
        volumeSymbol.classList.add("fa-volume-high");
        rainsound.setVolume(temporarysound);
        announcment1.setVolume(temporarysound);
        announcment2.setVolume(temporarysound);
        announcment3.setVolume(temporarysound);
        announcment4.setVolume(temporarysound);
        thundersound.setVolume(temporarysound);
        trainsound.setVolume(temporarysound * 0.5);
        volumeSlider.value = temporarysound * 100;
    } else {
        //mute
        temporarysound = volumeSlider.value / 100;
        muteButton.classList.add("mute");
        tempsound = volumeSlider.value / 100;
        volumeSlider.value = 0;
        rainsound.setVolume(0);
        announcment1.setVolume(0);
        announcment2.setVolume(0);
        announcment3.setVolume(0);
        announcment4.setVolume(0);
        thundersound.setVolume(0);
        trainsound.setVolume(0);
        volumeSymbol.classList.remove("fa-volume-high");
        volumeSymbol.classList.add("fa-volume-xmark");
    }
}

function setVol() {
    if (volumeSlider.value < 1) {
        //mute
        volumeSymbol.classList.remove("fa-volume-high");
        volumeSymbol.classList.add("fa-volume-xmark");
        muteButton.classList.add("mute");
    } else {
        //unmute
        volumeSymbol.classList.remove("fa-volume-xmark");
        volumeSymbol.classList.add("fa-volume-high");
        muteButton.classList.remove("mute");
    }
    tempsound = volumeSlider.value / 100;
    rainsound.setVolume(tempsound);
    announcment1.setVolume(tempsound);
    announcment2.setVolume(tempsound);
    announcment3.setVolume(tempsound);
    announcment4.setVolume(tempsound);
    thundersound.setVolume(tempsound);
    trainsound.setVolume(tempsound * 0.5);
}

function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    if (characterControls) characterControls.update(delta, keysPressed);

    //Flashlights
    if (Math.random() > 0.93 || flash.power > 100) {
        if (flash.power < 100)
            flash.position.set(
                Math.random() * 400,
                300 + Math.random() * 200,
                100
            );
        flash.power = 50 + Math.random() * 500;
    }
    //Rain
    if (raining) {
        rain.position.y -= rainspeed;
        rain1.position.y -= rainspeed;

        if (rain1.position.y < -worldheight) {
            rain1.position.y = worldheight;
        }
        if (rain.position.y < -worldheight) {
            rain.position.y = worldheight;
        }
    }
    //camera
    orbitControls.update();

    //Object Animations
    billboardmixer.update(delta);
    billboardmixer2.update(delta);
    billboardmixer3.update(delta);

    //PassbyTrain 
    if (passbytrain.position.z <= 300) {
        passbytrain.position.z += 0.6;
    }
    //render
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);