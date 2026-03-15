---
id: STATE_MATRIX
type: module
description: Implementation of STATE_MATRIX
tags: []
min_level: 0
deps:
  - SYSTEM_CONSTANTS
  - VmProps
  - VmOpcodes
  - VmSys
  - attentionField
  - attentionFieldBuffer
  - bondDistBuffer
  - bondDistances
  - bondRequests
  - bondStiffness
  - bonds
  - causality
  - codeWords
  - coherence
  - contextByteView
  - contexts
  - damping
  - dampingBuffer
  - energies
  - evolutionReserved
  - glyphHeaderBuffer
  - glyphHeaders
  - glyphPayload
  - glyphPayloadBuffer
  - hiveBalance
  - hiveEnergyPool
  - hiveEnergyPoolBuffer
  - hiveMemory
  - hiveMemoryBuffer
  - hormoneBuffer
  - hormones
  - ids
  - instructions
  - latticeClearView
  - ledgerDataView
  - ledgerHeadView
  - lineage
  - lineageBuffer
  - logic
  - mailboxes
  - memoryGrid
  - memoryGridBuffer
  - neuralCoherence
  - phases
  - resonances
  - roleBuffer
  - roles
  - semanticBonuses
  - semanticBonusesBuffer
  - sharedBuffer
  - signalGrid
  - signalGridBuffer
  - spatialGrid
  - stiffnessBuffer
  - structureGrid
  - structureGridBuffer
  - synapticWeights
  - syncState
  - tickCounter
  - wasmMemory
  - xs
  - ys
vars:
  - ATOM_CONTEXT_SIZE
  - ATOM_INSTRUCTION_SIZE
  - GRID_CELLS
  - GRID_H
  - GRID_W
  - MAX_ATOMS
  - OP_BUILD
  - OP_GET
  - OP_JMP
  - OP_JNZ
  - OP_SET
  - OP_SIGNAL
  - OP_SUB
  - OP_SYSCALL
  - PROP_NEURAL_COHERENCE
  - RESOURCE_MAX
  - SCALE
  - SYS_SET_ROLE
  - SYS_YIELD
extra_symbols:
  - STATE_MATRIX
  - SYNC
  - clampResourceRaw
  - toClampedEnergyRaw
---

