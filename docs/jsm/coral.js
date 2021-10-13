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
camera.position.set(0, 8, 3);

    const near = 1;
    const far = 20;
    const color = 0x000033;
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2( 1, 1 );
document.addEventListener( 'mousemove', onMouseMove );
const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas3d"),antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight)


const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()
let heightmap;
let coral, coral2;
let coral2geo, coral2mat;
let count = 100;
let corals = new Array(count);
let colours = new Array(count);
let interacted = new Array(count)
let materials = new Array(count);
let spread = 20;
let minscale = 1;
let maxscale = 3;
let basescale = 0.01;
const fbxLoader = new FBXLoader();
const imageLoader = new THREE.TextureLoader();

var tanFOV = Math.tan((Math.PI / 360) * camera.fov);
var windowHeight = window.innerHeight;
window.addEventListener('resize', onWindowResize, false);

loadImage();

function loadImage(){
    imageLoader.load( urlprefix + 'coral/height.png',
    function ( image ) {
        heightmap = image;
        heightmap.wrapS = THREE.RepeatWrapping;
        heightmap.wrapT = THREE.RepeatWrapping;
        heightmap.repeat.set( 3, 3);
        coral2geo = new THREE.SphereGeometry(15, 128, 64);
        coral2mat = new THREE.MeshStandardMaterial( {
                                //map: imgTexture,
                                bumpMap: heightmap,
                                bumpScale: 10,
                                //color: bleachedColor,
                                //specular: specularColor,
                                //reflectivity: beta,
                                //displacementMap : heightmap,
                                //displacementScale : 1
                                //shininess: specularShininess,
                                //envMap: alphaIndex % 2 === 0 ? null : reflectionCube
                            } );
        coral2 = new THREE.Mesh(coral2geo,coral2mat);

        loadGeometry();
    }, null, null
    );
}

function loadGeometry(){
    fbxLoader.load(
        urlprefix + 'coral/coral3.fbx',
    (object) => {
        
        coral = object;
        //scene.add(coral);
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
            if(Math.random()>0.2){
                corals[p] = coral.clone();
                materials[p] = new THREE.MeshPhongMaterial();
                let scale = minscale + (Math.random()*(maxscale-minscale));
                corals[p].scale.set(basescale*scale, basescale*scale, basescale*scale);
            } else {
                corals[p] = coral2.clone();
                materials[p] = new THREE.MeshStandardMaterial( {
                                //map: imgTexture,
                                bumpMap: heightmap,
                                bumpScale: 1,
                                //color: bleachedColor,
                                //specular: specularColor,
                                //reflectivity: beta,
                                displacementMap : heightmap,
                                displacementScale : 2
                                //shininess: specularShininess,
                                //envMap: alphaIndex % 2 === 0 ? null : reflectionCube
                            } );
                let scale = minscale + (Math.random()*(maxscale-minscale)*2);
                corals[p].scale.set(basescale*scale, basescale*(minscale + (Math.random()*(maxscale-minscale))), basescale*scale);
            }
            
            //console.log(corals[p])
            scene.add(corals[p]);
            interacted[p] = false;
            corals[p].position.set((Math.random()*spread)-(spread/2), 0, (Math.random()*(-spread))+(spread/2));
            corals[p].rotation.y = Math.random()*6;
            
            
            colours[p] = new THREE.Color( Math.random(), Math.random(), Math.random() );
            let bleachedColorLevel = (colours[p].r + colours[p].g + colours[p].b)/3;
            materials[p].color = new THREE.Color(bleachedColorLevel, bleachedColorLevel, bleachedColorLevel );
            corals[p].traverse(function (child) {
               if(p==0){console.log(child);}
                if ( child instanceof THREE.Mesh ) {
                        child.coralID = p;
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
}

function onWindowResize(event) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));
        camera.updateProjectionMatrix();
        camera.lookAt(scene.position);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
}

function onMouseMove( event ) {

                event.preventDefault();

                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            }


function animate() {
    requestAnimationFrame(animate)

    controls.update()

                    raycaster.setFromCamera( mouse, camera );

                const intersection = raycaster.intersectObject( scene );

                if ( intersection.length > 0 ) {

                    //console.log(intersection[ 0 ].object.coralID);

                    interacted[intersection[ 0 ].object.coralID] = true;
                    //mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) );
                    //mesh.instanceColor.needsUpdate = true;

                }

    render()

   //if(globalThis.action){
       for ( let p = 0; p < count; p ++ ) {
        if(interacted[p]){
             materials[p].color.r = materials[p].color.r + (colours[p].r-materials[p].color.r)/100;
             materials[p].color.g = materials[p].color.g + (colours[p].g-materials[p].color.g)/100;
             materials[p].color.b = materials[p].color.b + (colours[p].b-materials[p].color.b)/100;          
        }

       }
   //}

    //stats.update()
}

function render() {
    renderer.render(scene, camera)
}

