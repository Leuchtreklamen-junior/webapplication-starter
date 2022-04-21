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
import {
    ShaderPass
} from 'https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/postprocessing/ShaderPass.js';

let container = document.querySelector(".scene");
let camera, renderer, composer, scene, clock, orbitControls, characterControls, keysPressed, loadingManager, pBar, flash, sound, tempsound = 0.1,
    glowworms = [],
    pos;
let debug = false;
const ENTIRE_SCENE = 0,
    BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const darkMaterial = new THREE.MeshBasicMaterial({
    color: 'black'
});
const materials = {};
let globalUniforms = {
    time: {
        value: 0
    },
    globalBloom: {
        value: 0
    },
    noise: {
        value: null
    }
}



function init() {
    loadWorldDay();
    loadControls();
    loadCharacter();
    //loadObjects();
    addRain();
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
    const color1 = new THREE.Color("#FF00FF");
    const color2 = new THREE.Color("#00FFFF");
    const geo = new THREE.IcosahedronGeometry(0.1, 5);


    for (let i = 0; i < 20; i++) {
        const sphere = new THREE.PointLight(color1, 4, 3, 2);
        sphere.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
            color: color1
        })));
        //let angle = Math.random() * Math.PI * 2;
        sphere.position.y = Math.random() * 0.1 + 0; //Range + höhe
        sphere.position.z = Math.random() * 20 - 10; //Range + nach vorne
        sphere.position.x = Math.random() * 20 - 10; //range + Zur Seite
        glowworms.push(sphere);
    }

    for (let i = 0; i < 20; i++) {
        const sphere = new THREE.PointLight(color2, 4, 3, 2);
        sphere.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
            color: color2
        })));
        //let angle = Math.random() * Math.PI * 2;
        sphere.position.y = Math.random() * 0.1 + 0; //Range + höhe
        sphere.position.z = Math.random() * 20 - 10; //Range + nach vorne
        sphere.position.x = Math.random() * 20 - 10; //range + Zur Seite
        glowworms.push(sphere);
    }

    glowworms.forEach(sphere => scene.add(sphere));
    console.log(glowworms);


    //test get mouseposition
    // window.addEventListener("mousedown", e => {
    //     var vec = new THREE.Vector3(); // create once and reuse
    //     let pos = new THREE.Vector3(); // create once and reuse

    //     vec.set(
    //         (e.clientX / window.innerWidth) * 2 - 1,
    //         (e.clientY / window.innerHeight) * 2 + 1,
    //         0.5);

    //     vec.unproject(camera);

    //     vec.sub(camera.position).normalize();

    //     var distance = -camera.position.z / vec.z;

    //     pos.copy(camera.position).add(vec.multiplyScalar(distance));
    //     console.log(pos);

    //     glowworms.forEach(sphere => {


    //     })

    // });


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

