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
camera.position.set(0, 4, 15)

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()

let container = new THREE.Mesh();
scene.add(container);
let count = 150;
let hspread  = 2;
let vspread  = 6;
let velocities = new Array(count);
let spins = new Array(count);
let molecules = new Array(count);
let animations = new Array(count);

let mixer;

const gLoader = new GLTFLoader().setPath( urlprefix );
gLoader.load(
    'co2/scene.glb',
    (object) => {
    	console.log(object);
        container.scale.set(.2, .2, .2);
        
        container.add(object.scenes[0]);
        
        for ( let p = 0; p < count; p ++ ) {
            molecules[p] = container.clone();
            velocities[p] = {x:0.05 - Math.random()*0.1, y:0.05 - Math.random()*0.1, z:0.05 - Math.random()*0.1};
            spins[p] = 0.05 + Math.random()*0.05;
            scene.add(molecules[p]);
            molecules[p].position.set((Math.random()*hspread*2)-hspread, (Math.random()*vspread*2)-vspread, (Math.random()*hspread*2)-hspread);
            molecules[p].rotation.y = Math.random()*6;
            
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

    for ( let p = 0; p < count; p ++ ) {
        molecules[p].rotation.y += spins[p];
        molecules[p].position.x += velocities[p].x;
        molecules[p].position.y += velocities[p].y;
        molecules[p].position.z += velocities[p].z;

        if(molecules[p].position.x>hspread){molecules[p].position.x=hspread; velocities[p].x = -velocities[p].x;}
        if(molecules[p].position.x<-hspread){molecules[p].position.x=-hspread; velocities[p].x = -velocities[p].x;}
        if(molecules[p].position.y>vspread){molecules[p].position.y=vspread; velocities[p].y = -velocities[p].y;}
        if(molecules[p].position.y<-vspread){molecules[p].position.y=-vspread; velocities[p].y = -velocities[p].y;}
        if(molecules[p].position.z>hspread){molecules[p].position.z=hspread; velocities[p].z = -velocities[p].z;}
        if(molecules[p].position.z<-hspread){molecules[p].position.z=-hspread; velocities[p].z = -velocities[p].z;}
    }

    requestAnimationFrame(animate)

    controls.update()

    render()

    //stats.update()
}

function render() {
    renderer.render(scene, camera)
}

