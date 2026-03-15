// SSoT: src/ontology/memory/atom_access.md

// OMEGA-64 | ATOM_ACCESS.ts
import {
  ATOM_CONTEXT_SIZE,
  ATOM_INSTRUCTION_SIZE,
  MAX_ATOMS,
  RESOURCE_MAX,
  SCALE,
  GRID_W,
  GRID_H,
  GRID_CELLS
} from "../00/SYSTEM_CONSTANTS.ts";
import { PROP_NEURAL_COHERENCE } from "../00/VmProps.ts";
import {
  OP_SYSCALL, OP_GET, OP_SUB, OP_JNZ, OP_SIGNAL, OP_JMP, OP_BUILD, OP_SET
} from "../00/VmOpcodes.ts";
import { SYS_YIELD, SYS_SET_ROLE } from "../00/VmSys.ts";
import * as views from "../02/memory_views.ts";

export const clampResourceRaw = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= RESOURCE_MAX) return RESOURCE_MAX;
  return Math.trunc(value);
};

export const toClampedEnergyRaw = (value: number): number =>
  clampResourceRaw(Math.round(value * SCALE));

export const SYNC = {
  IDLE: 0,
  WASM_TICKING: 1,
  HOST_LOCK: 2,
};

const DEFAULT_BOOT_SCRIPT = (() => {
  const boot = new Uint8Array(64);
  boot[0] = OP_SET;
  boot[1] = 0;
  boot[2] = SYS_YIELD;
  boot[3] = OP_SYSCALL;
  return boot;
})();

const GUARDIAN_COHERENCE_THRESHOLD = 200;

