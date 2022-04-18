import {
    CharacterControls
} from "./characterControls.js";

let container = document.querySelector(".scene");
let camera, renderer, scene, clock, mixer, orbitControls, characterControls, keysPressed, loadingManager, pBar, flash, sound, tempsound = 0.1, temporarysound;
let debug = false;


function init() {
    loadControls();
    loadWorldDay();
    loadCharacter();
    loadObjects();
    loadaudio();
    loadLightbulbs();
}

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
                //console.log(keysPressed);
                break;
        }
    }, false);
};

function loadLightbulbs() {
    const color = new THREE.Color("#FF0000");
    const geo = new THREE.IcosahedronGeometry(0.01, 5);
    const material = new THREE.MeshBasicMaterial({
        color: color
    });

    for (let i = 0; i < 50; i++) {
        const sphere = new THREE.Mesh(geo, material);
        sphere.position.y = Math.random() * 0.3 + 1;
        sphere.position.z = Math.random() * 0.3 + 1;
        sphere.position.x = Math.random() * 0.3 - 0.15;
        scene.add(sphere);
    }
}


function loadObjects() {
    let loader = new THREE.GLTFLoader(loadingManager);
    loader.load("/src/3D/lantern.glb", function (gltf) {
        const streetlight = gltf.scene;
        streetlight.position.set(-4, -1, 0);
        streetlight.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        streetlight.rotateY(Math.PI / 4);
        scene.add(streetlight);
    });

    loader.load("/src/3D/shieldwithoutlight.glb", function (gltf) {
        const shield = gltf.scene;
        shield.position.set(0, 0, 0);
        shield.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        shield.rotateY(Math.PI / 4);
        scene.add(shield);
    });


}


function loadCharacter() {
    //load Model 
    let loader = new THREE.GLTFLoader(loadingManager);
    loader.load("/src/3D/anton.glb", function (gltf) {
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            const model = gltf.scene;
            model.position.set(0, 0, 0);


            scene.add(model);

            const gltfAnimations = gltf.animations;
            const mixer = new THREE.AnimationMixer(model);

            var animationsMap = new Map();
            gltfAnimations.filter(function (a) {
                return a.name != "T-Pose";
            }).forEach(function (a) {
                animationsMap.set(a.name, mixer.clipAction(a));
            });
            characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, "lookaround");
            if (debug) {
                const skeletonhelper = new THREE.SkeletonHelper(model);
                //scene.add(skeletonhelper);
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
    const fov = 50;
    const aspect = container.clientWidth / container.clientHeight;
    const nearlimit = 0.1;
    const farlimit = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, nearlimit, farlimit);

    if (debug) {
        console.log("DEBUG MODE = TRUE")
        // const camerahelper = new THREE.CameraHelper(camera);
        // scene.add(camerahelper);
    };

    camera.position.set(0, 0, 3);

    //plane

    // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    // const cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
    // scene.add( cubeCamera );

    const planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x333333
    });



    const planegeometry = new THREE.PlaneGeometry(100, 100, 1);
    const floor = new THREE.Mesh(planegeometry, planeMaterial);
    const gridHelper = new THREE.GridHelper(100, 30, 0xff0000, 0x000000);

    floor.castShadow = false;
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);


    //LIGHTS
    //flash
    flash = new THREE.PointLight(0x062d89, 10, 470, 2);
    flash.position.set(200, 300, 100);
    //scene.add(flash);

    //AMBIENT

    if (debug) {
        const ambient = new THREE.AmbientLight(0xf2edd5, 1);
        scene.add(ambient);
    }

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    //HEMISSPHERELIGHT
    const light = new THREE.HemisphereLight(0xbfcad8, 0xbfcad8, 0.1);

    //Light in Front

    const front = new THREE.PointLight(0xff0000, 10, 4, 10);
    front.position.set(0, 1.15, 1.15);
    scene.add(front);
    const frontlighthelper = new THREE.PointLightHelper(front, 0.1, 0xffffff);
    scene.add(frontlighthelper);


    //moon
    const moon = new THREE.DirectionalLight(0xbfcad8, 1);
    moon.position.set(2, 10, 1);
    moon.target.position.set(0, 0, 0);
    moon.castShadow = false;

    scene.add(moon.target);

    // //spotlight front
    // const spotLight = new THREE.SpotLight(0xff6ec7, 1, 25, 0.2, 0, 1);
    // spotLight.position.set(10, 5, 2);

    // spotLight.castShadow = false;
    // spotLight.shadow.mapSize.width = 512;
    // spotLight.shadow.mapSize.height = 512;
    // spotLight.shadow.camera.near = 0.5;
    // spotLight.shadow.camera.far = 500;
    // spotLight.shadow.focus = 1;


    // //spotlight back
    // const spotLight2 = new THREE.SpotLight(0x21f8f6, 1, 25, 0.2, 0, 1);
    // spotLight2.position.set(-10, 3, -2);

    // spotLight2.castShadow = false;
    // spotLight2.shadow.mapSize.width = 512;
    // spotLight2.shadow.mapSize.height = 512;
    // spotLight2.shadow.camera.near = 0.5;
    // spotLight2.shadow.camera.far = 500;
    // spotLight2.shadow.focus = 1;

    //scene.add(pointlightlantern1);
    // scene.add(pointlightshield1);
    scene.add(moon);
    scene.add(light);


    //lighthelper
    const sphereSize = 10;
    const hemissphereLightHelper = new THREE.HemisphereLightHelper(light, sphereSize);
    const helper = new THREE.DirectionalLightHelper(moon, 5)
    const sphereSizePoint = 0.1;
    // const pointlightlantern1helper = new THREE.PointLightHelper(pointlightlantern1, sphereSizePoint, 0xffffff);
    // //scene.add(pointlightlantern1helper);
    // const pointlightshield1helper = new THREE.PointLightHelper(pointlightshield1, sphereSizePoint, 0xffffff);
    //scene.add(pointlightshield1helper);



    if (debug) {
        scene.add(hemissphereLightHelper);
        scene.add(helper);
        scene.add(gridHelper);
    }

    //renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.decivePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //cubeCamera.update(renderer, scene)
    container.appendChild(renderer.domElement);

    //fog + background
    let backColor = 0x000000;
    scene.background = new THREE.Color(backColor);
    scene.fog = new THREE.Fog(backColor, 1, 25);
    // scene.fog = new THREE.FogExp2(0x1c1c2a, 0.002);
    // renderer.setClearColor(scene.fog.color);

    //orbitcontrols
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.minDistance = 2;
    orbitControls.maxDistance = 100;
    orbitControls.enablePan = false;
    orbitControls.target.set(0, 1.3, 0);
    orbitControls.maxPolarAngle = Math.PI / 2 + 0.1;

}

