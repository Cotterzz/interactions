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

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0.8, 1.4, 1.0)

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()

let worm;
let count = 15;
let worms = new Array(count);
let animations = new Array(count)

let mixer;

const fbxLoader = new FBXLoader()
fbxLoader.load(
    'worm_dive.fbx',
//const gltfLoader = new GLTFLoader()
//gltfLoader.load(
    //'worm_dive.gltf',
    (object) => {

        //if ((child as THREE.Mesh).isMesh) {
        //         // (child as THREE.Mesh).material = material
        //         if ((child as THREE.Mesh).material) {
        //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
        //         }
            // }
        //});
        object.scale.set(.1, .1, .1);
        
        worm = object;
        scene.add(worm);
        worm.traverse(function (child) {
                
            if(child.animations.length>0){
                console.log(child);
                mixer = new THREE.AnimationMixer( child );
                //console.log(child);
                //animations[p] = child.animations[0];
                mixer.clipAction( child.animations[0]).play();
            }
            });
        
        //duplicateObject();
        for ( let p = 0; p < count; p ++ ) {
            worms[p] = SKUTILS.clone(worm);
            //console.log(worms[p])
            scene.add(worms[p]);
            worms[p].position.set((Math.random()*5)-2.5, 0, Math.random()*-5);
            worms[p].rotation.y = Math.random()*6;
            
            worms[p].traverse(function (child) {
               //console.log(child);
                if(child.animations.length>0){

                    //console.log(child);
                    animations[p] = child.animations[0];
                    mixer.clipAction( child.animations[0] ).play();
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
    requestAnimationFrame(animate)

    controls.update()

    mixer.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