export const ATOM_ACCESS = {
  MAX_ATOMS: MAX_ATOMS,
  buffer: views.sharedBuffer,
  wasmMemory: views.wasmMemory,
  SCALE: SCALE,
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
  get_x: (i: number) => Atomics.load(views.xs, i),
  get_y: (i: number) => Atomics.load(views.ys, i),
  get_role: (i: number) => Atomics.load(views.roles, i),
  getX: (i: number) => Atomics.load(views.xs, i),
  getY: (i: number) => Atomics.load(views.ys, i),
  getRole: (i: number) => Atomics.load(views.roles, i),
  get_energy: (i: number) => Atomics.load(views.energies, i) / SCALE,
  get_resonance: (i: number) => Atomics.load(views.resonances, i),
  get_phase: (i: number) => Atomics.load(views.phases, i),
  getEnergy: (i: number) => Atomics.load(views.energies, i) / SCALE,
  getResonance: (i: number) => Atomics.load(views.resonances, i),
  getPhase: (i: number) => Atomics.load(views.phases, i),
  getEvolutionReserved: (i: number) => Atomics.load(views.evolutionReserved, i),
  getLogic: (i: number) => views.logic.subarray(i * 8, i * 8 + 8),
  getBonds: (i: number) => views.bonds.subarray(i * 4, i * 4 + 4),
  setBonds: (i: number, val: Uint32Array) => views.bonds.set(val, i * 4),
  get_bond_target: (i: number, slot: number) => Atomics.load(views.bonds, i * 4 + slot),
  get_bond_stiffness: (i: number, slot: number) => views.bondStiffness[i * 4 + slot],
  getBondTarget: (i: number, slot: number) => Atomics.load(views.bonds, i * 4 + slot),
  getBondStiffness: (i: number, slot: number) => views.bondStiffness[i * 4 + slot],
  getBondDistance: (i: number, slot: number) => Atomics.load(views.bondDistances, i * 4 + slot),
  hasBondRequest: (i: number) => Atomics.load(views.bondRequests, i * 3) !== 0,
  getBondRequestInitiator: (i: number) => Atomics.load(views.bondRequests, i * 3),
  getBondRequestTarget: (i: number) => Atomics.load(views.bondRequests, i * 3 + 1),
  getBondRequestDistance: (i: number) => Atomics.load(views.bondRequests, i * 3 + 2),
  getDamping: (i: number) => Atomics.load(views.damping, i),
  get_lineage: (i: number) => Atomics.load(views.lineage, i),
  getLineage: (i: number) => Atomics.load(views.lineage, i),
  getMailboxMsgType: (i: number) => Atomics.load(views.mailboxes, i * 2),
  getMailboxPayload: (i: number) => Atomics.load(views.mailboxes, i * 2 + 1),
  get_hive_memory: (addr: number) => Atomics.load(views.hiveMemory, addr & 1023),
  set_hive_memory: (addr: number, val: number) => { Atomics.store(views.hiveMemory, addr & 1023, val); },
  get_hive_balance: () => Atomics.load(views.hiveBalance, 0),
  getHiveMemory: (addr: number) => Atomics.load(views.hiveMemory, addr & 1023),
  setHiveMemory: (addr: number, val: number) => { Atomics.store(views.hiveMemory, addr & 1023, val); },
  getHiveBalance: () => Atomics.load(views.hiveBalance, 0),
  setHiveBalance: (val: number) => { Atomics.store(views.hiveBalance, 0, val); },
  add_hive_balance: (val: number) => Atomics.add(views.hiveBalance, 0, val),
  addHiveBalance: (val: number) => Atomics.add(views.hiveBalance, 0, val),
  getHiveEnergyPoolSlot: (slot: number) => Atomics.load(views.hiveEnergyPool, slot & 255),
  setHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.store(views.hiveEnergyPool, slot & 255, val),
  addHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.add(views.hiveEnergyPool, slot & 255, val),

  getInstructions: (i: number) => views.instructions.subarray(i * ATOM_INSTRUCTION_SIZE, i * ATOM_INSTRUCTION_SIZE + ATOM_INSTRUCTION_SIZE),
  getCode: (i: number) => views.codeWords.subarray(i * 16, i * 16 + 16),
  get_reg: (i: number, reg: number) => Atomics.load(views.contexts, i * ATOM_CONTEXT_SIZE + reg),
  get_p_c: (i: number) => Atomics.load(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32),
  getReg: (i: number, reg: number) => Atomics.load(views.contexts, i * ATOM_CONTEXT_SIZE + reg),
  getPC: (i: number) => Atomics.load(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32),
  getContext: (i: number) => views.contextByteView.subarray(i * (ATOM_CONTEXT_SIZE * 4), i * (ATOM_CONTEXT_SIZE * 4) + (ATOM_CONTEXT_SIZE * 4)),

  setId: (i: number, val: bigint) => Atomics.store(views.ids, i, val),
  setX: (i: number, val: number) => Atomics.store(views.xs, i, Math.round(val)),
  setY: (i: number, val: number) => Atomics.store(views.ys, i, Math.round(val)),
  getSynapticWeight: (index: number, slot: number): number => views.synapticWeights[index * 4 + slot],
  setSynapticWeight: (index: number, slot: number, weight: number) => { views.synapticWeights[index * 4 + slot] = weight; },
  set_role: (i: number, val: number) => Atomics.store(views.roles, i, val),
  set_energy: (i: number, val: number) => Atomics.store(views.energies, i, toClampedEnergyRaw(val)),
  set_resonance: (i: number, val: number) => Atomics.store(views.resonances, i, Math.trunc(clampResourceRaw(val))),
  set_phase: (i: number, val: number) => Atomics.store(views.phases, i, val),
  setRole: (i: number, val: number) => Atomics.store(views.roles, i, val),
  setEnergy: (i: number, val: number) => Atomics.store(views.energies, i, toClampedEnergyRaw(val)),
  setResonance: (i: number, val: number) => Atomics.store(views.resonances, i, Math.trunc(clampResourceRaw(val))),
  setPhase: (i: number, val: number) => Atomics.store(views.phases, i, val),
  setLogic: (i: number, val: Uint8Array) => views.logic.set(val, i * 8),
  set_bond_target: (i: number, slot: number, target: number) => Atomics.store(views.bonds, i * 4 + slot, target),
  set_bond_stiffness: (i: number, slot: number, val: number) => { views.bondStiffness[i * 4 + slot] = val; },
  setBondTarget: (i: number, slot: number, target: number) => Atomics.store(views.bonds, i * 4 + slot, target),
  setBondStiffness: (i: number, slot: number, val: number) => { views.bondStiffness[i * 4 + slot] = val; },
  setBondDistance: (i: number, slot: number, val: number) => Atomics.store(views.bondDistances, i * 4 + slot, val),
  set_damping: (i: number, val: number) => Atomics.store(views.damping, i, val),
  setDamping: (i: number, val: number) => Atomics.store(views.damping, i, val),
  setLineage: (i: number, val: bigint) => Atomics.store(views.lineage, i, val),
  setMailboxMsgType: (i: number, val: number) => Atomics.store(views.mailboxes, i * 2, val),
  setMailboxPayload: (i: number, val: number) => Atomics.store(views.mailboxes, i * 2 + 1, val),

  setInstructions: (i: number, val: Uint8Array) => views.instructions.set(val, i * ATOM_INSTRUCTION_SIZE),
  setCode: (i: number, val: Uint32Array | Uint8Array) => {
    const codeStart = i * 16;
    if (val instanceof Uint32Array) {
      views.codeWords.fill(0, codeStart, codeStart + 16);
      views.codeWords.set(val.subarray(0, 16), codeStart);
      return;
    }
    const instStart = i * ATOM_INSTRUCTION_SIZE;
    views.instructions.fill(0, instStart, instStart + ATOM_INSTRUCTION_SIZE);
    views.instructions.set(val.subarray(0, ATOM_INSTRUCTION_SIZE), instStart);
  },
  set_reg: (i: number, reg: number, val: number) => Atomics.store(views.contexts, i * ATOM_CONTEXT_SIZE + reg, val),
  set_p_c: (i: number, val: number) => Atomics.store(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, val),
  setReg: (i: number, reg: number, val: number) => Atomics.store(views.contexts, i * ATOM_CONTEXT_SIZE + reg, val),
  setPC: (i: number, val: number) => Atomics.store(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, val),

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
    views.instructions.fill(0, i * ATOM_INSTRUCTION_SIZE, i * ATOM_INSTRUCTION_SIZE + ATOM_INSTRUCTION_SIZE);
    views.contexts.fill(0, i * ATOM_CONTEXT_SIZE, i * ATOM_CONTEXT_SIZE + ATOM_CONTEXT_SIZE);
  },

  clear: () => {
    views.latticeClearView.fill(0);
    views.semanticBonuses.fill(0);
  },
  getActiveIndices: () => {
    const active: number[] = [];
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) !== 0n) active.push(i);
    }
    return active;
  },
  getTopResonantIndices: (count: number) => {
    const limit = Math.max(0, Math.min(MAX_ATOMS, Math.trunc(count)));
    if (limit === 0) return [];

    const top: Array<{ idx: number; resonance: number }> = [];
    for (let i = 0; i < MAX_ATOMS; i++) {
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
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) return i;
    }
    return -1;
  },
  findEmptySlot: (): number => {
    for (let i = 1; i < MAX_ATOMS; i++) {
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
    Atomics.store(views.energies, i, Math.round(energy * SCALE));
    Atomics.store(views.resonances, i, Math.trunc(resonance));
    Atomics.store(views.phases, i, 0);
    Atomics.store(views.roles, i, 0);
    Atomics.store(views.semanticBonuses, i, 0);

    if (logicVal) views.logic.set(logicVal, i * 8);

    const boot = script || DEFAULT_BOOT_SCRIPT;
    views.instructions.set(boot, i * ATOM_INSTRUCTION_SIZE);

    for (let r = 0; r < ATOM_CONTEXT_SIZE; r++) Atomics.store(views.contexts, i * ATOM_CONTEXT_SIZE + r, 0);
    Atomics.store(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, 0);
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
    ATOM_ACCESS.set_role(i, ATOM_ACCESS.ROLE_GUARDIAN);
  },

  getGuardianScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = OP_GET;
    script[pc++] = 0;
    script[pc++] = PROP_NEURAL_COHERENCE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = GUARDIAN_COHERENCE_THRESHOLD;
    script[pc++] = OP_SUB;
    script[pc++] = 1;
    script[pc++] = 0;
    script[pc++] = OP_JNZ;
    script[pc++] = 1;
    script[pc++] = 22;

    script[pc++] = OP_SIGNAL;
    script[pc++] = OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS_SET_ROLE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = 2;
    script[pc++] = OP_SYSCALL;
    script[pc++] = OP_JMP;
    script[pc++] = 0;

    script[pc++] = OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS_SET_ROLE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = 3;
    script[pc++] = OP_SYSCALL;
    script[pc++] = OP_BUILD;
    script[pc++] = 0;
    script[pc++] = 0;
    script[pc++] = OP_JMP;
    script[pc++] = 0;

    return script;
  },

  getArchitectScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = OP_BUILD;
    script[pc++] = 0;
    script[pc++] = 0;
    script[pc++] = OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS_SET_ROLE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = 3;
    script[pc++] = OP_SYSCALL;
    script[pc++] = OP_JMP;
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
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) !== 0n) {
        const current = Atomics.load(views.energies, i);
        Atomics.store(views.energies, i, current + Math.round(amount * SCALE));
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
  get_hormone: (id: number) => Atomics.load(views.hormones, id),
  setHormone: (id: number, val: number) => Atomics.store(views.hormones, id, val),
};
