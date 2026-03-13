// OMEGA-64 | ATOM_ACCESS.ts
import { GRID_W, GRID_H, GRID_CELLS } from "./OFFSETS.ts";
import * as OFFSETS from "./OFFSETS.ts";
import * as views from "./memory_views.ts";

const RESOURCE_MAX_RAW = 2_000_000_000;

export const clampResourceRaw = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= RESOURCE_MAX_RAW) return RESOURCE_MAX_RAW;
  return Math.trunc(value);
};

export const toClampedEnergyRaw = (value: number): number =>
  clampResourceRaw(Math.round(value * OFFSETS.SCALE));

export const SYNC = {
  IDLE: 0,
  WASM_TICKING: 1,
  HOST_LOCK: 2,
};

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
  OP_SYSCALL: 0x60,
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
  ATTRACT: 0x11,
  FOLD: 0x12,
  BET: 0x10,
};

export const STRUCTURE = {
  VOID: 0,
  WIRE: 1,
  NODE: 2,
  DIODE: 3,
  SOURCE: 4,
  SINK: 5,
  CAPACITOR: 6,
  INVERTER: 7,
  LATCH: 8,
};

const DEFAULT_BOOT_SCRIPT = (() => {
  const boot = new Uint8Array(64);
  boot[0] = RISC.OP_SET;
  boot[1] = 0;
  boot[2] = SYS.YIELD;
  boot[3] = RISC.OP_SYSCALL;
  return boot;
})();

const GUARDIAN_COHERENCE_THRESHOLD = 200;

