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
let camera, renderer, composer, scene, clock, orbitControls, characterControls, keysPressed, loadingManager, pBar, flash,
    movieRapCubeScreen, movieEnvCubeScreen,
    rainsound, thundersound, trainsound, soundarray = [],
    billboardmixer, billboardmixer2, billboardmixer3, wagonmixer, videoRap, videoSki, videoEnv, videoRapTexture, videoSkiTexture, videoEnvTexture,
    temporarysound, rain, rain1, raindropsunder, raindropsupper, raingeometry, raingeometry1;

//CONTROLLS

//world
let worldwidth = 100,
    worldheight = 20,
    backColor = 0x060616,
    worldcenterx = -3,
    worldcenterz = 20,

    //light
    moonlightstrenght = 1, //0.5 - 3
    moonlightcolor = 0xbfcad8,
    hemisphereLightstrength = 0.2,

    //flash
    flashlightcolor = 0x062d89,
    flashlightintensity = 2000, //5-2000

    //rain and fog controlls
    raining = true,
    dropCount = 40000, //200 - 40000
    rainspeed = 0.2,
    dropsizemin = 0.05,
    dropsizemax = 0.2,
    fog = true,

    //starting volume sound
    tempsound = 0.1,

    //floor 
    floorrepeat = 10,
    displacement = 0.15,
    displacestation = 1.1,
    texturequality = 2000,
    floormetalness = 0,
    floorroughness = 5,

    characterx = -3,
    characterz = 17,

    //camera
    camerafov = 90,
    cameratargetheight = 1.7,
    camerafarlimit = 100,
    cameranearlimit = 1,
    camerafarlimitrender = 200,
    cameranearlimitrender = 0.1,

    //debug
    debug = false;

function init() {
    loadWorldDay();
    loadControls();
    loadObjects();
    loadCharacter();
    if (raining) {
        addRain();
        loadaudio();
    }
    //loadVideos();
    loadPictures();
    //loadFont();

}

function loadObjects() {
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
        scene.add(billboard);
        scene.add(billboard2);
        scene.add(billboard3);
        action.play();
        action2.play();
        action3.play();
    });

    loader.load("./src/3D/train.glb", function (gltf) {
        let wagon = gltf.scene;
        wagonmixer = new THREE.AnimationMixer(wagon);
        wagon.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        wagon.position.set(5, displacement, 20.9);
        scene.add(wagon);
        let anim = gltf.animations[0];
        let action = wagonmixer.clipAction(anim);
        //action.play();
    });
    loader.load("./src/3D/trainfront.glb", function (gltf) {
        let frontwagon = gltf.scene;
        frontwagon.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        frontwagon.position.set(5, displacement, 36.8);
        scene.add(frontwagon);
    });
    loader.load("./src/3D/trainback.glb", function (gltf) {
        let backwagon = gltf.scene;
        backwagon.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        backwagon.position.set(5, displacement, 6.15);
        scene.add(backwagon);
    });
    loader.load("./src/3D/trainstation.glb", function (gltf) {
        let station = gltf.scene;
        let station2 = station.clone();
        let station3 = station.clone();
        station.position.set(-3, displacement, 5);
        station2.position.set(-3, displacement, 22.71);
        station3.position.set(-3, displacement, 40.2);
        scene.add(station);
        scene.add(station2);
        scene.add(station3);
    });
    loader.load("./src/3D/cocacola.glb", function (gltf) {
        let cocacola = gltf.scene;
        cocacola.position.set(-3, displacement + displacestation, 15);
        scene.add(cocacola);
    });
}

