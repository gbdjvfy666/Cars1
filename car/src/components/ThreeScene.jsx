import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as TWEEN from '@tweenjs/tween.js';

// ПУТИ К ФАЙЛАМ (Предполагается, что они находятся в ../assets/)
import NSBH_3d_logo from '../assets/NSBH_4d_logo.glb';
import Photo_Chizra from '../assets/1.png'; // Флакон 1
import Photo_Velora from '../assets/2.png'; // Флакон 2
import Photo_Skaarj from '../assets/3.png'; // Флакон 3
import Photo_Vortex from '../assets/4.png'; // Флакон 4

// Массив путей для загрузки в атлас (важен порядок!)
const logoFiles = [Photo_Chizra, Photo_Velora, Photo_Skaarj, Photo_Vortex];

// Шейдер для шума (оставлен чистым)
const noiseShader = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;
  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 
  return p;
}
float snoise(vec4 v){
  const vec2 C = vec2( 0.138196601125010504, 0.309016994374947451);
  vec4 i = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v - i + dot(i, C.xxxx);
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
            i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4) ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
            + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}`;

const fragrances = [
    {name: "Chizra", color: 220, description: "The Nali God of Water.<br><br>Feel the wet freshness."},
    {name: "Velora", color: 160, description: "Meet the Stone Giant.<br><br>Breathe the scent of ancient pass."},
    {name: "Skaarj", color: 40, description: "Fast. Rageous.<br><br>Embrace the smell of sharpen steel."},
    {name: "Vortex", color: 340, description: "Vortex Rikers.<br><br>You don't forget the air of danger."}
];

const ThreeScene = () => {
    const mountRef = useRef(null);
    const [popup, setPopup] = useState({ visible: false, text: '' });
    const [bottleController, setBottleController] = useState(null);

    useEffect(() => {
        let animationFrameId;
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        const mu = THREE.MathUtils;
        const simplex = new SimplexNoise();
        
        THREE.ShaderChunk['transmission_fragment'] = THREE.ShaderChunk['transmission_fragment'].replace(
            `material.attenuationColor = attenuationColor;`,
            `material.attenuationColor = diffuseColor.rgb;`
        );
        
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const roomEnv = new RoomEnvironment(renderer);
        const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        scene.environment = envMap;
        
        camera.position.set(0, 3.5, 12);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 3.5, 0);
        controls.enableDamping = true;
        controls.minPolarAngle = controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 7;
        controls.maxDistance = 12;
        controls.enablePan = false;
        controls.enableZoom = false; 
        
        const light = new THREE.DirectionalLight(0xffffff, Math.PI * 1.75);
        light.position.set(0.5, 1, 1).setLength(50);
        scene.add(light, new THREE.AmbientLight(0xffffff, Math.PI * 0.25));

        const gu = { time: { value: 0 } };
        let uModel, bottle;

        const init = async () => {
            const textureLoader = new THREE.TextureLoader();
            const loadedLogos = await Promise.all(
                logoFiles.map(file => textureLoader.loadAsync(file))
            );
            
            const nameTexture = (() => {
                const c = document.createElement("canvas"); 
                c.width = 512; 
                c.height = 2048;
                const ctx = c.getContext("2d");
                const singleHeight = c.height / fragrances.length;
                loadedLogos.forEach((logoTexture, i) => {
                    ctx.drawImage(logoTexture.image, 0, i * singleHeight, c.width, singleHeight);
                });
                const tex = new THREE.CanvasTexture(c);
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                return tex;
            })();

            class BottleGeometry extends THREE.BufferGeometry {
                constructor(){ const t=7,e=1,i=t*2/3,o=t/3,n=.05;super().copy(mergeGeometries([new THREE.CylinderGeometry(e,e,i,3,1).translate(0,.5*i,0),new THREE.CylinderGeometry(.75*e,.75*e,n,3,1).translate(0,i+.5*n,0),new THREE.CylinderGeometry(e,e,o,3,1).translate(0,t-.5*o+n,0)])).rotateY(-.5*Math.PI)}
            }

            class Bottle extends THREE.InstancedMesh {
                constructor(){
                    const g = new BottleGeometry();
                    const m = new THREE.MeshPhysicalMaterial({
                        forceSinglePass: true, side: THREE.DoubleSide, metalness: 0, roughness: .75, ior: 1.75, thickness: 4, transmission: 1, dispersion: 5, attenuationDistance: 3,
                        onBeforeCompile: shader => {
                            shader.uniforms.time = gu.time;
                            shader.uniforms.texNames = { value: nameTexture };
                            
                            shader.vertexShader = `
                                varying vec3 vPos;
                                varying vec2 vUv;
                                varying float vIID;
                                ${shader.vertexShader}
                            `.replace(
                                `#include <begin_vertex>`,
                                `#include <begin_vertex>\n vPos = position;\n vUv = uv;\n vIID = float(gl_InstanceID);`
                            );
                            
                            shader.fragmentShader = `
                                uniform float time;
                                uniform sampler2D texNames;
                                varying vec3 vPos;
                                varying vec2 vUv;
                                varying float vIID;
                                ${noiseShader}
                                ${shader.fragmentShader}
                            `;
                            
                            shader.fragmentShader = shader.fragmentShader.replace(
                                '#include <logdepthbuf_fragment>',
                                `
                                #include <logdepthbuf_fragment>
                                
                                float iID = floor(vIID + 0.1);
                                float t = time * 0.5;

                                float bfNoise = snoise(vec4(vPos - vec3(0.0, t + iID * 100.0, 0.0), t));
                                bfNoise = pow(abs(bfNoise), 0.875);
                                bfNoise = 1.0 - bfNoise;
                                bfNoise *= 1.0 - smoothstep(0.0, 3.5, vPos.y);

                                vec2 nameUV = vec2((vUv.x - 0.5) * 3.0 + 0.5, (3.5 - vPos.y) * -3.5 * 0.5 + 0.5);
                                vec2 finalUV = vec2(nameUV.x, (iID + nameUV.y) * 0.25);
                                vec4 photoTexture = texture(texNames, finalUV);
                                
                                vec2 absNameUV = abs(nameUV - 0.5);
                                float limitF = 1.0 - step(0.5, max(absNameUV.x, absNameUV.y));
                                float photoAlpha = photoTexture.a * limitF;
                                `
                            );
                            
                            shader.fragmentShader = shader.fragmentShader.replace(
                                'float transmission = material.transmission;',
                                'float transmission = material.transmission; transmission *= (1.0 - photoAlpha);'
                            );

                            shader.fragmentShader = shader.fragmentShader.replace(
                                '#include <color_fragment>',
                                `#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, photoTexture.rgb, photoAlpha);`
                            );

                            // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
                            shader.fragmentShader = shader.fragmentShader.replace(
                                '#include <roughnessmap_fragment>',
                                `
                                // Сначала объявляем переменную, как в оригинальном шейдере
                                float roughnessFactor = roughness; 

                                // Теперь мы можем её безопасно изменять
                                float lidHeight = 7.0 * 2.0 / 3.0;
                                float fHeight = smoothstep(lidHeight - 0.5, lidHeight + 0.5, vPos.y);
                                roughnessFactor *= fHeight;
                                float glassRoughness = max(roughnessFactor, bfNoise * roughness);
                                roughnessFactor = mix(glassRoughness, 1.0, photoAlpha);
                                `
                            );
                        }
                    });
                    super(g, m, fragrances.length);
                    this.fragrances = fragrances; this.proxy = []; this.rotationSpeed = 1; this.proxyDistance = 3.5; this.totalTime = 0; this.floating = 0;
                    for(let i=0; i<fragrances.length; i++){
                        const dummy = new THREE.Object3D(); dummy.updateMatrix(); this.setMatrixAt(i, dummy.matrix);
                        this.setColorAt(i, new THREE.Color().setHSL(fragrances[i].color/360, .9875, .5)); this.proxy.push(dummy);
                    }
                }
                update(time){ const t=this.totalTime+=time*this.rotationSpeed;this.floating+=.5*time;const e=(2*Math.PI)/this.proxy.length;this.proxy.forEach((i,o)=>{const n=e*o-.1*Math.PI*t;i.position.set(Math.cos(n)*this.proxyDistance,0,Math.sin(n)*this.proxyDistance);const a=simplex.noise(o,this.floating);i.position.y=.5*a,i.rotation.y=-n,i.updateMatrix(),this.setMatrixAt(o,i.matrix)}),this.instanceMatrix.needsUpdate=!0}
            }
            
            class BottleController {
                constructor(b,c,s,h){this.bottle=b;this.controls=c;this.showPopup=s;this.hidePopup=h;this.pointer=new THREE.Vector2;this.raycaster=new THREE.Raycaster;this.intersects=[];this.minDistance=7;this.maxDistance=12;this.fadeOutDir=new THREE.Vector3}
                fadeIn(e){const t=currentMount.getBoundingClientRect();this.pointer.x=(e.clientX-t.left)/currentMount.clientWidth*2-1,this.pointer.y=-(e.clientY-t.top)/currentMount.clientHeight*2+1,this.raycaster.setFromCamera(this.pointer,camera),this.intersects=this.raycaster.intersectObject(this.bottle),this.intersects.length>0&&(this.bottle.rotationSpeed=0,this.controlsOn(!1),this.showPopup(this.bottle.fragrances[this.intersects[0].instanceId].description),this.fadeOutDir.copy(this.bottle.proxy[this.intersects[0].instanceId].position.clone().setY(0).normalize()),new TWEEN.Tween({val:0}).to({val:1},this.fadeOutDir.angleTo(this.controls.object.position.clone().setY(0).normalize())/(.5*Math.PI)*1e3).easing(TWEEN.Easing.Cubic.InOut).onUpdate(t=>{const e=mu.lerp(this.controls.getDistance(),this.minDistance,t.val);this.controls.object.position.copy(this.controls.object.position.clone().setY(0).normalize()).applyAxisAngle(this.fadeOutDir.clone().cross(this.controls.object.position.clone().setY(0).normalize()).normalize().negate(),this.fadeOutDir.angleTo(this.controls.object.position.clone().setY(0).normalize())*t.val).setLength(e).add(this.controls.target),this.controls.object.lookAt(this.controls.target)}).start())}
                fadeOut(){this.hidePopup(),new TWEEN.Tween({val:0}).to({val:1},1e3).easing(TWEEN.Easing.Cubic.InOut).onUpdate(t=>{this.controls.object.position.copy(this.fadeOutDir).setLength(mu.lerp(this.minDistance,this.maxDistance,t.val)).add(this.controls.target),this.bottle.rotationSpeed=t.val}).onComplete(()=>this.controlsOn(!0)).start()}
                controlsOn(t){this.controls.enableZoom=t,this.controls.enableDamping=t,this.controls.enableRotate=t}
            }
            
            const MODEL_SCALE = 1.0; 
            
            const gltf = await new GLTFLoader().loadAsync(NSBH_3d_logo); 
            let modelMesh = null;
            gltf.scene.traverse((child) => {
                if (child.isMesh && modelMesh === null) {
                    modelMesh = child;
                }
            });

            if (modelMesh) {
                class MyLogoModel extends THREE.Object3D {
                    constructor() { 
                        super(); 
                        modelMesh.geometry.computeVertexNormals();
                        modelMesh.geometry.scale(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
                        modelMesh.geometry.center(); 
                        modelMesh.rotation.x = Math.PI * 0.5;
                        modelMesh.material = new THREE.MeshStandardMaterial({ 
                            color: new THREE.Color(0x333333), 
                            roughness: .2, 
                            metalness: 1, 
                            envMap 
                        }); 
                        this.model = modelMesh; 
                        this.add(modelMesh); 
                    }
                    update(t) { 
                        this.model.rotation.z += 0.005; 
                    }
                }
                uModel = new MyLogoModel();
                uModel.position.set(-0.8, 3.5, 0.8);
                scene.add(uModel);
            } else {
                console.error("Не удалось найти Mesh-объект в загруженной GLB-модели.");
            }

            bottle = new Bottle();
            scene.add(bottle);

            const controller = new BottleController(bottle, controls, 
                (text) => setPopup({ visible: true, text }),
                () => setPopup({ visible: false, text: '' })
            );
            setBottleController(controller);
            
            currentMount.addEventListener("dblclick", controller.fadeIn.bind(controller));

            const clock = new THREE.Clock();
            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                let dt = Math.min(clock.getDelta(), 1/30);
                gu.time.value += dt;
                TWEEN.update();
                controls.update();
                
                if (uModel) uModel.update(gu.time.value * 0.5); 
                if (bottle) bottle.update(dt * 0.25);
                
                renderer.render(scene, camera);
            };
            animate();
        };

        init().catch(console.error);

        const handleResize = () => {
            if(currentMount){
                camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (bottleController && currentMount) {
                currentMount.removeEventListener("dblclick", bottleController.fadeIn.bind(bottleController));
            }
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div style={styles.wrapper}>
            <div ref={mountRef} style={styles.mount} />
            {popup.visible && (
                <div style={styles.container}>
                    <button 
                        style={styles.btnClose} 
                        onClick={() => { if (bottleController) bottleController.fadeOut(); }}
                    >
                        X
                    </button>
                    <span dangerouslySetInnerHTML={{ __html: popup.text }}></span>
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: { width: '100%', height: '600px', position: 'relative', overflow: 'hidden', fontFamily: '"Orbitron", sans-serif' },
    mount: { width: '100%', height: '100%' },
    container: { display: 'block', position: 'absolute', bottom: '5vh', left: '50%', transform: 'translate(-50%, 0)', height: '17vh', aspectRatio: '3 / 1', background: 'rgba(0, 0, 0, 0.5)', clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)', padding: '5vh 10vh', color: 'white', fontOpticalSizing: 'auto', fontStyle: 'normal', fontSize: '3.5vh', boxSizing: 'border-box' },
    btnClose: { position: 'absolute', width: '5vh', height: '5vh', top: '0.5vh', right: '3vh', border: '0.25vh solid white', borderRadius: '1vh', background: 'transparent', color: 'white', padding: 0, fontFamily: '"Orbitron", sans-serif', fontOpticalSizing: 'auto', fontStyle: 'normal', fontSize: '4vh', cursor: 'pointer' },
};

export default ThreeScene;