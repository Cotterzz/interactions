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
camera.position.set(1, -1, 4.0);
camera.lookAt(scene.position)

    const near = 1;
    const far = 5;
    const color = 0x000033;
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()
let spread = 1;
let container = new THREE.Mesh();
//scene.add(container);
let count = 150;
let fish = new Array(count);
let directions = new Array(count);
let speeds = new Array(count);

let mixer;

const gLoader = new GLTFLoader().setPath( urlprefix );
gLoader.load(
    'fish/fish.glb',
    (object) => {
    	console.log(object);
        //if ((child as THREE.Mesh).isMesh) {
        //         // (child as THREE.Mesh).material = material
        //         if ((child as THREE.Mesh).material) {
        //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
        //         }
            // }
        //});
        //container.scale.set(.2, .2, .2);
        
        
        container.add(object.scenes[0]);
        
        for ( let p = 0; p < count; p ++ ) {
            fish[p] = container.clone();
            scene.add(fish[p]);
            fish[p].position.set((Math.random()*spread)-(spread/2),  Math.random()*-spread, Math.random()*-spread);
            fish[p].rotation.y = Math.random()*6;
            directions[p] = fish[p].rotation.y;
            speeds[p] = 0.01 + Math.random()/100;
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
///const stats = Stats()
//document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    for ( let p = 0; p < count; p ++ ) {
        let vx = speeds[p] * Math.cos( directions[p]);
        let vz = speeds[p] * Math.sin( directions[p]);
        fish[p].position.x -= vx;
        fish[p].position.z += vz;
        if(container.position.distanceTo(fish[p].position)>3){
            directions[p] +=3.1;
            
        }
        directions[p] += (0.05 - Math.random()/10);
        fish[p].rotation.y = directions[p];
    }

    //stats.update()
}

function render() {
    renderer.render(scene, camera)
}

