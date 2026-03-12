import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const MAX_ATOMS = 500_000;
const PORT = 8086;
// WS connection defaults to the host that served the HTML document.
const WS_URL = `ws://${window.location.hostname}:${PORT}`;

// --- DOM Setup ---
const container = document.getElementById("app");
if (!container) throw new Error("No #app element found");

const statAtoms = document.getElementById("stat-atoms");
const statEnergy = document.getElementById("stat-energy");
const statMood = document.getElementById("stat-mood");

// --- Three.js Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  10000,
);
camera.position.set(0, 0, 800);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// --- InstancedMesh Setup ---
const geometry = new THREE.PlaneGeometry(1.5, 1.5);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  depthWrite: false, // Prevent depth sorting issues with transparent planes
  blending: THREE.AdditiveBlending,
});

const mesh = new THREE.InstancedMesh(geometry, material, MAX_ATOMS);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
mesh.instanceColor?.setUsage(THREE.DynamicDrawUsage);
scene.add(mesh);

// --- State Buffers ---
// Double buffering: We keep the CURRENT rendered state, and the TARGET state to LERP towards
let activeCount = 0;
const currentPositions = new Float32Array(MAX_ATOMS * 3);
const targetPositions = new Float32Array(MAX_ATOMS * 3);

// We'll update colors immediately instead of lerping them to save CPU
const colors = new Float32Array(MAX_ATOMS * 3);

const dummy = new THREE.Object3D();
const colorHelper = new THREE.Color();

// --- Network ---
let ws;
function connect() {
  console.log(`[NET] Connecting to ${WS_URL}...`);
  ws = new WebSocket(WS_URL);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => console.log("[NET] Connected to OMEGA-64");

  ws.onmessage = (event) => {
    // 1. Text payloads are JSON heartbeats
    if (typeof event.data === "string") {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "HEARTBEAT") {
                if (statAtoms) statAtoms.innerText = data.atoms.toLocaleString();
                if (statEnergy) statEnergy.innerText = (data.energy / 1000).toFixed(2);
                if (statMood) statMood.innerText = data.mood || "";
            }
        } catch(e) {}
        return;
    }

    // 2. Binary payloads are frame updates
    if (!(event.data instanceof ArrayBuffer)) return;

    // Incoming format: [x, y, colorCode, resonance, x, y, colorCode, resonance...]
    const packet = new Float32Array(event.data);
    activeCount = Math.min(MAX_ATOMS, packet.length / 4);

    for (let i = 0; i < activeCount; i++) {
      const pIdx = i * 4;
      const x = packet[pIdx];
      const y = packet[pIdx + 1];
      const colorCode = packet[pIdx + 2];
      const resonance = packet[pIdx + 3];

      // Target Position Update (Z is resonance driven for 3D depth)
      const p3Idx = i * 3;
      targetPositions[p3Idx] = x;
      targetPositions[p3Idx + 1] = y;
      targetPositions[p3Idx + 2] = resonance * 10; // Elevate based on resonance

      // Color Update
      if (colorCode === 1) colorHelper.setHex(0xff3333); // Predator (Red)
      else if (colorCode === 2) colorHelper.setHex(0x33ff33); // Prey (Green)
      else if (colorCode === 3) colorHelper.setHex(0x3333ff); // Guardian (Blue)
      else if (colorCode === 4) colorHelper.setHex(0xffff33); // Architect (Yellow)
      else colorHelper.setHex(0xaaaaaa); // Unknown/Inert (Grey)

      colorHelper.multiplyScalar(0.5 + Math.min(resonance, 1.0) * 0.5); // Brighten with resonance

      colors[p3Idx] = colorHelper.r;
      colors[p3Idx + 1] = colorHelper.g;
      colors[p3Idx + 2] = colorHelper.b;
    }

    // Inform Three.js the active limit has changed
    mesh.count = activeCount;
  };

  ws.onclose = () => {
    console.log("[NET] Disconnected. Reconnecting in 2s...");
    setTimeout(connect, 2000);
  };

  ws.onerror = (e) => console.error("[NET] Error", e);
}
connect();

// --- Render Loop ---
const LERP_FACTOR = 0.3; // Speed of interpolation (0.0 to 1.0)

function animate() {
  requestAnimationFrame(animate);

  // 1. Interpolate Positions & Update Mesh
  let matrixNeedsUpdate = false;
  let colorNeedsUpdate = false;

  if (activeCount > 0) {
    for (let i = 0; i < activeCount; i++) {
      const p3Idx = i * 3;

      // Linear Interpolation: Current = Current + (Target - Current) * Factor
      currentPositions[p3Idx] +=
        (targetPositions[p3Idx] - currentPositions[p3Idx]) * LERP_FACTOR;
      currentPositions[p3Idx + 1] +=
        (targetPositions[p3Idx + 1] - currentPositions[p3Idx + 1]) *
        LERP_FACTOR;
      currentPositions[p3Idx + 2] +=
        (targetPositions[p3Idx + 2] - currentPositions[p3Idx + 2]) *
        LERP_FACTOR;

      dummy.position.set(
        currentPositions[p3Idx],
        currentPositions[p3Idx + 1],
        currentPositions[p3Idx + 2],
      );
      // Keep planes facing camera (Billboard effect)
      dummy.quaternion.copy(camera.quaternion);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);

      colorHelper.setRGB(colors[p3Idx], colors[p3Idx + 1], colors[p3Idx + 2]);
      mesh.setColorAt(i, colorHelper);
    }
    matrixNeedsUpdate = true;
    colorNeedsUpdate = true;
  }

  if (matrixNeedsUpdate) mesh.instanceMatrix.needsUpdate = true;
  if (colorNeedsUpdate && mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Event Listeners ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
