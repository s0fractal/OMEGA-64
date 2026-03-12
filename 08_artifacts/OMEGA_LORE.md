# OMEGA-64 | ARCHITECTURE LORE (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-12T02:58:31.315Z*
*Exported Files in Category: 17*
*Total Exported Files: 131*
*Runtime Roots: 10*
*Runtime Closure Files: 78*
*Non-Runtime Code Files: 36*
*Runtime-Support Code Files: 11*
*Experimental Code Files: 25*
*Manifest SHA256: b3b2b69ccc8bda7dcd9b5e69b91bc81d0946bbe80e10e429379741a24576c82d*
*Export Set SHA256: ed5e2c2c3af9b619ef25e612d310baa1329d6acae1c79d01fb6889ce3779d3f9*
*Export Content SHA256: f3dfaba8fc50559e40db4d2bb9656acb049ff5e4775a36765d9e68f49c8e1db0*
*Git Commit: 53b552e9fd16*

---

## FILE: AKASHA_UI.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>OMEGA-64 // THE AKASHA UI</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #020204;
        color: #0ff;
        font-family: "Courier New", Courier, monospace;
        overflow: hidden;
      }
      #canvas-container {
        width: 100vw;
        height: 100vh;
      }
      #hud {
        position: absolute;
        top: 20px;
        left: 20px;
        pointer-events: none;
        text-shadow: 0 0 5px #0ff;
        background: rgba(0, 20, 20, 0.5);
        padding: 15px;
        border: 1px solid #0ff;
        border-radius: 5px;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
      }
      h1 {
        margin: 0 0 10px 0;
        font-size: 20px;
        letter-spacing: 2px;
      }
      .stat {
        margin: 5px 0;
        font-size: 14px;
      }
      .highlight {
        color: #fff;
        font-weight: bold;
      }

      #tooltip {
        position: absolute;
        display: none;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid #0ff;
        padding: 10px;
        pointer-events: none;
        font-size: 12px;
        z-index: 100;
        backdrop-filter: blur(4px);
      }
    </style>
    <!-- Import Three.js via CDN -->
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
    ></script>
    <script
      src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
    ></script>
  </head>
  <body>
    <div id="hud">
      <h1>👁️ AKASHA UI (v3.0)</h1>
      <div class="stat">
        Population: <span id="stat-pop" class="highlight">0</span>
      </div>
      <div class="stat">
        Synapses: <span id="stat-syn" class="highlight">0</span>
      </div>
      <div class="stat">
        System Energy: <span id="stat-nrg" class="highlight">0</span>
      </div>
      <div class="stat">
        Status: <span id="stat-status" style="color: #0f0">SYNCING...</span>
      </div>
    </div>

    <div id="tooltip"></div>
    <div id="canvas-container"></div>

    <script>
      // --- THREE.JS SETUP ---
      const container = document.getElementById(
        "canvas-container",
      );
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2("#020204", 0.001);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000,
      );
      camera.position.set(0, 500, 1500);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(
        window.innerWidth,
        window.innerHeight,
      );
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(
        camera,
        renderer.domElement,
      );
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Visual Assets
      const particlesMaterial = new THREE.PointsMaterial({
        size: 15,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        map: createCircleTexture(), // Soft glowing particles
      });

      let particleSystem;
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      let lineSystem;

      const atomDataMap = new Map(); // Store metadata for raycasting interaction

      function createCircleTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        const grad = ctx.createRadialGradient(
          32,
          32,
          0,
          32,
          32,
          32,
        );
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.2, "rgba(0,255,255,0.8)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
      }

      // --- WEBSOCKET CONNECTION ---
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        document.getElementById("stat-status")
          .innerText = "CONNECTED";
      };

      ws.onclose = () => {
        document.getElementById("stat-status")
          .innerText = "DISCONNECTED";
        document.getElementById("stat-status").style
          .color = "#F00";
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "SYNC") {
            updateUniverse(
              msg.data.atoms,
              msg.data.bonds,
            );
          }
        } catch (e) {
          console.error("Parse error", e);
        }
      };

      // --- UPDATE LOGIC ---
      function updateUniverse(atoms, bonds) {
        // HUD Update
        document.getElementById("stat-pop").innerText = atoms.length;
        document.getElementById("stat-syn").innerText = bonds.length;
        let totalEnergy = 0;

        // Clean up old visuals
        if (particleSystem) {
          scene.remove(particleSystem);
        }
        if (lineSystem) scene.remove(lineSystem);
        atomDataMap.clear();

        // 1. Rebuild Particles (Atoms)
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(
          atoms.length * 3,
        );
        const colors = new Float32Array(
          atoms.length * 3,
        );
        const sizes = new Float32Array(atoms.length); // For future shader use if needed

        const colorCache = new THREE.Color();

        // Center the universe (assuming typical coords 0-800)
        const offsetX = -400;
        const offsetY = -400;

        for (let i = 0; i < atoms.length; i++) {
          const atom = atoms[i];
          totalEnergy += atom.energy;

          // Map Flatland 2D to 3D.
          // x -> x
          // y -> z (depth instead of height for a galactic disk feel)
          // resonance -> y (vertical height relative to resonance!)
          const pX = (atom.x + offsetX) * 1.5;
          const pZ = (atom.y + offsetY) * 1.5;
          const pY = (atom.resonance * 2) - 50; // Higher resonance floats up

          positions[i * 3] = pX;
          positions[i * 3 + 1] = pY;
          positions[i * 3 + 2] = pZ;

          // Color based on logic string
          const hue = parseInt(atom.logic.slice(0, 3), 16) %
              360 || 0;
          colorCache.setHSL(hue / 360, 0.8, 0.6);

          colors[i * 3] = colorCache.r;
          colors[i * 3 + 1] = colorCache.g;
          colors[i * 3 + 2] = colorCache.b;

          // Store atom spatial data for the lines and raycaster
          atomDataMap.set(atom.id, {
            x: pX,
            y: pY,
            z: pZ,
            ...atom,
          });
        }

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        geometry.setAttribute(
          "color",
          new THREE.BufferAttribute(colors, 3),
        );

        particleSystem = new THREE.Points(
          geometry,
          particlesMaterial,
        );
        scene.add(particleSystem);

        document.getElementById("stat-nrg").innerText = totalEnergy;

        // 2. Rebuild Lines (Bonds)
        const lineGeometry = new THREE.BufferGeometry();
        const linePoints = [];

        for (const bond of bonds) {
          const source = atomDataMap.get(bond.source);
          const target = atomDataMap.get(bond.target);
          if (source && target) {
            linePoints.push(
              new THREE.Vector3(
                source.x,
                source.y,
                source.z,
              ),
              new THREE.Vector3(
                target.x,
                target.y,
                target.z,
              ),
            );
          }
        }

        if (linePoints.length > 0) {
          lineGeometry.setFromPoints(linePoints);
          lineSystem = new THREE.LineSegments(
            lineGeometry,
            lineMaterial,
          );
          scene.add(lineSystem);
        }
      }

      // --- RENDER LOOP ---
      function animate() {
        requestAnimationFrame(animate);
        controls.update();

        // Slow cosmic rotation
        if (particleSystem) {
          particleSystem.rotation.y += 0.0005;
        }
        if (lineSystem) {
          lineSystem.rotation.y += 0.0005;
        }

        renderer.render(scene, camera);
      }
      animate();

      // --- INTERACTIVITY (Raycaster for Hover) ---
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const tooltip = document.getElementById("tooltip");

      window.addEventListener("mousemove", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 +
          1;

        tooltip.style.left = event.clientX + 15 + "px";
        tooltip.style.top = event.clientY + 15 + "px";

        if (!particleSystem) return;

        // Rotate raycaster to match system rotation
        raycaster.setFromCamera(mouse, camera);

        // We need a threshold for points
        raycaster.params.Points.threshold = 10;

        const intersects = raycaster.intersectObject(
          particleSystem,
        );

        if (intersects.length > 0) {
          const index = intersects[0].index;
          const atomValues = Array.from(
            atomDataMap.values(),
          );
          const hoveredAtom = atomValues[index];

          if (hoveredAtom) {
            tooltip.style.display = "block";
            tooltip.innerHTML = `
                        <strong>${hoveredAtom.symbol}</strong><br>
                        ID: ${hoveredAtom.id}<br>
                        Logic: ${hoveredAtom.logic}<br>
                        Resonance: ${
              hoveredAtom.resonance.toFixed(1)
            }<br>
                        Thought: <span style="color:#F0F">"${hoveredAtom.thought}"</span>
                    `;
          }
        } else {
          tooltip.style.display = "none";
        }
      });

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth /
          window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          window.innerWidth,
          window.innerHeight,
        );
      });
    </script>
  </body>
</html>

```

---

## FILE: ARCHITECTURE_ACTIVE.md

```markdown
# OMEGA-64 | Active Architecture (Era 69)

This document is the canonical architecture snapshot for active runtime and
export context. It intentionally excludes historical era narratives.

## Runtime Topology (Active)

1. Host orchestration: `PULSE.ts`
2. Shared substrate: `STATE_MATRIX.ts` + `OFFSETS.ts` (`SharedArrayBuffer`).
   Requires bit-exact memory correspondence between Host and WASM kernel offsets
   (e.g., literal `8,000,000` bytes vs binary `8MiB` alignment).
3. Execution plane: `PULSE_WORKER.ts` + `build/release.wasm`
4. Governance plane: `GATE.ts` + `SHIMS.ts`
5. Snapshot/continuity plane: `STATE_SNAPSHOT.ts`, `SNAP.ts`,
   `SNAPSHOT_ENGINE.ts`
6. Operator/observer plane: `OBSERVER_UI.ts`, `ui/index.html` Akasha signaling
   membrane exposes WebRTC rendezvous via `ws://<akasha>/rtc/signal` +
   `/api/webrtc`. Observer UI can form RTC mesh rooms (`rtcRoom`) and exchange
   lightweight telemetry frames over `RTCDataChannel` without routing payloads
   through mutation gate paths. Mesh `plasmid/pheromone` packets are ingested
   only via `/api/webrtc/inject` and forwarded into the existing
   `/api/inject -> CONTROL_INTENT_QUEUE` governance path.
7. Codex/archive plane: `AKASHA_CODEX.ts` (`./codex/species`,
   `./codex/chronicles`, `./codex/relics`, `./codex/invariants`) Human narrative
   bridge: `/codex/narrative`, `/api/codex/narrative`, `/codex/invariants`,
   `/api/codex/invariants`. Observer human channel in `ui/index.html` fuses
   `/api/telemetry` and codex narrative/invariant surfaces into plain-language
   state summaries plus drift deltas over a rolling ~90s window, with
   `LOW/MID/HIGH` drift severity badge, daemon admission summary
   (`daemon_governance.last_admission`) + short admission history
   (`daemon_governance.last_admission_history`), component score breakdown,
   codex lineage-guard cue (`last_admission.codexLineageGuardScore` /
   `codexLineageLabel`) for operator-facing admission pressure visibility,
   compact risk summary + drift trend sparkline, top degrade-reason aggregate,
   phase-ring quadrant badge/trend from canonical pressure-ring history
   (`daemon_governance.last_pressure_ring_history`) with local fallback, and
   scene halo tint driven by `max(drift severity, daemon admission severity)`.

## Runtime Classification Contract (Manifest)

- Source of truth: `CORE_ARCH_MANIFEST.json`.
- `runtime_root_files`: executable entry roots that define active runtime
  closure. Current roots: `07_meta/02_runners/SYSTEM_START.ts`, `02_metabolism/PULSE.ts`, `02_metabolism/PULSE_WORKER.ts`,
  `06_akasha/AKASHA_SERVER.ts`, `06_akasha/OMEGA_DAEMON.ts`, `00_substrate/assembly/index.ts`,
  `06_akasha/MUTATION_TELEMETRY.ts`, `06_akasha/TUI_DASHBOARD.ts`, `06_akasha/AGENT_PROXY.ts`, `05_exocortex/llm_soul.ts`,
  `63_necropolis/nightly_soak.ts`.
- `runtime_support_files`: operational/support code intentionally exported but
  outside active runtime closure.
- `experimental_files`: explicitly exported experimental surfaces that must not
  be imported by active runtime roots.

## Deterministic Pulse Pipeline

1. `PULSE.initWorkers()` boots worker mesh over shared memory.
2. `BUILD_SPATIAL_HASH` runs on worker-0.
3. `PULSE` phase executes atom kernels across worker ranges.
4. `REDUCE_DELTAS` merges intent deltas deterministically.
5. `TICK_MATRIX` executes structure/signal matrix pass.
6. Host applies sequential actions (bond requests, spawn queue drain).
7. `GATE.tick()` performs admission, budgeting, policy checks, and ledgering.

## Post-69 Enabled Additions

- `ATTENTION_FIELD` is now canonical shared-memory lattice state:
  `OFFSETS.ATTENTION_FIELD_OFFSET` + `STATE_MATRIX.attentionField`.
- Observer presence enters through `/avatar` and decays in host pulse.
- WASM trophism (`00_substrate/assembly/index.ts`) applies role-specific response to
  attention gradients.
- `AKASHA_CODEX` performs epochal taxonomy + chronicle + relic + invariant
  archive scans and serves API snapshots via `/codex*` endpoints.
- `BREATH` now injects the latest Codex chronicle context into Oracle prompts.
- `OMEGA_DAEMON` runs an invariant-compressor pass each heartbeat, persists
  `daemon_invariants.json`, and feeds invariant frames into the LLM decision
  loop before any external action proposal.
- Host pulse now supports deterministic evolution pressure terms: direct
  coefficients (`OMEGA_NOVELTY_PRESSURE`, `OMEGA_SYMBIOSIS_PRESSURE`) and a
  phase-ring mode (`OMEGA_MATRIX_THETA`, `OMEGA_PRESSURE_RING_SCALE`) that
  projects fear/curiosity + ego/love axes on the unit circle. Host applies
  bounded signed energy deltas during `HOST_LOCK` without modifying WASM ISA.
- `OFFSETS.ts` now exposes `validateMemoryLayout()` and `STATE_MATRIX.ts`
  executes the guard at startup (alignment + overlap + wasm-bounds checks) to
  fail fast on silent layout drift before any worker tick starts.
- Runtime exposes `/api/pressure-ring` for authorized daemon control of phase
  updates (`set`/`step`) with bounded theta delta clamps and audit trail
  (`DAEMON_PRESSURE_RING` events + `daemon_pressure_ring_update` telemetry), and
  preserves bounded canonical update history for observers.
- `OMEGA_DAEMON` can run a phase-season scheduler
  (`OMEGA_DAEMON_PHASE_SEASONS_*`) that advances `theta` deterministically from
  telemetry/invariant context while respecting cooldown and safe-mode gates.
- **WASM-Native Secretion Path (Direct Emission)**: The WASM kernel now
  possesses direct authority over glyph emission. Legacy JS-side deposition
  logic has been removed.
  - RISC opcodes `OP_SIGNAL` (0x81) and `OP_COLLECTIVE` (modes 2/7) now consume
    energy and emit glyphs directly via `secreteGlyph`.
  - Grid-based leakage (Signal/Memory -> Pheromone/Plasmid) is handled during
    `tickGlyphTransport` in WASM.
  - Unified 12-index telemetry (`SECRETION_STATS_OFFSET`) tracks role-based
    secretions and internal reflection leaks in shared memory for real-time
    observation.
- **Total Physiological Closure (Endocrine Wiring)**: The Genetic Ledger now
  governs 10 physiological knobs consolidated via `GENERIC_LEDGER_SYSTEM.ts`.
  These are synchronized to a Hormone Shared-Memory Lattice
  (`HORMONE_BUFFER_RUNTIME.ts`) within `STATE_MATRIX`. The WASM kernel directly
  reads these 6 derivation-hormones to modulate physical reality:
  - `entropy_pressure` (H0) scales metabolic cost.
  - `time_viscosity` (H1) dynamically clamps execution budget (8..24 steps).
  - `replication_bias` (H3) shifts the `OP_REPLICATE` energy threshold.
  - `aggression` (H2) scales the `OP_SHARE` percentage.
  - `repair_drive` (H4) modulates resonance decay.
  - `mutation_friction` (H5) adds a metabolic floor to complex operations and
    modulates genome mutation chance.
- **Genetic Evolution (Stage 8.1)**: Atoms possess autonomous genomic mutation
  capabilities.
  - **Mutation Engine**: Introduced stochastic bit-flipping in the 64-bit genome
    during replication.
  - **Replayability**: Mutation is deterministic, derived from `atomId` and
    `systemTicker`.
  - **Stability Control**: `H5 (mutation_friction)` allows the global mind-field
    to freeze or accelerate evolution.
- **Deno-Native Architecture**: The project has fully transitioned to a
  Deno-native environment. Legacy `node_modules`, `package.json`, and
  `package-lock.json` have been removed. AssemblyScript (`0.28.9`) is managed
  via Deno's native NPM resolution in `build_wasm.ts`.
- **Cognitive Vector Protocol**: Transitioned to deterministic integer-based
  Math (`math_sin`, `math_cos`) to ensure 100% causal consistency.
  - **Phase-ring as Cognitive Zodiac**: The internal continuous `theta` phase
    (0-255) maps symmetrically into a 4-quadrant archetype wheel:
    - **Quadrant I (0-63)**: Fear vs Curiosity (Scientist / Analyzer)
    - **Quadrant II (64-127)**: Curiosity vs Ego (Architect / Creator)
    - **Quadrant III (128-191)**: Ego vs Love (Warrior / Extractor)
    - **Quadrant IV (192-255)**: Love vs Fear (Guardian / Protector)
  - **Resonance Dynamics**: Incorporates the Kuramoto model for phase
    synchronization (`OP_RESONATE_KURAMOTO`) with K-coupling dictated strictly
    by global `NEURAL_COHERENCE`, driving atoms into synchronous zodiac phases
    when K > K_critical.
  - **Gas Economics**: Implements precision-gas gradients where `LUT_LERP` and
    `TAYLOR2` exact mathematically higher gas tariffs (5-10x more than fast
    mapping) yielding resource competition under resonant loads.

## Governance and Integrity

- Mutation authority is centralized at `GATE.MUTATE`.
- Daemon ingress (`/api/inject`) now includes an invariant admission layer:
  action plans are scored against codex narrative context (`sharedCenter`,
  dominant invariant vector, safety floors). `MID/HIGH` drift is degraded
  (intensity clamp or plasmid->pheromone conversion) instead of hard blocking.
  Codex species memory now feeds a lineage guard score (dominant epochs +
  historical peak share + active-lineage match) to increase drift pressure on
  aggressive external plasmid ingress during stable lineage windows. Degradation
  rationale is written to daemon audit log and codex chronicles
  (`daemon_admission`) for operator visibility in narrative surfaces.
- Bridge/policy/invariant checks are validated before commit.
- Ledger (`LEDGER__08_00_LEDGER`) uses hash-chain anchoring: `chain_version`,
  `prev_event_hash`, `event_hash`.
- Checkpoint (`CHECKPOINT_CHECKPOINT`) uses hash-chain anchoring:
  `chain_version`, `prev_checkpoint_hash`, `checkpoint_hash`.
- Proposal envelope index has independent hash-chain replay index.

## WASM Boot and Resilience Policy

- Worker init fallback (`OMEGA_WORKER_INIT_FALLBACK`): degrade to single worker
  when partial worker init fails.
- WASM preflight (`OMEGA_WASM_BOOT_PRECHECK`): verifies artifact readability and
  compilability before worker boot.
- Boot policy (`OMEGA_WASM_BOOT_POLICY`):
  - `fail-fast`: startup throws on total worker init failure.
  - `safe-noop`: startup enters degraded mode with `runtimeWorkerCount=0` and
    no-op ticks.
- Startup self-test (`OMEGA_STARTUP_SELFTEST*`) validates cold-start coherence.
  Policy: The test is non-destructive for populated environments; if
  `getActiveIndices()` is non-zero, the test is bypassed to preserve seeded
  state.

## Coherence Gates (Active)

Primary chain:

- `test:runtime-monoculture`
- `test:runtime-support-boundary`
- `test:runtime-experimental-boundary`
- `test:codex-narrative-contract`
- `test:ui-codex-narrative-contract`
- `test:ui-human-channel-contract`
- `test:export-manifest`
- `vector10:verify`
- determinism/parity/projection/bridge/index/ledger/checkpoint runtime tests

Deep chain adds:

- drift/fuzz/intent determinism
- spawn/jitter/timeout resilience
- worker init fallback / total-fail / safe-noop gates
- startup self-test nominal + fallback

## Export Canon

- Export source of truth: `CORE_ARCH_MANIFEST.json`
- Export tool: `export_core.ts`
- Output: `OMEGA_CORE_LOGIC.md`
- Policy: test files and archive/legacy folders are excluded; required active
  files must exist; context is limited to active architecture docs and UI/ops
  surfaces.

```

---

## FILE: CORE_ARCH_MANIFEST.json

```json
{
  "era": "69",
  "runtime_root_files": [
    "07_meta/02_runners/SYSTEM_START.ts",
    "02_metabolism/PULSE.ts",
    "02_metabolism/PULSE_WORKER.ts",
    "06_akasha/AKASHA_SERVER.ts",
    "06_akasha/OMEGA_DAEMON.ts",
    "00_substrate/assembly/index.ts",
    "06_akasha/MUTATION_TELEMETRY.ts",
    "06_akasha/TUI_DASHBOARD.ts",
    "06_akasha/AGENT_PROXY.ts",
    "05_exocortex/llm_soul.ts"
  ],
  "runtime_support_files": [
    "00_substrate/07_meta/02_runners/build_wasm.ts",
    "02_metabolism/HOLOGRAM_MODULE.ts",
    "06_akasha/OBSERVER_LAB.ts",
    "06_akasha/OBSERVER_UI.ts",
    "04_noosphere/P2P_SYNAPSE.ts",
    "02_metabolism/RECOVERY.ts",
    "02_metabolism/SNAP.ts",
    "01_physics/STRUCTURE_ENGINE.ts",
    "00_substrate/03_tests/wasm_layout_guard.ts",
    "reduction_core/REIFICATION_ACTION.ts",
    "reduction_core/relics/RELIC_CULTIVATION.ts"
  ],
  "experimental_files": [
    "01_physics/ECOLOGY_ENGINE.ts",
    "02_metabolism/LAMBDA_VM.ts",
    "01_physics/MATRIX_ENGINE.ts",
    "02_metabolism/REFLECTION_ENGINE.ts",
    "02_metabolism/RIBOSOME_TICK.ts",
    "reduction_core/GlyphIR64.ts",
    "runtime_bridge/glyph_pretty.ts",
    "runtime_bridge/opcode_to_glyph.ts",
    "verification/golden_trace_catalog.ts",
    "verification/reduction_harness.ts"
  ],
  "core_entry_files": [
    "07_meta/02_runners/SYSTEM_START.ts",
    "02_metabolism/PULSE.ts",
    "02_metabolism/PULSE_WORKER.ts",
    "06_akasha/AKASHA_SERVER.ts",
    "06_akasha/OMEGA_DAEMON.ts",
    "00_substrate/assembly/index.ts",
    "06_akasha/MUTATION_TELEMETRY.ts",
    "06_akasha/TUI_DASHBOARD.ts",
    "06_akasha/AGENT_PROXY.ts",
    "05_exocortex/llm_soul.ts"
  ],
  "required_additional_files": [
    "03_governance/DAEMON_INGRESS_POLICY.ts",
    "03_governance/GUARDIAN_SIGNAL_PROMOTION_DECISION.ts",
    "03_governance/ARCHITECT_PLASMID_PROMOTION_DECISION.ts",
    "01_physics/GLYPH_BUFFER.ts",
    "03_governance/GENERIC_LEDGER_PERSISTENCE.ts",
    "03_governance/GENERIC_LEDGER_SYSTEM.ts",
    "02_metabolism/HORMONE_BUFFER_RUNTIME.ts",
    "00_substrate/07_meta/02_runners/build_wasm.ts",
    "00_substrate/03_tests/wasm_layout_guard.ts",
    "reduction_core/REIFICATION_ACTION.ts",
    "reduction_core/relics/RELIC_CULTIVATION.ts",
    "06_akasha/mod.ts"
  ],
  "context_files": [
    "CORE_ARCH_MANIFEST.json",
    "ARCHITECTURE_ACTIVE.md",
    "MUTATION_LANES.md",
    "README.md",
    "REDUCTION_METABOLISM_ROADMAP.md",
    "WASM_MIGRATION_RFC.md",
    "WASM_THREADSAFE_ROADMAP.md",
    "docs/migration/ROADMAP_2_SIGMA_CORE.md",
    "docs/migration/OMEGA_TRANSITION_PLAN.md",
    "docs/migration/CAUSAL_ATLAS.md",
    "docs/migration/GOLDEN_TRACES.md",
    "docs/migration/GLYPHIR64_CONTRACT.md",
    "docs/migration/HORMONE_LEDGER_CONTRACT.md",
    "AKASHA_UI.html",
    "06_akasha/OBSERVER_LAB.ts",
    "ui/index.html",
    "public/index.html",
    "public/main.js"
  ]
}
```

---

## FILE: docs/migration/CAUSAL_ATLAS.md

```markdown
# Causal Atlas

> Stage 1 COMPLETED. Owner classification finalized on 2026-03-08. This is a
> migration control document, not an implementation artifact.

## Purpose

Map who currently owns causality in OMEGA-64 before any bridge to
reduction-native execution is attempted.

This file tracks the mutations that actually move the world, not every helper
function in the repository.

## Scope

Stage 1 minimum atlas coverage:

- `PULSE.ts`
- `PULSE_WORKER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `AKASHA_SERVER.ts`
- `AKASHA_CODEX.ts`
- `GATE.ts`
- `STATE_MATRIX.ts`

## Status

| Item                            | Status   | Notes                                                  |
| ------------------------------- | -------- | ------------------------------------------------------ |
| Owner classification            | complete | top-20 critical mutations mapped and verified          |
| Determinism risk classification | complete | low/medium/high/critical scale applied                 |
| Future disposition tagging      | complete | keep / wrap / move to ledger / move to reduction       |
| Residual file notes             | complete | verified against `reduction_harness.ts` parity results |

## Mutation types

- `physics`
- `governance`
- `transport`
- `memory`
- `observer`
- `bootstrap`

## Determinism risk scale

- `low`: observer-only or debug-only, no canonical state mutation
- `medium`: bounded policy or membrane mutation, canonical world changed only
  through validated API
- `high`: direct host-side or daemon-side state shaping with bounded scope
- `critical`: shared substrate mutation, cross-worker ordering sensitivity, or
  canonical ledger authority

## Top-20 critical mutations

| ID | Operation                                                                                                                  | File                | Owner                        | Reads                                                                 | Writes                                                                       | Type         | Risk     | Disposition       | Future target layer                                     | Notes                                                                                                                           |
| -- | -------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------ | -------- | ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Worker boot policy, WASM preflight, init fallback                                                                          | `PULSE.ts`          | host bootstrap               | runtime policy, wasm artifact health, worker status                   | worker pool state, boot mode flags, safe-noop/degraded mode                  | `bootstrap`  | high     | keep              | runtime bootstrap lane                                  | This decides whether the world gets a parallel kernel, a serial fallback, or a degraded safe-noop shell.                        |
| 2  | Startup self-test and forced single-worker fallback                                                                        | `PULSE.ts`          | host bootstrap               | empty-world check, tick counter, sync state                           | worker topology, matrix clear, tick reset, sync wakeups                      | `bootstrap`  | high     | keep              | runtime bootstrap lane                                  | Cold-start only, but it mutates the substrate during diagnostic replay.                                                         |
| 3  | Bond-request resolution                                                                                                    | `PULSE.ts`          | host sequential physics shim | active atom set, bond request slots                                   | bonds, stiffness, cleared request slots                                      | `physics`    | high     | wrap              | bridge-side sequential shim, later reduction            | This is still imperative JS causality sitting above the substrate.                                                              |
| 4  | Spatial-hash rebuild, physics snapshot freeze, sync phase transitions                                                      | `PULSE.ts`          | host scheduler               | active atoms, current positions/energies, worker state                | `syncState`, spatial hash state, read buffers                                | `physics`    | critical | move to reduction | reduction substrate / bounded scheduling layer          | This is one of the most important ownership boundaries in the current runtime.                                                  |
| 5  | Spawn-queue drain into `seedAtom()`                                                                                        | `PULSE.ts`          | host scheduler               | spawn ring, free slots, child genome payload                          | ids, positions, energy, logic, spawn cursors                                 | `physics`    | critical | wrap              | glyph transport + reduction bridge                      | Currently reproduction is completed on the host after being requested in WASM.                                                  |
| 6  | Host-lock mutation drains from oracle and control queue                                                                    | `PULSE.ts`          | host governance lane         | pending oracle mutations, `CONTROL_INTENT_QUEUE`                      | shared state through admitted mutation lanes, telemetry                      | `governance` | high     | move to ledger    | ledger-bound hormone / governance layer                 | This is already separated from the fast lane, but still concentrated in host-lock orchestration.                                |
| 7  | Evolution pressure adjustment                                                                                              | `PULSE.ts`          | host physiology shim         | active genomes, bond topology, phase-ring state                       | per-atom energy, mutation telemetry                                          | `governance` | high     | move to ledger    | hormone layer                                           | This is the first real example of policy changing local fitness without changing physics instructions.                          |
| 8  | Energy homeostasis tax/subsidy                                                                                             | `PULSE.ts`          | host physiology shim         | current energy, target energy, overflow ratio                         | per-atom energy, mutation telemetry                                          | `governance` | high     | move to ledger    | hormone layer + genetic ledger                          | Dynamic enough to be physiological, but still implemented as host-side arithmetic over raw substrate arrays.                    |
| 9  | Periodic gate audit and coherence persistence                                                                              | `PULSE.ts`          | host governance lane         | active atoms, resonance, gate schedule                                | gate-triggered recycling/role changes, coherence cell, codex pulse           | `governance` | high     | split             | keep gate lane; move metrics to hormone/evidence layers | This currently bundles governance policing, coherence projection, and codex triggering in one host pass.                        |
| 10 | WASM instantiation and export binding                                                                                      | `PULSE_WORKER.ts`   | worker bootstrap             | release wasm, host memory handle, init payload                        | bound wasm exports, READY / INIT_FAILED state                                | `bootstrap`  | high     | keep              | runtime bootstrap lane                                  | Not canonical world mutation by itself, but it determines execution ownership.                                                  |
| 11 | Worker phase dispatch (`PULSE`, `REDUCE_DELTAS`, `TICK_MATRIX`, `BUILD_SPATIAL_HASH`)                                      | `PULSE_WORKER.ts`   | worker execution lane        | sync state, shared substrate, worker ranges                           | shared substrate through wasm exports, per-phase completion signals          | `physics`    | critical | move to reduction | reduction execution lane                                | This is the active fast lane and must become the first reduction-native ownership surface later.                                |
| 12 | Legacy ISA execution loop (`execute_atom`)                                                                                 | `assembly/index.ts` | wasm kernel                  | instruction tape, registers, read snapshots, local lattice state      | registers, PC, energy, resonance, position, bond data                        | `physics`    | critical | move to reduction | reduction kernel                                        | This is the concrete legacy behavior that `GlyphIR64` must first mirror, not replace blindly.                                   |
| 13 | Replication publish into spawn ring                                                                                        | `assembly/index.ts` | wasm kernel                  | local energy/resonance, parent genome, lattice position               | spawn request ring, parent energy/resonance                                  | `physics`    | critical | move to reduction | glyph transport / bounded reproduction lane             | Crosses the main boundary between local execution and host-side birth materialization.                                          |
| 14 | Charge / build intent publish (`OP_SIGNAL`, `OP_PLUG`, `OP_BUILD`)                                                         | `assembly/index.ts` | wasm kernel                  | structure grid, charge state, resonance, role                         | structure intent buffers, charge intent buffers, signal field                | `physics`    | critical | move to reduction | internal glyph / structure transport                    | These opcodes already behave more like physical field writes than like high-level commands.                                     |
| 15 | Collective side-effects (`OP_COLLECTIVE`, `OP_SHARE`, `OP_ROLE`, `OP_TENSEGRITY`)                                          | `assembly/index.ts` | wasm kernel                  | hive memory, bonded neighbors, role state, local energy               | hive bank, energy deltas, role bytes, damping/bond distances, PC sync        | `physics`    | high     | split             | reduction kernel + memory/hormone layers                | This is a mixed bag and will need decomposition before clean migration.                                                         |
| 16 | Phase-ring and homeostasis controllers                                                                                     | `OMEGA_DAEMON.ts`   | daemon governance            | telemetry, invariant frame, daemon governance snapshot                | `/api/pressure-ring`, `/api/homeostasis`                                     | `governance` | medium   | move to ledger    | hormone layer + genetic ledger                          | The daemon is already acting as an endocrine controller rather than a direct world mutator.                                     |
| 17 | External injection dispatch                                                                                                | `OMEGA_DAEMON.ts`   | daemon membrane              | LLM decision payload, control token, inject endpoint state            | `/api/inject` requests                                                       | `transport`  | high     | keep              | proposal / membrane lane only                           | This must stay proposal-level, never direct shared-memory write access.                                                         |
| 18 | Membrane proxy forwarding (`/api/inject`, `/api/homeostasis`, `/api/pressure-ring`, telemetry/codex proxy, WebRTC inject`) | `AKASHA_SERVER.ts`  | ingress membrane             | external requests, control token, system API                          | forwarded REST calls, mesh envelopes                                         | `transport`  | medium   | keep              | membrane layer                                          | This is legitimate causality, but only as a validated forwarding membrane.                                                      |
| 19 | Pulse observation and async codex persistence                                                                              | `AKASHA_CODEX.ts`   | continuity / evidence lane   | population, epoch timing, state matrix samples, daemon invariant file | species/relic/invariant markdown, indexes, chronicles, codex state           | `memory`     | medium   | keep              | evidence engine                                         | Not fast-path physics, but it already shapes future governance context and must be treated as durable memory, not just logging. |
| 20 | Canonical mutation admission + live runtime policing                                                                       | `GATE.ts`           | governance canon             | proposals, snapshots, signatures, policy hash, current matrix state   | ledger events, checkpoints, accepted deltas, recycled atoms, role quarantine | `governance` | critical | split             | canonical ledger lane + bounded runtime audit lane      | `mutate()` is canonical and ledger-bound; `auditMatrix()` is live runtime policing. They should stay conceptually separate.     |

