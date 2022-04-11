let container = document.querySelector(".scene");
let camera;
let renderer;
let scene;
let clock;
let mixer;
let character;
let planeCamera;


function init() {

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

    camera.position.set(75, 20, 0);

    //plane

    // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );

    // const cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
    // scene.add( cubeCamera );

    const planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x333333
    });

    const plane = new THREE.PlaneGeometry(100, 100, 1);
    const floor = new THREE.Mesh(plane, planeMaterial);

    // floor.castShadow = false;
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);

    // cubeCamera.position.copy( floor.position );





    //light 

    //AMBIENT

    // const ambient = new THREE.AmbientLight(0xf2edd5, 0.2);
    // scene.add(ambient);

    //POINTLIGHT

    const plight = new THREE.PointLight(0x8f9eff, 2);
    plight.position.set(0.05, 1.7, 0.6);
    plight.castShadow = false;
    //scene.add(plight);


    //HEMISSPHERELIGHT

    const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(light);

    //SUN

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(2, 10, 1);
    sun.target.position.set(0, 0, 0);
    sun.castShadow = true;

    scene.add(sun);
    scene.add(sun.target);



    //lighthelper

    const sphereSize = 0.05;
    const pointLightHelper = new THREE.PointLightHelper(plight, sphereSize);
    //scene.add(pointLightHelper);

    // const helper = new THREE.DirectionalLightHelper(sun, 5);
    // scene.add(helper);



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


    //orbitcontrols
    const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 15;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
    orbitControls.update();


    //load Model 
    let loader = new THREE.GLTFLoader();
    loader.load("/src/3D/antonwithanimations.glb", function (gltf) {
        gltf.scene.traverse(function (node) {

            if (node.isMesh) {
                node.castShadow = true;
            }

        });
        character = gltf;
        scene.add(gltf.scene);
        mixer = new THREE.AnimationMixer(gltf.scene);
        //[0] = idle1;
        //[1] = idle2;
        //[2] = walk;

        const crouch = mixer.clipAction(character.animations[0]);
        const idle1 = mixer.clipAction(character.animations[1]);
        const idle2 = mixer.clipAction(character.animations[2]);
        const run = mixer.clipAction(character.animations[3]);
        const jump = mixer.clipAction(character.animations[4]);
        const walk = mixer.clipAction(character.animations[5]);
        idle1.play();

        document.addEventListener("keydown", (e) => onKeyDown(e), false);

        function onKeyDown(event) {
            switch (event.keyCode) {
                case 87: //w
                    mixer.stopAllAction();
                    walk.play();

                    break;
                case 65: //a

                    break;
                case 83: //s
                    mixer.stopAllAction();
                    idle1.play();
                    break;
                case 68: //d
                    moveforward = true;
                    break;
                case 32: // SPACE
                    mixer.stopAllAction();
                    jump.setLoop(THREE.LoopOnce, 1);
                    jump.play();
                    idle1.play();
                    break;
                case 16: // SHIFT
                    mixer.stopAllAction();
                    run.play();
                    break;
            }
        }

        document.addEventListener("keyup", (e) => onKeyUp(e), false);

        function onKeyUp(event) {
            switch (event.keyCode) {
                case 87: //w

                    idle1.play();
                    break;
                case 65: //a
                    idle1.play();
                    break;
                case 83: //s
                    idle1.play();
                    break;
                case 68: //d
                    idle1.play();
                    break;
            }
        }


    });
}


//keyevents 







//Animation

function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();

    if (mixer) mixer.update(delta);

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