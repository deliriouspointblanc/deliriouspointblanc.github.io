import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js?module';
import { GLTFLoader } from 'https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js?module';

document.body.style.backgroundColor = '#123456';

const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x123456);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loader = new GLTFLoader();

let mixer;
const clock = new THREE.Clock();

loader.load(
  'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
  (gltf) => {
    scene.add(gltf.scene);
  },
  undefined,
  (error) => {
    console.error(error);
  }
);


// loader.load(
//   'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
//   (gltf) => {
//     const model = gltf.scene;
//     model.scale.set(1, 1, 1);
//     scene.add(model);

//     if (gltf.animations.length > 0) {
//       mixer = new THREE.AnimationMixer(model);
//       gltf.animations.forEach((clip) => {
//         mixer.clipAction(clip).play();
//       });
//     }
//   },
//   undefined,
//   (error) => {
//     console.error('Error loading GLB:', error);
//   }
// );

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
