import * as THREE from '/jsm/three.module.js'
import { OrbitControls } from '/jsm/OrbitControls.js'
import { FBXLoader } from '/jsm/FBXLoader.js'
import { GLTFLoader } from '/jsm/GLTFLoader.js'
import Stats from '/jsm/stats.module.js'
import * as SKUTILS from '/jsm/SkeletonUtils.js'

const scene = new THREE.Scene()
//scene.add(new THREE.AxesHelper(5))

const light = new THREE.PointLight()
light.position.set(0.8, 1.4, 1.0)
scene.add(light)

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)
const cNear = 1;
const cFar = 100000;
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    cNear,
    cFar
)
camera.position.set(0.8, 1.4, 1.0)

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()

let container = new THREE.Mesh();
scene.add(container);
let count = 15;
let worms = new Array(count);
let animations = new Array(count)

let mixer;

const gLoader = new GLTFLoader().setPath( "model/" );
gLoader.load(
    'co2whole.gltf',
    (object) => {
    	console.log(object);
        //if ((child as THREE.Mesh).isMesh) {
        //         // (child as THREE.Mesh).material = material
        //         if ((child as THREE.Mesh).material) {
        //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
        //         }
            // }
        //});
        //object.scale.set(.1, .1, .1);
        
        
        container.add(object.scenes[0]);
        
        for ( let p = 0; p < count; p ++ ) {
            worms[p] = container.clone();
            scene.add(worms[p]);
            worms[p].position.set((Math.random()*5)-2.5, 0, Math.random()*-5);
            worms[p].rotation.y = Math.random()*6;
            
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
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

