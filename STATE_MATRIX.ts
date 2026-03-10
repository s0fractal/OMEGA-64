// OMEGA-64 | STATE_MATRIX.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";

export const MAX_ATOMS = OFFSETS.MAX_ATOMS;
export const SCALE = OFFSETS.SCALE;

if (OFFSETS.WASM_MEMORY_PAGES < OFFSETS.MIN_WASM_MEMORY_PAGES) {
  throw new Error(
    `[STATE_MATRIX] WASM memory too small: pages=${OFFSETS.WASM_MEMORY_PAGES}, required=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
  );
}
const layoutValidation = OFFSETS.validateMemoryLayout(
  OFFSETS.WASM_MEMORY_BYTES,
);
if (!layoutValidation.ok) {
  throw new Error(
    `[STATE_MATRIX] Invalid OFFSETS memory layout:\n${
      layoutValidation.errors.map((entry) => `- ${entry}`).join("\n")
    }`,
  );
}

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({
  initial: OFFSETS.MIN_WASM_MEMORY_PAGES,
  maximum: OFFSETS.WASM_MEMORY_PAGES,
  shared: true,
});
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// Expose underlying buffers for UI export
export const idBuffer =
  new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS).buffer;
export const xBuffer =
  new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS).buffer;
export const yBuffer =
  new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS).buffer;
export const energyBuffer =
  new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS).buffer;
export const resonanceBuffer =
  new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS).buffer;
export const phaseBuffer =
  new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS).buffer;
export const logicBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8).buffer;
export const bondBuffer =
  new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4).buffer;
export const stiffnessBuffer =
  new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4)
    .buffer;
export const bondDistBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.BOND_DISTANCES_OFFSET, MAX_ATOMS * 4)
    .buffer;
export const synapticWeightBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4)
    .buffer;
export const dampingBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.DAMPING_OFFSET, MAX_ATOMS).buffer;
export const causalityBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.CAUSALITY_OFFSET, MAX_ATOMS).buffer;
export const roleBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS).buffer;
export const hiveMemoryBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.HIVE_MEMORY_OFFSET, 1024).buffer;
export const hiveBalanceBuffer =
  new Int32Array(sharedBuffer, OFFSETS.HIVE_BALANCE_OFFSET, 1).buffer;
export const hiveEnergyPoolBuffer =
  new Int32Array(sharedBuffer, OFFSETS.HIVE_ENERGY_POOL_OFFSET, 256).buffer;
export const memoryGridBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, 140 * 80 * 8).buffer;
export const signalGridBuffer =
  new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80).buffer;
export const structureGridBuffer =
  new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80).buffer;
export const attentionFieldBuffer =
  new Float32Array(sharedBuffer, OFFSETS.ATTENTION_FIELD_OFFSET, 140 * 80)
    .buffer;
export const glyphHeaderBuffer =
  new Int32Array(sharedBuffer, OFFSETS.GLYPH_HEADER_OFFSET, 140 * 80).buffer;
export const glyphPayloadBuffer =
  new Uint8Array(sharedBuffer, OFFSETS.GLYPH_PAYLOAD_OFFSET, 140 * 80 * 8)
    .buffer;
export const coherenceBuffer =
  new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1).buffer;
export const neuralCoherenceBuffer =
  new Int32Array(sharedBuffer, OFFSETS.NEURAL_COHERENCE_OFFSET, 1).buffer;
export const hormoneBuffer =
  new Uint16Array(sharedBuffer, OFFSETS.HORMONE_OFFSET, 8).buffer;
export const lineageBuffer =
  new BigUint64Array(sharedBuffer, OFFSETS.LINEAGE_OFFSET, MAX_ATOMS).buffer;
export const mailboxBuffer =
  new Int32Array(sharedBuffer, OFFSETS.MAILBOX_OFFSET, MAX_ATOMS * 2).buffer;

// TypedArray Views (Host side)
const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
const energies = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
const resonances = new Int32Array(
  sharedBuffer,
  OFFSETS.RESONANCE_OFFSET,
  MAX_ATOMS,
);
const phases = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS);
const roles = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS);
const synapticWeights = new Uint8Array(
  sharedBuffer,
  OFFSETS.SYNAPTIC_WEIGHTS_OFFSET,
  MAX_ATOMS * 4,
);
const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);
const bonds = new Uint32Array(
  sharedBuffer,
  OFFSETS.BONDS_OFFSET,
  MAX_ATOMS * 4,
);
const bondStiffness = new Float32Array(
  sharedBuffer,
  OFFSETS.STIFFNESS_OFFSET,
  MAX_ATOMS * 4,
);
const bondDistances = new Uint8Array(
  sharedBuffer,
  OFFSETS.BOND_DISTANCES_OFFSET,
  MAX_ATOMS * 4,
);
const bondRequests = new Int32Array(
  sharedBuffer,
  OFFSETS.BOND_REQUESTS_OFFSET,
  MAX_ATOMS * 3,
);
const damping = new Uint8Array(sharedBuffer, OFFSETS.DAMPING_OFFSET, MAX_ATOMS);
const causality = new Uint8Array(
  sharedBuffer,
  OFFSETS.CAUSALITY_OFFSET,
  MAX_ATOMS,
);
const hiveMemory = new Uint8Array(
  sharedBuffer,
  OFFSETS.HIVE_MEMORY_OFFSET,
  1024,
);
const hiveBalance = new Int32Array(
  sharedBuffer,
  OFFSETS.HIVE_BALANCE_OFFSET,
  1,
);
const hiveEnergyPool = new Int32Array(
  sharedBuffer,
  OFFSETS.HIVE_ENERGY_POOL_OFFSET,
  256,
);
const spatialGrid = new Int32Array(
  sharedBuffer,
  OFFSETS.SPATIAL_GRID_OFFSET,
  140 * 80 * 32,
);
const structureGrid = new Int32Array(
  sharedBuffer,
  OFFSETS.STRUCTURE_GRID_OFFSET,
  140 * 80,
);
const signalGrid = new Int32Array(
  sharedBuffer,
  OFFSETS.SIGNAL_GRID_OFFSET,
  140 * 80,
);
const memoryGrid = new Uint8Array(
  sharedBuffer,
  OFFSETS.MEMORY_GRID_OFFSET,
  140 * 80 * 8,
);
const attentionField = new Float32Array(
  sharedBuffer,
  OFFSETS.ATTENTION_FIELD_OFFSET,
  140 * 80,
);
const glyphHeaders = new Int32Array(
  sharedBuffer,
  OFFSETS.GLYPH_HEADER_OFFSET,
  140 * 80,
);
const glyphPayload = new Uint8Array(
  sharedBuffer,
  OFFSETS.GLYPH_PAYLOAD_OFFSET,
  140 * 80 * 8,
);
const ledgerHeadView = new Int32Array(
  sharedBuffer,
  OFFSETS.LEDGER_HEAD_OFFSET,
  1,
);
const ledgerDataView = new Int32Array(
  sharedBuffer,
  OFFSETS.LEDGER_DATA_OFFSET,
  OFFSETS.MAX_LEDGER_EVENTS * 4,
);
const coherence = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);
const neuralCoherence = new Int32Array(
  sharedBuffer,
  OFFSETS.NEURAL_COHERENCE_OFFSET,
  1,
);
const hormones = new Uint16Array(sharedBuffer, OFFSETS.HORMONE_OFFSET, 8);
const lineage = new BigUint64Array(
  sharedBuffer,
  OFFSETS.LINEAGE_OFFSET,
  MAX_ATOMS,
);
const mailboxes = new Int32Array(
  sharedBuffer,
  OFFSETS.MAILBOX_OFFSET,
  MAX_ATOMS * 2,
);

const instructions = new Uint8Array(
  sharedBuffer,
  OFFSETS.INSTRUCTIONS_OFFSET,
  MAX_ATOMS * 64,
);
const codeWords = new Uint32Array(
  sharedBuffer,
  OFFSETS.INSTRUCTIONS_OFFSET,
  MAX_ATOMS * 16,
);
const contexts = new Int32Array(
  sharedBuffer,
  OFFSETS.CONTEXT_OFFSET,
  MAX_ATOMS * 16,
); // 16 * 4 = 64 bytes
const contextByteView = new Uint8Array(
  sharedBuffer,
  OFFSETS.CONTEXT_OFFSET,
  MAX_ATOMS * 64,
);
const semanticBonuses = new Int32Array(
  new SharedArrayBuffer(MAX_ATOMS * Int32Array.BYTES_PER_ELEMENT),
);
const semanticBonusesBuffer = semanticBonuses.buffer;
const RESOURCE_MAX_RAW = 2_000_000_000;

const clampResourceRaw = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= RESOURCE_MAX_RAW) return RESOURCE_MAX_RAW;
  return Math.trunc(value);
};

const toClampedEnergyRaw = (value: number): number =>
  clampResourceRaw(Math.round(value * SCALE));
const latticeClearView = new Uint8Array(
  sharedBuffer,
  OFFSETS.TICK_COUNTER_OFFSET,
);

// Coordination Views (Atomic)
const syncState = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
const tickCounter = new Int32Array(
  sharedBuffer,
  OFFSETS.TICK_COUNTER_OFFSET,
  1,
);

export const SYNC = {
  IDLE: 0,
  WASM_TICKING: 1,
  HOST_LOCK: 2,
};

// Legacy biological opcodes removed in Stage 27 (Universal Syscall Interface)

export const RISC = {
  OP_NOP: 0x00,
  OP_SET: 0x01,
  OP_GET: 0x02,
  OP_PUT: 0x03,
  OP_ADD: 0x04,
  OP_SUB: 0x05,
  OP_JZ: 0x10,
  OP_JNZ: 0x11,
  OP_JMP: 0x12,

  // Legacy biological opcodes (for tests and bridge reductions)
  OP_REPLICATE: 0x80,
  OP_SIGNAL: 0x81,
  OP_BIND: 0x82,
  OP_SHARE: 0x83,
  OP_PLUG: 0x84,
  OP_TENSEGRITY: 0x85,
  OP_ENTANGLE: 0x86,
  OP_BUILD: 0xA4,
  OP_SENSE: 0xA5,
  OP_COLLECTIVE: 0xA6,
  OP_ROLE: 0xA7,
  OP_SPORE_DRIVE: 0xA8,
  OP_WISDOM: 0xA9,
  OP_RESOLVE: 0xB0,
  OP_RESONATE_KURAMOTO: 0xB1,

  // Universal Syscall Interface
  OP_SYSCALL: 0x60, // The only way an atom should interact with the world

  // Data properties

  PROP_ENERGY: 0,
  PROP_RESONANCE: 1,
  PROP_X: 2,
  PROP_Y: 3,
  PROP_PHASE: 4,
  PROP_GRID_CHARGE: 7,
  PROP_QUORUM: 8,
  PROP_NEURAL_COHERENCE: 9,
  PROP_MEMORY: 10,
};

// Universal Syscall Interface (ABI)
export const SYS = {
  YIELD: 0x01,
  READ_MEM: 0x02,
  WRITE_MEM: 0x03,
  SPAWN: 0x04,
  BIND: 0x05,
  SET_ROLE: 0x06,
  MUTATE: 0x07,
  MSG: 0x08,
  READ_INBOX: 0x09,
  TRANSFER: 0x0A,
  REPLICATE: 0x0B,
  EMIT: 0x0C,
  SCAN: 0x0D,
  MOVE: 0x0E,
  EAT: 0x0F,
  BET: 0x10,
};
const DEFAULT_BOOT_SCRIPT = (() => {
  const boot = new Uint8Array(64);
  // Default biological script: GET Energy into R0, then Yield
  boot[0] = RISC.OP_GET;
  boot[1] = 0;
  boot[2] = RISC.PROP_ENERGY;
  boot[3] = RISC.OP_SET;
  boot[4] = 1;
  boot[5] = SYS.YIELD;
  boot[6] = RISC.OP_SYSCALL; // Expects R0=syscall (we used R1 here... wait, SYS expects R0)

  // Let's rewrite it properly for the ABI:
  // R0 = SYS.YIELD
  // SYSCALL
  boot[0] = RISC.OP_SET;
  boot[1] = 0;
  boot[2] = SYS.YIELD;
  boot[3] = RISC.OP_SYSCALL;
  return boot;
})();

const GUARDIAN_COHERENCE_THRESHOLD = 200;

export const STRUCTURE = {
  VOID: 0,
  WIRE: 1, // Passive conductor
  NODE: 2, // Logical aggregator
  DIODE: 3, // One-way (Phase bit defines direction)
  SOURCE: 4, // Constant charge
  SINK: 5, // Energy drain
  CAPACITOR: 6, // Slow decay
  INVERTER: 7, // NOT gate
  LATCH: 8, // SR-Latch
};

export const STATE_MATRIX = {
  MAX_ATOMS,
  buffer: sharedBuffer,
  wasmMemory,
  SCALE,
  syncState,
  tickCounter,
  SYNC,
  phases,
  roles,
  spatialGrid,
  structureGrid,
  signalGrid,
  memoryGrid,
  attentionField,
  glyphHeaders,
  glyphPayload,
  hiveEnergyPool,
  coherence,
  neuralCoherence,
  hormones,
  lineage,
  instructions,
  ledgerHeadView,
  ledgerDataView,
  contexts,
  semanticBonuses,
  RISC,

  // Legacy mapping for UI and external engines
  memoryGridBuffer,
  signalGridBuffer,
  structureGridBuffer,
  attentionFieldBuffer,
  glyphHeaderBuffer,
  glyphPayloadBuffer,
  roleRegistryBuffer: roleBuffer,
  bondStiffnessBuffer: stiffnessBuffer,
  bondDistancesBuffer: bondDistBuffer,
  dampingBuffer: dampingBuffer,
  semanticBonusesBuffer,
  immuneBuffer: signalGridBuffer, // Alias for immunity overlay
  currentReadBuffer: signalGridBuffer, // Alias for signal overlay
  synapticStackBuffer: signalGridBuffer, // Alias for synaptic overlay
  viralGrid: signalGrid, // Legacy alias for sensory/immune overlays
  viralGridBuffer: signalGridBuffer, // Legacy alias for UI endpoints
  hiveMemoryBuffer,
  hiveEnergyPoolBuffer,
  hormoneBuffer,
  lineageBuffer,

  // Roles
  ROLE_NEUTRAL: 0,
  ROLE_PRODUCER: 1,
  ROLE_GUARDIAN: 2,
  ROLE_ARCHITECT: 3,
  ROLE_PARASITE: 4,

  getId: (i: number) => Atomics.load(ids, i),
  getX: (i: number) => Atomics.load(xs, i),
  getY: (i: number) => Atomics.load(ys, i),
  getRole: (i: number) => Atomics.load(roles, i),
  getEnergy: (i: number) => Atomics.load(energies, i) / SCALE,
  getResonance: (i: number) => Atomics.load(resonances, i),
  getPhase: (i: number) => Atomics.load(phases, i),
  getLogic: (i: number) => logic.subarray(i * 8, i * 8 + 8),
  getBonds: (i: number) => bonds.subarray(i * 4, i * 4 + 4),
  getBondTarget: (i: number, slot: number) => Atomics.load(bonds, i * 4 + slot),
  getBondStiffness: (i: number, slot: number) => bondStiffness[i * 4 + slot],
  getBondDistance: (i: number, slot: number) =>
    Atomics.load(bondDistances, i * 4 + slot),
  hasBondRequest: (i: number) => Atomics.load(bondRequests, i * 3) !== 0,
  getBondRequestInitiator: (i: number) => Atomics.load(bondRequests, i * 3),
  getBondRequestTarget: (i: number) => Atomics.load(bondRequests, i * 3 + 1),
  getBondRequestDistance: (i: number) => Atomics.load(bondRequests, i * 3 + 2),
  getDamping: (i: number) => Atomics.load(damping, i),
  getLineage: (i: number) => Atomics.load(lineage, i),
  getMailboxMsgType: (i: number) => Atomics.load(mailboxes, i * 2),
  getMailboxPayload: (i: number) => Atomics.load(mailboxes, i * 2 + 1),
  getHiveMemory: (addr: number) => Atomics.load(hiveMemory, addr & 1023),
  setHiveMemory: (addr: number, val: number) => {
    Atomics.store(hiveMemory, addr & 1023, val);
  },

  getHiveBalance: () => Atomics.load(hiveBalance, 0),
  setHiveBalance: (val: number) => {
    Atomics.store(hiveBalance, 0, val);
  },
  addHiveBalance: (val: number) => Atomics.add(hiveBalance, 0, val),
  getHiveEnergyPoolSlot: (slot: number) =>
    Atomics.load(hiveEnergyPool, slot & 255),
  setHiveEnergyPoolSlot: (slot: number, val: number) =>
    Atomics.store(hiveEnergyPool, slot & 255, val),
  addHiveEnergyPoolSlot: (slot: number, val: number) =>
    Atomics.add(hiveEnergyPool, slot & 255, val),

  getInstructions: (i: number) => instructions.subarray(i * 64, i * 64 + 64),
  getCode: (i: number) => codeWords.subarray(i * 16, i * 16 + 16),
  getReg: (i: number, reg: number) => Atomics.load(contexts, i * 16 + reg),
  getPC: (i: number) => Atomics.load(contextByteView, i * 64 + 32),
  getContext: (i: number) => contextByteView.subarray(i * 64, i * 64 + 64),

  setId: (i: number, val: bigint) => Atomics.store(ids, i, val),
  setX: (i: number, val: number) => Atomics.store(xs, i, Math.round(val)),
  setY: (i: number, val: number) => Atomics.store(ys, i, Math.round(val)),
  getSynapticWeight: (index: number, slot: number): number =>
    synapticWeights[index * 4 + slot],
  setSynapticWeight: (index: number, slot: number, weight: number) => {
    synapticWeights[index * 4 + slot] = weight;
  },
  setRole: (i: number, val: number) => Atomics.store(roles, i, val),
  setEnergy: (i: number, val: number) =>
    Atomics.store(energies, i, toClampedEnergyRaw(val)),
  setResonance: (i: number, val: number) =>
    Atomics.store(resonances, i, clampResourceRaw(val)),
  setPhase: (i: number, val: number) => Atomics.store(phases, i, val),
  setLogic: (i: number, val: Uint8Array) => logic.set(val, i * 8),
  setBondTarget: (i: number, slot: number, target: number) =>
    Atomics.store(bonds, i * 4 + slot, target),
  setBondStiffness: (i: number, slot: number, val: number) => {
    bondStiffness[i * 4 + slot] = val;
  },
  setBondDistance: (i: number, slot: number, val: number) =>
    Atomics.store(bondDistances, i * 4 + slot, val),
  setDamping: (i: number, val: number) => Atomics.store(damping, i, val),
  setLineage: (i: number, val: bigint) => Atomics.store(lineage, i, val),
  setMailboxMsgType: (i: number, val: number) =>
    Atomics.store(mailboxes, i * 2, val),
  setMailboxPayload: (i: number, val: number) =>
    Atomics.store(mailboxes, i * 2 + 1, val),

  setInstructions: (i: number, val: Uint8Array) =>
    instructions.set(val, i * 64),
  setCode: (i: number, val: Uint32Array | Uint8Array) => {
    const codeStart = i * 16;
    if (val instanceof Uint32Array) {
      codeWords.fill(0, codeStart, codeStart + 16);
      codeWords.set(val.subarray(0, 16), codeStart);
      return;
    }
    const instStart = i * 64;
    instructions.fill(0, instStart, instStart + 64);
    instructions.set(val.subarray(0, 64), instStart);
  },
  setReg: (i: number, reg: number, val: number) =>
    Atomics.store(contexts, i * 16 + reg, val),
  setPC: (i: number, val: number) =>
    Atomics.store(contextByteView, i * 64 + 32, val),

  getBondRequest: (i: number) => {
    const base = i * 3;
    const initiator = Atomics.load(bondRequests, base);
    return initiator !== 0 ? bondRequests.subarray(base, base + 3) : null;
  },
  clearBondRequest: (i: number) => Atomics.store(bondRequests, i * 3, 0),

  recycleAtom: (i: number) => {
    Atomics.store(ids, i, 0n);
    Atomics.store(energies, i, 0);
    Atomics.store(resonances, i, 0);
    Atomics.store(phases, i, 0);
    Atomics.store(roles, i, 0);
    bonds.fill(0, i * 4, i * 4 + 4);
    bondStiffness.fill(0, i * 4, i * 4 + 4);
    bondDistances.fill(0, i * 4, i * 4 + 4);
    Atomics.store(damping, i, 0);
    Atomics.store(lineage, i, 0n);
    instructions.fill(0, i * 64, i * 64 + 64);
    contexts.fill(0, i * 16, i * 16 + 16);
  },

  clear: () => {
    // Preserve low-memory wasm runtime segments; wipe only the lattice region.
    latticeClearView.fill(0);
    semanticBonuses.fill(0);
  },
  getActiveIndices: () => {
    const active: number[] = [];
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(ids, i) !== 0n) active.push(i);
    }
    return active;
  },
  getTopResonantIndices: (count: number) => {
    const limit = Math.max(0, Math.min(MAX_ATOMS, Math.trunc(count)));
    if (limit === 0) return [];

    const top: Array<{ idx: number; resonance: number }> = [];
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(ids, i) === 0n) continue;
      const resonance = Atomics.load(resonances, i);
      if (top.length < limit) {
        top.push({ idx: i, resonance });
        continue;
      }

      let minPos = 0;
      for (let j = 1; j < top.length; j++) {
        if (top[j].resonance < top[minPos].resonance) minPos = j;
      }
      if (resonance > top[minPos].resonance) {
        top[minPos] = { idx: i, resonance };
      }
    }
    top.sort((a, b) => b.resonance - a.resonance);
    return top.map((entry) => entry.idx);
  },

  findFreeSlot: (): number => {
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(ids, i) === 0n) return i;
    }
    return -1;
  },
  findEmptySlot: (): number => {
    for (let i = 1; i < MAX_ATOMS; i++) {
      if (Atomics.load(ids, i) === 0n) return i;
    }
    return -1;
  },

  /**
   * Serializes the current active state of the matrix into a flat 32-bit Float array
   * optimized for raw WebSocket telemetry and 60 FPS WebGL InstancedMesh buffering.
   * [x, y, color (encoded as float), resonance]
   */
  packRenderFrame: (): Float32Array => {
    const active = STATE_MATRIX.getActiveIndices();
    const len = active.length;
    // 4 floats per atom -> 16 bytes per atom. 500k atoms = 8MB packet.
    const packet = new Float32Array(len * 4);
    
    for (let j = 0; j < len; j++) {
      const idx = active[j];
      const offset = j * 4;
      packet[offset] = Atomics.load(xs, idx);     // x
      packet[offset + 1] = Atomics.load(ys, idx); // y
      packet[offset + 2] = Atomics.load(roles, idx); // color
      packet[offset + 3] = Atomics.load(resonances, idx); // resonance
    }
    return packet;
  },

  seedAtom: (
    i: number,
    id: bigint,
    x: number,
    y: number,
    energy: number,
    resonance: number,
    logicVal?: Uint8Array,
    script?: Uint8Array,
  ) => {
    Atomics.store(ids, i, id);
    Atomics.store(xs, i, Math.round(x));
    Atomics.store(ys, i, Math.round(y));
    Atomics.store(energies, i, Math.round(energy * SCALE));
    Atomics.store(resonances, i, resonance);
    Atomics.store(phases, i, 0);
    Atomics.store(roles, i, 0);
    Atomics.store(semanticBonuses, i, 0);

    if (logicVal) logic.set(logicVal, i * 8);

    const boot = script || DEFAULT_BOOT_SCRIPT;
    instructions.set(boot, i * 64);

    // Reset Context
    for (let r = 0; r < 16; r++) Atomics.store(contexts, i * 16 + r, 0);
    // PC is at offset 32 (Reg index 8)
    Atomics.store(contextByteView, i * 64 + 32, 0);
  },

  seedGuardian: (
    i: number,
    id: bigint,
    x: number,
    y: number,
    energy: number = 10,
    resonance: number = 100,
  ) => {
    const genome = new Uint8Array(8);
    const script = STATE_MATRIX.getGuardianScript();
    STATE_MATRIX.seedAtom(i, id, x, y, energy, resonance, genome, script);
    STATE_MATRIX.setRole(i, STATE_MATRIX.ROLE_GUARDIAN);
  },

  getGuardianScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    // 1. R0 = neural coherence
    script[pc++] = RISC.OP_GET;
    script[pc++] = 0;
    script[pc++] = RISC.PROP_NEURAL_COHERENCE;
    // 2. R1 = threshold
    script[pc++] = RISC.OP_SET;
    script[pc++] = 1;
    script[pc++] = GUARDIAN_COHERENCE_THRESHOLD;
    // 3. R1 = threshold - coherence
    script[pc++] = RISC.OP_SUB;
    script[pc++] = 1;
    script[pc++] = 0;
    // 4. If R1 != 0, route to repair branch.
    script[pc++] = RISC.OP_JNZ;
    script[pc++] = 1;
    script[pc++] = 22;

    // --- STABLE FIELD ---
    script[pc++] = RISC.OP_SIGNAL;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS.SET_ROLE;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 1;
    script[pc++] = 2; // ROLE_GUARDIAN
    script[pc++] = RISC.OP_SYSCALL;
    script[pc++] = RISC.OP_JMP;
    script[pc++] = 0;

    // --- REPAIR BRANCH ---
    // The coherence broadcast is capped upstream, so R1!=0 means "below threshold".
    // We switch to ARCHITECT (Role = 3) via SYS.SET_ROLE
    script[pc++] = RISC.OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS.SET_ROLE;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 1;
    script[pc++] = 3;
    script[pc++] = RISC.OP_SYSCALL;
    script[pc++] = RISC.OP_BUILD;
    script[pc++] = 0;
    script[pc++] = 0;
    script[pc++] = RISC.OP_JMP;
    script[pc++] = 0;

    return script;
  },

  getArchitectScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = RISC.OP_BUILD;
    script[pc++] = 0;
    script[pc++] = 0;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS.SET_ROLE;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 1;
    script[pc++] = 3; // ROLE_ARCHITECT
    script[pc++] = RISC.OP_SYSCALL;
    script[pc++] = RISC.OP_JMP;
    script[pc++] = 0;

    return script;
  },

  getMatrixResonance: () => {
    let total = 0;
    for (let i = 0; i < 140 * 80; i++) {
      total += Atomics.load(signalGrid, i);
    }
    return total;
  },

  getClusterSync: () => {
    // Heuristic: measure how many neighboring cells in the Matrix have similar high resonance
    let sync = 0;
    for (let i = 0; i < 140 * 80; i++) {
      const res = Atomics.load(signalGrid, i);
      if (res > 100) sync++;
    }
    return sync;
  },

  getMemorySummary: () => {
    // Implementation for Era 67 memetic summaries
    const counts = new Map<number, number>();
    for (let i = 0; i < 140 * 80; i++) {
      const energy = memoryGrid[i * 8] + (memoryGrid[i * 8 + 1] << 8);
      if (energy > 0) {
        const sig = memoryGrid[i * 8 + 4]; // First byte of meme
        counts.set(sig, (counts.get(sig) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([sig, count]) => ({ sig, count }));
  },

  injectEnergy: (amount: number) => {
    let count = 0;
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(ids, i) !== 0n) {
        const current = Atomics.load(energies, i);
        Atomics.store(energies, i, current + Math.round(amount * SCALE));
        count++;
      }
    }
    return count;
  },

  // --- ERA 69: Crystalline Neural Network Helpers ---
  getGridType: (i: number) => Atomics.load(structureGrid, i) & 0xFF,
  getGridDensity: (i: number) => (Atomics.load(structureGrid, i) >> 8) & 0xFF,
  getGridCharge: (i: number) => (Atomics.load(structureGrid, i) >> 16) & 0xFF,
  getGridState: (i: number) => (Atomics.load(structureGrid, i) >> 24) & 0xFF,
  getGlyphHeader: (i: number) => Atomics.load(glyphHeaders, i),
  getGlyphPayload: (i: number) => glyphPayload.subarray(i * 8, i * 8 + 8),
  setGlyphHeader: (i: number, val: number) =>
    Atomics.store(glyphHeaders, i, val),
  setGlyphPayload: (i: number, val: Uint8Array) => {
    glyphPayload.fill(0, i * 8, i * 8 + 8);
    glyphPayload.set(val.subarray(0, 8), i * 8);
  },

  setGridType: (i: number, val: number) => {
    Atomics.and(structureGrid, i, ~0x000000FF);
    Atomics.or(structureGrid, i, val & 0xFF);
  },
  setGridDensity: (i: number, val: number) => {
    Atomics.and(structureGrid, i, ~0x0000FF00);
    Atomics.or(structureGrid, i, (val & 0xFF) << 8);
  },
  setGridCharge: (i: number, val: number) => {
    Atomics.and(structureGrid, i, ~0x00FF0000);
    Atomics.or(structureGrid, i, (val & 0xFF) << 16);
  },
  setGridState: (i: number, val: number) => {
    Atomics.and(structureGrid, i, ~0xFF000000);
    Atomics.or(structureGrid, i, (val & 0xFF) << 24);
  },
  getCausality: (idx: number) => Atomics.load(causality, idx),
  setCausality: (idx: number, val: number) =>
    Atomics.store(causality, idx, val),
  clearDamping: () => damping.fill(0),
  getHormone: (id: number) => Atomics.load(hormones, id),
  setHormone: (id: number, val: number) => Atomics.store(hormones, id, val),
};
