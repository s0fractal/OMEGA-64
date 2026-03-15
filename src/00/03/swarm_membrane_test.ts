import { assertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { CONTEXT_OFFSET, EGRESS_DATA_OFFSET, EGRESS_HEAD_OFFSET, ENERGY_OFFSET, IDS_OFFSET, INSTRUCTIONS_OFFSET, MAX_ATOMS, PHASE_OFFSET, RESONANCE_OFFSET, ROLES_OFFSET, WASM_MEMORY_PAGES, XS_OFFSET, YS_OFFSET } from "@generated";

const WASM_URL = new URL(
  "../../00/00/sigma_core/target/wasm32-unknown-unknown/release/sigma_core.wasm",
  import.meta.url,
);

async function createMatrix() {
  const memory = new WebAssembly.Memory({
    initial: WASM_MEMORY_PAGES,
    maximum: WASM_MEMORY_PAGES,
    shared: true,
  });

  const imports = {
    env: {
      memory,
      abort: () => {},
      trace_atom: () => {},
    },
  };

  const wasmBytes = await Deno.readFile(WASM_URL);
  const instantiated = await WebAssembly.instantiate(wasmBytes, imports);

  return { memory, exports: instantiated.instance.exports as any };
}

function injectForeignAtom(memory: WebAssembly.Memory, payload: Uint8Array) {
  const view = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength,
  );
  const genome = payload.slice(0, 64);
  const energy = view.getInt32(64, true);
  const phase = view.getInt32(68, true);
  const resonance = view.getInt32(72, true);
  let nx = view.getInt32(76, true);
  let ny = view.getInt32(80, true);

  // Teleport
  if (nx <= 0) nx = 1399;
  else if (nx >= 1399) nx = 0;
  if (ny <= 0) ny = 799;
  else if (ny >= 799) ny = 0;

  const role = payload[148];

  // Find empty slot natively
  const ids = new BigInt64Array(
    memory.buffer,
    IDS_OFFSET,
    MAX_ATOMS,
  );
  let atomIdx = Number(ids[1] === 0n ? 1n : 0n);
  if (atomIdx === 0) {
    for (let i = 1; i < MAX_ATOMS; i++) {
      if (ids[i] === 0n) {
        atomIdx = i;
        break;
      }
    }
  }

  if (atomIdx > 0) {
    const energies = new Int32Array(
      memory.buffer,
      ENERGY_OFFSET,
      MAX_ATOMS,
    );
    const resonances = new Int32Array(
      memory.buffer,
      RESONANCE_OFFSET,
      MAX_ATOMS,
    );
    const phases = new Int32Array(
      memory.buffer,
      PHASE_OFFSET,
      MAX_ATOMS,
    );
    const roles = new Uint8Array(
      memory.buffer,
      ROLES_OFFSET,
      MAX_ATOMS,
    );
    const xs = new Int16Array(
      memory.buffer,
      XS_OFFSET,
      MAX_ATOMS,
    );
    const ys = new Int16Array(
      memory.buffer,
      YS_OFFSET,
      MAX_ATOMS,
    );

    energies[atomIdx] = energy;
    resonances[atomIdx] = resonance;
    phases[atomIdx] = phase;
    ids[atomIdx] = BigInt(Date.now()) << 16n | BigInt(atomIdx);
    roles[atomIdx] = role;
    xs[atomIdx] = nx;
    ys[atomIdx] = ny;

    const logic = new Uint8Array(
      memory.buffer,
      INSTRUCTIONS_OFFSET + atomIdx * 64,
      64,
    );
    logic.set(genome);

    // Context maps natively from 84..148 block representing 16 x i32 slots.
    const context = new Int32Array(
      memory.buffer,
      CONTEXT_OFFSET + atomIdx * 16 * 4,
      16,
    );
    for (let c = 0; c < 16; c++) {
      context[c] = view.getInt32(84 + (c * 4), true);
    }
  }
}

