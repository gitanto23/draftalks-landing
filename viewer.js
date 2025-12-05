import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.165.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js";

// DOM
const container = document.getElementById("viewer-container");
const canvas = document.getElementById("arch-viewer");
const loadingOverlay = document.getElementById("loading");

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  500
);
camera.position.set(10, 12, 14);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.9;
controls.zoomSpeed = 0.9;
controls.target.set(0, 0, 0);

// Luci “architettoniche” semplici
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdddddd, 0.7);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(8, 16, 10);
dirLight.castShadow = false;
scene.add(dirLight);

// Utility: leggi parametro ?model=
function getModelName() {
  const params = new URLSearchParams(window.location.search);
  return params.get("model") || "progetto";
}

const modelName = getModelName();
const modelPath = `/models/${modelName}.glb`;

// Loader
const loader = new GLTFLoader();

loader.load(
  modelPath,
  (gltf) => {
    const model = gltf.scene;

    // Clay material quasi nero
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.85,
          metalness: 0.0
        });
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    // Centra e scala automaticamente
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // porta il centro del modello in (0,0,0)
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    // Scala per avere dimensione "comoda" nella scena
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 10; // scala "scenica"
    const scale = desiredSize / maxDim;
    model.scale.setScalar(scale);

    scene.add(model);

    // Adatta camera e controls
    const dist = desiredSize * 2.2;
    camera.position.set(dist, dist * 0.8, dist);
    controls.target.set(0, 0, 0);
    controls.update();

    // Nascondi preloader
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }
  },
  (xhr) => {
    // potresti usare xhr.loaded / xhr.total per una percentuale
    // ma non è obbligatorio
  },
  (error) => {
    console.error("Errore nel caricamento del modello:", error);
    if (loadingOverlay) {
      loadingOverlay.querySelector(".loading-inner span:last-child").textContent =
        "Errore nel caricamento";
    }
  }
);

// Resize
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