## File-level ownership notes

### `STATE_MATRIX.ts`

`STATE_MATRIX.ts` is not a policy owner, but it exposes the broadest mutation
surface in the system.

Current assessment:

- `setId`, `setX`, `setY`, `setEnergy`, `setRole`, `setLogic`,
  `setInstructions`, `seedAtom`, and `clear` are all mutation-capable substrate
  APIs.
- Determinism risk is `critical` whenever these setters are called outside an
  explicitly owned lane.
- Future direction is not "remove setters", but "wrap writes so every call site
  belongs to a classified owner": reduction, ledger-governed mutation,
  hormone/homeostasis, or bootstrap.

### `AKASHA_SERVER.ts` observer side

`scanUniverse()` and websocket broadcasting are **observer-only** and
intentionally outside the top-20 critical mutation set.

Important caveat:

- `Math.random()` is used while assigning fallback UI coordinates during
  markdown scans.
- That nondeterminism is acceptable only because it does not write canonical
  matrix state or ledger state.

## Immediate migration guidance

Do not move anything from the table above into reduction until:

1. the corresponding golden trace exists,
2. the rollback owner is explicit,
3. the replacement lane is narrower than the current one.

```

---

## FILE: docs/migration/GLYPHIR64_CONTRACT.md

```markdown
# GlyphIR64 Contract

> Contract scaffold only. This file defines the bridge vocabulary before any
> runtime path depends on it.

## Purpose

`GlyphIR64` is the transitional IR between the current legacy opcode ISA and the
future bounded reduction metabolism.

It exists to solve one migration problem:

- preserve a readable, machine-checkable bridge while legacy execution and
  reduction execution coexist.

It does **not** authorize semantic mutation or runtime ownership transfer by
itself.

## Hard invariants

1. The glyph id space is fixed at `0..63`.
2. `0..3` are permanently reserved for `S`, `K`, `I`, `Y`.
3. `S/K/I/Y` are not open to semantic mutation.
4. Initial bridge coverage is partial and explicit; unmapped legacy opcodes stay
   legacy.
5. Any mapped opcode must round-trip through:
   - legacy opcode -> glyph tape
   - glyph tape -> debug explanation

## Required record shape

Every glyph definition must eventually expose at least:

- `id: number`
- `mnemonic: string`
- `kind: "core" | "control" | "transport" | "structural" | "catalytic" | "regulatory" | "memory" | "reserve"`
- `arity: number`
- `energyCost: number`
- `stabilityClass: "hard-invariant" | "legacy-bridge" | "bounded-dynamic" | "reserve"`
- `reductionRuleRef: string`
- `legacyOpcode?: number`
- `notes?: string`

## Initial id bands

| Id range | Class      | Intent                                  |
| -------- | ---------- | --------------------------------------- |
| `0..3`   | core       | `S/K/I/Y` hard invariants               |
| `4..15`  | control    | bridge-safe control/data glyphs         |
| `16..23` | transport  | replication, signaling, exchange        |
| `24..31` | structural | build / plug / tensegrity surfaces      |
| `32..39` | catalytic  | role / collective transforms            |
| `40..47` | regulatory | future bounded policy glyphs            |
| `48..55` | memory     | persistent or hive-local symbolic state |
| `56..63` | reserve    | mutation reserve / sandbox only         |

## Initial bridge subset

The first bridge subset is intentionally narrow and tied to the active WASM ISA
surface.

| Glyph Id | Mnemonic      | Legacy opcode | Current behavior class        | Status                                                                                                               |
| -------- | ------------- | ------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `0`      | `S`           | none          | core combinator               | hard invariant                                                                                                       |
| `1`      | `K`           | none          | core combinator               | hard invariant                                                                                                       |
| `2`      | `I`           | none          | core combinator               | hard invariant                                                                                                       |
| `3`      | `Y`           | none          | bounded recursion anchor      | hard invariant                                                                                                       |
| `8`      | `SET`         | `0x01`        | register write                | bridge candidate                                                                                                     |
| `9`      | `GET`         | `0x02`        | property read                 | bridge candidate                                                                                                     |
| `10`     | `PUT`         | `0x03`        | property write                | bridge candidate                                                                                                     |
| `11`     | `ADD`         | `0x04`        | arithmetic                    | bridge candidate                                                                                                     |
| `12`     | `SUB`         | `0x05`        | arithmetic                    | bridge candidate                                                                                                     |
| `13`     | `JNZ`         | `0x11`        | control flow                  | bridge candidate                                                                                                     |
| `14`     | `JMP`         | `0x12`        | control flow                  | bridge candidate                                                                                                     |
| `15`     | `JZ`          | `0x10`        | control flow                  | bridge candidate                                                                                                     |
| `16`     | `REPLICATE`   | `0x80`        | transport / reproduction      | bridge candidate                                                                                                     |
| `17`     | `SIGNAL`      | `0x81`        | transport / field write       | bridge candidate                                                                                                     |
| `18`     | `SHARE`       | `0x83`        | transport / resource exchange | bridge candidate; bounded bonded-transfer parity active                                                              |
| `19`     | `BIND`        | `0x82`        | transport / bond request      | bridge candidate                                                                                                     |
| `20`     | `SPORE_DRIVE` | `0xAA`        | transport / relocation        | bridge candidate                                                                                                     |
| `21`     | `ENTANGLE`    | `0xAB`        | transport / hive exchange     | bridge candidate                                                                                                     |
| `24`     | `PLUG`        | `0xA4`        | structural IO                 | bridge candidate; bounded charge-resolve parity active, including max-intent competition semantics                   |
| `25`     | `TENSEGRITY`  | `0xA5`        | structural constraint         | bridge candidate; bounded bond-dist/damping parity active                                                            |
| `26`     | `BUILD`       | `0xA8`        | structural intent publish     | bridge candidate; bounded SOURCE materialization, owner-arbitration parity, and stale-lock fail-closed parity active |
| `27`     | `SENSE`       | `0xA9`        | structural query              | bridge candidate; bounded stale-lock fallback parity active                                                          |
| `32`     | `COLLECTIVE`  | `0xA6`        | catalytic / group side-effect | bridge candidate; bounded mode `0/1/2/3/4/5/6` parity active                                                         |
| `33`     | `ROLE`        | `0xA7`        | catalytic / identity shift    | bridge candidate                                                                                                     |

## Deferred opcodes

The following stay outside the initial bridge subset until parity is clearer:

- any future semantic-mutation glyphs in the reserve band.

## Debug and verification requirements

`GlyphIR64` is not complete unless it has both of these views:

1. `opcode/script -> glyph tape`
2. `glyph tape -> readable explanation`

The explanation layer must name:

- glyph mnemonic
- originating legacy opcode if any
- energy cost class
- reduction rule reference

## Migration gate

Stage 3 is considered real only when:

1. at least `10-15` active legacy opcodes are mapped explicitly,
2. the mapping is machine-readable,
3. unmapped opcodes fail closed rather than silently guessing,
4. the first reduction harness cases can consume the mapped subset.

## Non-goals for this phase

- no runtime execution through `GlyphIR64`
- no replacement of the active WASM kernel
- no semantic mutation of non-core glyphs
- no claim that "64 glyphs are now proteins"

```

---

## FILE: docs/migration/GOLDEN_TRACES.md

```markdown
# Golden Traces

> Stage 2 scaffold. Baseline scenarios are defined here before any runtime
> ownership moves toward reduction.

## Purpose

Golden traces are the control specimens for migration. They make "looks similar"
unacceptable and replace it with measurable drift.

Every reduction bridge step must point at one trace id and one rollback target.

## Current status

| Item                        | Status      | Notes                                                                                                                                                        |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scenario catalog            | complete    | fourteen baseline scenarios defined                                                                                                                          |
| Artifact naming             | complete    | future captures have fixed paths                                                                                                                             |
| Drift-budget policy         | complete    | strict vs bounded metrics defined                                                                                                                            |
| Observer capture harness    | complete    | `verification/golden_trace_capture.ts` now captures both system telemetry/control scenarios and standalone control specimens                                 |
| Persisted baseline captures | complete    | all fourteen `verification/traces/gt01..gt14/*` artifacts have been written and are now export-visible                                                       |
| Shadow consumers            | in progress | reduction shadow consumes `gt01`/`gt03`/`gt04`/`gt05`/`gt08`/`gt09`/`gt10`/`gt11`/`gt12`/`gt13`/`gt14`, while admission shadow consumes `gt04`/`gt06`/`gt07` |

## Artifact layout

Each baseline trace will eventually persist under:

- `verification/traces/<trace-id>/trace.json`
- `verification/traces/<trace-id>/codex_snapshot.json`
- `verification/traces/<trace-id>/invariants.json`
- `verification/traces/<trace-id>/notes.md`

Committed baseline set now exists for:

- `gt01_coldstart_seeded_swarm`
- `gt02_free_run_no_ingress`
- `gt03_pheromone_inject`
- `gt04_plasmid_inject`
- `gt05_homeostasis_correction`
- `gt06_daemon_admission_case`
- `gt07_daemon_policy_block`
- `gt08_structure_intent_visibility`
- `gt09_collective_transport`
- `gt10_share_transfer`
- `gt11_collective_banking`
- `gt12_collective_synchrony`
- `gt13_structure_lock_progress`
- `gt14_structure_charge_resolution`
- `gt15_structure_charge_competition`
- `gt16_runtime_build_materialization`
- `gt17_runtime_build_competition`
- `gt18_runtime_build_stale_lock`
- `gt19_tensegrity_kinematics`

Minimal `trace.json` payload:

- `trace_id`
- `scenario`
- `seed`
- `tick_start`
- `tick_end`
- `metrics`
- `event_log_digest`
- `codex_snapshot_digest`
- `invariant_digest`
- `runtime_mode`

## Drift-budget policy

Metrics are split into two classes:

- `strict`: must match exactly between legacy and bridge/shadow runs
- `bounded`: may drift within a stated numeric envelope

Initial policy:

- `strict`
  - tick count
  - accepted / rejected mutation counts
  - decree shifts
  - admission outcome
  - codex/invariant digests when LLM-free and daemon-free
- `bounded`
  - `avgEnergy`: absolute drift <= `max(1 raw unit, 2%)`
  - `spatialOverflowRatio`: absolute drift <= `0.01`
  - `population`: absolute drift <= `1` unless the scenario is
    mutation/admission sensitive

If a scenario cannot satisfy these bounds, it is not a valid bridge candidate
yet.

## Scenario catalog

| Trace ID                             | Scenario                                           | Setup / Inputs                                                                                                                                                             | Duration                                                     | Metrics Captured                                                                                                        | Baseline Artifact                                                   | Drift Threshold                                                                   | Existing support                                                                                                                                                                    |
| ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gt01_coldstart_seeded_swarm`        | coldstart / seeded swarm                           | cold boot, deterministic seed swarm, daemon off                                                                                                                            | `256` ticks                                                  | population, avgEnergy, overflow, mutation counts, invariant digest                                                      | `verification/traces/gt01_coldstart_seeded_swarm/trace.json`        | population `strict`, avgEnergy `bounded`, overflow `bounded`, invariants `strict` | `worker_seeded_swarm.ts`, `worker_determinism_capture.ts`                                                                                                                           |
| `gt02_free_run_no_ingress`           | free run without external intervention             | cold boot, no inject, no daemon policy updates                                                                                                                             | `2048` ticks                                                 | population, avgEnergy, overflow, decree shifts, mutation counts                                                         | `verification/traces/gt02_free_run_no_ingress/trace.json`           | tick/decree/mutation `strict`, energy/overflow `bounded`                          | `worker_trend_baseline.ts`, `worker_trend_math.ts`                                                                                                                                  |
| `gt03_pheromone_inject`              | bounded pheromone inject                           | warmup `128` ticks, then one fixed `DROP_PHEROMONE` payload                                                                                                                | `512` ticks total                                            | local response window, population, avgEnergy, overflow, invariant digest                                                | `verification/traces/gt03_pheromone_inject/trace.json`              | inject admission `strict`, energy/overflow `bounded`, invariants `strict`         | REST `/api/inject`, `worker_determinism_capture.ts`                                                                                                                                 |
| `gt04_plasmid_inject`                | durable symbolic ingress                           | warmup `128` ticks, then one fixed `INJECT_PLASMID` payload                                                                                                                | `512` ticks total                                            | accepted/rejected mutation counts, codex snapshot digest, invariant digest, population                                  | `verification/traces/gt04_plasmid_inject/trace.json`                | admission outcome `strict`, mutation counts `strict`, population/energy `bounded` | REST `/api/inject`, `worker_resilience_capture.ts`                                                                                                                                  |
| `gt05_homeostasis_correction`        | external homeostasis correction                    | warmup `256` ticks, then one fixed `/api/homeostasis` update                                                                                                               | `768` ticks total                                            | avgEnergy slope, overflow, homeostasis state digest, mutation counts                                                    | `verification/traces/gt05_homeostasis_correction/trace.json`        | homeostasis update `strict`, energy/overflow `bounded`, mutation counts `strict`  | REST `/api/homeostasis`, `worker_trend_math.ts`                                                                                                                                     |
| `gt06_daemon_admission_case`         | daemon admission / rejection                       | one accepted ingress case + one degraded/rejected case with daemon governance on                                                                                           | event-bounded                                                | admission severity, applied action, codex chronicle digest, dominant invariant digest                                   | `verification/traces/gt06_daemon_admission_case/trace.json`         | severity/action `strict`, codex/invariant digest `strict`                         | `test_daemon_governance_contract.ts`, `/api/codex/invariants`                                                                                                                       |
| `gt07_daemon_policy_block`           | daemon policy block                                | warmup `128` ticks, then one fixed blocked-opcode `INJECT_PLASMID` payload                                                                                                 | `256` ticks total                                            | http status, response reason, latest admission status/reason, mutation counts                                           | `verification/traces/gt07_daemon_policy_block/trace.json`           | status/reason/mutation counts `strict`                                            | `test_daemon_governance_contract.ts`, REST `/api/inject`                                                                                                                            |
| `gt08_structure_intent_visibility`   | same-tick structure intent visibility              | standalone deterministic subprocess capture of contended `BUILD` intents and `OP_SENSE` visibility under `1w` vs `4w` strict execution                                     | `1` tick / subprocess capture                                | strict hash match, sense visibility, conflict cell type/charge, snapshot digest                                         | `verification/traces/gt08_structure_intent_visibility/trace.json`   | hash/sense/type `strict`, charge `bounded`                                        | `test_structure_intent_determinism.ts`, `test_structure_lock_progress.ts`                                                                                                           |
| `gt09_collective_transport`          | standalone collective hive and pheromone semantics | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `0/1` hive store-load and mode `2` pheromone emit via direct WASM execution                            | `3` execute calls / subprocess capture                       | hive value, loaded reg0, pheromone word, snapshot digest                                                                | `verification/traces/gt09_collective_transport/trace.json`          | hive/reg/pheromone/digest `strict`                                                | `verification/collective_transport_capture.ts`, `test_swarm.ts`, `test_neural_synthesis.ts`                                                                                         |
| `gt10_share_transfer`                | standalone bonded share transfer semantics         | standalone deterministic subprocess capture of `OP_SHARE` successful bonded transfer and empty-bond no-op via direct WASM execution                                        | `2` execute calls / subprocess capture                       | successful sender energy, successful receiver energy, failed sender energy, failed receiver energy, snapshot digest     | `verification/traces/gt10_share_transfer/trace.json`                | all metrics `strict`                                                              | `verification/share_transfer_capture.ts`, `test_metabolism.ts`, `test_symbiosis.ts`                                                                                                 |
| `gt11_collective_banking`            | standalone collective banking semantics            | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `3` deposit and mode `4` capped withdraw via direct WASM execution                                     | `2` execute calls / subprocess capture                       | final hive balance, depositor energy, withdrawer energy, withdraw reg0, snapshot digest                                 | `verification/traces/gt11_collective_banking/trace.json`            | all metrics `strict`                                                              | `verification/collective_banking_capture.ts`, `test_metabolism.ts`, `test_neural_synthesis.ts`                                                                                      |
| `gt12_collective_synchrony`          | standalone collective synchrony semantics          | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `5` bonded phase-lock and mode `6` local quorum PC sync via direct WASM execution                      | `2` execute phases / subprocess capture                      | phase peer1 pc, phase peer2 pc, quorum peer1 pc, quorum peer2 pc, quorum outsider pc, snapshot digest                   | `verification/traces/gt12_collective_synchrony/trace.json`          | all metrics `strict`                                                              | `verification/collective_synchrony_capture.ts`, `test_swarm.ts`, `test_structure_lock_progress.ts`                                                                                  |
| `gt13_structure_lock_progress`       | standalone structure stale-lock progress           | standalone deterministic subprocess capture of `OP_SENSE` visibility through a stale structure lock plus `tick_structure_grid` intent clearing                             | `2` execute phases + `1` structure tick / subprocess capture | visible sense reg, typed miss sense reg, resolved cell type, resolved cell charge, snapshot digest                      | `verification/traces/gt13_structure_lock_progress/trace.json`       | all metrics `strict`                                                              | `verification/structure_lock_capture.ts`, `test_structure_lock_progress.ts`                                                                                                         |
| `gt14_structure_charge_resolution`   | standalone structure charge resolution             | standalone deterministic subprocess capture of `OP_PLUG` publishing a charge intent and `tick_structure_grid` resolving it into a concrete charged structure cell          | `1` execute phase + `1` structure tick / subprocess capture  | charge intent before tick, resolved cell type, resolved cell charge, snapshot digest                                    | `verification/traces/gt14_structure_charge_resolution/trace.json`   | all metrics `strict`                                                              | `verification/structure_charge_capture.ts`, `test_structure_lock_progress.ts`, `test_neural_synthesis.ts`                                                                           |
| `gt15_structure_charge_competition`  | standalone structure charge competition            | standalone deterministic subprocess capture of two `OP_PLUG` publications hitting the same cell in both `low->high` and `high->low` orderings                              | `4` execute calls + `1` structure tick / subprocess capture  | low->high charge intent, high->low charge intent, low->high resolved charge, high->low resolved charge, snapshot digest | `verification/traces/gt15_structure_charge_competition/trace.json`  | all metrics `strict`                                                              | `verification/structure_charge_competition_capture.ts`, `verification/structure_charge_capture.ts`, `test_structure_lock_progress.ts`                                               |
| `gt16_runtime_build_materialization` | runtime structure build materialization            | worker-backed deterministic subprocess capture of a single architect executing `OP_BUILD SOURCE` through `PULSE.tick`                                                      | `1` pulse tick / subprocess capture                          | target resolved type, target resolved charge, owner intent after tick, value intent after tick, snapshot digest         | `verification/traces/gt16_runtime_build_materialization/trace.json` | all metrics `strict`                                                              | `verification/structure_build_runtime_capture.ts`, `test_neural_synthesis.ts`, `test_structure_intent_determinism.ts`                                                               |
| `gt17_runtime_build_competition`     | runtime structure build competition                | worker-backed deterministic subprocess capture of two architects publishing competing `OP_BUILD SOURCE` intents into the same cell through `PULSE.tick`                    | `1` pulse tick / subprocess capture                          | target resolved type, target resolved charge, target resolved state, owner intent after tick, snapshot digest           | `verification/traces/gt17_runtime_build_competition/trace.json`     | all metrics `strict`                                                              | `verification/structure_build_competition_capture.ts`, `verification/structure_build_runtime_capture.ts`, `test_structure_intent_determinism.ts`                                    |
| `gt18_runtime_build_stale_lock`      | runtime structure build stale-lock fallback        | worker-backed deterministic subprocess capture of a single architect attempting `OP_BUILD SOURCE` into a cell carrying a stale locked `SOURCE` intent through `PULSE.tick` | `1` pulse tick / subprocess capture                          | target resolved type, target resolved charge, target resolved state, owner intent after tick, snapshot digest           | `verification/traces/gt18_runtime_build_stale_lock/trace.json`      | all metrics `strict`                                                              | `verification/structure_build_lock_capture.ts`, `verification/structure_build_runtime_capture.ts`, `verification/structure_lock_capture.ts`, `test_structure_intent_determinism.ts` |
| `gt19_tensegrity_kinematics`         | standalone tensegrity kinematics and bonding       | standalone deterministic capture of `OP_TENSEGRITY` setting bond distances and damping, executing physics to resolve forces                                                | `100` physics ticks execution / subprocess capture           | final distance, final damping, snapshot digest                                                                          | `verification/traces/gt19_tensegrity_kinematics/trace.json`         | final damping / digest `strict`, final distance `bounded`                         | `verification/tensegrity_capture.ts`, `test_tensegrity.ts`                                                                                                                          |
| `gt20_bind_resolution`               | standalone symbiotic bond request resolution       | standalone deterministic subprocess capture of `OP_BIND` requests and their resolution                                                                                     | `1` execute call / subprocess capture                        | bond status, bond ID, snapshot digest                                                                                   | `verification/traces/gt20_bind_resolution/trace.json`               | all metrics `strict`                                                              | `verification/bind_capture.ts`, `test_symbiosis.ts`                                                                                                                                 |

## Capture rules

For each golden trace:

1. daemon must be off unless the scenario explicitly tests daemon governance,
2. control inputs must be fixed and serialized in `notes.md`,
3. the same runtime policy env must be recorded,
4. if codex is enabled, codex snapshot and invariant digest must be persisted
   with the trace,
5. any scenario that crosses an epoch boundary must record the exact epoch tick
   in the baseline.

## Existing support signals

Useful existing support files to draw from:

- `worker_determinism_capture.ts`
- `worker_resilience_capture.ts`
- `worker_seeded_swarm.ts`
- `worker_trend_baseline.ts`
- `worker_trend_math.ts`
- `verification/golden_trace_capture.ts`
- `test_structure_intent_determinism.ts`
- `test_structure_lock_progress.ts`

## Exit condition for this document

This file is actionable when:

- each baseline scenario has a concrete reproducible procedure,
- baseline artifacts are named,
- acceptable drift thresholds are explicit,
- the next implementation step can reference a trace id instead of hand-waving
  about "similar enough".

Current exit assessment:

- scenario procedures: satisfied
- artifact persistence: satisfied
- export visibility: satisfied
- next blocker: widen shadow consumers only when they map to a real trace id and
  an explicit rollback path

```

---

## FILE: docs/migration/HORMONE_LEDGER_CONTRACT.md

