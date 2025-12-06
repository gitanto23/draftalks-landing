// Import Three.js modules from CDN (più affidabile per GitHub Pages)
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/loaders/GLTFLoader.js";

// === Canvas e loading ===
const canvas = document.getElementById("arch-viewer");
const loading = document.getElementById("loading");

// === Scene, Camera, Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(4, 4, 4);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// === Luci ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// === Controlli Orbit ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Loader GLTF ===
const loader = new GLTFLoader();

const urlParams = new URLSearchParams(window.location.search);
const modelName = urlParams.get("model") || "progetto";

const modelPath = `./models/${modelName}.glb`;

loader.load(
    modelPath,
    (gltf) => {
        const model = gltf.scene;
        model.rotation.y = Math.PI;
        scene.add(model);

        // Fit camera al modello
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        camera.position.set(center.x + maxDim * 1.5, center.y + maxDim * 1.2, center.z + maxDim * 1.5);
        camera.lookAt(center);

        loading.classList.add("hidden");
    },
    undefined,
    (error) => {
        loading.innerHTML = "<span>Errore nel caricamento del modello.</span>";
        console.error("Errore GLB:", error);
    }
);

// === Resize ===
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Loop ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
