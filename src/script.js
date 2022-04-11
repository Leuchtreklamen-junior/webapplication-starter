let container = document.querySelector(".scene");
let camera, renderer, scene, clock, mixer, character;
let debug = true;


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
        color: 0xffffff
    });

    const planegeometry = new THREE.PlaneGeometry(100, 100, 1);
    const floor = new THREE.Mesh(planegeometry, planeMaterial);

    floor.castShadow = false;
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);


    //light 

    //AMBIENT

    // const ambient = new THREE.AmbientLight(0xf2edd5, 0.2);
    // scene.add(ambient);

    //POINTLIGHT

    const plight = new THREE.PointLight(0x8f9eff, 2);
    plight.position.set(-0.8, 1.7, 0.6);
    plight.castShadow = false;
    

    const plight2 = new THREE.PointLight(0x8f9eff, 2);
    plight2.position.set(0.8, 1.7, 0.6);
    plight2.castShadow = false;
    


    //HEMISSPHERELIGHT

    const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    //scene.add(light);

    //sun

    const sun = new THREE.DirectionalLight(0xffffff, 0.5);
    sun.position.set(2, 10, 1);
    sun.target.position.set(0, 0, 0);
    sun.castShadow = true;

    
    scene.add(sun.target);

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


    scene.add(plight);
    scene.add(plight2);
    scene.add(sun);
    scene.add(spotLight);
    scene.add(spotLight2);

    //lighthelper

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);

    const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);

    const sphereSize = 10;
    const hemissphereLightHelper = new THREE.HemisphereLightHelper(light, sphereSize);

    const helper = new THREE.DirectionalLightHelper(sun, 5);

    const sphereSizePoint = 0.1;
    const pointLightHelper = new THREE.PointLightHelper(plight, sphereSizePoint);
    const pointLightHelper2 = new THREE.PointLightHelper(plight2, sphereSizePoint);


    if (debug) {
        scene.add(spotLightHelper);
        scene.add(spotLightHelper2);
        scene.add(hemissphereLightHelper);
        scene.add(helper);
        scene.add(pointLightHelper);
        scene.add(pointLightHelper2);
    }



    //fog

    scene.fog = new THREE.Fog(0x000000, 1, 15);

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
    orbitControls.minDistance = 2;
    orbitControls.maxDistance = 10;
    orbitControls.enablePan = false;
    orbitControls.target.set(0, 1.3, 0);
    orbitControls.maxPolarAngle = Math.PI / 2 + 0.1;
    orbitControls.update();


    //load Model 
    let loader = new THREE.GLTFLoader();
    loader.load("/src/3D/anton.glb", function (gltf) {
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            const model = gltf.scene;
            model.position.set(-.5, 0, 0);
            character = gltf;
            scene.add(gltf.scene);
            mixer = new THREE.AnimationMixer(gltf.scene);

            if (debug) {
                const skeletonhelper = new THREE.SkeletonHelper(character.scene);
                scene.add(skeletonhelper);
            }

            const idle1 = mixer.clipAction(character.animations[0]);
            const dance = mixer.clipAction(character.animations[1]);
            const walk = mixer.clipAction(character.animations[9]);


            idle1.play();

            // document.addEventListener("keydown", (e) => onKeyDown(e), false);
            // function onKeyDown(event) {
            //     switch (event.keyCode) {
            //         case 87: //w
            //             break;
            //         case 65: //a
            //             break;
            //         case 83: //s
            //             break;
            //         case 68: //d
            //            break;
            //         case 32: // SPACE
            //             break;
            //         case 16: // SHIFT
            //             break;
            //     }
            // }
            // document.addEventListener("keyup", (e) => onKeyUp(e), false);
            // function onKeyUp(event) {
            //     switch (event.keyCode) {
            //         case 87: //w
            //             break;
            //         case 65: //a
            //             break;
            //         case 83: //s
            //             break;
            //         case 68: //d
            //            break;
            //         case 32: // SPACE
            //             break;
            //         case 16: // SHIFT
            //             break;
            //     }
            // }


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

    loader.load("/src/3D/PeterTrenkle.glb", function (gltf) {
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            const model = gltf.scene;
            model.position.set(.5, 0, 0);
            character = gltf;
            scene.add(gltf.scene);
            if (debug) {
                const skeletonhelper = new THREE.SkeletonHelper(character.scene);
                scene.add(skeletonhelper);
            }

        },
        // onProgress callback
        function (xhr) {

            if ((xhr.loaded / xhr.total) == 1) {
                console.log("Peter " + 100 + '% loaded');
            };
        },

        // onError callback
        function (err) {
            console.error('Error Loading Peter');
        });
}

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