export const ATOM_ACCESS = {
  MAX_ATOMS: OFFSETS.MAX_ATOMS,
  buffer: views.sharedBuffer,
  wasmMemory: views.wasmMemory,
  SCALE: OFFSETS.SCALE,
  syncState: views.syncState,
  tickCounter: views.tickCounter,
  SYNC,
  phases: views.phases,
  evolutionReserved: views.evolutionReserved,
  roles: views.roles,
  spatialGrid: views.spatialGrid,
  structureGrid: views.structureGrid,
  signalGrid: views.signalGrid,
  memoryGrid: views.memoryGrid,
  attentionField: views.attentionField,
  glyphHeaders: views.glyphHeaders,
  glyphPayload: views.glyphPayload,
  hiveEnergyPool: views.hiveEnergyPool,
  coherence: views.coherence,
  neuralCoherence: views.neuralCoherence,
  hormones: views.hormones,
  lineage: views.lineage,
  instructions: views.instructions,
  ledgerHeadView: views.ledgerHeadView,
  ledgerDataView: views.ledgerDataView,
  contexts: views.contexts,
  semanticBonuses: views.semanticBonuses,
  RISC,

  memoryGridBuffer: views.memoryGridBuffer,
  signalGridBuffer: views.signalGridBuffer,
  structureGridBuffer: views.structureGridBuffer,
  attentionFieldBuffer: views.attentionFieldBuffer,
  glyphHeaderBuffer: views.glyphHeaderBuffer,
  glyphPayloadBuffer: views.glyphPayloadBuffer,
  roleRegistryBuffer: views.roleBuffer,
  bondStiffnessBuffer: views.stiffnessBuffer,
  bondDistancesBuffer: views.bondDistBuffer,
  dampingBuffer: views.dampingBuffer,
  semanticBonusesBuffer: views.semanticBonusesBuffer,
  immuneBuffer: views.signalGridBuffer,
  currentReadBuffer: views.signalGridBuffer,
  synapticStackBuffer: views.signalGridBuffer,
  viralGrid: views.signalGrid,
  viralGridBuffer: views.signalGridBuffer,
  hiveMemoryBuffer: views.hiveMemoryBuffer,
  hiveEnergyPoolBuffer: views.hiveEnergyPoolBuffer,
  hormoneBuffer: views.hormoneBuffer,
  lineageBuffer: views.lineageBuffer,

  ROLE_NEUTRAL: 0,
  ROLE_PRODUCER: 1,
  ROLE_GUARDIAN: 2,
  ROLE_ARCHITECT: 3,
  ROLE_PARASITE: 4,
  ROLE_MITOCHONDRIA: 5,

  getId: (i: number) => Atomics.load(views.ids, i),
  getX: (i: number) => Atomics.load(views.xs, i),
  getY: (i: number) => Atomics.load(views.ys, i),
  getRole: (i: number) => Atomics.load(views.roles, i),
  getEnergy: (i: number) => Atomics.load(views.energies, i) / OFFSETS.SCALE,
  getResonance: (i: number) => Atomics.load(views.resonances, i),
  getPhase: (i: number) => Atomics.load(views.phases, i),
  getEvolutionReserved: (i: number) => Atomics.load(views.evolutionReserved, i),
  getLogic: (i: number) => views.logic.subarray(i * 8, i * 8 + 8),
  getBonds: (i: number) => views.bonds.subarray(i * 4, i * 4 + 4),
  setBonds: (i: number, val: Uint32Array) => views.bonds.set(val, i * 4),
  getBondTarget: (i: number, slot: number) => Atomics.load(views.bonds, i * 4 + slot),
  getBondStiffness: (i: number, slot: number) => views.bondStiffness[i * 4 + slot],
  getBondDistance: (i: number, slot: number) => Atomics.load(views.bondDistances, i * 4 + slot),
  hasBondRequest: (i: number) => Atomics.load(views.bondRequests, i * 3) !== 0,
  getBondRequestInitiator: (i: number) => Atomics.load(views.bondRequests, i * 3),
  getBondRequestTarget: (i: number) => Atomics.load(views.bondRequests, i * 3 + 1),
  getBondRequestDistance: (i: number) => Atomics.load(views.bondRequests, i * 3 + 2),
  getDamping: (i: number) => Atomics.load(views.damping, i),
  getLineage: (i: number) => Atomics.load(views.lineage, i),
  getMailboxMsgType: (i: number) => Atomics.load(views.mailboxes, i * 2),
  getMailboxPayload: (i: number) => Atomics.load(views.mailboxes, i * 2 + 1),
  getHiveMemory: (addr: number) => Atomics.load(views.hiveMemory, addr & 1023),
  setHiveMemory: (addr: number, val: number) => { Atomics.store(views.hiveMemory, addr & 1023, val); },
  getHiveBalance: () => Atomics.load(views.hiveBalance, 0),
  setHiveBalance: (val: number) => { Atomics.store(views.hiveBalance, 0, val); },
  addHiveBalance: (val: number) => Atomics.add(views.hiveBalance, 0, val),
  getHiveEnergyPoolSlot: (slot: number) => Atomics.load(views.hiveEnergyPool, slot & 255),
  setHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.store(views.hiveEnergyPool, slot & 255, val),
  addHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.add(views.hiveEnergyPool, slot & 255, val),

  getInstructions: (i: number) => views.instructions.subarray(i * OFFSETS.ATOM_INSTRUCTION_SIZE, i * OFFSETS.ATOM_INSTRUCTION_SIZE + OFFSETS.ATOM_INSTRUCTION_SIZE),
  getCode: (i: number) => views.codeWords.subarray(i * 16, i * 16 + 16),
  getReg: (i: number, reg: number) => Atomics.load(views.contexts, i * OFFSETS.ATOM_CONTEXT_SIZE + reg),
  getPC: (i: number) => Atomics.load(views.contextByteView, i * (OFFSETS.ATOM_CONTEXT_SIZE * 4) + 32),
  getContext: (i: number) => views.contextByteView.subarray(i * (OFFSETS.ATOM_CONTEXT_SIZE * 4), i * (OFFSETS.ATOM_CONTEXT_SIZE * 4) + (OFFSETS.ATOM_CONTEXT_SIZE * 4)),

  setId: (i: number, val: bigint) => Atomics.store(views.ids, i, val),
  setX: (i: number, val: number) => Atomics.store(views.xs, i, Math.round(val)),
  setY: (i: number, val: number) => Atomics.store(views.ys, i, Math.round(val)),
  getSynapticWeight: (index: number, slot: number): number => views.synapticWeights[index * 4 + slot],
  setSynapticWeight: (index: number, slot: number, weight: number) => { views.synapticWeights[index * 4 + slot] = weight; },
  setRole: (i: number, val: number) => Atomics.store(views.roles, i, val),
  setEnergy: (i: number, val: number) => Atomics.store(views.energies, i, toClampedEnergyRaw(val)),
  setResonance: (i: number, val: number) => Atomics.store(views.resonances, i, Math.trunc(clampResourceRaw(val))),
  setPhase: (i: number, val: number) => Atomics.store(views.phases, i, val),
  setLogic: (i: number, val: Uint8Array) => views.logic.set(val, i * 8),
  setBondTarget: (i: number, slot: number, target: number) => Atomics.store(views.bonds, i * 4 + slot, target),
  setBondStiffness: (i: number, slot: number, val: number) => { views.bondStiffness[i * 4 + slot] = val; },
  setBondDistance: (i: number, slot: number, val: number) => Atomics.store(views.bondDistances, i * 4 + slot, val),
  setDamping: (i: number, val: number) => Atomics.store(views.damping, i, val),
  setLineage: (i: number, val: bigint) => Atomics.store(views.lineage, i, val),
  setMailboxMsgType: (i: number, val: number) => Atomics.store(views.mailboxes, i * 2, val),
  setMailboxPayload: (i: number, val: number) => Atomics.store(views.mailboxes, i * 2 + 1, val),

  setInstructions: (i: number, val: Uint8Array) => views.instructions.set(val, i * OFFSETS.ATOM_INSTRUCTION_SIZE),
  setCode: (i: number, val: Uint32Array | Uint8Array) => {
    const codeStart = i * 16;
    if (val instanceof Uint32Array) {
      views.codeWords.fill(0, codeStart, codeStart + 16);
      views.codeWords.set(val.subarray(0, 16), codeStart);
      return;
    }
    const instStart = i * OFFSETS.ATOM_INSTRUCTION_SIZE;
    views.instructions.fill(0, instStart, instStart + OFFSETS.ATOM_INSTRUCTION_SIZE);
    views.instructions.set(val.subarray(0, OFFSETS.ATOM_INSTRUCTION_SIZE), instStart);
  },
  setReg: (i: number, reg: number, val: number) => Atomics.store(views.contexts, i * OFFSETS.ATOM_CONTEXT_SIZE + reg, val),
  setPC: (i: number, val: number) => Atomics.store(views.contextByteView, i * (OFFSETS.ATOM_CONTEXT_SIZE * 4) + 32, val),

  getBondRequest: (i: number) => {
    const base = i * 3;
    const initiator = Atomics.load(views.bondRequests, base);
    return initiator !== 0 ? views.bondRequests.subarray(base, base + 3) : null;
  },
  clearBondRequest: (i: number) => Atomics.store(views.bondRequests, i * 3, 0),

  recycleAtom: (i: number) => {
    Atomics.store(views.ids, i, 0n);
    Atomics.store(views.energies, i, 0);
    Atomics.store(views.resonances, i, 0);
    Atomics.store(views.phases, i, 0);
    Atomics.store(views.roles, i, 0);
    views.bonds.fill(0, i * 4, i * 4 + 4);
    views.bondStiffness.fill(0, i * 4, i * 4 + 4);
    views.bondDistances.fill(0, i * 4, i * 4 + 4);
    Atomics.store(views.damping, i, 0);
    Atomics.store(views.lineage, i, 0n);
    views.instructions.fill(0, i * OFFSETS.ATOM_INSTRUCTION_SIZE, i * OFFSETS.ATOM_INSTRUCTION_SIZE + OFFSETS.ATOM_INSTRUCTION_SIZE);
    views.contexts.fill(0, i * OFFSETS.ATOM_CONTEXT_SIZE, i * OFFSETS.ATOM_CONTEXT_SIZE + OFFSETS.ATOM_CONTEXT_SIZE);
  },

  clear: () => {
    views.latticeClearView.fill(0);
    views.semanticBonuses.fill(0);
  },
  getActiveIndices: () => {
    const active: number[] = [];
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) !== 0n) active.push(i);
    }
    return active;
  },
  getTopResonantIndices: (count: number) => {
    const limit = Math.max(0, Math.min(OFFSETS.MAX_ATOMS, Math.trunc(count)));
    if (limit === 0) return [];

    const top: Array<{ idx: number; resonance: number }> = [];
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) continue;
      const resonance = Atomics.load(views.resonances, i);
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
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) return i;
    }
    return -1;
  },
  findEmptySlot: (): number => {
    for (let i = 1; i < OFFSETS.MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) return i;
    }
    return -1;
  },

  packRenderFrame: (): Float32Array => {
    const active = ATOM_ACCESS.getActiveIndices();
    const len = active.length;
    const packet = new Float32Array(len * 4);

    for (let j = 0; j < len; j++) {
      const idx = active[j];
      const offset = j * 4;
      packet[offset] = Atomics.load(views.xs, idx);
      packet[offset + 1] = Atomics.load(views.ys, idx);
      packet[offset + 2] = Atomics.load(views.roles, idx);
      packet[offset + 3] = Atomics.load(views.resonances, idx);
    }
    return packet;
  },

  packPanopticonFrame: (): ArrayBuffer => {
    const active = ATOM_ACCESS.getActiveIndices();
    const atomCount = active.length;
    const gridCells = GRID_CELLS;
    const bytesPerAtom = 24;
    
    const totalBytes = 16 + gridCells + (atomCount * bytesPerAtom);
    const buffer = new ArrayBuffer(totalBytes);
    const cv = new DataView(buffer);
    const u8 = new Uint8Array(buffer);
    
    u8[0] = 79; u8[1] = 77; u8[2] = 71; u8[3] = 65;
    let offset = 4;
    
    cv.setInt32(offset, Atomics.load(views.tickCounter, 0), true);
    offset += 4;
    
    cv.setInt32(offset, gridCells, true);
    offset += 4;
    
    for(let i=0; i < gridCells; i++) {
        const type = ATOM_ACCESS.getGridType(i);
        const hasPlasmid = views.memoryGrid[i*8] > 0 ? 0x80 : 0;
        u8[offset++] = type | hasPlasmid;
    }
    
    cv.setInt32(offset, atomCount, true);
    offset += 4;
    
    for(let j=0; j < atomCount; j++) {
        const idx = active[j];
        cv.setInt16(offset, Atomics.load(views.xs, idx), true); offset += 2;
        cv.setInt16(offset, Atomics.load(views.ys, idx), true); offset += 2;
        u8[offset++] = Atomics.load(views.roles, idx);
        u8[offset++] = Math.min(255, Math.max(0, Atomics.load(views.resonances, idx)));
        cv.setUint16(offset, idx, true); offset += 2;
        
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4), true); offset+=4;
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4 + 1), true); offset+=4;
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4 + 2), true); offset+=4;
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4 + 3), true); offset+=4;
    }
    
    return buffer;
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
    Atomics.store(views.ids, i, id);
    Atomics.store(views.xs, i, Math.round(x));
    Atomics.store(views.ys, i, Math.round(y));
    Atomics.store(views.energies, i, Math.round(energy * OFFSETS.SCALE));
    Atomics.store(views.resonances, i, Math.trunc(resonance));
    Atomics.store(views.phases, i, 0);
    Atomics.store(views.roles, i, 0);
    Atomics.store(views.semanticBonuses, i, 0);

    if (logicVal) views.logic.set(logicVal, i * 8);

    const boot = script || DEFAULT_BOOT_SCRIPT;
    views.instructions.set(boot, i * OFFSETS.ATOM_INSTRUCTION_SIZE);

    for (let r = 0; r < OFFSETS.ATOM_CONTEXT_SIZE; r++) Atomics.store(views.contexts, i * OFFSETS.ATOM_CONTEXT_SIZE + r, 0);
    Atomics.store(views.contextByteView, i * (OFFSETS.ATOM_CONTEXT_SIZE * 4) + 32, 0);
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
    const script = ATOM_ACCESS.getGuardianScript();
    ATOM_ACCESS.seedAtom(i, id, x, y, energy, resonance, genome, script);
    ATOM_ACCESS.setRole(i, ATOM_ACCESS.ROLE_GUARDIAN);
  },

  getGuardianScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = RISC.OP_GET;
    script[pc++] = 0;
    script[pc++] = RISC.PROP_NEURAL_COHERENCE;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 1;
    script[pc++] = GUARDIAN_COHERENCE_THRESHOLD;
    script[pc++] = RISC.OP_SUB;
    script[pc++] = 1;
    script[pc++] = 0;
    script[pc++] = RISC.OP_JNZ;
    script[pc++] = 1;
    script[pc++] = 22;

    script[pc++] = RISC.OP_SIGNAL;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS.SET_ROLE;
    script[pc++] = RISC.OP_SET;
    script[pc++] = 1;
    script[pc++] = 2;
    script[pc++] = RISC.OP_SYSCALL;
    script[pc++] = RISC.OP_JMP;
    script[pc++] = 0;

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
    script[pc++] = 3;
    script[pc++] = RISC.OP_SYSCALL;
    script[pc++] = RISC.OP_JMP;
    script[pc++] = 0;

    return script;
  },

  getMatrixResonance: () => {
    let total = 0;
    for (let i = 0; i < GRID_CELLS; i++) {
      total += Atomics.load(views.signalGrid, i);
    }
    return total;
  },

  getClusterSync: () => {
    let sync = 0;
    for (let i = 0; i < GRID_CELLS; i++) {
      const res = Atomics.load(views.signalGrid, i);
      if (res > 100) sync++;
    }
    return sync;
  },

  getMemorySummary: () => {
    const counts = new Map<number, number>();
    for (let i = 0; i < GRID_CELLS; i++) {
      const energy = views.memoryGrid[i * 8] + (views.memoryGrid[i * 8 + 1] << 8);
      if (energy > 0) {
        const sig = views.memoryGrid[i * 8 + 4];
        counts.set(sig, (counts.get(sig) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([sig, count]) => ({ sig, count }));
  },

  injectEnergy: (amount: number) => {
    let count = 0;
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) !== 0n) {
        const current = Atomics.load(views.energies, i);
        Atomics.store(views.energies, i, current + Math.round(amount * OFFSETS.SCALE));
        count++;
      }
    }
    return count;
  },

  getGridType: (i: number) => Atomics.load(views.structureGrid, i) & 0xFF,
  getGridDensity: (i: number) => (Atomics.load(views.structureGrid, i) >> 8) & 0xFF,
  getGridCharge: (i: number) => (Atomics.load(views.structureGrid, i) >> 16) & 0xFF,
  getGridState: (i: number) => (Atomics.load(views.structureGrid, i) >> 24) & 0xFF,
  getGlyphHeader: (i: number) => Atomics.load(views.glyphHeaders, i),
  getGlyphPayload: (i: number) => views.glyphPayload.subarray(i * 8, i * 8 + 8),
  setGlyphHeader: (i: number, val: number) => Atomics.store(views.glyphHeaders, i, val),
  setGlyphPayload: (i: number, val: Uint8Array) => {
    views.glyphPayload.fill(0, i * 8, i * 8 + 8);
    views.glyphPayload.set(val.subarray(0, 8), i * 8);
  },

  setGridType: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0x000000FF);
    Atomics.or(views.structureGrid, i, val & 0xFF);
  },
  setGridDensity: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0x0000FF00);
    Atomics.or(views.structureGrid, i, (val & 0xFF) << 8);
  },
  setGridCharge: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0x00FF0000);
    Atomics.or(views.structureGrid, i, (val & 0xFF) << 16);
  },
  setGridState: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0xFF000000);
    Atomics.or(views.structureGrid, i, (val & 0xFF) << 24);
  },
  getCausality: (idx: number) => Atomics.load(views.causality, idx),
  setCausality: (idx: number, val: number) => Atomics.store(views.causality, idx, val),
  clearDamping: () => views.damping.fill(0),
  getHormone: (id: number) => Atomics.load(views.hormones, id),
  setHormone: (id: number, val: number) => Atomics.store(views.hormones, id, val),
};