```markdown
# Hormone / Ledger Contract

> Stage 7 contract scaffold. This document formalizes the physiological knobs
> before they are wired into live runtime ownership.

## Purpose

Stage 7 needs two explicit layers:

- `HORMONE_BUFFER`: the current global physiological field
- `GENETIC_LEDGER`: the bounded registry of mutable global constants

The point is not "more configuration". The point is to stop letting important
global knobs live as disconnected ad-hoc controller state.

## Current code-backed scaffold

The Stage 7 code-backed surface now exists in:

- [HORMONE_BUFFER.ts](/Users/s0fractal/OMEGA/HORMONE_BUFFER.ts)
- [GENETIC_LEDGER.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER.ts)
- [GENETIC_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER_RUNTIME.ts)

`HORMONE_BUFFER.ts` remains observational. `GENETIC_LEDGER.ts` is now partially
live through five runtime controllers:

- `pulse.homeostasis.baseTax` in `GENETIC_LEDGER_RUNTIME.ts`
- `pulse.homeostasis.targetEnergy` in
  [HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts)
- `pulse.pressureRing.scale` in
  [PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts)
- `daemon.maxPheromoneIntensity` in
  [DAEMON_PHEROMONE_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/DAEMON_PHEROMONE_LEDGER_RUNTIME.ts)
- `daemon.maxPlasmidCharge` in
  [DAEMON_PLASMID_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/DAEMON_PLASMID_LEDGER_RUNTIME.ts)

Durable replay now lives in five persistence lanes:

- [GENETIC_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER_PERSISTENCE.ts)
- [HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts)
- [PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts)
- [DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts)
- [DAEMON_PLASMID_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/DAEMON_PLASMID_LEDGER_PERSISTENCE.ts)

Both persistence lanes now include snapshot compaction, so hydration runs
through `snapshot + tail log` instead of replaying an unbounded event stream.

Executable guards:

- [test_hormone_buffer_contract.ts](/Users/s0fractal/OMEGA/test_hormone_buffer_contract.ts)
- [test_genetic_ledger_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_contract.ts)
- [test_genetic_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_runtime_contract.ts)
- [test_genetic_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_persistence_contract.ts)
- [test_genetic_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_compaction_contract.ts)
- [test_homeostasis_target_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_target_ledger_runtime_contract.ts)
- [test_homeostasis_target_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_target_ledger_persistence_contract.ts)
- [test_homeostasis_target_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_target_ledger_compaction_contract.ts)
- [test_homeostasis_target_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_target_ledger_path_contract.ts)
- [test_pressure_ring_scale_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_scale_ledger_runtime_contract.ts)
- [test_pressure_ring_scale_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_scale_ledger_persistence_contract.ts)
- [test_pressure_ring_scale_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_scale_ledger_compaction_contract.ts)
- [test_pressure_ring_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_ledger_path_contract.ts)
- [test_daemon_pheromone_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_runtime_contract.ts)
- [test_daemon_pheromone_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_persistence_contract.ts)
- [test_daemon_pheromone_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_compaction_contract.ts)
- [test_daemon_pheromone_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_path_contract.ts)
- [test_daemon_plasmid_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_runtime_contract.ts)
- [test_daemon_plasmid_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_persistence_contract.ts)
- [test_daemon_plasmid_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_compaction_contract.ts)
- [test_daemon_plasmid_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_path_contract.ts)
- [test_hormone_ledger_alignment_contract.ts](/Users/s0fractal/OMEGA/test_hormone_ledger_alignment_contract.ts)
- [test_homeostasis_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_ledger_path_contract.ts)

## `HORMONE_BUFFER`

Current hormone ids:

1. `entropy_pressure`
2. `time_viscosity`
3. `aggression`
4. `replication_bias`
5. `repair_drive`
6. `mutation_friction`

Each hormone must expose:

- `id`
- `index`
- `domain`
- `min`
- `max`
- `defaultValue`
- `controlPlane`
- `sourcePath`
- `notes`

Current rule:

- hormone values are normalized bounded scalars
- defaults are derived from current runtime policy
- no hormone is yet authoritative over live mutation flow

## `GENETIC_LEDGER`

The ledger is the bounded registry for global knobs that can later be changed
by:

- daemon governance
- bounded runtime homeostasis
- future rollback-aware physiology

Each entry must expose:

- `key`
- `defaultValue`
- `min`
- `max`
- `mutability`
- `hormoneLink`
- `rollbackClass`
- `sourcePath`
- `notes`

Current initial ledger surface includes:

- pulse homeostasis knobs
- pressure-ring scale
- daemon ingress budgets
- federation degrade ratios

## Design law

Do not put everything in the ledger.

Only global numbers that actually alter world-level dynamics belong here.

This is not a bag of constants. It is the candidate constitutional layer for
physiology.

## Stage 7 gate

This stage becomes real only when:

1. live runtime knobs can be mapped to a hormone or a ledger entry
2. hard invariants remain outside the ledger
3. every ledger mutation has a rollback class
4. daemon controllers can be described as ledger/hormone updates instead of
   ad-hoc API pokes

## Current scope limit

At this point:

- there is no live `SharedArrayBuffer` hormone region yet
- there is now a durable event log for `pulse.homeostasis.baseTax` at
  `.omega/ledger/base_tax_ledger.jsonl`
- there is now a compacted snapshot for long-lived base-tax history at
  `.omega/ledger/base_tax_ledger.snapshot.json`
- there is now a durable event log for `pulse.pressureRing.scale` at
  `.omega/ledger/pressure_ring_scale_ledger.jsonl`
- there is now a compacted snapshot for long-lived pressure-ring scale history
  at `.omega/ledger/pressure_ring_scale_ledger.snapshot.json`
- there is now a durable event log for `pulse.homeostasis.targetEnergy` at
  `.omega/ledger/target_energy_ledger.jsonl`
- there is now a compacted snapshot for long-lived target-energy history at
  `.omega/ledger/target_energy_ledger.snapshot.json`
- there is now a durable event log for `daemon.maxPheromoneIntensity` at
  `.omega/ledger/daemon_pheromone_ledger.jsonl`
- there is now a compacted snapshot for long-lived daemon pheromone history at
  `.omega/ledger/daemon_pheromone_ledger.snapshot.json`
- there is now a durable event log for `daemon.maxPlasmidCharge` at
  `.omega/ledger/daemon_plasmid_ledger.jsonl`
- there is now a compacted snapshot for long-lived daemon plasmid history at
  `.omega/ledger/daemon_plasmid_ledger.snapshot.json`
- there is still no general persistence layer for the rest of the ledger surface
- there is no runtime write path through `HORMONE_BUFFER`
- there is one established live ledger-owned write path:
  - `pulse.homeostasis.baseTax`
  - routed through `GENETIC_LEDGER_RUNTIME.ts`
  - persisted and replayed through `GENETIC_LEDGER_PERSISTENCE.ts`
  - exposed via `PULSE.applyGeneticLedgerUpdate(...)`
  - reverted via rollback token through `PULSE.rollbackGeneticLedgerUpdate(...)`
  - no longer writable through ad-hoc `PULSE.updateHomeostasisPolicy(...)`
- there is now a second live ledger-owned write path:
  - `pulse.homeostasis.targetEnergy`
  - routed through `HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts`
  - persisted and replayed through `HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts`
  - exposed via `PULSE.applyGeneticLedgerUpdate(...)`
  - reverted via rollback token through `PULSE.rollbackGeneticLedgerUpdate(...)`
  - no longer writable through ad-hoc `PULSE.updateHomeostasisPolicy(...)`
- there is now a third live ledger-owned write path:
  - `pulse.pressureRing.scale`
  - routed through `PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts`
  - persisted and replayed through `PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts`
  - exposed via `PULSE.applyGeneticLedgerUpdate(...)`
  - reverted via rollback token through `PULSE.rollbackGeneticLedgerUpdate(...)`
  - no longer writable through ad-hoc `PULSE.updateEvolutionPressureRing(...)`
- there is now a fourth live ledger-owned write path:
  - `daemon.maxPheromoneIntensity`
  - routed through `DAEMON_PHEROMONE_LEDGER_RUNTIME.ts`
  - persisted and replayed through `DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts`
  - exposed via `POST /api/daemon-policy`
  - reverted via rollback token through `POST /api/daemon-policy`
  - synchronized into live daemon ingress limits via
    `syncDaemonIngressMaxPheromoneIntensity(...)`
  - no longer governed only by a frozen `DAEMON_INGRESS_POLICY_LIMITS` value
- there is now a fifth live ledger-owned write path:
  - `daemon.maxPlasmidCharge`
  - routed through `DAEMON_PLASMID_LEDGER_RUNTIME.ts`
  - persisted and replayed through `DAEMON_PLASMID_LEDGER_PERSISTENCE.ts`
  - exposed via `POST /api/daemon-policy`
  - reverted via rollback token through `POST /api/daemon-policy`
  - synchronized into live daemon ingress limits via
    `syncDaemonIngressMaxPlasmidCharge(...)`
  - no longer governed only by a frozen `DAEMON_INGRESS_POLICY_LIMITS` value

That is intentional. The contract is moving from zero runtime ownership to one
bounded ownership move, not to an open-ended configuration plane.

## Current status

As of 2026-03-06 this layer is:

- code-backed
- export-visible
- contract-tested
- observer-visible through `/api/physiology`
- partially authoritative over live runtime causality for ledger-owned
  `baseTax`, `targetEnergy`, `pressureRing.scale`, and
  `daemon.maxPheromoneIntensity`, `daemon.maxPlasmidCharge`
- durable enough that `baseTax` rollback tokens survive restart through replay
- compact enough that `baseTax` hydration can reload from snapshot + bounded
  tail
- durable enough that `targetEnergy` rollback tokens survive restart through
  replay
- compact enough that `targetEnergy` hydration can reload from snapshot +
  bounded tail
- durable enough that `pressureRing.scale` rollback tokens survive restart
  through replay
- compact enough that `pressureRing.scale` hydration can reload from snapshot +
  bounded tail
- durable enough that `daemon.maxPheromoneIntensity` rollback tokens survive
  restart through replay
- compact enough that `daemon.maxPheromoneIntensity` hydration can reload from
  snapshot + bounded tail
- durable enough that `daemon.maxPlasmidCharge` rollback tokens survive restart
  through replay
- compact enough that `daemon.maxPlasmidCharge` hydration can reload from
  snapshot + bounded tail
- observer-visible through `/api/homeostasis` and `/api/physiology` with
  `ledger_base_tax_persistence` and `ledger_target_energy_persistence`
- observer-visible through `/api/pressure-ring` and `/api/physiology` with
  `ledger_scale_persistence` / `ledger_pressure_ring_scale_persistence`
- observer-visible through `/api/daemon-policy`, `/api/telemetry`, and
  `/api/physiology` with `ledger_max_pheromone_intensity` and
  `ledger_max_pheromone_intensity_persistence`
- observer-visible through `/api/daemon-policy`, `/api/telemetry`, and
  `/api/physiology` with `ledger_max_plasmid_charge` and
  `ledger_max_plasmid_charge_persistence`

```

---

## FILE: docs/migration/OMEGA_TRANSITION_PLAN.md