function addRain() {
    let vertices = [];
    let dropEnds = [];
    let dropCount = 2000;
    for (let i = 0; i < dropCount; i++) {
        let x = THREE.MathUtils.randFloatSpread(20); //Breite
        let y = THREE.MathUtils.randFloat(-1, 5); //Höhe
        let z = THREE.MathUtils.randFloatSpread(20); //Länge
        let dropsize = THREE.MathUtils.randFloat(0.25, 0.5);
        vertices.push(
            x, y, z,
            x, y-dropsize, z
        );
        dropEnds.push(0, dropsize, 1 ,dropsize);
    }
    let raingeometry = new THREE.BufferGeometry();
    raingeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices,3));
    //raingeometry.setAttribute("dropEnds", new THREE.Float32BufferAttribute(dropEnds,2));
    let rainmaterial = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        vertexColors: true
    });
    let mesh = new THREE.LineSegments(raingeometry, rainmaterial);
    scene.add(mesh);
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
            console.log(gltfAnimations);

            var animationsMap = new Map();
            gltfAnimations.filter(function (a) {
                return a.name != "T-Pose";
            }).forEach(function (a) {
                animationsMap.set(a.name, mixer.clipAction(a));
            });
            characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, "lookaround", glowworms);
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
    const fov = 50;
    const aspect = container.clientWidth / container.clientHeight;
    const nearlimit = 0.1;
    const farlimit = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, nearlimit, farlimit);

    if (debug) {
        console.log("DEBUG MODE = TRUE")
    };

    camera.position.set(0, 0, 3);

    //plane

    // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    // const cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
    // scene.add( cubeCamera );


    const gridHelper = new THREE.GridHelper(100, 30, 0xff0000, 0x000000);



    const textureLoader = new THREE.TextureLoader();
    const tilesBaseColor = textureLoader.load("/src/textures/kachel/color.jpg");
    const tilesNormalMap = textureLoader.load("/src/textures/kachel/normal.jpg");
    const tilesHightMap = textureLoader.load("/src/textures/kachel/displace.jpg");
    const tilesRoughnessMap = textureLoader.load("/src/textures/kachel/rough.jpg");
    const tilesAmbientOcclusionMap = textureLoader.load("/src/textures/kachel/ao.jpg");
    const tilesMetallic = textureLoader.load("/src/textures/kachel/metal.jpg");

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 512, 512), new THREE.MeshStandardMaterial({
        map: tilesBaseColor,
        normalMap: tilesNormalMap,
        displacementMap: tilesHightMap,
        displacementScale: 0.05,
        roughnessMap: tilesRoughnessMap,
        roughness: 1,
        aoMap: tilesAmbientOcclusionMap,
        metalnessMap: tilesMetallic,
        metalness: 1
    }));

    floor.geometry.attributes.uv2 = floor.geometry.attributes.uv;
    floor.castShadow = false;
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;


    scene.add(floor);


    //LIGHTS
    //flash
    flash = new THREE.PointLight(0x062d89, 10, 470, 2);
    flash.position.set(200, 300, 100);
    scene.add(flash);

    //AMBIENT

    //if (debug) {
        const ambient = new THREE.AmbientLight(0xf2edd5, 1);
        scene.add(ambient);
    //}

    const axesHelper = new THREE.AxesHelper(5);
    //scene.add(axesHelper);

    //HEMISSPHERELIGHT
    const light = new THREE.HemisphereLight(0xbfcad8, 0xbfcad8, 0.1);

    //Light in Front

    // const front = new THREE.PointLight(0xff0000, 10, 4, 10);
    // front.position.set(0, 1.15, 1.15);
    //scene.add(front);
    // const frontlighthelper = new THREE.PointLightHelper(front, 0.1, 0xffffff);
    // scene.add(frontlighthelper);


    //moon
    const moon = new THREE.DirectionalLight(0xbfcad8, 1);
    moon.position.set(2, 10, 1);
    moon.target.position.set(0, 0, 0);
    moon.castShadow = true;

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



    //cubeCamera.update(renderer, scene)


    //fog + background
    let backColor = 0x000000;
    scene.background = new THREE.Color(backColor);
    //scene.fog = new THREE.Fog(backColor, 1, 25);
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
    console.log("clicked");
    sound.setVolume(0);
    if (muteButton.classList.contains("mute")) {
        muteButton.classList.remove("mute");
        tempsound = volumeSlider.value / 100;
        console.log(tempsound);
        volumeSymbol.classList.remove("fa-volume-xmark");
        volumeSymbol.classList.add("fa-volume-high");
        volumeSlider.value = 100;
        setVol();

        console.log(muteButton);
    } else {
        muteButton.classList.add("mute");
        volumeSymbol.classList.remove("fa-volume-high");
        tempsound = volumeSlider.value / 100;
        console.log(tempsound);
        volumeSymbol.classList.add("fa-volume-xmark");
        volumeSlider.value = 0;
        setVol();
        console.log(muteButton);
    }



}



function setVol() {
    console.log(tempsound);
    //sound.setVolume(1);
    console.log(sound.getVolume());
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

    //Animate Spheres

    glowworms.forEach(sphere => {
        // sphere.position.z += randomIntFromInterval(-0.005, 0.005); 
        // sphere.position.x += randomIntFromInterval(-0.005, 0.005); 
        // sphere.position.x += randomIntFromInterval(-0.005, 0.005); 
    });

    //END


    orbitControls.update();
    renderer.render(scene, camera);
    //composer.render();
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


//Keep Camera Centered on window Resize
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
animate();