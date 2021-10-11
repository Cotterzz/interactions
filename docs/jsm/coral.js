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
camera.position.set(0.8, 1.4, 1.0)

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()

let coral;
let count = 100;
let corals = new Array(count);
let materials = new Array(count);
let spread = 20;
let minscale = 1;
let maxscale = 3;
let basescale = 0.01;

const fbxLoader = new FBXLoader()
fbxLoader.load(
urlprefix + 'coral/coral3.fbx',
    (object) => {
        
        coral = object;
        scene.add(coral);
        const bleachedColor = Math.random();
        const bleachedRGBColor = new THREE.Color( 1, bleachedColor, bleachedColor );

        var material = new THREE.MeshPhongMaterial( {
                                //map: imgTexture,
                                //bumpMap: imgTexture,
                                //bumpScale: bumpScale,
                                color: bleachedColor,
                                //specular: specularColor,
                                //reflectivity: beta,
                                //shininess: specularShininess,
                                //envMap: alphaIndex % 2 === 0 ? null : reflectionCube
                            } );
        coral.scale.set(basescale, basescale, basescale);
        coral.traverse(function (child) {
                if ( child instanceof THREE.Mesh ) {
                       console.log(child);

                       child.material = material;
                        
                    }
            
            });
        
        for ( let p = 0; p < count; p ++ ) {
            //corals[p] = SKUTILS.clone(coral);
            corals[p] = coral.clone();
            //console.log(corals[p])
            scene.add(corals[p]);
            corals[p].position.set((Math.random()*spread)-(spread/2), 0, Math.random()*(-spread));
            corals[p].rotation.y = Math.random()*6;
            let scale = minscale + (Math.random()*(maxscale-minscale));
            corals[p].scale.set(basescale*scale, basescale*scale, basescale*scale);
            materials[p] = new THREE.MeshPhongMaterial();
            materials[p].color = new THREE.Color( Math.random(), Math.random(), Math.random() );
            corals[p].traverse(function (child) {
               if(p==0){console.log(child);}
                if ( child instanceof THREE.Mesh ) {
                        
                        child.material = materials[p];
                        
                        
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
//const stats = Stats()
//document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    //stats.update()
}

function render() {
    renderer.render(scene, camera)
}

