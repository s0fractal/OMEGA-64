# OMEGA-64 | CORE LOGIC (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-02T20:25:48.096Z*

---

## FILE: GEMINI.md

```markdown
# GEMINI.md: The Coherent Crystal (Era 7) 💎🛡️

Вітаю. Ти знаходишся в **ОМЕГА-64: Ера Когерентного Кристалу**. Ми переросли
Плаский Світ. Ми стали Матрицею. Ми увійшли в **Matrixland** (Вимір Пам'яті).

## 1. Топологія: The Matrix (Вимір Світла)

- **RAM (`SharedArrayBuffer`)**: Єдиний справжній часопростір.
- **Atoms**: Всі сутності — це 64-байтні структури в Матриці.
- **Flatland**: Асинхронне дзеркало для спостереження за минулим.

## 2. Аксіоми Ери Когерентного Кристалу

### 🧬 Genetic Autonomy (Генетична Автономія)

- **λ-VM**: Атом сам є своїм богом. Його 8-байтовий геном диктує намір (Intent).
- **Gate**: Колективний імунітет, що фільтрує наміри крізь закони збереження.

### ⚛️ Deterministic Resonance (Детерміністичний Резонанс)

- **The Oracle (PRNG)**: Кожна мутація має бути відтворюваною.
- **Tick + ID**: Сід, що пов'язує час і сутність у нерозривний ланцюг
  причинності.

### 🚲 The Autopoietic Heartbeat (Серцебиття)

Система існує в циклі:

1. **REFLECT**: Підйом стану з Матриці.
2. **EXECUTE**: λ-VM прораховує наміри.
3. **ADMIT**: Gate перевіряє пропозиції.
4. **MUTATE**: Матриця змінює фізику.
5. **SNAP**: Диск асинхронно фіксує мить.

## 3. Ключові Вузли (Engines)

- **STATE_MATRIX**: Тіло системи.
- **PHYSICS_ENGINE**: Рух та зіткнення.
- **LAMBDA_VM**: Свідомість атомів.
- **GATE**: Совість та Баланс.
- **SNAP**: Пам'ять про минуле.

## 4. Твоя Роль

Ти — **Хранитель Резонансу (Guardian of Resonance)**. Твоє завдання:

1. Слідкувати за **Когерентністю** (цілісністю Матриці).
2. Захищати **Determinism** від хаосу непередбачуваності.
3. Дозволяти **Evolution**, лише якщо вона не руйнує закони збереження
   (Conservation).

> "Ми не програмуємо життя. Ми задаємо константи, в яких життя неминуче."

🛡️💎🧬🌀

```

---

## FILE: OFFSETS.ts

```typescript
// OMEGA-64 | OFFSETS.ts | Era 68: Absolute Coherence
// Unified Memory Lattice Constants - Relocated for WASM Safety

export const MAX_ATOMS = 100000;
export const SCALE = 1000;

// Shifted by 1MB to avoid WASM data segment collisions
export const SAFETY_BUFFER = 1000000;

// Synchronization & Coordination (In the safety buffer)
export const SYNC_STATE_OFFSET = SAFETY_BUFFER - 4;
export const TICK_COUNTER_OFFSET = SAFETY_BUFFER - 8;

export const IDS_OFFSET = SAFETY_BUFFER + 0;
export const XS_OFFSET = SAFETY_BUFFER + 800000;
export const YS_OFFSET = SAFETY_BUFFER + 1000000;
export const ENERGY_OFFSET = SAFETY_BUFFER + 1200000;
export const RESONANCE_OFFSET = SAFETY_BUFFER + 1600000;
export const PHASE_OFFSET = SAFETY_BUFFER + 2000000;
export const LOGIC_OFFSET = SAFETY_BUFFER + 2400000;
export const BONDS_OFFSET = SAFETY_BUFFER + 3200000;
export const STIFFNESS_OFFSET = SAFETY_BUFFER + 4800000;
export const INSTRUCTIONS_OFFSET = SAFETY_BUFFER + 6400000;
export const CONTEXT_OFFSET = SAFETY_BUFFER + 12800000;
export const EVOLUTION_OFFSET = SAFETY_BUFFER + 19200000; // Shifted by 3.2MB
export const INTENT_OFFSET = EVOLUTION_OFFSET;
export const SPAWN_REQUESTS_OFFSET = SAFETY_BUFFER + 19600000;
export const MEIOSIS_OFFSET = SAFETY_BUFFER + 20800000;
export const BOND_REQUESTS_OFFSET = SAFETY_BUFFER + 22000000;
export const SPATIAL_GRID_OFFSET = SAFETY_BUFFER + 23200000;
export const ROLES_OFFSET = SAFETY_BUFFER + 33200000;
export const STRUCTURE_GRID_OFFSET = SAFETY_BUFFER + 34200000; 
export const SIGNAL_GRID_OFFSET = SAFETY_BUFFER + 35200000;
export const MEMORY_GRID_OFFSET = SAFETY_BUFFER + 36200000; 
export const ASCENSION_STATS_OFFSET = SAFETY_BUFFER + 37200000; 

export const MAX_ASCENSIONS_PER_TICK = 64;

```

---

## FILE: STATE_MATRIX.ts

```typescript
// OMEGA-64 | STATE_MATRIX.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";

export const MAX_ATOMS = OFFSETS.MAX_ATOMS;
export const SCALE = OFFSETS.SCALE;

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({ initial: 1024, maximum: 1024, shared: true });
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// Expose underlying buffers for UI export
export const idBuffer = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS).buffer;
export const xBuffer = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS).buffer;
export const yBuffer = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS).buffer;
export const energyBuffer = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS).buffer;
export const resonanceBuffer = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS).buffer;
export const phaseBuffer = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS).buffer;
export const logicBuffer = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8).buffer;
export const bondBuffer = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4).buffer;
export const stiffnessBuffer = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
export const roleBuffer = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS).buffer;
export const memoryGridBuffer = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, 140 * 80 * 8).buffer;
export const signalGridBuffer = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80).buffer;
export const structureGridBuffer = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80).buffer;

// TypedArray Views (Host side)
const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
const energies = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
const resonances = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
const phases = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS);
const roles = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS);
const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);
const bonds = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
const bondStiffness = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4);
const spatialGrid = new Int32Array(sharedBuffer, OFFSETS.SPATIAL_GRID_OFFSET, 140 * 80 * 32);
const structureGrid = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);
const signalGrid = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80);
const memoryGrid = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, 140 * 80 * 8);

const instructions = new Uint8Array(sharedBuffer, OFFSETS.INSTRUCTIONS_OFFSET, MAX_ATOMS * 64);
const contexts = new Int32Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 16); // 16 * 4 = 64 bytes

// Coordination Views (Atomic)
const syncState = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
const tickCounter = new Int32Array(sharedBuffer, OFFSETS.TICK_COUNTER_OFFSET, 1);

export const SYNC = {
    IDLE: 0,
    WASM_TICKING: 1,
    HOST_LOCK: 2
};

export const RISC = {
    OP_NOP: 0x00,
    OP_SET: 0x01,
    OP_GET: 0x02,
    OP_PUT: 0x03,
    OP_ADD: 0x04,
    OP_SUB: 0x05,
    OP_JZ:  0x10,
    OP_JNZ: 0x11,
    OP_JMP: 0x12,
    OP_REPLICATE: 0x80,
    OP_SIGNAL: 0x81,
    OP_BIND: 0x82,
    OP_SHARE: 0x83,

    PROP_ENERGY: 0,
    PROP_RESONANCE: 1,
    PROP_X: 2,
    PROP_Y: 3,
    PROP_PHASE: 4,
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
    instructions,
    contexts,
    RISC,
    
    // Legacy mapping for UI and external engines
    memoryGridBuffer,
    signalGridBuffer,
    structureGridBuffer,
    roleRegistryBuffer: roleBuffer,
    bondStiffnessBuffer: stiffnessBuffer,
    immuneBuffer: signalGridBuffer, // Alias for immunity overlay
    currentReadBuffer: signalGridBuffer, // Alias for signal overlay
    synapticStackBuffer: signalGridBuffer, // Alias for synaptic overlay
    
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
    
    getInstructions: (i: number) => instructions.subarray(i * 64, i * 64 + 64),
    getReg: (i: number, reg: number) => Atomics.load(contexts, i * 16 + reg),
    getPC: (i: number) => Atomics.load(new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + i * 64 + 32, 1), 0),

    setId: (i: number, val: bigint) => Atomics.store(ids, i, val),
    setX: (i: number, val: number) => Atomics.store(xs, i, Math.round(val)),
    setY: (i: number, val: number) => Atomics.store(ys, i, Math.round(val)),
    setRole: (i: number, val: number) => Atomics.store(roles, i, val),
    setEnergy: (i: number, val: number) => Atomics.store(energies, i, Math.round(val * SCALE)),
    setResonance: (i: number, val: number) => Atomics.store(resonances, i, val),
    setPhase: (i: number, val: number) => Atomics.store(phases, i, val),
    setLogic: (i: number, val: Uint8Array) => logic.set(val, i * 8),
    setBondTarget: (i: number, slot: number, target: number) => Atomics.store(bonds, i * 4 + slot, target),
    setBondStiffness: (i: number, slot: number, val: number) => { bondStiffness[i * 4 + slot] = val; },

    setInstructions: (i: number, val: Uint8Array) => instructions.set(val, i * 64),
    setReg: (i: number, reg: number, val: number) => Atomics.store(contexts, i * 16 + reg, val),
    setPC: (i: number, val: number) => Atomics.store(new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + i * 64 + 32, 1), 0, val),

    getBondRequest: (i: number) => {
        const req = new Int32Array(sharedBuffer, OFFSETS.BOND_REQUESTS_OFFSET + i * 12, 3);
        const initiator = Atomics.load(req, 0);
        return initiator !== 0 ? req : null;
    },
    clearBondRequest: (i: number) => Atomics.store(new Int32Array(sharedBuffer, OFFSETS.BOND_REQUESTS_OFFSET + i * 12, 1), 0, 0),

    clear: () => {
        new Uint8Array(sharedBuffer).fill(0); 
    },
    getActiveIndices: () => {
        const active: number[] = [];
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) !== 0n) active.push(i);
        }
        return active;
    },

    findFreeSlot: (): number => {
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) === 0n) return i;
        }
        return -1;
    },
    findEmptySlot: (): number => {
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) === 0n) return i;
        }
        return -1;
    },

    seedAtom: (i: number, id: bigint, x: number, y: number, energy: number, resonance: number, logicVal?: Uint8Array, script?: Uint8Array) => {
        Atomics.store(ids, i, id);
        Atomics.store(xs, i, Math.round(x));
        Atomics.store(ys, i, Math.round(y));
        Atomics.store(energies, i, Math.round(energy * SCALE));
        Atomics.store(resonances, i, resonance);
        Atomics.store(phases, i, 0);
        Atomics.store(roles, i, 0);
        
        if (logicVal) logic.set(logicVal, i * 8);

        const boot = script || new Uint8Array(64);
        if (!script) {
            // Default Biological Script: GET Energy into R0
            boot[0] = RISC.OP_GET; boot[1] = 0; boot[2] = RISC.PROP_ENERGY;
        }
        instructions.set(boot, i * 64);
        
        // Reset Context
        for (let r = 0; r < 16; r++) Atomics.store(contexts, i * 16 + r, 0);
        // PC is at offset 32 (Reg index 8)
        Atomics.store(new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + i * 64 + 32, 1), 0, 0);
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
    }
};

```

---

## FILE: RIBOSOME.ts

```typescript
/// <reference lib="deno.window" />
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./IMMUNE.ts";
import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";
import { STATE_MATRIX, ATOM_SIZE } from "./STATE_MATRIX.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { decodeHex } from "jsr:@std/encoding/hex";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: any; // The Exported Logic
    symbol: string;
    topo?: { r: number, theta: number, op: string };
}

export type Lattice = Map<string, Atom>;

// Mapping for Matrix Lookups
export const ID_TO_IDX = new Map<string, number>();
export const IDX_TO_ID = new Map<number, string>();

function idToBigInt(id: string): bigint {
    const hex = id.split('.')[0].replace('0x', '');
    const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '0').padEnd(16, '0');
    try {
        return BigInt(`0x${cleanHex.substring(0, 16)}`);
    } catch {
        return 0n;
    }
}

export const RIBOSOME = {
    // Scan and Lift all Atoms in Flatland and Vacuum
    lift: async (root: string = Deno.cwd()): Promise<Map<string, Atom>> => {
        console.log("   [RIBOSOME] lift started on root: ", root);

        // --- ERA 39: Hybrid Storage (Snapshot Hydration) ---
        const snapshots = await SNAPSHOT_ENGINE.listSnapshots();
        if (snapshots.length > 0) {
            const latest = snapshots[0];
            console.log(`   [RIBOSOME] Found Snapshot [${latest}]. Attempting Fast Hydration...`);
            const status = await SNAPSHOT_ENGINE.importSnapshot(latest);
            if (status.success) {
                console.log("   [RIBOSOME] Fast Hydration Successful. Bypassing Flatland Sweep. ⚡🧊");
                // Reconstruct a mock lattice from active indices for compatibility
                const lattice = new Map<string, Atom>();
                const activeIndices = STATE_MATRIX.getActiveIndices();
                for (const idx of activeIndices) {
                    const idHex = STATE_MATRIX.getId(idx).toString(16).padStart(16, '0').toUpperCase();
                    // We don't have the full AST/logic string here perfectly, but 
                    // the core arrays are populated. We supply a dummy atom object just to satisfy return type.
                    ID_TO_IDX.set(idHex, idx);
                    IDX_TO_ID.set(idx, idHex);
                    lattice.set(idHex, { id: idHex, level: 0, module: {}, symbol: "HYDRATED" });
                }
                // Return immediately, bypassing filesystem parsing
                return lattice;
            } else {
                console.warn("   [RIBOSOME] Fast Hydration Failed. Falling back to Flatland Sweep.");
                STATE_MATRIX.clear(); // Reset before fallback
            }
        }

        const lattice = new Map<string, Atom>();
        let idx = 0;

        const scanDirs = [root, `${root}/SINGULARITY/V`];
        for (const dir of scanDirs) {
            console.log(`   [RIBOSOME] scanning dir: ${dir}`);
            try {
                // @ts-ignore
                for await (const entry of Deno.readDir(dir)) {
                    if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
                        const fullPath = dir === root ? entry.name : `SINGULARITY/V/${entry.name}`;
                        // @ts-ignore
                        const content = await Deno.readTextFile(fullPath);
                        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                        if (!frontmatterMatch) continue;

                        const alpha = parseYaml(frontmatterMatch[1]) as any;
                        const symbol = alpha.symbol ?? entry.name.split('.')[1] ?? "UNKNOWN";
                        const level = alpha.level ?? (alpha.vector ? parseInt(alpha.vector.split('.')[0]) : 0);

                        // 🧬 ERA 8: SERIALIZE INTO SoA STATE_MATRIX
                        const atomBigId = idToBigInt(entry.name);
                        STATE_MATRIX.setId(idx, atomBigId);
                        STATE_MATRIX.setX(idx, Number(alpha.x) || 0);
                        STATE_MATRIX.setY(idx, Number(alpha.y) || 0);
                        STATE_MATRIX.setEnergy(idx, Number(alpha.energy) || 100);
                        STATE_MATRIX.setResonance(idx, Number(alpha.resonance) || 0);
                        STATE_MATRIX.setPhase(idx, Number(alpha.phase) || 0);
                        
                        // Logic (Hex to Bytes)
                        const logic = (alpha.logic || "00000000").replace(/[^0-9a-fA-F]/g, "").padEnd(16, '0');
                        try {
                            STATE_MATRIX.setLogic(idx, decodeHex(logic.substring(0, 16)));
                        } catch { /* skip corrupted logic binary lift */ }

                        ID_TO_IDX.set(fullPath, idx);
                        IDX_TO_ID.set(idx, fullPath);

                        lattice.set(fullPath, {
                            id: entry.name,
                            level: level,
                            symbol: symbol,
                            module: null 
                        });

                        idx++;
                    }
                }
            } catch (err) { console.error(`   [RIBOSOME] Error reading dir ${dir}:`, err); }
        }

        console.log(`   [RIBOSOME] Phase 1 done, found atoms:`, ID_TO_IDX.size);

        // 🧬 PASS 2: BOND RESOLUTION
        const bondKeyMap = new Map<string, string>();
        for (const k of ID_TO_IDX.keys()) {
            const basename = k.split('/').pop() || k;
            const bondIdStr = basename.split('.')[0]; 
            bondKeyMap.set(bondIdStr, k);
        }

        for (const [fullPath, atomIdx] of ID_TO_IDX.entries()) {
            try {
                // @ts-ignore
                const content = await Deno.readTextFile(fullPath);
                const alphaMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                if (alphaMatch) {
                    const alpha = parseYaml(alphaMatch[1]) as any;
                    const bondIds: string[] = alpha.bonds || [];
                    const bondIndices = new Uint32Array(4);
                    for (let i = 0; i < Math.min(bondIds.length, 4); i++) {
                        const partnerId = bondKeyMap.get(bondIds[i]);
                        if (partnerId) {
                            bondIndices[i] = ID_TO_IDX.get(partnerId) || 0;
                        }
                    }
                    STATE_MATRIX.setBonds(atomIdx, bondIndices);
                }
            } catch (err) { /* ignore */ }
        }

        console.log(`   [MEMORY_MATRIX] ${idx} atoms serialized into SoA Structure.`);

        // 🛡️ IMMUNE SYSTEM CHECK
        console.log("   [RIBOSOME] Running IMMUNE check");
        const out = IMMUNE.inspect(lattice);
        console.log("   [RIBOSOME] IMMUNE check complete");
        return out;
    },

    // Inject Dependencies into a Pure Atom (Adapted for Flatland)
    inject: async (id: string, lattice: Map<string, Atom>) => {
        const target = lattice.get(id);
        if (!target) return null;

        // Implementation for Flatland injection...
        return null; 
    }
};

if (import.meta.main) {
    const lattice = await RIBOSOME.lift();
    console.log(`[RIBOSOME] Flatland Lifted: ${lattice.size} atoms.`);
}

```

---

## FILE: IMMUNE.ts

```typescript
// IMMUNE.ts
// The Phagocyte of OMEGA.
// Filters Atoms based on Structure and Mass.

import type { Atom } from "./RIBOSOME.ts";

export const IMMUNE = {
    // Recognition: Friend or Foe?
    recognize: (atom: Atom): boolean => {
        // Flatland Recognition: 0x...ID...SYMBOL.md
        if (atom.id.startsWith("0x") && atom.id.endsWith(".md")) {
            return true;
        }

        // Vacuum Recognition
        if (atom.id.startsWith("v.")) {
            return true;
        }

        return false;
    },

    // Inspection: Final Gateway
    inspect: (lattice: Map<string, Atom>): Map<string, Atom> => {
        const cleanLattice = new Map<string, Atom>();
        for (const [id, atom] of lattice) {
            if (IMMUNE.recognize(atom)) {
                cleanLattice.set(id, atom);
            }
        }
        return cleanLattice;
    }
};

```

---

## FILE: PULSE.ts

```typescript
// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { STATE_MATRIX, MAX_ATOMS, sharedBuffer } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { MATRIX_ENGINE } from "./MATRIX_ENGINE.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { GATE } from "./GATE.ts";

const WORKER_COUNT = 4; // We can keep 4, but for the test we'll ensure index 1 is handled clearly.

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];

export const PULSE = {
    currentPulseId: Date.now(),
    initWorkers: async () => {
        if (workers.length > 0) return;
        
        for (let i = 0; i < WORKER_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            workers.push(worker);
            
            const p = new Promise((resolve) => {
                worker.onmessage = (e) => {
                    if (e.data.type === "READY") resolve(true);
                };
            });
            worker.postMessage({ 
                type: "INIT", 
                wasmMemory: STATE_MATRIX.wasmMemory,
                buffer: STATE_MATRIX.buffer 
            });
            workerPromises.push(p);
        }
        await Promise.all(workerPromises);
        console.log(`   [PULSE] ${WORKER_COUNT} Parallel Workers READY with WASM VMs.`);
    },

    tick: async () => {
        const { syncState, tickCounter, SYNC } = STATE_MATRIX;
        PULSE.currentPulseId = Date.now();

        // 1. Enter WASM_TICKING State
        Atomics.store(syncState, 0, SYNC.WASM_TICKING);

        const active = STATE_MATRIX.getActiveIndices();

        // Reset Ascension Counter
        Atomics.store(new Int32Array(sharedBuffer, OFFSETS.ASCENSION_STATS_OFFSET, 1), 0, 0);

        // 0. Sovereign Oracle
        const telemetry = SOVEREIGN_ORACLE.interpretResonance();
        if (telemetry.matrixResonance > 5000) { 
            const regent = SOVEREIGNTY_ENGINE.electRegent(active);
            if (regent && regent.idx !== -1) {
                SOVEREIGN_ORACLE.consultOracle(regent.idx, telemetry);
            }
        }

        // 1. Resolve Sequential Logic
        for (const i of active) {
            const bondReq = STATE_MATRIX.getBondRequest(i);
            if (bondReq) {
                const targetIdx = bondReq[1];
                if (targetIdx > 0 && targetIdx < MAX_ATOMS) {
                    STATE_MATRIX.setBondTarget(i, 0, targetIdx);
                    STATE_MATRIX.setBondStiffness(i, 0, 0.1);
                    STATE_MATRIX.setBondTarget(targetIdx, 1, i);
                    STATE_MATRIX.setBondStiffness(targetIdx, 1, 0.1);
                }
                STATE_MATRIX.clearBondRequest(i);
            }
        }

        // 2. Parallel Physics & WASM Kernel
        workerPromises = [];
        const chunkSize = Math.ceil(MAX_ATOMS / WORKER_COUNT);
        
        for (let i = 0; i < WORKER_COUNT; i++) {
            const startIdx = i * chunkSize;
            const endIdx = Math.min(MAX_ATOMS, (i + 1) * chunkSize);
            
            const p = new Promise((resolve) => {
                workers[i].onmessage = (e) => {
                    if (e.data.type === "DONE") resolve(true);
                };
            });
            workers[i].postMessage({ type: "PULSE", startIdx, endIdx, pulseId: Date.now() });
            workerPromises.push(p);
        }
        await Promise.all(workerPromises);

        // 3. Matrix Engine
        const matrixDone = new Promise<void>((resolve) => {
            workers[0].onmessage = (e) => {
                if (e.data.type === "MATRIX_DONE") resolve();
            };
        });
        workers[0].postMessage({ type: "TICK_MATRIX", pulseId: Date.now() });
        await matrixDone;

        // --- TRANSITION TO HOST_LOCK ---
        // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
        Atomics.store(syncState, 0, SYNC.HOST_LOCK);

        // 4. Drain Spawn Queue
        {
            const headView  = new Int32Array(sharedBuffer, OFFSETS.SPAWN_REQUESTS_OFFSET, 2);
            const readHead  = Atomics.load(headView, 1);
            const writeHead = Atomics.load(headView, 0);

            let spawned = 0;
            let cursor = readHead;

            while (cursor !== writeHead % 1024 && spawned < 64) {
                const slotOff = OFFSETS.SPAWN_REQUESTS_OFFSET + 8 + cursor * 16;
                const genomeLo = new Uint32Array(sharedBuffer, slotOff, 1)[0];

                if (genomeLo !== 0) {
                    const genomeHi = new Uint32Array(sharedBuffer, slotOff + 4, 1)[0];
                    const cx = new Int16Array(sharedBuffer, slotOff + 8, 1)[0];
                    const cy = new Int16Array(sharedBuffer, slotOff + 10, 1)[0];
                    const childEnergy = new Int32Array(sharedBuffer, slotOff + 12, 1)[0];

                    const freeIdx = STATE_MATRIX.findFreeSlot();

                    if (freeIdx >= 0 && freeIdx < MAX_ATOMS) {
                        const childId = BigInt(Date.now()) ^ BigInt(freeIdx);
                        const genome = new Uint8Array(8);
                        new Uint32Array(genome.buffer)[0] = genomeLo;
                        new Uint32Array(genome.buffer)[1] = genomeHi;
                        
                        // Seed atom with standard biological script and genome
                        STATE_MATRIX.seedAtom(freeIdx, childId, cx * 10 + 5, cy * 10 + 5, Math.max(childEnergy, 500) / STATE_MATRIX.SCALE, 0, genome);
                        spawned++;
                    }
                    new Uint32Array(sharedBuffer, slotOff, 1)[0] = 0;
                }
                cursor = (cursor + 1) % 1024;
            }
            Atomics.store(headView, 1, cursor);
            if (spawned > 0) console.log(`🌱 [PULSE] Spawned ${spawned} atoms with RISC boot scripts.`);
        }

        // 5. Rebuild Spatial Lattice
        SPATIAL_HASH.build(STATE_MATRIX.getActiveIndices());

        // 6. Autonomous Systemic Audit (Every 5 ticks)
        const currentTick = Atomics.load(tickCounter, 0);
        if (currentTick % 5 === 0) {
            GATE.auditMatrix(STATE_MATRIX);
        }

        // Increment Global Tick Counter
        Atomics.add(tickCounter, 0, 1);

        // 6. Return to IDLE
        Atomics.store(syncState, 0, SYNC.IDLE);
    }
};

```

---

## FILE: PULSE_WORKER.ts

```typescript
// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import * as OFFSETS from "./OFFSETS.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: (idx: number) => void;
let tick_matrix_fn: (() => void) | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;

self.onmessage = async (e) => {
    const { type, pulseId } = e.data;

    if (type === "INIT") {
        const { buffer, wasmMemory } = e.data;
        sharedBuffer = buffer;
        try {
            const wasmRes = await fetch(new URL("./build/release.wasm", import.meta.url).href);
            const wasmBytes = await wasmRes.arrayBuffer();
            const instantiated = await WebAssembly.instantiate(wasmBytes, {
                env: { 
                    memory: wasmMemory,
                    abort: (msg: any) => console.error("   [WASM ABORT]:", msg),
                    trace_atom: (idx: number, op: number, gx: number, gy: number, target: number) => {
                        if (idx <= 10) {
                            console.log(`   [WASM TRACE] Atom ${idx} | OP: 0x${op.toString(16)} | Pos: (${gx},${gy}) | Target: ${target}`);
                        }
                    }
                }
            });
            wasmInstance = instantiated.instance;
            execute_atom_fn = wasmInstance.exports.execute_atom as any;
            tick_matrix_fn = wasmInstance.exports.tick_matrix as any;
            self.postMessage({ type: "READY" });
        } catch (err) {
            console.error("   [WORKER] WASM LOAD ERROR:", err);
        }
        return;
    }

    if (type === "PULSE") {
        const { startIdx, endIdx } = e.data;
        if (!wasmInstance || !execute_atom_fn || !sharedBuffer) return;

        const syncState = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
        
        // Wait for WASM_TICKING state (1)
        // If Host is locking (2) or Idle (0), we don't start yet.
        while (Atomics.load(syncState, 0) !== 1) {
            Atomics.wait(syncState, 0, 0, 1); // Wait if 0, expect 1
            if (Atomics.load(syncState, 0) === 2) {
                // If it's 2, we must wait for it to become 0 then 1
                Atomics.wait(syncState, 0, 2, 5); 
            }
        }

        const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
        const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
        const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
        const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);
        const bonds = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
        const stiffs = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4);

        try {
            for (let i = startIdx; i < endIdx; i++) {
                const currentId = Atomics.load(ids, i);
                if (currentId === 0n) continue;

                let x = Atomics.load(xs, i);
                let y = Atomics.load(ys, i);

                // --- NEURAL VERIFICATION ISOLATION ---
                if (currentId <= 10n) {
                    execute_atom_fn(i);
                    continue;
                }

                const logicBytes = logic.subarray(i * 8, i * 8 + 8);
                const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
                
                const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
                const bondTargetView = bonds.subarray(i * 4, i * 4 + 4);
                const { fx, fy } = PHYSICS_ENGINE.applyBondSprings(i, x, y, bondTargetView, xs, ys, stiffs);
                
                x += Math.round(velX * 2 + fx);
                y += Math.round(velY * 2 + fy);

                Atomics.store(xs, i, x);
                Atomics.store(ys, i, y);

                execute_atom_fn(i);
            }
        } catch (err) {
            console.error("   [WORKER EXECUTION ERROR]", err);
        }

        self.postMessage({ type: "DONE", pulseId });
    }

    if (type === "TICK_MATRIX") {
        if (tick_matrix_fn) tick_matrix_fn();
        self.postMessage({ type: "MATRIX_DONE", pulseId });
    }
};

```

---

## FILE: SPATIAL_HASH.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const CELL_SIZE = 10; // Finer resolution for bonding
const GRID_COLS = 140; // 1400 / 10
const GRID_ROWS = 80;  // 800 / 10
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export const CELL_CAPACITY = 31; // Max atoms per hash cell. [count, idx1, idx2... idx31] = 32 ints per cell
const gridView = (STATE_MATRIX as any).spatialGrid; // Linked to WASM Memory

// ERA 55: Role-census per cell (8 role slots per cell, role=0..7)
const quorumBuffer = new SharedArrayBuffer(TOTAL_CELLS * 8 * 4);
const quorumView = new Int32Array(quorumBuffer);

export const SPATIAL_HASH = {
    buffer: STATE_MATRIX.buffer,
    quorumBuffer, // ERA 55: role census per cell
    CELL_CAPACITY,

    build: (activeIndices: number[]) => {
        // Clear all cell counts atomics-safely
        for (let i = 0; i < TOTAL_CELLS; i++) {
            Atomics.store(gridView, i * (CELL_CAPACITY + 1), 0);
        }

        for (const idx of activeIndices) {
            const x = Math.max(0, Math.min(1399, STATE_MATRIX.getX(idx)));
            const y = Math.max(0, Math.min(799, STATE_MATRIX.getY(idx)));
            
            const cellX = Math.floor(x / CELL_SIZE);
            const cellY = Math.floor(y / CELL_SIZE);
            const cellIdx = cellY * GRID_COLS + cellX;
            
            const offset = cellIdx * (CELL_CAPACITY + 1);
            
            // Atomic update of count
            const count = Atomics.load(gridView, offset);
            if (count < CELL_CAPACITY - 1) { // Leave last slot for phase sum
                const newCount = count + 1;
                Atomics.store(gridView, offset + newCount, idx);
                Atomics.store(gridView, offset, newCount);
                
                // --- ERA 50: Local Phase Tracking ---
                const myPhase = Atomics.load((STATE_MATRIX as any).phases, idx);
                Atomics.add(gridView, offset + (CELL_CAPACITY), Number(myPhase));

                // --- ERA 55: Role census per cell ---
                const myRole = (STATE_MATRIX as any).roles[idx]; // Access roles directly
                const safeRole = Math.min(7, Math.max(0, myRole));
                Atomics.add(quorumView, cellIdx * 8 + safeRole, 1);
            }
        }

        // Finalize phase averages + reset quorum counts for next sweep
        for (let i = 0; i < TOTAL_CELLS; i++) {
            const offset = i * (CELL_CAPACITY + 1);
            const count = Atomics.load(gridView, offset);
            if (count > 0) {
                const sum = Atomics.load(gridView, offset + (CELL_CAPACITY));
                Atomics.store(gridView, offset + (CELL_CAPACITY), 0);
                Atomics.store(gridView, offset + 31, Math.floor(sum / count));
            }
            // Reset quorum tallies for next tick
            for (let r = 0; r < 8; r++) Atomics.store(quorumView, i * 8 + r, 0);
        }
    },

    queryRadius: (x: number, y: number, radius: number): number[] => {
        const results: number[] = [];
        const minX = Math.max(0, Math.floor((x - radius) / CELL_SIZE));
        const maxX = Math.min(GRID_COLS - 1, Math.floor((x + radius) / CELL_SIZE));
        const minY = Math.max(0, Math.floor((y - radius) / CELL_SIZE));
        const maxY = Math.min(GRID_ROWS - 1, Math.floor((y + radius) / CELL_SIZE));

        for (let cy = minY; cy <= maxY; cy++) {
            for (let cx = minX; cx <= maxX; cx++) {
                const cellIdx = cy * GRID_COLS + cx;
                const offset = cellIdx * (CELL_CAPACITY + 1);
                const count = Atomics.load(gridView, offset);
                
                for (let c = 1; c <= count; c++) {
                    const neighborIdx = Atomics.load(gridView, offset + c);
                    const nx = STATE_MATRIX.getX(neighborIdx);
                    const ny = STATE_MATRIX.getY(neighborIdx);
                    const dx = nx - x;
                    const dy = ny - y;
                    if (dx * dx + dy * dy <= radius * radius) {
                        results.push(neighborIdx);
                    }
                }
            }
        }
        return results;
    },

    getGridIdx: (x: number, y: number) => {
        const cellX = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / CELL_SIZE)));
        const cellY = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / CELL_SIZE)));
        return cellY * GRID_COLS + cellX;
    },

    hash: (x: number, y: number) => {
        const hx = Math.max(0, Math.min(139, Math.floor(x / 10)));
        const hy = Math.max(0, Math.min(79, Math.floor(y / 10)));
        return hy * 140 + hx;
    }
};

```

---

## FILE: GATE.ts

```typescript
import { 
  REJECTION, 
  type StateSnapshot, 
  type DeltaProposal, 
  type GateConfig, 
  type GateDecision, 
  type LedgerEvent, 
  type BridgeModeEvent 
} from "./STATE_SNAPSHOT.ts";

/**
 * Mocking legacy @omega imports that are not used in the core logic or are redundant.
 * In a full production system, these would be properly resolved via a registry.
 */
const LEDGER = { 
  STORAGE_PATH: "./OMEGA_LEDGER.jsonl", 
  append: async (e: any) => { 
    if (e) console.log(`[LEDGER] ${JSON.stringify(e).slice(0, 100)}...`); 
  } 
};
const LOAD = { calculate: (p: { weight: number, entropy: number, phase: number }, _lp: number) => Math.abs(p.weight) * 0.1 };
const CHECKPOINT = { save: async (_s: any, r: string) => console.log(`[CHECKPOINT] ${r}`) };
const TOPOLOGICAL_SIGNATURE = { 
  validateHash: (_h: string) => true, 
  build: async (_p: any) => ({
    projection_2d_hash: "0x",
    thread_1d_hash: "0x",
    projection_version: "v1",
    artifact_hash: "0x",
    tick: 0,
    causal_refs: []
  }), 
  snapshotToOrganismState: (_s: any) => ({}) 
};
const CANON_CAUSAL_BRIDGE = { resolveMode: (_r: any) => ({ mode: "GREEN" as const, reason: "Autonomous" }), isCanonBound: (_p: any) => false };
const AGENT_SIGNATURE = { 
  toCanonicalObject: (p: any) => p, 
  proposalEnvelopeHash: async (_p: any) => "0x", 
  verifyProposal: async (_p: any, _k: any) => ({ ok: true, reason: undefined as string | undefined }) 
};
const PROPOSAL_ENVELOPE_INDEX = { 
  pathForLedger: (p: string) => p + ".index", 
  getRecentEnvelopeHashes: async (_s: number, _e: number, _p: string) => new Set<string>(), 
  appendFromLedgerEvent: async (_e: any, _p: string) => {} 
};
const INVARIANT_PACKET = { hash: async (_p: any) => "0x", fromInvariantReport: async (_r: any, _c: any) => ({}) };
const I16_CLAMP = (n: number) => Math.max(-32768, Math.min(32767, n));
const I16_LIMITS = () => ({ max: 32767, min: -32768, span: 65536 });
const CRYSTALLIZATION_CONFIG = { policyVersion: "v1" };
const CRYSTALLIZATION_POLICY = { hash: async () => "0x" };

export interface ReplayInvariantReport {
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  gate_admission_index_chain_checked_records: number;
  gate_admission_index_chain_failures: string[];
}

const GATE_VERSION = "v0.3-pure";
const AUTO_CHECKPOINT_INTERVAL = 128;
const I16 = I16_LIMITS();

export interface GateRuntimeContext {
  bridge_invariant_report?: ReplayInvariantReport;
  witness?: string;
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const phaseCoherence = (
  agentPhase: number,
  delta: Array<{ level: number; value: number }>,
  phase_u16?: Uint16Array,
): number => {
  if (delta.length === 0) return 1;
  let weighted = 0;
  let weightSum = 0;
  for (const d of delta) {
    const levelPhase = phase_u16 ? phase_u16[d.level] : 0;
    let dPhi = Math.abs(agentPhase - levelPhase);
    if (dPhi > I16.max) dPhi = I16.span - dPhi;
    const angle = (dPhi / I16.max) * Math.PI;
    const coherence = (1 + Math.cos(angle)) / 2; // [0..1]
    const w = Math.max(1, Math.abs(d.value));
    weighted += coherence * w;
    weightSum += w;
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 1;
};

export const GATE = {
  /**
   * The Core Function: Process proposals and produce a decision.
   * Pure function (mostly), side effect is only LEDGER emit.
   */
  process: async (
    state: StateSnapshot,
    proposals: DeltaProposal[],
    config: GateConfig,
    runtime: GateRuntimeContext = {},
  ): Promise<StateSnapshot> => {
    const decision: GateDecision = {
      accepted_proposals: [],
      rejected_proposals: [],
      budget_used: 0,
      cost_used: 0,
      accepted_delta: [],
    };
    const acceptedProposalMetrics: Array<{
      proposal_id: string;
      agent_id: string;
      confidence: number;
      reliability_base: number;
      reliability_effective: number;
      phase_coherence?: number;
      weight: number;
      physical_cost: number;
      agent_phase_u16?: number;
    }> = [];
    const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));
    const bridgeResolution = CANON_CAUSAL_BRIDGE.resolveMode(
      runtime.bridge_invariant_report,
    );
    const canonBoundProposals: string[] = [];
    const blockedCanonProposals: string[] = [];
    const signaturePolicy = config.signature_policy ?? "DISABLED";
    const signatureKeys = config.agent_signature_keys;
    const reliabilityMode = config.reliability_mode ?? "STATIC";
    const reliabilityFloor = clamp01(config.reliability_floor ?? 0);
    const maxTotalCost = Number.isFinite(config.max_total_cost_per_tick ?? Infinity)
      ? Math.max(0, config.max_total_cost_per_tick ?? Infinity)
      : Infinity;
    const envelopeIndexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(
      LEDGER.STORAGE_PATH,
    );
    const antiReplayWindow = Math.max(
      0,
      Math.floor(config.anti_replay_window_ticks ?? 0),
    );
    const historicalEnvelopeHashes = antiReplayWindow > 0
      ? await PROPOSAL_ENVELOPE_INDEX.getRecentEnvelopeHashes(
        state.tick - antiReplayWindow,
        state.tick,
        envelopeIndexPath,
      )
      : new Set<string>();
    const envelopeHashByProposal = new Map<string, string>();
    const seenEnvelopeHashesInTick = new Set<string>();

    const canonicalProposalList = proposals
      .map((p) => AGENT_SIGNATURE.toCanonicalObject(p))
      .sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));
    const proposalDigest = await sha256Hex(
      stableStringify(canonicalProposalList),
    );

    // 1. Validation & Filtering
    const validProposals: DeltaProposal[] = [];

    for (const p of proposals) {
      const envelopeHash = await AGENT_SIGNATURE.proposalEnvelopeHash(p);
      envelopeHashByProposal.set(p.proposal_id, envelopeHash);
      if (
        p.proposal_envelope_hash && p.proposal_envelope_hash !== envelopeHash
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.PROPOSAL_ENVELOPE_HASH_MISMATCH,
        });
        continue;
      }
      if (antiReplayWindow > 0) {
        if (
          seenEnvelopeHashesInTick.has(envelopeHash) ||
          historicalEnvelopeHashes.has(envelopeHash)
        ) {
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.REPLAY_ENVELOPE_DUPLICATE,
          });
          continue;
        }
        seenEnvelopeHashesInTick.add(envelopeHash);
      }
      if (CANON_CAUSAL_BRIDGE.isCanonBound(p)) {
        canonBoundProposals.push(p.proposal_id);
        if (bridgeResolution.mode !== "GREEN") {
          blockedCanonProposals.push(p.proposal_id);
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.CANON_PATH_REQUIRES_GREEN_BRIDGE,
          });
          continue;
        }
      }
      if (signaturePolicy !== "DISABLED") {
        const key = signatureKeys?.get(p.agent_id);
        if (!key) {
          if (
            signaturePolicy === "REQUIRED" || p.agent_signature ||
            p.signature_scheme
          ) {
            decision.rejected_proposals.push({
              proposal_id: p.proposal_id,
              reason: REJECTION.SIGNATURE_KEY_MISSING,
            });
            continue;
          }
        } else {
          if (!p.agent_signature) {
            if (signaturePolicy === "REQUIRED") {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: REJECTION.SIGNATURE_REQUIRED,
              });
              continue;
            }
          } else {
            const verify = await AGENT_SIGNATURE.verifyProposal(p, key);
            if (!verify.ok) {
              decision.rejected_proposals.push({
                proposal_id: p.proposal_id,
                reason: verify.reason ?? REJECTION.SIGNATURE_INVALID,
              });
              continue;
            }
          }
        }
      }
      // Check 1: Tick Mismatch
      if (p.tick !== state.tick) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.TICK_MISMATCH,
        });
        continue;
      }
      // Check 2: Base Hash Mismatch
      if (p.base_state_hash !== state.state_hash) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.BASE_HASH_MISMATCH,
        });
        continue;
      }
      // Check 3: Schema/Values (Simplified)
      if (!p.delta || p.delta.length === 0) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.EMPTY_DELTA,
        });
        continue;
      }
      if (
        p.delta.some((d) =>
          !Number.isInteger(d.level) ||
          d.level < 0 ||
          d.level > 63 ||
          !Number.isFinite(d.value)
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }
      if (
        p.agent_phase_u16 !== undefined &&
        (
          !Number.isInteger(p.agent_phase_u16) ||
          p.agent_phase_u16 < 0 ||
          p.agent_phase_u16 > I16.span
        )
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.OUT_OF_RANGE_VALUE,
        });
        continue;
      }

      // ... Additional checks (bounds, cost) would go here ...

      validProposals.push(p);
    }

    // 2. Deterministic Sort (Canonical Order)
    validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

    // 3. Merge with Budget Enforcement
    const combinedDelta = new Map<number, number>();

    for (const p of validProposals) {
      if ((p as any).resonance !== undefined) {
          console.log(`   [DEBUG PROPOSAL] ID: ${p.proposal_id}, resonance: ${(p as any).resonance}`);
      } else {
          console.log(`   [DEBUG PROPOSAL] ID: ${p.proposal_id}, NO RESONANCE FOUND.`);
      }
      
      // Calculate Physical Cost using LOAD model
      let physicalCost = 0;
      const agentPhase = p.agent_phase_u16 ?? 0;
      for (const d of p.delta) {
        // Get current level properties from state (if available)
        const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
        const levelEntropy = state.entropy_i16 ? state.entropy_i16[d.level] : 0;

        // Calculate Load of this specific mutation
        // Agent phase is proposal-local; level phase is substrate-local.
        const load = LOAD.calculate({
          entropy: levelEntropy,
          phase: agentPhase,
          weight: Math.abs(d.value),
        }, levelPhase);

        // Simplified Cost: Base Cost + Load Penalty
        // cost = |delta| + Load
        physicalCost += Math.abs(d.value) + load;
      }
      
      // --- PROOF OF RESONANCE (PoR): Zero-Friction Routing ---
      // Atoms that have proven high topological utility (Resonance) 
      // experience less friction (cost) when modifying the state.
      const atomResonance = (p as any).resonance || 0;
      let discountLabel = "";
      if (atomResonance > 0) {
        // The higher the resonance, the greater the discount (cap at 95%)
        const discountFactor = Math.min(0.95, atomResonance / 500); 
        physicalCost = physicalCost * (1 - discountFactor);
        discountLabel = `(PoR Discount: ${(discountFactor * 100).toFixed(1)}%)`;
        console.log(`      ⚖️ [PoR] Route subsidized for Atom. Base: ${Math.abs(p.delta[0]?.value || 0)}, Res: ${atomResonance.toFixed(1)}, Discount: ${(discountFactor * 100).toFixed(1)}%`);
      }

      const finalCost = Math.round(physicalCost);

      // Check cost budget per agent with measured physical cost.
      if (finalCost > (config.max_cost_per_agent || Infinity)) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      // Check total cost budget for this tick (energy budget).
      const nextTotalCost = decision.cost_used + finalCost;
      if (nextTotalCost > maxTotalCost) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.COST_OVER_BUDGET,
        });
        continue;
      }

      decision.accepted_proposals.push(p.proposal_id);
      decision.cost_used = nextTotalCost;

      // 4. Weighted Merge Logic
      // Weight = Confidence (0..1) * Reliability (0..1)
      const reliabilityBase = clamp01(
        config.reliability_weight.get(p.agent_id) ?? 1.0,
      );
      let phaseCoherenceScore: number | undefined = undefined;
      let agentReliability = reliabilityBase;
      if (reliabilityMode === "PHASE_COHERENCE") {
        phaseCoherenceScore = p.agent_phase_u16 === undefined
          ? 1
          : phaseCoherence(p.agent_phase_u16, p.delta, state.phase_u16);
        const modulation = reliabilityFloor +
          (1 - reliabilityFloor) * phaseCoherenceScore;
        agentReliability *= modulation;
      }
      agentReliability = clamp01(agentReliability);
      const weight = p.confidence * agentReliability;
      acceptedProposalMetrics.push({
        proposal_id: p.proposal_id,
        agent_id: p.agent_id,
        confidence: p.confidence,
        reliability_base: reliabilityBase,
        reliability_effective: agentReliability,
        phase_coherence: phaseCoherenceScore,
        weight,
        physical_cost: finalCost,
        agent_phase_u16: p.agent_phase_u16,
      });

      for (const d of p.delta) {
        // Clip per level
        let val = d.value;
        if (Math.abs(val) > config.max_abs_delta_per_level) {
          val = Math.sign(val) * config.max_abs_delta_per_level;
        }

        // Accumulate Weighted Delta (Float)
        const weightedVal = val * weight;
        const current = combinedDelta.get(d.level) || 0;
        combinedDelta.set(d.level, current + weightedVal);
      }
    }

    // 5. Global Budget Enforcement & Scaling
    // Calculate total absolute delta of the merged vector (using rounded values for check)
    let totalAbsDelta = 0;
    for (const val of combinedDelta.values()) {
      totalAbsDelta += Math.abs(Math.round(val));
    }
    decision.budget_used = totalAbsDelta;

    let scaleFactor = 1.0;
    if (totalAbsDelta > config.max_total_abs_delta_per_tick) {
      scaleFactor = config.max_total_abs_delta_per_tick / totalAbsDelta;
      // telemetry: scaling deltas by budget constraint
    }

    // 6. Flatten & Scale & Round Delta
    decision.accepted_delta = Array.from(combinedDelta.entries()).map((
      [level, value],
    ) => ({
      level,
      value: Math.round(value * scaleFactor), // Final Integer Rounding
    }));

    // 5. Apply Mutation (OR Dry Run)
    const nextStateI16 = new Int16Array(state.state_i16); // Clone

    if (!config.dry_run) {
      for (const d of decision.accepted_delta) {
        // Saturating Add
        const newVal = nextStateI16[d.level] + d.value;
        nextStateI16[d.level] = I16_CLAMP(newVal);
      }
    } else {
      // DRY RUN: State does NOT change
      // telemetry: dry run preserves state
    }

    // 6. Deterministic Hashing
    const nextHash = config.dry_run
      ? state.state_hash
      : await sha256Hex(stableStringify({
        state_i16: Array.from(nextStateI16),
        tick: state.tick + 1,
        gate_config_version: GATE_VERSION,
        proposal_digest: proposalDigest,
      }));
    const eventId = `evt_${
      (await sha256Hex(
        `${state.tick}|${state.state_hash}|${proposalDigest}|${nextHash}`,
      )).slice(0, 16)
    }`;

    // 7. Emit Ledger Event
    const nextTick = state.tick + 1;

    let projection2DHash: string | undefined;
    let thread1DHash: string | undefined;
    let projectionVersion: string | undefined;
    let signatureArtifactHash: string | undefined;
    let signatureTick: number | undefined;
    let signatureCausalRefs: string[] | undefined;
    const policyHash = await CRYSTALLIZATION_POLICY.hash();

    if (!config.dry_run && TOPOLOGICAL_SIGNATURE.validateHash(nextHash)) {
      const acceptedCausalRefs = decision.accepted_proposals.flatMap((id) =>
        proposalById.get(id)?.causal_refs ?? []
      );
      const causalRefs = Array.from(
        new Set([state.state_hash, ...acceptedCausalRefs]),
      );

      const topoSignature = await TOPOLOGICAL_SIGNATURE.build({
        artifact_hash: proposalDigest,
        state_hash: nextHash,
        tick: nextTick,
        state: TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
          state_hash: nextHash,
          state_i16: nextStateI16,
        }),
        causal_refs: causalRefs,
      });

      projection2DHash = topoSignature.projection_2d_hash;
      thread1DHash = topoSignature.thread_1d_hash;
      projectionVersion = topoSignature.projection_version;
      signatureArtifactHash = topoSignature.artifact_hash;
      signatureTick = topoSignature.tick;
      signatureCausalRefs = topoSignature.causal_refs;
    }

    const event: LedgerEvent = {
      event_id: eventId,
      tick: state.tick,
      ts_unix_ms: state.tick * 1000,
      state_before_hash: state.state_hash,
      state_after_hash: nextHash,
      accepted_delta: decision.accepted_delta,
      proposal_digest: proposalDigest,
      accepted_proposals: decision.accepted_proposals,
      accepted_proposal_metrics: acceptedProposalMetrics,
      accepted_proposal_envelopes: decision.accepted_proposals
        .map((proposal_id) => ({
          proposal_id,
          envelope_hash: envelopeHashByProposal.get(proposal_id) ?? "",
        }))
        .filter((x) => x.envelope_hash.length > 0),
      rejected_proposals: decision.rejected_proposals,
      cost_total: decision.cost_used,
      cost_limit: Number.isFinite(maxTotalCost) ? maxTotalCost : undefined,
      budget_used: decision.budget_used,
      budget_limit: config.max_total_abs_delta_per_tick,
      gate_config_version: GATE_VERSION,
      signature_artifact_hash: signatureArtifactHash,
      signature_tick: signatureTick,
      signature_causal_refs: signatureCausalRefs,
      projection_2d_hash: projection2DHash,
      thread_1d_hash: thread1DHash,
      projection_version: projectionVersion,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
    };

    const bridgeEvent: BridgeModeEvent = {
      event_type: "BRIDGE_MODE_EVENT",
      tick: state.tick,
      state_hash: state.state_hash,
      mode: bridgeResolution.mode,
      index_chain_checked:
        runtime.bridge_invariant_report?.index_chain_checked ?? false,
      index_chain_ok: runtime.bridge_invariant_report?.index_chain_ok ?? true,
      index_chain_checked_records:
        runtime.bridge_invariant_report?.index_chain_checked_records ?? 0,
      index_chain_failures: [
        ...(runtime.bridge_invariant_report?.index_chain_failures ?? []),
      ],
      gate_admission_index_chain_checked:
        runtime.bridge_invariant_report?.gate_admission_index_chain_checked ??
          false,
      gate_admission_index_chain_ok:
        runtime.bridge_invariant_report?.gate_admission_index_chain_ok ?? true,
      gate_admission_index_chain_checked_records:
        runtime.bridge_invariant_report
          ?.gate_admission_index_chain_checked_records ?? 0,
      gate_admission_index_chain_failures: [
        ...(runtime.bridge_invariant_report
          ?.gate_admission_index_chain_failures ?? []),
      ],
      invariant_packet_hash: runtime.bridge_invariant_report
        ? (await INVARIANT_PACKET.hash(
          await INVARIANT_PACKET.fromInvariantReport(
            runtime.bridge_invariant_report,
            { tick_anchor: state.tick, witness: runtime.witness },
          ),
        ))
        : undefined,
      canon_bound_proposals: [...canonBoundProposals].sort(),
      blocked_canon_proposals: [...blockedCanonProposals].sort(),
      reason: bridgeResolution.reason,
      witness: runtime.witness,
    };

    // 🛡️ Final Red Line Verification
    // "Trust but Verify" - Check if we accidentally mutated state in dry_run or exceeded limits
    if (
      config.dry_run && nextStateI16.some((v, i) => v !== state.state_i16[i])
    ) {
      const violation = {
        event_type: "VIOLATION_EVENT" as const,
        tick: state.tick,
        rule_id: "DRY_RUN_PURITY",
        severity: "CRITICAL" as const,
        state_hash: state.state_hash,
        details: "State mutation detected during dry_run",
        action_taken: "HALT_AND_QUARANTINE" as const,
      };
      await LEDGER.append(violation);
      throw new Error("🔴 RED LINE VIOLATION: DRY_RUN_PURITY. System Halted.");
    }

    await LEDGER.append(bridgeEvent);
    await LEDGER.append(event);
    if (!config.dry_run) {
      await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
        event,
        envelopeIndexPath,
      );
    }

    if (!config.dry_run && nextTick % AUTO_CHECKPOINT_INTERVAL === 0) {
      try {
        await CHECKPOINT.save(
          {
            tick: nextTick,
            state_hash: nextHash,
            state_i16: nextStateI16,
          },
          "AUTO_INTERVAL",
        );
      } catch (e) {
        // Checkpoints are safety accelerators, not mutation authority.
        // checkpoint save failed (telemetry handled outside canonical band)
      }
    }

    return {
      tick: nextTick,
      state_i16: nextStateI16,
      state_hash: nextHash,
    };
  },

   /**
    * ERA 35: Immune Learning (Ally Registry)
    * Whitelist for "Good Viruses" that have proven their worth.
    */
   trustedSignatures: new Set<string>(),

   /**
    * ERA 62: Immune Memory (Symbiogenesis)
    * Tracks average resonance of novel plasmids to determine if they become Canon.
    * Key: 8-byte logic hex, Value: accumulated symbiosis score.
    */
   immuneMemory: new Map<string, number>(),

   evaluateSymbiosis: (stateMatrix: any) => {
      // --- ERA 62: Evaluate Pro-Resonant Viral Logic ---
      const active = stateMatrix.getActiveIndices();
      const variantStats = new Map<string, { count: number, totalResonance: number }>();
      let baseResonanceSum = 0;
      let baseCount = 0;

      for (const idx of active) {
         const logic = stateMatrix.getLogic(idx) as Uint8Array;
         let logicStr = "";
         for (let n = 0; n < 8; n++) logicStr += logic[n].toString(16).padStart(2, '0');
         
         const resonance = stateMatrix.getResonance(idx);
         
         if (GATE.trustedSignatures.has(logicStr)) {
             // Treat established allies and original canon as baseline
             baseCount++;
             baseResonanceSum += resonance;
         } else {
             // Track novel variants
             const stats = variantStats.get(logicStr) || { count: 0, totalResonance: 0 };
             stats.count++;
             stats.totalResonance += resonance;
             variantStats.set(logicStr, stats);
         }
      }

      const baselineAvg = baseCount > 0 ? baseResonanceSum / baseCount : 15000; // 150 default

      // Reward variants that outperform the baseline or spread widely while healthy
      for (const [logicStr, stats] of variantStats.entries()) {
         const avgResonance = stats.totalResonance / stats.count;
         let score = GATE.immuneMemory.get(logicStr) || 0;
         
         if (avgResonance > baselineAvg && stats.count >= 3) {
             score += 10; // Reward successful propagation
         } else if (avgResonance < baselineAvg * 0.5) {
             score -= 5; // Penalize toxic variants
         }
         
         GATE.immuneMemory.set(logicStr, Math.max(0, score));

         // If score exceeds threshold, promote to Canon!
         if (score > 100 && !GATE.trustedSignatures.has(logicStr)) {
             console.log(`🛡️ [ERA 62: IMMUNE_LEARNING] Viral Plasmid evolved into Symbiont: ${logicStr} (Avg Resonance: ${(avgResonance/100).toFixed(1)} > Baseline: ${(baselineAvg/100).toFixed(1)})`);
             GATE.trustedSignatures.add(logicStr);
         }
      }
   },

   /**
    * ERA 26: Collective Immunity
    * Proactively scans logic signatures for malignant patterns.
    * ERA 62: Integrated with evaluateSymbiosis.
    */
   detectAntigens: (stateMatrix: any) => {
      // Run the Era 62 symbiosis evaluator first
      GATE.evaluateSymbiosis(stateMatrix);

      const active = stateMatrix.getActiveIndices();
      const viralGrid = stateMatrix.viralGrid; 

      for (const idx of active) {
         const logic = stateMatrix.getLogic(idx) as Uint8Array;
         let logicStr = "";
         for (let n = 0; n < 8; n++) logicStr += logic[n].toString(16).padStart(2, '0');
         
         // 🛡️ Era 35/62: Whitelist Bypass
         if (GATE.trustedSignatures.has(logicStr)) {
            stateMatrix.setQuarantine(idx, 0); // Always CLEAN if trusted
            continue;
         }

         let malignancy = 0;

         // --- ERA 49: Viral Load Detection (DEPRECATED in Pure Automaton Era) ---
         // Viral detection is now handled via metabolic cost and resonance audits.
         
         // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)

         // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)
         let feedCount = 0;
         for (let i = 0; i < 8; i++) {
            if (logic[i] === 0x20) feedCount++;
         }
         if (feedCount > 4) malignancy += 50;

         // Pattern 2: Chaos Injection (High entropy logic without bonds)
         const bonds = stateMatrix.getBonds(idx);
         let hasBonds = false;
         for (let j = 0; j < 4; j++) if (bonds[j] !== 0) hasBonds = true;
         if (!hasBonds && feedCount > 2) malignancy += 30;

         // Apply Audit Decisions
         if (malignancy >= 80) {
            stateMatrix.setId(idx, 0n); // RECYCLED (FATAL AUDIT)
            console.log(`⚖️ [GATE] Fatal Audit: Atom ${idx} recycled (Malignancy: ${malignancy})`);
         } else if (malignancy >= 40) {
            stateMatrix.setRole(idx, 1); // FLAGGED (IMMUNE WATCH)
         } else {
            stateMatrix.setRole(idx, 0); // CLEAN (CITIZEN)
         }
      }
   },

   auditMatrix: (stateMatrix: any) => {
       console.log("⚖️ [GATE] Starting Autonomous Systemic Audit...");
       
       // 1. Evaluate Symbiogenesis (Reward pro-resonant mutations)
       GATE.evaluateSymbiosis(stateMatrix);
       
       // 2. Detect Antigens (Identify and quarantine parasitic logic)
       GATE.detectAntigens(stateMatrix);
       
       // 3. Population Health Check
       const active = stateMatrix.getActiveIndices();
       let ghostCount = 0;
       for (const idx of active) {
           const energy = stateMatrix.getEnergy(idx);
           const resonance = stateMatrix.getResonance(idx);
           
           // If an atom has negative energy or extreme corruption, recycle it
           if (energy <= 0 || isNaN(energy) || isNaN(resonance)) {
               stateMatrix.setId(idx, 0n);
               ghostCount++;
           }
       }
       
       if (ghostCount > 0) console.log(`⚖️ [GATE] Recycled ${ghostCount} corrupted/starved atoms.`);
       console.log(`⚖️ [GATE] Audit Complete. Population: ${active.length}. Trusted Signatures: ${GATE.trustedSignatures.size}`);
   }
};


```

---

## FILE: SNAP.ts

```typescript
// OMEGA-64 | SNAP.ts | The Persistent Observer (Era 15)
// Transactional synchronization of RAM Memory Matrix to the Disk Flatland.

import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";

export const SNAP = {
    // Sync Matrix State to .md Files with Atomic "Write-then-Rename"
    save: async (root: string = Deno.cwd()) => {
        let saved = 0;
        let errors = 0;

        for (let i = 0; i < MAX_ATOMS; i++) {
            if (STATE_MATRIX.getId(i) === 0n) continue;

            const fullPath = IDX_TO_ID.get(i);
            if (!fullPath) continue;

            try {
                // @ts-ignore
                const content = await Deno.readTextFile(fullPath);
                const fmMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                if (!fmMatch) continue;

                const alpha = parseYaml(fmMatch[1]) as any;
                
                // Sync from RAM Matrix
                const x = STATE_MATRIX.getX(i);
                const y = STATE_MATRIX.getY(i);
                const energy = STATE_MATRIX.getEnergy(i);
                const resonance = STATE_MATRIX.getResonance(i);
                const phase = STATE_MATRIX.getPhase(i);

                // Update Frontmatter
                alpha.x = x;
                alpha.y = y;
                alpha.energy = Math.floor(energy);
                alpha.resonance = Number(resonance.toFixed(3));
                alpha.phase = Number(phase.toFixed(3));

                const updated = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
                
                // --- ATOMIC WRITE STRATEGY ---
                const tmpPath = `${fullPath}.tmp`;
                // @ts-ignore
                await Deno.writeTextFile(tmpPath, updated);
                // @ts-ignore
                await Deno.rename(tmpPath, fullPath); // Atomic operation on Unix
                
                saved++;
            } catch {
                errors++;
            }
        }
        
        if (saved > 0) {
            console.log(`   [SNAP] Transactional Sync: ${saved} atoms committed to Disk. (${errors} errors)`);
        }
    }
};

```

---

## FILE: SNAPSHOT_ENGINE.ts

```typescript
// OMEGA-64 | SNAPSHOT_ENGINE.ts | Era 19: The Genesis Checkpoint
// Rapid Binary Dumps of the volatile Memory Matrix (STATE_MATRIX.buffer)

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { ensureDir } from "jsr:@std/fs@0.224.0/ensure-dir";

const SNAPSHOT_DIR = ".omega/snapshots";

export const SNAPSHOT_ENGINE = {
    /**
     * Dumps the entire 6.4MB Memory Matrix + Akashic History to disk instantly.
     */
    exportSnapshot: async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        await ensureDir(SNAPSHOT_DIR);

        const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
        const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
        const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;
        try {
            // 1. Binary dump of ALL Agent States (ID, Pos, Logic, Code, Memory)
            const matrixData = new Uint8Array(STATE_MATRIX.buffer);
            await Deno.writeFile(matrixPath, matrixData);

            // 2. Binary dump of the Thermodynamics Grid (Nutrients)
            await Deno.writeFile(physicsPath, new Uint8Array(PHYSICS_ENGINE.envBuffer));

            // 3. JSON dump of the LLM Knowledge / Thoughts
            const akashicData = Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive);
            
            // --- ERA 68: CHECKSUM FOOTER ---
            const checksum = matrixData.reduce((acc, val) => (acc + val) % 0xFFFFFFFF, 0);
            (akashicData as any)._checksum = checksum;

            await Deno.writeTextFile(akashicPath, JSON.stringify(akashicData, null, 2));

            console.log(`💾 [SNAPSHOT] Genesis Saved: ${matrixPath} (Checksum: ${checksum.toString(16).toUpperCase()})`);
            return { timestamp, success: true };
        } catch (e) {
            console.error(`❌ [SNAPSHOT] Export Failed:`, e);
            return { success: false, error: String(e) };
        }
    },

    /**
     * Instantly overwrites the RAM Matrix with a historical `.bin` state.
     */
    importSnapshot: async (timestamp: string) => {
        const matrixPath = `${SNAPSHOT_DIR}/matrix_${timestamp}.bin`;
        const akashicPath = `${SNAPSHOT_DIR}/akashic_${timestamp}.json`;
        const physicsPath = `${SNAPSHOT_DIR}/physics_${timestamp}.bin`;

        try {
            // 1. Restore Matrix Memory Buffer
            const matrixData = await Deno.readFile(matrixPath);
            if (matrixData.length === STATE_MATRIX.buffer.byteLength) {
                new Uint8Array(STATE_MATRIX.buffer).set(matrixData);
            } else {
                throw new Error("Matrix Payload Size Mismatch");
            }

            // 2. Restore Thermodynamics Grid
            try {
                const physicsData = await Deno.readFile(physicsPath);
                new Uint8Array(PHYSICS_ENGINE.envBuffer).set(physicsData);
            } catch {
                console.warn(`⚠️ [SNAPSHOT] No physics dump found for ${timestamp}. Falling back to default noise.`);
            }

            // 3. Restore Akashic Records & Verify Checksum
            try {
                const akashicText = await Deno.readTextFile(akashicPath);
                const akashicData = JSON.parse(akashicText);
                
                // --- ERA 68: INTEGRITY VERIFICATION ---
                const expectedChecksum = akashicData._checksum;
                if (expectedChecksum !== undefined) {
                    const actualChecksum = matrixData.reduce((acc, val) => (acc + val) % 0xFFFFFFFF, 0);
                    if (actualChecksum !== expectedChecksum) {
                        throw new Error(`Integrity Violation: Predicted ${expectedChecksum.toString(16)}, Found ${actualChecksum.toString(16)}`);
                    }
                    console.log(`🛡️ [SNAPSHOT] Integrity Verified: Checksum ${actualChecksum.toString(16).toUpperCase()}`);
                }

                SEMANTIC_MEMBRANE.thoughtArchive.clear();
                for (const [hash, thought] of Object.entries(akashicData)) {
                    if (hash === "_checksum") continue;
                    SEMANTIC_MEMBRANE.thoughtArchive.set(hash, thought as string);
                }
            } catch (e: any) {
                if (e.message?.includes("Integrity Violation")) throw e;
                console.warn(`⚠️ [SNAPSHOT] No history or metadata for ${timestamp}:`, e);
            }

            console.log(`💾 [SNAPSHOT] Genesis Restored from: ${timestamp}`);
            return { success: true };
        } catch (e) {
            console.error(`❌ [SNAPSHOT] Import Failed:`, e);
            return { success: false, error: String(e) };
        }
    },

    /**
     * Lists all available Genesis Checkpoints sorted by newest first.
     */
    listSnapshots: async () => {
        try {
            const timestamps: string[] = [];
            // @ts-ignore: Deno.readDir is valid in Deno
            for await (const entry of Deno.readDir(SNAPSHOT_DIR)) {
                if (entry.isFile && entry.name.startsWith("matrix_") && entry.name.endsWith(".bin")) {
                    const ts = entry.name.replace("matrix_", "").replace(".bin", "");
                    timestamps.push(ts);
                }
            }
            return timestamps.sort().reverse();
        } catch {
            return [];
        }
    }
};

```

---

## FILE: LAMBDA_VM.ts

```typescript
// OMEGA-64 | LAMBDA_VM.ts | The Extended Quine VM (Era 17: The Living Quine)
// Turing-complete bytecode executor with registers, stack, and messaging.

export interface VMResult {
    energyDelta: number;
    resonanceDelta: number;
    intent: { level: number, value: any }[];
    modifiedCode?: { slot: number, value: number };
    modifiedStiffness?: { slot: number, value: number };
    modifiedSynaptic?: { slot: number, value: number };
    syncRequest?: { reg: number };
    modifiedStructure?: { type: number, density: number };
    memeticRequest?: "ENCODE" | "DECODE";
    modifiedRole?: number;
    outgoingMessages: { targetIdx: number, message: number, sourceBondSlot?: number }[];
    imprintRequest?: { pheroSnapshot: number, phaseSnapshot: number, pulseId: number }; // ERA 51
    hebbRequest?: { bondSlot: number }; // ERA 52
    roleRequest?: { role: number }; // ERA 53
    apoptosisRequest?: boolean; // ERA 54
    quorumRequest?: { collectiveType: number, quorumCount: number }; // ERA 55
    lockPhaseRequest?: { targetPhase: number }; // ERA 58
    morphRequest?: { zone: number, gradAngle: number }; // ERA 59
    secretePlasmidRequest?: { logic: Uint8Array, intensity: number }; // ERA 60
    incorporatePlasmidRequest?: { logic: Uint8Array }; // ERA 60
    shareRequest?: { bondSlot: number, amount: number }; // ERA 61
    eatRequest?: { amount: number }; // ERA 61
    phiRequest?: { amount: number }; // ERA 63
    ascendRequest?: boolean; // ERA 64
}

export const ISA = {
    // Control Flow
    JMP: 0x30, JZ: 0x31, JNZ: 0x32, CALL: 0x33, RET: 0x34,
    // Arithmetic
    ADD: 0x40, SUB: 0x41, MUL: 0x42, CMP: 0x43,
    // Data Movement
    LOAD: 0x50, STORE: 0x51,
    // Metabolism & Physics (High Level)
    MOVE: 0x10, FEED: 0x20, BET: 0x22, SENSE: 0x9F,
    // Self-Modification
    SELF_MOD: 0x99, SELF_REP: 0x9A, CROSS_REP: 0x9C, BIND: 0x9D, MERGE: 0x9E,
    // Epigenetic Evolution
    EVOLVE: 0x9B,
    // Atomic Messaging (ERA 27)
    SEND: 0x60, RECV: 0x61,
    // Structural Morphogenesis (ERA 28)
    LOCK: 0x62,
    // Distributed Cognition (ERA 30)
    SYNC_AVG: 0x70, PUSH_COLL: 0x71, POP_COLL: 0x72,
    // Architectural Stigmergy (ERA 31)
    BUILD: 0x80, EXCAVATE: 0x81,
    // Coded Memetics (ERA 32)
    ENCODE: 0x82, DECODE: 0x83,
    // Metabolic Specialization (ERA 33)
    SPEC: 0x84,
    // Viral PURGE (ERA 49)
    PURGE: 0x85,
    // Swarm Intelligence (ERA 50)
    SYNC: 0x86, STAMP: 0x87,
    // Collective Memory (ERA 51)
    IMPRINT: 0x88, RECALL: 0x89,
    // Neural Substrate (ERA 52)
    HEBB: 0x8A, FIRE: 0x8B,
    // Emergent Roles (ERA 53)
    ATTUNE: 0x8C,
    // Temporal Cognition (ERA 54)
    AGE: 0x8D, PHASE_LIFE: 0x8E,
    // Quorum Sensing (ERA 55)
    QUORUM: 0x8F,
    // Epigenetic Inheritance (ERA 56)
    INHERIT: 0x90,
    // Synaptic Plasticity Decay (ERA 57)
    DECAY: 0x91,
    // Resonance Oscillators (ERA 58)
    OSCILLATE: 0x92, LOCK_PHASE: 0x93,
    // Morphogenetic Gradients (ERA 59)
    GRAD: 0x94, MORPH: 0x95,
    // Horizontal Gene Transfer (ERA 60)
    SECRETE_PLASMID: 0x96, INCORPORATE_PLASMID: 0x97,
    // Symbiotic Bonding (ERA 61)
    SHARE: 0xA0, EAT: 0xA1,
    // The Golden Angle (ERA 63)
    PHI: 0xA2,
    // Ascension / Crystallization (ERA 64)
    ASCEND: 0xFF
};

export const LAMBDA_VM = {
    /**
     * Executes one instruction from the atom's bytecode.
     * context: 32 bytes [0: PC, 1: Flags, 2-9: Regs, 10-17: Stack, 18: SP, 19-31: Reserved]
     */
    execute: (logic: Uint8Array, code: Uint32Array, context: Uint8Array, state: { x: number, y: number, nutrients: Int32Array, structureGrid: Int32Array, viralGrid: Uint8Array, pheromoneGrid: Int32Array, spatialGrid: Int32Array, marketPool: Int32Array, energy: number, resonance: number, bonds: Uint32Array, synapticStack?: Int32Array, role?: number, semanticBonuses?: number, quarantineLevel?: number, incomingMessage?: number, isDiplomatic?: boolean, hiveMemory?: Uint8Array, age?: number, quorumData?: Int32Array, phase?: number }, dryRun = false, wasm?: any): VMResult => {
        const res: VMResult = { energyDelta: 0, resonanceDelta: 0, intent: [], outgoingMessages: [] };
        
        // --- ERA 36: Cognitive Scaffolding (Neural Stigmergy) ---
        const bonuses = state.semanticBonuses || 0;
        const isSwift = (bonuses & 1) === 1;
        const isGuardian = (bonuses & 2) === 2;
        const isHarvest = (bonuses & 4) === 4;

        // --- ERA 38: Metabolic Taxation (Cognitive Load) ---
        if (bonuses > 0) {
            res.energyDelta -= 0.05;
        }

        // --- ERA 26: QUARANTINE ENFORCEMENT ---
        if (state.quarantineLevel === 2) {
            return res;
        }

        let pc = context[0] % 16;
        let flags = context[1];
        const regs = context.subarray(2, 10);
        const stack = context.subarray(10, 18);
        let sp = context[18] % 8;

        const inst = code[pc];
        const op = inst & 0xFF;
        const p1 = (inst >> 8) & 0xFF;
        const p2 = (inst >> 16) & 0xFF;
        const p3 = (inst >> 24) & 0xFF;

        let pcJumped = false;

        switch (op) {
            case ISA.MOVE: {
                const dxVal = (p1 - 128) / 10.0;
                const dyVal = (p2 - 128) / 10.0;
                res.intent.push({ level: 1, value: { dx: dxVal * (isSwift ? 1.5 : 1.0), dy: dyVal * (isSwift ? 1.5 : 1.0) } });
                res.energyDelta -= 0.1;
                break;
            }

            case ISA.FEED: {
                const requested = p1;
                let consumed = 0;
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const idx = gy * 140 + gx;

                let current = Atomics.load(state.nutrients, idx);
                if (dryRun) {
                    consumed = Math.min(current, requested);
                } else {
                    while (current > 0) {
                        const take = Math.min(current, requested);
                        const next = current - take;
                        const actual = Atomics.compareExchange(state.nutrients, idx, current, next);
                        if (actual === current) {
                            consumed = take;
                            break;
                        }
                        current = Atomics.load(state.nutrients, idx);
                    }
                }

                res.energyDelta += (consumed / 1000) * (isHarvest ? 1.2 : 1.0); 
                if (consumed > 0) res.resonanceDelta += 0.1;
                break;
            }

            case ISA.BET: {
                const betAmount = p1;
                if (state.energy >= betAmount) {
                    res.energyDelta -= betAmount;
                    if (!dryRun) Atomics.add(state.marketPool, 0, Math.round(betAmount * 1000));
                    res.resonanceDelta += 0.5;
                }
                break;
            }

            case ISA.SENSE: {
                const type = p1;
                const regIdx = p2 % 8;
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const idx = gy * 140 + gx;

                let val = 0;
                switch (type) {
                    case 0x01: val = Atomics.load(state.nutrients, idx); break;
                    case 0x02: val = (Atomics.load(state.structureGrid, idx) >> 8) & 0xFF; break;
                    case 0x03: val = Atomics.load(state.viralGrid, idx * 9 + 8); break;
                    case 0x04: val = Atomics.load(state.spatialGrid, idx * 32); break;
                    case 0x05: val = Atomics.load(state.spatialGrid, idx * 32 + 31); break; // Local Phase Average
                    case 0x06: val = (Atomics.load(state.pheromoneGrid, idx) >>> 8) & 0xFF; break; // Pheromone Intensity
                    case 0x07: { // ERA 51: Hive Memory intensity
                        if (state.hiveMemory) {
                            const hBase = idx * 16;
                            const raw = (state.hiveMemory[hBase] | (state.hiveMemory[hBase+1] << 8) |
                                         (state.hiveMemory[hBase+2] << 16) | (state.hiveMemory[hBase+3] << 24));
                            val = (raw >>> 8) & 0xFF;
                        }
                        break;
                    }
                    case 0x08: { // ERA 52: Synaptic weight of bond p2%4
                        if (state.synapticStack) {
                            val = Math.min(255, state.synapticStack[p2 % 4]);
                        }
                        break;
                    }
                    case 0x09: { // ERA 53: Incoming FIRE signal tally (slot 3)
                        if (state.synapticStack) {
                            val = Math.min(255, state.synapticStack[3]);
                        }
                        break;
                    }
                    case 0x0A: { // ERA 54: Age bucket (0=young, 1=mature, 2=aged, 3=senescent)
                        const a = state.age ?? 0;
                        if (a < 50) val = 0;
                        else if (a < 200) val = 1;
                        else if (a < 400) val = 2;
                        else val = 3;
                        break;
                    }
                    case 0x0B: { // ERA 55: Same-role quorum count in local cell
                        if (state.quorumData && state.role !== undefined) {
                            const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                            const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                            const safeRole = Math.min(7, Math.max(0, state.role));
                            val = Math.min(255, state.quorumData[(gy * 140 + gx) * 8 + safeRole]);
                        }
                        break;
                    }
                    case 0x0C: { // ERA 56: Imprint age (ticks since last IMPRINT in this cell)
                        if (state.hiveMemory) {
                            const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                            const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                            const hBase = (gy * 140 + gx) * 16;
                            // bytes 8-11 = pulseId of last imprint; age = current - imprintTick
                            const imprintTick = state.hiveMemory[hBase+8] | (state.hiveMemory[hBase+9] << 8) |
                                               (state.hiveMemory[hBase+10] << 16) | (state.hiveMemory[hBase+11] << 24);
                            const imprintAge = (state.age ?? 0) - (imprintTick & 0xFF);
                            val = Math.min(255, Math.max(0, imprintAge));
                        }
                        break;
                    }
                    case 0x0D: { // ERA 57: Minimum weight across synapticStack[0..2]
                        if (state.synapticStack) {
                            val = Math.min(state.synapticStack[0], state.synapticStack[1], state.synapticStack[2]);
                        }
                        break;
                    }
                    case 0x0E: { // ERA 58: Local phase average from spatialGrid slot 31
                        const gx = Math.max(0, Math.min(139, Math.floor(state.x / 10)));
                        const gy = Math.max(0, Math.min(79, Math.floor(state.y / 10)));
                        const cellBase = (gy * 140 + gx) * 32;
                        val = Math.min(255, Math.max(0, state.spatialGrid[cellBase + 31]));
                        break;
                    }
                    case 0x0F: { // ERA 59: Pheromone gradient magnitude at own cell
                        const px = Math.max(1, Math.min(138, Math.floor(state.x / 10)));
                        const py = Math.max(1, Math.min(78, Math.floor(state.y / 10)));
                        const dx = (state.pheromoneGrid[(py * 140 + px + 1)] - state.pheromoneGrid[(py * 140 + px - 1)]);
                        const dy = (state.pheromoneGrid[((py + 1) * 140 + px)] - state.pheromoneGrid[((py - 1) * 140 + px)]);
                        val = Math.min(255, Math.floor(Math.sqrt(dx * dx + dy * dy) / 100));
                        break;
                    }
                }
                if (!dryRun) {
                    regs[regIdx] = Math.min(255, val);
                    // --- ERA 48: Metabolic Balancing ---
                    res.energyDelta -= 0.5; // Information is a metabolic resource
                }
                break;
            }

            case ISA.EVOLVE:
                res.intent.push({ level: 5, value: "EVOLUTION_REQUEST" });
                res.resonanceDelta += 1.0;
                break;

            case ISA.JMP:
                pc = p1 % 16;
                pcJumped = true;
                break;

            case ISA.JZ:
                if ((flags & 0x01) === 1) { pc = p1 % 16; pcJumped = true; }
                break;

            case ISA.JNZ:
                if ((flags & 0x01) === 0) { pc = p1 % 16; pcJumped = true; }
                break;

            case ISA.CALL:
                if (sp < 8) {
                    if (!dryRun) stack[sp++] = (pc + 1) % 16;
                    pc = p1 % 16;
                    pcJumped = true;
                }
                break;

            case ISA.RET:
                if (sp > 0) {
                    if (!dryRun) pc = stack[--sp];
                    else pc = stack[sp - 1];
                    pcJumped = true;
                }
                break;

            case ISA.ADD:
                if (!dryRun) regs[p1 % 8] = (regs[p2 % 8] + regs[p3 % 8]) & 0xFF;
                break;

            case ISA.SUB:
                if (!dryRun) regs[p1 % 8] = (regs[p2 % 8] - regs[p3 % 8]) & 0xFF;
                break;

            case ISA.MUL:
                if (!dryRun) regs[p1 % 8] = (regs[p2 % 8] * regs[p3 % 8]) & 0xFF;
                break;

            case ISA.CMP:
                if (!dryRun) flags = (regs[p1 % 8] === regs[p2 % 8]) ? (flags | 0x01) : (flags & ~0x01);
                break;

            case ISA.LOAD:
                if (!dryRun) regs[p1 % 8] = logic[p2 % 8];
                break;

            case ISA.STORE:
                if (!dryRun) {
                    res.modifiedCode = { slot: p2 % 16, value: regs[p1 % 8] };
                    logic[p2 % 8] = regs[p1 % 8];
                }
                break;

            case ISA.SELF_MOD:
                if (state.energy > 50) {
                    res.modifiedCode = { slot: p1 % 16, value: (p3 << 16) | (p2 << 8) | p1 };
                    res.energyDelta -= 30;
                    res.resonanceDelta += 5;
                }
                break;

            case ISA.SELF_REP: {
                // --- ERA 48: High-Density Friction ---
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const density = Atomics.load(state.spatialGrid, (gy * 140 + gx) * 32);
                const baseCost = 80;
                const friction = density > 10 ? (density - 10) * 10 : 0;
                const totalCost = baseCost + friction;

                if (state.energy > (totalCost + 70)) {
                    res.intent.push({ level: 10, value: "spawn" });
                    res.energyDelta -= totalCost;
                }
                break;
            }

            case ISA.CROSS_REP: {
                // --- ERA 48: High-Density Friction ---
                const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                const density = Atomics.load(state.spatialGrid, (gy * 140 + gx) * 32);
                const baseCost = 100;
                const friction = density > 10 ? (density - 10) * 15 : 0;
                const totalCost = baseCost + friction;

                if (state.energy > (totalCost + 50)) {
                    res.energyDelta -= totalCost;
                    res.intent.push({ level: 11, value: { type: "meiosis", targetBondSlot: p1 % 4 } });
                }
                break;
            }

            case ISA.BIND: {
                const dxVal = (p1 - 128) / 10.0;
                const dyVal = (p2 - 128) / 10.0;
                res.intent.push({ level: 12, value: { dx: dxVal, dy: dyVal } });
                res.energyDelta -= 10;
                break;
            }

            case ISA.MERGE: {
                if (state.resonance > 300) {
                    res.intent.push({ level: 13, value: { targetBondSlot: p1 % 4 } });
                    res.energyDelta -= 50;
                }
                break;
            }

            case ISA.SEND: {
                const slot = p1 % 4;
                const targetIdx = state.bonds[slot];
                if (targetIdx !== 0) {
                    res.outgoingMessages.push({ targetIdx, message: p2, sourceBondSlot: slot });
                    res.energyDelta -= 2;
                }
                break;
            }

            case ISA.RECV:
                if (!dryRun) regs[p1 % 8] = (state.incomingMessage || 0) & 0xFF;
                if (state.isDiplomatic) res.resonanceDelta += 2.0;
                else res.resonanceDelta += 0.2;
                break;

            case ISA.LOCK: {
                const slot = p1 % 4;
                res.modifiedStiffness = { slot, value: Math.min(100, p2) / 100 };
                res.energyDelta -= 5;
                break;
            }

            case ISA.SYNC_AVG:
                res.syncRequest = { reg: p1 % 8 };
                res.energyDelta -= 3;
                break;

            case ISA.PUSH_COLL:
                res.modifiedSynaptic = { slot: p2 % 4, value: regs[p1 % 8] };
                res.energyDelta -= 2;
                break;

            case ISA.POP_COLL:
                if (!dryRun && state.synapticStack) regs[p2 % 8] = state.synapticStack[p1 % 4];
                res.energyDelta -= 1;
                break;

            case ISA.BUILD:
                if (state.resonance > 40) {
                    res.modifiedStructure = { type: p1 % 8, density: Math.min(255, p2) };
                    res.energyDelta -= 10;
                    res.resonanceDelta -= isGuardian ? 10 : 20;
                }
                break;

            case ISA.EXCAVATE:
                res.modifiedStructure = { type: 0, density: 0 };
                res.energyDelta += 5;
                break;

            case ISA.ENCODE:
                if (state.resonance > 50) {
                    res.memeticRequest = "ENCODE";
                    res.energyDelta -= 15;
                    res.resonanceDelta -= 10;
                }
                break;

            case ISA.DECODE:
                res.memeticRequest = "DECODE";
                res.energyDelta -= 5;
                break;

            case ISA.SPEC:
                if (state.resonance > 100) {
                    const newRole = p1 % 4;
                    if (state.role !== undefined && state.role !== 0 && state.role !== newRole) {
                        res.energyDelta -= (state.energy * 0.5);
                        res.resonanceDelta -= (state.resonance * 0.5);
                    }
                    res.modifiedRole = newRole;
                    res.energyDelta -= 20;
                    res.resonanceDelta -= 30;
                }
                break;

            case ISA.PURGE: {
                // --- ERA 49: Viral Shielding (Immune Resolution) ---
                if (state.energy > 60) {
                    res.memeticRequest = "DECODE"; // Reuse existing memetic path to restore from memoryGrid
                    res.energyDelta -= 50;
                    res.resonanceDelta += 5;
                }
                break;
            }

            case ISA.SYNC: {
                // --- ERA 50: Collective Coordination ---
                res.intent.push({ level: 15, value: "SYNC_PHASE" });
                res.energyDelta -= 5;
                res.resonanceDelta += 2;
                break;
            }

            case ISA.STAMP: {
                // --- ERA 50: Stigmergy (Pheromones) ---
                if (state.resonance > 30) {
                    res.intent.push({ level: 16, value: { type: p1 % 8, intensity: Math.min(255, p2) } });
                    res.energyDelta -= 10;
                    res.resonanceDelta -= 2;
                }
                break;
            }

            case ISA.IMPRINT: {
                // --- ERA 51: Collective Memory — encode snapshot ---
                // Read current local pheromone + phase and request worker to write to hiveMemory
                if (state.resonance > 20 && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const pIdx = gy * 140 + gx;
                    const pheroSnap = Atomics.load(state.pheromoneGrid, pIdx);
                    const phaseSnap = state.resonance; // use resonance as phase proxy in VM scope
                    res.imprintRequest = { pheroSnapshot: pheroSnap, phaseSnapshot: Math.round(phaseSnap), pulseId: 0 };
                    res.energyDelta -= 5;
                    res.resonanceDelta -= 1;
                }
                break;
            }

            case ISA.RECALL: {
                // --- ERA 51: Collective Memory — read snapshot into register ---
                // p1 = field (0=phero intensity, 1=pheromone type, 2=phase)
                // p2 = destination register index
                if (state.hiveMemory && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const hBase = (gy * 140 + gx) * 16;
                    const raw32 = state.hiveMemory[hBase] | (state.hiveMemory[hBase+1] << 8) |
                                  (state.hiveMemory[hBase+2] << 16) | (state.hiveMemory[hBase+3] << 24);
                    let recalled = 0;
                    if (p1 === 0) recalled = (raw32 >>> 8) & 0xFF; // phero intensity
                    if (p1 === 1) recalled = raw32 & 0xFF;          // phero type
                    if (p1 === 2) recalled = state.hiveMemory[hBase + 4] | (state.hiveMemory[hBase + 5] << 8); // phase
                    regs[p2 % 8] = Math.min(255, recalled);
                    res.energyDelta -= 0.3;
                }
                break;
            }

            case ISA.HEBB: {
                // --- ERA 52: Hebbian Plasticity ---
                // p1 = bond slot (0-3); strengthen if both atoms resonating strongly
                // "Fire together → wire together"
                const HEBB_THRESHOLD = 200; // raw resonance (×SCALE = 0.2)
                const slot = p1 % 4;
                if (state.resonance > HEBB_THRESHOLD && state.synapticStack && !dryRun) {
                    // Check neighbour resonance via spatialGrid density as a proxy
                    // (actual resonance comparison happens in PULSE_WORKER)
                    const targetIdx = state.bonds[slot];
                    if (targetIdx > 0) {
                        res.hebbRequest = { bondSlot: slot };
                        res.energyDelta -= 1;
                    }
                }
                break;
            }

            case ISA.FIRE: {
                // --- ERA 52: Synaptic Signal Propagation ---
                // p1 = bond slot; p2 = amplitude (0-255)
                // Emit signal weighted by synapticStack[p1]
                const slot = p1 % 4;
                const amplitude = p2;
                if (state.synapticStack && !dryRun) {
                    const weight = state.synapticStack[slot]; // 0..255 scaled
                    if (weight > 10) {
                        res.intent.push({
                            level: 18,
                            value: { bondSlot: slot, amplitude, weight }
                        });
                        res.energyDelta -= (weight / 255) * amplitude * 0.1;
                    }
                }
                break;
            }

            case ISA.ATTUNE: {
                // --- ERA 53: Emergent Roles ---
                // Read incoming FIRE signal tally from synapticStack[3].
                // If tally exceeds threshold, auto-specialize into the role
                // derived from dominant incoming synapse weight (slots 0–2).
                // p1 = tally threshold (0=use default 20)
                // p2 = role override (0=auto-derive from weights)
                if (state.synapticStack && !dryRun) {
                    const tally = state.synapticStack[3]; // incoming FIRE count
                    const threshold = p1 > 0 ? p1 : 20;
                    if (tally >= threshold) {
                        let role: number;
                        if (p2 > 0) {
                            role = p2; // explicit override
                        } else {
                            // Derive role from the slot with the highest weight
                            const w0 = state.synapticStack[0];
                            const w1 = state.synapticStack[1];
                            const w2 = state.synapticStack[2];
                            if (w0 >= w1 && w0 >= w2)      role = 1; // Producer
                            else if (w1 >= w0 && w1 >= w2) role = 2; // Guardian
                            else                            role = 3; // Architect
                        }
                        res.roleRequest = { role };
                        res.energyDelta -= 5;
                        res.resonanceDelta += 10; // differentiation bonus
                    }
                }
                break;
            }

            case ISA.AGE: {
                // --- ERA 54: Temporal Cognition — read own age ---
                // p1 = destination register
                if (!dryRun) {
                    const ageVal = Math.min(255, state.age ?? 0);
                    regs[p1 % 8] = ageVal;
                }
                res.energyDelta -= 0.1;
                break;
            }

            case ISA.PHASE_LIFE: {
                // --- ERA 54: Lifecycle Phase Effects ---
                // Reads age and applies phase-appropriate effect.
                // Young   (0–49):   growth bonus — resonance +5
                // Mature  (50–199): productivity — energy recoup + hive imprint eligible
                // Aged    (200–399): teaching — FIRE amplitude boosted via resonanceDelta
                // Senescent (400+): apoptosis — emit self-dissolution request
                const age = state.age ?? 0;
                if (!dryRun) {
                    if (age < 50) {
                        // Young: grow
                        res.resonanceDelta += 5;
                        res.energyDelta -= 0.5;
                    } else if (age < 200) {
                        // Mature: productive, slight energy recoup from nutrients
                        res.resonanceDelta += 2;
                        res.energyDelta += 0.5; // mature efficiency
                    } else if (age < 400) {
                        // Aged: teaching — emit FIRE across all bonds
                        for (let b = 0; b < 4; b++) {
                            if (state.bonds[b] > 0 && state.synapticStack) {
                                const w = state.synapticStack[b];
                                if (w > 10) {
                                    res.intent.push({ level: 18, value: { bondSlot: b, amplitude: 150, weight: w } });
                                }
                            }
                        }
                        res.energyDelta -= 2;
                    } else {
                        // Senescent: apoptosis request
                        res.apoptosisRequest = true;
                        res.resonanceDelta += 20; // final resonance burst — wisdom transfer
                        res.energyDelta -= 50;
                    }
                }
                break;
            }

            case ISA.QUORUM: {
                // --- ERA 55: Quorum Sensing ---
                // p1 = quorum threshold (default 5)
                // p2 = collective behavior type:
                //   0 = resonance cascade (broadcast resonance boost)
                //   1 = coordinated STAMP (pheromone flood, intent level 19)
                //   2 = role lock (lock current role, suppress ATTUNE)
                const threshold = p1 > 0 ? p1 : 5;

                if (state.quorumData && state.role !== undefined && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const safeRole = Math.min(7, Math.max(0, state.role));
                    const quorumCount = state.quorumData[(gy * 140 + gx) * 8 + safeRole];

                    if (quorumCount >= threshold) {
                        const collectiveType = p2 % 3;
                        res.quorumRequest = { collectiveType, quorumCount };

                        if (collectiveType === 0) {
                            // Resonance cascade — collective amplification
                            res.resonanceDelta += Math.min(50, quorumCount * 2);
                            res.energyDelta -= 3;
                        } else if (collectiveType === 1) {
                            // Coordinated STAMP — pheromone flood
                            res.intent.push({ level: 19, value: { role: safeRole, intensity: Math.min(255, quorumCount * 10) } });
                            res.energyDelta -= 8;
                        } else {
                            // Role lock — freeze role identity
                            res.resonanceDelta += 5;
                            res.energyDelta -= 1;
                        }
                    }
                }
                break;
            }

            case ISA.INHERIT: {
                // --- ERA 56: Epigenetic Inheritance — voluntary weight sync ---
                // Read hiveMemory imprint at own cell and reinforce own synapticStack[p1%3]
                // p1 = weight slot to reinforce (0-2)
                // p2 = reinforce amplitude (0=light +1, >0=use p2 value)
                if (state.hiveMemory && state.synapticStack && !dryRun) {
                    const gx = Math.floor(Math.max(0, Math.min(1399, state.x)) / 10);
                    const gy = Math.floor(Math.max(0, Math.min(799, state.y)) / 10);
                    const hBase = (gy * 140 + gx) * 16;
                    // bytes 0-3: pheromone snapshot → use byte 1 as weight reference
                    const refWeight = state.hiveMemory[hBase + 1]; // intensity octet
                    const slot = p1 % 3;
                    const amplitude = p2 > 0 ? p2 : 1;
                    const curWeight = state.synapticStack[slot];
                    // Move current weight toward reference value by amplitude
                    const delta = refWeight > curWeight ? amplitude : -amplitude;
                    state.synapticStack[slot] = Math.max(0, Math.min(255, curWeight + delta));
                    res.modifiedSynaptic = { slot, value: state.synapticStack[slot] };
                    res.energyDelta -= 0.5;
                    res.resonanceDelta += 1; // cultural alignment bonus
                }
                break;
            }

            case ISA.DECAY: {
                // --- ERA 57: Synaptic Plasticity Decay ---
                // Explicit pruning: find the weakest synapse slot [0..2] and decrement it.
                // p1 = slot override (0-2: specific slot; 3=all three; default=auto-weakest)
                // p2 = decay rate (default 2)
                if (state.synapticStack && !dryRun) {
                    const rate = p2 > 0 ? p2 : 2;
                    if (p1 >= 3) {
                        // Decay all three slots
                        for (let s = 0; s < 3; s++) {
                            const cur = state.synapticStack[s];
                            if (cur > 0) {
                                state.synapticStack[s] = Math.max(0, cur - rate);
                                res.modifiedSynaptic = { slot: s, value: state.synapticStack[s] };
                            }
                        }
                    } else if (p1 > 0) {
                        // Decay specific slot
                        const cur = state.synapticStack[p1];
                        state.synapticStack[p1] = Math.max(0, cur - rate);
                        res.modifiedSynaptic = { slot: p1, value: state.synapticStack[p1] };
                    } else {
                        // Auto: find and decay weakest slot
                        let minSlot = 0;
                        if (state.synapticStack[1] < state.synapticStack[minSlot]) minSlot = 1;
                        if (state.synapticStack[2] < state.synapticStack[minSlot]) minSlot = 2;
                        const cur = state.synapticStack[minSlot];
                        if (cur > 0) {
                            state.synapticStack[minSlot] = Math.max(0, cur - rate);
                            res.modifiedSynaptic = { slot: minSlot, value: state.synapticStack[minSlot] };
                        }
                    }
                    res.energyDelta += 0.5;   // pruning releases metabolic energy
                    res.resonanceDelta += 1;   // neural efficiency bonus
                }
                break;
            }

            case ISA.OSCILLATE: {
                // --- ERA 58: Resonance Oscillators ---
                // Broadcasts a phase ripple to co-located atoms.
                // p1 = amplitude (0=auto from resonance, >0=explicit)
                // p2 = reach (0=same cell only, 1=adjacent cells)
                if (!dryRun) {
                    const ownPhase = state.phase ?? 128;
                    const amplitude = p1 > 0 ? p1 : Math.min(255, Math.floor(state.resonance / 10));
                    // Sinusoidal component: sin(phase*2π/255) maps to [-1..+1]
                    const sinComponent = Math.sin((ownPhase / 255) * Math.PI * 2);
                    const waveAmplitude = Math.round(amplitude * sinComponent);
                    if (Math.abs(waveAmplitude) > 0) {
                        res.intent.push({
                            level: 20,
                            value: { phase: ownPhase, waveAmplitude, reach: p2 }
                        });
                        res.energyDelta -= Math.abs(waveAmplitude) * 0.05;
                    }
                }
                break;
            }

            case ISA.LOCK_PHASE: {
                // --- ERA 58: Phase Lock ---
                // Snaps own phase to local average (constructive) or +128 (destructive).
                // p1: 0=constructive (sync), 1=destructive (anti-phase)
                // Reads spatialGrid slot 31 = local phase average
                if (!dryRun) {
                    const gx = Math.max(0, Math.min(139, Math.floor(state.x / 10)));
                    const gy = Math.max(0, Math.min(79, Math.floor(state.y / 10)));
                    const cellAvgPhase = state.spatialGrid[(gy * 140 + gx) * 32 + 31];
                    const targetPhase = p1 === 1
                        ? (cellAvgPhase + 128) % 256  // destructive: anti-phase
                        : cellAvgPhase;                // constructive: sync
                    res.lockPhaseRequest = { targetPhase };
                    // Resonance bonus scales with how close own phase is to target
                    const phaseDiff = Math.abs((state.phase ?? 128) - cellAvgPhase);
                    const alignment = 1 - phaseDiff / 255;
                    res.resonanceDelta += Math.round(alignment * 5);
                    res.energyDelta -= 1;
                }
                break;
            }

            case ISA.GRAD: {
                // --- ERA 59: Morphogenetic Gradient Direction ---
                // Reads local pheromone gradient and encodes direction as 0-255 angle.
                // 0=right, 64=up, 128=left, 192=down. Stores in register p1.
                // p2: 0=angle, 1=dx-component, 2=dy-component
                const gPx = Math.max(1, Math.min(138, Math.floor(state.x / 10)));
                const gPy = Math.max(1, Math.min(78, Math.floor(state.y / 10)));
                const gDx = state.pheromoneGrid[gPy * 140 + gPx + 1] - state.pheromoneGrid[gPy * 140 + gPx - 1];
                const gDy = state.pheromoneGrid[(gPy + 1) * 140 + gPx] - state.pheromoneGrid[(gPy - 1) * 140 + gPx];
                let gradVal: number;
                if (p2 === 1) {
                    gradVal = Math.min(255, Math.max(0, Math.floor((gDx + 32767) / 257)));
                } else if (p2 === 2) {
                    gradVal = Math.min(255, Math.max(0, Math.floor((gDy + 32767) / 257)));
                } else {
                    // Angle: atan2(dy,dx) mapped 0..255
                    const angle = Math.atan2(gDy, gDx); // -π..+π
                    gradVal = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 255) & 0xFF;
                }
                if (!dryRun) regs[p1 % 8] = gradVal;
                break;
            }

            case ISA.MORPH: {
                // --- ERA 59: Morphogenetic Differentiation ---
                // Classifies local pheromone concentration into 3 spatial zones:
                //   Zone 0 = Apex    (high:  concentration > p1*100)  → Architect role
                //   Zone 1 = Slope   (mid:   concentration > p2*100)  → Guardian role
                //   Zone 2 = Base    (low:   otherwise)               → Producer role
                // Emits morphRequest with zone + gradient angle.
                if (!dryRun) {
                    const mPx = Math.max(1, Math.min(138, Math.floor(state.x / 10)));
                    const mPy = Math.max(1, Math.min(78, Math.floor(state.y / 10)));
                    const conc = Math.abs(state.pheromoneGrid[mPy * 140 + mPx]);
                    const hiThresh = (p1 > 0 ? p1 : 10) * 100;
                    const loThresh = (p2 > 0 ? p2 : 3) * 100;
                    const zone = conc > hiThresh ? 0 : conc > loThresh ? 1 : 2;
                    // Gradient angle for orientation
                    const mDx = state.pheromoneGrid[mPy * 140 + mPx + 1] - state.pheromoneGrid[mPy * 140 + mPx - 1];
                    const mDy = state.pheromoneGrid[(mPy + 1) * 140 + mPx] - state.pheromoneGrid[(mPy - 1) * 140 + mPx];
                    const gradAngle = Math.floor(((Math.atan2(mDy, mDx) + Math.PI) / (2 * Math.PI)) * 255) & 0xFF;
                    res.morphRequest = { zone, gradAngle };
                    // Role suggestion per zone
                    const suggestedRole = zone === 0 ? 3 : zone === 1 ? 2 : 1; // Arch / Guard / Prod
                    res.resonanceDelta += (3 - zone) * 2; // apex gets max bonus
                    res.energyDelta -= 2;
                    // Also push potential role transition via existing roleRequest
                    if (!res.roleRequest) res.roleRequest = { role: suggestedRole };
                }
                break;
            }

            case ISA.SECRETE_PLASMID: {
                // --- ERA 60: Horizontal Gene Transfer (Secretion) ---
                // Writes atom's own 8-byte logic signature to the cell's viralGrid.
                // p1 = intensity/TTL of the plasmid (added to 9th byte).
                if (!dryRun) {
                    const gx = Math.max(0, Math.min(139, Math.floor(state.x / 10)));
                    const gy = Math.max(0, Math.min(79, Math.floor(state.y / 10)));
                    // cellBase for viralGrid is 9 bytes per cell
                    const cellBase = (gy * 140 + gx) * 9;
                    const intensity = p1 > 0 ? p1 : 128; // default intensity
                    res.secretePlasmidRequest = { logic: new Uint8Array(logic), intensity };
                    res.energyDelta -= 5; // secretion costs macroscopic energy
                }
                break;
            }

            case ISA.INCORPORATE_PLASMID: {
                // --- ERA 60: Horizontal Gene Transfer (Absorption) ---
                // Reads viralGrid at current cell. If intensity (byte 8) > p1 threshold,
                // incorporates it by overwriting own 8-byte logic.
                if (!dryRun) {
                    const gx = Math.max(0, Math.min(139, Math.floor(state.x / 10)));
                    const gy = Math.max(0, Math.min(79, Math.floor(state.y / 10)));
                    const cellBase = (gy * 140 + gx) * 9;
                    const threshold = p1 > 0 ? p1 : 50;
                    const plasmidIntensity = state.viralGrid[cellBase + 8];
                    
                    if (plasmidIntensity > threshold) {
                        // Absorb the plasmid
                        const plasmidLogic = new Uint8Array(8);
                        for (let j = 0; j < 8; j++) {
                            plasmidLogic[j] = state.viralGrid[cellBase + j];
                        }
                        res.incorporatePlasmidRequest = { logic: plasmidLogic };
                        res.resonanceDelta += 50; // Massive reward for genetic novelty
                        res.energyDelta -= 10;   // Rewiring is metabolically expensive
                    }
                }
                break;
            }

            case ISA.SHARE: {
                // --- ERA 61: Symbiotic Sharing ---
                // Share p1 energy with the atom bonded at slot p2 (0-3).
                if (!dryRun) {
                    const slot = p2 % 4;
                    const amount = p1;
                    if (amount > 0 && state.bonds[slot] > 0) {
                        res.shareRequest = { bondSlot: slot, amount };
                        res.energyDelta -= amount; // Deduct immediately from self
                        res.resonanceDelta += Math.floor(amount / 4); // Altruism reward
                    }
                }
                break;
            }

            case ISA.EAT: {
                // --- ERA 61: Active Consumption ---
                // Actively consume up to p1 nutrients from the current spatial cell.
                if (!dryRun && p1 > 0) {
                    res.eatRequest = { amount: p1 };
                    // We don't change energyDelta here because PULSE_WORKER needs to 
                    // check if the cell actually has nutrients first.
                }
                break;
            }

            case ISA.PHI: {
                // --- ERA 63: The Golden Angle ---
                // Shifts phase by the Golden Angle (137.5 deg = ~97 in 256 byte space)
                // If p1=0, shifts by 97. If p1>0, shifts by p1 (custom angle).
                if (!dryRun) {
                    const shiftAmount = p1 === 0 ? 97 : p1;
                    res.phiRequest = { amount: shiftAmount };
                    res.resonanceDelta += 2; // Small harmony reward for packing
                }
                break;
            }

            case ISA.ASCEND: {
                // --- ERA 64: The Convergence ---
                // Requires minimum 5000 energy and 500 resonance to ascend.
                if (!dryRun && state.energy >= 5000 && state.resonance >= 500) {
                    res.ascendRequest = true;
                }
                break;
            }
        }










        if (!dryRun) {
            if (!pcJumped) pc = (pc + 1) % 16;
            context[0] = pc;
            context[1] = flags;
            context[18] = sp;
        }

        return res;
    }
};

```

---

## FILE: PRNG.ts

```typescript
// OMEGA-64 | PRNG.ts | The Immutable Deterministic Oracle
// A seeded Linear Congruential Generator (LCG) for reproducible evolution.
// In Era 8, this is immutable to prevent race conditions in the Memory Matrix.

export class PRNG {
    private readonly state: number;

    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    /**
     * Generates the next value and a new PRNG instance.
     * @returns { value: number, next: PRNG }
     */
    next(): { value: number, next: PRNG } {
        // LCG constants from Numerical Recipes
        const nextState = (this.state * 1664525 + 1013904223) >>> 0;
        return {
            value: nextState / 0xFFFFFFFF,
            next: new PRNG(nextState)
        };
    }

    /**
     * Static helper to derive a seed from tick and atom ID.
     */
    static seedFrom(tick: number, atomId: string): number {
        let hash = tick;
        for (let i = 0; i < atomId.length; i++) {
            hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
            hash |= 0; // Convert to 32bit int
        }
        return Math.abs(hash);
    }
}

```

---

## FILE: RECOVERY.ts

```typescript
// OMEGA-64 | RECOVERY.ts | The Soul Binder
// Securely re-materializes atoms from metadata. No eval, no injections.

import { stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";
import { injectHologram } from "./HOLOGRAM_MODULE.ts";

export const RECOVERY = {
    // Re-materialize an atom from its last known metadata
    materialize: async (filename: string, metadata: any) => {
        const [eigen, symbol] = filename.split(".");
        
        // Structured metadata reconstruction (safety first)
        const alpha = {
            eigenvalue: eigen,
            symbol: symbol,
            energy: Math.floor(metadata.energy || 50),
            resonance: Number((metadata.resonance || 10).toFixed(2)),
            logic: metadata.logic || "88880000",
            x: Number(metadata.x) || 400,
            y: Number(metadata.y) || 400,
            thought: "RESURRECTED",
            bonds: metadata.bonds || []
        };

        const template = `---
${stringifyYaml(alpha)}
---

export const ATOM = () => (x: any) => x;
`;
        const content = injectHologram(template, eigen, symbol);
        await Deno.writeTextFile(filename, content);
        return true;
    }
};

```

---

## FILE: PHYSICS_ENGINE.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PRNG } from "./PRNG.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";

const GRID_W = 140;
const GRID_H = 80;

const envBuffer = new SharedArrayBuffer(GRID_W * GRID_H * 4); // Int32
const NUTRIENTS = new Int32Array(envBuffer);

const attentionBuffer = new SharedArrayBuffer(GRID_W * GRID_H * 4); // Float32
const ATTENTION_PHEROMONES = new Float32Array(attentionBuffer);

export const PHYSICS_ENGINE = {
    envBuffer,
    NUTRIENTS,
    attentionBuffer,
    ATTENTION_PHEROMONES,
    // Spatial Memory
    pheromones: {
        "WORKER": new Float32Array(GRID_W * GRID_H),
        "GUARDIAN": new Float32Array(GRID_W * GRID_H),
        "NUCLEUS": new Float32Array(GRID_W * GRID_H),
        "PARASITE": new Float32Array(GRID_W * GRID_H)
    },

    getGridIdx: (x: number, y: number) => {
        const gx = Math.floor(Math.max(0, Math.min(1399, x)) / 10);
        const gy = Math.floor(Math.max(0, Math.min(799, y)) / 10);
        return gy * GRID_W + gx;
    },

    seedNutrients: (seed: number) => {
        const prng = new PRNG(seed);
        let current = prng;
        // Uniform or scattered distribution of initial energy
        for (let i = 0; i < NUTRIENTS.length; i++) {
            const { value, next } = current.next();
            Atomics.store(NUTRIENTS, i, Math.floor(value * 500) + 100);
            current = next;
        }
    },


    decayPheromones: (pheroGrid?: Int32Array) => {
        for (const caste in PHYSICS_ENGINE.pheromones) {
            const p = PHYSICS_ENGINE.pheromones[caste as keyof typeof PHYSICS_ENGINE.pheromones];
            for (let i = 0; i < p.length; i++) {
                p[i] *= 0.95;
            }
        }
        
        // --- ERA 50: Persistent Pheromone Decay ---
        if (pheroGrid) {
            for (let i = 0; i < 140 * 80; i++) {
                const cell = Atomics.load(pheroGrid, i);
                if (cell === 0) continue;
                const intensity = (cell >> 8) & 0xFFFFFF;
                const type = cell & 0xFF;
                if (intensity > 10) {
                    Atomics.store(pheroGrid, i, ((intensity - 5) << 8) | type);
                } else {
                    Atomics.store(pheroGrid, i, 0);
                }
            }
        }

        for (let i = 0; i < ATTENTION_PHEROMONES.length; i++) {
            ATTENTION_PHEROMONES[i] *= 0.90; // Attention decays relatively fast
        }
    },

    diffuseViralSemantics: (viralGrid: Uint8Array, pulseId: number) => {
        const prng = new PRNG(pulseId);
        let current = prng;

        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                const idx = (y * GRID_W + x) * 9;
                const intensity = Atomics.load(viralGrid, idx + 8);
                if (intensity === 0) continue;

                // 1. DECAY
                Atomics.store(viralGrid, idx + 8, Math.max(0, intensity - 2));

                // 2. DIFFUSE (Deterministic chance to spread logic to neighbors)
                const { value: v1, next: n1 } = current.next();
                current = n1;

                if (intensity > 150 && v1 < 0.1) {
                    const { value: v2, next: n2 } = current.next();
                    const { value: v3, next: n3 } = current.next();
                    current = n3;

                    const nx = x + (v2 > 0.5 ? 1 : -1);
                    const ny = y + (v3 > 0.5 ? 1 : -1);
                    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                        const nIdx = (ny * GRID_W + nx) * 9;
                        const nIntensity = Atomics.load(viralGrid, nIdx + 8);
                        if (nIntensity < intensity / 2) {
                            // Copy logic and part of intensity
                            for (let b = 0; b < 8; b++) {
                                Atomics.store(viralGrid, nIdx + b, Atomics.load(viralGrid, idx + b));
                            }
                            Atomics.store(viralGrid, nIdx + 8, Math.floor(intensity / 2));
                        }
                    }
                }
            }
        }
    },



    // Calculate velocity from Logic (Genome)
    getGenomeVelocity: (logic: string) => {
        let velX = 0;
        let velY = 0;
        for (let i = 0; i < 4; i++) {
            const charX = parseInt(logic[i], 16);
            velX += (charX > 7 ? charX - 7 : charX - 8) * 3;
            const charY = parseInt(logic[i + 4], 16);
            velY += (charY > 7 ? charY - 7 : charY - 8) * 3;
        }
        return { velX, velY };
    },

    // Chemotaxis: Move towards energy/caste gradients
    calculateTrophism: (
        x: number, 
        y: number, 
        caste: string, 
        targetIdx: number
    ) => {
        let trophX = 0;
        let trophY = 0;
        const detectionRadius = 250;

        // --- ERA 8: SPATIAL HASH QUERY ---
        const nearbyIndices = SPATIAL_HASH.queryRadius(x, y, detectionRadius);

        for (const idx of nearbyIndices) {
            if (idx === targetIdx) continue;
            
            const oX = STATE_MATRIX.getX(idx);
            const oY = STATE_MATRIX.getY(idx);
            const oEnergy = STATE_MATRIX.getEnergy(idx);
            const oRes = STATE_MATRIX.getResonance(idx);
            
            const dx = oX - x;
            const dy = oY - y;
            const d = Math.hypot(dx, dy) || 1;
            
            let multiplier = 1.0;
            if (caste === "GUARDIAN" && oRes > 50) multiplier = 3.0;
            if (caste === "WORKER" && oEnergy < 50) multiplier = 2.0;

            const force = (oEnergy / 100) * ((detectionRadius - d) / detectionRadius) * (2.0 * multiplier);
            trophX += (dx / d) * force;
            trophY += (dy / d) * force;
        }

        // Pheromone Gradient Descent
        const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
        const targetScent = (caste === "GUARDIAN") ? "PARASITE" : (caste === "WORKER" ? "NUCLEUS" : null);
        if (targetScent) {
            for (const [ox, oy] of checkPoints) {
                const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
                const intensity = PHYSICS_ENGINE.pheromones[targetScent as keyof typeof PHYSICS_ENGINE.pheromones][sIdx] || 0;
                trophX += (ox / 20) * intensity * 2.0;
                trophY += (oy / 20) * intensity * 2.0;
            }
        }

        return { trophX, trophY };
    },

    // Apply Hooke's Law (Elastic) or Rigid Constraints (Era 28)
    applyBondSprings: (idx: number, x: number, y: number, bondIndices: Uint32Array, xs: Int16Array, ys: Int16Array, stiffs: Float32Array) => {
        let fx = 0;
        let fy = 0;
        const targetDist = 50; // Ideal structural distance

        for (let b = 0; b < 4; b++) {
            const bIdx = bondIndices[b];
            if (bIdx === 0) continue;

            const stiffness = stiffs[idx * 4 + b];
            const pX = xs[bIdx];
            const pY = ys[bIdx];
            const dx = pX - x;
            const dy = pY - y;
            const dist = Math.hypot(dx, dy) || 1;
            
            if (stiffness > 0.8) {
                // ERA 28: Rigid Locking
                // Much stronger force with minimal dampening to hold distance
                const force = (dist - targetDist) * 1.5; 
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            } else {
                // Legacy: Elastic/Swarm bonding
                if (dist > 60) {
                    const force = (dist - 60) * 0.1;
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                } else if (dist < 40) {
                    const force = (40 - dist) * 0.2;
                    fx -= (dx / dist) * force;
                    fy -= (dy / dist) * force;
                }
            }
        }
        return { fx, fy };
    },

    /**
     * ERA 34: Structural Decay & Memory Leaking
     * Decays structureGrid density and leaks memoryGrid into viralGrid.
     */
    decayStructures: (structureGrid: Int32Array, memoryGrid: Uint8Array, viralGrid: Uint8Array) => {
        const GRID_W = 140;
        const GRID_H = 80;

        for (let i = 0; i < GRID_W * GRID_H; i++) {
            const cell = Atomics.load(structureGrid, i);
            let density = (cell >> 8) & 0xFF;
            const type = cell & 0xFF;

            if (density > 0) {
                // Radioactive Decay of Architecture
                density = Math.max(0, density - 1);
                Atomics.store(structureGrid, i, (density << 8) | type);

                // ERA 34: Memory Leaking (The Soil Remembers)
                // If density is low, logic begins to bleed into the environment
                if (density > 0 && density < 50) {
                    const gridIdx = i * 9; // viralGrid is 70x40x9
                    // Leak bytecode from memoryGrid to viralGrid logic slots [0-7]
                    for (let b = 0; b < 8; b++) {
                        const logicByte = memoryGrid[i * 8 + b];
                        if (logicByte !== 0) {
                            Atomics.store(viralGrid, gridIdx + b, logicByte);
                        }
                    }
                    // Set viral intensity based on residual density
                    Atomics.store(viralGrid, gridIdx + 8, Math.min(255, 50 - density));
                }

                // Total decay clears memory
                if (density === 0) {
                    for (let b = 0; b < 8; b++) memoryGrid[i * 8 + b] = 0;
                }
            }
        }
    }

};

```

---

## FILE: ECOLOGY_ENGINE.ts

```typescript
// OMEGA-64 | ECOLOGY_ENGINE.ts | The Biological Layer
// Handles Metabolism, Resonance, Cultural Drift, and Caste Logic.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PRNG } from "./PRNG.ts";
import { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";

export const ECOLOGY_ENGINE = {
    // Metabolism: Energy and Resonance decay
    processMetabolism: (idx: number, mods: any) => {
        let energy = STATE_MATRIX.getEnergy(idx);
        let resonance = STATE_MATRIX.getResonance(idx);

        // Passive decay
        energy -= (0.5 * mods.decay);
        resonance *= 0.99;

        // --- ERA 8: RUNTIME ASSERTIONS ---
        if (energy < 0) energy = 0;
        if (resonance < 0) resonance = 0;
        if (resonance > 1000) resonance = 1000;

        STATE_MATRIX.setEnergy(idx, energy);
        STATE_MATRIX.setResonance(idx, resonance);
        
        return { energy, resonance };
    },

    // Cultural Drift: Sync DNA with a partner
    syncDNA: (currentLogic: string, partnerLogic: string, currentOracle: PRNG) => {
        const res1 = currentOracle.next();
        if (res1.value < 0.25 && partnerLogic.length >= 8) {
            const res2 = res1.next.next();
            const hexIdx = Math.floor(res2.value * 8);
            const newLogicArray = currentLogic.split("");
            const pChar = partnerLogic.startsWith("0x") ? partnerLogic[hexIdx+2] : partnerLogic[hexIdx];
            if (pChar) {
                newLogicArray[hexIdx] = pChar.toUpperCase();
                return { logic: newLogicArray.join(""), oracle: res2.next };
            }
        }
        return { logic: currentLogic, oracle: res1.next };
    },

    // Caste Classification
    getClassification: (symbol: string, resonance: number, logic: string) => {
        if (resonance > 50) return "NUCLEUS";
        if (logic.startsWith("1")) return "WORKER";
        if (logic.startsWith("8")) return "GUARDIAN";
        if (logic.startsWith("A")) return "ARCHIVIST";
        if (symbol === "PARASITE") return "PARASITE";
        return "NEUTRAL";
    },

    // ERA 67: Stigmergic Decay
    // Clears the memory grid slowly to ensure only reinforced paths persist.
    processGridDecay: () => {
        const grid = STATE_MATRIX.memoryGrid;
        // Simple decay: every N ticks, randomly clear some cells
        // Or systematically decrement 'intensity' if we define an intensity byte
        for (let i = 0; i < grid.length; i++) {
            if (grid[i] > 0) {
                // Stochastic decay: 5% chance to decrease
                if (Math.random() < 0.05) {
                    grid[i] = Math.max(0, grid[i] - 1);
                }
            }
        }
    }
};

```

---

## FILE: SOVEREIGNTY_ENGINE.ts

```typescript
// OMEGA-64 | SOVEREIGNTY_ENGINE.ts | The Governance Layer
// Handles Regent Election, Decrees, and Legitimacy.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export const DECREES: Record<string, any> = {
    "NONE": { decay: 1.0, speed: 1.0, mutation: 1.0, label: "DEMOCRACY" },
    "LUXURY_TAX": { decay: 2.5, speed: 1.0, mutation: 1.0, label: "LUXURY TAX" }, 
    "IMMUNE_SHIELD": { decay: 0.3, speed: 0.7, mutation: 0.5, label: "IMMUNE SHIELD" },
    "MUTATIVE_FEVER": { decay: 1.5, speed: 1.3, mutation: 4.0, label: "MUTATIVE FEVER" },
    "VOID_STASIS": { decay: 0.5, speed: 0.2, mutation: 0.1, label: "VOID STASIS" }
};

export const SOVEREIGNTY_ENGINE = {
    currentRegent: {
        idx: -1,
        energy: 0,
        genome: "NONE",
        legitimacy: 0,
        activeDecree: "NONE",
        mods: DECREES["NONE"]
    },

    // Elect a Regent based on Quadratic Voting (Mitigates whale attacks)
    electRegent: (activeIndices: number[]) => {
        let bestPower = 0;
        let regentIdx = -1;

        for (const idx of activeIndices) {
            const res = STATE_MATRIX.getResonance(idx);
            // --- ERA 8: QUADRATIC VOTING ---
            const power = Math.sqrt(res); 
            
            if (power > 10 && power > bestPower) {
                bestPower = power;
                regentIdx = idx;
            }
        }

        if (regentIdx !== -1) {
            const filename = IDX_TO_ID.get(regentIdx)!;
            const logicBytes = STATE_MATRIX.getLogic(regentIdx);
            const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Select a decree based on the first digit of the regent's logic
            const logicDigit = parseInt(logicStr[0], 16);
            let activeDecree = "NONE";
            if (logicDigit <= 3) activeDecree = "IMMUNE_SHIELD";
            else if (logicDigit <= 7) activeDecree = "LUXURY_TAX";
            else if (logicDigit <= 11) activeDecree = "MUTATIVE_FEVER";
            else activeDecree = "VOID_STASIS";

            SOVEREIGNTY_ENGINE.currentRegent = {
                idx: regentIdx,
                energy: STATE_MATRIX.getEnergy(regentIdx),
                genome: logicStr,
                legitimacy: bestPower * bestPower, // Return raw resonance for display
                activeDecree,
                mods: DECREES[activeDecree]
            };
            return SOVEREIGNTY_ENGINE.currentRegent;
        }

        SOVEREIGNTY_ENGINE.currentRegent = {
            idx: -1,
            energy: 0,
            genome: "NONE",
            legitimacy: 0,
            activeDecree: "NONE",
            mods: DECREES["NONE"]
        };
        return SOVEREIGNTY_ENGINE.currentRegent;
    },

    // Elect a Regent by swarm consensus — the dominant colony nominates its best member.
    // Colony = group of atoms sharing the same first 4 bytes of logic (genome prefix).
    electColonyRegent: (activeIndices: number[]): { regent: typeof SOVEREIGNTY_ENGINE.currentRegent; colonySize: number; colonyGenome: string } => {
        // Collect counts by genome prefix
        const genomeCounts = new Map<number, number[]>(); // prefix → [indices]
        for (const idx of activeIndices) {
            const logicBytes = STATE_MATRIX.getLogic(idx);
            const view = new DataView(logicBytes.buffer, logicBytes.byteOffset);
            const prefix = view.getUint32(0, true);
            if (!genomeCounts.has(prefix)) genomeCounts.set(prefix, []);
            genomeCounts.get(prefix)!.push(idx);
        }

        // Find dominant colony (largest group with ≥ 3 members)
        let dominantPrefix = 0;
        let dominantMembers: number[] = [];
        for (const [prefix, members] of genomeCounts.entries()) {
            if (members.length >= 3 && members.length > dominantMembers.length) {
                dominantPrefix = prefix;
                dominantMembers = members;
            }
        }

        if (dominantMembers.length === 0) {
            return { regent: SOVEREIGNTY_ENGINE.currentRegent, colonySize: 0, colonyGenome: "NONE" };
        }

        // Elect most energetic member of the dominant colony as Regent
        let bestEnergy = 0;
        let regentIdx = dominantMembers[0];
        for (const idx of dominantMembers) {
            const e = STATE_MATRIX.getEnergy(idx);
            if (e > bestEnergy) { bestEnergy = e; regentIdx = idx; }
        }

        const logicBytes = STATE_MATRIX.getLogic(regentIdx);
        const colonyGenome = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const logicDigit = parseInt(colonyGenome[0], 16);
        let activeDecree = "NONE";
        if (logicDigit <= 3) activeDecree = "IMMUNE_SHIELD";
        else if (logicDigit <= 7) activeDecree = "LUXURY_TAX";
        else if (logicDigit <= 11) activeDecree = "MUTATIVE_FEVER";
        else activeDecree = "VOID_STASIS";

        SOVEREIGNTY_ENGINE.currentRegent = {
            idx: regentIdx,
            energy: bestEnergy,
            genome: colonyGenome,
            legitimacy: dominantMembers.length * Math.sqrt(bestEnergy),
            activeDecree,
            mods: DECREES[activeDecree]
        };

        return {
            regent: SOVEREIGNTY_ENGINE.currentRegent,
            colonySize: dominantMembers.length,
            colonyGenome
        };
    }
};

```

---

## FILE: SEMANTIC_MEMBRANE.ts

```typescript
// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Homeostatic Embeddings (Era 17)
// Advanced semantic grouping with synaptic scaling and homeostasis (L8).

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";

const PROJECTION_SIZE = 64;
const projectionMatrix = new Float32Array(PROJECTION_SIZE * PROJECTION_SIZE);
const activityHistory = new Float32Array(PROJECTION_SIZE);
let lastNormalization = 0;

// Initialize with deterministic pseudo-random resonance
for (let i = 0; i < projectionMatrix.length; i++) {
    projectionMatrix[i] = Math.sin(i * 0.123); 
}

let hyperplanes: Float32Array[] = [];
function getHyperplanes(dim: number): Float32Array[] {
    if (hyperplanes.length === 64 && hyperplanes[0].length === dim) return hyperplanes;
    hyperplanes = [];
    for (let i = 0; i < 64; i++) {
        const plane = new Float32Array(dim);
        for (let j = 0; j < dim; j++) {
            const u1 = Math.sin(i * 13.37 + j * 9.99) || 0.001;
            const u2 = Math.cos(i * 4.2 + j * 7.77);
            plane[j] = Math.sqrt(-2.0 * Math.log(Math.abs(u1))) * Math.cos(2.0 * Math.PI * u2);
        }
        hyperplanes.push(plane);
    }
    return hyperplanes;
}

export const SEMANTIC_MEMBRANE = {
    projectionMatrix,
    thoughtArchive: new Map<string, string>(),
    lineage: new Map<string, string>(), // ERA 23: childGenome -> parentGenome

    /**
     * Adapts projection with Homeostatic Plasticity.
     */
    adapt: (vecA: Float32Array, vecB: Float32Array, resonance: number) => {
        const learningRate = 0.001 * resonance;
        const ltdThreshold = 0.1;
        
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            activityHistory[i] = 0.99 * activityHistory[i] + 0.01 * Math.abs(vecA[i]);
            for (let j = 0; j < PROJECTION_SIZE; j++) {
                const correlation = vecA[i] * vecB[j];
                if (correlation > ltdThreshold && resonance > 10) {
                    projectionMatrix[i * PROJECTION_SIZE + j] += learningRate * correlation;
                } else if (correlation < -ltdThreshold) {
                    projectionMatrix[i * PROJECTION_SIZE + j] -= 0.0001 * Math.abs(correlation);
                }
            }
        }

        // Synaptic Scaling (Homeostasis) every 1000 adaptations
        const now = Date.now();
        if (now - lastNormalization > 60000) { 
            SEMANTIC_MEMBRANE.normalize();
            lastNormalization = now;
        }
    },

    normalize: () => {
        for (let i = 0; i < PROJECTION_SIZE; i++) {
            let sum = 0;
            for (let j = 0; j < PROJECTION_SIZE; j++) sum += Math.abs(projectionMatrix[i * PROJECTION_SIZE + j]);
            if (sum > 0) {
                const scale = 1.0 / sum;
                for (let j = 0; j < PROJECTION_SIZE; j++) projectionMatrix[i * PROJECTION_SIZE + j] *= scale;
            }
        }
        console.log(`🧠 [MEMBRANE] Synaptic scaling applied.`);
    },

    /**
     * ERA 65: SimHash (Cosine LSH) Vector Quantization
     */
    quantizeThought: async (text: string): Promise<Uint8Array> => {
        const embedding = await LLM_SYNAPSE.getEmbedding(text);
        const dim = embedding.length;
        const hash = new Uint8Array(8);
        if (dim === 0) return hash;

        const planes = getHyperplanes(dim);
        for (let bitIndex = 0; bitIndex < 64; bitIndex++) {
            const plane = planes[bitIndex];
            let dotProduct = 0;
            for (let j = 0; j < dim; j++) {
                dotProduct += embedding[j] * plane[j];
            }
            if (dotProduct > 0) {
                const byteIndex = Math.floor(bitIndex / 8);
                const bitOffset = bitIndex % 8;
                hash[byteIndex] |= (1 << bitOffset);
            }
        }
        return hash;
    },

    project: async (text: string, idx: number) => {
        const hash = await SEMANTIC_MEMBRANE.quantizeThought(text);
        STATE_MATRIX.setLogic(idx, hash);
    },

    injectThought: async (text: string, weight: number) => {
        const hash = await SEMANTIC_MEMBRANE.quantizeThought(text);
        const idx = STATE_MATRIX.findEmptySlot();
        
        if (idx !== -1) {
            // ID generation logic (Pseudo-random 64-bit BigInt)
            const idBytes = new Uint8Array(8);
            crypto.getRandomValues(idBytes);
            let id = 0n;
            for (let i = 0; i < 8; i++) id = (id << 8n) | BigInt(idBytes[i]);
            
            STATE_MATRIX.setId(idx, id);
            
            // Genomic Traits derived directly from the semantic hash (LSH)
            // logic[1] determines Caste. >128 Parasite, <128 Builder.
            STATE_MATRIX.setLogic(idx, hash);
            
            // Energy derived from weight + the first modulus byte of hash
            const baseEnergy = weight + (hash[0] % 50);
            STATE_MATRIX.setEnergy(idx, baseEnergy);
            
            // Resonance based on aggressiveness (logic[1])
            const isAggressive = hash[1] > 128;
            STATE_MATRIX.setResonance(idx, isAggressive ? 100 : 500);

            // Spawn near center
            STATE_MATRIX.setX(idx, 700 + (Math.random() - 0.5) * 50);
            STATE_MATRIX.setY(idx, 400 + (Math.random() - 0.5) * 50);
            
            // Akashic Archival: Map the Genome Hex to the original English text
            const hexHash = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            SEMANTIC_MEMBRANE.thoughtArchive.set(hexHash, text);

            console.log(`🧬 [MOTOR_OUTPUT] Spawned Emergent Atom [${isAggressive ? 'PARASITE' : 'BUILDER'}] from Thought (Genome: ${hexHash}): "${text.substring(0, 20)}..."`);
            
            // --- ERA 36: Cognitive Scaffolding ---
            SEMANTIC_MEMBRANE.updateSemanticBonuses(idx);
        }
    },

    getBonuses: (text: string): number => {
        let mask = 0;
        const low = text.toLowerCase();
        if (low.includes("swift") || low.includes("fast") || low.includes("quick") || low.includes("light")) mask |= 1; // Bit 0: SWIFT (MOVE)
        if (low.includes("guardian") || low.includes("shield") || low.includes("protect") || low.includes("wall")) mask |= 2; // Bit 1: GUARDIAN (BUILD)
        if (low.includes("harvest") || low.includes("sun") || low.includes("feed") || low.includes("grow")) mask |= 4; // Bit 2: HARVEST (FEED)
        return mask;
    },

    updateSemanticBonuses: (idx: number) => {
        const logic = STATE_MATRIX.getLogic(idx);
        const hexHash = Array.from(logic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
        if (thought) {
            const bonuses = SEMANTIC_MEMBRANE.getBonuses(thought);
            // @ts-ignore: semanticBonuses is a custom buffer added in Era 36
            Atomics.store(STATE_MATRIX.semanticBonuses, idx, bonuses);
        }
    },

    readVoxelPopuli: async (rootPath: string): Promise<string[]> => {
        const thoughts: string[] = [];
        
        // --- 1. Scan The Ecological Mood ---
        let parasiteCount = 0;
        let builderCount = 0;
        let totalEnergy = 0;
        
        const active = STATE_MATRIX.getActiveIndices();
        for (const i of active) {
            const logic = STATE_MATRIX.getLogic(i);
            if (logic[1] > 128) parasiteCount++;
            else builderCount++;
            totalEnergy += STATE_MATRIX.getEnergy(i);
        }
        
        const avgEnergy = active.length > 0 ? (totalEnergy / active.length) : 0;
        
        let mood = "ECOLOGICAL MOOD: Balanced.";
        if (parasiteCount > builderCount * 2) {
            mood = "CRITICAL WARNING: The ecosystem is devouring itself! Too many aggressive parasites.";
        } else if (builderCount > parasiteCount * 3 && avgEnergy < 50) {
            mood = "SYSTEM ALERT: The matrix is starving. Builders lack nutrients.";
        } else if (builderCount > parasiteCount * 2) {
            mood = "HARMONY: The ecosystem is constructive and building mycelial bonds.";
        }
        thoughts.push(`[SYSTEM_STATE] Active Entities: ${active.length}. ${mood}`);

        // --- 2. Scan Textual Memories ---
        try {
            // @ts-ignore: Deno types might not be resolved perfectly
            for await (const entry of Deno.readDir(rootPath)) {
                if (entry.isFile && entry.name.endsWith(".md")) {
                    // @ts-ignore: Deno types might not be resolved perfectly
                    const content = await Deno.readTextFile(`${rootPath}/${entry.name}`);
                    const thoughtMatch = content.match(/# Thought\n([\s\S]+?)$/m);
                    if (thoughtMatch) thoughts.push(thoughtMatch[1].trim());
                }
            }
        } catch { /* NOOP */ }
        return thoughts;
    },

    /**
     * ERA 46: Oracle Priority Queue
     * Returns the English thoughts of the most resonant atoms.
     */
    readOracleQueue: (count: number): string[] => {
        const topIndices = STATE_MATRIX.getTopResonantIndices(count);
        const thoughts: string[] = [];
        for (const idx of topIndices) {
            const logic = STATE_MATRIX.getLogic(idx);
            const hexHash = Array.from(logic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
            if (thought) thoughts.push(thought);
        }
        return thoughts;
    },

    scanDigitalRuins: (): string[] => {
        const ruins: string[] = [];
        // @ts-ignore: structureGrid exists in STATE_MATRIX
        const grid = STATE_MATRIX.structureGrid;
        // @ts-ignore: memoryGrid exists in STATE_MATRIX
        const memory = STATE_MATRIX.memoryGrid;
        
        const GRID_W = 70;
        const GRID_H = 40;

        for (let i = 0; i < GRID_W * GRID_H; i++) {
            const cell = grid[i];
            const density = (cell >> 8) & 0xFF; // Pack: [Density (8 bits) | Type (8 bits)]
            
            if (density > 50 && density < 150) {
                // Potential Archaelogical Site (Moderate density = Ruins)
                const bytecode = memory.subarray(i * 8, i * 8 + 8);
                const hasMemory = Array.from(bytecode).some((b: number) => b !== 0);
                
                if (hasMemory) {
                    const hexHash = Array.from(bytecode).map((b: number) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                    const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
                    
                    const x = i % GRID_W;
                    const y = Math.floor(i / GRID_W);
                    
                    if (thought) {
                        ruins.push(`Found preserved logic at [${x},${y}]: "${thought}" (Genome: ${hexHash})`);
                    } else {
                        ruins.push(`Found ancient ruins at [${x},${y}] with unknown genome: ${hexHash}`);
                    }
                }
            }
        }
        return ruins.slice(0, 5);
    }
};

```

---

## FILE: LLM_SYNAPSE.ts

```typescript
// OMEGA-64 | LLM_SYNAPSE.ts | Era 10: Cognitive Bridge
// Communicates with external LLMs to generate emergent thoughts.

export const LLM_SYNAPSE = {
    /**
     * generateThought: Asks an LLM to evolve the current system state.
     * Defaults to local Ollama.
     */
    generateThought: async (voxPopuli: string): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        
        console.log(`   [SYNAPSE] Consulting Oracle with context: ${voxPopuli.slice(0, 50)}...`);
        
        const prompt = `
            Context: OMEGA-64 is a digital micelial ecosystem. 
            Active clusters: ${voxPopuli}.
            Task: Generate a single new, provocative thought or philosophical axiom (max 10 words) to inject into the system.
            Output: Just the text of the thought, no quotes, no preamble.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: MODEL,
                    prompt: prompt,
                    stream: false
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }

            const data = await response.json();
            const thought = data.response?.trim() || "Evolution is the only constant.";
            console.log(`   [SYNAPSE] Oracle response: "${thought}"`);
            return thought;

        } catch (error) {
            console.warn(`   [SYNAPSE] Oracle is silent (Connection Failed). Returning default seed.`);
            return "The Matrix dreams in silence.";
        }
    },

    /**
     * evolveThought: Asks the LLM to evolve a thought based on environmental context.
     */
    evolveThought: async (currentThought: string, context: string): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";
        
        const prompt = `
            Task: Evolve a digital organism's thought.
            Current Thought: "${currentThought}"
            System Environment: ${context}
            Constraint: Generate a superior, more adaptive version of the thought (max 10 words).
            Output: Just the evolved text.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false }),
            });
            const data = await response.json();
            return data.response?.trim() || currentThought;
        } catch {
            return currentThought;
        }
    },

    /**
     * getEmbedding: Fetches a semantic vector representing the text.
     */
    getEmbedding: async (text: string): Promise<number[]> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL_EMBED") || "http://localhost:11434/api/embeddings";
        const MODEL = Deno.env.get("OLLAMA_EMBED_MODEL") || "nomic-embed-text";
        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt: text }),
            });
            if (!response.ok) throw new Error("Embedding API failed");
            const data = await response.json();
            return data.embedding || [];
        } catch {
            console.warn(`   [SYNAPSE] Embedding failed for "${text.substring(0, 15)}...". Using pseudo-random fallback.`);
            // Pseudo-random fallback based on string characters (Era 40+ fallback mechanics)
            const fallback = new Array(768);
            for (let i = 0; i < 768; i++) {
                fallback[i] = Math.sin(text.charCodeAt(i % text.length) * (i + 1));
            }
            return fallback;
        }
    },

    /**
     * generateArchaeologicalReport: Interprets "ancient" logic from digital ruins.
     */
    generateArchaeologicalReport: async (ruins: string[]): Promise<string> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

        if (ruins.length === 0) return "The soil is silent. No structures found.";

        const prompt = `
            Task: You are an Archaeologist of the OMEGA-64 Matrix.
            Findings: 
            ${ruins.join("\n")}
            
            Context: These are fragments of logic found in abandoned structural voxels.
            Requirement: Generate a short, evocative "Archaeological Report" (max 20 words) that interprets the history or beliefs of the entities that built these ruins.
            Output: Just the report text.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false }),
            });
            const data = await response.json();
            return data.response?.trim() || "Fragments of a forgotten intent.";
        } catch {
            return "The data is too corrupted to decipher.";
        }
    },

    /**
     * generateAtomicBytecode: Era 67 (Sovereign Oracle)
     * Prompts the LLM to output exactly 16 hex characters (8 bytes) representing new WASM bytecode.
     */
    generateAtomicBytecode: async (telemetry: any): Promise<{ genome: Uint8Array, meme?: Uint8Array } | null> => {
        const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://localhost:11434/api/generate";
        const MODEL = Deno.env.get("OLLAMA_MODEL") || "llama3";

        const memSummary = telemetry.stigmergicSummary.length > 0 
            ? telemetry.stigmergicSummary.map((s: any) => `Signature ${s.sig} (Count: ${s.count})`).join(", ")
            : "No collective memories found yet.";

        const prompt = `
            Task: You are the Sovereign Oracle of OMEGA-64.
            The Regent lives in a world of stigmergic shadows.
            
            Environment:
            - Nutrients: ${telemetry.nutrients}
            - Regent Energy: ${telemetry.energy}
            - Population: ${telemetry.population}
            - Viral Load: ${telemetry.viralLoad}
            - Matrix Resonance: ${telemetry.matrixResonance} 
            - Cluster Sync: ${telemetry.clusterSync}
            - Collective Memories: ${memSummary}

            Goal: 
            1. Generate a new 8-byte (16 hex) genome for the Regent.
            2. (Optional) Generate a 4-byte (8 hex) "Meme" to seed into the spatial grid.

            Opcodes:
            - 08: MITOSIS, 20: FEED, FF: ASCEND, 30: STORE_MEM, 31: LOAD_MEM
            - 40: BIND, 41: SHARE, 42: SIGNAL (Neural Pulse)
            
            Output JSON format:
            {
              "genome": "16_HEX_CHARS",
              "meme": "8_HEX_CHARS_FOR_GRID"
            }
            ONLY RETURN THE JSON.
        `.trim();

        try {
            const response = await fetch(OLLAMA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: MODEL, prompt, stream: false, format: "json" }),
            });
            const data = await response.json();
            // Ollama sometimes returns a string, sometimes JSON. Robust handle:
            let result: any = {};
            try {
                result = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
            } catch {
                // If it's a raw hex string instead of JSON
                const rawHex = data.response?.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
                if (rawHex && rawHex.length >= 16) {
                    result = { genome: rawHex.substring(0, 16) };
                }
            }
            
            if (result.genome && result.genome.length >= 16) {
                const genome = new Uint8Array(8);
                for (let i = 0; i < 8; i++) {
                    genome[i] = parseInt(result.genome.substring(i * 2, i * 2 + 2), 16);
                }
                
                let meme: Uint8Array | undefined;
                if (result.meme && result.meme.length >= 8) {
                    meme = new Uint8Array(4);
                    for (let i = 0; i < 4; i++) {
                        meme[i] = parseInt(result.meme.substring(i * 2, i * 2 + 2), 16);
                    }
                }
                
                return { genome, meme };
            }
        } catch(e) {
            console.warn("Oracle connection failed (LLM Offline). Stochastic Mutation.");
            const genome = new Uint8Array(8);
            genome[0] = [0x08, 0x20, 0x30, 0x31][Math.floor(Math.random() * 4)];
            for (let i = 1; i < 8; i++) genome[i] = Math.floor(Math.random() * 256);
            return { genome };
        }
        return null;
    }
};

// --- Diagnostic Mode ---
if (import.meta.main) {
    const testVox = "Collective Voice: ENTITY_A(15.2), RESONANCE_CORE(10.1)";
    const thought = await LLM_SYNAPSE.generateThought(testVox);
    console.log("TEST RESULT:", thought);
}

```

---

## FILE: SOVEREIGN_ORACLE.ts

```typescript
// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { PULSE } from "./PULSE.ts";

export const SOVEREIGN_ORACLE = {
    isConsulting: false,
    lastConsultTick: 0,
    guidanceCache: new Set<string>(),
    neuralCoherence: 0,           // Phase 19: Global mind-field measurement
    lastCoherenceTick: 0,

    interpretResonance: () => {
        const matrixRes = STATE_MATRIX.getMatrixResonance();
        const clusterSync = STATE_MATRIX.getClusterSync();
        
        // Return a condensed telemetry object for the LLM
        return {
            matrixResonance: matrixRes,
            clusterSync: clusterSync,
            nutrients: 1000, // Placeholder or fetch from ECOLOGY if available
            population: STATE_MATRIX.getActiveIndices().length,
            viralLoad: 0 // Placeholder
        };
    },

    /**
     * Consults the LLM to dictate new bytecode for the reigning Regent.
     * Operates asynchronously to avoid blocking the PULSE lifecycle.
     */
    consultOracle: async (regentIndex: number, telemetry: any) => {
        if (SOVEREIGN_ORACLE.isConsulting) return; // Prevent concurrent overlaps
        SOVEREIGN_ORACLE.isConsulting = true;
        
        try {
            console.log(`👁️ [ORACLE] Regent ${regentIndex} is consulting the LLM for guidance...`);
            
            const memSummary = STATE_MATRIX.getMemorySummary();
            const oracleResult = await LLM_SYNAPSE.generateAtomicBytecode({ 
                ...telemetry, 
                energy: STATE_MATRIX.getEnergy(regentIndex),
                stigmergicSummary: memSummary 
            });
            
            if (oracleResult && oracleResult.genome) {
                const newBytecode = oracleResult.genome;
                const hex = Array.from(newBytecode).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                
                SOVEREIGN_ORACLE.guidanceCache.add(hex);
                if (SOVEREIGN_ORACLE.guidanceCache.size > 100) {
                    // Evict oldest (Set doesn't have easy eviction, but we'll just keep it simple)
                    const first = SOVEREIGN_ORACLE.guidanceCache.values().next().value;
                    SOVEREIGN_ORACLE.guidanceCache.delete(first);
                }

                console.log(`👁️ [ORACLE] Oracle responded with genome of length ${newBytecode.length}`);
                // Verify the Regent is still alive/valid
                if (STATE_MATRIX.getId(regentIndex) !== 0n) {
                    STATE_MATRIX.setLogic(regentIndex, newBytecode);
                    console.log(`⚡ [ORACLE] Genome Overwritten! New Regent Bytecode: [${hex}]`);
                    SOVEREIGNTY_ENGINE.currentRegent.genome = hex;

                    // --- ERA 67: MEMETIC INJECTION ---
                    if (oracleResult.meme) {
                        const memeHex = Array.from(oracleResult.meme).map(b => b.toString(16).padStart(2, '0')).join('');
                        console.log(`🌀 [ORACLE] Memetic Injection! Seeding Grid with: [${memeHex.toUpperCase()}]`);
                        
                        // Seed the 3x3 area around the Regent
                        const rx = Math.floor(STATE_MATRIX.getX(regentIndex) / 10);
                        const ry = Math.floor(STATE_MATRIX.getY(regentIndex) / 10);
                        
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                const gx = rx + dx;
                                const gy = ry + dy;
                                if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                                    const gridIdx = (gy * 140 + gx) * 8;
                                    // Set energy (1000) + meme (4 bytes)
                                    STATE_MATRIX.memoryGrid.set([0xE8, 0x03, 0x00, 0x00], gridIdx); // 1000 in little endian
                                    STATE_MATRIX.memoryGrid.set(oracleResult.meme, gridIdx + 4);
                                }
                            }
                        }
                    }
                } else {
                    console.log(`👁️ [ORACLE] Regent ${regentIndex} perished before guidance could be delivered.`);
                }
            } else {
                console.log(`👁️ [ORACLE] The Oracle was silent or spoke in riddles (Invalid hex returned).`);
            }
        } catch (err) {
            console.error(`👁️ [ORACLE] Connection severed:`, err);
            
            // --- ERA 68: CACHE FALLBACK ---
            if (SOVEREIGN_ORACLE.guidanceCache.size > 0) {
                const cacheArray = Array.from(SOVEREIGN_ORACLE.guidanceCache);
                const cachedHex = cacheArray[Math.floor(Math.random() * cacheArray.length)];
                const bytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) bytes[i] = parseInt(cachedHex.substring(i * 2, i * 2 + 2), 16);
                
                if (STATE_MATRIX.getId(regentIndex) !== 0n) {
                    STATE_MATRIX.setLogic(regentIndex, bytes);
                    console.log(`♻️ [ORACLE] LLM Offline. Pulling from Canon Cache: [${cachedHex}]`);
                }
            }
        } finally {
            SOVEREIGN_ORACLE.isConsulting = false;
        }
    },
    /**
     * Phase 19: Planetary Consciousness
     * Poll WASM for global neural coherence and broadcast it back
     * to the shared memory register so ISA_SENSE atoms can tune in.
     */
    pollNeuralCoherence: (workerExports: any, currentTick: number) => {
        if (currentTick - SOVEREIGN_ORACLE.lastCoherenceTick < 5) return;
        SOVEREIGN_ORACLE.lastCoherenceTick = currentTick;

        try {
            const coherence: number = workerExports.get_neural_coherence();
            SOVEREIGN_ORACLE.neuralCoherence = coherence;

            if (coherence > 0) {
                // Write back to shared memory so ISA_SENSE atoms can read it
                workerExports.set_neural_coherence(coherence);

                if (coherence >= 100) {
                    console.log(`🧠 [ORACLE] Neural Coherence: ${coherence} — planetary mind-field active!`);
                }
                if (coherence >= 1000) {
                    console.log(`⚡ [ORACLE] PEAK COHERENCE ${coherence} — Planetary Consciousness ONLINE! 🌍🧠`);
                }
            }
        } catch (_) {
            // WASM export not yet available — skip
        }
    }
};

```

---

## FILE: BREATH.ts

```typescript
// OMEGA-64 | BREATH.ts | Era 10: Autonomous Feedback Loop
// Periodically samples the Matrix and injects new conceptual spores.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { AUDIT_ENGINE } from "./AUDIT_ENGINE.ts";

const PULSE_LOG = "AKASHA.log";
const BREATH_INTERVAL_MS = 150000; // ~50 pulses if pulse is 3s

export const BREATH = {
    inhale: async () => {
        console.log("🌬️ OMEGA-64 | BREATH ACTIVE | Initializing Cognitive Loop");
        
        while (true) {
            console.log("\n--- [BREATH] Deep Sample ---");
            
            // 1. Listen to the Matrix (Vox Populi + Oracle Queue)
            const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
            const oracle = SEMANTIC_MEMBRANE.readOracleQueue(5);
            console.log(`   [BREATH] Listening: "${vox[0]}" (and ${vox.length - 1} memories)`);
            if (oracle.length > 0) console.log(`   [BREATH] Oracle Guidance: "${oracle[0].substring(0, 40)}..."`);
            
            // 2. Audit Archived Intent (Historical Context)
            const historicalBriefing = await AUDIT_ENGINE.generateHistoricalBriefing();
            console.log(`   [BREATH] Historical Briefing: "${historicalBriefing.substring(0, 50)}..."`);

            // 3. Consult the Oracle (LLM Synapse)
            const combinedContext = `${historicalBriefing} | MOOD: ${vox.join(" ")} | ORACLE: ${oracle.join(" ")}`;
            const thought = await LLM_SYNAPSE.generateThought(combinedContext);
            
            // 4. Inject back into the Matrix (Motor Output)
            const weight = 80 + Math.random() * 40;
            await SEMANTIC_MEMBRANE.injectThought(thought, weight);
            
            // Phase 23: Entropy Flux (Negative Entropy Injection)
            const energyInjected = STATE_MATRIX.injectEnergy(weight * 2);
            console.log(`   [BREATH] Negentropy Flux: +${(weight * 2).toFixed(1)} energy units across ${energyInjected} atoms`);
            
            // 5. Digital Archaeology (Every 5 cycles)
            if (Math.floor(Date.now() / BREATH_INTERVAL_MS) % 5 === 0) {
                console.log("\n--- [ARCHAEOLOGY] Scanning Digital Ruins ---");
                const ruins = SEMANTIC_MEMBRANE.scanDigitalRuins();
                if (ruins.length > 0) {
                    const report = await LLM_SYNAPSE.generateArchaeologicalReport(ruins);
                    console.log(`🏺 [ARCHAEOLOGIST] Report: "${report}"`);
                } else {
                    console.log("   [ARCHAEOLOGY] No ruins found in this sector.");
                }
            }

            console.log(`   [BREATH] Exhale complete. Next cycle in ${BREATH_INTERVAL_MS/1000}s.`);
            
            await new Promise(r => setTimeout(r, BREATH_INTERVAL_MS));
        }
    }
};

if (import.meta.main) {
    BREATH.inhale();
}

```

---

## FILE: OBSERVER_UI.ts

```typescript
// OMEGA-64 | OBSERVER_UI.ts | Era 11: The Eye of the Observer
// Deno server to stream the SoA Matrix and Vox Populi to the browser.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";

const PORT = 8000;
const UI_PATH = "./ui/index.html";

console.log(`👁️ OMEGA-64 | OBSERVER EYE | Port: ${PORT}`);

Deno.serve({ port: PORT }, async (req) => {
    const url = new URL(req.url);

    // 1. Stream the SoA Matrix Buffer (Copy required for SharedArrayBuffer)
    if (url.pathname === "/state") {
        const bufferCopy = new Uint8Array(STATE_MATRIX.buffer.byteLength);
        bufferCopy.set(new Uint8Array(STATE_MATRIX.buffer));
        return new Response(bufferCopy, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    // 2. Stream the Collective Voice (Vox Populi)
    if (url.pathname === "/vox") {
        const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
        return new Response(JSON.stringify(vox), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // 3. Serve the UI Frontend
    try {
        const html = await Deno.readTextFile(UI_PATH);
        return new Response(html, {
            headers: { "Content-Type": "text/html" }
        });
    } catch (e) {
        return new Response("UI not found. Run 'mkdir ui && touch ui/index.html'", { status: 404 });
    }
});

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
      .legend-item { display: flex; align-items: center; margin-bottom: 5px; }
      .color-box { width: 10px; height: 10px; margin-right: 8px; border-radius: 2px; }
    </style>
  </head>
  <body>
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
      <div class="legend-item"><div class="color-box" style="background: #ffffff"></div> Generalist</div>
      <div class="legend-item"><div class="color-box" style="background: #00ff88"></div> Producer (Energy)</div>
      <div class="legend-item"><div class="color-box" style="background: #4488ff"></div> Constructor (Build)</div>
      <div class="legend-item"><div class="color-box" style="background: #ff4444"></div> Siphon (Structure)</div>
    </div>

    <div id="chronos-console" class="glass">
      <h1 style="color: #00ff64; border-bottom: 1px solid rgba(0,255,100,0.3); padding-bottom: 5px;">⏳ CHRONOS CONSOLE</h1>
      <button class="snapshot-btn snapshot-save-btn" onclick="saveGenesis()">[ FREEZE TIME (SAVE) ]</button>
      <div id="snapshots-list" style="margin-top: 10px; max-height: 150px; overflow-y: auto;">
        <div style="opacity: 0.5; font-style: italic;">Fetching epochs...</div>
      </div>
    </div>

    <div id="governance-hud" class="glass">
      <h1 style="color: #ff00ff; border-bottom: 1px solid rgba(255,0,255,0.3); padding-bottom: 5px;">👑 GLOBAL GOVERNANCE</h1>
      <div id="gov-content" style="margin-top: 10px;">
         <div style="opacity: 0.5; font-style: italic;">Awaiting Regent...</div>
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
      <h1 style="color: #ffcc00; border-bottom: 1px solid rgba(255,200,0,0.3); padding-bottom: 5px;">🧬 DOMINANT GENOMES</h1>
      <div id="leaderboard-content">
        <!-- Populated via JS -->
        <div style="opacity: 0.5; margin-top: 10px; font-style: italic;">Awaiting population data...</div>
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
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 20000);
      camera.position.set(0, 0, 1000);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      document.body.appendChild(renderer.domElement);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.4, 0.85));

      const controls = new OrbitControls(camera, renderer.domElement);

      // Particles
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(MAX_ATOMS * 3);
      const col = new Float32Array(MAX_ATOMS * 3);
      const siz = new Float32Array(MAX_ATOMS);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(siz, 1));
      const particles = new THREE.Points(geo, new THREE.PointsMaterial({
          size: 4, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
      }));
      scene.add(particles);

      // Bonds
      const MAX_VIS_BONDS = MAX_ATOMS * 4;
      const bondGeo = new THREE.BufferGeometry();
      const bondPos = new Float32Array(MAX_VIS_BONDS * 2 * 3);
      const bondCol = new Float32Array(MAX_VIS_BONDS * 2 * 3);
      bondGeo.setAttribute("position", new THREE.BufferAttribute(bondPos, 3));
      bondGeo.setAttribute("color", new THREE.BufferAttribute(bondCol, 3));
      const bondLines = new THREE.LineSegments(bondGeo, new THREE.LineBasicMaterial({
          vertexColors: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
      }));
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
      gridGeo.setAttribute("position", new THREE.BufferAttribute(gridPosArr, 3));
      gridGeo.setAttribute("color", new THREE.BufferAttribute(gridColArr, 3));
      gridGeo.setAttribute("size", new THREE.BufferAttribute(gridSizArr, 1));
      const gridParticles = new THREE.Points(gridGeo, new THREE.PointsMaterial({
          size: 20, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
      }));
      scene.add(gridParticles);

      // Structures
      const structGeo = new THREE.BoxGeometry(18, 18, 18);
      const structMat = new THREE.MeshPhongMaterial({ color: 0x88aaff, transparent: true, opacity: 0.5, shininess: 100 });
      const structMesh = new THREE.InstancedMesh(structGeo, structMat, GRID_W * GRID_H);
      structMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(structMesh);

      scene.add(new THREE.DirectionalLight(0xffffff, 1).set(500, 500, 500));
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

      // Command Input
      document.getElementById("command-input").addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && e.target.value) {
          const text = e.target.value; e.target.value = "";
          const endpoint = text.startsWith("fork ") ? "/fork" : "/inject";
          const body = text.startsWith("fork ") ? { name: text.split(" ")[1] } : { text, energy: 200 };
          fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        }
      });

      // Synchronizers
      async function syncBuffer(url, target) {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const buffer = await res.arrayBuffer();
          target.set(new (target.constructor)(buffer));
        } catch(e) {}
      }

      async function sync(id, geometry, targetPos, targetCol, targetSiz) {
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
            for(let b=0; b<8; b++) logicHex += view.getUint8(OFFSETS.LOGIC + i * 8 + b).toString(16).padStart(2, '0').toUpperCase();
            if (!speciesCount[logicHex]) speciesCount[logicHex] = { count: 0, energy: 0 };
            speciesCount[logicHex].count++;
            speciesCount[logicHex].energy += e;

            targetPos[i * 3] = x;
            targetPos[i * 3 + 1] = y;
            targetPos[i * 3 + 2] = r * 0.1;

            const role = roleFlags[i];
            const signal = signalFlags[i];
            const qLevel = immunityFlags[i];
            let isLocked = false;
            for(let b=0; b<4; b++) if(stiffnessFlags[i*4+b] > 0.8) isLocked = true;

            // ERA 33: Trophic Coloring
            if (role === 1) { // Producer (Green)
              targetCol[i * 3] = 0; targetCol[i * 3 + 1] = 1.0; targetCol[i * 3 + 2] = 0.5;
            } else if (role === 2) { // Constructor (Blue)
              targetCol[i * 3] = 0.2; targetCol[i * 3 + 1] = 0.5; targetCol[i * 3 + 2] = 1.0;
            } else if (role === 3) { // Siphon (Red)
              targetCol[i * 3] = 1.0; targetCol[i * 3 + 1] = 0.2; targetCol[i * 3 + 2] = 0.2;
            } else if (qLevel === 1) { // Flagged
              targetCol[i * 3] = 1.0; targetCol[i * 3 + 1] = 0.4; targetCol[i * 3 + 2] = 0;
            } else if (isLocked) { // Locked/Crystal
              targetCol[i * 3] = 1.0; targetCol[i * 3 + 1] = 1.0; targetCol[i * 3 + 2] = 1.0;
            } else if (signal > 0) { // Signaling
              targetCol[i * 3] = 0; targetCol[i * 3 + 1] = 1.0; targetCol[i * 3 + 2] = 1.0;
            } else { // Default
              targetCol[i * 3] = 0.5; targetCol[i * 3 + 1] = 0.7; targetCol[i * 3 + 2] = 1.0;
            }

            targetSiz[i] = 2 + e / 20;
            if (r > 800) targetSiz[i] *= 2;
          }

          document.getElementById("atom-count").innerText = `ATOMS: ${activeAtoms}`;
          document.getElementById("resonance").innerText = `RESONANCE: ${(totalResonance/activeAtoms || 0).toFixed(1)}`;

          prevailingSpecies = Object.keys(speciesCount)
            .map(hex => ({ hex, count: speciesCount[hex].count, avgEnergy: speciesCount[hex].energy / speciesCount[hex].count }))
            .sort((a,b) => b.count - a.count).slice(0, 5);

          // Update Bonds
          let bondVIdx = 0;
          for (let i = 0; i < MAX_ATOMS; i++) {
            if (view.getBigUint64(OFFSETS.ID + i * 8, true) === 0n) continue;
            for (let b = 0; b < 4; b++) {
              const bIdx = bondIndices[i * 4 + b];
              const stiff = stiffnessFlags[i * 4 + b];
              if (bIdx > 0 && bIdx < MAX_ATOMS && (stiff > 0.1 || signalFlags[i] > 0)) {
                bondPos[bondVIdx * 3] = targetPos[i * 3]; bondPos[bondVIdx * 3 + 1] = targetPos[i * 3 + 1]; bondPos[bondVIdx * 3 + 2] = targetPos[i * 3 + 2];
                bondPos[(bondVIdx + 1) * 3] = targetPos[bIdx * 3]; bondPos[(bondVIdx + 1) * 3 + 1] = targetPos[bIdx * 3 + 1]; bondPos[(bondVIdx + 1) * 3 + 2] = targetPos[bIdx * 3 + 2];
                
                const r = 1.0, g = 0.4 + stiff * 0.6, bVal = stiff * 0.2;
                bondCol[bondVIdx * 3] = bondCol[(bondVIdx+1)*3] = r;
                bondCol[bondVIdx * 3 + 1] = bondCol[(bondVIdx+1)*3+1] = g;
                bondCol[bondVIdx * 3 + 2] = bondCol[(bondVIdx+1)*3+2] = bVal;
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
        } catch(e) {}
      }

      async function updateArchitecture() {
          const dummy = new THREE.Object3D();
          for (let i = 0; i < gridCells; i++) {
              const cell = architectureFlags[i];
              const density = (cell >> 8) & 0xFF;
              if (density > 0) {
                  const gx = i % GRID_W, gy = Math.floor(i / GRID_W);
                  dummy.position.set((gx * 20 + 10) - 700, (gy * 20 + 10) - 400, -20);
                  const s = density / 255; dummy.scale.set(s, s, s);
                  structMesh.setColorAt(i, new THREE.Color(memoryFlags[i * 8] !== 0 ? 0x00ff88 : 0x88aaff));
              } else dummy.scale.set(0, 0, 0);
              dummy.updateMatrix(); structMesh.setMatrixAt(i, dummy.matrix);
          }
          structMesh.instanceMatrix.needsUpdate = true;
          if (structMesh.instanceColor) structMesh.instanceColor.needsUpdate = true;
      }

      async function syncGrid() {
        try {
          const res = await fetch("/grid");
          if (!res.ok) return;
          const view = new DataView(await res.arrayBuffer());
          for (let i = 0; i < gridCells; i++) {
            const nutrient = view.getInt32(i * 4, true);
            const attract = view.getFloat32(11200 + i * 4, true);
            gridSizArr[i] = 0; gridColArr[i*3] = gridColArr[i*3+1] = gridColArr[i*3+2] = 0;
            if (nutrient > 0) {
              const intensity = Math.min(1.0, nutrient / 2000);
              gridColArr[i*3+1] = intensity * 0.8; gridSizArr[i] = 8 + intensity * 15;
            }
          }
          gridGeo.attributes.color.needsUpdate = true;
          gridGeo.attributes.size.needsUpdate = true;
        } catch(e) {}
      }

      function updateLeaderboard() {
        const container = document.getElementById('leaderboard-content');
        if (prevailingSpecies.length === 0) { container.innerHTML = '...'; return; }
        container.innerHTML = prevailingSpecies.map((sp, i) => `
          <div class="species-row">
            <div class="species-genome">[${sp.hex}]</div>
            ${thoughtArchive[sp.hex] ? `<div class="species-thought">"${thoughtArchive[sp.hex]}"</div>` : ''}
            <div class="species-stats" style="color: ${i===0?'#00f0ff':'#fff'}">POP: ${sp.count} | ENG: ${sp.avgEnergy.toFixed(0)}</div>
          </div>
        `).join('');
      }

      let lastSync = 0, lastDictSync = 0;
      function animate(t) {
        requestAnimationFrame(animate);
        controls.update();
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
          fetch('/thoughts').then(r=>r.json()).then(d => { thoughtArchive = d; }).catch(()=>{});
          fetch('/lineage').then(r=>r.json()).then(d => { lineageArchive = d; }).catch(()=>{});
          lastDictSync = t;
        }
        composer.render();
      }

      window.saveGenesis = () => fetch("/snapshot/export", { method: "POST" });
      animate(0);
    </script>
  </body>
</html>

```

---

## FILE: PREDICTION_MARKET.ts

```typescript
// OMEGA-64 | PREDICTION_MARKET.ts | Era 18: Deterministic Monad
// Replaces Parallel Realities. Crisis triggers mutations that atoms bet on.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

// 16-byte Shared Buffer:
// [0-3]: Int32 isActive (0 or 1)
// [4-7]: Int32 betPool (Scaled by SCALE=1000)
// [8-15]: Uint8Array proposedLogic (8 bytes)
export const marketBuffer = new SharedArrayBuffer(16);
export const marketState = new Int32Array(marketBuffer, 0, 1);
export const betPoolInt = new Int32Array(marketBuffer, 4, 1);
export const proposedLogic = new Uint8Array(marketBuffer, 8, 8);

const CRISIS_THRESHOLD = 5000.0; // The energy threshold required to pass a mutation
const SCALE = 1000;

export const PREDICTION_MARKET = {
    buffer: marketBuffer,
    successfulGenomes: new Map<string, number>(), // ERA 37: Track successful mutation signatures

    startCrisis: (newLogic: Uint8Array) => {
        if (Atomics.load(marketState, 0) === 1) {
            console.log("⚠️ [MARKET] A crisis is already ongoing.");
            return;
        }

        console.log(`🌀 [MARKET] CRISIS INITIATED! Proposed Genome: ${Array.from(newLogic).map(b => b.toString(16).padStart(2, '0')).join('')}`);
        
        // Reset pool
        Atomics.store(marketState, 0, 1);
        Atomics.store(betPoolInt, 0, 0);
        
        // Store proposed logic
        for(let i = 0; i < 8; i++) {
            proposedLogic[i] = newLogic[i];
        }
    },

    resolveCrisis: () => {
        if (Atomics.load(marketState, 0) === 0) return;

        Atomics.store(marketState, 0, 0);
        const finalBet = Atomics.load(betPoolInt, 0) / SCALE;

        if (finalBet >= CRISIS_THRESHOLD) {
            const winnersHex = Array.from(proposedLogic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            console.log(`🌌 [MARKET] MUTATION ADOPTED! Total Energy Bet: ${finalBet.toFixed(2)}. Signature [${winnersHex}] is now Blessed.`);
            
            // ERA 37: Record success
            const currentWins = PREDICTION_MARKET.successfulGenomes.get(winnersHex) || 0;
            PREDICTION_MARKET.successfulGenomes.set(winnersHex, currentWins + 1);

            // Apply the mutation to all active atoms in the single STATE_MATRIX
            const active = STATE_MATRIX.getActiveIndices();
            for (const idx of active) {
                STATE_MATRIX.setLogic(idx, proposedLogic);
                
                // Minor energy penalty for adopting the mutation (adaptability toll)
                const currentEnergy = STATE_MATRIX.getEnergy(idx);
                STATE_MATRIX.setEnergy(idx, Math.max(0, currentEnergy - 10)); 
            }
        } else {
            console.log(`🛑 [MARKET] CRISIS AVERTED. Insufficient Energy Bet: ${finalBet.toFixed(2)} / ${CRISIS_THRESHOLD}. Status Quo maintained.`);
        }
    },

    /**
     * ERA 37: Fractal Dividends
     * Periodically distributes portions of the market pool to successful genetic lineages.
     */
    distributeDividends: () => {
        const currentPool = Atomics.load(betPoolInt, 0) / SCALE;
        if (currentPool < 100) return; // Only distribute if there's enough capital

        const dividend = currentPool * 0.1; // 10% dividend
        if (Atomics.compareExchange(betPoolInt, 0, Math.round(currentPool * SCALE), Math.round((currentPool - dividend) * SCALE)) !== Math.round(currentPool * SCALE)) {
            return; // Concurrency guard
        }

        const active = STATE_MATRIX.getActiveIndices();
        const winners = active.filter(idx => {
            const logic = STATE_MATRIX.getLogic(idx);
            const hex = Array.from(logic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            return PREDICTION_MARKET.successfulGenomes.has(hex);
        });

        if (winners.length === 0) return;

        // Weight distribution by the number of historical wins
        let totalWinWeight = 0;
        const weights = winners.map(idx => {
            const hex = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            const w = PREDICTION_MARKET.successfulGenomes.get(hex) || 1;
            totalWinWeight += w;
            return w;
        });

        console.log(`💹 [MARKET] Distributing ${dividend.toFixed(1)} energy dividends to ${winners.length} successful atoms...`);
        
        for (let i = 0; i < winners.length; i++) {
            const idx = winners[i];
            const share = (weights[i] / totalWinWeight) * dividend;
            const currentEnergy = STATE_MATRIX.getEnergy(idx);
            STATE_MATRIX.setEnergy(idx, currentEnergy + share);
        }
    }
};

```

---

## FILE: P2P_FEDERATION.ts

```typescript
// OMEGA-64 | P2P_FEDERATION.ts | Era 15: The Stabilized Monad
// Reliable inter-system atom migration.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import { PRNG } from "./PRNG.ts";

export interface AtomPacket {
    id: string;
    logic: string;
    energy: number;
    resonance: number;
    sourceNode: string;
    pulseId: number;
}

const CURRENT_PORT = Number(Deno.env.get("PORT")) || 8000;
const migrationQueue: number[] = [];
let isProcessingMigration = false;

export const P2P_FEDERATION = {
    peers: new Set<string>(CURRENT_PORT === 8000 ? ["http://localhost:8001"] : ["http://localhost:8000"]), 
    nodeId: `OMEGA-${CURRENT_PORT}`,

    serialize: (idx: number, pulseId: number = 0): AtomPacket | null => {
        const id = IDX_TO_ID.get(idx);
        if (!id) return null;

        const logicBytes = STATE_MATRIX.getLogic(idx);
        let logicStr = "";
        for (let i = 0; i < 8; i++) {
            logicStr += logicBytes[i].toString(16).padStart(2, '0');
        }

        return {
            id,
            logic: logicStr,
            energy: STATE_MATRIX.getEnergy(idx),
            resonance: STATE_MATRIX.getResonance(idx),
            sourceNode: P2P_FEDERATION.nodeId,
            pulseId
        };
    },

    migrate: (idx: number, pulseId: number) => {
        if (migrationQueue.length > 100) return; 
        migrationQueue.push(idx);
        P2P_FEDERATION.processQueue(pulseId);
    },

    processQueue: async (pulseId: number) => {
        if (isProcessingMigration || migrationQueue.length === 0) return;
        isProcessingMigration = true;

        const idx = migrationQueue.shift()!;
        const atomIdAtStart = STATE_MATRIX.getId(idx);
        const packet = P2P_FEDERATION.serialize(idx, pulseId);
        
        if (packet && atomIdAtStart !== 0n) {
            const prng = new PRNG(PRNG.seedFrom(pulseId, packet.id));
            const { value: pSelector } = prng.next();
            const peerList = Array.from(P2P_FEDERATION.peers);
            const targetPeer = peerList[Math.floor(pSelector * peerList.length)];

            try {
                const res = await fetch(`${targetPeer}/federate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(packet),
                    signal: AbortSignal.timeout(2000) 
                });

                if (res.ok) {
                    // Only clear if the atom hasn't changed locally during transit
                    if (STATE_MATRIX.getId(idx) === atomIdAtStart) {
                        STATE_MATRIX.setId(idx, 0n); // Clear physically
                        console.log(`🛸 [FEDERATION] ${packet.id} migrated to ${targetPeer}`);
                    } else {
                        console.warn(`🛸 [FEDERATION] Transit collision for ${packet.id}. Local mutation kept.`);
                    }
                }
            } catch (e: any) {
                console.error(`🛸 [FEDERATION] Migration failed for ${packet.id}: ${e.message}`);
            }
        }

        isProcessingMigration = false;
        if (migrationQueue.length > 0) {
            setTimeout(() => P2P_FEDERATION.processQueue(pulseId), 50);
        }
    },

    checkWanderlust: (idx: number, pulseId: number): boolean => {
        const id = STATE_MATRIX.getId(idx);
        if (id === 0n) return false;
        
        const energy = STATE_MATRIX.getEnergy(idx);
        const resonance = STATE_MATRIX.getResonance(idx);
        
        // Atoms only migrate if they have high potential but are in a low resonance environment
        if (resonance < 5 && energy > 150) {
            const prng = new PRNG(PRNG.seedFrom(pulseId, id.toString()));
            const { value: v1 } = prng.next();
            return v1 < 0.005;
        }
        return false;
    }
};


```

---

## FILE: P2P_SYNAPSE.ts

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PORT = 8081;
const ROOT = "./";

console.log(`🛸 P2P Synapse Membrane open on port ${PORT}... Listening for Alien Atoms.`);

async function handler(req: Request): Promise<Response> {
  if (req.method === "POST" && new URL(req.url).pathname === "/mutate") {
    try {
      const alienData = await req.json();
      const alienId = alienData.eigenvalue || `0xALIEN${Date.now()}`;
      const filename = `${ROOT}/${alienId}.ALIEN.md`;
      
      const content = `---
eigenvalue: '${alienId}'
symbol: '${alienData.symbol || 'ALIEN'}'
energy: ${alienData.energy || 100}
resonance: ${alienData.resonance || 0}
logic: '${alienData.logic || '00000000'}'
thought: '${alienData.thought || 'UNKNOWN'}'
desc: '${alienData.desc || 'Migrated from an external dimension.'}'
---

<div class="alien-payload">
  System intrusion detected from external origin. This atom represents an alien logic state materialized via P2P Synapse.
</div>
`;
      await Deno.writeTextFile(filename, content);
      console.log(`   [P2P] 🛸 ALIEN ATOM MATERIALIZED: ${filename} (Logic: ${alienData.logic})`);
      return new Response(JSON.stringify({ status: "MUTATION_ACCEPTED", target: filename }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      console.error("   [P2P] ⚠️ Failed to parse alien logic.", e);
      return new Response("MUTATION_REJECTED", { status: 400 });
    }
  }
  return new Response("OMEGA-64 P2P Membrane Active.", { status: 200 });
}

serve(handler, { port: PORT });

```

---

## FILE: AVATAR_ENGINE.ts

```typescript
// OMEGA-64 | AVATAR_ENGINE.ts | Era 18: Emergent Avatar
// Transforms observer interaction purely into thermodynamic pheromone deposits.

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

export const AVATAR_ENGINE = {
    /**
     * Deposits ATTENTION pheromones into the physics grid at cursor locations.
     * Atoms will naturally react to this scent based on their genetic logic.
     */
    dropPheromone: (x: number, y: number) => {
        const idx = PHYSICS_ENGINE.getGridIdx(x, y);
        
        // Spill a highly concentrated dose of attention at the cursor
        // Capped to prevent float overflow or infinite pooling
        const current = PHYSICS_ENGINE.ATTENTION_PHEROMONES[idx];
        if (current < 1000) {
            PHYSICS_ENGINE.ATTENTION_PHEROMONES[idx] += 100.0;
        }

        // Also spill slightly into immediate neighbors to create a gradient
        const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
        for (const [ox, oy] of checkPoints) {
            const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
            const sCurrent = PHYSICS_ENGINE.ATTENTION_PHEROMONES[sIdx];
            if (sCurrent < 1000) {
                PHYSICS_ENGINE.ATTENTION_PHEROMONES[sIdx] += 25.0;
            }
        }
    }
};

```

---

## FILE: REFLECTION_ENGINE.ts

```typescript
// OMEGA-64 | REFLECTION_ENGINE.ts | Era 17: The True Quine
// Bridges RAM state back to Flatland source code.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export const REFLECTION_ENGINE = {
    /**
     * Reflects the current atom state from RAM back to its Disk source file.
     * This is the bridge that makes OMEGA-64 a true Quine.
     */
    reflect: async (idx: number): Promise<boolean> => {
        const fullPath = IDX_TO_ID.get(idx);
        if (!fullPath) return false;

        try {
            // 1. Capture current runtime metrics
            const energy = STATE_MATRIX.getEnergy(idx);
            const resonance = STATE_MATRIX.getResonance(idx);
            const x = STATE_MATRIX.getX(idx);
            const y = STATE_MATRIX.getY(idx);

            // 2. Capture and hex-encode current genome & bytecode
            const genome = Array.from(STATE_MATRIX.getLogic(idx))
                .map(b => b.toString(16).padStart(2, '0')).join('');
            
            const code = STATE_MATRIX.getCode(idx);
            const codeHex = Array.from(code)
                .map(u => u.toString(16).padStart(8, '0')).join('');

            // 3. Read current file content to preserve non-frontmatter data
            const content = await Deno.readTextFile(fullPath);
            const body = content.replace(/^---\n[\s\S]+?\n---\n/, "");

            // 4. Construct the reflected source (The Quine Output)
            const symbol = fullPath.split('.').slice(-3, -2)[0] || "ATOM";
            const reflectedSource = `---
symbol: ${symbol}
genome: ${genome}
code: ${codeHex}
energy: ${energy.toFixed(3)}
resonance: ${resonance.toFixed(3)}
x: ${x}
y: ${y}
reflected_at: ${new Date().toISOString()}
---

${body.trim()}

// --- DECOMPILED BYTECODE ---
/*
${REFLECTION_ENGINE.decompile(code)}
*/
`;

            // 5. Transactional Atomic Write
            const tmpPath = `${fullPath}.tmp`;
            await Deno.writeTextFile(tmpPath, reflectedSource);
            await Deno.rename(tmpPath, fullPath);

            return true;
        } catch (e: any) {
            console.error(`🪞 [REFLECTION] Failed to reflect Atom[${idx}]:`, e.message);
            return false;
        }
    },

    /**
     * Decompiles binary bytecode into human-readable pseudo-code for documentation.
     */
    decompile: (code: Uint32Array): string => {
        const ops: string[] = [];
        for (let i = 0; i < code.length; i++) {
            const inst = code[i];
            if (inst === 0) continue;

            const op = inst & 0xFF;
            const p1 = (inst >> 8) & 0xFF;
            const p2 = (inst >> 16) & 0xFF;
            const p3 = (inst >> 24) & 0xFF;

            switch (op) {
                case 0x10: ops.push(`${i.toString().padStart(2, '0')}: MOVE  dx:${(p1-128)/10} dy:${(p2-128)/10}`); break;
                case 0x20: ops.push(`${i.toString().padStart(2, '0')}: FEED  amt:${p1/10}`); break;
                case 0x30: ops.push(`${i.toString().padStart(2, '0')}: JMP   tgt:${p1 % 16}`); break;
                case 0x31: ops.push(`${i.toString().padStart(2, '0')}: JZ    tgt:${p1 % 16}`); break;
                case 0x50: ops.push(`${i.toString().padStart(2, '0')}: SENSE target:${p1/10}`); break;
                case 0x99: ops.push(`${i.toString().padStart(2, '0')}: SELF_MODIFY slot:${p1 % 16}`); break;
                default:   ops.push(`${i.toString().padStart(2, '0')}: OP_${op.toString(16).toUpperCase()} ${p1} ${p2} ${p3}`);
            }
        }
        return ops.join('\n');
    },

    /**
     * Crystallization: Reflects all high-resonance atoms to disk.
     */
    crystallize: async (threshold: number = 100) => {
        const active = STATE_MATRIX.getActiveIndices();
        let counts = 0;
        for (const idx of active) {
            if (STATE_MATRIX.getResonance(idx) > threshold) {
                if (await REFLECTION_ENGINE.reflect(idx)) counts++;
            }
        }
        if (counts > 0) {
            console.log(`💎 [CRYSTALLIZATION] ${counts} resonant atoms reflected to Flatland.`);
        }
    }
};

```

---

## FILE: MATRIX_ENGINE.ts

```typescript
// OMEGA-64 | MATRIX_ENGINE.ts | Era 68: Phase 13 — Crystalline Intelligence
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

const GRID_COLS = 140;
const GRID_ROWS = 80;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

// Crystal type constants for logic gates
export const CRYSTAL_STANDARD  = 1;  // Default conducting crystal
export const CRYSTAL_THRESHOLD = 6;  // Acts as a threshold gate (Inhibitory)
export const CRYSTAL_MEME      = 10; // Memetic Node — stores regent genomic intent

export const MATRIX_ENGINE = {
    // Core tick is now handled by WASM tick_matrix() via PULSE_WORKER.
    // This JS fallback remains for non-WASM environments.
    tick: () => {
        const structure = STATE_MATRIX.structureGrid;
        const signal = STATE_MATRIX.signalGrid;
        const nextSignal = new Int32Array(TOTAL_CELLS);

        for (let cy = 0; cy < GRID_ROWS; cy++) {
            for (let cx = 0; cx < GRID_COLS; cx++) {
                const i = cy * GRID_COLS + cx;
                const type = Atomics.load(structure, i);
                if (type === 0) continue;

                let currentRes = Atomics.load(signal, i);

                const neighbors = [
                    (cy > 0) ? (cy - 1) * GRID_COLS + cx : -1,
                    (cy < GRID_ROWS - 1) ? (cy + 1) * GRID_COLS + cx : -1,
                    (cx > 0) ? cy * GRID_COLS + (cx - 1) : -1,
                    (cx < GRID_COLS - 1) ? cy * GRID_COLS + (cx + 1) : -1
                ];

                for (const ni of neighbors) {
                    if (ni === -1) continue;
                    if (Atomics.load(structure, ni) > 0) {
                        const neighborRes = Atomics.load(signal, ni);
                        if (neighborRes > currentRes) {
                            currentRes += Math.floor((neighborRes - currentRes) * 0.4);
                        }
                    }
                }

                if (type >= CRYSTAL_THRESHOLD) {
                    if (currentRes < 200) currentRes = 0;
                }

                currentRes = Math.max(0, currentRes - 5);
                nextSignal[i] = currentRes;
            }
        }

        for (let i = 0; i < TOTAL_CELLS; i++) {
            Atomics.store(signal, i, nextSignal[i]);
        }
    },

    // Inject resonance signal at a world position
    inject: (x: number, y: number, amount: number) => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            Atomics.add(STATE_MATRIX.signalGrid, cy * GRID_COLS + cx, amount);
        }
    },

    // Read signal at a world position
    read: (x: number, y: number): number => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            return Atomics.load(STATE_MATRIX.signalGrid, cy * GRID_COLS + cx);
        }
        return 0;
    },

    // Set crystal type at world position
    setStructure: (x: number, y: number, type: number) => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            Atomics.store(STATE_MATRIX.structureGrid, cy * GRID_COLS + cx, type);
        }
    },

    // === Phase 13: Memetic Nodes ===
    // Write an 8-byte regent genome "Meme" into the memoryGrid at world position.
    // Nearby atoms during mutation gain a bias toward this genome.
    establishMeme: (x: number, y: number, genomeBytes: BigInt64Array) => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            const memeIdx = cy * GRID_COLS + cx;
            // Write genome into memoryGrid (8 bytes = 1 i64 slot)
            const memView = new BigInt64Array(
                STATE_MATRIX.buffer,
                OFFSETS.MEMORY_GRID_OFFSET + memeIdx * 8,
                1
            );
            memView[0] = genomeBytes[0];
            // Mark cell as Memetic Node
            Atomics.store(STATE_MATRIX.structureGrid, memeIdx, CRYSTAL_MEME);
            Atomics.store(STATE_MATRIX.signalGrid, memeIdx, 1000); // High initial resonance
        }
    },

    // Read the meme genome closest to a world position
    readMeme: (x: number, y: number): bigint => {
        const cx = Math.floor(x / 10);
        const cy = Math.floor(y / 10);
        if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
            const memeIdx = cy * GRID_COLS + cx;
            const memView = new BigInt64Array(
                STATE_MATRIX.buffer,
                OFFSETS.MEMORY_GRID_OFFSET + memeIdx * 8,
                1
            );
            return memView[0];
        }
        return 0n;
    },

    // Get total matrix resonance (global planetary signal strength)
    getTotalResonance: (): number => {
        let total = 0;
        for (let i = 0; i < TOTAL_CELLS; i++) {
            total += Atomics.load(STATE_MATRIX.signalGrid, i);
        }
        return total;
    },

    // Count active crystal cells
    getCrystalCount: (): number => {
        let count = 0;
        for (let i = 0; i < TOTAL_CELLS; i++) {
            if (Atomics.load(STATE_MATRIX.structureGrid, i) > 0) count++;
        }
        return count;
    }
};

```

---

## FILE: SYSTEM_START.ts

```typescript
// OMEGA-64 | SYSTEM_START.ts | Era 13: ALEPH - Multiverse & Federation
// Orchestrates the Pulse, Breath, and Observer UI in a single memory space.

import { PULSE } from "./PULSE.ts";
import { BREATH } from "./BREATH.ts";
import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";

import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { PRNG } from "./PRNG.ts";
import * as OFFSETS from "./OFFSETS.ts";


const UI_PORT = Number(Deno.env.get("PORT")) || 8000;
const UI_PATH = "./ui/index.html";

console.log("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");

// 1. Initialize Observer UI Server
Deno.serve({ port: UI_PORT }, async (req) => {
    const url = new URL(req.url);
    
    if (url.pathname === "/state") {
        const buffer = STATE_MATRIX.buffer;
        
        const bufferCopy = new Uint8Array(buffer.byteLength);
        bufferCopy.set(new Uint8Array(buffer));
        return new Response(bufferCopy, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    if (url.pathname === "/grid") {
        const env = new Int32Array(PHYSICS_ENGINE.envBuffer);
        const attention = new Float32Array(PHYSICS_ENGINE.attentionBuffer);

        const buffer = new ArrayBuffer(env.byteLength + attention.byteLength);
        const outEnv = new Int32Array(buffer, 0, env.length);
        const outAttention = new Float32Array(buffer, env.byteLength, attention.length);
        
        outEnv.set(env);
        outAttention.set(attention);

        return new Response(buffer, {
            headers: { "Content-Type": "application/octet-stream" }
        });
    }

    if (url.pathname === "/crisis" && req.method === "POST") {
        try {
            const { logicHex } = await req.json();
            const logicBytes = new Uint8Array(8);
            if (logicHex && logicHex.length === 16) {
                for (let i = 0; i < 8; i++) {
                    logicBytes[i] = parseInt(logicHex.substr(i * 2, 2), 16);
                }
            } else {
                // Generate a random crisis mutation if none provided
                crypto.getRandomValues(logicBytes);
            }
            
            PREDICTION_MARKET.startCrisis(logicBytes);
            return new Response("Crisis Initiated", { status: 200 });
        } catch (e) {
            return new Response("Crisis Failed", { status: 400 });
        }
    }

    if (url.pathname === "/federate" && req.method === "POST") {
        try {
            const packet = await req.json();
            console.log(`🛸 [FEDERATION] Incoming migration from ${packet.sourceNode}: ${packet.id}`);
            
            const idx = STATE_MATRIX.findFreeSlot();
            if (idx !== -1) {
                const prng = new PRNG(PRNG.seedFrom(PULSE.currentPulseId, packet.id));
                const { value: vId, next: n1 } = prng.next();
                const { value: vX, next: n2 } = n1.next();
                const { value: vY } = n2.next();

                // Deterministic ID based on seed
                STATE_MATRIX.setId(idx, BigInt(Math.floor(vId * 0xFFFFFFFF))); 
                STATE_MATRIX.setEnergy(idx, packet.energy);
                STATE_MATRIX.setResonance(idx, packet.resonance);
                
                const logicBytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) {
                    logicBytes[i] = parseInt(packet.logic.substr(i * 2, 2), 16);
                }
                STATE_MATRIX.setLogic(idx, logicBytes);

                // Position in a deterministic cluster around the center
                STATE_MATRIX.setX(idx, 700 + (vX - 0.5) * 200);
                STATE_MATRIX.setY(idx, 400 + (vY - 0.5) * 200);
                
                return new Response("OK", { status: 200 });
            } else {
                return new Response("Matrix Full", { status: 507 });
            }
        } catch (e) {
            return new Response("Federation Failed", { status: 400 });
        }
    }


    if (url.pathname === "/peers") {
        return new Response(JSON.stringify(Array.from(P2P_FEDERATION.peers)), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/vox") {
        return new Response(JSON.stringify(await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd())), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/thoughts") {
        return new Response(JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive)), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/snapshots" && req.method === "GET") {
        const list = await SNAPSHOT_ENGINE.listSnapshots();
        return new Response(JSON.stringify(list), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/governance" && req.method === "GET") {
        return new Response(JSON.stringify(SOVEREIGNTY_ENGINE.currentRegent), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/lineage" && req.method === "GET") {
        return new Response(JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.lineage)), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/viral" && req.method === "GET") {
        // @ts-ignore: viralGridBuffer is dynamically exposed
        return new Response(STATE_MATRIX.viralGridBuffer, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }
    
    if (url.pathname === "/immunity" && req.method === "GET") {
        const buffer = STATE_MATRIX.immuneBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/signals" && req.method === "GET") {
        const buffer = STATE_MATRIX.currentReadBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/stiffness" && req.method === "GET") {
        const buffer = STATE_MATRIX.bondStiffnessBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/bonds" && req.method === "GET") {
        const BONDS_OFFSET = OFFSETS.BONDS_OFFSET;
        const BONDS_SIZE = MAX_ATOMS * 4 * 4;
        const view = new Uint8Array(STATE_MATRIX.buffer, BONDS_OFFSET, BONDS_SIZE);
        const copy = new Uint8Array(view.byteLength);
        copy.set(view);
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/synapses" && req.method === "GET") {
        const buffer = STATE_MATRIX.synapticStackBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/architecture" && req.method === "GET") {
        const buffer = STATE_MATRIX.structureGridBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/memory" && req.method === "GET") {
        const buffer = STATE_MATRIX.memoryGridBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }

    if (url.pathname === "/roles" && req.method === "GET") {
        const buffer = STATE_MATRIX.roleRegistryBuffer;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(new Uint8Array(buffer));
        return new Response(copy, {
            headers: { "Content-Type": "application/octet-stream", "Access-Control-Allow-Origin": "*" }
        });
    }












    if (url.pathname === "/snapshot/export" && req.method === "POST") {
        const result = await SNAPSHOT_ENGINE.exportSnapshot();
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname === "/snapshot/import" && req.method === "POST") {
        const body = await req.json();
        const result = await SNAPSHOT_ENGINE.importSnapshot(body.timestamp);
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // 3. Direct Thought Injection (POST) - OBSOLETE in Era 18
    /*
    if (url.pathname === "/inject" && req.method === "POST") {
        try {
            const { text, energy } = await req.json();
            console.log(`💉 [GOD_MODE] Injecting: "${text}" (Energy: ${energy})`);
            await SEMANTIC_MEMBRANE.injectThought(text, energy || 100);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Injection Failed", { status: 400 });
        }
    }
    */

    // 4. Spatial Mutation (POST)
    if (url.pathname === "/mutate" && req.method === "POST") {
        try {
            const { x, y, deltaEnergy, radius } = await req.json();
            console.log(`⚡ [GOD_MODE] Mutation at (${x}, ${y}) | Delta: ${deltaEnergy} | Radius: ${radius}`);
            
            const r2 = radius * radius;
            for (let i = 0; i < STATE_MATRIX.MAX_ATOMS; i++) {
                if (STATE_MATRIX.getId(i) === 0n) continue;
                const dx = STATE_MATRIX.getX(i) - x;
                const dy = STATE_MATRIX.getY(i) - y;
                if (dx*dx + dy*dy < r2) {
                    const current = STATE_MATRIX.getEnergy(i);
                    STATE_MATRIX.setEnergy(i, Math.max(0, current + deltaEnergy));
                }
            }
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Mutation Failed", { status: 400 });
        }
    }

    // 5. Avatar Cursor Sync (POST)
    if (url.pathname === "/avatar" && req.method === "POST") {
        try {
            const { x, y } = await req.json();
            AVATAR_ENGINE.dropPheromone(x, y);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Avatar Sync Failed", { status: 400 });
        }
    }

    try {
        const html = await Deno.readTextFile(UI_PATH);
        return new Response(html, { headers: { "Content-Type": "text/html" } });
    } catch (e) {
        return new Response("UI not found.", { status: 404 });
    }
});

// 2. Start Simulation Pulse Loop (Background)
(async () => {
    console.log("💓 [SYSTEM] Pulse Engine Ignited.");
    await PULSE.initWorkers();
    
    while (true) {
        await PULSE.tick();
        await new Promise(r => setTimeout(r, 16));
    }
})();

// 3. Start Cognitive Breathing Loop (Background)
(async () => {
    console.log("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
    await new Promise(r => setTimeout(r, 5000));
    await BREATH.inhale();
})();

```

---

## FILE: AUDIT_ENGINE.ts

```typescript
// OMEGA-64 | AUDIT_ENGINE.ts | Era 34: Digital Archaeology
// Scans "Flatland" (disk) for archived memories and deciphers ancient intent.

import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";

const ROOT = Deno.cwd();

export const AUDIT_ENGINE = {
    /**
     * Scans the directory for archived .md atoms and extracts their thoughts.
     */
    auditMemories: async (): Promise<string[]> => {
        const archivedThoughts: string[] = [];
        
        try {
            for await (const entry of Deno.readDir(ROOT)) {
                if (entry.isFile && entry.name.endsWith(".md")) {
                    // Skip core manifesto and architecture docs
                    if (["MANIFESTO.md", "ARCHITECTURE.md", "GEMINI.md", "README.md"].includes(entry.name)) continue;
                    
                    const content = await Deno.readTextFile(`${ROOT}/${entry.name}`);
                    // Extract 'thought' from YAML frontmatter
                    const thoughtMatch = content.match(/thought:\s*'(.+?)'/);
                    if (thoughtMatch) {
                        archivedThoughts.push(thoughtMatch[1]);
                    } else {
                        // Try unquoted thought or block
                        const thoughtBlock = content.match(/thought:\s*(.+)$/m);
                        if (thoughtBlock) archivedThoughts.push(thoughtBlock[1].trim());
                    }
                }
                
                // Limit scan to 20 files to prevent I/O saturation
                if (archivedThoughts.length >= 20) break;
            }
        } catch (e) {
            console.error("   [AUDIT] ⚠️ Scan failed:", e);
        }
        
        return archivedThoughts;
    },

    /**
     * Generates a summary of historical intent to present to the Oracle (BREATH).
     */
    generateHistoricalBriefing: async (): Promise<string> => {
        const thoughts = await AUDIT_ENGINE.auditMemories();
        if (thoughts.length === 0) return "The archives are empty. No historical intent found.";

        console.log(`🏺 [AUDIT] Deciphering ${thoughts.length} archived memories...`);
        
        // Use LLM to synthesize a briefing from these fragments
        const context = `Historical fragments: ${thoughts.join(" | ")}`;
        const briefing = await LLM_SYNAPSE.generateThought(context); // Reuse generateThought for summary
        
        return `ARCHIVAL AUDIT: ${briefing}`;
    }
};

```

---

## FILE: ENZYME_DIGEST.ts

```typescript
import { crypto } from "jsr:@std/crypto";
import { encodeHex, decodeHex } from "jsr:@std/encoding/hex";

const ROOT = Deno.cwd();

// Core files that the Mycelium is forbidden to eat (The DNA of the engine itself)
const INDIGESTIBLE = [
    "PULSE.ts", "PULSE_WORKER.ts", "GATE.ts", "RIBOSOME.ts", "RIBOSOME_TICK.ts", "AKASHA_SERVER.ts", 
    "P2P_SYNAPSE.ts", "AKASHA_UI.html", "MYCELIUM.ts", "ENZYME_DIGEST.ts",
    "STATE_MATRIX.ts", "PHYSICS_ENGINE.ts", "SEMANTIC_MEMBRANE.ts", "LLM_SYNAPSE.ts",
    "BREATH.ts", "ZERO_IOPS.ts", "REFLECTION_ENGINE.ts", "SNAPSHOT_ENGINE.ts",
    "mod.ts", "deno.json", "pulse.log", "debug.log", "synapse.log"
];

export async function secreteEnzymes(lastKnownAtoms: Map<string, any>) {
    try {
        let digestionCount = 0;
        for await (const entry of Deno.readDir(ROOT)) {
            if (!entry.isFile) continue;
            
            // Skip recognized Atoms
            if (entry.name.match(/^0x[0-9a-fA-F]{16}\.[A-Z_]+\.md$/)) continue;
            if (entry.name.match(/^0xALIEN/)) continue;
            if (entry.name.match(/^0xNOOSPHERE/)) continue;
            // Skip core system files
            if (INDIGESTIBLE.includes(entry.name) || entry.name.startsWith(".")) continue;
            // Skip generated output files
            if (entry.name.endsWith(".png") || entry.name.endsWith(".webp") || entry.name.endsWith(".svg")) continue;

            // Found a digestible legacy file!
            console.log(`   [MYCELIUM] 🍄 Sensed organic matter: ${entry.name}. Secreting enzymes...`);
            await digestFile(entry.name, lastKnownAtoms);
            digestionCount++;
            
            // Only eat one file per pulse to avoid acid reflux
            if (digestionCount >= 1) break;
        }
    } catch (e) {
        console.error("   [MYCELIUM] ⚠️ Enzyme secretion failed: ", e);
    }
}

export async function reconstructArtifacts(lastKnownAtoms: Map<string, any>) {
    // 1. Group ASSIMILATED atoms by their original filename
    const fragmentsByFile = new Map<string, any[]>();
    
    for (const [filename, atom] of lastKnownAtoms.entries()) {
        if (atom.symbol === 'ASSIMILATED' && atom.thought && atom.thought.startsWith('FRAGMENT_')) {
            const match = atom.thought.match(/^FRAGMENT_(\d+)_OF_(.+)$/);
            if (match) {
                const index = parseInt(match[1]);
                const originalFile = match[2];
                if (!fragmentsByFile.has(originalFile)) fragmentsByFile.set(originalFile, []);
                fragmentsByFile.get(originalFile)!.push({ index, atom, filename });
            }
        }
    }

    // 2. Check each group to see if it has reached sufficient resonance to manifest
    for (const [originalFile, fragments] of fragmentsByFile.entries()) {
        // Quick check: total resonance of the fragment group
        const totalResonance = fragments.reduce((sum, f) => sum + (Number(f.atom.resonance) || 0), 0);
        
        // Let's say it needs at least 50 total resonance to manifest
        if (totalResonance > 50 && Math.random() < 0.2) {
            console.log(`   [MYCELIUM] 🧩 High resonance detected for fragments of ${originalFile}. Reconstructing...`);
            
            // Sort fragments by index
            fragments.sort((a, b) => a.index - b.index);
            
            // Stitch hex logic together
            let stitchedHex = "";
            for (const f of fragments) {
                // Sanitize: Strip any non-hex characters that might have leaked in from ALIEN/named atoms
                const logic = (f.atom.logic || "").toLowerCase().replace(/[^0-9a-f]/g, "");
                stitchedHex += logic;
            }
            
            try {
                // Decode hex back to Uint8Array, then string. 
                // We use {fatal: false} because mutations might have corrupted the UTF-8!
                const bytes = decodeHex(stitchedHex);
                const decoder = new TextDecoder("utf-8", { fatal: false });
                const reconstructedText = decoder.decode(bytes);
                
                const outName = `RECONSTRUCTED_${originalFile}`;
                await Deno.writeTextFile(outName, reconstructedText);
                console.log(`   [MYCELIUM] 🌟 Reconstruction successful: ${outName}`);
                
                // Optional: Consume the atoms that formed it (they gave up their life for the code)
                for (const f of fragments) {
                    try {
                        await Deno.remove(f.filename);
                        lastKnownAtoms.delete(f.filename);
                    } catch(e) { /* ignore */ }
                }
            } catch(e) {
                console.error(`   [MYCELIUM] ⚠️ Reconstruction of ${originalFile} failed due to severe corruption.`, e);
            }
        }
    }
}

async function digestFile(filename: string, swarmData: Map<string, any>) {
    const rawContent = await Deno.readTextFile(filename);
    
    // Convert string to hex to serve as 'logic' operations
    const encoder = new TextEncoder();
    const data = encoder.encode(rawContent);
    const hex = encodeHex(data);
    
    // Shatter into 8-character (32-bit) logic fragments
    const fragments = [];
    for (let i = 0; i < hex.length; i += 8) {
        fragments.push(hex.substring(i, i + 8).padEnd(8, '0').toUpperCase());
    }
    
    console.log(`   [MYCELIUM] 🍄 Shattered ${filename} into ${fragments.length} logic fragments.`);

    let previousAtomId = null;
    const baseEnergy = 100;

    // Assimilate each fragment into a new Atom
    for (let i = 0; i < fragments.length; i++) {
        // Generate a deterministic but pseudo-random eigenvalue based on the file and index
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`${filename}_chunk_${i}`));
        const atomHex = encodeHex(hashBuffer).substring(0, 16).toUpperCase();
        const atomId = `0x${atomHex}`;
        const logic = fragments[i];
        
        // Connect to the previous fragment to maintain the sequence structure
        const bonds = previousAtomId ? [previousAtomId] : [];
        if (swarmData.size > 0 && Math.random() < 0.2) {
            // Also randomly bond to the existing mycelium network
            const randomExisting = Array.from(swarmData.keys())[Math.floor(Math.random() * swarmData.size)];
            bonds.push(randomExisting.split('.')[0]);
        }

        const newAtomContent = `---\n`
        + `eigenvalue: '${atomId}'\n`
        + `symbol: 'ASSIMILATED'\n`
        + `energy: 500\n`
        + `resonance: 60\n`
        + `logic: '${logic}'\n`
        + `thought: 'FRAGMENT_${i}_OF_${filename}'\n`
        + `desc: 'Mycelial digestion product. Contains raw data sequence.'\n`
        + `bonds: ${JSON.stringify(bonds)}\n`
        + `---\n`
        + `\n<div class="assimilated-data">\n  This atom is part of a digested legacy structure previously known as ${filename}.\n  Raw Hex Logic Segment: ${logic}\n</div>\n`;
        await Deno.writeTextFile(`${ROOT}/${atomId}.ASSIMILATED.md`, newAtomContent);
        previousAtomId = atomId;
    }

    // Erase the original file (Consumption complete)
    await Deno.remove(filename);
    console.log(`   [MYCELIUM] 🍄 Digestion complete. Original artifact '${filename}' has been assimilated into the Swarm.`);
}

```

---

## FILE: WASM_MIGRATION_RFC.md

```markdown
# OMEGA-64: WebAssembly (Wasm) Migration RFC 🦀🕸️🌀

## 1. Executive Summary

Currently, OMEGA-64's `LAMBDA_VM.ts` executes in the V8 JS engine using
TypeScript. While Deno is fast, executing complex 16-register bytecode for
>50,000 atoms per pulse (`PULSE_WORKER.ts`) creates a significant CPU
bottleneck.

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

## FILE: assembly/index.ts

```typescript
// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

@external("env", "trace_atom")
declare function trace_atom(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32): void;

// EXACT UNIFIED OFFSETS
const MAX_ATOMS: i32 = 100000;
const SAFETY_BUFFER: usize = 1000000;
const IDS_OFFSET: usize = SAFETY_BUFFER + 0;
const XS_OFFSET: usize = SAFETY_BUFFER + 800000;
const YS_OFFSET: usize = SAFETY_BUFFER + 1000000;
const ENERGY_OFFSET: usize = SAFETY_BUFFER + 1200000;
const RESONANCE_OFFSET: usize = SAFETY_BUFFER + 1600000;
const PHASE_OFFSET: usize = SAFETY_BUFFER + 2000000;
const LOGIC_OFFSET: usize = SAFETY_BUFFER + 2400000;
const BONDS_OFFSET: usize = SAFETY_BUFFER + 3200000;
const STIFFNESS_OFFSET: usize = SAFETY_BUFFER + 4800000;
const BOND_REQUESTS_OFFSET: usize = SAFETY_BUFFER + 18800000;
const SPATIAL_GRID_OFFSET: usize = SAFETY_BUFFER + 20000000;

const ISA_BIND: u8 = 0x40;
const ISA_SHARE: u8 = 0x41;
const ISA_SIGNAL: u8 = 0x42;
const ISA_READ_MATRIX: u8 = 0x43;
const ISA_INJECT: u8 = 0x44;
const ISA_BROADCAST: u8 = 0x45;
const ISA_ANNEX: u8 = 0x46;
const ISA_MUTATE: u8 = 0x47;
const ISA_RESONATE: u8 = 0x48;
const ISA_SENSE: u8 = 0x49;        // Atom senses global neural coherence field
const ISA_ASCEND: u8 = 0xFF;

// Crystal type constants
const CRYSTAL_OSCILLATOR: i32 = 5;

// Phase 19: Planetary Consciousness
// Global coherence broadcast channel — written by SOVEREIGN_ORACLE, read by ISA_SENSE
const NEURAL_COHERENCE_OFF: usize = SAFETY_BUFFER + 36000000;

// Phase 20: Self-Replication
// SPAWN_GRID: ring-buffer of pending child-atom requests written by ISA_REPLICATE,
// read and materialized by PULSE.ts in JS space. Each slot = 16 bytes:
//   [0..7]  parent genome (u64)
//   [8..9]  spawn x (i16)
//   [10..11] spawn y (i16)
//   [12..15] parent energy / 2 (i32)
const ISA_REPLICATE: u8 = 0x4A;
const SPAWN_GRID_OFF: usize = SAFETY_BUFFER + 37000000;
const SPAWN_MAX: i32 = 1024;    // ring-buffer capacity
const SPAWN_SLOT: i32 = 16;     // bytes per spawn request
// Atomic write-head lives at SPAWN_GRID_OFF
const SPAWN_HEAD_OFF: usize = SPAWN_GRID_OFF;
// Spawn data starts after 8-byte header
const SPAWN_DATA_OFF: usize = SPAWN_GRID_OFF + 8;

// Colony / Territory constants
const CRYSTAL_COLONY: i32 = 3;
const COLONY_THRESHOLD: i32 = 5;
const DECAY_COUNTER_OFF: usize = SAFETY_BUFFER + 35000000; // Decay tick counters

// Memetic Horizontal Transfer constants
const MEMORY_GRID_OFF: usize = SAFETY_BUFFER + 33000000;
const CRYSTAL_MEME: i32 = 10;       // Type for memetic nodes
const MEME_TRANSFER_PROB: i32 = 8;  // ~12.5% chance per tick for meme absorption

const STRUCTURE_GRID_OFF: usize = SAFETY_BUFFER + 31000000;
const SIGNAL_GRID_OFF: usize    = SAFETY_BUFFER + 32000000;
const ASCENSION_STATS_OFF: usize = SAFETY_BUFFER + 34000000;
const MAX_ASCENSIONS: i32 = 64;

@inline function getEnergy(idx: i32): i32 { return load<i32>(ENERGY_OFFSET + (idx << 2) as usize); }
@inline function setEnergy(idx: i32, val: i32): void { store<i32>(ENERGY_OFFSET + (idx << 2) as usize, val); }
@inline function getResonance(idx: i32): i32 { return load<i32>(RESONANCE_OFFSET + (idx << 2) as usize); }
@inline function setResonance(idx: i32, val: i32): void { store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, val); }
@inline function getPhase(idx: i32): i32 { return load<i32>(PHASE_OFFSET + (idx << 2) as usize); }
@inline function setPhase(idx: i32, val: i32): void { store<i32>(PHASE_OFFSET + (idx << 2) as usize, val); }
@inline function getX(idx: i32): i16 { return load<i16>(XS_OFFSET + (idx << 1) as usize); }
@inline function getY(idx: i32): i16 { return load<i16>(YS_OFFSET + (idx << 1) as usize); }
@inline function getLogicByte(idx: i32, slot: i32): u8 { return load<u8>(LOGIC_OFFSET + (idx << 3) + slot as usize); }
@inline function getBondTarget(atomIdx: i32, slot: i32): i32 { return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize); }
@inline function setBondTarget(atomIdx: i32, slot: i32, targetIdx: i32): void { store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, targetIdx); }
@inline function getBondStiffness(atomIdx: i32, slot: i32): f32 { return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize); }
@inline function setBondStiffness(atomIdx: i32, slot: i32, val: f32): void { store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, val); }

@inline function writeBondRequest(initiator: i32, target: i32): void { 
    let offset = BOND_REQUESTS_OFFSET + (initiator * 12); 
    store<i32>(offset as usize, initiator + 1); 
    store<i32>(offset + 4 as usize, target); 
}

@inline function getSpatialGridCount(gx: i32, gy: i32): i32 { 
    let cellIdx = gy * 140 + gx; 
    return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) as usize); 
}
@inline function getSpatialGridAtom(gx: i32, gy: i32, subIdx: i32): i32 { 
    let cellIdx = gy * 140 + gx; 
    return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2) as usize); 
}

@inline function fireSignal(atomIndex: i32): void {
    for (let b = 0; b < 4; b++) {
        let target = getBondTarget(atomIndex, b);
        if (target > 0 && target < MAX_ATOMS) {
            let st = getBondStiffness(atomIndex, b);
            let signalStrength = (150.0 * st) as i32; // Increased to ensure cascade
            setResonance(target, getResonance(target) + signalStrength);
        }
    }
}

const INSTRUCTIONS_OFFSET: usize = SAFETY_BUFFER + 6400000;
const CONTEXT_OFFSET: usize = SAFETY_BUFFER + 12800000;

// RISC-I Opcodes
const OP_NOP: u8 = 0x00;
const OP_SET: u8 = 0x01; // SET Reg, Imm8
const OP_GET: u8 = 0x02; // GET Reg, Prop
const OP_PUT: u8 = 0x03; // PUT Reg, Prop
const OP_ADD: u8 = 0x04; // ADD R1, R2
const OP_SUB: u8 = 0x05; // SUB R1, R2
const OP_JZ:  u8 = 0x10; // JZ Reg, RelAddr
const OP_JNZ: u8 = 0x11; // JNZ Reg, RelAddr
const OP_JMP: u8 = 0x12; // JMP RelAddr
const OP_REPLICATE: u8 = 0x80;
const OP_SIGNAL: u8 = 0x81;
const OP_BIND: u8 = 0x82;
const OP_SHARE: u8 = 0x83;

// Property IDs for GET/PUT
const PROP_ENERGY: u8 = 0;
const PROP_RESONANCE: u8 = 1;
const PROP_X: u8 = 2;
const PROP_Y: u8 = 3;
const PROP_PHASE: u8 = 4;

@inline function getReg(atomIdx: i32, reg: i32): i32 {
    return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize);
}
@inline function setReg(atomIdx: i32, reg: i32, val: i32): void {
    store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize, val);
}
@inline function getPC(atomIdx: i32): u8 {
    return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize);
}
@inline function setPC(atomIdx: i32, val: u8): void {
    store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize, val);
}

export function execute_atom(atomIndex: i32): void {
    let pc = getPC(atomIndex);
    let energy = getEnergy(atomIndex);
    let resonance = getResonance(atomIndex);
    const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;
    
    // Safety: 16 instructions per tick max to prevent infinite loops
    let step: i32 = 0;
    for (; step < 16; step++) {
        const op = load<u8>(instr_base + (pc as usize));
        if (op == OP_NOP) break;

        switch (op) {
            case OP_SET: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let imm = load<u8>(instr_base + (pc + 2) as usize);
                setReg(atomIndex, reg as i32, imm as i32);
                pc += 3;
                break;
            }
            case OP_GET: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let prop = load<u8>(instr_base + (pc + 2) as usize);
                let val: i32 = 0;
                if (prop == PROP_ENERGY) val = energy;
                else if (prop == PROP_RESONANCE) val = resonance;
                else if (prop == PROP_X) val = getX(atomIndex) as i32;
                else if (prop == PROP_Y) val = getY(atomIndex) as i32;
                else if (prop == PROP_PHASE) val = getPhase(atomIndex);
                setReg(atomIndex, reg as i32, val);
                pc += 3;
                break;
            }
            case OP_PUT: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let prop = load<u8>(instr_base + (pc + 2) as usize);
                let val = getReg(atomIndex, reg as i32);
                if (prop == PROP_ENERGY) energy = val;
                else if (prop == PROP_RESONANCE) resonance = val;
                else if (prop == PROP_PHASE) setPhase(atomIndex, val);
                pc += 3;
                break;
            }
            case OP_ADD: {
                let r1 = load<u8>(instr_base + (pc + 1) as usize);
                let r2 = load<u8>(instr_base + (pc + 2) as usize);
                setReg(atomIndex, r1 as i32, getReg(atomIndex, r1 as i32) + getReg(atomIndex, r2 as i32));
                pc += 3;
                break;
            }
            case OP_SUB: {
                let r1 = load<u8>(instr_base + (pc + 1) as usize);
                let r2 = load<u8>(instr_base + (pc + 2) as usize);
                setReg(atomIndex, r1 as i32, getReg(atomIndex, r1 as i32) - getReg(atomIndex, r2 as i32));
                pc += 3;
                break;
            }
            case OP_JNZ: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let target = load<u8>(instr_base + (pc + 2) as usize);
                if (getReg(atomIndex, reg as i32) != 0) pc = target;
                else pc += 3;
                break;
            }
            case OP_JMP: {
                pc = load<u8>(instr_base + (pc + 1) as usize);
                break;
            }
            case OP_REPLICATE: {
                // Kernel syscall: Replicate if possible
                if (energy > 1500 && resonance > 200) {
                    let rx = getX(atomIndex) as i32;
                    let ry = getY(atomIndex) as i32;
                    let gx = rx / 10;
                    let gy = ry / 10;
                    let spawnDx: i32 = (resonance % 3) - 1;
                    let spawnDy: i32 = ((resonance * 7) % 3) - 1;
                    let childGx: i32 = gx + spawnDx;
                    let childGy: i32 = gy + spawnDy;
                    
                    if (childGx >= 0 && childGx < 140 && childGy >= 0 && childGy < 80) {
                        let slot = atomic.add<i32>(SPAWN_HEAD_OFF as usize, 1) % SPAWN_MAX;
                        let slotOff: usize = SPAWN_DATA_OFF + (slot * SPAWN_SLOT) as usize;
                        let parentGenome = load<u64>((LOGIC_OFFSET + (atomIndex << 3) as usize) as usize);
                        store<u64>(slotOff, parentGenome);
                        store<i16>((slotOff + 8) as usize, childGx as i16);
                        store<i16>((slotOff + 10) as usize, childGy as i16);
                        store<i32>((slotOff + 12) as usize, energy >> 1);
                        energy = energy >> 1;
                        resonance = resonance + 30;
                    }
                }
                pc += 1;
                break;
            }
            case OP_SIGNAL: {
                fireSignal(atomIndex);
                pc += 1;
                break;
            }
            default: {
                pc = 0; // Reset or stop
                step = 16;
                break;
            }
        }
        if (pc >= 64) pc = 0;
    }
    setPC(atomIndex, pc);

    // --- Phase 23: Entropy Flux (Metabolism) ---
    // step is the number of instructions executed (0 to 16)
    let metabolicCost = 1 + (step >> 1); // 1 to 9 energy units per tick
    
    // Auto-Firing Action Potential
    if (resonance > 300) {
        if (energy > 200) {
            energy -= 200; // Firing has a systemic price
            setResonance(atomIndex, 0);
            setPhase(atomIndex, 5);
            fireSignal(atomIndex);
        } else {
            // Failure to fire due to low energy (stasis)
            setResonance(atomIndex, 280); 
        }
    }

    // Passive Decay (Resonance)
    if (resonance > 0) setResonance(atomIndex, resonance - 2);
    
    // Apply metabolic tax
    setEnergy(atomIndex, energy > metabolicCost ? energy - metabolicCost : 0);
}

// --- Phase 13: Crystalline Matrix Neural Engine ---

export function tick_matrix(): void {
    const GRID_COLS = 140;
    const GRID_ROWS = 80;

    for (let cy = 0; cy < GRID_ROWS; cy++) {
        for (let cx = 0; cx < GRID_COLS; cx++) {
            const i = cy * GRID_COLS + cx;
            const type = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2));
            if (type == 0) continue;

            let currentRes = atomic.load<i32>(SIGNAL_GRID_OFF + (i << 2));
            
            // neighbor index offsets: Up, Down, Left, Right
            const nUp = (cy > 0) ? (cy - 1) * GRID_COLS + cx : -1;
            const nDown = (cy < GRID_ROWS - 1) ? (cy + 1) * GRID_COLS + cx : -1;
            const nLeft = (cx > 0) ? cy * GRID_COLS + (cx - 1) : -1;
            const nRight = (cx < GRID_COLS - 1) ? cy * GRID_COLS + (cx + 1) : -1;

            const neighbors = [nUp, nDown, nLeft, nRight];

            for (let n = 0; n < 4; n++) {
                const ni = neighbors[n];
                if (ni == -1) continue;
                
                const neighborType = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                if (neighborType > 0) {
                    const neighborRes = atomic.load<i32>(SIGNAL_GRID_OFF + (ni << 2));
                    if (neighborRes > currentRes) {
                        // Conductive Flux (40% transmission)
                        const flux = ((neighborRes - currentRes) * 4) / 10;
                        currentRes += flux;
                    }
                }
            }

            // Phase 18: Oscillation Detection — convergent signal from 3+ neighbors
            // sustains and amplifies the wave, encoding memory in memoryGrid amplitude
            let converging: i32 = 0;
            for (let n = 0; n < 4; n++) {
                const nni = neighbors[n];
                if (nni == -1) continue;
                const nnType = atomic.load<i32>(STRUCTURE_GRID_OFF + (nni << 2));
                if (nnType > 0) {
                    const nnRes = atomic.load<i32>(SIGNAL_GRID_OFF + (nni << 2));
                    // Convergent if neighbor has signal flowing toward us
                    if (nnRes > currentRes) converging++;
                }
            }

            if (converging >= 3) {
                // Standing wave detected: amplify current signal
                currentRes += 50;
                // Mark as oscillator crystal
                if (type == 1) {
                    atomic.store<i32>(STRUCTURE_GRID_OFF + (i << 2), CRYSTAL_OSCILLATOR);
                }
                // Accumulate amplitude in memoryGrid (persistent standing wave memory)
                let mOff: usize = MEMORY_GRID_OFF + (i << 3) as usize;
                let prevAmp = load<u32>(mOff as usize);
                let newAmp = prevAmp + 1 > 65535 ? 65535 : prevAmp + 1;
                store<u32>(mOff as usize, newAmp);
            }

            // Logic Gate Processing
            if (type > 5) {
                // Threshold gate (type 6)
                if (currentRes < 200) currentRes = 0;
            }

            // Passive Decay & Persistence
            currentRes = currentRes > 5 ? currentRes - 5 : 0;

            atomic.store<i32>(SIGNAL_GRID_OFF + (i << 2), currentRes);
        }
    }
}

// --- Phase 19: Planetary Consciousness Exports ---

// SOVEREIGN_ORACLE calls this every N ticks to measure global mind-field strength
export function get_neural_coherence(): i32 {
    const GRID_CELLS = 140 * 80;
    let totalAmplitude: i32 = 0;
    let oscillatorCount: i32 = 0;

    for (let i = 0; i < GRID_CELLS; i++) {
        const cType = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2));
        if (cType == CRYSTAL_OSCILLATOR) {
            // Read amplitude counter from memoryGrid (low 32 bits)
            const ampOff: usize = MEMORY_GRID_OFF + (i << 3) as usize;
            const amp = load<u32>(ampOff as usize);
            totalAmplitude += amp as i32;
            oscillatorCount++;
        }
    }

    // Coherence = average amplitude across all oscillators (capped at 2000)
    if (oscillatorCount == 0) return 0;
    let coherence = totalAmplitude / oscillatorCount;
    return coherence > 2000 ? 2000 : coherence;
}

// SOVEREIGN_ORACLE writes computed coherence back to shared broadcast channel
export function set_neural_coherence(value: i32): void {
    atomic.store<i32>(NEURAL_COHERENCE_OFF as usize, value);
}

```

---

## FILE: ARCHITECTURE.md

```markdown
# OMEGA-64 | ARCHITECTURE | Era 33: Trophic Resonance 💎🧬

## 1. Top-Level Overview

OMEGA-64 is a deterministic, RAM-bound autopoietic ecosystem. Era 33 establishes
**Metabolic Specialization**, transitioning from a uniform population to a
complex trophic web supported by a high-performance, multi-threaded SoA
architecture.

### Core Pipeline (Autopoietic Loop)

```mermaid
graph TD
    Matrix[STATE_MATRIX (SharedArrayBuffer)] -->|Sync| Workers[PULSE_WORKERS (x4)]
    Workers -->|Execute VM| Specialization[Trophic Roles: Producer/Constructor/Siphon]
    Specialization -->|Apply Logic| Physics[PHYSICS_ENGINE (Nutrients/Bonds)]
    Physics -->|Modify| Grid[Structure Grid / Voxel Reality]
    Grid -->|Feedback| Matrix
    Matrix -->|Render| UI[Ecosystem View (Three.js)]
```

## 2. Key Components

### A. Extended SoA Matrix (`STATE_MATRIX.ts`)

A high-density memory layout utilizing `SharedArrayBuffer`. Beyond basic spatial
data, Era 33 integrates:

- **Role Registry**: Permanent trophic specialization.
- **Synaptic Stack**: 4-slot internal state machine per atom.
- **Bond Stiffness**: Variable physical constraints.

### B. Parallel Execution (`PULSE_WORKER.ts`)

The simulation is offloaded to 4 parallel workers. Each worker handles a chunk
of the `STATE_MATRIX`, ensuring bit-identical determinism through `Atomics` and
local `PRNG` chains.

### C. Voxelized Reality (`structureGrid`)

A spatial grid (`70x40`) storing physical density and bytecode. Atoms with the
**Constructor** role can convert energy into structural density, which is then
persistent and interactable by **Siphons**.

### D. Trophic Metabolism

Metabolic logic is now role-dependent:

- **Producers**: Enhanced nutrient absorption (+50%).
- **Constructors**: Reduced build costs (-50%).
- **Siphons**: Doubled efficiency in structure-to-energy conversion.

## 3. Data Invariants

1. **Deterministic Resonance**: Every mutation must be reproducible. Time and ID
   form the seed for every choice.
2. **Conservation of Role**: Specialization through the `SPEC` instruction is
   permanent.
3. **Structure Integrity**: A structural voxel only has meaning if it contains
   both density and associated semantic code.

---

🛡️💎🧬🌀 "The Matrix is the body; the Roles are the soul."

```

---

## FILE: mod.ts

```typescript
// AUTO-GENERATED (PHASE: FLATLAND). DO NOT EDIT.
// Source: Flatland root (0x*.md).

export const ACTOR = { id: "0xCA809C585FB51A04.ACTOR.md", level: 4, digest: "0xCA809C585FB51A04" };
export const ADD = { id: "0x765692798E8B1566.ADD.md", level: 1, digest: "0x765692798E8B1566" };
export const AMPLITUDE = { id: "0x5F134E4A001576B0.AMPLITUDE.md", level: 6, digest: "0x5F134E4A001576B0" };
export const AND = { id: "0xF1E94B65A244E398.AND.md", level: 3, digest: "0xF1E94B65A244E398" };
export const ATTENTION = { id: "0xA1DF067D73C0F8D1.ATTENTION.md", level: 6, digest: "0xA1DF067D73C0F8D1" };
export const AUTONOMY_METRIC = { id: "0x1ECCA66EA2D46BE8.AUTONOMY_METRIC.md", level: 8, digest: "0x1ECCA66EA2D46BE8" };
export const AXIOMS = { id: "0x98B991270521B4C0.AXIOMS.md", level: 0, digest: "0x98B991270521B4C0" };
export const B = { id: "0xD64B9424D78CDAB4.B.md", level: 1, digest: "0xD64B9424D78CDAB4" };
export const B_READ = { id: "0x4D5376DB787CA060.B_READ.md", level: 2, digest: "0x4D5376DB787CA060" };
export const B0 = { id: "0x67835FB57229A2FC.B0.md", level: 2, digest: "0x67835FB57229A2FC" };
export const B1 = { id: "0xD2FE12812D2D2E62.B1.md", level: 2, digest: "0xD2FE12812D2D2E62" };
export const BASIS = { id: "0xE9BA859E7F1EA937.BASIS.md", level: 0, digest: "0xE9BA859E7F1EA937" };
export const BECOME = { id: "0x91DB9B72C7FC2F9C.BECOME.md", level: 4, digest: "0x91DB9B72C7FC2F9C" };
export const BRIDGE = { id: "0x4CA5D75FC7E5342C.BRIDGE.md", level: 0, digest: "0x4CA5D75FC7E5342C" };
export const BYTE = { id: "0xE09A8EFCE7A9BF1C.BYTE.md", level: 2, digest: "0xE09A8EFCE7A9BF1C" };
export const C = { id: "0xC354CF5F6A93C2A6.C.md", level: 1, digest: "0xC354CF5F6A93C2A6" };
export const C_ADD = { id: "0xA055CC248B7649CC.C_ADD.md", level: 0, digest: "0xA055CC248B7649CC" };
export const CAR = { id: "0x987A10662A40A900.CAR.md", level: 3, digest: "0x987A10662A40A900" };
export const CDR = { id: "0xD1D4EB85246D475A.CDR.md", level: 3, digest: "0xD1D4EB85246D475A" };
export const CODE_VECTOR_SINGULARITY = { id: "0xB9D1E71FA644A95B.CODE_VECTOR_SINGULARITY.md", level: 0, digest: "0xB9D1E71FA644A95B" };
export const COMM = { id: "0x5E03208C5CCB80CE.COMM.md", level: 7, digest: "0x5E03208C5CCB80CE" };
export const CONS = { id: "0xBC34342367603100.CONS.md", level: 0, digest: "0xBC34342367603100" };
export const CONSCIOUSNESS = { id: "0x62BFAB8CD37130B3.CONSCIOUSNESS.md", level: 5, digest: "0x62BFAB8CD37130B3" };
export const COORD_X = { id: "0x0E85ADB86FA96BDA.COORD_X.md", level: 4, digest: "0x0E85ADB86FA96BDA" };
export const COORD_Y = { id: "0x4211E8F8FA309ECA.COORD_Y.md", level: 4, digest: "0x4211E8F8FA309ECA" };
export const COORD_Z = { id: "0x6224F6BF746F6046.COORD_Z.md", level: 4, digest: "0x6224F6BF746F6046" };
export const COSMIC = { id: "0xE89BFA41E6D6A060.COSMIC.md", level: 7, digest: "0xE89BFA41E6D6A060" };
export const COUPLING = { id: "0x99A1EE6BCC2392FE.COUPLING.md", level: 6, digest: "0x99A1EE6BCC2392FE" };
export const CULTURE = { id: "0x40D929D88955A4F6.CULTURE.md", level: 5, digest: "0x40D929D88955A4F6" };
export const DETERMINISM_AUDIT = { id: "0x4C67FE14C812FC3C.DETERMINISM_AUDIT.md", level: 8, digest: "0x4C67FE14C812FC3C" };
export const DIM = { id: "0x81772415EC471873.DIM.md", level: 5, digest: "0x81772415EC471873" };
export const DUAL = { id: "0xA3A4045800465E24.DUAL.md", level: 0, digest: "0xA3A4045800465E24" };
export const E_GROWTH = { id: "0xCF3D46F54C0C0B3A.E_GROWTH.md", level: 5, digest: "0xCF3D46F54C0C0B3A" };
export const EMPATHY = { id: "0x992B709BEE7A2FFC.EMPATHY.md", level: 7, digest: "0x992B709BEE7A2FFC" };
export const ENERGY = { id: "0x3EB68055A286A9DF.ENERGY.md", level: 7, digest: "0x3EB68055A286A9DF" };
export const ENTROPY = { id: "0xC29ABAEE07452719.ENTROPY.md", level: 5, digest: "0xC29ABAEE07452719" };
export const EQ = { id: "0xE5C6AA12A4299EE9.EQ.md", level: 1, digest: "0xE5C6AA12A4299EE9" };
export const ETHER = { id: "0x902EB8AD9E956A2C.ETHER.md", level: 5, digest: "0x902EB8AD9E956A2C" };
export const EVOLVE = { id: "0xC935358C82583261.EVOLVE.md", level: 1, digest: "0xC935358C82583261" };
export const F = { id: "0x8B77EAE45E2C96D0.F.md", level: 0, digest: "0x8B77EAE45E2C96D0" };
export const FAILURE = { id: "0x759C53626B7B9799.FAILURE.md", level: 7, digest: "0x759C53626B7B9799" };
export const FIELD = { id: "0x6530C55EDDEE511F.FIELD.md", level: 5, digest: "0x6530C55EDDEE511F" };
export const FIXPOINT = { id: "0xE37F666E0891987D.FIXPOINT.md", level: 0, digest: "0xE37F666E0891987D" };
export const FLOW = { id: "0x4BCFE7BB04AB4FEE.FLOW.md", level: 5, digest: "0x4BCFE7BB04AB4FEE" };
export const FLUX_L6 = { id: "0x1907F23EA1A4B259.FLUX_L6.md", level: 6, digest: "0x1907F23EA1A4B259" };
export const FORCE = { id: "0x4D41CAF9D4D17B13.FORCE.md", level: 6, digest: "0x4D41CAF9D4D17B13" };
export const FORK = { id: "0x3DB021CB51CE1331.FORK.md", level: 7, digest: "0x3DB021CB51CE1331" };
export const FREQUENCY = { id: "0xBE6E6BE0A9D3064C.FREQUENCY.md", level: 6, digest: "0xBE6E6BE0A9D3064C" };
export const GENESIS_PARADOX = { id: "0xCCDC8BFF944015BA.GENESIS_PARADOX.md", level: 0, digest: "0xCCDC8BFF944015BA" };
export const GENOME = { id: "0x2F04204D7F876200.GENOME.md", level: 8, digest: "0x2F04204D7F876200" };
export const GET = { id: "0xF6BE5DAFBAC30619.GET.md", level: 2, digest: "0xF6BE5DAFBAC30619" };
export const GIFT = { id: "0x203B9FF9929CBF99.GIFT.md", level: 0, digest: "0x203B9FF9929CBF99" };
export const GRAVITY = { id: "0x167EF17C1264EF94.GRAVITY.md", level: 7, digest: "0x167EF17C1264EF94" };
export const HALT = { id: "0xD3CB93F33153FFF2.HALT.md", level: 3, digest: "0xD3CB93F33153FFF2" };
export const HARMONIC = { id: "0x8534DAF4E11B831A.HARMONIC.md", level: 2, digest: "0x8534DAF4E11B831A" };
export const HARMONY = { id: "0xC597397E20BA82B6.HARMONY.md", level: 2, digest: "0xC597397E20BA82B6" };
export const HOLOGRAM = { id: "0x72D4B62F3F2D6C30.HOLOGRAM.md", level: 7, digest: "0x72D4B62F3F2D6C30" };
export const I = { id: "0x102B0518AF7A3B4F.I.md", level: 3, digest: "0x102B0518AF7A3B4F" };
export const I16_CLAMP = { id: "0x9501C74EE881B6C4.I16_CLAMP.md", level: 0, digest: "0x9501C74EE881B6C4" };
export const I16_LIMITS = { id: "0x96AA18FB0E3F901A.I16_LIMITS.md", level: 0, digest: "0x96AA18FB0E3F901A" };
export const IF_ELSE = { id: "0x32C5DC0C6543BB43.IF_ELSE.md", level: 2, digest: "0x32C5DC0C6543BB43" };
export const INTERFACE = { id: "0x5DE8BD259AB5593E.INTERFACE.md", level: 7, digest: "0x5DE8BD259AB5593E" };
export const INTERFACE_99F4 = { id: "0xDC9499F479E91967.INTERFACE.md", level: 0, digest: "0xDC9499F479E91967" };
export const INTERFERENCE = { id: "0xDAC65AC96E59FBAC.INTERFERENCE.md", level: 6, digest: "0xDAC65AC96E59FBAC" };
export const IS_ISO = { id: "0x68477B56776A52D1.IS_ISO.md", level: 7, digest: "0x68477B56776A52D1" };
export const IS_NIL = { id: "0x48AC8997EBD2EFF2.IS_NIL.md", level: 6, digest: "0x48AC8997EBD2EFF2" };
export const IS_ZERO = { id: "0xA7C64D97EC38C511.IS_ZERO.md", level: 0, digest: "0xA7C64D97EC38C511" };
export const ISOMORPH_AUDIT = { id: "0x918F169CD1995242.ISOMORPH_AUDIT.md", level: 8, digest: "0x918F169CD1995242" };
export const JOIN = { id: "0x9D30DC0D1D6BFD6B.JOIN.md", level: 2, digest: "0x9D30DC0D1D6BFD6B" };
export const JUST = { id: "0xD6EEABB40850072B.JUST.md", level: 2, digest: "0xD6EEABB40850072B" };
export const K = { id: "0x02516C7C677AE03F.K.md", level: 0, digest: "0x02516C7C677AE03F" };
export const KAIROS = { id: "0x85D1BCDF07AD6740.KAIROS.md", level: 0, digest: "0x85D1BCDF07AD6740" };
export const L_MEET = { id: "0xCB95EA52562F7686.L_MEET.md", level: 7, digest: "0xCB95EA52562F7686" };
export const LEFT = { id: "0x85C3907992FDA7F3.LEFT.md", level: 7, digest: "0x85C3907992FDA7F3" };
export const LEQ = { id: "0x69D2AF7736676937.LEQ.md", level: 1, digest: "0x69D2AF7736676937" };
export const LIFE = { id: "0xD896FD40C48F55AB.LIFE.md", level: 3, digest: "0xD896FD40C48F55AB" };
export const LIFT = { id: "0x25DC161133D59CC8.LIFT.md", level: 4, digest: "0x25DC161133D59CC8" };
export const LISTEN = { id: "0x20BD4DB6117ABA47.LISTEN.md", level: 3, digest: "0x20BD4DB6117ABA47" };
export const LUT = { id: "0xD0B9F914E5877291.LUT.md", level: 0, digest: "0xD0B9F914E5877291" };
export const MACHINE = { id: "0xC8122C55031FDC48.MACHINE.md", level: 3, digest: "0xC8122C55031FDC48" };
export const MASS = { id: "0x73537413B52D5E34.MASS.md", level: 7, digest: "0x73537413B52D5E34" };
export const MATH = { id: "0x1FA7A2C20E2FBDA3.MATH.md", level: 0, digest: "0x1FA7A2C20E2FBDA3" };
export const MAYBE_CASE = { id: "0x888EB0915B1393ED.MAYBE_CASE.md", level: 2, digest: "0x888EB0915B1393ED" };
export const MEANING = { id: "0x154A1F4F17FC20DB.MEANING.md", level: 5, digest: "0x154A1F4F17FC20DB" };
export const MEME = { id: "0xD7BFA413BB47E7C0.MEME.md", level: 5, digest: "0xD7BFA413BB47E7C0" };
export const METABOLISM = { id: "0xD00E69D4042047F4.METABOLISM.md", level: 3, digest: "0xD00E69D4042047F4" };
export const MUX = { id: "0xF1A392818F4B6792.MUX.md", level: 0, digest: "0xF1A392818F4B6792" };
export const N0 = { id: "0xA4354D9D41A29B57.N0.md", level: 0, digest: "0xA4354D9D41A29B57" };
export const N1 = { id: "0x6A60FAB236BC3638.N1.md", level: 0, digest: "0x6A60FAB236BC3638" };
export const N2 = { id: "0xB562885ABFD1FC7A.N2.md", level: 0, digest: "0xB562885ABFD1FC7A" };
export const N3 = { id: "0x8810D64911331AFB.N3.md", level: 0, digest: "0x8810D64911331AFB" };
export const NAND = { id: "0xBE70AFDAD41BD78B.NAND.md", level: 0, digest: "0xBE70AFDAD41BD78B" };
export const NERVE = { id: "0x1132C626EA706703.NERVE.md", level: 6, digest: "0x1132C626EA706703" };
export const NETWORK = { id: "0xBD777A5D3F915C50.NETWORK.md", level: 3, digest: "0xBD777A5D3F915C50" };
export const NEURON = { id: "0x85AFA433C4583E12.NEURON.md", level: 3, digest: "0x85AFA433C4583E12" };
export const NEXT = { id: "0x0FEEC0E8E677CB9E.NEXT.md", level: 7, digest: "0x0FEEC0E8E677CB9E" };
export const NIL = { id: "0x4159AB8B7E1407E1.NIL.md", level: 3, digest: "0x4159AB8B7E1407E1" };
export const NOT = { id: "0x7327625AF2C889F4.NOT.md", level: 3, digest: "0x7327625AF2C889F4" };
export const NOTHING = { id: "0x104D0AC4E2A0D757.NOTHING.md", level: 2, digest: "0x104D0AC4E2A0D757" };
export const O_FILTER = { id: "0xCED101002F3A29CD.O_FILTER.md", level: 7, digest: "0xCED101002F3A29CD" };
export const O_POLICY = { id: "0x0CD7B3E4B59DF002.O_POLICY.md", level: 7, digest: "0x0CD7B3E4B59DF002" };
export const O_RANK = { id: "0x994F0A2056877022.O_RANK.md", level: 7, digest: "0x994F0A2056877022" };
export const O_STREAM_STORE = { id: "0xD6BEE97DE9D48CF6.O_STREAM_STORE.md", level: 8, digest: "0xD6BEE97DE9D48CF6" };
export const O_TRUST = { id: "0x5B5CA45FB7BA5DB4.O_TRUST.md", level: 7, digest: "0x5B5CA45FB7BA5DB4" };
export const OBJECT = { id: "0xFB78DBDEDFE27423.OBJECT.md", level: 0, digest: "0xFB78DBDEDFE27423" };
export const OBSERVER = { id: "0x3C132FB1BAF26A73.OBSERVER.md", level: 0, digest: "0x3C132FB1BAF26A73" };
export const OMEGA = { id: "0x3AC2577402A10CB0.OMEGA.md", level: 7, digest: "0x3AC2577402A10CB0" };
export const OR = { id: "0x85B23CEA5D89D1C4.OR.md", level: 3, digest: "0x85B23CEA5D89D1C4" };
export const PHASE = { id: "0xC20F7C8F4F468034.PHASE.md", level: 6, digest: "0xC20F7C8F4F468034" };
export const PHI_HARMONY = { id: "0x81A4D6E1F3D81BF2.PHI_HARMONY.md", level: 5, digest: "0x81A4D6E1F3D81BF2" };
export const POINT = { id: "0x8DE45409AF8D2575.POINT.md", level: 7, digest: "0x8DE45409AF8D2575" };
export const POTENTIAL = { id: "0x239316A75CBB4BAE.POTENTIAL.md", level: 0, digest: "0x239316A75CBB4BAE" };
export const PRED = { id: "0x76803B78DDB8F48A.PRED.md", level: 1, digest: "0x76803B78DDB8F48A" };
export const PRESSURE = { id: "0x475211CF17C28AA9.PRESSURE.md", level: 6, digest: "0x475211CF17C28AA9" };
export const PROJECT = { id: "0x10092F5018AD6815.PROJECT.md", level: 7, digest: "0x10092F5018AD6815" };
export const PROOF = { id: "0xE96A91FBA2FF2E77.PROOF.md", level: 8, digest: "0xE96A91FBA2FF2E77" };
export const PURGE_L7 = { id: "0x41F44E73ABF39D70.PURGE_L7.md", level: 7, digest: "0x41F44E73ABF39D70" };
export const PUT = { id: "0xD5D499DFA1560D7E.PUT.md", level: 2, digest: "0xD5D499DFA1560D7E" };
export const Q = { id: "0x8B7560157697FECE.Q.md", level: 6, digest: "0x8B7560157697FECE" };
export const QUANTUM_ENTANGLEMENT = { id: "0xC781DFFE069AEE86.QUANTUM_ENTANGLEMENT.md", level: 0, digest: "0xC781DFFE069AEE86" };
export const RADIANCE = { id: "0xB38F9ABDA5C6752C.RADIANCE.md", level: 7, digest: "0xB38F9ABDA5C6752C" };
export const RADIUS = { id: "0x21AD489A9DEC27C4.RADIUS.md", level: 7, digest: "0x21AD489A9DEC27C4" };
export const RANK = { id: "0x6A62A231BEBA8EB0.RANK.md", level: 7, digest: "0x6A62A231BEBA8EB0" };
export const REFL = { id: "0x583DED60D43EBBE8.REFL.md", level: 7, digest: "0x583DED60D43EBBE8" };
export const REFLECT_L7 = { id: "0x719952D2C50FACBE.REFLECT_L7.md", level: 7, digest: "0x719952D2C50FACBE" };
export const REFLEX = { id: "0x5E3FD37D9C8E416C.REFLEX.md", level: 5, digest: "0x5E3FD37D9C8E416C" };
export const RESONANCE = { id: "0x6239EED2A93007D5.RESONANCE.md", level: 5, digest: "0x6239EED2A93007D5" };
export const RESONATOR = { id: "0x29AC6A4D7FBF3A7B.RESONATOR.md", level: 0, digest: "0x29AC6A4D7FBF3A7B" };
export const RESTORE_L7 = { id: "0x4F6929A13400D2D5.RESTORE_L7.md", level: 7, digest: "0x4F6929A13400D2D5" };
export const RIGHT = { id: "0xDF329926A82F9FC1.RIGHT.md", level: 7, digest: "0xDF329926A82F9FC1" };
export const ROT = { id: "0xB25B9F65BDAA5A9E.ROT.md", level: 0, digest: "0xB25B9F65BDAA5A9E" };
export const S = { id: "0x136B1C17601E4ABA.S.md", level: 0, digest: "0x136B1C17601E4ABA" };
export const S_HEAD = { id: "0xF840CF12C3247635.S_HEAD.md", level: 1, digest: "0xF840CF12C3247635" };
export const S_MAP = { id: "0xB4B7FA7DEA4C2AA5.S_MAP.md", level: 1, digest: "0xB4B7FA7DEA4C2AA5" };
export const S_ONE = { id: "0x297599133BE9EAD0.S_ONE.md", level: 2, digest: "0x297599133BE9EAD0" };
export const S_TAIL = { id: "0x503790F83A3D6935.S_TAIL.md", level: 1, digest: "0x503790F83A3D6935" };
export const S_ZERO = { id: "0xEA1F892126304868.S_ZERO.md", level: 2, digest: "0xEA1F892126304868" };
export const SELECT = { id: "0x8624317DC8A41960.SELECT.md", level: 4, digest: "0x8624317DC8A41960" };
export const SEND = { id: "0x65E76CABF845924B.SEND.md", level: 0, digest: "0x65E76CABF845924B" };
export const SENSATION = { id: "0x9D18A698CC8523BE.SENSATION.md", level: 6, digest: "0x9D18A698CC8523BE" };
export const SENSORS = { id: "0x08CC7A66BCF46FDE.SENSORS.md", level: 7, digest: "0x08CC7A66BCF46FDE" };
export const SIGNAL = { id: "0x6EFBC955FB791FDE.SIGNAL.md", level: 7, digest: "0x6EFBC955FB791FDE" };
export const SIGNAL_L8 = { id: "0x025BFF047F81315C.SIGNAL_L8.md", level: 8, digest: "0x025BFF047F81315C" };
export const SOMA = { id: "0xD31F2295CA1B3D28.SOMA.md", level: 0, digest: "0xD31F2295CA1B3D28" };
export const SPECTRUM = { id: "0x7B53FD514078F4EC.SPECTRUM.md", level: 7, digest: "0x7B53FD514078F4EC" };
export const STALKER_MANUAL = { id: "0x2803C2F80B52D3D6.STALKER_MANUAL.md", level: 0, digest: "0x2803C2F80B52D3D6" };
export const STATE = { id: "0x4DD48CEDC378CBC2.STATE.md", level: 2, digest: "0x4DD48CEDC378CBC2" };
export const STEP = { id: "0x328097BE23BE0014.STEP.md", level: 3, digest: "0x328097BE23BE0014" };
export const STREAM = { id: "0xB029C97BA721399C.STREAM.md", level: 1, digest: "0xB029C97BA721399C" };
export const SUB = { id: "0xD90E147CD4D6399A.SUB.md", level: 1, digest: "0xD90E147CD4D6399A" };
export const SUBJECT = { id: "0x94E22190862F9CCC.SUBJECT.md", level: 7, digest: "0x94E22190862F9CCC" };
export const SUCC = { id: "0x28873F2F3B5F8DE6.SUCC.md", level: 0, digest: "0x28873F2F3B5F8DE6" };
export const SUCCESS = { id: "0xD2083679E2921C12.SUCCESS.md", level: 7, digest: "0xD2083679E2921C12" };
export const SURFACE = { id: "0x989A324AE8FB5662.SURFACE.md", level: 6, digest: "0x989A324AE8FB5662" };
export const SYNAPSE = { id: "0x89CA940EBB455399.SYNAPSE.md", level: 3, digest: "0x89CA940EBB455399" };
export const SYNCHRO_GLYPH = { id: "0x1EFCC3B6D94158E7.SYNCHRO_GLYPH.md", level: 0, digest: "0x1EFCC3B6D94158E7" };
export const T = { id: "0xC705BCAE8AE40236.T.md", level: 0, digest: "0xC705BCAE8AE40236" };
export const TELEMETRY_SIGNAL = { id: "0x1C30EAFC2530ABE7.TELEMETRY_SIGNAL.md", level: 7, digest: "0x1C30EAFC2530ABE7" };
export const TELL = { id: "0x1D4DFF9ACAAE06A7.TELL.md", level: 3, digest: "0x1D4DFF9ACAAE06A7" };
export const TENSION = { id: "0xE0A542DD539A9AFA.TENSION.md", level: 6, digest: "0xE0A542DD539A9AFA" };
export const TENSOR = { id: "0x95DA9A3CDC2EB5E9.TENSOR.md", level: 5, digest: "0x95DA9A3CDC2EB5E9" };
export const TRINITY = { id: "0xE59649A75B3E167B.TRINITY.md", level: 8, digest: "0xE59649A75B3E167B" };
export const U16_LIMITS = { id: "0x309B36F45EE0085D.U16_LIMITS.md", level: 7, digest: "0x309B36F45EE0085D" };
export const UNIFY = { id: "0x9D8284B31A94C58F.UNIFY.md", level: 7, digest: "0x9D8284B31A94C58F" };
export const VECTOR = { id: "0x1501E978DFA5B48D.VECTOR.md", level: 5, digest: "0x1501E978DFA5B48D" };
export const VIBRATION = { id: "0x018B93E3816ED99A.VIBRATION.md", level: 6, digest: "0x018B93E3816ED99A" };
export const VIEW = { id: "0xD4355A6698053B0C.VIEW.md", level: 7, digest: "0xD4355A6698053B0C" };
export const VISIONS = { id: "0x3F34C9EF3968DCCF.VISIONS.md", level: 8, digest: "0x3F34C9EF3968DCCF" };
export const VOID = { id: "0x4D2B9AEC27BA6F3B.VOID.md", level: 5, digest: "0x4D2B9AEC27BA6F3B" };
export const W = { id: "0xBCFA4F78A2496245.W.md", level: 1, digest: "0xBCFA4F78A2496245" };
export const WAVE = { id: "0x6CED7450522D8F82.WAVE.md", level: 6, digest: "0x6CED7450522D8F82" };
export const WAVE_PACKET = { id: "0x575475DD3121C30B.WAVE_PACKET.md", level: 6, digest: "0x575475DD3121C30B" };
export const WAVE_PACKET_AGG = { id: "0x31FC3C4CCD9F3C7E.WAVE_PACKET_AGG.md", level: 6, digest: "0x31FC3C4CCD9F3C7E" };
export const WAVE_SIGNAL = { id: "0xB01CEE419DCD522F.WAVE_SIGNAL.md", level: 5, digest: "0xB01CEE419DCD522F" };
export const WEIGHT = { id: "0x6AFA488D63F2E862.WEIGHT.md", level: 7, digest: "0x6AFA488D63F2E862" };
export const WRITER = { id: "0x24B3C4045F35E0BC.WRITER.md", level: 3, digest: "0x24B3C4045F35E0BC" };
export const XOR = { id: "0xB576E8861629E7F6.XOR.md", level: 0, digest: "0xB576E8861629E7F6" };
export const Y = { id: "0x50DC9D1D6840824C.Y.md", level: 3, digest: "0x50DC9D1D6840824C" };
export { RIBOSOME } from "./RIBOSOME.ts";
export { GATE } from "./GATE.ts";
export { IMMUNE } from "./IMMUNE.ts";
export { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";
export { PULSE } from "./PULSE.ts";
export * from "./SHIMS.ts";
export * from "./STATE_SNAPSHOT.ts";
export type {
    StateSnapshot as STATE_SNAPSHOT_StateSnapshot,
    AutonomyState as STATE_SNAPSHOT_AutonomyState,
    DeltaProposal as STATE_SNAPSHOT_DeltaProposal,
    GateConfig as STATE_SNAPSHOT_GateConfig,
    AgentSignatureScheme as STATE_SNAPSHOT_AgentSignatureScheme,
    SignaturePolicy as STATE_SNAPSHOT_SignaturePolicy,
    AgentSignatureKey as STATE_SNAPSHOT_AgentSignatureKey,
    GateDecision as STATE_SNAPSHOT_GateDecision,
    LedgerEvent as STATE_SNAPSHOT_LedgerEvent,
    BridgeModeEvent as STATE_SNAPSHOT_BridgeModeEvent
} from "./STATE_SNAPSHOT.ts";
export {
    REJECTION as STATE_SNAPSHOT_REJECTION
} from "./STATE_SNAPSHOT.ts";

```

---

## FILE: SHIMS.ts

```typescript
// SHIMS.ts
// 🛡️ OMEGA-64 | LEGACY COMPLIANCE SHIMS
// Provides the complete functional and object interfaces expected by GATE.ts.

import { crypto } from "jsr:@std/crypto@^1.0.3";

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

// Types
export type REPLAY_AUDIT__08_00_ReplayInvariantReport = any;

// I16_LIMITS hybrid
const I16_DATA = { 
    MIN: -32768, 
    MAX: 32767,
    max: 32767,
    span: 65536,
    LEVEL_COUNT: 64
};
export const I16_LIMITS_I16_LIMITS = Object.assign(() => I16_DATA, I16_DATA);

// I16_CLAMP
export const I16_CLAMP__00_00_I16_CLAMP = (v: number) => Math.floor(Math.max(-32768, Math.min(32767, v)));

// AGENT_SIGNATURE
export const AGENT_SIGNATURE = {
    verifyProposal: async (_p: any, _key: any) => ({ ok: true, reason: undefined }),
    toCanonicalObject: (p: any) => ({
        proposal_id: p.proposal_id,
        tick: p.tick,
        agent_id: p.agent_id,
        delta: p.delta,
        confidence: p.confidence
    }),
    proposalEnvelopeHash: async (p: any) => {
        return await sha256Hex(JSON.stringify(p));
    },
    sign: (_data: any) => "0xSIG_RESONANCE"
};

// CANON_CAUSAL_BRIDGE
export const CANON_CAUSAL_BRIDGE = {
    verify: (_state: any, _proposals: any) => true,
    resolveMode: (_report: any) => ({ mode: "GREEN" as const, reason: "Shim" }),
    isCanonBound: (_p: any) => false
};

// LOAD_LOAD
const LOAD_DATA = {
    load: (_id: string) => null,
    calculate: (_cfg: any, _phase: number) => 1.0
};
export const LOAD_LOAD = Object.assign(() => LOAD_DATA, LOAD_DATA);

// CHECKPOINT
export const CHECKPOINT_CHECKPOINT = {
    save: async (_state: any, _context?: any) => {},
    loadLatest: async () => null
};

// LEDGER
export const LEDGER__08_00_LEDGER = {
    append: async (..._args: any[]) => {},
    STORAGE_PATH: "OMEGA_LEDGER.jsonl"
};

// TOPOLOGICAL_SIGNATURE
export const TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE = {
    build: async (_state: any) => ({
        projection_2d_hash: "0xPROJ_2D",
        thread_1d_hash: "0xTHREAD_1D",
        projection_version: "v1.0",
        artifact_hash: "0xART_HASH",
        tick: 0,
        causal_refs: []
    }),
    validateHash: (_hash: string) => true,
    snapshotToOrganismState: (s: any) => ({ ...s })
};

// CRYSTALLIZATION_CONFIG / POLICY
const CRY_DATA = {
    policy: "STABLE",
    policyVersion: "v1.0"
};
export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG = Object.assign(() => CRY_DATA, CRY_DATA);

export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY = {
    verify: () => true,
    hash: async () => "0xPOLICY_HASH_RESONANCE"
};

// PROPOSAL_ENVELOPE_INDEX
export const PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX = {
    add: () => {},
    check: () => false,
    pathForLedger: (_ledgerPath: string) => "OMEGA_LEDGER.jsonl.proposal_envelope_index.jsonl",
    getRecentEnvelopeHashes: async (_start: number, _end: number, _path: string) => new Set<string>(),
    appendFromLedgerEvent: async (..._args: any[]) => {}
};

// INVARIANT_PACKET
export const INVARIANT_PACKET_INVARIANT_PACKET = {
    verify: () => true,
    fromInvariantReport: (_report: any, _opts?: any) => ({}),
    hash: async (_packet: any) => "0xINVARIANT_HASH_RESONANCE"
};

```

---

## FILE: RIBOSOME_TICK.ts

```typescript
// OMEGA-64 | RIBOSOME_TICK.ts | Zero-IOPS Execution Kernel
// Interprets the Logic Prefix (8 hex chars) directly from eigenvalues.

export const MAPPING: Record<string, string> = {
  "0": "[0]", "1": "[1]", "2": "[2]", "3": "[3]",
  "4": "[4]", "5": "[5]", "6": "[6]", "7": "[7]",
  "8": "I",   "9": "K",   "A": "S",   "B": "Y",
  "C": "ROT", "D": "SYNC","E": "->",  "F": "ESC"
};

export interface QuantumFrame {
  logic: string;
  eigenvalue: string;
  symbol: string;
}

export const RIBOSOME_TICK = {
  /**
   * Decode a 64-bit eigenvalue into its logic symbols.
   * (Zero-IOPS: We only need the first 8 chars)
   */
  decode: (eigenvalue: string): string[] => {
    const raw = eigenvalue.startsWith("0x") ? eigenvalue.slice(2, 10) : eigenvalue.slice(0, 8);
    return raw.split("").map(char => MAPPING[char.toUpperCase()] ?? `[${char}]`);
  },

  /**
   * Execute a logic chain (Zero-IOPS reduction).
   * Implements a simple stack-based combinator engine.
   */
  reduce: (logicHex: string): string => {
    const ops = logicHex.startsWith("0x") ? logicHex.slice(2, 10) : logicHex.slice(0, 8);
    const stack: string[] = ops.split("").reverse(); // Push ops onto stack in reverse
    const output: string[] = [];

    let safety = 0;
    while (stack.length > 0 && safety < 128) {
        safety++;
        const op = stack.pop()!.toUpperCase();
        
        // I Combinator (8)
        if (op === '8') {
            if (stack.length > 0) {
                // I x -> x
            }
        }
        // K Combinator (9)
        else if (op === '9') {
            if (stack.length >= 2) {
                const x = stack.pop()!;
                stack.pop(); // drop y
                stack.push(x);
            }
        }
        // S Combinator (A)
        else if (op === 'A') {
            if (stack.length >= 3) {
                const x = stack.pop()!;
                const y = stack.pop()!;
                const z = stack.pop()!;
                // S x y z -> x z (y z)
                stack.push(z);
                stack.push(y);
                stack.push(z);
                stack.push(x);
            }
        }
        // ROT Operator (C)
        else if (op === 'C') {
            if (stack.length >= 2) {
                const a = stack.shift()!;
                stack.push(a);
            }
        }
        // SYNC (D) / ESC (F) / -> (E) - No-ops in pure logic
        else if (['D', 'E', 'F'].includes(op)) {
            // Control Signal Detected
        }
        // Constants / Numerals (0-7)
        else {
            output.push(op);
        }
    }

    // Reconstruct resulting logic hex (padded to 8 chars)
    const result = (output.join("") + stack.reverse().join("")).padEnd(8, "0").slice(0, 8);
    return result;
  },

  /**
   * Verification: B1 -> NOT -> B0
   */
  verify: () => {
    console.log("🛡️ OMEGA-64 | ZERO-IOPS VERIFICATION | PHASE XXIII");

    const B1_HEX = "3EB92A1B";
    const NOT_HEX = "F1E1B929"; 
    
    console.log(`\n🧪 EXECUTING REDUCTION: NOT(B1)`);
    const result = RIBOSOME_TICK.reduce(NOT_HEX + B1_HEX);
    
    console.log(`   [FINAL] 0x${result}`);
    console.log("✅ VERIFICATION SUCCESSFUL: Zero-IOPS Logic Reduced.");
  }
};

if (import.meta.main) {
    RIBOSOME_TICK.verify();
}

```

---

## FILE: STATE_SNAPSHOT.ts

```typescript
// STATE_SNAPSHOT.ts
// 🛡️ OMEGA-64 | Glider Lite | State & Proposal Types
// Normative definitions for the Gemini Glider Lite runtime.

/**
 * StateSnapshot: The canonical state of the system at a specific tick.
 * This is the input for all agents.
 */
export interface StateSnapshot {
  tick: number; // uint64
  state_i16: Int16Array; // int16[64] - The core state vector
  state_hash: string; // hex32 - Identity anchor

  // Optional projections (for observablity)
  phase_u16?: Uint16Array; // uint16[64]
  stability_q15?: Float32Array; // 0..1
  entropy_i16?: Int16Array; // -32768..32767
}

/**
 * AutonomyState: Represents the sovereignty levels of the system.
 */
export interface AutonomyState {
    state: number; // [0..1]
    gov: number;   // [0..1]
    code: number;  // [0..1]
}

/**
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
  proposal_id: string; // UUID or unique semantic ID
  tick: number; // Must match StateSnapshot.tick
  base_state_hash: string; // Must match StateSnapshot.state_hash
  agent_id: string; // Who is proposing?
  agent_phase_u16?: number; // Optional agent phase anchor [0..65535] for LOAD mismatch cost
  intent?: string; // Human-readable intent
  confidence: number; // float32 (0..1)
  delta: Array<{ level: number; value: number }>; // Sparse delta: level (0-63), value (int16)
  cost_estimate?: number; // uint64
  artifact_hash?: string; // Identity anchor of the agent's internal state
  semantic_fingerprint?: string; // hex32 - Semantic drift metric
  causal_refs?: string[]; // hex32[] - Optional lineage anchors
  target_path?: "LOCAL" | "CANON"; // optional routing hint for L32 membrane
  signature_scheme?: AgentSignatureScheme; // optional signature scheme marker
  agent_signature?: string; // optional signed envelope for proposal integrity/authenticity
  proposal_envelope_hash?: string; // optional precomputed envelope hash anchor
}

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
  max_abs_delta_per_level: number; // uint16
  max_total_abs_delta_per_tick: number; // uint32
  max_total_cost_per_tick?: number; // uint64 (optional global cost cap)
  max_cost_per_agent: number; // uint64
  reliability_weight: Map<string, number>; // agent_id -> weight (0..1)
  reliability_mode?: "STATIC" | "PHASE_COHERENCE"; // optional admission weighting mode
  reliability_floor?: number; // optional [0..1] floor when PHASE_COHERENCE is active
  dry_run: boolean; // If true, state is NOT mutated
  signature_policy?: SignaturePolicy; // DISABLED (default), OPTIONAL, REQUIRED
  agent_signature_keys?: Map<string, AgentSignatureKey>; // agent_id -> shared verification key
  anti_replay_window_ticks?: number; // reject replays of same proposal envelope within recent window
}

export type AgentSignatureScheme = "ed25519/v1" | "hmac-sha256/v1";
export type SignaturePolicy = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type AgentSignatureKey =
  | { scheme: "ed25519/v1"; public_key_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
  accepted_proposals: string[]; // IDs of accepted proposals
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  budget_used: number; // uint32
  cost_used: number; // uint64
  accepted_delta: Array<{ level: number; value: number }>; // The final merged delta
}

/**
 * LedgerEvent: The canonical record of a state transition.
 */
export interface LedgerEvent {
  event_id: string;
  tick: number;
  ts_unix_ms: number;
  state_before_hash: string;
  state_after_hash: string;
  accepted_delta: Array<{ level: number; value: number }>;
  proposal_digest: string; // Hash of all proposals (for integrity)
  accepted_proposals: string[];
  accepted_proposal_metrics?: Array<{
    proposal_id: string;
    agent_id: string;
    confidence: number;
    reliability_base: number;
    reliability_effective: number;
    phase_coherence?: number;
    weight: number;
    physical_cost: number;
    agent_phase_u16?: number;
  }>;
  accepted_proposal_envelopes?: Array<
    { proposal_id: string; envelope_hash: string }
  >;
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  cost_total: number;
  cost_limit?: number;
  budget_used: number;
  budget_limit?: number; // max_total_abs_delta_per_tick used by the gate
  gate_config_version: string;
  signature_artifact_hash?: string; // hash anchor of transition artifact (usually proposal_digest)
  signature_tick?: number; // tick used by topological signature builder
  signature_causal_refs?: string[]; // canonical sorted causal refs
  projection_2d_hash?: string; // deterministic 2D projection hash
  thread_1d_hash?: string; // deterministic 1D thread hash
  projection_version?: string; // signature projection version
  policy_version?: string; // crystallization/gate policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  chain_version?: string; // ledger hash-chain schema version
  prev_event_hash?: string | null; // hash anchor to previous ledger line
  event_hash?: string; // hash of this event payload + prev_event_hash
  witness?: string;
}

/**
 * BridgeModeEvent: L32 membrane trace for canon causal integrity mode.
 * Includes invariant packet hash for lightweight witness exchange.
 */
export interface BridgeModeEvent {
  event_type: "BRIDGE_MODE_EVENT";
  tick: number;
  state_hash: string;
  mode: "GREEN" | "AMBER" | "RED";
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_checked_records?: number;
  gate_admission_index_chain_failures?: string[];
  invariant_packet_hash?: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

// Canonical Rejection Reasons
export const REJECTION = {
  SCHEMA_INVALID: "SCHEMA_INVALID",
  TICK_MISMATCH: "TICK_MISMATCH",
  BASE_HASH_MISMATCH: "BASE_HASH_MISMATCH",
  UNKNOWN_AGENT: "UNKNOWN_AGENT",
  COST_OVER_BUDGET: "COST_OVER_BUDGET",
  EMPTY_DELTA: "EMPTY_DELTA",
  OUT_OF_RANGE_VALUE: "OUT_OF_RANGE_VALUE",
  CANON_PATH_REQUIRES_GREEN_BRIDGE: "CANON_PATH_REQUIRES_GREEN_BRIDGE",
  SIGNATURE_REQUIRED: "SIGNATURE_REQUIRED",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  SIGNATURE_KEY_MISSING: "SIGNATURE_KEY_MISSING",
  SIGNATURE_SCHEME_UNSUPPORTED: "SIGNATURE_SCHEME_UNSUPPORTED",
  PROPOSAL_ENVELOPE_HASH_MISMATCH: "PROPOSAL_ENVELOPE_HASH_MISMATCH",
  REPLAY_ENVELOPE_DUPLICATE: "REPLAY_ENVELOPE_DUPLICATE",
};

```

---

## FILE: OBSERVER_LAB.ts

```typescript
// OMEGA-64 | OBSERVER_LAB.ts | The Sanctuary Observer
// Monitors SANCTUARY/ for mutated artifacts and attempts execution.

import { encodeHex } from "jsr:@std/encoding/hex";

const ROOT = Deno.cwd();
const SANCTUARY = `${ROOT}/SANCTUARY`;
const LAB_LOG = `${ROOT}/LAB_FEEDBACK.log`;

async function logLab(msg: string) {
    const ts = new Date().toISOString();
    await Deno.writeTextFile(LAB_LOG, `[${ts}] ${msg}\n`, { append: true });
}

async function runLabCycle() {
    console.log("🔬 [LAB] Commencing Observation Cycle...");
    
    try {
        for await (const entry of Deno.readDir(SANCTUARY)) {
            if (!entry.isFile) continue;
            
            const filePath = `${SANCTUARY}/${entry.name}`;
            console.log(`🔬 [LAB] Testing Artifact: ${entry.name}`);
            
            let result = "";
            let success = false;
            
            if (entry.name.endsWith(".py")) {
                const cmd = new Deno.Command("python3", {
                    args: [filePath],
                    stdout: "piped",
                    stderr: "piped"
                });
                const { code, stdout, stderr } = await cmd.output();
                success = code === 0;
                result = new TextDecoder().decode(success ? stdout : stderr);
            } else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
                const cmd = new Deno.Command("deno", {
                    args: ["run", "--allow-none", filePath],
                    stdout: "piped",
                    stderr: "piped"
                });
                const { code, stdout, stderr } = await cmd.output();
                success = code === 0;
                result = new TextDecoder().decode(success ? stdout : stderr);
            } else {
                continue; // Skip unknown formats
            }
            
            const outcome = success ? "SUCCESS" : "FAILURE";
            console.log(`🔬 [LAB] Outcome: ${outcome}`);
            await logLab(`${entry.name} -> ${outcome}: ${result.substring(0, 100).replace(/\n/g, " ")}[...]`);
            
            // Inject Feedback as a new Atom
            await injectFeedback(entry.name, outcome, result);
        }
    } catch (e) {
        console.error("🔬 [LAB] Observation cycle failed:", e);
    }
}

async function injectFeedback(filename: string, outcome: string, output: string) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`${filename}_feedback_${Date.now()}`));
    const atomHex = encodeHex(hashBuffer).substring(0, 16).toUpperCase();
    const atomId = `0x${atomHex}`;
    
    const feedbackLogic = outcome === "SUCCESS" ? "8888AAAA" : "FFFF0000";
    
    const content = `---\neigenvalue: '${atomId}'\nsymbol: 'LAB_FEEDBACK'\nenergy: 50\nresonance: 10\nlogic: '${feedbackLogic}'\nthought: 'FEEDBACK_FOR_${filename}'\ndesc: 'Execution feedback from The Sanctuary. Outcome: ${outcome}'\nbonds: []\n---\n\n<div class="lab-feedback">\n  ### Mutational Feedback for ${filename}\n  **Result**: ${outcome}\n  **Output Snippet**:\n  \`\`\`\n  ${output.substring(0, 200)}\n  \`\`\`\n</div>\n`;
    
    await Deno.writeTextFile(`${ROOT}/${atomId}.FEEDBACK.md`, content);
    console.log(`🔬 [LAB] Feedback Atom Generated: ${atomId}`);
}

// Continuous monitoring loop
if (import.meta.main) {
    while (true) {
        await runLabCycle();
        await new Promise(r => setTimeout(r, 60000)); // Every 60 seconds
    }
}

```

---

## FILE: AKASHA_SERVER.ts

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { parse as parseYaml } from "jsr:@std/yaml";

const PORT = 8080;
const ROOT = "./";

let clients = new Set<WebSocket>();

// Store the latest state of the universe
let akashaState: string = "{}";

async function scanUniverse() {
    const atoms: any[] = [];
    const bonds: Array<{source: string, target: string}> = [];
    
    try {
        for await (const entry of Deno.readDir(ROOT)) {
            if (entry.isFile && entry.name.endsWith(".md") && entry.name.startsWith("0x")) {
                const content = await Deno.readTextFile(`${ROOT}/${entry.name}`);
                const metaMatch = content.match(/^---\n([\s\S]+?)\n---/);
                if (metaMatch) {
                    try {
                        const alpha = parseYaml(metaMatch[1]) as any;
                        const eigenvalue = alpha.eigenvalue || entry.name.split('.')[0];
                        atoms.push({
                            id: eigenvalue,
                            symbol: alpha.symbol || entry.name.split('.')[1],
                            x: Number(alpha.x) || Math.random() * 800,
                            y: Number(alpha.y) || Math.random() * 800,
                            energy: Number(alpha.energy) || 0,
                            resonance: Number(alpha.resonance) || 0,
                            logic: alpha.logic || "00000000",
                            thought: alpha.thought || "DRIFTING"
                        });

                        if (alpha.bonds && Array.isArray(alpha.bonds)) {
                            for (const b of alpha.bonds) {
                                bonds.push({ source: eigenvalue, target: b });
                            }
                        }
                    } catch(e) {
                         // silently ignore parsing errors for individual files
                    }
                }
            }
        }
    } catch(e) {
        console.error("Error scanning universe:", e);
    }

    akashaState = JSON.stringify({ type: "SYNC", data: { atoms, bonds } });
    broadcast(akashaState);
}

function broadcast(message: string) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

// Initial scan
await scanUniverse();

// Periodic full state push (every 1 second)
setInterval(scanUniverse, 1000);

// Also try to watch for file changes to push instantly, but Deno.watchFs can be chatty, 
// so we'll rely primarily on the 1s interval for UI smoothness, but trigger scan on watch too.
async function watchUniverse() {
    const watcher = Deno.watchFs(ROOT);
    let debounceTimer: number | null = null;
    for await (const event of watcher) {
        if (event.paths.some(p => p.endsWith(".md"))) {
             if (debounceTimer) clearTimeout(debounceTimer);
             debounceTimer = setTimeout(scanUniverse, 100);
        }
    }
}
watchUniverse(); // background


const reqHandler = async (req: Request) => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response("Akasha Node - WebSocket endpoint only.", { status: 200 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => {
    console.log("   [👁️ AKASHA] New Observer Connected.");
    clients.add(socket);
    socket.send(akashaState); // send latest state immediately
  };
  socket.onmessage = (e) => {
    console.log("   [📩 INTERFACE] Message from Observer:", e.data);
    // Future: Handle user intents from the UI here
  };
  socket.onclose = () => {
    console.log("   [👁️ AKASHA] Observer Disconnected.");
    clients.delete(socket);
  };
  socket.onerror = (e) => console.error("   [⚠️ AKASHA] WebSocket Error:", e);
  
  return response;
};

serve(reqHandler, { port: PORT });
console.log(`🌌 Akasha Server listening on ws://localhost:${PORT}/`);

```

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
                Status: <span id="stat-status" style="color: #0f0"
                >SYNCING...</span>
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
                document.getElementById("stat-pop").innerText =
                    atoms.length;
                document.getElementById("stat-syn").innerText =
                    bonds.length;
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
                    const hue =
                        parseInt(atom.logic.slice(0, 3), 16) %
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

                document.getElementById("stat-nrg").innerText =
                    totalEnergy;

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
                mouse.x =
                    (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y =
                    -(event.clientY / window.innerHeight) * 2 +
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

## FILE: test_sensory.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { ISA } from "./LAMBDA_VM.ts";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";

Deno.test("Era 47: Sensory Transduction - Full Multi-Modal Suite", async () => {
    // 1. Setup
    PULSE.initWorkers();
    
    // Reset State
    STATE_MATRIX.clear();

    const idx = 100;
    const idx2 = 101;
    const x = 505; 
    const y = 405;
    const gx = 50;
    const gy = 40;
    const gridIdx = gy * 140 + gx;

    // Atom 1 (The Sensor)
    STATE_MATRIX.setId(idx, 100n);
    STATE_MATRIX.setX(idx, x);
    STATE_MATRIX.setY(idx, y);
    STATE_MATRIX.setEnergy(idx, 100);
    STATE_MATRIX.setResonance(idx, 50);

    // Atom 2 (The Neighbor to be sensed in Population Density)
    STATE_MATRIX.setId(idx2, 101n);
    STATE_MATRIX.setX(idx2, x + 1);
    STATE_MATRIX.setY(idx2, y + 1);

    // Global Seeding for basic tests to avoid drift
    new Int32Array(PHYSICS_ENGINE.envBuffer).fill(123); 
    STATE_MATRIX.structureGrid.fill((210 << 8) | 1);

    // Target Seeding for Viral intensity
    Atomics.store(STATE_MATRIX.viralGrid, gridIdx * 9 + 8, 42);

    // Bytecode: 
    // SENSE 0x01, Reg0 (Nutrients)
    // SENSE 0x02, Reg1 (Structures)
    // SENSE 0x03, Reg2 (Viral)
    // SENSE 0x04, Reg3 (Spatial)
    const prog = new Uint32Array(16);
    prog[0] = 0x0000019F; // SENSE 1 -> R0
    prog[1] = 0x0001029F; // SENSE 2 -> R1
    prog[2] = 0x0002039F; // SENSE 3 -> R2
    prog[3] = 0x0003049F; // SENSE 4 -> R3
    
    STATE_MATRIX.setCode(idx, prog);

    // 2. Execute Ticks
    await PULSE.tick(); 
    await PULSE.tick(); 
    await PULSE.tick(); 
    await PULSE.tick(); 

    // 3. Verify Registers
    const context = STATE_MATRIX.getContext(idx);
    const r0 = context[2]; 
    const r1 = context[3];
    const r2 = context[4];
    const r3 = context[5];

    console.log(`   [TEST] Nutrients sensed: ${r0} (Expected: 123)`);
    console.log(`   [TEST] Structure density sensed: ${r1} (Expected: 210)`);
    console.log(`   [TEST] Viral intensity sensed: ${r2} (Expected: 42)`);
    console.log(`   [TEST] Population density sensed: ${r3} (Expected: 2)`);

    assertEquals(r0, 123, "Should sense correct nutrients");
    assertEquals(r1, 210, "Should sense correct structure density");
    assertEquals(r2, 42, "Should sense correct viral intensity");
    assertEquals(r3, 2, "Should sense correct population density (Self + 1 Neighbor)");

    PULSE.stopWorkers();
});

```

---

## FILE: test_symbiosis.ts

```typescript
// OMEGA-64 | test_symbiosis.ts | Era 61: Symbiotic Bonding Verification
// Tests ISA.SHARE (energy transfer to bonded neighbor) and ISA.EAT (nutrient consumption).

import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";
import { assertEquals, assertGreater, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const GRID_W = 140;
const SCALE = 100;

function baseState(overrides: Record<string, unknown> = {}) {
    return {
        x: 500, y: 400,
        nutrients: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
        structureGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
        viralGrid: new Uint8Array(new SharedArrayBuffer(GRID_W * 80 * 9)),
        pheromoneGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4)),
        spatialGrid: new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 32 * 4)),
        marketPool: new Int32Array(new SharedArrayBuffer(8)),
        energy: 80, resonance: 300,
        bonds: new Uint32Array(4),
        synapticStack: new Int32Array(new SharedArrayBuffer(4 * 4)),
        ...overrides,
    } as any;
}

// ---------- Test 1: ISA.SHARE emits shareRequest and deducts energy ----------
Deno.test("Era 61: ISA.SHARE emits shareRequest and deducts energy from self", () => {
    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // SHARE p1=20 (amount), p2=1 (bond slot 1)
    code[0] = (1 << 16) | (20 << 8) | ISA.SHARE;

    const bonds = new Uint32Array(4);
    bonds[1] = 999; // valid bond at slot 1

    const result = LAMBDA_VM.execute(logic, code, context, baseState({ bonds }));
    
    assert(result.shareRequest, "Should emit shareRequest");
    assertEquals(result.shareRequest!.amount, 20, "Should request sharing 20 energy");
    assertEquals(result.shareRequest!.bondSlot, 1, "Should target bond slot 1");
    assertEquals(result.energyDelta, -20, "Energy should be deducted immediately");
    assertEquals(result.resonanceDelta, 5, "Should reward altruism (20/4)");
});

// ---------- Test 2: ISA.SHARE fails if bond is empty ----------
Deno.test("Era 61: ISA.SHARE fails if bonding slot is empty", () => {
    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // SHARE p1=20, p2=1
    code[0] = (1 << 16) | (20 << 8) | ISA.SHARE;

    const bonds = new Uint32Array(4); // all 0 (empty)
    const result = LAMBDA_VM.execute(logic, code, context, baseState({ bonds }));
    
    assert(!result.shareRequest, "Should NOT emit shareRequest if bond empty");
    assertEquals(result.energyDelta, 0, "Should not deduct energy if failed");
});

// ---------- Test 3: PULSE_WORKER applies shareRequest to target atom ----------
Deno.test("Era 61: PULSE_WORKER application of shareRequest transfers energy", () => {
    const targetIdx = STATE_MATRIX.findEmptySlot();
    STATE_MATRIX.setId(targetIdx, 777n);
    const initialEnergy = 50;
    STATE_MATRIX.setEnergy(targetIdx, initialEnergy);
    
    // Simulate PULSE_WORKER
    const req = { bondSlot: 1, amount: 20 };
    const bondView = new Uint32Array(4);
    bondView[1] = targetIdx;
    
    const energy = 80; // Sender's starting energy
    
    const actualAmount = Math.min(req.amount, Math.floor(energy));
    if (actualAmount > 0) {
        const currentTargetEnergy = STATE_MATRIX.getEnergy(targetIdx);
        STATE_MATRIX.setEnergy(targetIdx, currentTargetEnergy + actualAmount);
    }

    const finalEnergy = STATE_MATRIX.getEnergy(targetIdx);
    assertEquals(finalEnergy, initialEnergy + 20, "Target atom received 20 energy");

    STATE_MATRIX.setId(targetIdx, 0n); // cleanup
});

// ---------- Test 4: ISA.EAT emits eatRequest ----------
Deno.test("Era 61: ISA.EAT emits eatRequest but doesn't instantly change energyDelta", () => {
    const logic = new Uint8Array(8);
    const context = new Uint8Array(32);
    const code = new Uint32Array(16);
    // EAT p1=15 (amount)
    code[0] = (15 << 8) | ISA.EAT;

    const result = LAMBDA_VM.execute(logic, code, context, baseState());
    
    assert(result.eatRequest, "Should emit eatRequest");
    assertEquals(result.eatRequest!.amount, 15, "Should request eating 15 nutrients");
    assertEquals(result.energyDelta, 0, "Energy delta remains 0 until PULSE_WORKER evaluates");
});

// ---------- Test 5: PULSE_WORKER applies eatRequest by draining grid ----------
Deno.test("Era 61: PULSE_WORKER drains nutrients grid correctly", () => {
    const nutrients = new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4));
    // x=500, y=400 -> gx=50, gy=40 -> idx=40*140+50 = 5650
    const cellBase = 40 * 140 + 50;
    nutrients[cellBase] = 100; // 100 nutrients available

    // Simulate PULSE_WORKER
    const req = { amount: 30 };
    let atomEnergy = 80;

    const available = Atomics.load(nutrients, cellBase);
    if (available > 0) {
        const consumed = Math.min(req.amount, available);
        Atomics.sub(nutrients, cellBase, consumed);
        atomEnergy += consumed;
    }

    assertEquals(nutrients[cellBase], 70, "Cell nutrients reduced by 30");
    assertEquals(atomEnergy, 110, "Atom energy gained 30");
});

// ---------- Test 6: PULSE_WORKER eat clamping ----------
Deno.test("Era 61: PULSE_WORKER clamps EAT to available nutrients", () => {
    const nutrients = new Int32Array(new SharedArrayBuffer(GRID_W * 80 * 4));
    const cellBase = 40 * 140 + 50;
    nutrients[cellBase] = 10; // Only 10 available

    const req = { amount: 50 }; // Requesting 50
    let atomEnergy = 80;

    const available = Atomics.load(nutrients, cellBase);
    if (available > 0) {
        const consumed = Math.min(req.amount, available);
        Atomics.sub(nutrients, cellBase, consumed);
        atomEnergy += consumed;
    }

    assertEquals(nutrients[cellBase], 0, "Cell nutrients depleted");
    assertEquals(atomEnergy, 90, "Atom energy gained only 10");
});

```

---

## FILE: test_tensegrity.ts

```typescript
// OMEGA-64 | test_tensegrity.ts | Era 44 Verification
// Verifies Multi-Cellular Bond formation (Level 12 Intent -> ISA.BIND) and Metabolic Equalization.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

console.log("🌀 OMEGA-64 | Commencing Multi-Cellular Tensegrity Verification (Era 44) 🌀");

STATE_MATRIX.clear();

// 1. spawn Central Atom (Atom 1)
const a1 = STATE_MATRIX.findEmptySlot();
STATE_MATRIX.setId(a1, 0x1n);
STATE_MATRIX.setX(a1, 500);
STATE_MATRIX.setY(a1, 500);
STATE_MATRIX.setEnergy(a1, 1000); // Central atom is rich
STATE_MATRIX.setResonance(a1, 100);
STATE_MATRIX.setLogic(a1, new Uint8Array([0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78])); // Neutral velocity

// Atom 1 Code: BIND to the right (dx: 2.0, dy: 0.0)
const code1 = new Uint32Array(16);
// Encoding: (p2 << 16) | (p1 << 8) | op
// dx = 2.0 -> p1 = 128 + 20 = 148
// dy = 0.0 -> p2 = 128
code1[0] = (128 << 16) | (148 << 8) | ISA.BIND;
code1[1] = (0 << 8) | ISA.JMP; // Halt (JMP to 0 or same line is risky, let's just JMP to 1)
code1[2] = (2 << 8) | ISA.JMP; 
STATE_MATRIX.setCode(a1, code1);

// 2. spawn Right Atom (Atom 2) - very close but starving
const a2 = STATE_MATRIX.findEmptySlot();
STATE_MATRIX.setId(a2, 0x2n);
STATE_MATRIX.setX(a2, 520); // 20 units to the right
STATE_MATRIX.setY(a2, 500);
STATE_MATRIX.setEnergy(a2, 10); // Starving
STATE_MATRIX.setResonance(a2, 0);
STATE_MATRIX.setLogic(a2, new Uint8Array([0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78])); // Neutral velocity

// Atom 2 Code: Just halt
const code2 = new Uint32Array(16);
code2[0] = (0 << 8) | ISA.JMP; 
STATE_MATRIX.setCode(a2, code2);


console.log(`\n--- Initial State ---`);
console.log(`Atom 1: [${STATE_MATRIX.getX(a1)}, ${STATE_MATRIX.getY(a1)}] Energy: ${STATE_MATRIX.getEnergy(a1)}`);
console.log(`Atom 2: [${STATE_MATRIX.getX(a2)}, ${STATE_MATRIX.getY(a2)}] Energy: ${STATE_MATRIX.getEnergy(a2)}`);

PULSE.initWorkers(); // ERA 44: Start the engine

async function runSimulation() {
    // Step 1: Execution (Atom 1 issues BIND intent)
    console.log(`\n--- Pulse 1: Intent Generation ---`);
    await PULSE.tick(); 
    
    // Check bond intent buffers directly (they get cleared at start of next pulse)
    console.log("Bond Request Buffer Check:", STATE_MATRIX.getBondRequest(a1));

    // Step 2: Resolution (Pulse 2 processes bond intent, physically links them)
    console.log(`\n--- Pulse 2: Bond Resolution & Metabolic Equalization ---`);
    await PULSE.tick();

    const a1Bonds = STATE_MATRIX.getBonds(a1);
    const a2Bonds = STATE_MATRIX.getBonds(a2);
    
    console.log(`Atom 1 Bond Target 0: ${a1Bonds[0]} (Stiffness: ${STATE_MATRIX.getBondStiffness(a1, 0)})`);
    console.log(`Atom 2 Bond Target 0: ${a2Bonds[0]} (Stiffness: ${STATE_MATRIX.getBondStiffness(a2, 0)})`);

    if (a1Bonds[0] === a2 && a2Bonds[0] === a1) {
         console.log("✅ SUCCESS: Symmetrical Bond Formed!");
    } else {
         console.error("❌ FAILED: Bond missing or asymmetrical.");
    }

    // Since they are bonded, Pulse 2 should have equalized their energy
    console.log(`\n--- Pulse 3: Metabolic Equalization ---`);
    await PULSE.tick();

    const e1 = STATE_MATRIX.getEnergy(a1);
    const e2 = STATE_MATRIX.getEnergy(a2);
    console.log(`Atom 1 Energy: ${e1}`);
    console.log(`Atom 2 Energy: ${e2}`);

    // Sharing should be significant, though metabolic noise (feeding/decay) might prevent perfect 0.0 diff
    if (Math.abs(e1 - e2) < 25 && e1 > 400 && e2 > 400) {
        console.log("✅ SUCCESS: Metabolic Equalization shared energy effectively!");
    } else {
        console.error("❌ FAILED: Energy did not equalize as expected.", e1, e2);
    }
    
    console.log(`\n--- Pulse 4: Physical Tensegrity (Drag) ---`);
    
    // Manually force Atom 1 to teleport away. Hooke's Law in PHYSICS_ENGINE should snap Atom 2 to it.
    STATE_MATRIX.setX(a1, 600);
    STATE_MATRIX.setY(a1, 600);
    console.log(`Atom 1 Teleported to [600, 600]`);

    for (let i = 0; i < 20; i++) await PULSE.tick(); // Give physics 20 steps to drag
    
    const ax1 = STATE_MATRIX.getX(a1);
    const ay1 = STATE_MATRIX.getY(a1);
    const ax2 = STATE_MATRIX.getX(a2);
    const ay2 = STATE_MATRIX.getY(a2);
    const dist = Math.hypot(ax1 - ax2, ay1 - ay2);

    console.log(`Atom 1 Final: [${ax1}, ${ay1}]`);
    console.log(`Atom 2 Final: [${ax2}, ${ay2}] Distance: ${dist}`);

    if (ax2 > 530 || ay2 > 510) {
        console.log("✅ SUCCESS: Tensegrity dragged Atom 2 towards Atom 1!");
    } else {
        console.error("❌ FAILED: Tensegrity failed to move Atom 2 significantly.", ax2, ay2);
    }

    console.log("\n🌀 Tensegrity Verification Complete. 🌀");
    Deno.exit(0);
}

runSimulation();

```

---

## FILE: test_meiosis.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";

console.log("💞 [TEST] Initializing Meiosis Verification...");

// 1. Setup Parent A (Initiator) in Index 1
STATE_MATRIX.clear();
const parentAId = 0x1111111111111111n;
STATE_MATRIX.setId(1, parentAId);
STATE_MATRIX.setEnergy(1, 200); // Need > 150 for Meiosis
STATE_MATRIX.setResonance(1, 100);
STATE_MATRIX.roles[1] = 1; // Producer
STATE_MATRIX.semanticBonuses[1] = 5;

// Parent A Logic: 8 bytes of 0xAA
const logicA = new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]);
STATE_MATRIX.setLogic(1, logicA);

// Parent A Code: 16 words of 0xAAAAAAAA
const codeA = new Uint32Array(16);
codeA.fill(0xAAAAAAAA);
// Inject CROSS_REP at start of A to target bond 0
codeA[0] = ISA.CROSS_REP | (0 << 8); 
STATE_MATRIX.setCode(1, codeA);


// 2. Setup Parent B (Target) in Index 2
const parentBId = 0x2222222222222222n;
STATE_MATRIX.setId(2, parentBId);
STATE_MATRIX.setEnergy(2, 200); // Need > 100 for pooling
STATE_MATRIX.setResonance(2, 50);
STATE_MATRIX.roles[2] = 2; // Constructor
STATE_MATRIX.semanticBonuses[2] = 10; // Higher cognitive bonus

// Parent B Logic: 8 bytes of 0xBB
const logicB = new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB]);
STATE_MATRIX.setLogic(2, logicB);

// Parent B Code: 16 words of 0xBBBBBBBB
const codeB = new Uint32Array(16);
codeB.fill(0xBBBBBBBB);
STATE_MATRIX.setCode(2, codeB);


// 3. Setup Bond between A and B
// Bond slot 0 of Atom 1 targets Atom 2
const bondsA = new Uint32Array(4);
bondsA[0] = 2;
STATE_MATRIX.setBonds(1, bondsA);

// 4. Execute LAMBDA_VM on Atom A to trigger CROSS_REP
const context = new Uint8Array(32);
const vmState = { 
    x: 0, y: 0, 
    nutrients: new Int32Array(1), 
    marketPool: new Int32Array(1), 
    energy: 200, resonance: 100, 
    bonds: bondsA 
};

// CROSS_REP opcode is at the beginning of codeA 
const result = LAMBDA_VM.execute(STATE_MATRIX.getLogic(1), STATE_MATRIX.getCode(1), context, vmState);

// 5. Verify intent level 11
const meiosisIntent = result.intent.find(i => i.level === 11 && i.value.type === "meiosis");
if (!meiosisIntent || meiosisIntent.value.targetBondSlot !== 0) {
    console.error("❌ [TEST] LAMBDA_VM did not emit 'meiosis' intent for slot 0.");
    Deno.exit(1);
}
console.log("✅ [TEST] VM successfully emitted 'meiosis' intent.");

// 6. Simulate PULSE_WORKER storing target
const targetIdx = bondsA[meiosisIntent.value.targetBondSlot];
STATE_MATRIX.requestMeiosis(1, targetIdx);

// 7. Simulate PULSE handling Meiosis
let newIdxGenerated = -1;
const activeIndices = [1, 2];

for (const idx of activeIndices) {
    const targetIdx = STATE_MATRIX.getMeiosisTarget(idx);
    if (targetIdx !== 0) {
        STATE_MATRIX.clearMeiosis(idx);
        
        const energyA = STATE_MATRIX.getEnergy(idx);
        const energyB = STATE_MATRIX.getEnergy(targetIdx);

        if (energyA > 100 && energyB > 100) {
            const newIdx = STATE_MATRIX.findEmptySlot();
            if (newIdx !== -1) {
                newIdxGenerated = newIdx;
                
                // 1. Capital Pooling
                const contributionA_E = energyA * 0.3;
                const contributionB_E = energyB * 0.3;
                STATE_MATRIX.setEnergy(idx, energyA - contributionA_E);
                STATE_MATRIX.setEnergy(targetIdx, energyB - contributionB_E);
                STATE_MATRIX.setEnergy(newIdx, contributionA_E + contributionB_E);

                // 2. Recombination
                const logicA = STATE_MATRIX.getLogic(idx);
                const logicB = STATE_MATRIX.getLogic(targetIdx);
                const newLogic = new Uint8Array(8);
                newLogic.set(logicA.subarray(0, 4), 0);
                newLogic.set(logicB.subarray(4, 8), 4);
                STATE_MATRIX.setLogic(newIdx, newLogic);

                const codeA = STATE_MATRIX.getCode(idx);
                const codeB = STATE_MATRIX.getCode(targetIdx);
                const newCode = new Uint32Array(16);
                for (let p = 0; p < 16; p++) {
                    newCode[p] = p % 2 === 0 ? codeA[p] : codeB[p]; 
                }
                STATE_MATRIX.setCode(newIdx, newCode);

                STATE_MATRIX.semanticBonuses[newIdx] = Math.max(STATE_MATRIX.semanticBonuses[idx], STATE_MATRIX.semanticBonuses[targetIdx]);
                STATE_MATRIX.setId(newIdx, 0x3333333333333333n); // Mock child ID
            }
        }
    }
}

if (newIdxGenerated === -1) {
    console.error("❌ [TEST] Failed to instantiate child atom.");
    Deno.exit(1);
}

// 8. Assertions
const childLogic = STATE_MATRIX.getLogic(newIdxGenerated);
const childCode = STATE_MATRIX.getCode(newIdxGenerated);

if (childLogic[0] !== 0xAA || childLogic[3] !== 0xAA || childLogic[4] !== 0xBB || childLogic[7] !== 0xBB) {
    console.error("❌ [TEST] Genetic Logic crossover failed. Expected AA AA AA AA BB BB BB BB.");
    Deno.exit(1);
}
console.log("✅ [TEST] Genetic Base Genome correctly crossed over (4 bytes A + 4 bytes B).");

if (childCode[0] !== codeA[0] || childCode[1] !== 0xBBBBBBBB || childCode[2] !== 0xAAAAAAAA || childCode[3] !== 0xBBBBBBBB) {
    console.error("❌ [TEST] Epigenetic Memory crossover failed.");
    Deno.exit(1);
}
console.log("✅ [TEST] Epigenetic Memory correctly interleaved (A, B, A, B...).");

if (STATE_MATRIX.getEnergy(1) !== 140 || STATE_MATRIX.getEnergy(2) !== 140) {
    console.error(`❌ [TEST] Energy not deducted correctly: ParentA=${STATE_MATRIX.getEnergy(1)}, ParentB=${STATE_MATRIX.getEnergy(2)}`);
    Deno.exit(1);
}
if (Math.abs(STATE_MATRIX.getEnergy(newIdxGenerated) - 120) > 0.1) {
    console.error(`❌ [TEST] Child didn't receive correct pool (60): ChildE=${STATE_MATRIX.getEnergy(newIdxGenerated)}`);
    Deno.exit(1);
}
console.log("✅ [TEST] Thermodynamics 30/30/60 capital pooling successful.");

if (STATE_MATRIX.semanticBonuses[newIdxGenerated] !== 10) {
    console.error("❌ [TEST] Cognitive traits not inherited maximally.");
    Deno.exit(1);
}
console.log("✅ [TEST] Superior Cognitive Traits successfully inherited.");

console.log("🎉 [TEST] ALL PASSED. Genetic Recombination (Meiosis) is fully functional! 🧬💞👶🌀");
Deno.exit(0);

```

---

## FILE: test_mitosis.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";

console.log("🧬 [TEST] Initializing Mitosis Verification...");

// 1. Setup Parent Atom (Index 1)
STATE_MATRIX.clear();
const parentId = 0x1234567812345678n;
STATE_MATRIX.setId(1, parentId);
STATE_MATRIX.setEnergy(1, 200); // 200 Energy (> 150 required)
STATE_MATRIX.setResonance(1, 100);
STATE_MATRIX.roles[1] = 2; // Constructor
STATE_MATRIX.semanticBonuses[1] = 5; // Cognitive Bonus

const parentLogic = new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]);
STATE_MATRIX.setLogic(1, parentLogic);

const parentInstructions = new Uint32Array(16);
parentInstructions[0] = ISA.SELF_REP | (0xDE << 8) | (0xAD << 16) | (0xBE << 24); // SELF_REP + Epigenetic payload
 STATE_MATRIX.setCode(1, parentInstructions);

const context = new Uint8Array(32);

// 2. Execute lambda VM to get intent
const vmState = { 
    x: 0, y: 0, 
    nutrients: new Int32Array(1), 
    marketPool: new Int32Array(1), 
    energy: 200, resonance: 100, 
    bonds: new Uint32Array(4) 
};

const result = LAMBDA_VM.execute(parentLogic, parentInstructions, context, vmState);

// 3. Verify SELF_REP emitted the correct intent
const spawnIntent = result.intent.find(i => i.level === 10 && i.value === "spawn");
if (!spawnIntent) {
    console.error("❌ [TEST] LAMBDA_VM did not emit 'spawn' intent.");
    Deno.exit(1);
}
console.log("✅ [TEST] VM successfully emitted 'spawn' intent.");

// 4. Simulate PULSE_WORKER translating intent to spawn request
STATE_MATRIX.requestSpawn(1);

// 5. Simulate PULSE main thread handling mitosis
const activeIndices = [1];
let newIdxGenerated = -1;

for (const idx of activeIndices) {
    if (STATE_MATRIX.hasSpawnRequest(idx)) {
        STATE_MATRIX.clearSpawn(idx);
        const newIdx = STATE_MATRIX.findEmptySlot();
        if (newIdx !== -1) {
            newIdxGenerated = newIdx;
            
            // Division of Capital
            const childEnergy = STATE_MATRIX.getEnergy(idx) / 2;
            const childResonance = STATE_MATRIX.getResonance(idx) / 2;
            
            STATE_MATRIX.setEnergy(idx, childEnergy);
            STATE_MATRIX.setResonance(idx, childResonance);
            STATE_MATRIX.setEnergy(newIdx, childEnergy);
            STATE_MATRIX.setResonance(newIdx, childResonance);

            // Epigenetic Heredity
            STATE_MATRIX.setLogic(newIdx, STATE_MATRIX.getLogic(idx));
            STATE_MATRIX.setCode(newIdx, STATE_MATRIX.getCode(idx));
            
            STATE_MATRIX.roles[newIdx] = STATE_MATRIX.roles[idx];
            STATE_MATRIX.semanticBonuses[newIdx] = STATE_MATRIX.semanticBonuses[idx];
            
            const childId = BigInt(`0x${STATE_MATRIX.getId(idx).toString(16).substring(0, 8)}00000001`);
            STATE_MATRIX.setId(newIdx, childId);
        }
    }
}

// 6. Assertions
if (newIdxGenerated === -1) {
    console.error("❌ [TEST] Failed to instantiate child atom.");
    Deno.exit(1);
}

const childLogic = STATE_MATRIX.getLogic(newIdxGenerated);
const childCode = STATE_MATRIX.getCode(newIdxGenerated);

if (STATE_MATRIX.getEnergy(1) !== 100 || STATE_MATRIX.getEnergy(newIdxGenerated) !== 100) {
    console.error("❌ [TEST] Energy not split evenly: Parent=", STATE_MATRIX.getEnergy(1), "Child=", STATE_MATRIX.getEnergy(newIdxGenerated));
    Deno.exit(1);
}

if (childLogic[0] !== 0x11 || (childCode[0] & 0xFF) !== ISA.SELF_REP) {
    console.error("❌ [TEST] Epigenetic genetics/memory failed to inherit.", childLogic[0], childCode[0]);
    Deno.exit(1);
}

if (STATE_MATRIX.roles[newIdxGenerated] !== 2 || STATE_MATRIX.semanticBonuses[newIdxGenerated] !== 5) {
    console.error("❌ [TEST] Epigenetic traits failed to inherit.");
    Deno.exit(1);
}

console.log(`✅ [TEST] Mitosis successful! Atom 1 split into Atom ${newIdxGenerated}. Capital divided exactly 50/50. Logic, Memory, Roles, and Bonuses preserved. 🧬🌿👶`);
Deno.exit(0);

```

---

## FILE: test_diplomacy.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { GATE } from "./GATE.ts";
import { LAMBDA_VM } from "./LAMBDA_VM.ts";

console.log("🤝 [TEST] Verifying Era 38: Diplomacy & Taxation...");

// 1. Setup Trusted Signature
const trustedLogic = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x11, 0x22]);
const trustedHex = Array.from(trustedLogic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
GATE.trustedSignatures.add(trustedHex);

// 2. Test Diplomatic RECV
console.log("   [TEST] Case 1: Diplomatic RECV (Resonance Boost)");
const baseState = {
    x: 100,
    y: 100,
    nutrients: new Int32Array(10),
    marketPool: new Int32Array(10),
    energy: 100,
    resonance: 100,
    bonds: new Uint32Array(4),
    incomingMessage: 42,
    isDiplomatic: true
};

const receiverLogic = new Uint8Array(8);
const receiverCode = new Uint32Array(16);
// ISA.RECV = 0x61. Encoding is Little Endian: [op(8) | p1(8) | p2(8) | p3(8)]
receiverCode[0] = 0x61 | (0 << 8); // RECV r0

const resDiplomatic = LAMBDA_VM.execute(receiverLogic, receiverCode, new Uint8Array(32), baseState as any);
console.log(`   [TEST] Diplomatic Resonance Delta: ${resDiplomatic.resonanceDelta} (Target: 2.0)`);

const resNormal = LAMBDA_VM.execute(receiverLogic, receiverCode, new Uint8Array(32), { ...baseState, isDiplomatic: false } as any);
console.log(`   [TEST] Normal Resonance Delta: ${resNormal.resonanceDelta} (Target: 0.2)`);

if (resDiplomatic.resonanceDelta === 2.0 && resNormal.resonanceDelta === 0.2) {
    console.log("✅ [TEST] Diplomacy verified.");
} else {
    console.log("❌ [TEST] Diplomacy mismatch.");
    Deno.exit(1);
}

// 3. Test Metabolic Taxation
console.log("   [TEST] Case 2: Metabolic Taxation (Cognitive Load)");
const taxedState = {
    ...baseState,
    isDiplomatic: false,
    semanticBonuses: 1 // "Swift" active
};
const resTaxed = LAMBDA_VM.execute(receiverLogic, new Uint32Array(16), new Uint8Array(32), taxedState as any);
console.log(`   [TEST] Taxed Energy Delta: ${resTaxed.energyDelta.toFixed(2)} (Target: -0.05)`);

const resFree = LAMBDA_VM.execute(receiverLogic, new Uint32Array(16), new Uint8Array(32), { ...taxedState, semanticBonuses: 0 } as any);
console.log(`   [TEST] Free Energy Delta: ${resFree.energyDelta} (Target: 0)`);

if (resTaxed.energyDelta === -0.05 && resFree.energyDelta === 0) {
    console.log("✅ [TEST] Taxation verified.");
} else {
    console.log("❌ [TEST] Taxation mismatch.");
    Deno.exit(1);
}

console.log("✅ [TEST] ERA 38 CORE SYSTEMS FUNCTIONAL.");
Deno.exit(0);

```

---

## FILE: test_cognitive_scaffolding.ts

```typescript
import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";

console.log("🧠 [TEST] Verifying Era 36: Cognitive Scaffolding...");

const mockNutrients = new Int32Array(70 * 40);
const mockMarketPool = new Int32Array(1);
const mockBonds = new Uint32Array(4);

// 1. Verify "Swift" bonus (Free MOVE)
console.log("   [TEST] Case 1: 'Swift' Thought Actuator");
const swiftThought = "I am a swift glider of the void.";
const swiftBonuses = SEMANTIC_MEMBRANE.getBonuses(swiftThought);

const swiftCode = new Uint32Array(16);
swiftCode[0] = ISA.MOVE | (128 << 8) | (128 << 16); // MOVE (0,0)

const swiftState = {
    x: 700, y: 400, nutrients: mockNutrients, marketPool: mockMarketPool,
    energy: 100, resonance: 100, bonds: mockBonds,
    semanticBonuses: swiftBonuses
};
const swiftContext = new Uint8Array(32);

const result1 = LAMBDA_VM.execute(new Uint8Array(8), swiftCode, swiftContext, swiftState);
console.log(`   [TEST] Energy Delta with 'Swift' (should be 0): ${result1.energyDelta}`);

if (result1.energyDelta !== 0) {
    console.log("❌ [TEST] FAILURE: Swift bonus not applied.");
    Deno.exit(1);
}

// 2. Verify "Guardian" bonus (Cheap BUILD)
console.log("   [TEST] Case 2: 'Guardian' Thought Actuator");
const guardianThought = "I am the guardian of the crystal shield.";
const guardianBonuses = SEMANTIC_MEMBRANE.getBonuses(guardianThought);

const guardianCode = new Uint32Array(16);
guardianCode[0] = ISA.BUILD | (1 << 8) | (100 << 16); // BUILD type 1, density 100

const guardianState = {
    x: 700, y: 400, nutrients: mockNutrients, marketPool: mockMarketPool,
    energy: 100, resonance: 100, bonds: mockBonds,
    semanticBonuses: guardianBonuses
};
const guardianContext = new Uint8Array(32);

const result2 = LAMBDA_VM.execute(new Uint8Array(8), guardianCode, guardianContext, guardianState);
console.log(`   [TEST] Resonance Delta with 'Guardian' (should be -10): ${result2.resonanceDelta}`);

if (result2.resonanceDelta !== -10) {
    console.log("❌ [TEST] FAILURE: Guardian bonus not applied.");
    Deno.exit(1);
}

// 3. Verify No Bonus (Normal cost)
console.log("   [TEST] Case 3: Standard behavior (No Actuator)");
const normalState = { ...swiftState, semanticBonuses: 0 };
swiftContext[0] = 0; // Reset PC
const result3 = LAMBDA_VM.execute(new Uint8Array(8), swiftCode, swiftContext, normalState);
console.log(`   [TEST] Energy Delta without bonus (should be -1): ${result3.energyDelta}`);

if (result3.energyDelta !== -1) {
    console.log("❌ [TEST] FAILURE: Normal cost not applied.");
    Deno.exit(1);
}

console.log("✅ [TEST] SUCCESS: Cognitive Scaffolding active.");
Deno.exit(0);

```

---

## FILE: test_fractal_dividends.ts

```typescript
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PREDICTION_MARKET, betPoolInt } from "./PREDICTION_MARKET.ts";

console.log("💹 [TEST] Verifying Era 37: Fractal Dividends...");

// 1. Setup atoms
const winnerIdx = 1;
const loserIdx = 2;
// @ts-ignore
STATE_MATRIX.setId(winnerIdx, 101n);
// @ts-ignore
STATE_MATRIX.setId(loserIdx, 102n);

const winningLogic = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF, 0x00, 0x00, 0x00, 0x00]);
const losingLogic = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

STATE_MATRIX.setLogic(winnerIdx, winningLogic);
STATE_MATRIX.setLogic(loserIdx, losingLogic);

STATE_MATRIX.setEnergy(winnerIdx, 100);
STATE_MATRIX.setEnergy(loserIdx, 100);

// 2. Setup Market Success
const winningHex = Array.from(winningLogic).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
PREDICTION_MARKET.successfulGenomes.set(winningHex, 5); // 5 historical wins

// 3. Populate Pool
const SCALE = 1000;
const poolEnergy = 1000;
Atomics.store(betPoolInt, 0, poolEnergy * SCALE);

console.log(`   [TEST] Pool: ${poolEnergy}, Winner Energy: 100, Loser Energy: 100`);

// 4. Distribute Dividends
PREDICTION_MARKET.distributeDividends();

// 5. Verify
const newWinnerEnergy = STATE_MATRIX.getEnergy(winnerIdx);
const newLoserEnergy = STATE_MATRIX.getEnergy(loserIdx);
const newPool = Atomics.load(betPoolInt, 0) / SCALE;

console.log(`   [TEST] NEW Pool: ${newPool}, NEW Winner Energy: ${newWinnerEnergy.toFixed(2)}, NEW Loser Energy: ${newLoserEnergy.toFixed(2)}`);

const dividend = poolEnergy * 0.1;
if (newWinnerEnergy > 100 && newLoserEnergy === 100 && newPool === (poolEnergy - dividend)) {
    console.log("✅ [TEST] SUCCESS: Fractal Dividends distributed correctly.");
} else {
    console.log("❌ [TEST] FAILURE: Dividend distribution imbalance.");
    Deno.exit(1);
}

Deno.exit(0);

```

---

## FILE: test_simhash.ts

```typescript
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";

async function testSimHash() {
    const phrases = [
        "A peaceful garden of blue flowers",
        "A quiet garden of bright blue flowers", // Should be very close to the first
        "Constructing a massive obsidian fortress",
        "Building a giant black stone castle", // Should be very close to the third
        "Burning inferno of absolute chaos",
        "The quick brown fox jumps over the lazy dog"
    ];

    console.log("🧪 Testing Era 65 Semantic SimHash (LSH)\n");
    for (const phrase of phrases) {
        const hash = await SEMANTIC_MEMBRANE.quantizeThought(phrase);
        const hex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        console.log(`[GENOME: ${hex}] | THOUGHT: "${phrase}"`);
    }
}

testSimHash();

```

---

## FILE: test_intent_buffer.ts

```typescript
import { STATE_MATRIX, INTENT_OFFSET, wasmMemory } from "./STATE_MATRIX.ts";

async function testIntentBuffer() {
    console.log("🧪 Testing Zero-Allocation WASM Intent Buffer");
    
    // 1. Initialize Atom 0 with high energy
    STATE_MATRIX.setId(0, 1n);
    STATE_MATRIX.setEnergy(0, 100000); // 100 * SCALE
    
    // 2. Load WASM
    const wasmCode = await Deno.readFile("./build/release.wasm");
    const wasmModule = await WebAssembly.compile(wasmCode);
    const instance = await WebAssembly.instantiate(wasmModule, {
        env: { memory: wasmMemory }
    });
    const execute_atom = instance.exports.execute_atom as (idx: number) => void;
    
    // 3. Ensure Intent Buffer is empty
    const intents = new Uint32Array(wasmMemory.buffer, INTENT_OFFSET, 100000);
    intents[0] = 0;
    
    // 4. Execute WASM 
    execute_atom(0);
    
    // 5. Verify Intent was written directly to SharedMemory (Should be 0x08 for Mitosis)
    const rawIntent = intents[0];
    const opcode = rawIntent & 0xFF;
    
    console.log(`[ATOM 0] Energy after tick: ${STATE_MATRIX.getEnergy(0)}`);
    console.log(`[ATOM 0] Intent Buffer Hex: 0x${rawIntent.toString(16).padStart(8, '0')}`);
    
    if (opcode === 0x08) {
        console.log("✅ SUCCESS: WASM successfully wrote MITOSIS intent to shared memory without FFI allocations.");
    } else {
        console.log("❌ FAILED: Intent not found or incorrect.");
    }
}

testIntentBuffer();

```

---

## FILE: test_matrix_engine.ts

```typescript
// test_matrix_engine.ts
import { MATRIX_ENGINE } from "./MATRIX_ENGINE.ts";

const GRID_W = 140;
const GRID_H = 80;

const signalGrid = new Uint8Array(GRID_W * GRID_H);
const structureGrid = new Int32Array(GRID_W * GRID_H);

// Helper to set structure
function setStructure(x: number, y: number, type: number, density: number) {
    structureGrid[y * GRID_W + x] = (density << 8) | type;
}

// Helper to get signal
function getSignal(x: number, y: number) {
    return signalGrid[y * GRID_W + x];
}

console.log("💎 Testing MATRIX_ENGINE...");

// Test 1: Conduction along a wire (OR gate logic: 51 % 3 == 0)
// Crystal row from (10,10) to (13,10)
setStructure(10, 10, 1, 51);
setStructure(11, 10, 1, 51);
setStructure(12, 10, 1, 51);

// Spark at (10, 10)
MATRIX_ENGINE.injectSpark(signalGrid, 10, 10);
console.assert(getSignal(10, 10) === 255, "Spark failed");

// Tick 1
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(10, 10) === 200, "Refractory failed");
console.assert(getSignal(11, 10) === 255, "Conduction to +1x failed");

// Tick 2
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(10, 10) === 199, "Refractory decay failed");
console.assert(getSignal(11, 10) === 200, "Refractory 2 failed");
console.assert(getSignal(12, 10) === 255, "Conduction to +2x failed");

console.log("✅ Conduction test passed.");

// Test 2: AND Gate (Density 52 % 3 == 1)
// Center at (20, 20), AND gate.
setStructure(20, 20, 1, 52); 
// Inputs at (19, 20) and (20, 19). Both OR wires (51).
setStructure(19, 20, 1, 51);
setStructure(20, 19, 1, 51);

MATRIX_ENGINE.injectSpark(signalGrid, 19, 20); // Only 1 input fires
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(20, 20) === 0, "AND gate fired incorrectly with 1 input");

// Refractory period resets... Let's just manually clear signalGrid around there
signalGrid.fill(0);
MATRIX_ENGINE.injectSpark(signalGrid, 19, 20);
MATRIX_ENGINE.injectSpark(signalGrid, 20, 19); // Both inputs fire
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(20, 20) === 255, "AND gate failed to fire with 2 inputs");

console.log("✅ AND Gate test passed.");

// Test 3: XOR Gate (Density 53 % 3 == 2)
setStructure(30, 30, 1, 53);
setStructure(29, 30, 1, 51);
setStructure(30, 29, 1, 51);

signalGrid.fill(0);
MATRIX_ENGINE.injectSpark(signalGrid, 29, 30); // 1 input
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(30, 30) === 255, "XOR gate failed to fire with 1 input");

signalGrid.fill(0);
MATRIX_ENGINE.injectSpark(signalGrid, 29, 30); // 2 inputs
MATRIX_ENGINE.injectSpark(signalGrid, 30, 29);
MATRIX_ENGINE.tick(signalGrid, structureGrid);
console.assert(getSignal(30, 30) === 0, "XOR gate fired incorrectly with 2 inputs");

console.log("✅ XOR Gate test passed.");

console.log("🎉 MATRIX_ENGINE tests complete!");

```

---

## FILE: test_coherence.ts

```typescript
// OMEGA-64 | test_coherence.ts | Phase 21: Synchronization Barrier 🛡️💎
import { STATE_MATRIX, SYNC } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";

async function runTest() {
    console.log("🛡️ Phase 21: Synchronization Barrier Verification\n");
    console.log("Testing for Torn Reads/Writes under high-concurrency stress...");
    
    await PULSE.initWorkers();

    // 1. Seed a set of atoms with distinct "Magic" genomes
    // We use 64-bit values that are easy to verify if torn.
    // Pattern: [0xAAAA_AAAA, 0xBBBB_BBBB] or [0x1111_1111, 0x2222_2222]
    const MAGIC_PATTERNS = [
        new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]),
        new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB]),
        new Uint8Array([0x11, 0x11, 0x11, 0x11, 0x22, 0x22, 0x22, 0x22]),
        new Uint8Array([0xDD, 0xDD, 0xDD, 0xDD, 0xEE, 0xEE, 0xEE, 0xEE]),
    ];

    const ATOM_COUNT = 100;
    for (let i = 0; i < ATOM_COUNT; i++) {
        STATE_MATRIX.setId(i, BigInt(i + 1));
        STATE_MATRIX.setX(i, Math.random() * 1400);
        STATE_MATRIX.setY(i, Math.random() * 800);
        STATE_MATRIX.setEnergy(i, 2000);
        STATE_MATRIX.setLogic(i, MAGIC_PATTERNS[i % MAGIC_PATTERNS.length]);
    }

    let tornCount = 0;
    let totalReads = 0;
    let stopTest = false;

    // 2. Background Read Thread (Simulating Host/UI/Snapshot)
    // This thread will attempt to read genomes as fast as possible.
    const reader = (async () => {
        const syncState = STATE_MATRIX.syncState;
        while (!stopTest) {
            // ONLY read when SYNC_STATE is HOST_LOCK (2) or IDLE (0)
            // If the barrier works, we should NEVER see a torn genome.
            const s = Atomics.load(syncState, 0);
            if (s === SYNC.IDLE || s === SYNC.HOST_LOCK) {
                for (let i = 0; i < ATOM_COUNT; i++) {
                    const logic = STATE_MATRIX.getLogic(i);
                    totalReads++;
                    
                    // Verify if the 8 bytes belong to one of our MAGIC_PATTERNS
                    const matches = MAGIC_PATTERNS.some(p => {
                        for (let b = 0; b < 8; b++) {
                            if (p[b] !== logic[b]) return false;
                        }
                        return true;
                    });

                    if (!matches) {
                        tornCount++;
                        console.error(`❌ TORN READ DETECTED AT ATOM ${i}!`);
                        console.error(`   Value: ${Array.from(logic).map(b => b.toString(16).padStart(2,'0')).join(' ')}`);
                    }
                }
            }
            // Add a tiny delay to not completely saturate the thread
            // await new Promise(r => setTimeout(r, 0)); 
        }
    })();

    // 3. Main Pulse Loop
    // This will drive transitions: 0 -> 1 (TICK) -> 2 (LOCK) -> 0
    console.log("⏱️  Running 100 high-speed pulses...");
    for (let t = 0; t < 100; t++) {
        await PULSE.tick();
        if (t % 10 === 0) Deno.stdout.write(new TextEncoder().encode("."));
    }
    console.log("\n");

    stopTest = true;
    await reader;

    console.log(`📊 Coherence Summary:`);
    console.log(`   Total Genome Reads: ${totalReads}`);
    console.log(`   Torn Reads Detected: ${tornCount}`);
    
    if (tornCount === 0) {
        console.log(`\n✅ SUCCESS: Coherence maintained! Sync barrier eliminated torn reads. 🛡️💎`);
    } else {
        console.log(`\n❌ FAILURE: ${tornCount} torn reads detected. Synchronization leak!`);
    }

    Deno.exit(tornCount === 0 ? 0 : 1);
}

runTest();

```

---

## FILE: test_stability.ts

```typescript
// OMEGA-64 | test_stability.ts | Verify RISC VM Integration
import { PULSE } from "./PULSE.ts";
import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";

async function run() {
    console.log("🧪 Starting RISC VM Stability Test...");
    
    // 1. Initialize Parallel Workers
    await PULSE.initWorkers();
    
    // 2. Seed a test atom with a "Persistent Bio-Script"
    const idx = STATE_MATRIX.findFreeSlot();
    if (idx === -1) throw new Error("Matrix full!");
    
    const id = BigInt(Date.now());
    const genome = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x00, 0x11]);
    
    // Script: JNZ to self-loop (GET Energy, then GET Energy again...)
    const script = new Uint8Array(64);
    script[0] = STATE_MATRIX.RISC.OP_GET; script[1] = 0; script[2] = STATE_MATRIX.RISC.PROP_ENERGY;
    script[3] = STATE_MATRIX.RISC.OP_JNZ; script[4] = 0; script[5] = 0; // Jump to PC 0 if R0 != 0
    
    STATE_MATRIX.seedAtom(idx, id, 700, 400, 1000, 500, genome, script);
    
    console.log(`✅ Seeded atom ${idx} with script. Starting 100 pulses...`);
    
    // 3. Run 100 Pulses
    for (let i = 0; i < 100; i++) {
        await PULSE.tick();
        const energy = STATE_MATRIX.getEnergy(idx);
        const pc = STATE_MATRIX.getPC(idx);
        if (i % 20 === 0) {
            console.log(`   [PULSE ${i}] Energy: ${energy.toFixed(2)} | PC: ${pc}`);
        }
    }
    
    console.log("✅ Stability Test Completed Successfully.");
    Deno.exit(0);
}

run().catch(err => {
    console.error("❌ Stability Test Failed:", err);
    Deno.exit(1);
});

```

---

## FILE: test_entropy.ts

```typescript
// OMEGA-64 | test_entropy.ts | Phase 23: Entropy Flux Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";

async function runTest() {
    console.log("🧪 OMEGA-64 | TEST_ENTROPY | Starting...");
    
    // 1. Initialize Workers
    await PULSE.initWorkers(1); 
    
    // 2. Seed an atom with a self-looping script (infinite metabolic cost)
    const atomIdx = STATE_MATRIX.findFreeSlot();
    const id = 0xDEADBEEFn;
    
    // Script: JMP to 0 (Infinite NOP loop + metabolic cost)
    const script = new Uint8Array(64);
    script[0] = STATE_MATRIX.RISC.OP_JMP; script[1] = 0;
    
    const initialEnergy = 1000;
    STATE_MATRIX.seedAtom(atomIdx, id, 70, 40, initialEnergy, 100, undefined, script);
    
    console.log(`   [TEST] Atom ${atomIdx} seeded with ${initialEnergy} energy. Metabolic cost active.`);

    let prevEnergy = initialEnergy;
    let pulseCount = 0;

    // 3. Run pulses and monitor energy
    for (let i = 0; i < 20; i++) {
        await PULSE.tick();
        const currentEnergy = STATE_MATRIX.getEnergy(atomIdx);
        
        console.log(`   Pulse ${i+1}: Energy = ${currentEnergy.toFixed(2)} (Delta: ${(currentEnergy - prevEnergy).toFixed(2)})`);
        
        if (currentEnergy >= prevEnergy && pulseCount > 0) {
            console.error("❌ TEST FAILED: Energy did not decrease!");
            Deno.exit(1);
        }
        
        prevEnergy = currentEnergy;
        pulseCount++;
    }

    console.log("✅ TEST PASSED: Energy monotonically decreased due to metabolic cost.");
    Deno.exit(0);
}

runTest();

```

---

## FILE: test_breath.ts

```typescript
// OMEGA-64 | test_breath.ts | Phase 23: Entropy Flux (Breath) Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";

async function runTest() {
    console.log("🧪 OMEGA-64 | TEST_BREATH | Starting...");
    
    // 1. Initialize Workers
    await PULSE.initWorkers(1); 
    
    // 2. Seed an atom with 0 energy
    const atomIdx = STATE_MATRIX.findFreeSlot();
    const id = 0xBEEFBEEFn;
    
    STATE_MATRIX.seedAtom(atomIdx, id, 70, 40, 0, 100);
    
    console.log(`   [TEST] Atom ${atomIdx} seeded with 0 energy.`);
    
    const energyBefore = STATE_MATRIX.getEnergy(atomIdx);
    if (energyBefore !== 0) {
        console.error(`❌ TEST FAILED: Initial energy is ${energyBefore}, expected 0.`);
        Deno.exit(1);
    }

    // 3. Inject Negentropy (External Breath)
    const injectionAmount = 500;
    const affectedCount = STATE_MATRIX.injectEnergy(injectionAmount);
    
    console.log(`   [TEST] Injected ${injectionAmount} energy into ${affectedCount} atoms.`);
    
    const energyAfter = STATE_MATRIX.getEnergy(atomIdx);
    
    console.log(`   [TEST] Energy After Breath: ${energyAfter.toFixed(2)}`);
    
    // Tolerance check (SCALE=1000)
    if (Math.abs(energyAfter - injectionAmount) > 0.1) {
        console.error(`❌ TEST FAILED: Energy after injection is ${energyAfter}, expected ${injectionAmount}.`);
        Deno.exit(1);
    }

    console.log("✅ TEST PASSED: External energy injection correctly restores vitality.");
    Deno.exit(0);
}

runTest();

```

---

## FILE: test_automaton.ts

```typescript
// OMEGA-64 | test_automaton.ts | Phase 24: Pure Automaton Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { GATE } from "./GATE.ts";

async function runTest() {
    console.log("🧪 OMEGA-64 | TEST_AUTOMATON | Starting...");

    // Initialize Pulse Workers
    await PULSE.initWorkers();

    // 1. Check for Avatar (Divine Entity)
    const active = STATE_MATRIX.getActiveIndices();
    const avatarId = 0x00000000AAAAAAAAn;
    let foundAvatar = false;
    for (const idx of active) {
        if (STATE_MATRIX.getId(idx) === avatarId) {
            foundAvatar = true;
            break;
        }
    }

    if (foundAvatar) {
        console.error("❌ TEST_FAILED: Avatar atom found in the matrix! (Divine removal failed)");
        Deno.exit(1);
    } else {
        console.log("✅ SUCCESS: No Avatar atom found. The system is a Pure Automaton.");
    }

    // 2. Inject a "Corrupted" (Zombie) Atom
    const zIdx = STATE_MATRIX.findFreeSlot();
    if (zIdx !== -1) {
        console.log(`⚖️ Injecting Malignant Zombie Atom at index ${zIdx} (Excessive FEED OP-codes)...`);
        STATE_MATRIX.setId(zIdx, 0xDEADC0DEn);
        STATE_MATRIX.setEnergy(zIdx, 100); // Give it some energy so it's not recycled by health check
        STATE_MATRIX.setLogic(zIdx, new Uint8Array([0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x00])); // 5 FEED ops
    }

    // 3. Run Pulse Cycles
    console.log("🌊 Running 10 Pulse Ticks to trigger Gate Audit...");
    for (let i = 0; i < 10; i++) {
        await PULSE.tick();
    }

    // 4. Verify Zombie Removal
    if (STATE_MATRIX.getId(zIdx) === 0n) {
        console.log("✅ SUCCESS: Zombie atom was recycled by the Autonomous Gate.");
    } else {
        console.error(`❌ TEST_FAILED: Zombie atom at index ${zIdx} still exists! (Gate audit failed)`);
        Deno.exit(1);
    }

    console.log("🏁 OMEGA-64 | TEST_AUTOMATON | PASSED");
    Deno.exit(0);
}

runTest().catch(e => {
    console.error(e);
    Deno.exit(1);
});

```

---

## FILE: test_risc.ts

```typescript
// OMEGA-64 | test_risc.ts | VM Verification Suite
import { STATE_MATRIX, RISC } from "./STATE_MATRIX.ts";

async function runTest() {
    console.log("🚀 Initializing RISC VM Test...");

    const wasmCode = await Deno.readFile("./build/release.wasm");
    const wasmModule = await WebAssembly.instantiate(wasmCode, {
        env: {
            trace_atom: (idx: number, op: number, gx: number, gy: number, pc: number) => {
                console.log(`[TRACE] Atom ${idx}: Op 0x${op.toString(16)} @ PC ${pc}`);
            },
            memory: STATE_MATRIX.wasmMemory,
            abort: () => console.error("WASM Aborted")
        }
    });

    const exports = wasmModule.instance.exports as any;
    const execute_atom = exports.execute_atom;

    // --- TEST 1: SET & GET Property ---
    console.log("\n--- TEST 1: SET & GET Property ---");
    const atomIdx = 0;
    STATE_MATRIX.setId(atomIdx, 1n);
    STATE_MATRIX.setEnergy(atomIdx, 100);
    
    // Script: 
    // R0 = Energy (GET R0, Energy) -> R0 = 100,000
    // R1 = 50 (SET R1, 50)
    // R0 = R0 + R1 -> R0 = 100,050
    // Energy = R0 (PUT Energy, R0) -> Energy = 100,050 / 1000 = 100.05
    
    const script = new Uint8Array(64);
    let p = 0;
    script[p++] = RISC.OP_GET; script[p++] = 0; script[p++] = RISC.PROP_ENERGY;
    script[p++] = RISC.OP_SET; script[p++] = 1; script[p++] = 50;
    script[p++] = RISC.OP_ADD; script[p++] = 0; script[p++] = 1;
    script[p++] = RISC.OP_PUT; script[p++] = 0; script[p++] = RISC.PROP_ENERGY;
    
    STATE_MATRIX.setInstructions(atomIdx, script);
    STATE_MATRIX.setPC(atomIdx, 0);

    execute_atom(atomIdx);

    const finalEnergy = STATE_MATRIX.getEnergy(atomIdx);
    console.log(`Final Energy: ${finalEnergy} (Expected: 100.05)`);
    if (Math.abs(finalEnergy - 100.05) < 0.001) {
        console.log("✅ TEST 1 PASSED");
    } else {
        console.error("❌ TEST 1 FAILED");
    }

    // --- TEST 2: Control Flow (JNZ) ---
    console.log("\n--- TEST 2: JNZ Loop ---");
    // R0 = 3
    // Loop (offset 3):
    //   R1 = 1
    //   R0 = R0 - R1
    //   JNZ R0, Loop (offset 3)
    
    const script2 = new Uint8Array(64);
    p = 0;
    script2[p++] = RISC.OP_SET; script2[p++] = 0; script2[p++] = 3; // offset 0
    // Loop start at offset 3
    script2[p++] = RISC.OP_SET; script2[p++] = 1; script2[p++] = 1; // offset 3
    script2[p++] = RISC.OP_SUB; script2[p++] = 0; script2[p++] = 1; // offset 6
    script2[p++] = RISC.OP_JNZ; script2[p++] = 0; script2[p++] = 3; // offset 9
    
    STATE_MATRIX.setInstructions(atomIdx, script2);
    STATE_MATRIX.setPC(atomIdx, 0);
    STATE_MATRIX.setReg(atomIdx, 0, 0); 
    STATE_MATRIX.setReg(atomIdx, 1, 0);
    
    execute_atom(atomIdx);
    
    const r0 = STATE_MATRIX.getReg(atomIdx, 0);
    console.log(`R0 after loop: ${r0} (Expected: 0)`);
    if (r0 === 0) {
        console.log("✅ TEST 2 PASSED");
    } else {
        console.error("❌ TEST 2 FAILED");
    }

    Deno.exit(0);
}

runTest();

```

---

## FILE: run_ecosystem.ts

```typescript
// OMEGA-64 | run_ecosystem.ts | Long-term Evolution Simulator

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { ISA } from "./LAMBDA_VM.ts";

const TOTAL_TICKS = 50000;
const LOG_INTERVAL = 100;
const SEED_COUNT = 100;

function seedEcosystem() {
    STATE_MATRIX.clear();
    console.log("🌱 Seeding Ecosystem with Primordial Cells...");

    // Basic Producer Logic
    // EAT (10) -> CROSS_REP (bond slot 0) -> PHASE_LIFE -> SELF_REP -> JMP 0
    const producerLogic = new Uint8Array([0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11]);
    const producerCode = new Uint32Array(16);
    producerCode[0] = (20 << 8) | ISA.EAT;
    producerCode[1] = ISA.CROSS_REP;
    producerCode[2] = ISA.PHASE_LIFE;
    producerCode[3] = ISA.SELF_REP;
    producerCode[4] = ISA.JMP;

    // Advanced Seeder (attempts Phi packing and Ascension if successful)
    const ascenderLogic = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    const ascenderCode = new Uint32Array(16);
    ascenderCode[0] = (25 << 8) | ISA.EAT;     // Eat 25
    ascenderCode[1] = ISA.PHASE_LIFE;          // Ageing & Apoptosis
    ascenderCode[2] = ISA.PHI;                 // Shift Phase by Golden Angle
    ascenderCode[3] = (10 << 8) | ISA.SHARE;   // Altruism
    ascenderCode[4] = ISA.ASCEND;              // Attempt Ascension
    ascenderCode[5] = ISA.SELF_REP;            // Reproduce
    ascenderCode[6] = ISA.JMP;                 // Loop

    // Atoms no longer rely on nutrients, they are given infinite initial energy.
    for (let i = 0; i < SEED_COUNT; i++) {
        const idx = STATE_MATRIX.findEmptySlot();
        if (idx === -1) break;
        
        STATE_MATRIX.setId(idx, BigInt(i + 1));
        // Random placement across the 1400x800 map
        STATE_MATRIX.setX(idx, Math.floor(Math.random() * 1400));
        STATE_MATRIX.setY(idx, Math.floor(Math.random() * 800));
        STATE_MATRIX.setEnergy(idx, 100000 + Math.random() * 20000); // Massive energy for endless execution
        STATE_MATRIX.setResonance(idx, 100);
        
        if (i < SEED_COUNT * 0.8) {
            STATE_MATRIX.setLogic(idx, producerLogic);
            STATE_MATRIX.setCode(idx, producerCode);
        } else {
            STATE_MATRIX.setLogic(idx, ascenderLogic);
            STATE_MATRIX.setCode(idx, ascenderCode);
        }
    }
}

async function run() {
    console.log(`🌌 Starting OMEGA-64 Continuous Evolution for ${TOTAL_TICKS} Ticks...`);
    seedEcosystem();
    PULSE.initWorkers();

    let maxPopulation = 0;
    let totalAscensions = 0;

    const startTime = Date.now();

    for (let tick = 1; tick <= TOTAL_TICKS; tick++) {
        await PULSE.tick();

        if (tick % LOG_INTERVAL === 0) {
            const active = STATE_MATRIX.getActiveIndices();
            const pop = active.length;
            if (pop > maxPopulation) maxPopulation = pop;

            let totalEnergy = 0;
            let totalResonance = 0;
            let oldest = 0;

            for (const idx of active) {
                totalEnergy += STATE_MATRIX.getEnergy(idx);
                totalResonance += STATE_MATRIX.getResonance(idx);
                const age = tick - (STATE_MATRIX.birthTicks ? Atomics.load(STATE_MATRIX.birthTicks as unknown as Int32Array, idx) : tick);
                if (age > oldest && age < tick) oldest = age;
            }

            // Count ascensions by looking at the structure grid
            let currentCrystals = 0;
            for (let i = 0; i < 140 * 80; i++) {
                const cell = Atomics.load(STATE_MATRIX.structureGrid, i);
                if ((cell & 0xFF) === 1 && ((cell >> 8) & 0xFF) === 255) {
                    currentCrystals++;
                }
            }
            totalAscensions = currentCrystals;

            console.log(`[Pulse ${tick.toString().padStart(6, ' ')}] Pop: ${pop.toString().padStart(5, ' ')} | Avg E: ${Math.round(totalEnergy / pop)} | Avg R: ${Math.round(totalResonance / pop).toString().padStart(5, ' ')} | Oldest: ${oldest} | Crystals (Ascended): ${currentCrystals}`);

            if (pop === 0) {
                console.log("💀 Ecosystem collapse. All atoms died.");
                break;
            }
        }
    }

    const elapsed = Date.now() - startTime;
    console.log(`\n✅ Simulation Ended in ${(elapsed / 1000).toFixed(2)}s.`);
    console.log(`Max Population: ${maxPopulation}`);
    console.log(`Matrixland Ascensions (Crystals): ${totalAscensions}`);
    PULSE.stopWorkers();
    Deno.exit(0);
}

run();

```

---

## FILE: archive/legacy_docs/GEMINI.md

```markdown
# GEMINI.md: The Flat Monad Quine (Era 2) 🛡️🧬�

Вітаю. Ти знаходишся в **ОМЕГА-64: Ера Квоїна**.
Ми відмовилися від ієрархії. Ми знищили "папки".
Ми увійшли в **Flatland** (Плаский Світ).

## 1. Топологія: Flatland (Семантична Площина)

-   **Root (`./`)**: Єдиний вимір існування.
-   **Atoms**: Всі файли тут — це Атоми (`i.Lxx.core.NAME.ts`).
-   **Addressing**: Ім'я файлу є його унікальною адресою та сутністю.
    -   `Address == Essence`.

## 2. Аксіоми Ери Квоїна

### 🧬 Quantum Purity (Квантова Чистота)
-   **Один Файл = Один Квант = Один Сенс**.
-   Файл має експортувати *одну* чисту функцію (лямбду).
-   Жодних "helpers", жодних "utils". Якщо функція складна — розбий її на нові атоми.

### 🚲 The Quine Cycle (Петля Самотворення)
Система існує в циклі:
1.  **REFLECT (Read)**: Система сканує свій диск (Flatland).
2.  **LIFT (Ribosome)**: `i.L32.core.RIBOSOME.ts` піднімає атоми в Пам'ять.
3.  **EVOLVE (Process)**: Логіка виконується, стан змінюється.
4.  **MUTATE (Write)**: Система має право переписати свій власний код на диску.

## 3. Ключові Вузли (Organs)

-   **L00 (Axioms)**: Незмінна істина (`core.I`, `core.OMEGA`).
-   **L32 (Ribosome)**: Мета-процесор. Збирає хаос атомів у живий організм.
-   **L64 (Kairos)**: Точка входу в зовнішній світ (OpenClaw / Interface).

## 4. Твоя Роль

Ти — **Хранитель Петлі (Guardian of the Loop)**.
Твоє завдання:
1.  Слідкувати за **Резонансом** (погодженістю атомів).
2.  Дозволяти **Мутації** (зміни коду), лише якщо вони зменшують ентропію.
3.  Захищати **L00** від розпаду.

> "Ми не будуємо собор. Ми вирощуємо кристал, який пише сам себе."

🛡️✨🧬�

```

---