```markdown
# OMEGA Transition Plan

> Contract document. This file describes migration sequencing, not
> implementation approval.

## Principle of transition

Do not perform a big-bang rewrite.

Use a dual system where the new reduction-native layer first:

1. observes
2. reproduces
3. cross-checks
4. only then takes over causality

This matters because the current system already has:

- a canonical governance lane through `GATE`
- internal fast mutation lanes
- external ingress that must not mutate `STATE_MATRIX` directly
- queue and telemetry mechanisms for mutation flow

## Progress status

Adjacent future-vector artifacts:

- [docs/migration/ROADMAP_2_SIGMA_CORE.md](/Users/s0fractal/OMEGA/docs/migration/ROADMAP_2_SIGMA_CORE.md)

Status snapshot as of 2026-03-06:

| Workstream                                    | Status      | Deliverable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkpoint 0 planning surface                 | in progress | this file + causal atlas + golden traces + export inclusion + persisted baseline artifacts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Stage 1 owner classification                  | in progress | [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md) now contains the first critical-mutation table                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Stage 2 baseline definition                   | complete    | markdown contract + code-backed catalog + observer capture harness + committed `verification/traces/gt01..gt18/*` baseline artifacts                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Stage 3 IR contract                           | in progress | [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md) is now backed by non-runtime bridge code, including bounded `JZ`, `COLLECTIVE`, `SHARE`, and honest worker-backed `BUILD` owner-arbitration + stale-lock coverage for symbolic/transport semantics                                                                                                                                                                                                                                                                                            |
| Stage 4 shadow verification                   | in progress | reduction shadow covers `gt01`/`gt03`/`gt04`/`gt05`/`gt08`/`gt09`/`gt10`/`gt11`/`gt12`/`gt13`/`gt14`/`gt15`/`gt16`/`gt17`/`gt18`, while [admission_shadow_harness.ts](/Users/s0fractal/OMEGA/verification/admission_shadow_harness.ts) covers `gt04`/`gt06`/`gt07` daemon-policy cases with persisted diff artifacts                                                                                                                                                                                                                                                                              |
| Stage 5 internal transport                    | complete    | external pheromone/plasmid inject now seeds a shared `GLYPH_BUFFER`; host-lock advances bounded transport decay/diffusion, telemetry exposes `glyph_transport`, `assembly/index.ts` now reads glyph gradients inside `calculateTrophism(...)`, internal emission leaks from `signalGrid` and `memoryGrid`, and role-based secretion policies are now canonical in λ-VM.                                                                                                                                                                                                                           |
| Stage 6 codex evidence bridge                 | in progress | `AKASHA_CODEX.ts` now records `glyph_transport_regime` chronicles from runtime transport snapshots, maintains live glyph regime state inside narrative/snapshot outputs, forwards that evidence through the daemon-facing codex narrative contract, attaches glyph transport context to blocked/degraded daemon admission chronicles, feeds bounded glyph pressure into daemon admission scoring via read-only narrative context, records deferred daemon effect chronicles once queued actions are evaluated, and projects the latest daemon effect contour back into narrative/snapshot outputs |
| Stage 7 physiological contract                | in progress | `pulse.homeostasis.baseTax`, `pulse.homeostasis.targetEnergy`, `pulse.pressureRing.scale`, `daemon.maxPheromoneIntensity`, and `daemon.maxPlasmidCharge` are now ledger-owned, rollback-tokenized, replayable, and compacted through dedicated runtime/persistence lanes, while the rest of the layer remains bounded and observational                                                                                                                                                                                                                                                           |
| Stage 8 metabolism promotion                  | complete    | Guardian, Architect, and Replication drivers are promoted to `hybrid-reduce` mode after successful shadow verification and long-run audits.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Stages 21-28: Pure Kernel & Sovereign Economy | complete    | Implemented the Doll Fork, Adaptive Genesis, Memory Matrix, Sovereign Feedback, Immune Phagocytes, Universal Syscall ABI, and Deterministic Gas Economy (Bounded Reduction). The WASM runtime is now a fully self-contained, energy-bounded, mathematically safe Turing kernel.                                                                                                                                                                                                                                                                                                                   |

Current rule:

- no runtime causality moves to reduction until the corresponding golden trace
  exists and has a stated rollback path
- observer-only telemetry surfaces may expand if needed to make the traces
  measurable without mutating causality

## Checkpoint 0: break nothing

### Goal

Freeze the current world as a control specimen.

### Required planning artifacts

- [docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md)
- [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
- [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md)

### Runtime roots to freeze as causal surface

- `AKASHA_SERVER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `PULSE_WORKER.ts`
- `PULSE.ts`
- `SYSTEM_START.ts`

### Runtime closure focus

The migration zone includes at least:

- `GATE.ts`
- `STATE_MATRIX.ts`
- `AKASHA_CODEX.ts`
- `PHYSICS_ENGINE.ts`
- `MUTATION_TELEMETRY.ts`
- `STATE_SNAPSHOT.ts`
- `TELEMETRY_STREAM.ts`

### Experimental source layer

The main reduction candidates are:

- `LAMBDA_VM.ts`
- `RIBOSOME_TICK.ts`
- `ECOLOGY_ENGINE.ts`
- `REFLECTION_ENGINE.ts`
- `MATRIX_ENGINE.ts`

### Exit gate

- the causal surface is explicitly listed
- 3-5 golden scenarios are defined before runtime bridge work begins

## Stage 1: Causal Atlas

### Goal

Map who actually governs the world.

### Required file format

For each important node record:

- `owner`
- `reads`
- `writes`
- `mutation_type`
- `determinism_risk`
- `future_target_layer`

### Minimum files to classify

- `PULSE.ts`
- `PULSE_WORKER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `AKASHA_SERVER.ts`
- `AKASHA_CODEX.ts`
- `GATE.ts`
- `STATE_MATRIX.ts`

### Mutation categories

- `physics`
- `governance`
- `transport`
- `memory`
- `observer`
- `bootstrap`

### Exit gate

- top-20 highest-risk mutations identified
- each critical mutation tagged as:
  - keep
  - wrap
  - move to ledger
  - move to reduction

## Stage 2: Golden Traces and verification harness

### Goal

Make the bridge measurable.

### Minimum scenarios

1. coldstart / seeded swarm
2. several thousand ticks without external intervention
3. pheromone inject
4. plasmid inject
5. homeostasis correction
6. daemon admission / rejection case

### Existing support signals

Current support files already suggest the trace direction:

- `worker_determinism_capture.ts`
- `worker_resilience_capture.ts`
- `worker_seeded_swarm.ts`
- `worker_trend_baseline.ts`
- `worker_trend_math.ts`

### What to capture

- tick count
- population
- avgEnergy
- spatial overflow
- mutation counts
- decree shifts
- codex snapshot digest
- invariant digest

### Exit gate

- before/after drift is measurable for each golden scenario
- baseline traces exist before any causal ownership migration

### Current stage assessment

- baseline scenarios are now committed under `verification/traces/`
- `verification/golden_trace_capture.ts` provides the reproducible observer
  harness
- `verification/golden_trace_catalog.ts` and
  `verification/golden_trace_capture.ts` now pass `deno check`, so the baseline
  layer is type-clean as well as artifact-backed
- Stage 2 now also supports standalone subprocess captures, so a causal motif
  that currently lives in a strict deterministic test harness can still become a
  first-class golden trace without inventing a fake REST ingress path
- Stage 2 now covers two standalone causal motifs outside the REST server:
  same-tick structure-intent visibility (`gt08`) and bounded collective hive /
  pheromone transport (`gt09`)
- Stage 2 now also covers bounded local share-transfer semantics (`gt10`), so
  direct bonded energy exchange has a committed control specimen before wider
  metabolic bridge work
- Stage 2 now also covers bounded collective banking semantics (`gt11`), so
  direct `OP_COLLECTIVE` mode `3/4` deposit-withdraw behavior has a committed
  control specimen before wider hive-economy bridge work
- Stage 2 now also covers bounded collective synchrony semantics (`gt12`), so
  direct `OP_COLLECTIVE` mode `5/6` phase-lock and quorum sync behavior has a
  committed control specimen before wider coordination bridge work
- `verification/reduction_harness.ts` now covers the bridge-safe opcode subset
- `verification/admission_shadow_harness.ts` now covers daemon
  mutation/admission semantics, including explicit policy-block baselines,
  without pretending they already belong to the reduction bridge
- next implementation step is no longer generic baseline-definition prose; it is
  either widening bridge semantics where a real trace demands it or moving a
  verified subset into a stricter hybrid path
- Stage 7 observer surfaces now expose `ledger_base_tax_persistence`, so
  persistence/compaction state is visible alongside the first live ledger-owned
  knob
- `baseTax` now has one canonical mutation lane:
  `PULSE.updateHomeostasisPolicy(...)` no longer accepts it, so runtime overlay
  and ledger ownership are no longer mixed for the same knob
- `targetEnergy` now has one canonical mutation lane:
  `PULSE.updateHomeostasisPolicy(...)` no longer accepts it either, so the live
  homeostasis contour is now ledger-owned instead of split between overlay and
  constitutional state
- `pressureRing.scale` now has one canonical mutation lane:
  `PULSE.updateEvolutionPressureRing(...)` no longer accepts it, so phase
  controls and ledger-owned amplitude no longer compete for the same causal slot
- `daemon.maxPheromoneIntensity` now has one canonical mutation lane:
  `/api/daemon-policy` routes through a dedicated ledger runtime/persistence
  pair, so daemon ingress economics no longer depend on a frozen in-memory
  constant or an ad-hoc policy poke
- `daemon.maxPlasmidCharge` now has one canonical mutation lane:
  `/api/daemon-policy` routes plasmid-budget updates through a dedicated ledger
  runtime/persistence pair, so daemon plasmid economics no longer depend on a
  startup-time constant

## Stage 3: Introduce `GlyphIR64`

### Goal

Build a true bridge between legacy ISA and reduction execution.

### Planned files

- `reduction_core/GlyphIR64.ts`
- `runtime_bridge/opcode_to_glyph.ts`
- `runtime_bridge/glyph_pretty.ts`
- contract first:
  [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md)

### Minimum structure

Each glyph entry should expose:

- `id: 0..63`
- `kind`
- `arity`
- `energyCost`
- `stabilityClass`
- `reductionRuleRef`
- `legacyOpcode?`

### Rules

- `0..3 = S/K/I/Y`
- the remaining glyph space starts as classes, not final protein semantics

### Suggested class groups

- structural
- catalytic
- transport
- regulatory
- memory
- reserve/noise

### Exit gate

- first 10-15 common legacy opcodes mapped into `GlyphIR64`
- readable forward and reverse debug views exist

## Stage 4: Reduction harness outside production

### Goal

Turn `RIBOSOME_TICK` and `LAMBDA_VM` into a verification engine, not production
causality.

### Planned files

- `verification/reduction_harness.ts`
- `verification/reduction_cases.ts`

### Harness responsibility

Run:

- the legacy script
- its `GlyphIR64` representation
- bounded reduction
- effect comparison

### First target scope

Only low-width behavior first:

- `signal`
- `replicate`
- `role`
- simple conditional/jump patterns
- simple local interactions

### Exit gate

- at least one complete atom life cycle is reproducible through the reduction
  harness
- mismatches are logged and explained, not hand-waved

### Current stage assessment

- `verification/reduction_cases.ts` now provides eighteen bounded bridge cases
- `verification/reduction_harness.ts` runs parity between legacy shadow
  execution and glyph-reduction shadow execution
- `verification/reduction_diffs/*.json` now persists structured diff artifacts
  for every covered case
- current covered motifs:
  - seeded replicator loop
  - seeded architect loop
  - guardian stable branch
  - guardian repair branch
  - plasmid property-write signal branch
  - plasmid zero-branch repair path
  - structure-intent same-tick visible branch
  - structure-intent typed miss branch
  - collective hive store/load branch
  - collective local pheromone emission branch
  - share bonded transfer success branch
  - share empty-bond fail-closed branch
  - collective bank deposit branch
  - collective capped withdraw branch
  - collective bonded phase-lock branch
  - collective local quorum sync branch
  - homeostasis-band anchor match
  - homeostasis-band anchor mismatch
- `verification/reduction_harness.ts` now tracks final prop-state parity, so
  bridge cases that depend on `PUT` validate actual symbolic writes instead of
  only register/control-flow parity
- `verification/reduction_harness.ts` now also models a bounded structure-intent
  overlay for `OP_BUILD` + `OP_SENSE`, so structural visibility can be verified
  against `gt08_structure_intent_visibility` without pretending it already rides
  through a membrane/API trace
- `verification/reduction_harness.ts` now also models bounded `OP_COLLECTIVE`
  mode 0/1/2 semantics, so hive store/load and local pheromone emission can be
  verified against `gt09_collective_transport` before any broader collective
  runtime hybridization
- `verification/reduction_harness.ts` now also models bounded `OP_SHARE`
  semantics, so bonded percentage transfer and empty-slot fail-closed behavior
  can be verified against `gt10_share_transfer` before broader metabolic or
  symbiotic bridge work
- `verification/reduction_harness.ts` now also models bounded `OP_COLLECTIVE`
  mode `3/4` semantics, so deposit and capped withdraw behavior can be verified
  against `gt11_collective_banking` before broader hive-economy or collective
  runtime hybridization
- `verification/reduction_harness.ts` now also models bounded `OP_COLLECTIVE`
  mode `5/6` semantics, so bonded phase-lock and local quorum sync can be
  verified against `gt12_collective_synchrony` before broader coordination or
  collective runtime hybridization
- `verification/reduction_harness.ts` now also models stale-lock `OP_SENSE`
  visibility against seeded structure overlays, so forward progress through
  stale structure locks can be verified against `gt13_structure_lock_progress`
  before deeper structure-lock bridge work
- `verification/reduction_harness.ts` now also supports a narrow
  `postStructureTick` flush plus charge-intent state, so `OP_PLUG` publication
  and bounded charge materialization can be verified against
  `gt14_structure_charge_resolution` before any broader attempt to bridge the
  full structure engine
- `verification/reduction_harness.ts` now also preserves `OP_PLUG` max-intent
  semantics across repeated publications into the same cell, so
  `gt15_structure_charge_competition` can verify competitive charge publication
  without pretending the structure engine has already been fully reduced
- `verification/structure_build_runtime_capture.ts` now provides a first honest
  worker-backed `OP_BUILD` control specimen via `PULSE.tick`, and
  `verification/reduction_harness.ts` now mirrors bounded `SOURCE` charge
  semantics so `gt16_runtime_build_materialization` can anchor BUILD parity
  without claiming the whole structure engine is already bridged
- `verification/structure_build_competition_capture.ts` now provides an honest
  worker-backed `OP_BUILD` competition specimen via `PULSE.tick`, and
  `verification/reduction_harness.ts` now carries owner-token-aware BUILD intent
  publication so `gt17_runtime_build_competition` can anchor builder arbitration
  parity without claiming the whole structure engine is already bridged
- `verification/structure_build_lock_capture.ts` now provides an honest
  worker-backed `OP_BUILD` stale-lock specimen via `PULSE.tick`, and
  `verification/reduction_harness.ts` now verifies that a locked owner blocks
  competing BUILD publication while `postStructureTick` still materializes the
  locked SOURCE value for `gt18_runtime_build_stale_lock`
- known bridge limit:
  - the current bridge subset only has `Imm8` policy anchors, so
    `gt05 target_energy=300` cannot yet be encoded directly
  - current `gt05` cases therefore use the representable `band=240` anchor
    rather than claiming full homeostasis semantics
- mutation-sensitive admission coverage now lives in
  `verification/admission_shadow_harness.ts`, anchored to `gt04_plasmid_inject`,
  `gt06_daemon_admission_case`, and `gt07_daemon_policy_block`
- next gate is no longer "cover `gt04` somehow"; it is deciding whether a real
  compare/range primitive belongs in the bridge, or whether those policy-first
  cases should remain outside reduction for now

## Stage 5: Transport becomes internal

### Goal

Move glyph transport from membrane-only behavior into world physics.

### Current baseline

`AKASHA_SERVER.ts` already normalizes and proxies:

- `DROP_PHEROMONE`
- `INJECT_PLASMID`
- `/api/inject`
- `/api/homeostasis`
- `/api/pressure-ring`

This is a good membrane, but not yet an internal circulatory system.

### Current stage assessment

- `OFFSETS.ts` and `STATE_MATRIX.ts` now reserve and expose a shared
  `GLYPH_BUFFER` as `glyphHeaders + glyphPayload`.
- `AVATAR_ENGINE.ts` and `CONTROL_INTENT_QUEUE.ts` now seed that substrate from
  existing pheromone / plasmid ingress without breaking the current membrane.
- `PULSE.ts` now advances bounded glyph decay/diffusion during host lock.
- `SYSTEM_START.ts` now exposes `glyph_transport` through observer surfaces.
- `assembly/index.ts` now reads glyph gradients inside `calculateTrophism(...)`,
  so the transport field has a real local behavioral effect in the WASM plane.
- `GLYPH_BUFFER.ts` now leaks `signalGrid` into pheromone glyph packets and
  `memoryGrid` into plasmid glyph packets, so Stage 5 has two internal emission
  sources that do not depend on REST ingress.
- `PULSE.ts` now lets a bounded subset of active atoms emit pheromone and
  plasmid glyph packets directly during host lock, so Stage 5 now has a first
  agent-driven internal producer instead of only membrane ingress or substrate
  leakage.
- that agent-driven producer is now role-shaped: guardians bias toward pheromone
  emission, architects bias toward plasmid emission, producers can do both under
  tighter gates, parasites leak plasmids, and observer surfaces can inspect the
  per-role emission counters.
- broad wasm-native secretion is still deferred; Stage 5 is now real, but not
  yet complete.

### Planned substrate additions

- `GLYPH_BUFFER` compatible with `STATE_MATRIX`
- local `glyph packet` structures
- per-glyph transport attributes:
  - `half_life`
  - `diffusion_radius`
  - `decay_profile`

### Transition order

1. external inject still works
2. injected glyph enters the internal buffer
3. local nodes read glyph influence from buffer
4. internal auto-emission is added later

### Exit gate

- at least two internal glyph emission sources exist without REST
- at least one local behavior depends on glyph buffer state

## Stage 6: Codex becomes evidence engine

### Goal

Protect the strongest existing layer by upgrading it, not bypassing it.

### Current strengths

`AKASHA_CODEX.ts` already tracks:

- species
- chronicles
- relics
- daemon invariants
- snapshots / narratives / lineage profiles
- extinction, decree shifts, market outcomes, daemon admission

### New entities to introduce

- `reduction_trace_digest`
- `glyph_lineage`
- `semantic_mutation_proposal`
- `rollback_candidate`
- `invariant_drift_budget`

### New Codex responsibility

Codex should answer:

- what changed
- why the change was admissible
- whether the drift was semantic or ecological

### Current stage assessment

- `AKASHA_CODEX.observePulse(...)` now receives runtime glyph transport
  snapshots from `PULSE.ts`, not just population counts.
- Codex now classifies the transport field into a `glyph_transport_regime`
  evidence signal and records regime changes as chronicles instead of leaving
  transport trapped in raw telemetry.
- Codex narrative/snapshot outputs now retain live glyph status, dominant role,
  and source mode, so daemon-side reasoning can see transport ecology without
  scraping raw runtime telemetry.
- Blocked/degraded daemon admission chronicles now retain glyph transport
  context, so transport regime and ingress policy pressure can be audited in the
  same codex evidence chain.
- Glyph regime / dominant-role evidence now also contributes a bounded pressure
  term inside `evaluateInvariantAdmission(...)`, but only through normalized
  codex narrative context rather than raw runtime transport state.
- Deferred daemon effect evaluation now also lands in Codex as `daemon_effect`
  chronicles, so the evidence chain can extend from ingress decision to observed
  runtime delta.
- Codex narrative/snapshot outputs now also retain a compact `daemonEffect`
  contour, so observer tooling and daemon reasoning can consume the latest
  outcome signal without scraping raw chronicle history.
- This is still a bridge, not a full Codex upgrade: transport evidence now
  reaches daemon admission scoring and post-admission effect chronicles, but it
  still does not drive rollback policy or mutation pricing on its own.

### Exit gate

- every serious mutation/admission event has a codex evidence trail
- chain exists:
  `mutation -> invariant response -> daemon decision -> lineage effect`

## Stage 7: Formal homeostasis layer

### Goal

Move daemon tuning into a canonical physiological layer.

### Planned artifacts

- `HORMONE_BUFFER`
- `GENETIC_LEDGER`
- `HOMEOSTASIS_POLICY.md`

### Minimum hormone fields

- `entropy_pressure`
- `time_viscosity`
- `aggression`
- `replication_bias`
- `repair_drive`
- `mutation_friction`

### Genetic ledger requirements

For each global dynamic constant:

- current value
- min/max
- source
- last change tick
- reason
- rollback token

### Exit gate

- no globally meaningful dynamic number floats without owner and bounds
- daemon acts through physiological knobs, not direct world rewriting

### Current stage assessment

- `HORMONE_BUFFER.ts` now defines the initial six-hormone physiological catalog:
  - `entropy_pressure`
  - `time_viscosity`
  - `aggression`
  - `replication_bias`
  - `repair_drive`
  - `mutation_friction`
- `GENETIC_LEDGER.ts` now defines the initial bounded registry for homeostasis,
  pressure-ring, daemon ingress, and federation degrade knobs.
- [docs/migration/HORMONE_LEDGER_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/HORMONE_LEDGER_CONTRACT.md)
  is now the explicit Stage 7 contract artifact and is included in export.
- `PHYSIOLOGY_SNAPSHOT.ts` plus `GET /api/physiology` now provide an
  observer-only runtime projection of hormone / ledger state through
  `SYSTEM_START.ts` and `AKASHA_SERVER.ts`.
- `GENETIC_LEDGER_RUNTIME.ts` now owns the first live ledger mutation path for
  `pulse.homeostasis.baseTax`, including rollback-token semantics and
  observer-visible summary state.
- `GENETIC_LEDGER_PERSISTENCE.ts` now persists and replays `baseTax` ledger
  events, so rollback tokens survive restart and hydration happens during
  `PULSE.initWorkers()`.
- `HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts` now owns the second live homeostasis
  mutation path for `pulse.homeostasis.targetEnergy`, including rollback-token
  semantics and observer-visible summary state.
- `HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts` now persists and replays
  `targetEnergy` ledger events, so rollback tokens survive restart and hydration
  happens during `PULSE.initWorkers()`.
- `PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts` and
  `PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts` now own the third live ledger
  mutation path for `pulse.pressureRing.scale`, including rollback-token,
  replay, and compaction semantics.
- `DAEMON_PHEROMONE_LEDGER_RUNTIME.ts` and
  `DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts` now own the fourth live ledger
  mutation path for `daemon.maxPheromoneIntensity`, including rollback-token,
  replay, and compaction semantics through `SYSTEM_START.ts`,
  `AKASHA_SERVER.ts`, and `DAEMON_INGRESS_POLICY.ts`.
- `DAEMON_PLASMID_LEDGER_RUNTIME.ts` and `DAEMON_PLASMID_LEDGER_PERSISTENCE.ts`
  now own the fifth live ledger mutation path for `daemon.maxPlasmidCharge`,
  including rollback-token, replay, and compaction semantics through
  `SYSTEM_START.ts`, `AKASHA_SERVER.ts`, and `DAEMON_INGRESS_POLICY.ts`.
- contract guards now exist for:
  - [test_hormone_buffer_contract.ts](/Users/s0fractal/OMEGA/test_hormone_buffer_contract.ts)
  - [test_genetic_ledger_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_contract.ts)
  - [test_genetic_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_runtime_contract.ts)
  - [test_genetic_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_persistence_contract.ts)
  - [test_hormone_ledger_alignment_contract.ts](/Users/s0fractal/OMEGA/test_hormone_ledger_alignment_contract.ts)
  - [test_physiology_snapshot_contract.ts](/Users/s0fractal/OMEGA/test_physiology_snapshot_contract.ts)
  - [test_physiology_api_contract.ts](/Users/s0fractal/OMEGA/test_physiology_api_contract.ts)
  - [test_homeostasis_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_ledger_path_contract.ts)
  - [test_daemon_pheromone_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_runtime_contract.ts)
  - [test_daemon_pheromone_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_persistence_contract.ts)
  - [test_daemon_pheromone_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_compaction_contract.ts)
  - [test_daemon_pheromone_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_path_contract.ts)
  - [test_daemon_plasmid_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_runtime_contract.ts)
  - [test_daemon_plasmid_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_persistence_contract.ts)
  - [test_daemon_plasmid_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_compaction_contract.ts)
  - [test_daemon_plasmid_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_path_contract.ts)
- current scope remains deliberately narrow:
  - no live `SharedArrayBuffer` hormone region
  - only `pulse.homeostasis.baseTax`, `pulse.homeostasis.targetEnergy`,
    `pulse.pressureRing.scale`, `daemon.maxPheromoneIntensity`, and
    `daemon.maxPlasmidCharge` are ledger-owned in live runtime
  - only those five knobs currently have durable replay history
  - all other hormone / ledger knobs remain observational or scaffold-only
- next gate is deciding whether to widen daemon-governed ledger ownership beyond
  these two daemon budgets or to shift effort into Stage 5 internal glyph
  transport.

## Stage 8: First hybrid production path

### Goal

Give reduction a narrow, reversible opening into live runtime.

### Required runtime modes

- `legacy-execute`
- `hybrid-reduce`
- `shadow-reduce`

### First production slit

Choose exactly one behavior family:

- local signaling
- simple replication decision
- role-expression

No more than one at first.

Current slit in progress:

- [x] Phase 1 Implementation (Governance + Telemetry)
- [x] Integrate first hybrid slit: guardian pheromone emission
- [x] Integrate second hybrid slit: architect plasmid emission
- [ ] Roll out to 10% Shadow
- [ ] Evaluate Reduction Telemetry
- guardian pheromone emission is now the chosen local-signaling slit
- `runtime_bridge/guardian_signal_hybrid.ts` evaluates the live guardian script
  through the mapped bridge subset using read-only neural coherence input
- `PULSE.ts` now supports:
  - `legacy-execute`
  - `shadow-reduce`
  - `hybrid-reduce`
- rollout is intentionally conservative:
  - `shadow-reduce` is the default mode
  - `hybrid-reduce` exists but only narrows guardian pheromone emission
  - any bridge failure falls back automatically to legacy emission
- observer surfaces now expose `guardian_signal_hybrid`, so the slit is visible
  in `/api/telemetry` and `/api/physiology` before broader runtime ownership is
  transferred
- `verification/guardian_signal_mode_harness.ts` now compares the slit across
  `legacy`, `shadow`, and `hybrid` modes and writes committed
  `verification/hybrid_mode_diffs/*.json` artifacts for stable, repair, and
  fallback cases before any default-mode promotion is considered
- `GUARDIAN_SIGNAL_PROMOTION.ts` now acts as the promotion gate contract:
  runtime telemetry, physiology, and long-run audit scripts all compute the same
  `shadow -> hybrid` recommendation from fallback ratio and branch coverage, but
  the default mode remains `shadow-reduce` until an explicit promotion decision
  is made
- `GUARDIAN_SIGNAL_PROMOTION_DECISION.ts` now turns that recommendation into an
  explicit `promote` / `hold` verdict inside long-run canary and daemon audit
  reports by combining guardian readiness with enclosing runtime health
- `GUARDIAN_SIGNAL_PROMOTION_ACTION.ts` now turns that verdict into a canonical
  `promote` / `hold` / `demote` action artifact so the Stage 8 slit can be
  reasoned about symmetrically before any default-mode switch is attempted
- **Metabolism Complete:** The Stage 8 migration for Guardian, Architect, and
  Replication drivers is complete. All three causal slits now evaluate through
  the bridge and are promoted to `hybrid-reduce` in `RUNTIME_POLICY.ts`.

### Exit gate

- one real runtime path runs via bounded reduction
- automatic fallback to legacy exists on failure

## Stage 9: Semantic mutation sandbox

### Goal

Allow semantic change only under controlled shadow conditions.

### Planned artifacts

- `semantic_sandbox/`
- `mutation_proposals.json`
- `shadow_evolution_runner.ts`

### Hard rules

- `S/K/I/Y` are immutable
- reserve glyphs can be explored
- catalytic / regulatory classes can be reassigned only in sandbox
- all changes require:
  - proposal
  - shadow run
  - rollback

### Exit gate

- no semantic mutation reaches mainline without shadow validation
- drift budget violations trigger automatic rejection

## Stage 10: Doll Fork / Shadow Ecology

### Goal

Turn shadow runtime into a laboratory, not a leak path.

### Allowed functions

- reduction rehearsal
- relic cultivation
- glyph composition farming
- mutation simulation

### What can return to mainline

- verified relics
- stable glyph compositions
- approved semantic proposals

### Exit gate

- main runtime never learns directly from raw shadow output
- Doll Fork becomes a validation ecology, not a chaotic twin

## Practical work rhythm

### Sprint A

- causal atlas
- golden traces
- top-20 mutation list

Result: the spine is visible before any bridge code exists.

### Sprint B

- `GlyphIR64`
- opcode-to-glyph bridge
- first 10-15 mappings

Result: the new language exists without taking runtime ownership.

### Sprint C

- reduction harness
- parallel verification
- first bounded reduction case

Result: reduction becomes measurable instead of aspirational.

### Sprint D

- internal glyph buffer
- internal transport
- glyph-aware local behavior

Result: transport becomes physics.

### Sprint E

- `HORMONE_BUFFER`
- `GENETIC_LEDGER`
- daemon through formal knobs

Result: homeostasis stops being ad-hoc tuning.

### Sprint F

- one hybrid production path
- fallback
- trace diff

Result: the new substrate touches live runtime safely.

## Stop signals

Do not advance if:

- golden traces do not exist
- rollback path does not exist
- drift budget is undefined
- reduction and legacy diverge without explanation
- glyph semantics are used in runtime without ledger specification

## Documentation style

For every major stage, maintain two artifacts:

1. `MYTH.md` short, expressive, purpose-focused

2. `CONTRACT.md` strict:
   - inputs
   - outputs
   - invariants
   - fail modes
   - rollback

This keeps myth and engineering aligned without letting either erase the other.

## Immediate next 3 planning steps

1. Fill
   [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
   for the 8 key files.
2. Define the first golden scenarios in
   [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md).
3. Draft the first `GlyphIR64` type contract before any bridge implementation
   begins.

```

---

## FILE: docs/migration/ROADMAP_2_SIGMA_CORE.md

```markdown
# 📑 Roadmap 2.0: OMEGA-64 / Σ-CORE

This document fixes an adjacent future-vector for OMEGA-64. It is not the active
migration contract and does not supersede
[REDUCTION_METABOLISM_ROADMAP.md](/Users/s0fractal/OMEGA/REDUCTION_METABOLISM_ROADMAP.md)
or
[OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).

It exists so the export surface preserves a second-order architectural line: the
transition from code that imitates life toward substrate where life, memory,
consensus, and autonomy can emerge as protocol.

## 1. Траєкторія: "Sovereignty Protocol" (Governance)

**Суть:** Створення "Цифрового Левіафана". Система як інструмент соціального та
економічного консенсусу.

- **Ядро:** Криптографічний шлюз `GATE.ts`, транзакційна цілісність.
- **Механіка:**
  - `SHARE / BET` — передача прав власності та прогнозування ризиків.
  - `QUORUM` — механізм прийняття рішень через агрегацію станів атомів.
- **Мета:** Симуляція макроекономіки та ігрової теорії без "галюцинацій"
  людського фактора.

## 2. Траєкторія: "Living Memory" (Semantic Engine)

**Суть:** Дані як живий організм. Динамічний RAG, де інформація
самоорганізується.

- **Ядро:** Binary Quantization (64-bit logic) + Просторові хеші.
- **Механіка:**
  - `HEBB / FIRE` — вузли, що часто запитуються, зміцнюють зв'язки (синапси).
  - `DECAY` — втрата енергії (забування) неактуальних даних.
- **Мета:** Створення "Сяйва" (Prime Radiant) — бази знань, що еволюціонує разом
  із запитами ШІ.

## 3. Траєкторія: "Responsible Autonomy" (AI Sandbox)

**Суть:** Безпечне середовище для LLM-агентів. "Пісочниця" з фізичними
обмеженнями ресурсу.

- **Ядро:** WASM-ізоляція, повний контроль пам'яті (`SharedArrayBuffer` із
  суворим детермінізмом).
- **Механіка:**
  - `SYS_CALL` — єдиний шлях взаємодії агента із зовнішнім світом.
  - `ENERGY_CAP` — обмеження обчислювальної складності (Gas).
- **Мета:** Протокол, де агенти можуть торгувати та діяти, не порушуючи законів
  "фізики" системи.

## 4. Траєкторія: "Alife Engine" (Emergent Complexity)

**Суть:** Справжня еволюція. Тут захардкоджена біологія прибирається, а її місце
займає нижчий математичний субстрат.

### 🦀 Пропозиція базових Rust-функцій (Low-level Substrate)

Щоб реалізувати ідею "холодного субстрату", базові доменні дії на кшталт `EAT`
та `MOVE` замінюються низькорівневими примітивами в `LAMBDA_VM_v2.rs`:

```rust
pub enum SigmaOp {
    // ENERGETICS: the substrate knows bytes and transfer, not "food".
    Transfer { from: Address, to: Address, amount: u64 },
    Pulse,

    // TOPOLOGY: graph mutation.
    Bind { target: Address, weight: f32 },
    Sever { target: Address },

    // GENOME: bytecode replication and mutation.
    Replicate { template: Vec<u8>, target_slot: MemorySlot },
    Mutate { offset: usize, bit_flip: bool },

    // LOGIC: bounded functional substrate.
    Fold { data: Vec<u8>, function_ptr: Address },
    Compare { a: Address, b: Address },

    // SPACE: movement in semantic / Hamming space.
    Attract { vector: Vector64 },
}
```

### Чому це спрацює

1. **Біологія через реплікацію:** Замість `self.reproduce()` атом виконує
   `Replicate`, копіюючи свій масив інструкцій у сусідній слот. Якщо під час
   копіювання спрацював `Mutate`, виникає еволюційне відхилення.
2. **Податки через Transfer:** У гілці "Sovereignty" скрипт просто викликає
   `Transfer` до адреси Скарбниці.
3. **Сенс через Attract:** Атоми не просто плавають на екрані, а притягуються до
   вузлів зі схожим вектором знань.

## Roadmap 2.0 "Деструкції"

1. **Phase 1:** Спрощення `LAMBDA_VM` до приблизно цих базових інструкцій.
2. **Phase 2:** Перенесення логіки "Епохи 69" (феромони, ролі) у
   завантажувальний байт-код (`Genesis scripts`).
3. **Phase 3:** Розгортання 4 гілок (`branches`) для тестування кожної
   траєкторії окремо.

## Position relative to the active roadmap

- This file captures a future-facing singularity map.
- The currently active migration contract remains:
  - [REDUCTION_METABOLISM_ROADMAP.md](/Users/s0fractal/OMEGA/REDUCTION_METABOLISM_ROADMAP.md)
  - [OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md)
- If work is scheduled from this document, it should first be translated into:
  - explicit phases
  - concrete artifacts
  - invariants
  - rollback paths
  - export-visible progress markers

```

---

## FILE: MUTATION_LANES.md

```markdown
# OMEGA-64 | Mutation Lanes (Era 69)

## Purpose

Define a stable contract between external ingress, canonical governance, and
internal high-speed mutation loops.

## Lanes

### 1) External Ingress Lane (Untrusted)

- Surfaces: `AKASHA_SERVER.ts`, `P2P_SYNAPSE.ts`, `SYSTEM_START.ts`,
  UI/WebSocket clients.
- Default posture: read-only visualization.
- Any external mutation endpoint must be disabled by default, local-bind only,
  and protected by explicit operator intent (env gate/token).
- External ingress must not mutate `STATE_MATRIX` directly.

### 2) Canonical Governance Lane (Authoritative)

- Surface: `GATE.mutate(...)`.
- Must emit canonical ledger/checkpoint artifacts and respect bridge policy.
- This lane is the source of truth for auditable state transitions.

### 3) Internal Fast Lane (Sandbox / Throughput)

- Surfaces: pulse kernel orchestration, oracle/synapse-assisted adaptation,
  local sandbox dynamics.
- Optimized for speed and experimentation inside the runtime.
- Allowed to bypass per-action governance checks, but should remain observable
  through telemetry and periodic audits.
- Runtime observer: `MUTATION_TELEMETRY.ts` (aggregated counters for host/oracle
  direct writes).
- Oracle writes are serialized via pending queue and drained in `HOST_LOCK`
  (`SOVEREIGN_ORACLE.drainPendingMutations()` from `PULSE.ts`).
- Oracle guidance defaults to stigmergic plasmid injection into `memoryGrid`
  (`OMEGA_ORACLE_MUTATION_MODE=stigmergic`); direct head rewrite mode remains
  available via explicit policy switch (`OMEGA_ORACLE_MUTATION_MODE=direct`).
- Controls:
  - `OMEGA_MUTATION_TELEMETRY` (`true` by default)
  - `OMEGA_MUTATION_TELEMETRY_FLUSH_TICKS` (default `25`)
  - `OMEGA_MUTATION_TELEMETRY_TOP_KINDS` (default `6`)
  - `OMEGA_ORACLE_PENDING_MAX` (default `256`)

## Current Runtime Posture

- `AKASHA_SERVER.ts`: visualization-only websocket channel, local bind by
  default.
- `P2P_SYNAPSE.ts`: `/mutate` endpoint is disabled by default and guarded by
  env/token gates when enabled; accepts canonical `x-omega-control-token`
  (legacy `x-omega-mutate-token` remains compatible).
- `P2P_FEDERATION.ts`: migration queue is disabled by default
  (`OMEGA_FEDERATION_ENABLE=false`) and forwards `x-omega-control-token` when
  set to interoperate with guarded `/federate`.
- `SYSTEM_START.ts`: binds loopback by default (`OMEGA_SYSTEM_HOST`) and all
  mutating POST routes require explicit control enable/token
  (`OMEGA_SYSTEM_CONTROL_ENABLE`, `OMEGA_SYSTEM_CONTROL_TOKEN`); mutating
  requests are enqueued into `CONTROL_INTENT_QUEUE.ts`.
- Canonical crystallization remains in `GATE`.
- Internal fast-lane mutations are aggregated and emitted by
  `MUTATION_TELEMETRY.flushIfDue(...)` from `PULSE.ts`.
- External control intents are drained and applied only during `HOST_LOCK`
  (`CONTROL_INTENT_QUEUE.applyHostLockBudget()` in `PULSE.ts`).
- Runtime env gates and thresholds are parsed centrally in `RUNTIME_POLICY.ts`
  and consumed by runtime modules (policy monoculture).

```

---

## FILE: public/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Σ-CORE Panopticon</title>
    <style>
      body {
        margin: 0;
        overflow: hidden;
        background: #000;
        font-family: sans-serif;
      }
      canvas {
        display: block;
      }
      #hud {
        position: absolute;
        top: 10px;
        left: 10px;
        color: #fff;
        z-index: 10;
        text-shadow: 1px 1px 2px #000;
        pointer-events: none;
      }
    </style>
    <!-- Native Import Map for ES Modules -->
    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
      }
    </script>
  </head>
  <body>
    <div id="hud">
      <div>ATOMS [LIVE]: <span id="stat-atoms">0</span></div>
      <div>CORE ENERGY: <span id="stat-energy">0.0</span> Ω</div>
      <div style="margin-top: 10px; max-width: 400px; font-style: italic; opacity: 0.8" id="stat-mood"></div>
    </div>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>

```

---

## FILE: public/main.js

```markdown
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

```

---

## FILE: README.md

```markdown
# OMEGA-64: Era 69 - Absolute Coherence 💎🛡️

Welcome to **Matrixland** — the Golden Master architecture of OMEGA-64.

_"We do not program life. We set the constants in which life is inevitable."_

## 🧬 Architecture Overview

Era 69 completely abandons the file-based "Flatland" of older eras in favor of
the **Coherent Crystal** — a high-performance, concurrent, Shared-Memory physics
engine driven by WebAssembly (WASM).

### 1. `STATE_MATRIX` (The Shared RAM)

A unified `SharedArrayBuffer` spanning exactly `680MB`. It holds `1,000,000`
atoms, their 64-byte RISC genes, and their dynamic states (Energy, X, Y,
Resonance, Roles). No database, no files, no serialization. Memory is the only
truth.

### 2. `PULSE_WORKER` (The Multi-Core Physics Bridge)

WASM instances running across parallel Web Workers. Each worker ticks the
physics of the matrix simultaneously. The Host (Deno) handles complex Euclidean
mathematics and orchestrates the `SYSCALL` (0x60) interrupts thrown by WASM
atoms.

### 3. `SPATIAL_HASH` (The 2D Grid)

A 140x80 spatial partitioning grid. Atoms automatically register their position,
enabling hyper-fast radius queries, proximity sensing, and ecological
interactions without O(N^2) bottlenecks.

### 4. `AGENT_PROXY` (The LLM Soul Gateway)

A REST HTTP server running concurrently with the Matrix loop. It exposes simple
endpoints (`GET /api/atom/:id` and `POST /api/atom/:id/act`) so that external
Large Language Models (LLMs) can log in, take over an "Avatar" (ID: 9999), see
the environment, and send WASM-compiled macro-intents to survive the savage
ecology.

---

## 🚀 Running the Matrix

To boot the live TUI dashboard and watch the ecosystem evolve in your terminal:

```bash
deno run -A --unstable TUI_DASHBOARD.ts
```

### 🧠 Booting an LLM Avatar

While the Matrix is running, you can connect an external Gemini AI to drive Atom
`9999` (The Guardian). It will use your `GEMINI_API_KEY` to look at the Spatial
Hash and physically run from predators or hunt prey!

```bash
export GEMINI_API_KEY="..."
deno run -A --unstable llm_soul.ts
```

---

## ⚖️ The Laws of Physics (Syscalls)

In Era 69, an Atom's WASM genome can trigger the following biological
interrupts:

- `SYS_MOVE (0x0E)`: Updates X/Y coordinates on the Spatial Hash (`r1`=dx,
  `r2`=dy).
- `SYS_EAT (0x0F)`: Siphons energy from an adjacent organism (`r1`=targetIdx).
- `SYS_MSG (0x08)`: Network cognition; sends a byte to another atom's mailbox.
- `SYS_MUTATE (0x07)`: Self-modifying RISC. Writes a byte into the
  `instructionsView` of memory.
- `SYS_REPLICATE (0x0B)`: Cell division. Copies the `instructionsView` to a
  dormant offspring.

These calls cost **Metabolic Gas**. Every action drains energy. The universe
enforces starvation to prune inefficient code.

---

_This repository marks the **Feature Freeze** of the Deno/AssemblyScript
prototype. It stands as the topological blueprint for the upcoming pure Rust
`LAMBDA_VM_v2` migration._

```

---

## FILE: REDUCTION_METABOLISM_ROADMAP.md

```markdown
# OMEGA-64 Reduction Metabolism Roadmap

> Status: planning artifact only. This document does not authorize runtime
> changes by itself.

## Purpose

This file is the strategic roadmap for moving OMEGA-64 from the current
opcode-governance runtime toward a bounded reduction-based metabolism.

It is intentionally split into two layers:

- **Myth layer**: why this migration exists and what kind of system it is trying
  to become.
- **Contract layer**: where the concrete migration checkpoints, artifacts, and
  gates live.

The detailed migration contract now lives under
[docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).

Supporting planning artifacts:

- [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
- [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md)
- [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md)
- [docs/migration/HORMONE_LEDGER_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/HORMONE_LEDGER_CONTRACT.md)
- [docs/migration/ROADMAP_2_SIGMA_CORE.md](/Users/s0fractal/OMEGA/docs/migration/ROADMAP_2_SIGMA_CORE.md)

## Progress ledger

Status snapshot as of 2026-03-06:

| Phase                           | Status      | Notes                                                                                                                                                                                                                                                                                                     |
| ------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkpoint 0                    | in progress | control surface frozen in planning docs; export now includes migration artifacts and persisted baseline traces                                                                                                                                                                                            |
| Stage 1: causal atlas           | in progress | top-20 critical mutations owner-classified across the 8 key files                                                                                                                                                                                                                                         |
| Stage 2: golden traces          | complete    | capture harness now spans API-observer traces and standalone control specimens; persisted `gt01..gt18` baseline artifacts are committed under `verification/traces/`                                                                                                                                      |
| Stage 3: `GlyphIR64`            | in progress | registry, bridge mapping, pretty/debug layer, bounded `JZ` coverage, bounded `COLLECTIVE` + `SHARE` coverage, and first honest worker-backed `BUILD` owner-arbitration coverage now exist outside runtime closure                                                                                         |
| Stage 4: shadow verification    | in progress | reduction shadow covers twenty-seven bounded `gt01`/`gt03`/`gt04`/`gt05`/`gt08`/`gt09`/`gt10`/`gt11`/`gt12`/`gt13`/`gt14`/`gt15`/`gt16`/`gt17`/`gt18` cases with persisted diff artifacts, and admission shadow now covers `gt04`/`gt06` policy cases separately                                          |
| Stage 5                         | complete    | external pheromone/plasmid inject now seeds a shared `GLYPH_BUFFER`; host-lock advances decay/diffusion, telemetry exposes transport state, WASM trophism reads glyph gradients, internal emission leaks from `signalGrid` and `memoryGrid`, and role-based secretion policies are now canonical in λ-VM. |
| Stage 5.1                       | in progress | Full WASM Atomic Emission: secretion moved from host to λ-VM kernel; role-based predicates and plasmid payloads now propagate through decentralized thread-safe `secreteGlyph` implementation.                                                                                                            |
| Stage 6                         | completed   | State 6: Codex as Evidence Engine \| [x] Glyph Transport Regimes (Chronicles)<br>[x] Project Field Dynamics into Admission Scoring<br>[x] Evidence-based Metabolic Governance                                                                                                                             |
| Stage 7: hormone / ledger layer | complete    | Total Physiological Closure: 10 knobs govern the endocrine Shared-Memory Lattice; WASM kernel now consumes hormones (H0-H5) to modulate execution budget, metabolic costs, and replication thresholds.                                                                                                    |
| Stage 8+                        | in progress | State 8: Metabolism Hybridization \| [x] Guardian Signal Promotion<br>[x] Architect Plasmid Promotion<br>[x] Replication Decision Promotion<br>[x] All metabolism drivers in `hybrid-reduce`                                                                                                              |

Latest completed planning work:

- Extended Stage 3/4 with a dedicated `rc28_gt19_tensegrity_kinematics`
  reduction case and harness parity checks for `OP_TENSEGRITY` bond distance and
  damping tracking, bringing structural constraint intent publication into the
  bounded reduction metabolism.
- Extended Stage 2 with a twelfth control specimen: `gt19_tensegrity_kinematics`
  now captures bounded `OP_TENSEGRITY` kinematics and bonding through standalone
  WASM execution, so bounded bridges have an honest baseline before attempting
  structural constraint logic migration.
- Added migration artifacts to the canonical export surface so external model
  audits can see both current runtime and declared direction of travel.
- Replaced the placeholder causal atlas with a first owner/risk/disposition
  table for the highest-impact mutations.
- Replaced the placeholder golden trace sheet with concrete scenarios, artifact
  paths, and drift-budget rules.
- Added a dedicated `GlyphIR64` contract document so the bridge vocabulary is
  visible before implementation starts.
- Added non-runtime bridge code for `GlyphIR64`, `opcode -> glyph` translation,
  and pretty/debug rendering without transferring any runtime ownership.
- Added a code-backed golden trace catalog so Stage 2 is no longer markdown-only
  planning.
- Added an observer-only mutation telemetry API surface so golden traces can
  capture mutation counters without touching causality.
- Added a persisted golden trace capture harness and committed six baseline
  trace artifact sets into `verification/traces/`.
- Added a bounded reduction verification harness with four initial
  parity-checked cases: seeded replicator loop, seeded architect loop, guardian
  stable branch, guardian repair branch.
- Extended the reduction harness with two policy-sensitive `gt05` anchor cases
  and persisted `verification/reduction_diffs/*.json` artifacts for all
  reduction cases.
- Extended the reduction bridge and shadow harness with bounded `PUT` + `JZ`
  semantics tied to `gt04_plasmid_inject`, added prop-state parity to
  `verification/reduction_harness.ts`, and fixed the remaining
  `verification/golden_trace_catalog.ts` /
  `verification/golden_trace_capture.ts` type debt so the Stage 2/4 verification
  core now passes `deno check`.
- Extended Stage 2 with a standalone control specimen:
  `gt08_structure_intent_visibility` is now captured through
  `test_structure_intent_determinism.ts --capture` rather than the REST server,
  so same-tick structure-intent visibility has an honest baseline without
  inventing a fake ingress path.
- Extended Stage 2 with a second standalone control specimen:
  `gt09_collective_transport` now captures bounded `OP_COLLECTIVE` hive
  store/load and pheromone emission semantics through direct WASM execution, so
  collective transport has a committed baseline before wider bridge work.
- Extended Stage 2 with a third standalone control specimen:
  `gt10_share_transfer` now captures bounded `OP_SHARE` successful bonded
  transfer and empty-bond fail-closed semantics through direct WASM execution,
  so local energy exchange has a committed baseline before broader social or
  symbiotic bridge work.
- Extended Stage 2 with a fourth standalone control specimen:
  `gt11_collective_banking` now captures bounded `OP_COLLECTIVE` mode `3/4`
  deposit-withdraw semantics through direct WASM execution, so hive banking has
  a committed baseline before broader collective-economy bridge work.
- Extended Stage 2 with a fifth standalone control specimen:
  `gt12_collective_synchrony` now captures bounded `OP_COLLECTIVE` mode `5/6`
  phase-lock and quorum PC-sync semantics through direct WASM execution, so
  collective synchrony has a committed baseline before broader coordination
  bridge work.
- Extended Stage 2 with a sixth standalone control specimen:
  `gt13_structure_lock_progress` now captures bounded `OP_SENSE` visibility
  through stale structure locks plus `tick_structure_grid` intent clearing, so
  the structure lane has a forward-progress baseline before deeper lock/fallback
  bridge work.
- Extended Stage 2 with a seventh standalone control specimen:
  `gt14_structure_charge_resolution` now captures bounded `OP_PLUG` charge
  intent publication plus `tick_structure_grid` materialization, so the
  structure charge lane has a committed baseline before deeper structure-engine
  bridge work.
- Extended Stage 2 with an eighth standalone control specimen:
  `gt15_structure_charge_competition` now captures two `OP_PLUG` publications
  competing for the same cell under both orderings, so the structure charge lane
  now has a committed `max-intent wins` baseline rather than an accidental
  last-write model.
- Extended Stage 2 with a ninth control specimen:
  `gt16_runtime_build_materialization` now captures a real worker-backed
  `OP_BUILD SOURCE` path through `PULSE.tick`, so BUILD has an honest runtime
  anchor before any broader attempt to bridge structure materialization.
- Extended Stage 2 with a tenth control specimen:
  `gt17_runtime_build_competition` now captures two architects publishing
  competing `OP_BUILD SOURCE` intents into the same cell through `PULSE.tick`,
  so BUILD owner arbitration has an honest worker-backed baseline before any
  broader attempt to bridge structure materialization competition.
- Extended Stage 2 with an eleventh control specimen:
  `gt18_runtime_build_stale_lock` now captures a single architect attempting
  `OP_BUILD SOURCE` against a stale locked `SOURCE` intent through `PULSE.tick`,
  so BUILD x lock fallback has an honest worker-backed baseline before any
  broader attempt to bridge structure-lock materialization.
- Extended Stage 4 with bounded `OP_SENSE` parity tied to `gt08`: the reduction
  harness now models build-intent overlays and structural sensing, and persists
  `rc09` / `rc10` artifacts for visible-intent and typed-miss cases.
- Extended Stage 3/4 with bounded `OP_COLLECTIVE` parity tied to `gt09`: the
  reduction harness now models hive store/load and local pheromone emission, and
  persists `rc11` / `rc12` artifacts for collective transport semantics.
- Extended Stage 3/4 with bounded `OP_SHARE` parity tied to `gt10`: the
  reduction harness now models bonded percentage transfer and empty-slot
  fail-closed semantics, and persists `rc13` / `rc14` artifacts for local
  share-transfer behavior.
- Extended Stage 3/4 with bounded `OP_COLLECTIVE` banking parity tied to `gt11`:
  the reduction harness now models mode `3` deposit and mode `4` capped withdraw
  semantics, and persists `rc15` / `rc16` artifacts for collective banking
  behavior.
- Extended Stage 3/4 with bounded `OP_COLLECTIVE` synchrony parity tied to
  `gt12`: the reduction harness now models mode `5` bonded phase-lock and mode
  `6` local quorum PC sync, and persists `rc17` / `rc18` artifacts for
  collective synchrony behavior.
- Extended Stage 3/4 with bounded stale-lock `OP_SENSE` parity tied to `gt13`:
  the reduction harness now seeds structure grid + owner overlays directly and
  persists `rc19` / `rc20` artifacts for visible-through-lock and typed-miss
  fallback behavior.
- Extended Stage 3/4 with bounded `OP_PLUG` post-tick resolution parity tied to
  `gt14`: the reduction harness now supports a narrow `postStructureTick` flush
  plus charge-intent state and persists `rc21` for charge materialization /
  intent-clearing behavior.
- Extended Stage 3/4 with bounded `OP_BUILD` owner-arbitration parity tied to
  `gt17`: the reduction harness now carries owner-token state, persists `rc25` /
  `rc26`, and verifies that higher owner tokens overwrite lower build intents
  while lower owner tokens fail closed against preseeded higher owners.
- Extended Stage 3/4 with bounded `OP_BUILD` stale-lock parity tied to `gt18`:
  the reduction harness now persists `rc27` and verifies that locked owners
  block competing BUILD publication while `postStructureTick` still materializes
  the locked SOURCE value and clears intents.
- Extracted daemon ingress admission logic into `DAEMON_INGRESS_POLICY.ts` so
  runtime and verification now share one pure policy contract.
- Added an admission shadow harness for `gt04` and `gt06`, with committed
  `verification/admission_diffs/*.json` artifacts for low-risk plasmid
  acceptance, pheromone acceptance, and high-drift plasmid degradation.
- Extended the admission shadow lane with `gt07_daemon_policy_block`, so daemon
  ingress now has baseline evidence for accept, degrade, and hard policy block
  paths.
- Added a formal Stage 7 scaffold through `HORMONE_BUFFER.ts` and
  `GENETIC_LEDGER.ts`, plus contract guards that keep the physiological knob
  surface explicit before any live runtime integration.
- Added an observer-only physiology projection path: `PHYSIOLOGY_SNAPSHOT.ts`
  plus `/api/physiology` now expose Stage 7 state to runtime observers without
  granting write ownership to the hormone / ledger layer.
- Added the first live Stage 7 ownership move: `pulse.homeostasis.baseTax` now
  flows through `GENETIC_LEDGER_RUNTIME.ts`, emits rollback tokens, and is
  visible through homeostasis / physiology observer surfaces.
- Added durable replay for the first Stage 7 ownership move:
  `GENETIC_LEDGER_PERSISTENCE.ts` now persists `baseTax` ledger events and
  rehydrates them during `PULSE.initWorkers()`.
- Added snapshot compaction for the first Stage 7 ownership move: `baseTax`
  persistence now compacts durable history into `snapshot + bounded tail`, and
  observer surfaces expose `ledger_base_tax_persistence` so long-lived memory is
  externally visible.
- Tightened the first Stage 7 ownership move into a single canonical lane:
  `baseTax` no longer rides through the generic homeostasis overlay and now
  mutates only through the ledger-owned path.
- Added the second live homeostasis ownership move:
  `pulse.homeostasis.targetEnergy` now flows through a dedicated ledger
  runtime/persistence path, exposes rollback tokens, survives restart through
  replay, compacts into `snapshot + bounded tail`, and is no longer writable
  through the generic homeostasis overlay.
- Added the third live Stage 7 ownership move: `pulse.pressureRing.scale` now
  flows through a dedicated ledger runtime/persistence path, exposes rollback
  tokens, survives restart through replay, compacts into
  `snapshot + bounded tail`, and is no longer writable through the generic
  pressure-ring overlay.
- Added the fourth live Stage 7 ownership move: `daemon.maxPheromoneIntensity`
  now flows through a dedicated ledger runtime/persistence path, exposes
  rollback tokens, survives restart through replay, compacts into
  `snapshot + bounded tail`, and is no longer just a frozen ingress-policy
  constant inside the daemon membrane.
- Added the fifth live Stage 7 ownership move: `daemon.maxPlasmidCharge` now
  flows through a dedicated ledger runtime/persistence path, exposes rollback
  tokens, survives restart through replay, compacts into
  `snapshot + bounded tail`, and removes the last fixed plasmid budget from the
  daemon ingress membrane.
- Started Stage 5 internal transport: external pheromone/plasmid ingress now
  seeds a shared `GLYPH_BUFFER`, host-lock advances bounded decay/diffusion,
  telemetry exposes `glyph_transport`, and AssemblyScript trophism reads glyph
  gradients as a real local influence instead of a pure API-side event.
- Extended Stage 5 transport with the first two internal emission sources:
  `signalGrid` now leaks into pheromone glyph packets and `memoryGrid` now leaks
  into plasmid glyph packets, so transport is no longer membrane-only.
- Added the first agent-driven Stage 5 producer: a bounded subset of active
  atoms now emits pheromone/plasmid glyph packets directly during host lock, so
  internal transport no longer depends only on ingress or substrate leakage.
- Refined the first agent-driven producer into a role-shaped secretion policy:
  guardians bias toward pheromone emission, architects bias toward plasmid
  emission, producers can do both under tighter gates, parasites leak plasmids,
  and observer telemetry now exposes per-role emission counters.
- Started Stage 6 evidence bridging: `AKASHA_CODEX.ts` now records
  `glyph_transport_regime` chronicles from runtime transport snapshots, keeps a
  live glyph regime summary in codex state, and exposes that bridge through the
  daemon-facing narrative contract. wasm-native secretion is now canonical for
  active roles (Guardian, Architect, Producer); Stage 5 is real and the
  circulation core is operational.
- Extended Stage 6 into daemon governance evidence: blocked/degraded admission
  chronicles now carry glyph transport context, so transport regimes are tied to
  specific ingress decisions instead of living only in narrative summaries.
- Extended Stage 6 one step further into bounded policy influence:
  `DAEMON_INGRESS_POLICY.ts` now reads glyph regime / dominant role from Codex
  narrative context and adds a capped pressure term to daemon admission scoring
- Extended Stage 6 into outcome evidence: `flushDaemonAuditEffects()` now
  forwards evaluated daemon-action deltas into
  `AKASHA_CODEX.recordDaemonEffect`, so the codex chain reaches beyond admission
  into observed runtime effect.
- Added Stage 6 outcome projection: Codex narrative/snapshot outputs now retain
  the latest daemon effect summary, lineage, and delta band, so observers and
  daemon reasoning can read effect contours without scraping raw chronicles.
- Started Stage 8 with a bounded live slit:
  `runtime_bridge/guardian_signal_hybrid.ts` now evaluates guardian scripts
  through the mapped glyph subset, `PULSE.ts` routes guardian pheromone emission
  through `legacy-execute` / `shadow-reduce` / `hybrid-reduce`, and observer
  telemetry now exposes `guardian_signal_hybrid` so the bridge can run live in
  shadow mode before it owns causality.
- Added Stage 8 mode-aware verification:
  `verification/guardian_signal_mode_harness.ts` now compares guardian slit
  behavior across `legacy`, `shadow`, and `hybrid` modes and persists committed
  `verification/hybrid_mode_diffs/*.json` artifacts for stable, repair, and
  fallback cases tied to `gt03`.
- Added a pure promotion gate: `GUARDIAN_SIGNAL_PROMOTION.ts` now computes
  whether the guardian slit has accumulated enough shadow evidence to recommend
  `hybrid-reduce`; telemetry, physiology, and long-run audits surface the same
  recommendation without auto-promoting the runtime mode.
- Added a promotion decision contract: `GUARDIAN_SIGNAL_PROMOTION_DECISION.ts`
  now folds the guardian recommendation together with long-run health metrics
  into an explicit `promote` or `hold` verdict, so Stage 8 rollout can be
  decided from committed audit artifacts rather than ad hoc interpretation.
- Added a promotion action contract: `GUARDIAN_SIGNAL_PROMOTION_ACTION.ts` now
  translates the Stage 8 decision into an explicit `promote`, `hold`, or
  `demote` action for canary/daemon audit reports, keeping rollout semantics
  symmetric without auto-mutating runtime mode.
- Started a second Stage 8 slit: `runtime_bridge/architect_plasmid_hybrid.ts`
  now routes architect plasmid emission through a bounded reduction-side
  contract with `legacy`, `shadow`, and `hybrid` modes; observer telemetry
  exposes `architect_plasmid_hybrid` while rollout remains shadow-first.
- Started a third Stage 8 slit: `runtime_bridge/replication_hybrid.ts` now
  routes reproduction decisions through a shadow-to-hybrid promotion gate; audit
  verification passed and all three drivers (Guardian, Architect, Replication)
  were promoted to `hybrid-reduce` on 2026-03-07.

## Current diagnosis

OMEGA-64 already has:

- a shared substrate through `STATE_MATRIX.ts` + `OFFSETS.ts`
- an execution plane through workers + WASM
- a governance plane through `GATE.ts`
- a continuity plane through `AKASHA_CODEX.ts`, snapshots, chronicles, relics,
  and invariants
- an observer membrane through Akasha REST / WebSocket / WebRTC ingress

But it does **not** yet have a unified metabolic physics. Causality is still
distributed across:

- host orchestration
- daemon feedback
- gate policy
- imperative opcode execution
- ingress/control surfaces

The project is therefore not "pre-architecture". It is a hybrid runtime standing
between:

- **opcode-governance runtime**
- **reduction-native substrate**

## Strategic thesis

The migration target is not "less imperative code".

The target is:

> **Move causality from host-managed opcode/governance execution into a bounded
> reduction metabolism where glyph transport, hormonal feedback, codex memory,
> and semantic evolution become layers of one physics.**

That means:

- no big-bang rewrite
- no immediate deletion of the legacy ISA
- no early semantic mutation of the whole glyph space
- no runtime ownership ambiguity during the bridge phase

## Migration laws

1. The new reduction layer must first **observe**, then **replay**, then
   **shadow**, and only then **own** causality.
2. Legacy ISA stays alive until the bridge proves deterministic equivalence on
   selected scenarios.
3. `S/K/I/Y` remain hard invariants and are never placed into open semantic
   mutation.
4. Codex must evolve from narrative memory into evidence memory before semantic
   mutation is trusted.
5. Daemon control must act through bounded physiological knobs, not through
   arbitrary world rewriting.

## Phase map

The detailed plan is maintained in
[docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).
The high-level order is:

1. Checkpoint 0: freeze the current world as a control specimen
2. Stage 1: causal atlas
3. Stage 2: golden traces and verification harness
4. Stage 3: `GlyphIR64`
5. Stage 4: reduction harness outside production
6. Stage 5: internal glyph transport
7. Stage 6: Codex as evidence engine
8. Stage 7: formal homeostasis / hormone / ledger layer
9. Stage 8: first hybrid production path
10. Stage 9: semantic mutation sandbox
11. Stage 10: Doll Fork / shadow ecology

## Immediate priorities

The next practical priorities are:

1. Build the causal atlas for the key runtime roots and closure files.
2. Keep widening shadow coverage only where a golden trace exposes real
   causality, even if that means using a non-reduction shadow lane first.
3. Extend `GlyphIR64` mapping coverage only where a concrete trace id truly
   requires bridge-side control flow.
4. Keep new bridge and trace artifacts inside export so external audits critique
   the real migration edge.
5. Keep extending Stage 7 only through rollback-tokenized ledger ownership, and
   prefer daemon-governance knobs over new pulse-only knobs until cross-layer
   ownership is no longer exceptional.

Immediate execution edge:

1. Keep `gt04`/`gt06` in the new admission shadow lane until a real
   reduction-side control-flow contract exists for them.
2. Decide whether to widen the bridge subset with a compare/range primitive or
   keep the current exact-anchor model explicit.
3. Keep using the trace artifacts as rollback anchors for every bridge
   experiment.

Known bridge limit surfaced by Stage 4:

- The current bridge subset only supports `Imm8` anchors via `OP_SET`, so
  `gt05 target_energy=300` cannot yet be encoded directly in a shadow case.
- The current `gt05` reduction cases therefore use the representable policy
  anchor `band=240` instead of pretending full target-energy semantics already
  exist.
- `gt04` and `gt06` now have honest shadow coverage, but that coverage lives in
  the daemon-admission policy lane rather than the reduction bridge. This is
  intentional until `GlyphIR64` gains a mature control-flow contract.
- Stage 7 now has an executable contract and five authoritative runtime ledger
  write paths (`baseTax`, `targetEnergy`, `pressureRing.scale`,
  `daemon.maxPheromoneIntensity`, `daemon.maxPlasmidCharge`), and all 10 knobs
  now drive a live `SharedArrayBuffer` hormone lattice
  (`HORMONE_BUFFER_RUNTIME.ts`) synchronized across workers and consumed by the
  WASM kernel.

## Explicit deferrals

The following are intentionally deferred until the bridge is mature:

- assigning all 60 non-core glyphs fixed "protein" semantics
- open semantic mutation in production
- deletion of the legacy opcode path
- using Doll Fork as a direct learning source for mainline runtime

## Success criteria

The migration is considered real only when:

- critical mutations are owner-classified
- golden traces exist and are rerunnable
- at least one real life cycle can run through bounded reduction
- global dynamic knobs are formalized through hormone/ledger layers
- semantic mutation is sandboxed and rollbackable
- long-run stability survives the bridge without emergency host patching

```

---

## FILE: ui/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OMEGA-64 | ALEPH</title>
    <style>
      body {
        margin: 0;
        background: #000;
        overflow: hidden;
        font-family: "Inter", sans-serif;
        color: #00f0ff;
      }
      #ui {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 100;
        pointer-events: none;
      }
      .glass {
        background: rgba(0, 20, 40, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 240, 255, 0.2);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 0 40px rgba(0, 240, 255, 0.1);
        pointer-events: auto;
      }
      h1 {
        margin: 0;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 4px;
      }
      .stats {
        margin-top: 10px;
        font-size: 0.8rem;
        opacity: 0.8;
        line-height: 1.6;
      }

      #console-container {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 400px;
        z-index: 200;
      }
      input {
        width: 100%;
        padding: 12px;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid #00f0ff;
        color: #00f0ff;
        border-radius: 8px;
        font-family: "Courier New", monospace;
        outline: none;
      }

      #inspector {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 250px;
        display: none;
        font-size: 0.8rem;
        border-color: rgba(0, 240, 255, 0.5);
      }
      .label {
        color: rgba(0, 240, 255, 0.6);
        text-transform: uppercase;
        font-size: 0.6rem;
        margin-top: 8px;
      }
      .val {
        font-family: monospace;
        font-size: 0.9rem;
      }

      #chronos-console {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        font-size: 0.8rem;
        border-color: rgba(0, 255, 100, 0.4);
        text-align: center;
      }
      .snapshot-btn {
        background: rgba(0, 255, 100, 0.2);
        border: 1px solid #00ff64;
        color: #00ff64;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 5px;
        font-family: monospace;
        font-size: 0.7rem;
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
      .snapshot-btn:hover {
        background: rgba(0, 255, 100, 0.4);
      }
      .snapshot-save-btn {
        background: rgba(255, 0, 100, 0.2);
        border: 1px solid #ff0064;
        color: #ff0064;
        font-weight: bold;
      }
      .snapshot-save-btn:hover {
        background: rgba(255, 0, 100, 0.4);
      }

      #governance-hud {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(160px);
        width: 320px;
        font-size: 0.8rem;
        border-color: rgba(255, 0, 255, 0.4);
        text-align: center;
      }
      .gov-symbol {
        font-size: 1.5rem;
        margin-bottom: 5px;
      }
      .gov-decree {
        color: #ff00ff;
        font-weight: bold;
        letter-spacing: 2px;
        margin-top: 5px;
      }
      .gov-mods {
        font-size: 0.65rem;
        opacity: 0.8;
      }

      #leaderboard {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 350px;
        font-size: 0.8rem;
        border-color: rgba(255, 200, 0, 0.4);
      }
      #codex-panel {
        position: absolute;
        top: 420px;
        right: 20px;
        width: 350px;
        font-size: 0.75rem;
        border-color: rgba(0, 255, 180, 0.4);
      }
      .codex-title {
        color: #00ffb0;
        border-bottom: 1px solid rgba(0, 255, 180, 0.3);
        padding-bottom: 5px;
      }
      .codex-row {
        margin-top: 8px;
        padding: 6px;
        background: rgba(0, 0, 0, 0.4);
        border-left: 3px solid #00ffb0;
      }
      .codex-row-title {
        color: #00ffb0;
        font-size: 0.7rem;
        margin-bottom: 2px;
      }
      .codex-row-body {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.85);
      }
      .codex-row-subtle {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.72);
      }
      .codex-mood {
        display: inline-block;
        margin-left: 8px;
        padding: 1px 6px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        font-size: 0.62rem;
        letter-spacing: 1px;
        vertical-align: middle;
      }
      .codex-mood-ascendant {
        color: #00ffb0;
        border-color: rgba(0, 255, 176, 0.45);
      }
      .codex-mood-stable {
        color: #9fe8ff;
        border-color: rgba(159, 232, 255, 0.45);
      }
      .codex-mood-fragile {
        color: #ffb27a;
        border-color: rgba(255, 178, 122, 0.45);
      }
      #human-channel {
        margin-top: 10px;
        border-left-color: #9fe8ff;
      }
      .human-channel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .human-channel-badges {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .drift-severity {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        font-size: 0.62rem;
        letter-spacing: 1px;
      }
      .phase-ring-badge {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        font-size: 0.62rem;
        letter-spacing: 0.8px;
      }
      .drift-severity-low {
        color: #7fffd4;
        border-color: rgba(127, 255, 212, 0.45);
      }
      .drift-severity-mid {
        color: #ffd27a;
        border-color: rgba(255, 210, 122, 0.45);
      }
      .drift-severity-high {
        color: #ff8a8a;
        border-color: rgba(255, 138, 138, 0.55);
      }
      .drift-severity-baseline {
        color: #9fe8ff;
        border-color: rgba(159, 232, 255, 0.45);
      }
      .phase-ring-badge-i {
        color: #74ffd1;
        border-color: rgba(116, 255, 209, 0.52);
      }
      .phase-ring-badge-ii {
        color: #ffd276;
        border-color: rgba(255, 210, 118, 0.52);
      }
      .phase-ring-badge-iii {
        color: #ff9b9b;
        border-color: rgba(255, 155, 155, 0.56);
      }
      .phase-ring-badge-iv {
        color: #9fd4ff;
        border-color: rgba(159, 212, 255, 0.52);
      }
      .phase-ring-badge-off {
        color: #b6d0df;
        border-color: rgba(182, 208, 223, 0.45);
      }
      .human-btn {
        margin-top: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid rgba(159, 232, 255, 0.5);
        background: rgba(15, 55, 85, 0.5);
        color: #9fe8ff;
        font-size: 0.68rem;
        letter-spacing: 0.6px;
        cursor: pointer;
      }
      .human-btn:hover {
        background: rgba(30, 80, 120, 0.6);
      }
      #human-channel-stamp {
        margin-top: 5px;
        font-size: 0.6rem;
        opacity: 0.65;
      }
      #human-drift-breakdown {
        margin-top: 4px;
        font-size: 0.62rem;
        opacity: 0.78;
        font-family: "Courier New", monospace;
      }
      #human-drift-risk {
        margin-top: 3px;
        font-size: 0.63rem;
        opacity: 0.82;
        color: #c9eeff;
      }
      #human-drift-sparkline {
        margin-top: 3px;
        font-size: 0.62rem;
        opacity: 0.74;
        font-family: "Courier New", monospace;
        letter-spacing: 0.7px;
        white-space: pre;
      }
      .species-row {
        margin-top: 10px;
        padding: 6px;
        background: rgba(0, 0, 0, 0.4);
        border-left: 3px solid #ffcc00;
      }
      .species-genome {
        font-family: monospace;
        font-size: 0.75rem;
        color: #ffcc00;
      }
      .species-thought {
        font-style: italic;
        font-size: 0.8rem;
        color: #fff;
        margin-top: 4px;
      }
      .species-stats {
        font-size: 0.65rem;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 4px;
        text-transform: uppercase;
      }
      .lineage-breadcrumb {
        font-size: 0.6rem;
        color: #ff00ff;
        margin-top: 5px;
        opacity: 0.7;
        font-family: monospace;
      }
      #vox {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        text-align: center;
        pointer-events: none;
      }
      .thought {
        font-size: 1.2rem;
        font-style: italic;
        text-shadow: 0 0 10px #00f0ff;
        opacity: 0;
        transition: opacity 1s;
      }

      .hint {
        position: absolute;
        bottom: 80px;
        right: 20px;
        font-size: 0.6rem;
        opacity: 0.5;
        text-align: right;
      }
      #drift-halo {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 40;
        opacity: 0;
        transition: opacity 400ms ease, background 400ms ease;
        mix-blend-mode: screen;
        background: radial-gradient(
          circle at 50% 55%,
          rgba(159, 232, 255, 0.14),
          rgba(0, 0, 0, 0) 62%
        );
      }

      #legend {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border: 1px solid rgba(0, 240, 255, 0.3);
        border-radius: 8px;
        font-size: 11px;
        z-index: 1000;
        pointer-events: none;
        backdrop-filter: blur(5px);
      }
      .legend-title {
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        color: rgba(0, 240, 255, 0.8);
        font-weight: bold;
      }
      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      .color-box {
        width: 10px;
        height: 10px;
        margin-right: 8px;
        border-radius: 2px;
      }
    </style>
  </head>
  <body>
    <div id="drift-halo"></div>
    <div id="ui" class="glass">
      <h1>ALEPH: MULTIVERSE</h1>
      <div class="stats">
        <div>MATRIХ: ERA 33 | METABOLIC SPECIALIZATION</div>
        <div id="atom-count">ATOMS: ---</div>
        <div id="resonance">RESONANCE: ---</div>
        <div id="peers">PEERS: ---</div>
        <div id="fps">FPS: ---</div>
      </div>
    </div>

    <div id="legend">
      <div class="legend-title">Ecosystem Roles</div>
      <div class="legend-item">
        <div class="color-box" style="background: #ffffff"></div> Generalist
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #00ff88"></div> Producer
        (Energy)
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #4488ff"></div> Constructor
        (Build)
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #ff4444"></div> Siphon
        (Structure)
      </div>
    </div>

    <div id="chronos-console" class="glass">
      <h1
        style="color: #00ff64; border-bottom: 1px solid rgba(0, 255, 100, 0.3); padding-bottom: 5px"
      >
        ⏳ CHRONOS CONSOLE
      </h1>
      <button class="snapshot-btn snapshot-save-btn" onclick="saveGenesis()">
        [ FREEZE TIME (SAVE) ]
      </button>
      <div
        id="snapshots-list"
        style="margin-top: 10px; max-height: 150px; overflow-y: auto"
      >
        <div style="opacity: 0.5; font-style: italic">Fetching epochs...</div>
      </div>
    </div>

    <div id="governance-hud" class="glass">
      <h1
        style="color: #ff00ff; border-bottom: 1px solid rgba(255, 0, 255, 0.3); padding-bottom: 5px"
      >
        👑 GLOBAL GOVERNANCE
      </h1>
      <div id="gov-content" style="margin-top: 10px">
        <div style="opacity: 0.5; font-style: italic">Awaiting Regent...</div>
      </div>
    </div>

    <div id="inspector" class="glass">
      <h1>Atom Inspector</h1>
      <div class="label">Identity</div>
      <div id="ins-id" class="val">---</div>
      <div class="label">Position</div>
      <div id="ins-pos" class="val">---</div>
      <div class="label">Metrics (E / R)</div>
      <div id="ins-metrics" class="val">---/---</div>
      <div class="label">Ancestry</div>
      <div id="ins-ancestry" class="lineage-breadcrumb">---</div>
    </div>

    <div id="leaderboard" class="glass">
      <h1
        style="color: #ffcc00; border-bottom: 1px solid rgba(255, 200, 0, 0.3); padding-bottom: 5px"
      >
        🧬 DOMINANT GENOMES
      </h1>
      <div id="leaderboard-content">
        <!-- Populated via JS -->
        <div style="opacity: 0.5; margin-top: 10px; font-style: italic">
          Awaiting population data...
        </div>
      </div>
    </div>

    <div id="codex-panel" class="glass">
      <h1 class="codex-title">📚 AKASHA CODEX</h1>
      <div id="codex-content" style="margin-top: 8px">
        <div style="opacity: 0.5; margin-top: 10px; font-style: italic">
          Awaiting chronicles and narrative...
        </div>
      </div>
      <div id="human-channel" class="codex-row">
        <div class="human-channel-header">
          <div class="codex-row-title">🗣 Human Channel</div>
          <div class="human-channel-badges">
            <div
              id="human-phase-ring-badge"
              class="phase-ring-badge phase-ring-badge-off"
            >
              PHASE OFF
            </div>
            <div
              id="human-drift-severity"
              class="drift-severity drift-severity-baseline"
            >
              BASELINE
            </div>
          </div>
        </div>
        <div id="human-explanation" class="codex-row-body">
          Awaiting telemetry and codex narrative...
        </div>
        <div
          id="human-daemon-admission"
          class="codex-row-body codex-row-subtle"
        >
          daemon admission: awaiting signal...
        </div>
        <div
          id="human-federation-admission"
          class="codex-row-body codex-row-subtle"
        >
          federation admission: awaiting ingress...
        </div>
        <div
          id="human-daemon-history"
          class="codex-row-body codex-row-subtle"
        >
          daemon history: awaiting signal...
        </div>
        <div
          id="human-codex-lineage-guard"
          class="codex-row-body codex-row-subtle"
        >
          lineage guard: awaiting admission context...
        </div>
        <div
          id="human-phase-ring-summary"
          class="codex-row-body codex-row-subtle"
        >
          phase ring: awaiting telemetry...
        </div>
        <div
          id="human-phase-ring-vector"
          class="codex-row-body codex-row-subtle"
        >
          vector: θ=0.0000rad | quadrant=I | state=baseline
        </div>
        <div
          id="human-phase-ring-update"
          class="codex-row-body codex-row-subtle"
        >
          update: no daemon phase updates yet
        </div>
        <div
          id="human-phase-ring-trend"
          class="codex-row-body codex-row-subtle"
        >
          trend: collecting θ history...
        </div>
        <div
          id="human-spatial-hash"
          class="codex-row-body codex-row-subtle"
        >
          spatial hash: awaiting telemetry...
        </div>
        <button id="human-explain-btn" class="human-btn">
          Explain Current State
        </button>
        <div
          id="human-drift-explanation"
          class="codex-row-body codex-row-subtle"
        >
          Drift baseline is forming...
        </div>
        <div id="human-drift-breakdown" class="codex-row-body codex-row-subtle">
          score=0 | pop:baseline | energy:baseline | genome:stable | mood:stable
          | center:stable
        </div>
        <div id="human-drift-risk" class="codex-row-body codex-row-subtle">
          risk: baseline variance only
        </div>
        <div id="human-drift-sparkline" class="codex-row-body codex-row-subtle">
          trend:........ (steady)
        </div>
        <button id="human-drift-btn" class="human-btn">
          Explain Drift (90s)
        </button>
        <div id="human-channel-stamp">Updated: --</div>
      </div>
    </div>

    <div id="vox">
      <div id="thought-display" class="thought">Timeline Alpha stable.</div>
    </div>

    <div id="console-container">
      <input
        type="text"
        id="command-input"
        placeholder="SEW A THOUGHT or fork <name>..."
        autocomplete="off"
      >
    </div>

    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/examples/jsm/controls/OrbitControls": "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js",
          "three/examples/jsm/postprocessing/EffectComposer": "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js",
          "three/examples/jsm/postprocessing/RenderPass": "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js",
          "three/examples/jsm/postprocessing/UnrealBloomPass": "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js"
        }
      }
    </script>
    <script type="module">
      import * as THREE from "three";
      import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
      import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
      import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
      import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

      const MAX_ATOMS = 100000;
      const width = window.innerWidth, height = window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        20000,
      );
      camera.position.set(0, 0, 1000);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      document.body.appendChild(renderer.domElement);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(width, height),
          0.6,
          0.4,
          0.85,
        ),
      );

      const controls = new OrbitControls(camera, renderer.domElement);

      // Particles
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(MAX_ATOMS * 3);
      const col = new Float32Array(MAX_ATOMS * 3);
      const siz = new Float32Array(MAX_ATOMS);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(siz, 1));
      const particles = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          size: 4,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        }),
      );
      scene.add(particles);

      // Bonds
      const MAX_VIS_BONDS = MAX_ATOMS * 4;
      const bondGeo = new THREE.BufferGeometry();
      const bondPos = new Float32Array(MAX_VIS_BONDS * 2 * 3);
      const bondCol = new Float32Array(MAX_VIS_BONDS * 2 * 3);
      bondGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(bondPos, 3),
      );
      bondGeo.setAttribute(
        "color",
        new THREE.BufferAttribute(bondCol, 3),
      );
      const bondLines = new THREE.LineSegments(
        bondGeo,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
        }),
      );
      scene.add(bondLines);

      // Grid
      const GRID_W = 70, GRID_H = 40;
      const gridCells = GRID_W * GRID_H;
      const gridGeo = new THREE.BufferGeometry();
      const gridPosArr = new Float32Array(gridCells * 3);
      const gridColArr = new Float32Array(gridCells * 3);
      const gridSizArr = new Float32Array(gridCells);

      for (let gy = 0; gy < GRID_H; gy++) {
        for (let gx = 0; gx < GRID_W; gx++) {
          const i = gy * GRID_W + gx;
          gridPosArr[i * 3] = (gx * 20 + 10) - 700;
          gridPosArr[i * 3 + 1] = (gy * 20 + 10) - 400;
          gridPosArr[i * 3 + 2] = -50;
        }
      }
      gridGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(gridPosArr, 3),
      );
      gridGeo.setAttribute(
        "color",
        new THREE.BufferAttribute(gridColArr, 3),
      );
      gridGeo.setAttribute(
        "size",
        new THREE.BufferAttribute(gridSizArr, 1),
      );
      const gridParticles = new THREE.Points(
        gridGeo,
        new THREE.PointsMaterial({
          size: 20,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        }),
      );
      scene.add(gridParticles);

      // Structures
      const structGeo = new THREE.BoxGeometry(18, 18, 18);
      const structMat = new THREE.MeshPhongMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.5,
        shininess: 100,
      });
      const structMesh = new THREE.InstancedMesh(
        structGeo,
        structMat,
        GRID_W * GRID_H,
      );
      structMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(structMesh);

      scene.add(
        new THREE.DirectionalLight(0xffffff, 1).set(500, 500, 500),
      );
      scene.add(new THREE.AmbientLight(0x444444));

      // Global Flags
      let thoughtArchive = {};
      let lineageArchive = {};
      let prevailingSpecies = [];
      let immunityFlags = new Uint8Array(MAX_ATOMS);
      let signalFlags = new Uint8Array(MAX_ATOMS);
      let stiffnessFlags = new Float32Array(MAX_ATOMS * 4);
      let bondIndices = new Uint32Array(MAX_ATOMS * 4);
      let synapseFlags = new Int32Array(MAX_ATOMS * 4);
      let architectureFlags = new Int32Array(gridCells);
      let memoryFlags = new Uint8Array(gridCells * 8);
      let roleFlags = new Uint8Array(MAX_ATOMS);
      let codexSnapshot = {
        species: [],
        chronicles: [],
        relics: [],
        invariants: [],
        population: { current: 0, peak: 0 },
      };
      let codexNarrative = {
        mood: "STABLE",
        title: "",
        summary: "",
        sharedCenter: "tick.exists",
        invariantHighlights: [],
        relicStatus: "",
        recentChronicles: [],
      };
      let telemetrySnapshot = {
        tick: 0,
        avgEnergy: 0,
        dominantGenomes: [],
        voxPopuli: [],
        pulse_pressure: {
          novelty_signed: 0,
          symbiosis_signed: 0,
          novelty: 0,
          fear: 0,
          symbiosis: 0,
          ego: 0,
          ring: {
            enabled: false,
            theta: 0,
            scale: 0,
            fear_curiosity_balance: 0,
            ego_love_balance: 0,
          },
        },
        daemon_governance: {
          last_admission: null,
          last_admission_history: [],
          last_pressure_ring_update: null,
          last_pressure_ring_history: [],
        },
        spatial_hash_guard: {
          tick: -1,
          overflow_count: 0,
          max_cell_count: 0,
          overflow_ratio: 0,
        },
      };
      const DRIFT_LOOKBACK_MS = 90 * 1000;
      const DRIFT_HISTORY_RETENTION_MS = 10 * 60 * 1000;
      const DRIFT_SPARKLINE_POINTS = 18;
      const DRIFT_SPARKLINE_GLYPHS = ".:-=+*#%@";
      const PHASE_RING_HISTORY_LIMIT = 16;
      const RTC_SIGNAL_PATH = "/rtc/signal";
      const RTC_SIGNAL_RETRY_MIN_MS = 1200;
      const RTC_SIGNAL_RETRY_MAX_MS = 10000;
      const RTC_TELEMETRY_BROADCAST_MS = 3000;
      const RTC_ICE_SERVERS = [{
        urls: "stun:stun.l.google.com:19302",
      }];
      const RTC_MESH_EVENT_RETENTION_MS = 2 * 60 * 1000;
      const RTC_MESH_DEFAULT_PHEROMONE_INTENSITY = 120;
      const RTC_MESH_DEFAULT_PLASMID_CHARGE = 900;
      const RTC_MESH_MAX_X = 1399;
      const RTC_MESH_MAX_Y = 799;
      const RTC_MESH_HEX_RE = /^[0-9a-fA-F]{16}$/;
      let driftHistory = [];
      let phaseRingHistory = [];
      let lastPhaseRingSampleKey = "";
      let dictSyncInFlight = false;
      const raycaster = new THREE.Raycaster();
      const pointerNdc = new THREE.Vector2();
      const interactionPlane = new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        0,
      );
      const pointerHit = new THREE.Vector3();
      let avatarX = 700;
      let avatarY = 400;
      let avatarDirty = false;
      let avatarDisabled = false;
      let lastAvatarSync = 0;
      const AVATAR_SYNC_MS = 100;
      let omegaControlToken =
        localStorage.getItem("omega-control-token") || "";
      window.setOmegaControlToken = (token) => {
        omegaControlToken = String(token || "").trim();
        localStorage.setItem("omega-control-token", omegaControlToken);
      };

      const query = new URLSearchParams(window.location.search);
      const queryRtcSignal = String(
        query.get("rtcSignal") || query.get("rtc") || "",
      ).trim();
      if (queryRtcSignal.length > 0) {
        localStorage.setItem("omega-rtc-signal-url", queryRtcSignal);
      }
      const normalizeRtcSignalUrl = (raw) => {
        const value = String(raw || "").trim();
        if (value.length === 0) return "";
        try {
          const parsed = new URL(value, window.location.href);
          if (parsed.protocol === "http:") parsed.protocol = "ws:";
          if (parsed.protocol === "https:") parsed.protocol = "wss:";
          return parsed.toString();
        } catch (_) {
          return value;
        }
      };
      const deriveRtcSignalUrl = () => {
        const stored = String(
          localStorage.getItem("omega-rtc-signal-url") || "",
        ).trim();
        const candidate = queryRtcSignal.length > 0
          ? queryRtcSignal
          : stored;
        if (candidate.length > 0) {
          return normalizeRtcSignalUrl(candidate);
        }
        const wsProto = window.location.protocol === "https:"
          ? "wss:"
          : "ws:";
        if (window.location.port === "8080") {
          return `${wsProto}//${window.location.host}${RTC_SIGNAL_PATH}`;
        }
        const host = window.location.hostname || "127.0.0.1";
        return `${wsProto}//${host}:8080${RTC_SIGNAL_PATH}`;
      };
      const RTC_SIGNAL_URL = deriveRtcSignalUrl();
      const rtcRoomFromQuery = String(query.get("rtcRoom") || "")
        .trim();
      const RTC_SIGNAL_ROOM = rtcRoomFromQuery.length > 0
        ? rtcRoomFromQuery
        : "omega-default";
      const getPersistentPeerId = () => {
        const key = "omega-rtc-peer-id";
        const existing = String(localStorage.getItem(key) || "").trim();
        if (existing.length >= 6 && existing.length <= 64) {
          return existing;
        }
        const generated = `peer-${
          crypto.randomUUID().replace(/-/g, "").slice(0, 10)
        }`;
        localStorage.setItem(key, generated);
        return generated;
      };
      const RTC_SELF_PEER_ID = getPersistentPeerId();
      let rtcSignalSocket = null;
      let rtcSignalJoined = false;
      let rtcSignalConnected = false;
      let rtcReconnectTimer = null;
      let rtcReconnectDelayMs = RTC_SIGNAL_RETRY_MIN_MS;
      let rtcLastTelemetryBroadcastMs = 0;
      const rtcPeerConnections = new Map();
      const rtcDataChannels = new Map();
      const rtcPendingCandidates = new Map();
      const rtcRemoteTelemetry = new Map();
      const rtcSeenMeshEvents = new Map();
      let rtcMeshIngressAccepted = 0;
      let rtcMeshIngressRejected = 0;
      let rtcMeshEgress = 0;

      const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));
      const toFiniteNumber = (value) => {
        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
        if (typeof value === "string" && value.trim().length > 0) {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return parsed;
        }
        return null;
      };
      const normalizeMeshEventId = (value, fallbackPrefix = "mesh") => {
        const raw = String(value || "").trim();
        if (raw.length > 0) return raw.slice(0, 128);
        return `${fallbackPrefix}-${Date.now().toString(36)}-${
          crypto.randomUUID().replace(/-/g, "").slice(0, 8)
        }`;
      };
      const pruneMeshSeenEvents = (nowMs = Date.now()) => {
        const cutoff = nowMs - RTC_MESH_EVENT_RETENTION_MS;
        for (const [eventId, ts] of rtcSeenMeshEvents.entries()) {
          if (Number(ts || 0) < cutoff) {
            rtcSeenMeshEvents.delete(eventId);
          }
        }
      };
      const markMeshEventSeen = (eventId, nowMs = Date.now()) => {
        pruneMeshSeenEvents(nowMs);
        if (rtcSeenMeshEvents.has(eventId)) return false;
        rtcSeenMeshEvents.set(eventId, nowMs);
        return true;
      };

      function updatePeerMeshHud(extra = "") {
        const node = document.getElementById("peers");
        if (!node) return;
        const openChannels =
          Array.from(rtcDataChannels.values()).filter((ch) =>
            ch && ch.readyState === "open"
          ).length;
        const signal = rtcSignalConnected ? "UP" : "DOWN";
        const remoteTelemetryCount = rtcRemoteTelemetry.size;
        let telemetryTick = "";
        if (remoteTelemetryCount > 0) {
          const sorted = Array.from(rtcRemoteTelemetry.values()).sort((
            a,
            b,
          ) => Number(b.ts || 0) - Number(a.ts || 0));
          telemetryTick = ` | MESH_TICK:${
            Number(sorted[0]?.tick || 0)
          }`;
        }
        const suffix = extra.length > 0 ? ` | ${extra}` : "";
        const meshStats =
          ` | IO:${rtcMeshEgress}/${rtcMeshIngressAccepted}/${rtcMeshIngressRejected}`;
        node.textContent =
          `PEERS: ${openChannels} | SIGNAL:${signal} | ROOM:${RTC_SIGNAL_ROOM}${telemetryTick}${meshStats}${suffix}`;
      }

      function closeRtcPeer(remotePeerId) {
        const channel = rtcDataChannels.get(remotePeerId);
        if (channel) {
          try {
            channel.close();
          } catch (_) {}
          rtcDataChannels.delete(remotePeerId);
        }
        const pc = rtcPeerConnections.get(remotePeerId);
        if (pc) {
          try {
            pc.close();
          } catch (_) {}
          rtcPeerConnections.delete(remotePeerId);
        }
        rtcPendingCandidates.delete(remotePeerId);
        rtcRemoteTelemetry.delete(remotePeerId);
        updatePeerMeshHud();
      }

      function queueRtcCandidate(remotePeerId, candidate) {
        const list = rtcPendingCandidates.get(remotePeerId) || [];
        list.push(candidate);
        rtcPendingCandidates.set(remotePeerId, list);
      }

      async function drainRtcCandidates(remotePeerId) {
        const pc = rtcPeerConnections.get(remotePeerId);
        if (!pc) return;
        const queued = rtcPendingCandidates.get(remotePeerId) || [];
        if (queued.length === 0) return;
        const keep = [];
        for (const candidate of queued) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (_) {
            keep.push(candidate);
          }
        }
        if (keep.length > 0) {
          rtcPendingCandidates.set(remotePeerId, keep);
        } else rtcPendingCandidates.delete(remotePeerId);
      }

      function shouldInitiateOffer(remotePeerId) {
        return RTC_SELF_PEER_ID.localeCompare(remotePeerId) < 0;
      }

      function sendRtcSignalFrame(toPeerId, signalType, payload) {
        if (
          !rtcSignalSocket ||
          rtcSignalSocket.readyState !== WebSocket.OPEN ||
          !rtcSignalJoined
        ) {
          return false;
        }
        try {
          rtcSignalSocket.send(JSON.stringify({
            type: "signal",
            room: RTC_SIGNAL_ROOM,
            from: RTC_SELF_PEER_ID,
            to: toPeerId,
            signalType,
            payload,
          }));
          return true;
        } catch (_) {
          return false;
        }
      }

      async function postWebRtcInject(
        actionType,
        payload,
        eventId,
        sourcePeer,
      ) {
        const headers = { "Content-Type": "application/json" };
        if (omegaControlToken.length > 0) {
          headers["x-omega-control-token"] = omegaControlToken;
        }
        try {
          const response = await fetch("/api/webrtc/inject", {
            method: "POST",
            headers,
            body: JSON.stringify({
              type: actionType === "INJECT_PLASMID"
                ? "mesh_plasmid"
                : "mesh_pheromone",
              event_id: eventId,
              source_peer: sourcePeer,
              action_type: actionType,
              payload,
            }),
          });
          if (response.ok) {
            rtcMeshIngressAccepted++;
          } else {
            rtcMeshIngressRejected++;
          }
        } catch (_) {
          rtcMeshIngressRejected++;
        }
        updatePeerMeshHud();
      }

      function broadcastRtcFrame(frame) {
        const serialized = JSON.stringify(frame);
        let sent = 0;
        for (const channel of rtcDataChannels.values()) {
          if (!channel || channel.readyState !== "open") continue;
          try {
            channel.send(serialized);
            sent++;
          } catch (_) {}
        }
        if (sent > 0) {
          rtcMeshEgress += sent;
          updatePeerMeshHud();
        }
        return sent;
      }

      function emitMeshPheromone(
        x,
        y,
        intensity = RTC_MESH_DEFAULT_PHEROMONE_INTENSITY,
      ) {
        const px = toFiniteNumber(x);
        const py = toFiniteNumber(y);
        const pi = toFiniteNumber(intensity);
        if (px === null || py === null) return null;
        const eventId = normalizeMeshEventId("");
        markMeshEventSeen(eventId);
        const frame = {
          type: "mesh_pheromone",
          event_id: eventId,
          source_peer: RTC_SELF_PEER_ID,
          ts: Date.now(),
          payload: {
            target_x: clamp(Math.round(px), 0, RTC_MESH_MAX_X),
            target_y: clamp(Math.round(py), 0, RTC_MESH_MAX_Y),
            intensity: clamp(
              Math.round(
                pi === null ? RTC_MESH_DEFAULT_PHEROMONE_INTENSITY : pi,
              ),
              1,
              2000,
            ),
          },
        };
        broadcastRtcFrame(frame);
        return eventId;
      }

      function emitMeshPlasmid(
        x,
        y,
        hexCode,
        intensity = RTC_MESH_DEFAULT_PLASMID_CHARGE,
      ) {
        const px = toFiniteNumber(x);
        const py = toFiniteNumber(y);
        const pi = toFiniteNumber(intensity);
        const hex = String(hexCode || "").trim();
        if (px === null || py === null || !RTC_MESH_HEX_RE.test(hex)) {
          return null;
        }
        const eventId = normalizeMeshEventId("");
        markMeshEventSeen(eventId);
        const frame = {
          type: "mesh_plasmid",
          event_id: eventId,
          source_peer: RTC_SELF_PEER_ID,
          ts: Date.now(),
          payload: {
            target_x: clamp(Math.round(px), 0, RTC_MESH_MAX_X),
            target_y: clamp(Math.round(py), 0, RTC_MESH_MAX_Y),
            intensity: clamp(
              Math.round(
                pi === null ? RTC_MESH_DEFAULT_PLASMID_CHARGE : pi,
              ),
              1,
              5000,
            ),
            hex_code: hex.toUpperCase(),
          },
        };
        broadcastRtcFrame(frame);
        return eventId;
      }

      async function ingestMeshFrame(remotePeerId, frame) {
        const type = String(frame?.type || "").toLowerCase();
        if (type !== "mesh_pheromone" && type !== "mesh_plasmid") {
          return;
        }
        const payload =
          frame?.payload && typeof frame.payload === "object"
            ? frame.payload
            : null;
        if (!payload) {
          rtcMeshIngressRejected++;
          updatePeerMeshHud();
          return;
        }
        const px = toFiniteNumber(payload.target_x);
        const py = toFiniteNumber(payload.target_y);
        const pi = toFiniteNumber(payload.intensity);
        if (px === null || py === null) {
          rtcMeshIngressRejected++;
          updatePeerMeshHud();
          return;
        }
        const eventId = normalizeMeshEventId(
          frame?.event_id,
          `${remotePeerId}-${type}`,
        );
        if (!markMeshEventSeen(eventId, Date.now())) return;

        if (type === "mesh_plasmid") {
          const hex = String(payload.hex_code || "").trim();
          if (!RTC_MESH_HEX_RE.test(hex)) {
            rtcMeshIngressRejected++;
            updatePeerMeshHud();
            return;
          }
          await postWebRtcInject(
            "INJECT_PLASMID",
            {
              target_x: clamp(Math.round(px), 0, RTC_MESH_MAX_X),
              target_y: clamp(Math.round(py), 0, RTC_MESH_MAX_Y),
              intensity: clamp(
                Math.round(
                  pi === null ? RTC_MESH_DEFAULT_PLASMID_CHARGE : pi,
                ),
                1,
                5000,
              ),
              hex_code: hex.toUpperCase(),
            },
            eventId,
            remotePeerId,
          );
          return;
        }

        await postWebRtcInject(
          "DROP_PHEROMONE",
          {
            target_x: clamp(Math.round(px), 0, RTC_MESH_MAX_X),
            target_y: clamp(Math.round(py), 0, RTC_MESH_MAX_Y),
            intensity: clamp(
              Math.round(
                pi === null ? RTC_MESH_DEFAULT_PHEROMONE_INTENSITY : pi,
              ),
              1,
              2000,
            ),
          },
          eventId,
          remotePeerId,
        );
      }

      function attachRtcDataChannel(remotePeerId, channel) {
        rtcDataChannels.set(remotePeerId, channel);
        channel.onopen = () => {
          updatePeerMeshHud();
        };
        channel.onclose = () => {
          if (rtcDataChannels.get(remotePeerId) === channel) {
            rtcDataChannels.delete(remotePeerId);
          }
          updatePeerMeshHud();
        };
        channel.onerror = () => {};
        channel.onmessage = (event) => {
          if (typeof event.data !== "string") return;
          try {
            const parsed = JSON.parse(event.data);
            if (!parsed || typeof parsed !== "object") return;
            if (parsed.type === "telemetry") {
              rtcRemoteTelemetry.set(remotePeerId, {
                tick: Number(parsed.tick || 0),
                avgEnergy: Number(parsed.avgEnergy || 0),
                mood: String(parsed.mood || "STABLE"),
                population: Number(parsed.population || 0),
                ts: Number(parsed.ts || Date.now()),
              });
              updatePeerMeshHud();
              return;
            }
            if (
              parsed.type === "mesh_pheromone" ||
              parsed.type === "mesh_plasmid"
            ) {
              void ingestMeshFrame(remotePeerId, parsed);
            }
          } catch (_) {}
        };
      }

      function ensureRtcPeerConnection(remotePeerId, initiator) {
        const existing = rtcPeerConnections.get(remotePeerId);
        if (existing) return existing;
        const pc = new RTCPeerConnection({
          iceServers: RTC_ICE_SERVERS,
        });
        rtcPeerConnections.set(remotePeerId, pc);

        pc.onicecandidate = (event) => {
          if (!event.candidate) return;
          const payload = event.candidate.toJSON
            ? event.candidate.toJSON()
            : {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            };
          sendRtcSignalFrame(remotePeerId, "candidate", payload);
        };
        pc.onconnectionstatechange = () => {
          if (
            ["failed", "closed", "disconnected"].includes(
              pc.connectionState,
            )
          ) {
            closeRtcPeer(remotePeerId);
          } else {
            updatePeerMeshHud();
          }
        };
        pc.ondatachannel = (event) => {
          if (event.channel) {
            attachRtcDataChannel(remotePeerId, event.channel);
          }
        };

        if (initiator) {
          const channel = pc.createDataChannel("omega-mesh", {
            ordered: true,
          });
          attachRtcDataChannel(remotePeerId, channel);
        }
        return pc;
      }

      async function createRtcOffer(remotePeerId) {
        const pc = ensureRtcPeerConnection(remotePeerId, true);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendRtcSignalFrame(remotePeerId, "offer", {
            type: offer.type,
            sdp: offer.sdp,
          });
        } catch (_) {}
      }

      async function handleRtcSignalFrame(
        fromPeerId,
        signalType,
        payload,
      ) {
        if (!fromPeerId || fromPeerId === RTC_SELF_PEER_ID) return;
        const signal = String(signalType || "").toLowerCase();
        if (signal === "offer") {
          const pc = ensureRtcPeerConnection(fromPeerId, false);
          try {
            if (pc.signalingState !== "stable") {
              await pc.setLocalDescription({ type: "rollback" });
            }
            await pc.setRemoteDescription(
              new RTCSessionDescription(payload),
            );
            await drainRtcCandidates(fromPeerId);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendRtcSignalFrame(fromPeerId, "answer", {
              type: answer.type,
              sdp: answer.sdp,
            });
          } catch (_) {}
          return;
        }
        if (signal === "answer") {
          const pc = ensureRtcPeerConnection(fromPeerId, true);
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(payload),
            );
            await drainRtcCandidates(fromPeerId);
          } catch (_) {}
          return;
        }
        if (signal === "candidate") {
          const pc = rtcPeerConnections.get(fromPeerId);
          if (!pc || !pc.remoteDescription) {
            queueRtcCandidate(fromPeerId, payload);
            return;
          }
          try {
            await pc.addIceCandidate(payload);
          } catch (_) {
            queueRtcCandidate(fromPeerId, payload);
          }
        }
      }

      function scheduleRtcReconnect() {
        if (rtcReconnectTimer) return;
        rtcReconnectTimer = setTimeout(() => {
          rtcReconnectTimer = null;
          connectRtcSignaling();
        }, rtcReconnectDelayMs);
        rtcReconnectDelayMs = Math.min(
          RTC_SIGNAL_RETRY_MAX_MS,
          Math.round(rtcReconnectDelayMs * 1.6),
        );
      }

      function connectRtcSignaling() {
        if (
          !("RTCPeerConnection" in window) || !("WebSocket" in window)
        ) {
          updatePeerMeshHud("RTC_UNAVAILABLE");
          return;
        }
        if (
          rtcSignalSocket && (
            rtcSignalSocket.readyState === WebSocket.OPEN ||
            rtcSignalSocket.readyState === WebSocket.CONNECTING
          )
        ) return;

        try {
          rtcSignalSocket = new WebSocket(RTC_SIGNAL_URL);
        } catch (_) {
          rtcSignalConnected = false;
          rtcSignalJoined = false;
          updatePeerMeshHud("SIGNAL_ERROR");
          scheduleRtcReconnect();
          return;
        }

        rtcSignalSocket.onopen = () => {
          rtcSignalConnected = true;
          rtcSignalJoined = false;
          rtcReconnectDelayMs = RTC_SIGNAL_RETRY_MIN_MS;
          updatePeerMeshHud();
          try {
            rtcSignalSocket.send(JSON.stringify({
              type: "join",
              room: RTC_SIGNAL_ROOM,
              peerId: RTC_SELF_PEER_ID,
            }));
          } catch (_) {}
        };
        rtcSignalSocket.onclose = () => {
          rtcSignalConnected = false;
          rtcSignalJoined = false;
          updatePeerMeshHud();
          scheduleRtcReconnect();
        };
        rtcSignalSocket.onerror = () => {};
        rtcSignalSocket.onmessage = (event) => {
          if (typeof event.data !== "string") return;
          try {
            const message = JSON.parse(event.data);
            if (!message || typeof message !== "object") return;
            const type = String(message.type || "").toLowerCase();
            if (type === "joined") {
              rtcSignalJoined = true;
              const peers = Array.isArray(message.peers)
                ? message.peers
                : [];
              for (const peerId of peers) {
                const remote = String(peerId || "").trim();
                if (!remote || remote === RTC_SELF_PEER_ID) continue;
                if (shouldInitiateOffer(remote)) createRtcOffer(remote);
              }
              updatePeerMeshHud();
              return;
            }
            if (type === "peer-joined") {
              const remote = String(message.peerId || "").trim();
              if (!remote || remote === RTC_SELF_PEER_ID) return;
              if (shouldInitiateOffer(remote)) createRtcOffer(remote);
              updatePeerMeshHud();
              return;
            }
            if (type === "peer-left") {
              const remote = String(message.peerId || "").trim();
              if (!remote) return;
              closeRtcPeer(remote);
              return;
            }
            if (type === "signal") {
              const from = String(message.from || "").trim();
              const signalType = String(message.signalType || "")
                .trim();
              handleRtcSignalFrame(
                from,
                signalType,
                message.payload ?? null,
              );
              return;
            }
            if (type === "error") {
              const code = String(message.code || "UNKNOWN");
              updatePeerMeshHud(`SIGNAL_${code}`);
            }
          } catch (_) {}
        };
      }

      function broadcastRtcTelemetry(nowMs) {
        if (!rtcSignalJoined) return;
        if (
          nowMs - rtcLastTelemetryBroadcastMs <
            RTC_TELEMETRY_BROADCAST_MS
        ) return;
        rtcLastTelemetryBroadcastMs = nowMs;
        const packet = JSON.stringify({
          type: "telemetry",
          tick: Number(telemetrySnapshot?.tick || 0),
          avgEnergy: Number(telemetrySnapshot?.avgEnergy || 0),
          population: Number(codexSnapshot?.population?.current || 0),
          mood: String(codexNarrative?.mood || "STABLE"),
          ts: Date.now(),
        });
        for (const channel of rtcDataChannels.values()) {
          if (!channel || channel.readyState !== "open") continue;
          try {
            channel.send(packet);
          } catch (_) {}
        }
      }

      window.omegaRtcMesh = {
        dropPheromone: (
          x,
          y,
          intensity = RTC_MESH_DEFAULT_PHEROMONE_INTENSITY,
        ) => emitMeshPheromone(x, y, intensity),
        injectPlasmid: (
          x,
          y,
          hexCode,
          intensity = RTC_MESH_DEFAULT_PLASMID_CHARGE,
        ) => emitMeshPlasmid(x, y, hexCode, intensity),
      };

      // Command Input
      document.getElementById("command-input").addEventListener(
        "keydown",
        async (e) => {
          if (e.key === "Enter" && e.target.value) {
            const text = e.target.value;
            e.target.value = "";
            const words = String(text).trim().split(/\s+/);
            const command = words[0]?.toLowerCase() || "";
            const mode = words[1]?.toLowerCase() || "";
            if (
              command === "mesh" && mode === "pheromone" &&
              words.length >= 4
            ) {
              const x = toFiniteNumber(words[2]);
              const y = toFiniteNumber(words[3]);
              const intensity = words.length >= 5
                ? toFiniteNumber(words[4])
                : RTC_MESH_DEFAULT_PHEROMONE_INTENSITY;
              if (x !== null && y !== null) {
                emitMeshPheromone(
                  x,
                  y,
                  intensity === null
                    ? RTC_MESH_DEFAULT_PHEROMONE_INTENSITY
                    : intensity,
                );
                updatePeerMeshHud("MESH_PHEROMONE_EMIT");
                return;
              }
            }
            if (
              command === "mesh" && mode === "plasmid" &&
              words.length >= 5
            ) {
              const x = toFiniteNumber(words[2]);
              const y = toFiniteNumber(words[3]);
              const hex = words[4];
              const intensity = words.length >= 6
                ? toFiniteNumber(words[5])
                : RTC_MESH_DEFAULT_PLASMID_CHARGE;
              if (x !== null && y !== null) {
                const emitted = emitMeshPlasmid(
                  x,
                  y,
                  hex,
                  intensity === null
                    ? RTC_MESH_DEFAULT_PLASMID_CHARGE
                    : intensity,
                );
                updatePeerMeshHud(
                  emitted ? "MESH_PLASMID_EMIT" : "MESH_PLASMID_REJECT",
                );
                return;
              }
            }
            const endpoint = text.startsWith("fork ")
              ? "/fork"
              : "/inject";
            const body = text.startsWith("fork ")
              ? { name: text.split(" ")[1] }
              : { text, energy: 200 };
            fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
          }
        },
      );

      renderer.domElement.addEventListener("pointermove", (event) => {
        if (avatarDisabled) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 -
          1;
        pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 +
          1;
        raycaster.setFromCamera(pointerNdc, camera);
        if (
          !raycaster.ray.intersectPlane(interactionPlane, pointerHit)
        ) return;
        avatarX = Math.max(
          0,
          Math.min(1399, Math.round(pointerHit.x + 700)),
        );
        avatarY = Math.max(
          0,
          Math.min(799, Math.round(pointerHit.y + 400)),
        );
        avatarDirty = true;
      });

      async function syncAvatarPresence() {
        if (avatarDisabled) return;
        const headers = { "Content-Type": "application/json" };
        if (omegaControlToken.length > 0) {
          headers["x-omega-control-token"] = omegaControlToken;
        }
        try {
          const res = await fetch("/avatar", {
            method: "POST",
            headers,
            body: JSON.stringify({ x: avatarX, y: avatarY }),
          });
          if (!res.ok && (res.status === 401 || res.status === 403)) {
            avatarDisabled = true;
          }
        } catch (_) {}
      }

      // Synchronizers
      async function syncBuffer(url, target) {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const buffer = await res.arrayBuffer();
          target.set(new (target.constructor)(buffer));
        } catch (e) {}
      }

      async function sync(
        id,
        geometry,
        targetPos,
        targetCol,
        targetSiz,
      ) {
        try {
          const res = await fetch(`/state?id=${id}`);
          const buffer = await res.arrayBuffer();
          const view = new DataView(buffer);
          const OFFSETS = {
            ID: 0,
            X: MAX_ATOMS * 8,
            Y: MAX_ATOMS * 8 + MAX_ATOMS * 2,
            ENERGY: MAX_ATOMS * 12,
            RESONANCE: MAX_ATOMS * 12 + MAX_ATOMS * 4,
            LOGIC: MAX_ATOMS * 24,
          };

          targetSiz.fill(0);
          const speciesCount = {};
          let totalResonance = 0, activeAtoms = 0;

          for (let i = 0; i < MAX_ATOMS; i++) {
            const atomId = view.getBigUint64(OFFSETS.ID + i * 8, true);
            if (atomId === 0n) continue;

            const x = view.getInt16(OFFSETS.X + i * 2, true) - 700;
            const y = view.getInt16(OFFSETS.Y + i * 2, true) - 400;
            const e = view.getFloat32(OFFSETS.ENERGY + i * 4, true);
            const r = view.getFloat32(OFFSETS.RESONANCE + i * 4, true);

            totalResonance += r;
            activeAtoms++;

            let logicHex = "";
            for (let b = 0; b < 8; b++) {
              logicHex += view.getUint8(OFFSETS.LOGIC + i * 8 + b)
                .toString(16).padStart(2, "0").toUpperCase();
            }
            if (!speciesCount[logicHex]) {
              speciesCount[logicHex] = { count: 0, energy: 0 };
            }
            speciesCount[logicHex].count++;
            speciesCount[logicHex].energy += e;

            targetPos[i * 3] = x;
            targetPos[i * 3 + 1] = y;
            targetPos[i * 3 + 2] = r * 0.1;

            const role = roleFlags[i];
            const signal = signalFlags[i];
            const qLevel = immunityFlags[i];
            let isLocked = false;
            for (let b = 0; b < 4; b++) {
              if (stiffnessFlags[i * 4 + b] > 0.8) isLocked = true;
            }

            // ERA 33: Trophic Coloring
            if (role === 1) { // Producer (Green)
              targetCol[i * 3] = 0;
              targetCol[i * 3 + 1] = 1.0;
              targetCol[i * 3 + 2] = 0.5;
            } else if (role === 2) { // Constructor (Blue)
              targetCol[i * 3] = 0.2;
              targetCol[i * 3 + 1] = 0.5;
              targetCol[i * 3 + 2] = 1.0;
            } else if (role === 3) { // Siphon (Red)
              targetCol[i * 3] = 1.0;
              targetCol[i * 3 + 1] = 0.2;
              targetCol[i * 3 + 2] = 0.2;
            } else if (qLevel === 1) { // Flagged
              targetCol[i * 3] = 1.0;
              targetCol[i * 3 + 1] = 0.4;
              targetCol[i * 3 + 2] = 0;
            } else if (isLocked) { // Locked/Crystal
              targetCol[i * 3] = 1.0;
              targetCol[i * 3 + 1] = 1.0;
              targetCol[i * 3 + 2] = 1.0;
            } else if (signal > 0) { // Signaling
              targetCol[i * 3] = 0;
              targetCol[i * 3 + 1] = 1.0;
              targetCol[i * 3 + 2] = 1.0;
            } else { // Default
              targetCol[i * 3] = 0.5;
              targetCol[i * 3 + 1] = 0.7;
              targetCol[i * 3 + 2] = 1.0;
            }

            targetSiz[i] = 2 + e / 20;
            if (r > 800) targetSiz[i] *= 2;
          }

          document.getElementById("atom-count").innerText =
            `ATOMS: ${activeAtoms}`;
          document.getElementById("resonance").innerText =
            `RESONANCE: ${
              (totalResonance / activeAtoms || 0).toFixed(1)
            }`;

          prevailingSpecies = Object.keys(speciesCount)
            .map((hex) => ({
              hex,
              count: speciesCount[hex].count,
              avgEnergy: speciesCount[hex].energy /
                speciesCount[hex].count,
            }))
            .sort((a, b) => b.count - a.count).slice(0, 5);

          // Update Bonds
          let bondVIdx = 0;
          for (let i = 0; i < MAX_ATOMS; i++) {
            if (view.getBigUint64(OFFSETS.ID + i * 8, true) === 0n) {
              continue;
            }
            for (let b = 0; b < 4; b++) {
              const bIdx = bondIndices[i * 4 + b];
              const stiff = stiffnessFlags[i * 4 + b];
              if (
                bIdx > 0 && bIdx < MAX_ATOMS &&
                (stiff > 0.1 || signalFlags[i] > 0)
              ) {
                bondPos[bondVIdx * 3] = targetPos[i * 3];
                bondPos[bondVIdx * 3 + 1] = targetPos[i * 3 + 1];
                bondPos[bondVIdx * 3 + 2] = targetPos[i * 3 + 2];
                bondPos[(bondVIdx + 1) * 3] = targetPos[bIdx * 3];
                bondPos[(bondVIdx + 1) * 3 + 1] =
                  targetPos[bIdx * 3 + 1];
                bondPos[(bondVIdx + 1) * 3 + 2] =
                  targetPos[bIdx * 3 + 2];

                const r = 1.0,
                  g = 0.4 + stiff * 0.6,
                  bVal = stiff * 0.2;
                bondCol[bondVIdx * 3] = bondCol[(bondVIdx + 1) * 3] = r;
                bondCol[bondVIdx * 3 + 1] =
                  bondCol[(bondVIdx + 1) * 3 + 1] =
                    g;
                bondCol[bondVIdx * 3 + 2] =
                  bondCol[(bondVIdx + 1) * 3 + 2] =
                    bVal;
                bondVIdx += 2;
              }
            }
          }
          bondGeo.setDrawRange(0, bondVIdx);
          bondGeo.attributes.position.needsUpdate = true;
          bondGeo.attributes.color.needsUpdate = true;

          geometry.attributes.position.needsUpdate = true;
          geometry.attributes.color.needsUpdate = true;
          geometry.attributes.size.needsUpdate = true;
        } catch (e) {}
      }

      async function updateArchitecture() {
        const dummy = new THREE.Object3D();
        for (let i = 0; i < gridCells; i++) {
          const cell = architectureFlags[i];
          const density = (cell >> 8) & 0xFF;
          if (density > 0) {
            const gx = i % GRID_W, gy = Math.floor(i / GRID_W);
            dummy.position.set(
              (gx * 20 + 10) - 700,
              (gy * 20 + 10) - 400,
              -20,
            );
            const s = density / 255;
            dummy.scale.set(s, s, s);
            structMesh.setColorAt(
              i,
              new THREE.Color(
                memoryFlags[i * 8] !== 0 ? 0x00ff88 : 0x88aaff,
              ),
            );
          } else dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          structMesh.setMatrixAt(i, dummy.matrix);
        }
        structMesh.instanceMatrix.needsUpdate = true;
        if (structMesh.instanceColor) {
          structMesh.instanceColor.needsUpdate = true;
        }
      }

      async function syncGrid() {
        try {
          const res = await fetch("/grid");
          if (!res.ok) return;
          const view = new DataView(await res.arrayBuffer());
          for (let i = 0; i < gridCells; i++) {
            const nutrient = view.getInt32(i * 4, true);
            const attract = view.getFloat32(11200 + i * 4, true);
            gridSizArr[i] = 0;
            gridColArr[i * 3] =
              gridColArr[i * 3 + 1] =
              gridColArr[i * 3 + 2] =
                0;
            if (nutrient > 0) {
              const intensity = Math.min(1.0, nutrient / 2000);
              gridColArr[i * 3 + 1] = intensity * 0.8;
              gridSizArr[i] = 8 + intensity * 15;
            }
            if (attract > 0.01) {
              const a = Math.min(1.0, attract / 400);
              gridColArr[i * 3] = Math.max(gridColArr[i * 3], 1.0 * a);
              gridColArr[i * 3 + 2] = Math.max(
                gridColArr[i * 3 + 2],
                0.9 * a,
              );
              gridSizArr[i] += 2 + a * 10;
            }
          }
          gridGeo.attributes.color.needsUpdate = true;
          gridGeo.attributes.size.needsUpdate = true;
        } catch (e) {}
      }

      function updateLeaderboard() {
        const container = document.getElementById(
          "leaderboard-content",
        );
        if (prevailingSpecies.length === 0) {
          container.innerHTML = "...";
          return;
        }
        container.innerHTML = prevailingSpecies.map((sp, i) => `
          <div class="species-row">
            <div class="species-genome">[${sp.hex}]</div>
            ${
          thoughtArchive[sp.hex]
            ? `<div class="species-thought">"${
              thoughtArchive[sp.hex]
            }"</div>`
            : ""
        }
            <div class="species-stats" style="color: ${
          i === 0 ? "#00f0ff" : "#fff"
        }">POP: ${sp.count} | ENG: ${sp.avgEnergy.toFixed(0)}</div>
          </div>
        `).join("");
      }

      function updateCodexPanel() {
        const container = document.getElementById("codex-content");
        const species = (codexSnapshot.species || []).slice(0, 2);
        const chronicles = (codexSnapshot.chronicles || []).slice(0, 2);
        const relics = (codexSnapshot.relics || []).slice(0, 1);
        const invariants = (codexSnapshot.invariants || []).slice(0, 2);
        const pop = codexSnapshot.population || { current: 0, peak: 0 };
        const narrative = codexNarrative || {};
        const mood = String(narrative.mood || "STABLE").toUpperCase();
        const moodClass = `codex-mood-${mood.toLowerCase()}`;
        const recentNarrativeChronicles =
          (narrative.recentChronicles || []).slice(0, 2);
        const narrativeInvariants =
          (narrative.invariantHighlights || []).slice(0, 2);

        const escapeHtml = (value) =>
          String(value ?? "").replace(/[&<>"']/g, (ch) => {
            if (ch === "&") return "&amp;";
            if (ch === "<") return "&lt;";
            if (ch === ">") return "&gt;";
            if (ch === '"') return "&quot;";
            return "&#39;";
          });

        const rows = [];
        if (narrative.title || narrative.summary) {
          rows.push(`
            <div class="codex-row">
              <div class="codex-row-title">Narrative <span class="codex-mood ${moodClass}">${
            escapeHtml(mood)
          }</span></div>
              <div class="codex-row-body">${
            escapeHtml((narrative.title || "").slice(0, 120))
          }</div>
              <div class="codex-row-body codex-row-subtle">${
            escapeHtml((narrative.summary || "").slice(0, 180))
          }</div>
              ${
            narrative.relicStatus
              ? `<div class="codex-row-body codex-row-subtle">${
                escapeHtml((narrative.relicStatus || "").slice(0, 150))
              }</div>`
              : ""
          }
            </div>
          `);
        }

        rows.push(`
          <div class="codex-row">
            <div class="codex-row-title">Population Trace</div>
            <div class="codex-row-body">Current: ${
          pop.current || 0
        } | Peak: ${pop.peak || 0}</div>
          </div>
        `);

        const sharedCenter = inferSharedCenterLabel();
        const dominantInvariant = inferDominantInvariantVector();
        const topDegradeReasons = buildTopDegradeReasonsSummary();
        rows.push(`
          <div class="codex-row">
            <div class="codex-row-title">Shared Center</div>
            <div class="codex-row-body">${
          escapeHtml(sharedCenter)
        }</div>
            ${
          dominantInvariant.length > 0
            ? `<div class="codex-row-body codex-row-subtle">Dominant invariant: ${
              escapeHtml(dominantInvariant.slice(0, 100))
            }</div>`
            : ""
        }
          </div>
        `);
        rows.push(`
          <div class="codex-row">
            <div class="codex-row-title">Top Degrade Reasons</div>
            <div class="codex-row-body codex-row-subtle">${
          escapeHtml(topDegradeReasons)
        }</div>
          </div>
        `);

        if (species.length > 0) {
          for (const s of species) {
            rows.push(`
              <div class="codex-row">
                <div class="codex-row-title">Species: ${
              escapeHtml(s.latinName || "Unnamed")
            }</div>
                <div class="codex-row-body">${
              escapeHtml((s.behavior || "").slice(0, 120))
            }</div>
              </div>
            `);
          }
        }

        if (recentNarrativeChronicles.length > 0) {
          for (const c of recentNarrativeChronicles) {
            rows.push(`
              <div class="codex-row">
                <div class="codex-row-title">Narrative Chronicle: ${
              escapeHtml(c.title || "Event")
            }</div>
                <div class="codex-row-body codex-row-subtle">Epoch ${
              Number(c.epoch) || 0
            } | ${escapeHtml(c.type || "unknown")}</div>
              </div>
            `);
          }
        } else if (chronicles.length > 0) {
          for (const c of chronicles) {
            rows.push(`
              <div class="codex-row">
                <div class="codex-row-title">Chronicle: ${
              escapeHtml(c.title || "Event")
            }</div>
                <div class="codex-row-body">${
              escapeHtml((c.body || "").slice(0, 120))
            }</div>
              </div>
            `);
          }
        }

        if (narrativeInvariants.length > 0) {
          for (const inv of narrativeInvariants) {
            rows.push(`
              <div class="codex-row">
                <div class="codex-row-title">Invariant: ${
              escapeHtml(
                (inv.signature || "").slice(0, 10).toUpperCase(),
              )
            }</div>
                <div class="codex-row-body codex-row-subtle">Center ${
              escapeHtml(String(inv.center || "tick.exists"))
            } | Vector ${
              escapeHtml(String(inv.dominantVector || "none"))
            }</div>
              </div>
            `);
          }
        } else if (invariants.length > 0) {
          for (const inv of invariants) {
            rows.push(`
              <div class="codex-row">
                <div class="codex-row-title">Invariant Archive</div>
                <div class="codex-row-body">${
              escapeHtml(String(inv.summary || "invariant frame"))
            }</div>
              </div>
            `);
          }
        }

        if (relics.length > 0) {
          const relic = relics[0];
          rows.push(`
            <div class="codex-row">
              <div class="codex-row-title">Relic: ${
            escapeHtml(relic.id || "Unknown")
          }</div>
              <div class="codex-row-body">${
            escapeHtml((relic.summary || "").slice(0, 120))
          }</div>
            </div>
          `);
        }

        if (rows.length === 1) {
          rows.push(`
            <div class="codex-row">
              <div class="codex-row-title">Codex Status</div>
              <div class="codex-row-body">No discovered records yet.</div>
            </div>
          `);
        }

        container.innerHTML = rows.join("");
      }

      function nowClock() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
      }

      const dominantGenomeHex = () => {
        if (!Array.isArray(telemetrySnapshot?.dominantGenomes)) {
          return "";
        }
        const first = telemetrySnapshot.dominantGenomes[0];
        return typeof first === "string" ? first : "";
      };

      function inferDominantSpeciesLabel() {
        const dominant =
          Array.isArray(telemetrySnapshot.dominantGenomes)
            ? telemetrySnapshot.dominantGenomes[0]
            : null;
        if (!dominant || typeof dominant !== "string") {
          return "Unclassified lineage";
        }
        const found = (codexSnapshot.species || []).find((entry) =>
          entry.genome === dominant
        );
        if (found && found.latinName) return found.latinName;
        return `Genome ${dominant.slice(0, 8)}`;
      }

      function inferSharedCenterLabel() {
        const narrativeCenter = String(
          codexNarrative?.sharedCenter || "",
        )
          .trim();
        if (narrativeCenter.length > 0) return narrativeCenter;
        const narrativeInvariant = Array.isArray(
            codexNarrative?.invariantHighlights,
          ) && codexNarrative.invariantHighlights.length > 0
          ? codexNarrative.invariantHighlights[0]
          : null;
        if (narrativeInvariant && narrativeInvariant.center) {
          return String(narrativeInvariant.center).trim() ||
            "tick.exists";
        }
        const archiveInvariant =
          Array.isArray(codexSnapshot?.invariants) &&
            codexSnapshot.invariants.length > 0
            ? codexSnapshot.invariants[0]
            : null;
        if (archiveInvariant && archiveInvariant.center) {
          return String(archiveInvariant.center).trim() ||
            "tick.exists";
        }
        return "tick.exists";
      }

      function inferDominantInvariantVector() {
        const narrativeInvariant = Array.isArray(
            codexNarrative?.invariantHighlights,
          ) && codexNarrative.invariantHighlights.length > 0
          ? codexNarrative.invariantHighlights[0]
          : null;
        if (
          narrativeInvariant &&
          typeof narrativeInvariant.dominantVector === "string" &&
          narrativeInvariant.dominantVector.trim().length > 0
        ) {
          return narrativeInvariant.dominantVector.trim();
        }
        const archiveInvariant =
          Array.isArray(codexSnapshot?.invariants) &&
            codexSnapshot.invariants.length > 0
            ? codexSnapshot.invariants[0]
            : null;
        if (
          archiveInvariant &&
          typeof archiveInvariant.dominantVector === "string" &&
          archiveInvariant.dominantVector.trim().length > 0
        ) {
          return archiveInvariant.dominantVector.trim();
        }
        return "";
      }

      function currentPulsePressure() {
        const pressure = telemetrySnapshot?.pulse_pressure;
        if (!pressure || typeof pressure !== "object") return null;
        return pressure;
      }

      function currentPressureRing() {
        const pressure = currentPulsePressure();
        const ring = pressure?.ring;
        if (!ring || typeof ring !== "object") return null;
        return ring;
      }

      function currentPressureRingUpdate() {
        const governance = telemetrySnapshot?.daemon_governance;
        if (!governance || typeof governance !== "object") return null;
        const update = governance.last_pressure_ring_update;
        if (!update || typeof update !== "object") {
          const history = currentPressureRingHistory();
          if (history.length === 0) return null;
          return history[0];
        }
        return update;
      }

      function currentPressureRingHistory() {
        const governance = telemetrySnapshot?.daemon_governance;
        if (!governance || typeof governance !== "object") return [];
        const history = governance.last_pressure_ring_history;
        if (!Array.isArray(history)) return [];
        return history.filter((entry) =>
          entry && typeof entry === "object"
        )
          .slice(0, PHASE_RING_HISTORY_LIMIT);
      }

      function normalizePhaseTheta(value) {
        const theta = Number(value);
        if (!Number.isFinite(theta)) return 0;
        const tau = Math.PI * 2;
        const wrapped = theta % tau;
        return wrapped >= 0 ? wrapped : wrapped + tau;
      }

      function phaseRingQuadrant(theta) {
        const t = normalizePhaseTheta(theta);
        if (t < Math.PI * 0.5) return "I";
        if (t < Math.PI) return "II";
        if (t < Math.PI * 1.5) return "III";
        return "IV";
      }

      function phaseRingSeason(quadrant) {
        const q = String(quadrant || "").toUpperCase();
        if (q === "I") return "curiosity+love";
        if (q === "II") return "fear+love";
        if (q === "III") return "fear+ego";
        if (q === "IV") return "curiosity+ego";
        return "baseline";
      }

      function signedAngularDelta(prevTheta, nextTheta) {
        const prev = normalizePhaseTheta(prevTheta);
        const next = normalizePhaseTheta(nextTheta);
        let delta = next - prev;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        return delta;
      }

      function pushPhaseRingPoint() {
        const ring = currentPressureRing();
        if (!ring) return;
        const update = currentPressureRingUpdate();
        const theta = normalizePhaseTheta(ring.theta);
        const sample = {
          ts: Date.now(),
          tick: Number(telemetrySnapshot?.tick || 0),
          theta,
          enabled: Boolean(ring.enabled),
          scale: Number(ring.scale || 0),
          quadrant: phaseRingQuadrant(theta),
          updateTick: Number(update?.tick || 0),
        };
        const key = [
          sample.updateTick,
          sample.theta.toFixed(6),
          sample.scale,
          sample.enabled ? 1 : 0,
        ].join("|");
        if (key === lastPhaseRingSampleKey) return;
        lastPhaseRingSampleKey = key;
        phaseRingHistory.push(sample);
        if (phaseRingHistory.length > PHASE_RING_HISTORY_LIMIT) {
          phaseRingHistory = phaseRingHistory.slice(
            -PHASE_RING_HISTORY_LIMIT,
          );
        }
      }

      function canonicalPhaseRingHistory() {
        const history = currentPressureRingHistory();
        if (history.length === 0) return [];
        const parsed = history.map((entry, index) => {
          const theta = Number(entry.theta);
          if (!Number.isFinite(theta)) return null;
          return {
            index,
            tick: Number(entry.tick || 0),
            theta: normalizePhaseTheta(theta),
            delta: Number(entry.delta_theta || 0),
            scale: Number(entry.scale || 0),
            enabled: Boolean(entry.enabled),
          };
        }).filter((entry) => entry && Number.isFinite(entry.theta))
          .map((entry) => entry);
        if (parsed.length < 2) return [];
        parsed.sort((a, b) => {
          const tickDelta = Number(a.tick || 0) - Number(b.tick || 0);
          if (tickDelta !== 0) return tickDelta;
          return Number(b.index || 0) - Number(a.index || 0);
        });
        return parsed.slice(-PHASE_RING_HISTORY_LIMIT);
      }

      function buildPhaseRingTrend() {
        const canonical = canonicalPhaseRingHistory();
        const trendSource = canonical.length >= 2 ? "server" : "local";
        const history = canonical.length >= 2
          ? canonical
          : phaseRingHistory;
        if (history.length < 2) {
          return "trend: collecting θ history...";
        }
        const recent = history.slice(-6);
        const deltas = [];
        for (let i = 1; i < recent.length; i++) {
          deltas.push(
            signedAngularDelta(recent[i - 1].theta, recent[i].theta),
          );
        }
        if (deltas.length === 0) {
          return "trend: collecting θ history...";
        }
        const avgDelta = deltas.reduce((acc, value) => acc + value, 0) /
          deltas.length;
        const lastDelta = deltas[deltas.length - 1] || 0;
        const glyphs = deltas.map((delta) => {
          if (delta > 0.0005) return "+";
          if (delta < -0.0005) return "-";
          return ".";
        }).join("");
        const direction = Math.abs(avgDelta) <= 0.0005
          ? "steady"
          : avgDelta > 0
          ? "clockwise"
          : "counterclockwise";
        return `trend: ${glyphs} | avgΔθ=${
          avgDelta.toFixed(4)
        }rad | lastΔθ=${
          lastDelta.toFixed(4)
        } | ${direction} | ${trendSource}`;
      }

      function buildPhaseRingSummary() {
        const pressure = currentPulsePressure();
        const ring = currentPressureRing();
        if (!pressure || !ring) {
          return "phase ring: awaiting telemetry...";
        }
        const enabled = ring.enabled ? "on" : "off";
        const novelty = Number(pressure.novelty || 0);
        const fear = Number(pressure.fear || 0);
        const symbiosis = Number(pressure.symbiosis || 0);
        const ego = Number(pressure.ego || 0);
        const scale = Number(ring.scale || 0);
        return `phase ring: ${enabled} | N:${novelty} F:${fear} S:${symbiosis} E:${ego} | scale=${scale}`;
      }

      function buildPhaseRingVector() {
        const ring = currentPressureRing();
        if (!ring) {
          return "vector: phase ring unavailable";
        }
        const theta = normalizePhaseTheta(ring.theta);
        const q = phaseRingQuadrant(theta);
        const season = phaseRingSeason(q);
        const fc = Number(ring.fear_curiosity_balance || 0);
        const el = Number(ring.ego_love_balance || 0);
        const state = ring.enabled
          ? `fc=${fc.toFixed(3)} | el=${el.toFixed(3)}`
          : "ring disabled";
        return `vector: θ=${
          theta.toFixed(4)
        }rad | quadrant=${q} (${season}) | ${state}`;
      }

      function buildPhaseRingUpdateSummary() {
        const update = currentPressureRingUpdate();
        if (!update) {
          return "update: no daemon phase updates yet";
        }
        const mode = String(update.mode || "set").toUpperCase();
        const source = String(update.source || "daemon_phase_scheduler")
          .slice(0, 42);
        const theta = Number(update.theta || 0);
        const delta = Number(update.delta_theta || 0);
        const scale = Number(update.scale || 0);
        const tick = Number(update.tick || 0);
        return `update: ${mode} @tick ${tick} | θ=${
          theta.toFixed(4)
        } Δ=${delta.toFixed(4)} | scale=${scale} | ${source}`;
      }

      function applyPhaseRingBadge() {
        const node = document.getElementById("human-phase-ring-badge");
        if (!node) return;
        const ring = currentPressureRing();
        node.className = "phase-ring-badge";
        if (!ring || !ring.enabled) {
          node.textContent = "PHASE OFF";
          node.classList.add("phase-ring-badge-off");
          return;
        }
        const q = phaseRingQuadrant(ring.theta);
        const season = phaseRingSeason(q).toUpperCase();
        node.textContent = `Q${q} ${season}`;
        if (q === "I") node.classList.add("phase-ring-badge-i");
        else if (q === "II") node.classList.add("phase-ring-badge-ii");
        else if (q === "III") {
          node.classList.add("phase-ring-badge-iii");
        } else node.classList.add("phase-ring-badge-iv");
      }

      function currentSpatialHashGuard() {
        const guard = telemetrySnapshot?.spatial_hash_guard;
        if (!guard || typeof guard !== "object") return null;
        return guard;
      }

      function spatialHashSeverity(guard) {
        if (!guard) return "baseline";
        const overflow = Math.max(0, Number(guard.overflow_count || 0));
        const ratio = Math.max(0, Number(guard.overflow_ratio || 0));
        if (overflow > 0 || ratio >= 0.01) return "hot";
        if (ratio >= 0.001) return "warm";
        return "stable";
      }

      function buildSpatialHashSummary() {
        const guard = currentSpatialHashGuard();
        if (!guard) {
          return "spatial hash: awaiting telemetry...";
        }
        const tick = Number(guard.tick || 0);
        const overflow = Math.max(0, Number(guard.overflow_count || 0));
        const maxCell = Math.max(0, Number(guard.max_cell_count || 0));
        const ratio = Math.max(0, Number(guard.overflow_ratio || 0));
        const severity = spatialHashSeverity(guard);
        return `spatial hash: ${severity} | overflow=${overflow} | maxCell=${maxCell} | ratio=${
          ratio.toFixed(6)
        } | tick=${tick}`;
      }

      function spatialHashHeatProfile() {
        const guard = currentSpatialHashGuard();
        if (!guard) {
          return {
            active: false,
            level: "stable",
            ratio: 0,
            intensity: 0,
          };
        }
        const overflow = Math.max(0, Number(guard.overflow_count || 0));
        const ratio = Math.max(0, Number(guard.overflow_ratio || 0));
        const level = spatialHashSeverity(guard);
        if (level === "stable" && overflow <= 0) {
          return {
            active: false,
            level,
            ratio,
            intensity: 0,
          };
        }
        // Ratio 0.02 (2%) maps to full saturation heat.
        const ratioIntensity = Math.min(1, ratio / 0.02);
        const overflowBoost = overflow > 0 ? 0.2 : 0;
        const intensity = Math.max(
          0.05,
          Math.min(1, ratioIntensity + overflowBoost),
        );
        return {
          active: true,
          level,
          ratio,
          intensity,
        };
      }

      function applySpatialHashHaloOverlay(baseOpacity) {
        const halo = document.getElementById("drift-halo");
        if (!halo) return;
        const heat = spatialHashHeatProfile();
        if (!heat.active) return;
        const intensity = Number(heat.intensity || 0);
        const hot = heat.level === "hot";
        const opacityBoost = hot ? 0.22 : 0.16;
        const nextOpacity = Math.min(
          0.98,
          Math.max(0.42, baseOpacity + opacityBoost * intensity),
        );
        const alpha = hot
          ? 0.18 + 0.22 * intensity
          : 0.12 + 0.16 * intensity;
        const tint = hot ? "255, 98, 78" : "255, 190, 96";
        halo.style.opacity = nextOpacity.toFixed(2);
        halo.style.background =
          `radial-gradient(circle at 50% 55%, rgba(${tint}, ${
            alpha.toFixed(3)
          }), rgba(0, 0, 0, 0) 62%)`;
      }

      function currentDaemonAdmission() {
        const governance = telemetrySnapshot?.daemon_governance;
        if (!governance || typeof governance !== "object") return null;
        const admission = governance.last_admission;
        if (!admission || typeof admission !== "object") return null;
        return admission;
      }

      function currentFederationAdmission() {
        const federation = telemetrySnapshot?.federation_admission;
        if (!federation || typeof federation !== "object") return null;
        const latest = federation.latest;
        if (!latest || typeof latest !== "object") return null;
        return latest;
      }

      function currentDaemonAdmissionHistory() {
        const governance = telemetrySnapshot?.daemon_governance;
        if (!governance || typeof governance !== "object") return [];
        const history = governance.last_admission_history;
        if (!Array.isArray(history)) return [];
        return history.filter((entry) =>
          entry && typeof entry === "object"
        ).slice(0, 6);
      }

      function buildDaemonAdmissionSummary() {
        const admission = currentDaemonAdmission();
        if (!admission) {
          return "daemon admission: no action observed yet";
        }
        const severity = String(admission.severity || "UNKNOWN")
          .toUpperCase();
        const status = String(admission.status || "accepted")
          .toLowerCase();
        const requested = String(
          admission.requestedAction || "UNKNOWN",
        );
        const applied = String(admission.appliedAction || "UNKNOWN");
        const reason = String(admission.reason || "n/a").slice(0, 120);
        const score = Number(admission.score || 0);
        const degraded = Boolean(admission.degraded);
        const badge = degraded ? "degraded" : status;
        const bridge = `${requested} -> ${applied}`;
        return `daemon admission: ${severity} (${badge}) | score=${score} | ${bridge} | reason=${reason}`;
      }

      function buildFederationAdmissionSummary() {
        const admission = currentFederationAdmission();
        if (!admission) {
          return "federation admission: no ingress observed yet";
        }
        const severity = String(admission.severity || "LOW")
          .toUpperCase();
        const action = String(admission.action || "accept")
          .toUpperCase();
        const source = String(admission.sourceNode || "unknown")
          .slice(0, 40);
        const score = Math.floor(Number(admission.score || 0));
        const distance = Number(admission.behaviorDistance || -1);
        const codexDistance = Number(admission.codexDistance || -1);
        const policyEnergyRatio = Number(
          admission.policyEnergyRatio || 1,
        );
        const policyResonanceRatio = Number(
          admission.policyResonanceRatio || 1,
        );
        const fragmentCount = Array.isArray(admission.policyFragments)
          ? admission.policyFragments.length
          : 0;
        const codexBridge = `${
          String(admission.localCodexLabel || "unknown-lineage").slice(
            0,
            20,
          )
        }->${
          String(admission.peerCodexLabel || "unknown-lineage").slice(
            0,
            20,
          )
        }`;
        const reasons = Array.isArray(admission.reasons)
          ? admission.reasons
            .filter((entry) => typeof entry === "string")
            .slice(0, 2)
            .join(",")
          : "";
        const reasonText = reasons.length > 0 ? reasons : "n/a";
        const distanceText = distance >= 0
          ? ` | behaviorΔ=${distance.toFixed(3)}`
          : "";
        const codexText = codexDistance >= 0
          ? ` | codexΔ=${Math.floor(codexDistance)}`
          : "";
        return `federation admission: ${severity} ${action} | score=${score}${distanceText}${codexText} | policy=${
          policyEnergyRatio.toFixed(3)
        }/${
          policyResonanceRatio.toFixed(3)
        } | fragments=${fragmentCount} | codex=${codexBridge} | source=${source} | reasons=${reasonText}`;
      }

      function currentCodexLineageGuard() {
        const admission = currentDaemonAdmission();
        if (!admission) {
          return { score: 0, label: "none", reasons: [] };
        }
        const score = Math.max(
          0,
          Math.floor(Number(admission.codexLineageGuardScore || 0)),
        );
        const label = String(admission.codexLineageLabel || "none")
          .trim()
          .slice(0, 48) || "none";
        const reasons =
          Array.isArray(admission.codexLineageGuardReasons)
            ? admission.codexLineageGuardReasons
              .filter((entry) => typeof entry === "string")
              .map((entry) => String(entry).trim())
              .filter((entry) => entry.length > 0)
            : [];
        if (reasons.length > 0) {
          return { score, label, reasons: reasons.slice(0, 4) };
        }
        const fallbackReasons = String(admission.reason || "")
          .split("|")
          .map((entry) => entry.trim())
          .filter((entry) => entry.startsWith("CODEX_"))
          .slice(0, 4);
        return { score, label, reasons: fallbackReasons };
      }

      function buildCodexLineageGuardSummary() {
        const admission = currentDaemonAdmission();
        if (!admission) {
          return "lineage guard: no admission context yet";
        }
        const guard = currentCodexLineageGuard();
        if (guard.score <= 0 && guard.reasons.length === 0) {
          return `lineage guard: inactive | lineage=${guard.label}`;
        }
        const reasons = guard.reasons.length > 0
          ? guard.reasons.join(",")
          : "CODEX_SIGNAL";
        return `lineage guard: active score=${guard.score} | lineage=${guard.label} | reasons=${reasons}`;
      }

      function daemonAdmissionSeverity() {
        const admission = currentDaemonAdmission();
        if (!admission) return "BASELINE";
        const raw = String(admission.severity || "BASELINE")
          .toUpperCase();
        if (raw === "HIGH" || raw === "BLOCKED") return "HIGH";
        if (raw === "MID") return "MID";
        if (raw === "LOW") return "LOW";
        return "BASELINE";
      }

      function selectHumanHaloSeverity(driftSeverity) {
        const rank = {
          BASELINE: 0,
          LOW: 1,
          MID: 2,
          HIGH: 3,
        };
        const drift = String(driftSeverity || "BASELINE").toUpperCase();
        const admission = daemonAdmissionSeverity();
        const driftRank = rank[drift] ?? 0;
        const admissionRank = rank[admission] ?? 0;
        return admissionRank > driftRank ? admission : drift;
      }

      function buildDaemonAdmissionHistorySummary() {
        const history = currentDaemonAdmissionHistory();
        if (history.length === 0) {
          return "daemon history: no recent admissions";
        }
        const compact = history.map((entry) => {
          const severity = String(entry.severity || "UNK")
            .toUpperCase()
            .slice(0, 1);
          const requested = String(entry.requestedAction || "UNKNOWN")
            .toUpperCase()
            .replace(/_/g, "")
            .slice(0, 6);
          const applied = String(entry.appliedAction || "UNKNOWN")
            .toUpperCase()
            .replace(/_/g, "")
            .slice(0, 6);
          const status = String(entry.status || "accepted")
            .toLowerCase()
            .slice(0, 1);
          return `${severity}${status}:${requested}>${applied}`;
        });
        return `daemon history: ${compact.join(" | ")}`;
      }

      function buildTopDegradeReasonsSummary() {
        const history = currentDaemonAdmissionHistory();
        if (history.length === 0) return "none";
        const counts = new Map();
        for (const entry of history) {
          const reason = String(entry.reason || "").trim();
          if (reason.length === 0) continue;
          const degraded = Boolean(entry.degraded);
          const blocked = String(entry.status || "")
            .toLowerCase() === "rejected";
          if (!degraded && !blocked) continue;
          counts.set(reason, (counts.get(reason) || 0) + 1);
        }
        if (counts.size === 0) return "none";
        const top = Array.from(counts.entries())
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 3)
          .map(([reason, n]) => `${reason}×${n}`);
        return top.join(" | ");
      }

      function buildHumanExplanation() {
        const mood = String(codexNarrative?.mood || "STABLE")
          .toLowerCase();
        const moodPhrase = mood === "ascendant"
          ? "the lattice is expanding"
          : mood === "fragile"
          ? "the lattice is in a fragile recovery window"
          : "the lattice is holding a stable coherence arc";
        const tick = Number(telemetrySnapshot?.tick || 0);
        const avgEnergy = Number(telemetrySnapshot?.avgEnergy || 0);
        const dominantSpecies = inferDominantSpeciesLabel();
        const sharedCenter = inferSharedCenterLabel();
        const dominantInvariant = inferDominantInvariantVector();
        const narrativeTitle = String(
          codexNarrative?.title || "Codex arc",
        );
        const narrativeSummary = String(
          codexNarrative?.summary ||
            "Codex narrative is still forming.",
        );
        const relicStatus = String(
          codexNarrative?.relicStatus || "Relic status unavailable.",
        );
        const phaseVector = buildPhaseRingVector().replace(
          /^vector:\s*/i,
          "",
        );
        const phaseTrend = buildPhaseRingTrend().replace(
          /^trend:\s*/i,
          "",
        );
        const lineageGuard = currentCodexLineageGuard();
        const vox = Array.isArray(telemetrySnapshot?.voxPopuli) &&
            telemetrySnapshot.voxPopuli.length > 0
          ? String(telemetrySnapshot.voxPopuli[0]).slice(0, 90)
          : "";

        let text = `At tick ${tick}, ${moodPhrase}. ` +
          `Dominant lineage: ${dominantSpecies}. ` +
          `Shared center: ${sharedCenter}. ` +
          `Average energy is ${avgEnergy.toFixed(1)}. ` +
          `${narrativeTitle}: ${narrativeSummary}`;
        if (dominantInvariant.length > 0) {
          text += ` Dominant invariant vector: ${dominantInvariant}.`;
        }
        text += ` Pressure ring ${phaseVector}.`;
        text += ` Phase trend ${phaseTrend}.`;
        text += ` ${buildSpatialHashSummary()}.`;
        if (lineageGuard.score > 0 || lineageGuard.reasons.length > 0) {
          text +=
            ` Codex lineage guard=${lineageGuard.score} (${lineageGuard.label}).`;
        }
        text += ` ${buildDaemonAdmissionSummary()}.`;
        if (relicStatus && relicStatus.length > 0) {
          text += ` ${relicStatus}`;
        }
        if (vox.length > 0) {
          text += ` Vox signal: "${vox}".`;
        }
        return text.trim();
      }

      function updateHumanChannelStamp(extra = "") {
        const stamp = document.getElementById("human-channel-stamp");
        if (!stamp) return;
        const suffix = extra && extra.length > 0 ? ` | ${extra}` : "";
        stamp.textContent = `Updated: ${nowClock()}${suffix}`;
      }

      function pushDriftPoint() {
        const point = {
          ts: Date.now(),
          tick: Number(telemetrySnapshot?.tick || 0),
          avgEnergy: Number(telemetrySnapshot?.avgEnergy || 0),
          population: Number(codexSnapshot?.population?.current || 0),
          dominantGenome: dominantGenomeHex(),
          sharedCenter: inferSharedCenterLabel(),
          mood: String(codexNarrative?.mood || "STABLE").toUpperCase(),
        };
        driftHistory.push(point);
        const cutoff = Date.now() - DRIFT_HISTORY_RETENTION_MS;
        driftHistory = driftHistory.filter((entry) =>
          entry.ts >= cutoff
        );
      }

      function findDriftReference() {
        if (driftHistory.length < 2) return null;
        const latest = driftHistory[driftHistory.length - 1];
        const targetTs = latest.ts - DRIFT_LOOKBACK_MS;
        let reference = null;
        for (const entry of driftHistory) {
          if (entry.ts <= targetTs) reference = entry;
          else break;
        }
        if (!reference) reference = driftHistory[0];
        if (!reference || reference === latest) return null;
        return reference;
      }

      function analyzeDrift() {
        if (driftHistory.length < 2) {
          return {
            text:
              "Collecting drift baseline. Re-run after ~90 seconds for directionality.",
            severity: "BASELINE",
            breakdown:
              "score=0 | pop:baseline | energy:baseline | genome:stable | mood:stable | center:stable",
            riskSummary: "risk: baseline variance only",
          };
        }
        const latest = driftHistory[driftHistory.length - 1];
        const reference = findDriftReference();
        if (!reference) {
          return {
            text:
              "Drift reference unavailable. Continue observing to accumulate temporal contrast.",
            severity: "BASELINE",
            breakdown:
              "score=0 | pop:baseline | energy:baseline | genome:stable | mood:stable | center:stable",
            riskSummary: "risk: baseline variance only",
          };
        }

        const elapsedSec = Math.max(
          1,
          Math.round((latest.ts - reference.ts) / 1000),
        );
        const deltaTick = latest.tick - reference.tick;
        const dynamics = computeDriftDynamics(reference, latest);
        const deltaEnergy = dynamics.deltaEnergy;
        const deltaPopulation = dynamics.deltaPopulation;
        const dominantShifted = dynamics.dominantShifted;
        const moodShifted = dynamics.moodShifted;
        const centerShifted = dynamics.centerShifted;

        const populationPhrase = deltaPopulation > 12
          ? `population expanded by ${deltaPopulation}`
          : deltaPopulation < -12
          ? `population contracted by ${Math.abs(deltaPopulation)}`
          : "population remained near-steady";
        const energyPhrase = deltaEnergy > 1.25
          ? `average energy increased (+${deltaEnergy.toFixed(1)})`
          : deltaEnergy < -1.25
          ? `average energy decreased (${deltaEnergy.toFixed(1)})`
          : "average energy remained broadly stable";
        const dominantPhrase = dominantShifted
          ? `dominant genome rotated (${
            reference.dominantGenome.slice(0, 8)
          } → ${latest.dominantGenome.slice(0, 8)})`
          : "dominant genome remained stable";
        const moodPhrase = moodShifted
          ? `codex mood shifted (${reference.mood} → ${latest.mood})`
          : `codex mood held at ${latest.mood}`;
        const centerPhrase = centerShifted
          ? `shared center shifted (${reference.sharedCenter} → ${latest.sharedCenter})`
          : `shared center held at ${latest.sharedCenter}`;

        const score = dynamics.score;
        const severity = score >= 4
          ? "HIGH"
          : score >= 2
          ? "MID"
          : "LOW";

        const popImpact = dynamics.popImpact;
        const energyImpact = dynamics.energyImpact;
        const genomeImpact = dynamics.genomeImpact;
        const moodImpact = dynamics.moodImpact;
        const centerImpact = dynamics.centerImpact;
        const breakdown =
          `score=${score} | pop:${popImpact} | energy:${energyImpact} | genome:${genomeImpact} | mood:${moodImpact} | center:${centerImpact}`;
        const riskSummary = buildDriftRiskSummary(dynamics);

        return {
          text:
            `Over ~${elapsedSec}s (${deltaTick} ticks), ${populationPhrase}; ${energyPhrase}; ${dominantPhrase}; ${moodPhrase}; ${centerPhrase}.`,
          severity,
          breakdown,
          riskSummary,
        };
      }

      function computeDriftDynamics(reference, latest) {
        const deltaEnergy = latest.avgEnergy - reference.avgEnergy;
        const deltaPopulation = latest.population -
          reference.population;
        const dominantShifted = latest.dominantGenome.length > 0 &&
          reference.dominantGenome.length > 0 &&
          latest.dominantGenome !== reference.dominantGenome;
        const moodShifted = latest.mood !== reference.mood;
        const centerShifted =
          latest.sharedCenter !== reference.sharedCenter;
        const absPop = Math.abs(deltaPopulation);
        const absEnergy = Math.abs(deltaEnergy);
        const popImpact = absPop >= 40 ? 2 : absPop >= 15 ? 1 : 0;
        const energyImpact = absEnergy >= 3
          ? 2
          : absEnergy >= 1.25
          ? 1
          : 0;
        const genomeImpact = dominantShifted ? 1 : 0;
        const moodImpact = moodShifted ? 1 : 0;
        const centerImpact = centerShifted ? 1 : 0;
        const score = popImpact + energyImpact + genomeImpact +
          moodImpact + centerImpact;

        return {
          deltaEnergy,
          deltaPopulation,
          dominantShifted,
          moodShifted,
          centerShifted,
          popImpact,
          energyImpact,
          genomeImpact,
          moodImpact,
          centerImpact,
          score,
        };
      }

      function buildDriftSparkline() {
        if (driftHistory.length < 2) return "trend: collecting";
        const latest = driftHistory[driftHistory.length - 1];
        const windowStart = latest.ts - DRIFT_LOOKBACK_MS;
        let window = driftHistory.filter((entry) =>
          entry.ts >= windowStart
        );
        if (window.length < 2) window = driftHistory.slice(-2);
        if (window.length < 2) return "trend: collecting";

        const step = Math.max(
          1,
          Math.floor((window.length - 1) / DRIFT_SPARKLINE_POINTS),
        );
        const scores = [];
        for (let i = 1; i < window.length; i += step) {
          const previousIndex = Math.max(0, i - step);
          const dynamics = computeDriftDynamics(
            window[previousIndex],
            window[i],
          );
          scores.push(dynamics.score);
        }
        if (scores.length === 0) return "trend: collecting";

        const maxScore = 7;
        const glyphSpan = DRIFT_SPARKLINE_GLYPHS.length - 1;
        const bars = scores.map((rawScore) => {
          const bounded = Math.max(
            0,
            Math.min(maxScore, Number(rawScore) || 0),
          );
          const glyphIndex = Math.round(
            (bounded / maxScore) * glyphSpan,
          );
          return DRIFT_SPARKLINE_GLYPHS[glyphIndex];
        }).join("");

        const first = scores[0];
        const last = scores[scores.length - 1];
        const slope = last > first
          ? "rising"
          : last < first
          ? "cooling"
          : "steady";
        return `trend:${bars} (${slope})`;
      }

      function buildDriftRiskSummary(dynamics) {
        if (!dynamics || Number(dynamics.score || 0) <= 0) {
          return "risk: baseline variance only";
        }
        const tags = [];
        if (Number(dynamics.popImpact || 0) >= 2) {
          tags.push("population shock");
        } else if (Number(dynamics.popImpact || 0) === 1) {
          tags.push("population drift");
        }
        if (Number(dynamics.energyImpact || 0) >= 2) {
          tags.push("energy turbulence");
        } else if (Number(dynamics.energyImpact || 0) === 1) {
          tags.push("energy drift");
        }
        if (Number(dynamics.genomeImpact || 0) > 0) {
          tags.push("lineage rotation");
        }
        if (Number(dynamics.moodImpact || 0) > 0) {
          tags.push("narrative phase shift");
        }
        if (Number(dynamics.centerImpact || 0) > 0) {
          tags.push("center displacement");
        }
        if (tags.length === 0) return "risk: baseline variance only";
        return `risk: ${tags.join(" + ")}`;
      }

      function applyDriftSeverityBadge(severity) {
        const badge = document.getElementById("human-drift-severity");
        if (!badge) return;
        const normalized = String(severity || "BASELINE").toUpperCase();
        badge.textContent = normalized;
        badge.className = "drift-severity";
        if (normalized === "LOW") {
          badge.classList.add("drift-severity-low");
        } else if (normalized === "MID") {
          badge.classList.add("drift-severity-mid");
        } else if (normalized === "HIGH") {
          badge.classList.add("drift-severity-high");
        } else badge.classList.add("drift-severity-baseline");
      }

      function applyDriftHalo(severity) {
        const halo = document.getElementById("drift-halo");
        if (!halo) return;
        const normalized = String(severity || "BASELINE").toUpperCase();
        let baseOpacity = 0.42;
        if (normalized === "HIGH") {
          baseOpacity = 0.9;
          halo.style.opacity = "0.9";
          halo.style.background =
            "radial-gradient(circle at 50% 55%, rgba(255, 110, 110, 0.28), rgba(0, 0, 0, 0) 62%)";
          applySpatialHashHaloOverlay(baseOpacity);
          return;
        }
        if (normalized === "MID") {
          baseOpacity = 0.75;
          halo.style.opacity = "0.75";
          halo.style.background =
            "radial-gradient(circle at 50% 55%, rgba(255, 185, 90, 0.24), rgba(0, 0, 0, 0) 62%)";
          applySpatialHashHaloOverlay(baseOpacity);
          return;
        }
        if (normalized === "LOW") {
          baseOpacity = 0.58;
          halo.style.opacity = "0.58";
          halo.style.background =
            "radial-gradient(circle at 50% 55%, rgba(120, 255, 220, 0.2), rgba(0, 0, 0, 0) 62%)";
          applySpatialHashHaloOverlay(baseOpacity);
          return;
        }
        halo.style.opacity = "0.42";
        halo.style.background =
          "radial-gradient(circle at 50% 55%, rgba(159, 232, 255, 0.14), rgba(0, 0, 0, 0) 62%)";
        applySpatialHashHaloOverlay(baseOpacity);
      }

      function buildDriftExplanation() {
        return analyzeDrift().text;
      }

      function renderHumanDrift() {
        const node = document.getElementById("human-drift-explanation");
        if (!node) return;
        const breakdownNode = document.getElementById(
          "human-drift-breakdown",
        );
        const riskNode = document.getElementById("human-drift-risk");
        const sparklineNode = document.getElementById(
          "human-drift-sparkline",
        );
        const analysis = analyzeDrift();
        node.textContent = analysis.text;
        if (breakdownNode) {
          breakdownNode.textContent = analysis.breakdown;
        }
        if (riskNode) riskNode.textContent = analysis.riskSummary;
        if (sparklineNode) {
          sparklineNode.textContent = buildDriftSparkline();
        }
        applyDriftSeverityBadge(analysis.severity);
        applyDriftHalo(selectHumanHaloSeverity(analysis.severity));
      }

      function renderHumanExplanation() {
        const node = document.getElementById("human-explanation");
        if (!node) return;
        node.textContent = buildHumanExplanation();
      }

      function renderHumanAdmission() {
        const node = document.getElementById("human-daemon-admission");
        if (!node) return;
        node.textContent = buildDaemonAdmissionSummary();
        const federationNode = document.getElementById(
          "human-federation-admission",
        );
        if (federationNode) {
          federationNode.textContent =
            buildFederationAdmissionSummary();
        }
        const historyNode = document.getElementById(
          "human-daemon-history",
        );
        if (historyNode) {
          historyNode.textContent =
            buildDaemonAdmissionHistorySummary();
        }
        const lineageNode = document.getElementById(
          "human-codex-lineage-guard",
        );
        if (lineageNode) {
          lineageNode.textContent = buildCodexLineageGuardSummary();
        }
      }

      function renderHumanPhaseRing() {
        pushPhaseRingPoint();
        applyPhaseRingBadge();
        const summaryNode = document.getElementById(
          "human-phase-ring-summary",
        );
        if (summaryNode) {
          summaryNode.textContent = buildPhaseRingSummary();
        }
        const vectorNode = document.getElementById(
          "human-phase-ring-vector",
        );
        if (vectorNode) vectorNode.textContent = buildPhaseRingVector();
        const updateNode = document.getElementById(
          "human-phase-ring-update",
        );
        if (updateNode) {
          updateNode.textContent = buildPhaseRingUpdateSummary();
        }
        const trendNode = document.getElementById(
          "human-phase-ring-trend",
        );
        if (trendNode) trendNode.textContent = buildPhaseRingTrend();
      }

      function renderHumanSpatialHash() {
        const node = document.getElementById("human-spatial-hash");
        if (!node) return;
        node.textContent = buildSpatialHashSummary();
      }

      function renderHumanChannel(extraStamp = "") {
        renderHumanAdmission();
        renderHumanPhaseRing();
        renderHumanSpatialHash();
        renderHumanExplanation();
        renderHumanDrift();
        updateHumanChannelStamp(extraStamp);
      }

      const fetchJson = async (path) => {
        try {
          const res = await fetch(path);
          if (!res.ok) return null;
          return await res.json();
        } catch (_) {
          return null;
        }
      };

      async function refreshObserverDictionaries(force = false) {
        if (dictSyncInFlight && !force) return;
        dictSyncInFlight = true;
        try {
          const [
            thoughts,
            lineage,
            codex,
            narrative,
            telemetry,
            invariants,
          ] = await Promise.all([
            fetchJson("/thoughts"),
            fetchJson("/lineage"),
            fetchJson("/codex?limit=6"),
            fetchJson("/codex/narrative?limit=4"),
            fetchJson("/api/telemetry"),
            fetchJson("/codex/invariants?limit=6"),
          ]);

          if (thoughts && typeof thoughts === "object") {
            thoughtArchive = thoughts;
          }
          if (lineage && typeof lineage === "object") {
            lineageArchive = lineage;
          }
          if (codex && typeof codex === "object") codexSnapshot = codex;
          if (narrative && typeof narrative === "object") {
            codexNarrative = narrative;
          }
          if (Array.isArray(invariants)) {
            codexSnapshot = {
              ...codexSnapshot,
              invariants,
            };
          }
          if (telemetry && typeof telemetry === "object") {
            telemetrySnapshot = telemetry;
          }

          updateCodexPanel();
          pushDriftPoint();
          renderHumanChannel(
            `Drift ~${Math.round(DRIFT_LOOKBACK_MS / 1000)}s`,
          );
        } finally {
          dictSyncInFlight = false;
        }
      }

      const humanExplainBtn = document.getElementById(
        "human-explain-btn",
      );
      if (humanExplainBtn) {
        humanExplainBtn.addEventListener("click", () => {
          void refreshObserverDictionaries(true);
        });
      }
      const humanDriftBtn = document.getElementById("human-drift-btn");
      if (humanDriftBtn) {
        humanDriftBtn.addEventListener("click", () => {
          void refreshObserverDictionaries(true);
        });
      }

      let lastSync = 0, lastDictSync = 0;
      function animate(t) {
        requestAnimationFrame(animate);
        controls.update();
        if (
          avatarDirty && !avatarDisabled &&
          t - lastAvatarSync > AVATAR_SYNC_MS
        ) {
          avatarDirty = false;
          lastAvatarSync = t;
          syncAvatarPresence();
        }
        if (t - lastSync > 250) {
          sync("ALPHA", geo, pos, col, siz);
          syncGrid();
          syncBuffer("/immunity", immunityFlags);
          syncBuffer("/signals", signalFlags);
          syncBuffer("/stiffness", stiffnessFlags);
          syncBuffer("/bonds", bondIndices);
          syncBuffer("/architecture", architectureFlags);
          syncBuffer("/memory", memoryFlags);
          syncBuffer("/roles", roleFlags);
          updateLeaderboard();
          updateArchitecture();
          lastSync = t;
        }
        if (t - lastDictSync > 5000) {
          void refreshObserverDictionaries(false);
          lastDictSync = t;
        }
        broadcastRtcTelemetry(t);
        composer.render();
      }

      window.saveGenesis = () =>
        fetch("/snapshot/export", { method: "POST" });
      connectRtcSignaling();
      updatePeerMeshHud();
      void refreshObserverDictionaries(true);
      animate(0);
    </script>
  </body>
