import {
    CharacterControls
} from "./characterControls.js";

let container = document.querySelector(".scene");
let camera, renderer, scene, clock, mixer, orbitControls, characterControls, keysPressed, loadingManager, pBar, flash;
let debug = false;


function init() {


    loadControls();
    loadWorld();
    loadCharacter();
    loadObjects();


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


function loadObjects() {
    let loader = new THREE.GLTFLoader(loadingManager);
    loader.load("/src/3D/lantern.glb", function (gltf) {
        const streetlight = gltf.scene;
        streetlight.position.set(-4, -1, 0);
        streetlight.rotateY(Math.PI / 4);


        scene.add(streetlight);
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


function loadWorld() {



    //loadingManager
    loadingManager = new THREE.LoadingManager();
    pBar = document.querySelector(".progress");

    loadingManager.onProgress = function (item, loaded, total) {
        //console.log(item, loaded, total);
        let currentItem = loaded * (100 / total)
        //console.log(currentItem);
        updateProgressBar(pBar, currentItem)
    };

    // loadingManager.onLoad = function(){
    //     console.log("scene loaded");
    //     updateProgressBar(pBar, 100);
    // };

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
        color: 0x060606
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
    flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
    flash.position.set(200, 300, 100);
    //scene.add(flash);

    //AMBIENT

    if (debug) {
        const ambient = new THREE.AmbientLight(0xf2edd5, 1);
        scene.add(ambient);
    }

    //POINTLIGHT
    const plight = new THREE.PointLight(0x8f9eff, 2);
    plight.position.set(-0.8, 1.7, 0.6);
    plight.castShadow = false;

    const plight2 = new THREE.PointLight(0x8f9eff, 2);
    plight2.position.set(0.8, 1.7, 0.6);
    plight2.castShadow = false;

    //HEMISSPHERELIGHT
    const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);


    //moon
    const moon = new THREE.DirectionalLight(0xbfcad8, 1);
    moon.position.set(2, 10, 1);
    moon.target.position.set(0, 0, 0);
    moon.castShadow = true;

    scene.add(moon.target);

    //spotlight front
    const spotLight = new THREE.SpotLight(0xff6ec7, 1, 25, 0.2, 0, 1);
    spotLight.position.set(10, 5, 2);

    spotLight.castShadow = false;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 500;
    spotLight.shadow.focus = 1;


    //spotlight back
    const spotLight2 = new THREE.SpotLight(0x21f8f6, 1, 25, 0.2, 0, 1);
    spotLight2.position.set(-10, 3, -2);

    spotLight2.castShadow = false;
    spotLight2.shadow.mapSize.width = 512;
    spotLight2.shadow.mapSize.height = 512;
    spotLight2.shadow.camera.near = 0.5;
    spotLight2.shadow.camera.far = 500;
    spotLight2.shadow.focus = 1;

    // scene.add(plight);
    // scene.add(plight2);
    scene.add(moon);
    // scene.add(spotLight);
    // scene.add(spotLight2);
    //scene.add(light);


    //lighthelper
    const sphereSize = 10;
    const hemissphereLightHelper = new THREE.HemisphereLightHelper(light, sphereSize);
    const helper = new THREE.DirectionalLightHelper(moon, 5)
    const sphereSizePoint = 0.1;



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

    //fog
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