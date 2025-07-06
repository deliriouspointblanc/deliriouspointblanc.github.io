import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, -5); // Changed to a positive Z to be in front of origin, often a good starting point

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = true; // <--- ENABLE CONTROLS HERE
controls.target.set(0, 0, 0); // Point controls at the origin, useful for starting view

const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

// Add axes helper for debugging scene origin
const sceneAxesHelper = new THREE.AxesHelper(5);
scene.add(sceneAxesHelper);

const loader = new GLTFLoader();

let mixer = null;
let action = null;
let animationDuration = 0;
let modelLoaded = false;
let clock = new THREE.Clock(); // <--- NEW: Initialize a clock for delta time

loader.load(
  '/assets/rubikscube_delirious_linear_6July.glb',
  (gltf) => {
    scene.add(gltf.scene);

    // --- DEBUGGING MODEL POSITION AND SCALE ---
    console.log("GLTF Scene Position:", gltf.scene.position);
    console.log("GLTF Scene Scale:", gltf.scene.scale);
    // Add axes helper to the model itself for local coordinates
    const modelAxesHelper = new THREE.AxesHelper(1); // Adjust size as needed
    gltf.scene.add(modelAxesHelper);
    // ------------------------------------------

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      action = mixer.clipAction(gltf.animations[0]);
      action.play(); // <--- IMPORTANT: Tell the action to play!

      animationDuration = gltf.animations[0].duration;
      console.log('Animation duration:', animationDuration);

      // No need to setTime(0) and update(0) here if you're letting it play naturally
      // action.play() handles starting from the beginning.

      modelLoaded = true;
      console.log('GLTF model and animation loaded successfully.');
    } else {
      console.warn('GLTF model has no animations or gltf.animations is empty.');
    }
  },
  undefined,
  (error) => {
    console.error('Error loading GLTF:', error);
  }
);

// Removed getScrollProgress as it's not needed for continuous playback

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // <--- NEW: Get time elapsed since last frame

  if (mixer) {
    mixer.update(delta); // <--- IMPORTANT: Update mixer with delta time
  }

  controls.update(); // <--- IMPORTANT: Keep controls updated for manual camera movement

  renderer.render(scene, camera);
}

animate();