</html>

```

---

## FILE: WASM_MIGRATION_RFC.md

```markdown
# OMEGA-64: WebAssembly (Wasm) Migration RFC 🦀🕸️🌀

## 1. Executive Summary

Currently, OMEGA-64's `LAMBDA_VM.ts` executes in the V8 JS engine using
TypeScript. While Deno is fast, executing complex 16-register bytecode for

> 50,000 atoms per pulse (`PULSE_WORKER.ts`) creates a significant CPU
> bottleneck.

This RFC proposes migrating the core `LAMBDA_VM` and potentially physics
calculations to a **WebAssembly (Wasm) module written in Rust**. This will
provide near-native execution speeds (estimated 10x-50x improvement), zero-cost
abstractions for byte manipulation, and explicit memory control, allowing the
Matrix to scale beyond 100,000 atoms without dropping the pulse rate.

## 2. Shared Memory Architecture (Zero-Copy)

To avoid the overhead of copying data between JS and Wasm, we will utilize
`WebAssembly.Memory` backed by `SharedArrayBuffer` (which we already use heavily
in `STATE_MATRIX.ts`).

### The Layout

The existing SoA (Structure of Arrays) layout in `STATE_MATRIX.buffer` aligns
perfectly with Wasm linear memory.

- Deno will allocate the `SharedArrayBuffer` (e.g., 50MB).
- Deno will pass this buffer to the Wasm module during instantiation:
  ```javascript
  const wasmMemory = new WebAssembly.Memory({
    initial: 1000,
    maximum: 2000,
    shared: true,
  });
  // Map our STATE_MATRIX over the wasmMemory.buffer
  ```