function addRain() {
    raindropsunder = [];
    raindropsupper = [];
    for (let i = 0; i < dropCount; i++) {
        let drop = new THREE.Vector3(
            THREE.MathUtils.randFloatSpread(worldwidth), //Breite
            THREE.MathUtils.randFloat(-1, worldheight), //Höhe
            THREE.MathUtils.randFloatSpread(worldwidth) //Länge
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
    rain1.position.y = -worldheight;
    scene.add(rain);
    scene.add(rain1);
}


function loadCharacter() {

    //load Model 
    let loader = new THREE.GLTFLoader(loadingManager);
    loader.load("./src/3D/anton.glb", function (gltf) {
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            const model = gltf.scene;
            model.position.set(characterx, displacement + displacestation, characterz);


            scene.add(model);

            const gltfAnimations = gltf.animations;
            const mixer = new THREE.AnimationMixer(model);
            //console.log(gltfAnimations);

            var animationsMap = new Map();
            gltfAnimations.filter(function (a) {
                return a.name != "T-Pose";
            }).forEach(function (a) {
                animationsMap.set(a.name, mixer.clipAction(a));
            });
            characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, "lookaround");
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

        // onError callback
        function (err) {
            console.error('Error Loading Peter');
        });
}


function loadWorldDay() {

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

    camera.position.set(characterx, displacement + displacestation + cameratargetheight, characterz + 2);


    let texture = new THREE.MeshStandardMaterial({
        color: 0x000000
    });

    let geometry = new THREE.PlaneGeometry(worldwidth, worldwidth, texturequality, texturequality);
    const floortile = new THREE.Mesh(geometry, texture);
    floortile.geometry.attributes.uv2 = floortile.geometry.attributes.uv;
    floortile.castShadow = false;
    floortile.receiveShadow = true;
    floortile.rotation.x = -Math.PI / 2;
    floortile.position.set(-3.5, 0, 20);
    scene.add(floortile);

    //LIGHTS

    //flash
    flash = new THREE.PointLight(flashlightcolor, flashlightintensity, 470, 2);
    flash.position.set(200, 300, 100);
    scene.add(flash);

    //AMBIENT
    if (debug) {
        const ambient = new THREE.AmbientLight(0xf2edd5, 1);
        scene.add(ambient);
    }

    const axesHelper = new THREE.AxesHelper(5);
    //scene.add(axesHelper);

    //HEMISSPHERELIGHT
    const light = new THREE.HemisphereLight(moonlightcolor, moonlightcolor, hemisphereLightstrength);

    //moon
    const moon = new THREE.DirectionalLight(moonlightcolor, moonlightstrenght);
    moon.position.set(2, 10, 1);
    moon.target.position.set(0, 0, 0);
    moon.castShadow = true;

    scene.add(moon.target);
    scene.add(moon);
    scene.add(light);


    //metrolights
    const width = 2.0;
    const height = 45;

    let metrolight = new THREE.RectAreaLight(0xE674FF, 2, width, height);
    metrolight.position.set(5, 3.7, 20);
    metrolight.lookAt(5, 0, 20);
    scene.add(metrolight);

    //Trainstationlight

    const trainlightwidth = 3;
    const trainlightheight = 45;

    let stationlight = new THREE.RectAreaLight(0x99ffff, 5, trainlightwidth, trainlightheight);
    stationlight.position.set(-3.5, 5, 20);
    stationlight.lookAt(-3.5, 0, 20);

    scene.add(stationlight);

    //lighthelper
    const sphereSize = 10;
    const hemissphereLightHelper = new THREE.HemisphereLightHelper(light, sphereSize);
    const helper = new THREE.DirectionalLightHelper(moon, 5);


    if (debug) {
        scene.add(hemissphereLightHelper);
        scene.add(helper);
    }

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

//const pBar = document.querySelector(".progress");
//updateProgressBar(pBar, 40);

//update loading Bar
function updateProgressBar(progressBar, value) {
    progressBar.querySelector(".progress-value").style.width = `${value}%`;
    if (value == 100) {
        setTimeout(function () {
            startSequence();
        }, 2000);
    }
    //loadingbody = document.querySelector(".loadingBody")  
}

function startSequence() {
    document.querySelector(".loadingBody").classList.remove("active");
    document.querySelector(".controlls").classList.add("active");
    document.querySelector(".audioContainer").classList.add("active");
    rainsound.play();
    setInterval(function () {
        thundersound.play();
    }, 20000);
    rainsound.play();
    setInterval(function () {
        trainsound.play();
    }, 50000);
    setInterval(function () {
        const randomElement = soundarray[Math.floor(Math.random() * soundarray.length)];
        randomElement.play();
    }, 90000);
    animate();
}

//load audio
function loadaudio() {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    rainsound = new THREE.Audio(listener);
    thundersound = new THREE.Audio(listener);
    let announcment1 = new THREE.Audio(listener);
    let announcment2 = new THREE.Audio(listener);
    let announcment3 = new THREE.Audio(listener);
    trainsound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load('./src/audio/rain.wav', function (buffer) {
        rainsound.setBuffer(buffer);
        rainsound.setLoop(true);
        rainsound.setVolume(tempsound);
        rainsound.position.set(-3, 10, 20);

    });

    audioLoader.load('./src/audio/thunder1.wav', function (buffer) {
        thundersound.setBuffer(buffer);
        thundersound.setLoop(false);
        thundersound.setVolume(0.2);
    });

    audioLoader.load('./src/audio/trainsound.mp3', function (buffer) {
        trainsound.setBuffer(buffer);
        trainsound.setLoop(false);
        trainsound.setVolume(0.2);
    });

    audioLoader.load('./src/audio/announcment1.mp3', function (buffer) {
        announcment1.setBuffer(buffer);
        announcment1.setLoop(false);
        announcment1.setVolume(0.1);
    });
    audioLoader.load('./src/audio/announcment2.mp3', function (buffer) {
        announcment2.setBuffer(buffer);
        announcment2.setLoop(false);
        announcment2.setVolume(0.1);
    });
    audioLoader.load('./src/audio/announcment3.mp3', function (buffer) {
        announcment3.setBuffer(buffer);
        announcment3.setLoop(false);
        announcment3.setVolume(0.1);
    });

    soundarray.push(announcment1, announcment2, announcment3);
    console.log(soundarray);
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
        volumeSlider.value = temporarysound * 100;
    } else {
        //mute
        temporarysound = volumeSlider.value / 100;
        muteButton.classList.add("mute");
        tempsound = volumeSlider.value / 100;
        volumeSlider.value = 0;
        rainsound.setVolume(0);
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

}

//Animation
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

    //videoRapTexture.needsUpdate = true;
    //videoEnvTexture.needsUpdate = true;

    //changes volume of videos by distance
    //videoSoundHandler(movieRapCubeScreen, videoRap);
    //videoSoundHandler(movieEnvCubeScreen, videoEnv);

    //Object Animations
    wagonmixer.update(delta);
    billboardmixer.update(delta);
    billboardmixer2.update(delta);
    billboardmixer3.update(delta);

    //render
    renderer.render(scene, camera);
}

//Keep Camera Centered on window Resize
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

function loadControls() {
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
};


// function loadVideos() {
//     //Rap Video
//     videoRap = document.getElementById("videoRap");
//     videoRap.volume = 0.0001;
//     videoRapTexture = new THREE.VideoTexture(videoRap);
//     videoRapTexture.minFilter = THREE.LinearFilter;
//     videoRapTexture.magFilter = THREE.LinearFilter;

//     var movieRapMaterial = new THREE.MeshBasicMaterial({
//         map: videoRapTexture,
//         side: THREE.FrontSide,
//         toneMapped: false,
//     })

//     let movieRapGeometry = new THREE.PlaneGeometry(0.95, 1.31);
//     let movieRapCubeScreen = new THREE.Mesh(movieRapGeometry, movieRapMaterial);
//     movieRapCubeScreen.rotateY(Math.PI);

//     movieRapCubeScreen.position.set(-6.155, 2.565, 9.943);
//     scene.add(movieRapCubeScreen);

//     //Ski Video
//     videoSki = document.getElementById("videoSki");
//     videoSkiTexture = new THREE.VideoTexture(videoSki);
//     videoSkiTexture.minFilter = THREE.LinearFilter;
//     videoSkiTexture.magFilter = THREE.LinearFilter;

//     var movieSkiMaterial = new THREE.MeshBasicMaterial({
//         map: videoSkiTexture,
//         side: THREE.FrontSide,
//         toneMapped: false,
//     })

//     let movieSkiGeometry = new THREE.PlaneGeometry(0.95, 1.31);
//     let movieSkiCubeScreen = new THREE.Mesh(movieSkiGeometry, movieSkiMaterial);
//     movieSkiCubeScreen.rotateY(Math.PI);

//     movieSkiCubeScreen.position.set(-6.155, 2.565, 27.655);
//     scene.add(movieSkiCubeScreen);

//     //Umwelt Video
//     videoEnv = document.getElementById("videoEnv");
//     videoEnv.volume = 0.0001;
//     videoEnvTexture = new THREE.VideoTexture(videoEnv);
//     videoEnvTexture.minFilter = THREE.LinearFilter;
//     videoEnvTexture.magFilter = THREE.LinearFilter;

//     var movieEnvMaterial = new THREE.MeshBasicMaterial({
//         map: videoEnvTexture,
//         side: THREE.FrontSide,
//         toneMapped: false,
//     })

//     let movieEnvGeometry = new THREE.PlaneGeometry(0.94, 1.31);
//     let movieEnvCubeScreen = new THREE.Mesh(movieEnvGeometry, movieEnvMaterial);
//     movieEnvCubeScreen.rotateY(Math.PI);

//     movieEnvCubeScreen.position.set(-6.155, 2.565, 45.14);
//     scene.add(movieEnvCubeScreen);
// }

// function videoRapSoundHandler() {
//     const characterPosition = characterControls.cameraTarget;
//     const screenPosition = new THREE.Vector3(-6.155, 2.565, 9.943);
//     const distance = characterPosition.distanceTo(screenPosition);
//     const newDistance = distance * -1 + 4;
//     if (newDistance > 0) {
//         videoRap.volume = newDistance * 0.1;
//     }
// }

// function videoEnvSoundHandler() {
//     const characterPosition = characterControls.cameraTarget;
//     const screenPosition = new THREE.Vector3(-6.155, 2.565, 45.14);
//     const distance = characterPosition.distanceTo(screenPosition);
//     const newDistance = distance * -1 + 4;
//     if (newDistance > 0) {
//         videoEnv.volume = newDistance * 0.1;
//     }
// }

function loadPictures() {
    // Create a texture loader so we can load our image file
    var loader = new THREE.TextureLoader();

    // Load an image file into a custom material
    var materialElle = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/bahnanzeigeElle.jpg')
    });

    var materialRgb = new THREE.MeshLambertMaterial({
        map: loader.load('./pictures/bahnanzeigeRgb.jpg')
    });

    // create a plane geometry for the image with a width of 10
    // and a height that preserves the image's aspect ratio
    var geometry = new THREE.PlaneGeometry(1.93, 0.9);

    // picture Ellhofen
    var pictureElleMesh1 = new THREE.Mesh(geometry, materialElle);
    var pictureElleMesh11 = pictureElleMesh1.clone();
    var pictureElleMesh2 = pictureElleMesh1.clone();
    var pictureElleMesh22 = pictureElleMesh1.clone();
    var pictureElleMesh3 = pictureElleMesh1.clone();
    var pictureElleMesh33 = pictureElleMesh1.clone();
    // picture München
    var pictureRgbMesh1 = new THREE.Mesh(geometry, materialRgb);
    var pictureRgbMesh11 = pictureRgbMesh1.clone();
    var pictureRgbMesh2 = pictureRgbMesh1.clone();
    var pictureRgbMesh22 = pictureRgbMesh1.clone();
    var pictureRgbMesh3 = pictureRgbMesh1.clone();
    var pictureRgbMesh33 = pictureRgbMesh1.clone();

    // set the position of the image mesh in the x,y,z dimensions
    pictureElleMesh1.position.set(2.15, 5.06, 10.1);
    pictureElleMesh11.position.set(2.15, 5.06, 10.33);
    pictureElleMesh2.position.set(2.15, 5.06, 27.81);
    pictureElleMesh22.position.set(2.15, 5.06, 28.04);
    pictureElleMesh3.position.set(2.15, 5.06, 45.3);
    pictureElleMesh33.position.set(2.15, 5.06, 45.53);
    pictureRgbMesh1.position.set(-8.15, 5.06, 10.1);
    pictureRgbMesh11.position.set(-8.15, 5.06, 10.33);
    pictureRgbMesh2.position.set(-8.15, 5.06, 27.81);
    pictureRgbMesh22.position.set(-8.15, 5.06, 28.04);
    pictureRgbMesh3.position.set(-8.15, 5.06, 45.3);
    pictureRgbMesh33.position.set(-8.15, 5.06, 45.53);

    pictureElleMesh1.rotateY(Math.PI);
    pictureElleMesh2.rotateY(Math.PI);
    pictureElleMesh3.rotateY(Math.PI);
    pictureRgbMesh1.rotateY(Math.PI);
    pictureRgbMesh2.rotateY(Math.PI);
    pictureRgbMesh3.rotateY(Math.PI);

    // add the image to the scene
    scene.add(pictureElleMesh1);
    scene.add(pictureElleMesh11);
    scene.add(pictureElleMesh2);
    scene.add(pictureElleMesh22);
    scene.add(pictureElleMesh3);
    scene.add(pictureElleMesh33);
    scene.add(pictureRgbMesh1);
    scene.add(pictureRgbMesh11);
    scene.add(pictureRgbMesh2);
    scene.add(pictureRgbMesh22);
    scene.add(pictureRgbMesh3);
    scene.add(pictureRgbMesh33);
}

init();