//const pBar = document.querySelector(".progress");
//updateProgressBar(pBar, 40);

//update loading Bar
function updateProgressBar(progressBar, value) {
    progressBar.querySelector(".progress-value").style.width = `${value}%`;
    if (value == 100) {
        setTimeout(function () {
            document.querySelector(".loadingBody").classList.remove("active")
        }, 2000);
    }
    //loadingbody = document.querySelector(".loadingBody")  
}

//load audio
function loadaudio() {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/src/audio/rain.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(tempsound);
        sound.autoplay = true;
        sound.play();
    });

    audioLoader.load('/src/audio/thunder1.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(tempsound);
        sound.autoplay = true;
        //sound.play();
    });


}

//audio slider
var volumeSlider = document.getElementById("volumeSlider");
var muteButton = document.getElementById("muteButton");
var volumeSymbol = document.getElementById("volumeSymbol");

muteButton.addEventListener("click", muteAudio);
volumeSlider.addEventListener("input", setVol);

function muteAudio() {
    //unmute
    if (muteButton.classList.contains("mute")){
        muteButton.classList.remove("mute");
        volumeSymbol.classList.remove("fa-volume-xmark");
        volumeSymbol.classList.add("fa-volume-high");
        sound.setVolume(temporarysound);
        volumeSlider.value = temporarysound*100;
        console.log("unmuted");
    } else {
        //mute
        temporarysound = volumeSlider.value / 100;
        muteButton.classList.add("mute");
        tempsound = volumeSlider.value / 100;
        volumeSlider.value = 0;
        sound.setVolume(0);
        volumeSymbol.classList.remove("fa-volume-high");
        volumeSymbol.classList.add("fa-volume-xmark");
        console.log("muted");
    }
    
}

function setVol() {
    if (volumeSlider.value < 1) {
        //mute
        volumeSymbol.classList.remove("fa-volume-high");
        volumeSymbol.classList.add("fa-volume-xmark");
        muteButton.classList.add("mute");
        console.log("muted");
    } else {
        //unmute
        volumeSymbol.classList.remove("fa-volume-xmark");
        volumeSymbol.classList.add("fa-volume-high");
        muteButton.classList.remove("mute");
        console.log("unmuted");
    }
    tempsound = volumeSlider.value / 100;
    sound.setVolume(tempsound);
}

//Animation
function animate() {
    requestAnimationFrame(animate);

    var delta = clock.getDelta();

    if (characterControls) characterControls.update(delta, keysPressed);


    //Moonlight and Rain


    if (Math.random() > 0.93 || flash.power > 100) {
        if (flash.power < 100)
            flash.position.set(
                Math.random() * 400,
                300 + Math.random() * 200,
                100
            );
        flash.power = 50 + Math.random() * 500;
    }



    //END

    orbitControls.update();
    renderer.render(scene, camera);

}


//Keep Camera Centered on window Resize
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
animate();