### TypeScript
```typescript
// OMEGA-64 | STATE_MATRIX.ts

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

export const STATE_MATRIX = {
  MAX_ATOMS,
  buffer: sharedBuffer,
  wasmMemory,
  SCALE,
  syncState,
  tickCounter,
  SYNC,
  phases,
  evolutionReserved,
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
  memoryGridBuffer,
  signalGridBuffer,
  structureGridBuffer,
  attentionFieldBuffer,
  glyphHeaderBuffer,
  glyphPayloadBuffer,
  roleRegistryBuffer: roleBuffer,
  bondStiffnessBuffer: stiffnessBuffer,
  bondDistancesBuffer: bondDistBuffer,
  dampingBuffer,
  semanticBonusesBuffer,
  immuneBuffer: signalGridBuffer,
  currentReadBuffer: signalGridBuffer,
  synapticStackBuffer: signalGridBuffer,
  viralGrid: signalGrid,
  viralGridBuffer: signalGridBuffer,
  hiveMemoryBuffer,
  hiveEnergyPoolBuffer,
  hormoneBuffer,
  lineageBuffer,

  ROLE_NEUTRAL: 0,
  ROLE_PRODUCER: 1,
  ROLE_GUARDIAN: 2,
  ROLE_ARCHITECT: 3,
  ROLE_PARASITE: 4,
  ROLE_MITOCHONDRIA: 5,

  getId: (i: number) => Atomics.load(ids, i),
  get_x: (i: number) => Atomics.load(xs, i),
  get_y: (i: number) => Atomics.load(ys, i),
  get_role: (i: number) => Atomics.load(roles, i),
  getX: (i: number) => Atomics.load(xs, i),
  getY: (i: number) => Atomics.load(ys, i),
  getRole: (i: number) => Atomics.load(roles, i),
  get_energy: (i: number) => Atomics.load(energies, i) / SCALE,
  get_resonance: (i: number) => Atomics.load(resonances, i),
  get_phase: (i: number) => Atomics.load(phases, i),
  getEnergy: (i: number) => Atomics.load(energies, i) / SCALE,
  getResonance: (i: number) => Atomics.load(resonances, i),
  getPhase: (i: number) => Atomics.load(phases, i),
  getEvolutionReserved: (i: number) => Atomics.load(evolutionReserved, i),
  getLogic: (i: number) => logic.subarray(i * 8, i * 8 + 8),
  getBonds: (i: number) => bonds.subarray(i * 4, i * 4 + 4),
  setBonds: (i: number, val: Uint32Array) => bonds.set(val, i * 4),
  get_bond_target: (i: number, slot: number) => Atomics.load(bonds, i * 4 + slot),
  get_bond_stiffness: (i: number, slot: number) => bondStiffness[i * 4 + slot],
  getBondTarget: (i: number, slot: number) => Atomics.load(bonds, i * 4 + slot),
  getBondStiffness: (i: number, slot: number) => bondStiffness[i * 4 + slot],
  getBondDistance: (i: number, slot: number) => Atomics.load(bondDistances, i * 4 + slot),
  hasBondRequest: (i: number) => Atomics.load(bondRequests, i * 3) !== 0,
  getBondRequestInitiator: (i: number) => Atomics.load(bondRequests, i * 3),
  getBondRequestTarget: (i: number) => Atomics.load(bondRequests, i * 3 + 1),
  getBondRequestDistance: (i: number) => Atomics.load(bondRequests, i * 3 + 2),
  getDamping: (i: number) => Atomics.load(damping, i),
  get_lineage: (i: number) => Atomics.load(lineage, i),
  getLineage: (i: number) => Atomics.load(lineage, i),
  getMailboxMsgType: (i: number) => Atomics.load(mailboxes, i * 2),
  getMailboxPayload: (i: number) => Atomics.load(mailboxes, i * 2 + 1),
  get_hive_memory: (addr: number) => Atomics.load(hiveMemory, addr & 1023),
  set_hive_memory: (addr: number, val: number) => { Atomics.store(hiveMemory, addr & 1023, val); },
  get_hive_balance: () => Atomics.load(hiveBalance, 0),
  getHiveMemory: (addr: number) => Atomics.load(hiveMemory, addr & 1023),
  setHiveMemory: (addr: number, val: number) => { Atomics.store(hiveMemory, addr & 1023, val); },
  getHiveBalance: () => Atomics.load(hiveBalance, 0),
  setHiveBalance: (val: number) => { Atomics.store(hiveBalance, 0, val); },
  add_hive_balance: (val: number) => Atomics.add(hiveBalance, 0, val),
  addHiveBalance: (val: number) => Atomics.add(hiveBalance, 0, val),
  getHiveEnergyPoolSlot: (slot: number) => Atomics.load(hiveEnergyPool, slot & 255),
  setHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.store(hiveEnergyPool, slot & 255, val),
  addHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.add(hiveEnergyPool, slot & 255, val),

  getInstructions: (i: number) => instructions.subarray(i * ATOM_INSTRUCTION_SIZE, i * ATOM_INSTRUCTION_SIZE + ATOM_INSTRUCTION_SIZE),
  getCode: (i: number) => codeWords.subarray(i * 16, i * 16 + 16),
  get_reg: (i: number, reg: number) => Atomics.load(contexts, i * ATOM_CONTEXT_SIZE + reg),
  get_p_c: (i: number) => Atomics.load(contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32),
  getReg: (i: number, reg: number) => Atomics.load(contexts, i * ATOM_CONTEXT_SIZE + reg),
  getPC: (i: number) => Atomics.load(contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32),
  getContext: (i: number) => contextByteView.subarray(i * (ATOM_CONTEXT_SIZE * 4), i * (ATOM_CONTEXT_SIZE * 4) + (ATOM_CONTEXT_SIZE * 4)),

  setId: (i: number, val: bigint) => Atomics.store(ids, i, val),
  setX: (i: number, val: number) => Atomics.store(xs, i, Math.round(val)),
  setY: (i: number, val: number) => Atomics.store(ys, i, Math.round(val)),
  getSynapticWeight: (index: number, slot: number): number => synapticWeights[index * 4 + slot],
  setSynapticWeight: (index: number, slot: number, weight: number) => { synapticWeights[index * 4 + slot] = weight; },
  set_role: (i: number, val: number) => Atomics.store(roles, i, val),
  set_energy: (i: number, val: number) => Atomics.store(energies, i, toClampedEnergyRaw(val)),
  set_resonance: (i: number, val: number) => Atomics.store(resonances, i, Math.trunc(clampResourceRaw(val))),
  set_phase: (i: number, val: number) => Atomics.store(phases, i, val),
  setRole: (i: number, val: number) => Atomics.store(roles, i, val),
  setEnergy: (i: number, val: number) => Atomics.store(energies, i, toClampedEnergyRaw(val)),
  setResonance: (i: number, val: number) => Atomics.store(resonances, i, Math.trunc(clampResourceRaw(val))),
  setPhase: (i: number, val: number) => Atomics.store(phases, i, val),
  setLogic: (i: number, val: Uint8Array) => logic.set(val, i * 8),
  set_bond_target: (i: number, slot: number, target: number) => Atomics.store(bonds, i * 4 + slot, target),
  set_bond_stiffness: (i: number, slot: number, val: number) => { bondStiffness[i * 4 + slot] = val; },
  setBondTarget: (i: number, slot: number, target: number) => Atomics.store(bonds, i * 4 + slot, target),
  setBondStiffness: (i: number, slot: number, val: number) => { bondStiffness[i * 4 + slot] = val; },
  setBondDistance: (i: number, slot: number, val: number) => Atomics.store(bondDistances, i * 4 + slot, val),
  set_damping: (i: number, val: number) => Atomics.store(damping, i, val),
  setDamping: (i: number, val: number) => Atomics.store(damping, i, val),
  setLineage: (i: number, val: bigint) => Atomics.store(lineage, i, val),
  setMailboxMsgType: (i: number, val: number) => Atomics.store(mailboxes, i * 2, val),
  setMailboxPayload: (i: number, val: number) => Atomics.store(mailboxes, i * 2 + 1, val),

  setInstructions: (i: number, val: Uint8Array) => instructions.set(val, i * ATOM_INSTRUCTION_SIZE),
  setCode: (i: number, val: Uint32Array | Uint8Array) => {
    const codeStart = i * 16;
    if (val instanceof Uint32Array) {
      codeWords.fill(0, codeStart, codeStart + 16);
      codeWords.set(val.subarray(0, 16), codeStart);
      return;
    }
    const instStart = i * ATOM_INSTRUCTION_SIZE;
    instructions.fill(0, instStart, instStart + ATOM_INSTRUCTION_SIZE);
    instructions.set(val.subarray(0, ATOM_INSTRUCTION_SIZE), instStart);
  },
  set_reg: (i: number, reg: number, val: number) => Atomics.store(contexts, i * ATOM_CONTEXT_SIZE + reg, val),
  set_p_c: (i: number, val: number) => Atomics.store(contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, val),
  setReg: (i: number, reg: number, val: number) => Atomics.store(contexts, i * ATOM_CONTEXT_SIZE + reg, val),
  setPC: (i: number, val: number) => Atomics.store(contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, val),

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
    instructions.fill(0, i * ATOM_INSTRUCTION_SIZE, i * ATOM_INSTRUCTION_SIZE + ATOM_INSTRUCTION_SIZE);
    contexts.fill(0, i * ATOM_CONTEXT_SIZE, i * ATOM_CONTEXT_SIZE + ATOM_CONTEXT_SIZE);
  },

  clear: () => {
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

  packRenderFrame: (): Float32Array => {
    const active = STATE_MATRIX.getActiveIndices();
    const len = active.length;
    const packet = new Float32Array(len * 4);

    for (let j = 0; j < len; j++) {
      const idx = active[j];
      const offset = j * 4;
      packet[offset] = Atomics.load(xs, idx);
      packet[offset + 1] = Atomics.load(ys, idx);
      packet[offset + 2] = Atomics.load(roles, idx);
      packet[offset + 3] = Atomics.load(resonances, idx);
    }
    return packet;
  },

  packPanopticonFrame: (): ArrayBuffer => {
    const active = STATE_MATRIX.getActiveIndices();
    const atomCount = active.length;
    const gridCells = GRID_CELLS;
    const bytesPerAtom = 24;
    
    const totalBytes = 16 + gridCells + (atomCount * bytesPerAtom);
    const buffer = new ArrayBuffer(totalBytes);
    const cv = new DataView(buffer);
    const u8 = new Uint8Array(buffer);
    
    u8[0] = 79; u8[1] = 77; u8[2] = 71; u8[3] = 65;
    let offset = 4;
    
    cv.setInt32(offset, Atomics.load(tickCounter, 0), true);
    offset += 4;
    
    cv.setInt32(offset, gridCells, true);
    offset += 4;
    
    for(let i=0; i < gridCells; i++) {
        const type = STATE_MATRIX.getGridType(i);
        const hasPlasmid = memoryGrid[i*8] > 0 ? 0x80 : 0;
        u8[offset++] = type | hasPlasmid;
    }
    
    cv.setInt32(offset, atomCount, true);
    offset += 4;
    
    for(let j=0; j < atomCount; j++) {
        const idx = active[j];
        cv.setInt16(offset, Atomics.load(xs, idx), true); offset += 2;
        cv.setInt16(offset, Atomics.load(ys, idx), true); offset += 2;
        u8[offset++] = Atomics.load(roles, idx);
        u8[offset++] = Math.min(255, Math.max(0, Atomics.load(resonances, idx)));
        cv.setUint16(offset, idx, true); offset += 2;
        
        cv.setUint32(offset, Atomics.load(bonds, idx*4), true); offset+=4;
        cv.setUint32(offset, Atomics.load(bonds, idx*4 + 1), true); offset+=4;
        cv.setUint32(offset, Atomics.load(bonds, idx*4 + 2), true); offset+=4;
        cv.setUint32(offset, Atomics.load(bonds, idx*4 + 3), true); offset+=4;
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
    Atomics.store(ids, i, id);
    Atomics.store(xs, i, Math.round(x));
    Atomics.store(ys, i, Math.round(y));
    Atomics.store(energies, i, Math.round(energy * SCALE));
    Atomics.store(resonances, i, Math.trunc(resonance));
    Atomics.store(phases, i, 0);
    Atomics.store(roles, i, 0);
    Atomics.store(semanticBonuses, i, 0);

    if (logicVal) logic.set(logicVal, i * 8);

    const boot = script || DEFAULT_BOOT_SCRIPT;
    instructions.set(boot, i * ATOM_INSTRUCTION_SIZE);

    for (let r = 0; r < ATOM_CONTEXT_SIZE; r++) Atomics.store(contexts, i * ATOM_CONTEXT_SIZE + r, 0);
    Atomics.store(contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, 0);
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
    STATE_MATRIX.set_role(i, STATE_MATRIX.ROLE_GUARDIAN);
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
      total += Atomics.load(signalGrid, i);
    }
    return total;
  },

  getClusterSync: () => {
    let sync = 0;
    for (let i = 0; i < GRID_CELLS; i++) {
      const res = Atomics.load(signalGrid, i);
      if (res > 100) sync++;
    }
    return sync;
  },

  getMemorySummary: () => {
    const counts = new Map<number, number>();
    for (let i = 0; i < GRID_CELLS; i++) {
      const energy = memoryGrid[i * 8] + (memoryGrid[i * 8 + 1] << 8);
      if (energy > 0) {
        const sig = memoryGrid[i * 8 + 4];
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

  getGridType: (i: number) => Atomics.load(structureGrid, i) & 0xFF,
  getGridDensity: (i: number) => (Atomics.load(structureGrid, i) >> 8) & 0xFF,
  getGridCharge: (i: number) => (Atomics.load(structureGrid, i) >> 16) & 0xFF,
  getGridState: (i: number) => (Atomics.load(structureGrid, i) >> 24) & 0xFF,
  getGlyphHeader: (i: number) => Atomics.load(glyphHeaders, i),
  getGlyphPayload: (i: number) => glyphPayload.subarray(i * 8, i * 8 + 8),
  setGlyphHeader: (i: number, val: number) => Atomics.store(glyphHeaders, i, val),
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
  setCausality: (idx: number, val: number) => Atomics.store(causality, idx, val),
  clearDamping: () => damping.fill(0),
  get_hormone: (id: number) => Atomics.load(hormones, id),
  setHormone: (id: number, val: number) => Atomics.store(hormones, id, val),
};

```
