// Lenis and GSAP setup (looks correct)
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Adjust camera position to be suitable for seeing the cube at its default scale
camera.position.set(0, 1, 10); // Start closer to ensure visibility

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
// renderer.setClearColor(0x000000, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true; // Corrected spelling
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Corrected spelling
renderer.toneMappingExposure = 1.5;
document.querySelector(".model").appendChild(renderer.domElement);

// Add lighting to model
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 10, 7.5);
mainLight.castShadow = true; // Enable shadows for main light
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 3);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.position.set(0, 25, 0);
scene.add(hemiLight);

// This basicAnimate is no longer needed as animate() takes over fully
// function basicAnimate() {
//   renderer.render(scene, camera);
//   requestAnimationFrame(basicAnimate);
// }
// basicAnimate(); // Don't call this initially

let model;
let mixer = null;
let action = null;
let clock = new THREE.Clock(); // Initialize a clock for delta time
// No need for animationPlayedInitial if animation always loops

const loader = new THREE.GLTFLoader();
loader.load(
  "./assets/rubikscube_delirious_linear_6July.glb",
  function (gltf) {
    model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh) {
        if (node.material) {
          // Robust material handling: check if it's an array or single material
          if (Array.isArray(node.material)) {
            node.material.forEach(mat => {
              if (mat.isMeshStandardMaterial) { // Ensure it's a standard material for PBR props
                mat.metalness = 0.3;
                mat.roughness = 0.4;
                mat.envMapIntensity = 1.0;
              }
            });
          } else if (node.material.isMeshStandardMaterial) {
            node.material.metalness = 0.3;
            node.material.roughness = 0.4;
            node.material.envMapIntensity = 1.0;
          }
        }
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      action = mixer.clipAction(gltf.animations[0]);
      action.play(); // Play the animation immediately
      action.paused = true; // BUT immediately pause it until scale is done
      console.log("GLB Animation Loaded and Playing.");
    } else {
      console.warn("GLTF model has no animations or gltf.animations is empty.");
    }

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    scene.add(model);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 1.5;

    // Start with the model visible (scaled to 1,1,1) if you want it to always be seen
    // If you still want the GSAP scale-in, then keep model.scale.set(0,0,0) here,
    // but the GLB animation will run even when invisible.
    model.scale.set(0, 0, 0); // Set to full size so it's always visible by default

    // Don't call playInitialAnimation here if you want it to always be visible
    // and the GLB animation to always loop.
    // If you want GSAP scale-in to happen, keep it, but understand GLB animation starts with it.
    playInitialAnimation();

    // cancelAnimationFrame(basicAnimate); // Not needed anymore
    animate(); // Start the main animation loop
  },
  undefined,
  (error) => {
    console.error('Error loading GLTF:', error);
  }
);

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 0.9,
      y: 0.9,
      z: 0.9,
      duration: 1.5,
      ease: "power2.out",
      onComplete: () => {
        // ONLY start GLB animation AFTER scale is complete
        if (action) {
          action.paused = false; // Unpause the GLB animation
          console.log("Model scaled to 1,1,1. GLB Animation now playing.");
        }
      }
    });
  }
  // This GSAP tween is related to your UI, not directly the 3D model
  gsap.to(scanContainer, {
    scale: 1,
    duration: 1,
    ease: "power2.out",
  });
}

const floatAmplitude = 0.2;
const floatSpeed = 1.5;
const rotationSpeed = 0.3;
let isFloating = true; // Model will always float
let currentScroll = 0;

const stickyHeight = window.innerHeight;
const scannerSection = document.querySelector(".scanner");
const scannerPosition = scannerSection ? scannerSection.offsetTop : 0; // Handle case where scannerSection might not be found
const scanContainer = document.querySelector(".scan-container");
//Add sfx when I get the chance
// const scanSound = new Audio("./assets//")
gsap.set(scanContainer, { scale: 0 }); // This is for ScrollTrigger control

// --- IMPORTANT: Comment out or remove these ScrollTriggers if you want the animation to *always* loop and ignore scroll scale/visibility ---
// If you want the GLB animation to always loop, but the model to still scale/rotate
// via GSAP ScrollTriggers, then keep the ScrollTriggers and GLB animation will
// play even when the model is scaled to 0.

// //Scale model to 1 for 1 second
ScrollTrigger.create({
  trigger: "body",
  start: "top-top",
  end: "top -10",
  onEnterBack: () => {
    if (model) {
      gsap.to(model.scale, {
        x: 0.9,
        y: 0.9,
        z: 0.9,
        duration: 1,
        ease: "power2.out",
      });
      isFloating = true;
      gsap.to(scanContainer, {
        scale: 1,
        duration: 1,
        ease: "power2.out"
      });
    }
  }
});

//Rotate model 360 degree, then scale to 0,
// after scale container to 0
ScrollTrigger.create({
  trigger: ".scanner",
  start: "top top",
  end: `${stickyHeight}px`,
  pin: true,
  onEnter: () => {
    if (model && action) { // Corrected 'act' to 'action' here
      isFloating = false;
      model.position.y = 0;

      setTimeout(() => {
        //scanSound play
      });
      // Ensure GLB animation continues or restarts if needed here
      // if (action.paused) { // This conditional is removed if animation always loops
      //   action.play();
      //   console.log("GLB Animation Resumed (scanner)");
      // }
      gsap.to(model.rotation, {
        y: model.rotation.y + Math.PI * 2,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(model.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              gsap.to(scanContainer, {
                scale: 0,
                duration: 0.5,
                ease: "power2.in",
              });
            }
          });
        },
      });
    }
  },
  onLeaveBack: () => {
    gsap.set(scanContainer, { scale: 0 });
    gsap.to(scanContainer, {
      scale: 1,
      duration: 1,
      ease: "power2.out",
    });
  },
});

//Setup event handler for scrolling with lenis
lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

function animate() {
  const delta = clock.getDelta(); // Get time elapsed since last frame

  // Mixer always updates as we want animation to loop continuously
  if (mixer) { // Only need to check if mixer exists, not if action is paused
    const animSpeed = 0.25;
    mixer.update(delta * animSpeed);
  }

  if (model) {
    if (isFloating) {
      const floatOffset =
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = floatOffset;
    }

    const scrollProgress = Math.min(currentScroll / scannerPosition, 1);
    if (scrollProgress < 1) {

    model.rotation.x = scrollProgress * Math.PI * 2;

    }

    if (scrollProgress < 1) {

    model.rotation.y -= 0.01 * rotationSpeed;

    }

    // These rotations will now always apply on top of the GLB animation
    // if `model.scale` is not 0 due to ScrollTriggers.
    // If you want these to only happen when the model is fully visible,
    // you might need to manage them with flags/ScrollTriggers too.
    // For now, they'll always apply if the model exists.
    model.rotation.y -= 0.01 * rotationSpeed; // Continuous rotation
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}