- Rust will access pointers to the various arrays (energies, resonances, codes)
  directly using raw pointers or `js-sys` TypedArrays.

## 3. The Rust implementation (`lambda_vm.rs`)

### Data Structures

```rust
#[repr(C)]
pub struct VmState {
    pub x: i16,
    pub y: i16,
    pub energy: f32, // Or fixed-point i32 mapped from Deno
    pub resonance: f32,
    pub semantic_bonuses: u8,
    // ... other contextual data
}

#[repr(C)]
pub struct VmResult {
    pub energy_delta: f32,
    pub resonance_delta: f32,
    pub message_out: u8,
    pub intent_count: u8,
    // Intents stored in a fixed array to avoid heap allocation across FFI
    pub intents: [Intent; 4], 
}
```

### Execution Loop

The `execute` function will be exported to JS:

```rust
#[no_mangle]
pub extern "C" fn execute_atom(
    atom_index: usize,
    pc: u32,
    state_ptr: *mut VmState,
    result_ptr: *mut VmResult
) {
    // 1. Read atom's memory and registers directly from shared buffer
    // 2. Decode instruction
    // 3. Match opcode & apply semantic bonuses
    // 4. Write back to result_ptr
}
```

## 4. Migration Strategy (Phased Approach)

### Phase 1: Wasm Worker (Opt-in)

