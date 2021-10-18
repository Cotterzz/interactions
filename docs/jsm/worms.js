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
camera.position.set(0, 5, 5)

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, -3)

let worm;
let focusedWorm;
let count = 20;
let spread = 7;
let worms = new Array(count);
let speeds = new Array(count);
let actions = new Array(count);
const clock = new THREE.Clock();
let mixer = new THREE.AnimationMixer( scene ); // ORIGINAL
let originalAnimation;
let mixers = new Array(count);  // CLONES

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2( 1, 1 );
document.addEventListener( 'mousemove', onMouseMove );

const geometry = new THREE.PlaneGeometry( spread*1.3, spread*1.3 );
const material = new THREE.MeshBasicMaterial( {color: 0x442211, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
plane.rotation.x = 1.57;
plane.position.z = spread/-2;
scene.add( plane );

const fbxLoader = new FBXLoader()
fbxLoader.load(
    urlprefix + 'worms/worm_dive.fbx',
    (object) => {

        // ORIGINAL

        worm = object;
        
        console.log(worm);
        //scene.add(worm);
        worm.scale.set(.5, .5, .5);
        worm.traverse(function (child) {
            if(child.animations.length>0){
               // console.log(child);
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
                    child.wormID = p;
                    actions[p] = mixers[p].clipAction( originalAnimation.clone() );
                    actions[p].clampWhenFinished = true;
                    actions[p].loop = THREE.LoopOnce;
                    //actions[p].play();
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
    focusedWorm = -1;
    raycaster.setFromCamera( mouse, camera );
    const intersection = raycaster.intersectObject( scene );
    if ( intersection.length > 0 ) {
        if(typeof (intersection[ 0 ].object.parent.wormID)=="number"){

            focusedWorm=intersection[ 0 ].object.parent.wormID;
            actions[focusedWorm].play();
        }
        else{
            //console.log(intersection[ 0 ].object);
        }
    }

    //if(focusedWorm>-1){
        const d = clock.getDelta();
        //mixer.update(d); // ORIGINAL

        for ( let p = 0; p < count; p ++ ) {
          mixers[p].update(d*speeds[p]); // CLONES
          
        }
        //mixers[focusedWorm].update(d*speeds[focusedWorm]);
    //}
    controls.update()
    //stats.update()
    render()
    requestAnimationFrame(animate)
}

function onMouseMove( event ) {

                event.preventDefault();

                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            }

function render() {
    renderer.render(scene, camera)

    
}