let urlArray = window.location.href.split("/"); urlArray.pop();
let urlprefix = urlArray.join("/")  + "/";
globalThis.urlprefix = urlprefix;
console.log("URLPREFIX: " + urlprefix);

const THREE = await import(urlprefix + "jsm/three.module.js");
const { OrbitControls } = await import(urlprefix + "jsm/OrbitControls.js")
const { GLTFLoader } = await import(urlprefix + "jsm/GLTFLoader.js")
const { FBXLoader } = await import(urlprefix + "jsm/FBXLoader.js")
const  SKUTILS  = await import(urlprefix + "jsm/SkeletonUtils.js")
const Stats = await import(urlprefix + "jsm/stats.module.js")

const scene = new THREE.Scene()

const light = new THREE.PointLight()
light.position.set(0.8, 1.4, 1.0)
scene.add(light)

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const cNear = 1;
const cFar = 100000;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight,cNear,cFar);
camera.position.set(0, .5, 0)

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, -3)

let worm;
let count = 150;
let spread = 10;
let worms = new Array(count);
let speeds = new Array(count);
const clock = new THREE.Clock();
let mixer = new THREE.AnimationMixer( scene ); // ORIGINAL
let originalAnimation;
let mixers = new Array(count);  // CLONES

const fbxLoader = new FBXLoader()
fbxLoader.load(
    urlprefix + 'worms/worm_dive.fbx',
    (object) => {

        // ORIGINAL
        object.scale.set(.2, .2, .2);
        worm = object;
        scene.add(worm);
        worm.traverse(function (child) {
            if(child.animations.length>0){
                console.log(child);
                child.name = "animatedGroup";
                originalAnimation = child.animations[0];
                mixer = new THREE.AnimationMixer( worm );
                mixer.clipAction( child.animations[0]).play();
            }
        });

        // CLONES
        for ( let p = 0; p < count; p ++ ) {
            worms[p] = SKUTILS.clone(worm);
            speeds[p] = 0.5 + Math.random();
            scene.add(worms[p]);
            worms[p].position.set((Math.random()*spread)-(spread/2), 0, Math.random()*(-spread));
            worms[p].rotation.y = Math.random()*6;
            worms[p].traverse(function (child) {
                if(child.name == "animatedGroup"){
                    child.animations[0] = originalAnimation.clone();
                    mixers[p] = new THREE.AnimationMixer( worms[p] );
                    mixers[p].clipAction( originalAnimation.clone() ).play();
                }
            });
        }

        animate();
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

var tanFOV = Math.tan((Math.PI / 360) * camera.fov);
var windowHeight = window.innerHeight;
window.addEventListener('resize', onWindowResize, false);
function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));
    camera.updateProjectionMatrix();
    camera.lookAt(scene.position);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}
//const stats = new THREE.Stats()
//document.body.appendChild(stats.dom)

function animate() {

if(globalThis.action){
    const d = clock.getDelta();
    mixer.update(d); // ORIGINAL

    for ( let p = 0; p < count; p ++ ) {
        mixers[p].update(d*speeds[p]); // CLONES
    }
}
    controls.update()
    //stats.update()
    render()
    requestAnimationFrame(animate)
}

function render() {
    renderer.render(scene, camera)
}