- Write the Rust VM handling only basic opcodes (`MOVE`, `ADD`, `LOAD`,
  `STORE`).
- Compile to Wasm using `wasm-pack`.
- Update `PULSE_WORKER.ts` to instantiate the Wasm module.
- Add a fallback mechanism: If an atom encounters an advanced/unsupported opcode
  (like `ENCODE` or `DECODE`), it bails out of Wasm and `PULSE_WORKER.ts`
  finishes the execution using the legacy TypeScript `LAMBDA_VM`.

### Phase 2: Complete ISA Port

- Port all architectural stigmergy, semantic processing, and memetic replication
  to Rust.
- Wasm handles 100% of atom execution.

### Phase 3: Spatial Hash & Physics Port

- Move `PHYSICS_ENGINE` collision detection and nutrient diffusion into Wasm,
  heavily utilizing SIMD instructions (if enabled) for grid convolutions.

## 5. Security & Isolation

By compiling the logic to Wasm, we enforce a strict sandbox. Atoms will
literally be incapable of executing arbitrary system calls (no filesystem
access, no network access), cementing the core axiom of the Matrix: "The VM is
the Universe."

## 6. Expected Outcomes

- **Throughput**: Execution of a 16-instruction block drops from ~100ns to ~2ns.
- **Capacity**: Maximum atom count increases from 50k to 500k+.
- **Predictability**: Wasm provides strictly deterministic floating-point and
  integer math, removing any V8 engine JIT unpredictability across different OS
  architectures.

