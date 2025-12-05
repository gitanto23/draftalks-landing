// Tutto usa la variabile globale THREE (niente import)

const container = document.getElementById("viewer-container");
const canvas = document.getElementById("arch-viewer");
const loadingOverlay = document.getElementById("loading");

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
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
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.9;
controls.zoomSpeed = 0.9;
controls.target.set(0, 0, 0);

// Luci
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdddddd, 0.7);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(8, 16, 10);
scene.add(dirLight);

// Modello fisso
const MODEL_URL = "/models/progetto.glb";
const loader = new THREE.GLTFLoader();

loader.load(
  MODEL_URL,
  (gltf) => {
    const model = gltf.scene;

    // Clay material
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.85,
          metalness: 0.0
        });
      }
    });

    // Centra e scala
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 10;
    const scale = desiredSize / maxDim;
    model.scale.setScalar(scale);

    scene.add(model);

    const dist = desiredSize * 2.2;
    camera.position.set(dist, dist * 0.8, dist);
    controls.target.set(0, 0, 0);
    controls.update();

    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  },
  undefined,
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
