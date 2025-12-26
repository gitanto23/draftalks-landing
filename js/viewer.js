import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// === Canvas & loading ===
const canvas = document.getElementById("arch-viewer");
const loading = document.getElementById("loading");

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Camera ===
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

// === Luci (editoriali, neutre) ===
const ambient = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(5, 10, 7);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-6, 4, -4);
scene.add(fillLight);

// === Controlli ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 200;

// === Loader ===
const loader = new GLTFLoader();

// parametro URL
const params = new URLSearchParams(window.location.search);
const modelName = params.get("model") || "progetto";
const modelPath = `./${modelName}.glb`;

loader.load(
  modelPath,
  (gltf) => {
    const model = gltf.scene;

    // === MATERIALE MONOCROMO FORZATO ===
    const monoMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3f3f3,
      roughness: 0.85,
      metalness: 0.0,
      vertexColors: false
    });

    model.traverse((child) => {
      if (child.isMesh) {
        child.material = monoMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    scene.add(model);

    // === Fit camera ===
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    camera.position.set(
      center.x + maxDim * 1.4,
      center.y + maxDim * 1.1,
      center.z + maxDim * 1.4
    );
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();

    loading.classList.add("hidden");
  },
  undefined,
  (err) => {
    console.error("Errore GLB:", err);
    loading.innerHTML = "<span>Errore nel caricamento del modello</span>";
  }
);

// === Resize ===
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// === Loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,
