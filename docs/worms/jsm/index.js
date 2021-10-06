import * as THREE from '/jsm/three.module.js'
import { OrbitControls } from '/jsm/OrbitControls.js'
import { FBXLoader } from '/jsm/FBXLoader.js'
import { GLTFLoader } from '/jsm/GLTFLoader.js'
import Stats from '/jsm/stats.module.js'
import * as SKUTILS from '/jsm/SkeletonUtils.js'

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
let count = 15;
let worms = new Array(count);
const clock = new THREE.Clock();
let mixer = new THREE.AnimationMixer( scene ); // ORIGINAL
let originalAnimation;
let mixers = new Array(count);  // CLONES

const fbxLoader = new FBXLoader()
fbxLoader.load(
    'model/worm_dive.fbx',
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
                mixer.clipAction( child.animations[0]).play();
            }
        });

        // CLONES
        for ( let p = 0; p < count; p ++ ) {
            worms[p] = SKUTILS.clone(worm);
            scene.add(worms[p]);
            worms[p].position.set((Math.random()*2)-1, 0, Math.random()*-2);
            worms[p].rotation.y = Math.random()*6;
            worms[p].traverse(function (child) {
                if(child.name == "animatedGroup"){
                    child.animations[0] = originalAnimation.clone();
                    mixers[p] = new THREE.AnimationMixer( scene );
                    mixers[p].clipAction( child.animations[0] ).play();
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
const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {

    mixer.update(clock.getDelta()); // ORIGINAL

    for ( let p = 0; p < count; p ++ ) {
        //mixers[p]?.update(clock.getDelta()); // CLONES
    }

    controls.update()
    stats.update()
    render()
    requestAnimationFrame(animate)
}

function render() {
    renderer.render(scene, camera)
}