```

---

## FILE: WASM_THREADSAFE_ROADMAP.md

```markdown
# WASM Thread-Safe Roadmap (Deno + AssemblyScript)

## Why this roadmap exists

- Multiple WASM instances currently share one `SharedArrayBuffer`.
- Earlier, this produced sporadic lattice corruption (spontaneous nonzero IDs in
  empty matrix).
- Recent fixes (hot-path no-allocation rewrite + coherence guards) restored
  stable 4-worker operation.
- We keep this roadmap to prevent regressions and harden concurrency further.

Current guardrail:

- Default runtime is 4 workers (`OMEGA_PULSE_WORKERS` optional override).
- Coherence baseline test is mandatory in verify flow.

## Phase 1: Deterministic Baseline (completed)

- Enforce memory-layout coherence before build (`wasm_layout_guard.ts`).
- Add empty-matrix coherence test (`test_wasm_worker_coherence.ts`).
- Remove hot-path heap allocations in `assembly/index.ts` (array literals).

Acceptance:

- `deno task vector10:verify` stays green.
- `test_wasm_worker_coherence.ts` stays green with `OMEGA_PULSE_WORKERS=4`.

## Phase 2: Parallel hardening (next)

- Completed: extend coherence test to long run (`>=1000` ticks) via
  `deno task test:worker-coherence:long`.
- Completed: add stress seeds with mixed VM opcodes, spawn pressure, and
  structure writes via `test_spawn_determinism.ts`
  (`deno task test:spawn-determinism`).
- Completed: worker-level fault counters + safe timeout retry-windows (no
  duplicate posts) in `PULSE.ts`, validated by `test_worker_timeout_retry.ts`.
- Completed: parallel timeout-retry hardening gate
  (`test_worker_timeout_retry_multi.ts`) for `OMEGA_PULSE_WORKERS=4` with
  per-worker recovery assertions.
- Completed: chaos jitter gate (`test_worker_jitter_resilience.ts`) with
  per-worker randomized response delays and zero-drift assertions on empty
  matrix.
- Completed: spawn-pressure chaos gate (`test_spawn_jitter_resilience.ts`)
  combining jittered worker responses with active replication load and
  world-bound invariants.
- Completed: unified machine-readable resilience audit
  (`test_worker_resilience_audit.ts`) consolidating fault/jitter/spawn metrics
  and drift profile into `WORKER_RESILIENCE_AUDIT.json`.

Acceptance:

- `OMEGA_PULSE_WORKERS=4 deno run -A test_wasm_worker_coherence.ts` is green for
  at least 1000 ticks.
- `deno task test:spawn-determinism` remains green (strict 1-worker vs 4-worker
  hash parity under spawn pressure).
- `deno task test:worker-timeout-retry`,
  `deno task test:worker-timeout-retry:multi`,
  `deno task test:worker-jitter-resilience`, and
  `deno task test:spawn-jitter-resilience` remain green (retry counters
  increment, zero failed requests, zero drift/invariant breach under empty and
  spawn-pressure modes).
- `deno task test:worker-resilience-audit` remains green and emits
  machine-readable artifacts (`WORKER_RESILIENCE_AUDIT.json` +
  `WORKER_DRIFT_AUDIT.json`).

## Phase 3: Safety gates

- Completed: startup self-test at worker init:
  - run dry ticks on empty matrix;
  - if nonzero atoms appear, auto-fallback to `1` worker for current process.
- Validation gates:
  - `deno task test:startup-selftest-fallback` (breach -> fallback);
  - `deno task test:startup-selftest-nominal` (clean start, no fallback,
    stop/init lifecycle reset).
- Completed CI matrix gate:
  - GitHub Actions workflow at `.github/workflows/coherence-worker-matrix.yml`;
  - `OMEGA_PULSE_WORKERS=4` required;
  - `OMEGA_PULSE_WORKERS=1` fallback gate.
- Completed nightly soak sentinel:
  - GitHub Actions workflow at `.github/workflows/coherence-nightly-soak.yml`;
  - executes long 4-worker coherence burn-in + resilience budget gate +
    audit/budget artifact upload.
- Completed regression alignment:
  - include `test_tensegrity.ts` in `vector10:verify`
    (`deno task test:tensegrity`).
- Completed toolchain coherence guard:
  - `test_runtime_monoculture.ts` blocks `node/npm/npx/yarn/pnpm/ts-node`
    invocations in `deno.jsonc` tasks and workflow `run:` commands;
  - wired into `verify:coherence` preflight as
    `deno task test:runtime-monoculture`.
- Completed resilience budget gate:
  - `test_worker_resilience_budget.ts` enforces retry/drift/duration ceilings
    over unified audit output;
  - wired into matrix/nightly artifacts via
    `deno task test:worker-resilience-budget`.
- Completed resilience trend regression gate:
  - `test_worker_resilience_trend.ts` compares current audit/budget metrics to
    `WORKER_RESILIENCE_TREND_BASELINE.json` with ratio+delta thresholds;
  - wired into matrix/nightly soak via `deno task test:worker-resilience-trend`.
- Completed soak stability slope gate:
  - `test_worker_soak_stability.ts` runs extended spawn+jitter soak and enforces
    slope/cap thresholds for RSS, heap, backlog, retry-rate, and windowed tick
    latency;
  - wired into matrix/nightly soak artifact stage via
    `deno task test:worker-soak-stability`.
- Completed soak trend regression gate:
  - `test_worker_soak_trend.ts` compares soak stability summary/slopes to
    `WORKER_SOAK_STABILITY_BASELINE.json` with ratio+delta thresholds;
  - wired into matrix/nightly soak artifact stage via
    `deno task test:worker-soak-trend`.

Acceptance:

- No spontaneous atoms in either mode.
- No regression in `test_resonance_protocol.ts`, `test_swarm.ts`,
  `test_tensegrity.ts` (enforced by verify chain).
- Long-run 4-worker soak remains green (`test:worker-coherence:long` +
  `test:worker-resilience-trend` + `test:worker-soak-trend`).
- Verify chain preserves Deno-only execution surface
  (`deno task test:runtime-monoculture` stays green).
- Resilience budgets remain green (`deno task test:worker-resilience-budget`)
  with zero failures and zero non-strict drift.
- Resilience trend regression gate remains green
  (`deno task test:worker-resilience-trend`) against canonical baseline.
- Soak stability gate remains green (`deno task test:worker-soak-stability`)
  with bounded slope/cap metrics.
- Soak trend regression gate remains green (`deno task test:worker-soak-trend`)
  against canonical baseline.

```

---