Deno.test({
  name: "Swarm Membrane: Egress from Matrix A to Ingress Matrix B",
  ignore: true, // Missing WASM binary
  async fn() {
  const matrixA = await createMatrix();
  const matrixB = await createMatrix();

  // 1. Manually spawn an atom in Matrix A at x = 1399 (Right Edge)
  const idsA = new BigInt64Array(
    matrixA.memory.buffer,
    IDS_OFFSET,
    MAX_ATOMS,
  );
  const xsA = new Int16Array(
    matrixA.memory.buffer,
    XS_OFFSET,
    MAX_ATOMS,
  );
  const ysA = new Int16Array(
    matrixA.memory.buffer,
    YS_OFFSET,
    MAX_ATOMS,
  );
  const energiesA = new Int32Array(
    matrixA.memory.buffer,
    ENERGY_OFFSET,
    MAX_ATOMS,
  );
  const logicA = new Uint8Array(
    matrixA.memory.buffer,
    INSTRUCTIONS_OFFSET,
    MAX_ATOMS * 64,
  );

  const atomIdxA = 1;
  idsA[atomIdxA] = 12345678n;
  xsA[atomIdxA] = 1398; // Close to Edge
  ysA[atomIdxA] = 400;
  energiesA[atomIdxA] = 5000;

  // Create a dummy target at the absolute edge (1399) to pull the atom outwards
  const targetIdx = 2;
  idsA[targetIdx] = 87654321n;
  xsA[targetIdx] = 1399;
  ysA[targetIdx] = 400;

  // OP_SET (0x01), R0 (0x00), SYS_ATTRACT (0x11 = 17)
  logicA[atomIdxA * 64 + 0] = 0x01; // OP_SET
  logicA[atomIdxA * 64 + 1] = 0x00; // R0
  logicA[atomIdxA * 64 + 2] = 0x11; // SYS_ATTRACT (17)

  // OP_SET (0x01), R1 (0x01), targetIdx=2
  logicA[atomIdxA * 64 + 3] = 0x01; // OP_SET
  logicA[atomIdxA * 64 + 4] = 0x01; // R1
  logicA[atomIdxA * 64 + 5] = 0x02; // Target 2

  // OP_SET (0x01), R2 (0x02), intensity=1
  logicA[atomIdxA * 64 + 6] = 0x01; // OP_SET
  logicA[atomIdxA * 64 + 7] = 0x02; // R2
  logicA[atomIdxA * 64 + 8] = 0x01; // Positive intensity

  // OP_SYSCALL (0x60)
  logicA[atomIdxA * 64 + 9] = 0x60; // OP_SYSCALL

  // Call execute_atom(1)
  matrixA.exports.execute_atom(atomIdxA);

  const contextA = new Int32Array(
    matrixA.memory.buffer,
    CONTEXT_OFFSET,
    MAX_ATOMS * 16,
  );
  console.log("Post Execute - PC:", contextA[atomIdxA * 16 + 8]);
  console.log("Post Execute - R0 (sys_id):", contextA[atomIdxA * 16 + 0]);
  console.log("Post Execute - R1 (dx):", contextA[atomIdxA * 16 + 1]);
  console.log("Post Execute - R2 (dy):", contextA[atomIdxA * 16 + 2]);
  console.log("Post Execute - Energy:", energiesA[atomIdxA]);

  // 2. Assert Atom vanished from A (Recycled)
  assertEquals(energiesA[atomIdxA], 0, "Atom should be recycled on Egress");

  // 3. Extract EgressEvent
  const headView = new Int32Array(
    matrixA.memory.buffer,
    EGRESS_HEAD_OFFSET,
    1,
  );
  const writeHead = Atomics.load(headView, 0);
  assertEquals(writeHead, 1, "Egress head should be incremented to 1");

  const dataView = new Uint8Array(
    matrixA.memory.buffer,
    EGRESS_DATA_OFFSET,
    256,
  );
  const payload = dataView.slice(0, 256);

  // 4. Inject into Matrix B
  injectForeignAtom(matrixB.memory, payload);

  // 5. Assert Atom surfaced in Matrix B at x = 0 (Left Edge)
  const idsB = new BigInt64Array(
    matrixB.memory.buffer,
    IDS_OFFSET,
    MAX_ATOMS,
  );
  const xsB = new Int16Array(
    matrixB.memory.buffer,
    XS_OFFSET,
    MAX_ATOMS,
  );
  const energiesB = new Int32Array(
    matrixB.memory.buffer,
    ENERGY_OFFSET,
    MAX_ATOMS,
  );
  const logicB = new Uint8Array(
    matrixB.memory.buffer,
    INSTRUCTIONS_OFFSET,
    MAX_ATOMS * 64,
  );

  // The first empty slot should be 1
  const atomIdxB = 1;
  assertEquals(idsB[atomIdxB] > 0n, true, "Atom should exist in Matrix B");
  assertEquals(
    energiesB[atomIdxB],
    5000,
    "Energy should match identically in Matrix B",
  );
  assertEquals(
    xsB[atomIdxB],
    0,
    "X Coordinate mapped to Matrix B West Boundary limit",
  );
  assertEquals(logicB[atomIdxB * 64 + 0], 0x01, "Genome identical match");
  assertEquals(logicB[atomIdxB * 64 + 4], 0x01, "Genome identical match piece");
}
});
