import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// === Canvas e loading ===
const canvas = document.getElementById("arch-viewer");
const loading = document.getElementById("loading");

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Camera ===
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
);
camera.position.set(5, 5, 5);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// === Luci (soft editorial) ===
const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(6, 10, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-6, 4, -6);
scene.add(fillLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

// === Controlli ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI / 2;

// === Loader GLTF ===
const loader = new GLTFLoader();

const params = new URLSearchParams(window.location.search);
const modelName = params.get("model") || "progetto";
const modelPath = `./models/${modelName}.glb`;

loader.load(
    modelPath,
    (gltf) => {
        const model = gltf.scene;

        // === Override grafico: monocromo editoriale ===
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xf2f2f2,
                    roughness: 0.9,
                    metalness: 0.0
                });
            }
        });

        scene.add(model);

        // === Fit camera al modello ===
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        came
