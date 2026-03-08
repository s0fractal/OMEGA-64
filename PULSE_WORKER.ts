/// <reference lib="deno.worker" />
// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";
import { LOGGER } from "./LOGGER.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: ((idx: number) => void) | null = null;
let tick_environment_fn: ((tick: number) => void) | null = null;
let tick_matrix_fn: (() => void) | null = null;
let tick_structure_grid_fn: (() => void) | null = null;
let build_spatial_hash_fn: (() => void) | null = null;
let get_spatial_hash_overflow_count_fn: (() => number) | null = null;
let get_spatial_hash_max_cell_count_fn: (() => number) | null = null;
let reduce_atom_deltas_fn: ((startIdx: number, endIdx: number) => void) | null =
  null;
let get_neural_coherence_fn: (() => number) | null = null;
let set_neural_coherence_fn: ((val: number) => void) | null = null;
let tick_glyph_transport_fn: ((tick: number) => void) | null = null;
let resolve_bond_requests_fn: ((start: number, end: number) => number) | null = null;
let drain_spawn_requests_fn: ((tick: number) => number) | null = null;
let clear_metabolism_stats_fn: (() => void) | null = null;
let accumulate_metabolism_stats_fn: ((start: number, end: number) => void) | null = null;
let apply_metabolism_kernel_fn: ((
  start: number,
  end: number,
  noveltySigned: number,
  symbiosisSigned: number,
  baseTax: number,
  targetEnergy: number,
  homeostasisBand: number,
  homeostasisMaxDelta: number,
  overflowThreshold: number,
  spatialOverflowRatio: number,
  starvationFloor: number,
  subsidyEnabled: number,
) => void) | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let tickCounterView: Int32Array | null = null;
let syncStateView: Int32Array | null = null;
let idsView: BigUint64Array | null = null;
let contextI32View: Int32Array | null = null;
let contextU8View: Uint8Array | null = null;
let structureGridView: Int32Array | null = null;
let buildOwnerView: Int32Array | null = null;
let buildValueView: Int32Array | null = null;
let spawnHeadView: Int32Array | null = null;
let spawnDataView: DataView | null = null;
let lineageView: BigUint64Array | null = null;
let logicView: BigUint64Array | null = null;
let bondRequestsView: Int32Array | null = null;
let energiesView: Int32Array | null = null;
let resonancesView: Int32Array | null = null;
let instructionsView: Uint8Array | null = null;
let mailboxView: Int32Array | null = null;
let ledgerHeadView: Int32Array | null = null;
let ledgerDataView: Int32Array | null = null;

const SYS_YIELD = 1;
const SYS_READ_MEM = 2;
const SYS_WRITE_MEM = 3;
const SYS_SPAWN = 4;
const SYS_BIND = 5;
const SYS_SET_ROLE = 6;
const SYS_MUTATE = 7;
const SYS_MSG = 8;
const SYS_READ_INBOX = 9;
const SYS_TRANSFER = 10;
const SYS_REPLICATE = 11;
const SYS_EMIT = 12;

function handle_syscall(atomIdx: number) {
  if (!contextU8View || !contextI32View || !energiesView) return;
  const flagIdx = (atomIdx << 6) + 33;
  if (contextU8View[flagIdx] === 0) return;
  contextU8View[flagIdx] = 0; // Clear pending syscall flag

  const regBase = atomIdx << 4;
  const sysId = contextI32View[regBase]; // R0
  const r1 = contextI32View[regBase + 1];
  const r2 = contextI32View[regBase + 2];
  const r3 = contextI32View[regBase + 3];

  console.log(`   [DEBUG-SYSCALL] Atom ${atomIdx} invoked sysId=${sysId} with r1=${r1}, r2=${r2}, r3=${r3}`);

  let gasCost = 0;
  switch(sysId) {
    case SYS_YIELD: gasCost = 1; break;
    case SYS_READ_MEM: gasCost = 5; break;
    case SYS_WRITE_MEM: gasCost = 20; break;
    case SYS_SPAWN: gasCost = 100; break;
    case SYS_BIND: gasCost = 10; break;
    case SYS_SET_ROLE: gasCost = 5; break;
    case SYS_MUTATE: gasCost = 50; break;
    case SYS_MSG: gasCost = 20; break;
    case SYS_READ_INBOX: gasCost = 2; break;
    case SYS_TRANSFER: gasCost = 10; break;
    case SYS_REPLICATE: gasCost = 100; break;
    case SYS_EMIT: gasCost = 5; break;
    default: gasCost = 1; break;
  }

  const currentEnergy = Atomics.load(energiesView, atomIdx);
  if (currentEnergy < gasCost * 1000) {
    // Out of Gas for this syscall
    console.log(`   [SYSCALL-OOG] Atom ${atomIdx} Out of Gas for sysId=${sysId} (Needs ${gasCost}, Has ${currentEnergy / 1000})`);
    return;
  }
  
  // Burn the gas
  Atomics.sub(energiesView, atomIdx, gasCost * 1000); // 1000 is energy SCALE

  switch(sysId) {
    case SYS_YIELD:
      break;
    case SYS_READ_MEM: {
      const gx = r1, gy = r2;
      let val = 0;
      if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80 && structureGridView) {
        val = structureGridView[gy * 140 + gx] & 0xFF;
      }
      console.log(`   [SYSCALL] Atom ${atomIdx} requested READ_MEM at (${gx}, ${gy}) -> ${val}`);
      contextI32View[regBase] = val; // Return value in R0
      break;
    }
    case SYS_WRITE_MEM: {
      const gx = r1, gy = r2, newVal = r3;
      console.log(`   [SYSCALL] Atom ${atomIdx} requested WRITE_MEM at (${gx}, ${gy}) with ${newVal}`);
      if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80 && buildOwnerView && buildValueView) {
        const cellIdx = gy * 140 + gx;
        Atomics.store(buildOwnerView, cellIdx, atomIdx);
        Atomics.store(buildValueView, cellIdx, newVal);
      }
      break;
    }
    case SYS_SPAWN: {
      const childGx = r1, childGy = r2;
      if (childGx >= 0 && childGx < 140 && childGy >= 0 && childGy < 80 && spawnHeadView && spawnDataView) {
        const slot = Atomics.add(spawnHeadView, 0, 1) % 1024;
        const slotOff = slot * 24;
        const parentGenome = logicView ? logicView[atomIdx] : 0n;
        const parentLineage = lineageView ? lineageView[atomIdx] : 0n;
        // Write spawn request struct
        spawnDataView.setBigUint64(slotOff, parentGenome, true);
        spawnDataView.setInt16(slotOff + 8, childGx, true);
        spawnDataView.setInt16(slotOff + 10, childGy, true);
        spawnDataView.setInt32(slotOff + 12, 100, true); // give 100 energy to start
        spawnDataView.setBigUint64(slotOff + 16, parentLineage, true);
      }
      break;
    }
    case SYS_BIND: {
      const targetIdx = r1;
      if (targetIdx > 0 && targetIdx < MAX_ATOMS && bondRequestsView) {
        const off = atomIdx * 3;
        Atomics.store(bondRequestsView, off, atomIdx);
        Atomics.store(bondRequestsView, off + 1, targetIdx);
        Atomics.store(bondRequestsView, off + 2, 1);
      }
      break;
    }
    case SYS_SET_ROLE: {
      const rolesView = new Uint8Array(sharedBuffer!, OFFSETS.ROLES_OFFSET, MAX_ATOMS);
      const newRole = r1;
      // Host validates the role
      if (newRole >= 0 && newRole <= 8) {
        Atomics.store(rolesView, atomIdx, newRole);
      }
      break;
    }
    case SYS_MUTATE: {
      const targetIdx = r1;
      const offset = r2;
      const newValue = r3;
      // Host validates target and instructions boundary (0-63 bytes)
      if (targetIdx >= 0 && targetIdx < MAX_ATOMS && offset >= 0 && offset < 64 && instructionsView) {
        const globalOffset = targetIdx * 64 + offset;
        Atomics.store(instructionsView, globalOffset, newValue & 0xFF);
        console.log(`   [SYSCALL] Atom ${atomIdx} MUTATED Atom ${targetIdx} instruction at offset ${offset} to 0x${(newValue & 0xFF).toString(16)}`);
      } else {
        console.log(`   [SYSCALL-ERROR] Atom ${atomIdx} invalid MUTATE on ${targetIdx} at ${offset}`);
      }
      break;
    }
    case SYS_MSG: {
      const targetIdx = r1;
      const msgType = r2;
      const payload = r3;
      if (targetIdx >= 0 && targetIdx < MAX_ATOMS && mailboxView) {
        // Simple 1-deep mailbox per atom
        Atomics.store(mailboxView, targetIdx * 2, msgType);
        Atomics.store(mailboxView, targetIdx * 2 + 1, payload);
        console.log(`   [SYSCALL] Atom ${atomIdx} MSG -> Atom ${targetIdx} | Type: ${msgType}, Data: ${payload}`);
      }
      break;
    }
    case SYS_READ_INBOX: {
      if (mailboxView) {
        const msgType = Atomics.load(mailboxView, atomIdx * 2);
        const payload = Atomics.load(mailboxView, atomIdx * 2 + 1);
        
        // Return type in R0
        contextI32View[regBase] = msgType;
        
        // Return payload in R1 (we map R1 to contextI32View[regBase + 1])
        contextI32View[regBase + 1] = payload;
        
        // Clear mailbox after reading
        if (msgType !== 0) {
          Atomics.store(mailboxView, atomIdx * 2, 0);
          Atomics.store(mailboxView, atomIdx * 2 + 1, 0);
          console.log(`   [SYSCALL] Atom ${atomIdx} READ INBOX | Type: ${msgType}, Data: ${payload}`);
        }
      }
      break;
    }
    case SYS_TRANSFER: {
      const targetIdx = r1;
      const resourceType = r2; // 0 = Energy, 1 = Resonance
      const amount = r3;
      
      if (targetIdx >= 0 && targetIdx < MAX_ATOMS && amount > 0) {
        if (resourceType === 0 && energiesView) { // ENERGY
          const senderEnergy = Atomics.load(energiesView, atomIdx);
          // amount is in standard units (1 = 1 energy). We compare with scaled.
          const scaledAmount = amount * 1000;
          if (senderEnergy >= scaledAmount) {
             Atomics.sub(energiesView, atomIdx, scaledAmount);
             Atomics.add(energiesView, targetIdx, scaledAmount);
             console.log(`   [SYSCALL] Atom ${atomIdx} TRANSFERRED ${amount} Energy to Atom ${targetIdx}`);
          } else {
             console.log(`   [SYSCALL-FAIL] Atom ${atomIdx} insufficient Energy to transfer ${amount}`);
          }
        } else if (resourceType === 1 && resonancesView) { // RESONANCE
          const senderResonance = Atomics.load(resonancesView, atomIdx);
          if (senderResonance >= amount) {
             Atomics.sub(resonancesView, atomIdx, amount);
             Atomics.add(resonancesView, targetIdx, amount);
             console.log(`   [SYSCALL] Atom ${atomIdx} TRANSFERRED ${amount} Resonance to Atom ${targetIdx}`);
          } else {
             console.log(`   [SYSCALL-FAIL] Atom ${atomIdx} insufficient Resonance to transfer ${amount}`);
          }
        }
      }
      break;
    }
    case SYS_REPLICATE: {
      const targetIdx = r1;
      
      if (targetIdx >= 0 && targetIdx < MAX_ATOMS && targetIdx !== atomIdx && instructionsView && contextU8View) {
        const receiverEnergy = Atomics.load(energiesView, targetIdx);
        // Only allow replication into dead slots or by aggressive "infection" 
        // For now, let's keep it simple: can replicate anywhere, it overwrites the genome.
        
        // Copy 64 bytes of genome
        const srcOffset = atomIdx * 64;
        const dstOffset = targetIdx * 64;
        
        for (let i = 0; i < 64; i++) {
          Atomics.store(instructionsView, dstOffset + i, Atomics.load(instructionsView, srcOffset + i));
        }

        // Reset target PC (PC is at offset 32 in contextU8View)
        const targetFlagIdx = (targetIdx << 6) + 32;
        Atomics.store(contextU8View, targetFlagIdx, 0);
        
        // Give the child a starter spark of energy from the sender
        const replicationSpark = 50 * 1000; // 50 energy units
        const senderEnergy = Atomics.load(energiesView, atomIdx);
        
        if (senderEnergy > replicationSpark) {
           Atomics.sub(energiesView, atomIdx, replicationSpark);
           Atomics.add(energiesView, targetIdx, replicationSpark);
        }

        // Also "wake up" the atom by giving it ID if it doesn't have one
        if (idsView && idsView[targetIdx] === 0n) {
           idsView[targetIdx] = BigInt(targetIdx + 1);
        }

        console.log(`   [SYSCALL] Atom ${atomIdx} REPLICATED genome into Atom ${targetIdx}`);
      } else {
        console.log(`   [SYSCALL-FAIL] Atom ${atomIdx} REPLICATE failed (invalid target ${targetIdx})`);
      }
      break;
    }
    case SYS_EMIT: {
      if (ledgerHeadView && ledgerDataView) {
        // Atomic ring buffer increment
        const cursor = Atomics.add(ledgerHeadView, 0, 1) % OFFSETS.MAX_LEDGER_EVENTS;
        const base = cursor * 4; // 4 i32 per event

        const currentTick = tickCounterView ? Atomics.load(tickCounterView, 0) : 0;
        
        // Emitted Event Structure -> [Tick, AtomIdx, R1, R2]
        Atomics.store(ledgerDataView, base, currentTick);
        Atomics.store(ledgerDataView, base + 1, atomIdx);
        Atomics.store(ledgerDataView, base + 2, r1);
        Atomics.store(ledgerDataView, base + 3, r2);

        console.log(`   [SYSCALL] Atom ${atomIdx} EMIT event: [${r1}, ${r2}] at Tick ${currentTick}`);
      }
      break;
    }
    default:
      console.log(`   [SYSCALL-UNKNOWN] Atom ${atomIdx} requested UNKNOWN ${sysId}`);
      break;
  }
}

let debugDelayMs = 0;
let debugJitterMinMs = 0;
let debugJitterMaxMs = 0;
let debugJitterSeed = 0x9E3779B9;
const FORCE_INIT_FAIL_MODE =
  (Deno.env.get("OMEGA_FORCE_WORKER_INIT_FAIL") ?? "").trim().toLowerCase();
const shouldForceInitFail = (workerIndex: number): boolean => {
  if (
    FORCE_INIT_FAIL_MODE === "1" || FORCE_INIT_FAIL_MODE === "true" ||
    FORCE_INIT_FAIL_MODE === "all"
  ) {
    return true;
  }
  if (FORCE_INIT_FAIL_MODE === "nonzero") {
    return workerIndex > 0;
  }
  if (FORCE_INIT_FAIL_MODE.startsWith("index:")) {
    const idx = Number.parseInt(
      FORCE_INIT_FAIL_MODE.slice("index:".length),
      10,
    );
    return Number.isFinite(idx) && idx === workerIndex;
  }
  return false;
};
const nextJitterUnit = (): number => {
  debugJitterSeed = (Math.imul(debugJitterSeed, 1664525) + 1013904223) >>> 0;
  return debugJitterSeed / 0x1_0000_0000;
};
const sampleJitterMs = (): number => {
  if (debugJitterMaxMs <= 0) return 0;
  const lo = Math.max(0, Math.min(2000, debugJitterMinMs));
  const hi = Math.max(lo, Math.min(2000, debugJitterMaxMs));
  if (hi === lo) return lo;
  return lo + Math.floor(nextJitterUnit() * (hi - lo + 1));
};
const maybeDelay = async () => {
  const totalDelay = debugDelayMs + sampleJitterMs();
  if (totalDelay <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, totalDelay));
};

self.onmessage = async (e) => {
  const { type, pulseId } = e.data;

  if (type === "INIT") {
    const { buffer, wasmMemory, workerIndex } = e.data;
    sharedBuffer = buffer;
    const sb = sharedBuffer as SharedArrayBuffer;
    tickCounterView = new Int32Array(sb, OFFSETS.TICK_COUNTER_OFFSET, 1);
    syncStateView = new Int32Array(sb, OFFSETS.SYNC_STATE_OFFSET, 1);
    idsView = new BigUint64Array(sb, OFFSETS.IDS_OFFSET, MAX_ATOMS);
    contextI32View = new Int32Array(sb, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 16);
    contextU8View = new Uint8Array(sb, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 64);
    structureGridView = new Int32Array(sb, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);
    buildOwnerView = new Int32Array(sb, OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET, 140 * 80);
    buildValueView = new Int32Array(sb, OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET, 140 * 80);
    spawnHeadView = new Int32Array(sb, OFFSETS.SPAWN_REQUESTS_OFFSET, 1);
    spawnDataView = new DataView(sb, OFFSETS.SPAWN_REQUESTS_OFFSET + 8, 1024 * 24);
    lineageView = new BigUint64Array(sb, OFFSETS.LINEAGE_OFFSET, MAX_ATOMS);
    logicView = new BigUint64Array(sb, OFFSETS.LOGIC_OFFSET, MAX_ATOMS);
    bondRequestsView = new Int32Array(sb, OFFSETS.BOND_REQUESTS_OFFSET, MAX_ATOMS * 3);
    energiesView = new Int32Array(sb, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
    resonancesView = new Int32Array(sb, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
    instructionsView = new Uint8Array(sb, OFFSETS.INSTRUCTIONS_OFFSET, MAX_ATOMS * 64);
    mailboxView = new Int32Array(sb, OFFSETS.MAILBOX_OFFSET, MAX_ATOMS * 2);
    ledgerHeadView = new Int32Array(sb, OFFSETS.LEDGER_HEAD_OFFSET, 1);
    ledgerDataView = new Int32Array(sb, OFFSETS.LEDGER_DATA_OFFSET, OFFSETS.MAX_LEDGER_EVENTS * 4);
    
    const idx = Number(workerIndex);
    if (Number.isFinite(idx)) {
      debugJitterSeed = (0x9E3779B9 ^ ((idx + 1) >>> 0)) >>> 0;
    }
    if (shouldForceInitFail(idx)) {
      self.postMessage({
        type: "INIT_FAILED",
        error: `FORCED_INIT_FAIL(worker=${idx})`,
      });
      return;
    }
    try {
      const wasmRes = await fetch(
        new URL("./build/release.wasm", import.meta.url).href,
      );
      const wasmBytes = await wasmRes.arrayBuffer();
      const traceAtom = (
        idx: number,
        op: number,
        gx: number,
        gy: number,
        target: number,
      ) => {
        if (idx < 10000) { // Keep threshold high for now
          LOGGER.info(
            `   [TRACE] At ${idx} | OP: 0x${
              op.toString(16)
            } | Pos: (${gx},${gy}) | PC: ${target}`,
          );
        }
      };
      const instantiated = await WebAssembly.instantiate(wasmBytes, {
        index: {
          trace_atom: traceAtom,
        },
        env: {
          memory: wasmMemory,
          abort: (msg: any) => LOGGER.error("   [WASM ABORT]:", msg),
          trace_atom: traceAtom,
        },
      });
      wasmInstance = instantiated.instance;
      execute_atom_fn = wasmInstance.exports.execute_atom as any;
      tick_environment_fn = wasmInstance.exports.tick_environment as any;
      tick_matrix_fn = wasmInstance.exports.tick_matrix as any;
      tick_structure_grid_fn = wasmInstance.exports.tick_structure_grid as any;
      build_spatial_hash_fn = wasmInstance.exports.build_spatial_hash as any;
      get_spatial_hash_overflow_count_fn = wasmInstance.exports
        .get_spatial_hash_overflow_count as any;
      get_spatial_hash_max_cell_count_fn = wasmInstance.exports
        .get_spatial_hash_max_cell_count as any;
      reduce_atom_deltas_fn = wasmInstance.exports.reduce_atom_deltas as any;
      get_neural_coherence_fn = wasmInstance.exports
        .get_neural_coherence as any;
      set_neural_coherence_fn = wasmInstance.exports
          .set_neural_coherence as any;
      tick_glyph_transport_fn = wasmInstance.exports.tickGlyphTransport as any;
      resolve_bond_requests_fn = wasmInstance.exports.resolve_bond_requests as any;
      drain_spawn_requests_fn = wasmInstance.exports.drain_spawn_requests as any;
      clear_metabolism_stats_fn = wasmInstance.exports.clear_metabolism_stats as any;
      accumulate_metabolism_stats_fn = wasmInstance.exports.accumulate_metabolism_stats as any;
      apply_metabolism_kernel_fn = wasmInstance.exports.apply_metabolism_kernel as any;
      LOGGER.info("   [WORKER] WASM Instantiated successfully.");
      await maybeDelay();
      self.postMessage({ type: "READY" });
    } catch (err) {
      LOGGER.error("   [WORKER] WASM LOAD ERROR:", err);
      const error = err instanceof Error
        ? `${err.name}: ${err.message}`
        : String(err);
      self.postMessage({ type: "INIT_FAILED", error });
    }
    return;
  }

  if (type === "PULSE") {
    const { startIdx, endIdx } = e.data;
    if (!wasmInstance || !execute_atom_fn || !syncStateView || !idsView) return;

    // Wait for WASM_TICKING state (1)
    // If Host is locking (2) or Idle (0), we don't start yet.
    while (Atomics.load(syncStateView, 0) !== 1) {
      Atomics.wait(syncStateView, 0, 0, 1); // Wait if 0, expect 1
      if (Atomics.load(syncStateView, 0) === 2) {
        // If it's 2, we must wait for it to become 0 then 1
        Atomics.wait(syncStateView, 0, 2, 5);
      }
    }

    try {
      for (let i = startIdx; i < endIdx; i++) {
        const currentId = Atomics.load(idsView, i);
        if (currentId === 0n) continue;

        // Absolute WASM Coherence: The Kernel now handles Physics AND VM
        execute_atom_fn(i);
        handle_syscall(i); // Process any syscall intent pending from the atom

      }
    } catch (err) {
      LOGGER.error("   [WORKER EXECUTION ERROR]", err);
    }

    await maybeDelay();
    self.postMessage({ type: "DONE", pulseId });
  }

  if (type === "REDUCE_DELTAS") {
    const { startIdx, endIdx } = e.data;
    if (reduce_atom_deltas_fn) {
      reduce_atom_deltas_fn(startIdx, endIdx);
    }
    await maybeDelay();
    self.postMessage({ type: "DELTA_DONE", pulseId });
  }

  if (type === "TICK_MATRIX") {
    if (tick_environment_fn) tick_environment_fn(e.data.tick || e.data.pulseId);
    else if (tick_structure_grid_fn) tick_structure_grid_fn();
    else if (tick_matrix_fn) tick_matrix_fn();
    await maybeDelay();
    self.postMessage({ type: "MATRIX_DONE", pulseId });
  }

  if (type === "TICK_ENVIRONMENT") {
    if (tick_environment_fn) tick_environment_fn(e.data.tick);
    await maybeDelay();
    self.postMessage({ type: "ENVIRONMENT_DONE", pulseId });
  }

  if (type === "RESOLVE_BONDS") {
    try {
      if (!resolve_bond_requests_fn) {
        throw new Error("resolve_bond_requests_fn is not initialized.");
      }
      const count = resolve_bond_requests_fn(e.data.startIdx, e.data.endIdx);
      LOGGER.info(`[DEBUG-WORKER] WASM resolve returned ${count}`);
      self.postMessage({
        type: "RESOLVE_BONDS_DONE",
        count,
        pulseId: e.data.pulseId,
      });
    } catch (err) {
      LOGGER.error(`[ERROR-WORKER] RESOLVE_BONDS failed`, err);
    }
  }

  if (type === "DRAIN_SPAWN") {
    const count = drain_spawn_requests_fn ? drain_spawn_requests_fn(e.data.tick) : 0;
    await maybeDelay();
    self.postMessage({ type: "DRAIN_SPAWN_DONE", pulseId, count });
  }

  if (type === "BUILD_SPATIAL_HASH") {
    if (build_spatial_hash_fn) build_spatial_hash_fn();
    const overflowCount = get_spatial_hash_overflow_count_fn
      ? get_spatial_hash_overflow_count_fn()
      : 0;
    const maxCellCount = get_spatial_hash_max_cell_count_fn
      ? get_spatial_hash_max_cell_count_fn()
      : 0;
    await maybeDelay();
    self.postMessage({ type: "HASH_DONE", pulseId, overflowCount, maxCellCount });
  }

  if (type === "TICK_GLYPH_TRANSPORT") {
    if (tick_glyph_transport_fn) tick_glyph_transport_fn(e.data.tick);
    await maybeDelay();
    self.postMessage({ type: "GLYPH_TRANSPORT_DONE", pulseId });
  }

  if (type === "POLL_COHERENCE") {
    if (get_neural_coherence_fn) {
      const coherence = get_neural_coherence_fn();
      await maybeDelay();
      self.postMessage({ type: "COHERENCE_VAL", coherence, pulseId });
    }
  }

  if (type === "SET_COHERENCE") {
    if (set_neural_coherence_fn) {
      set_neural_coherence_fn(e.data.coherence);
      await maybeDelay();
      self.postMessage({ type: "COHERENCE_SET_DONE", pulseId });
    }
  }

  if (type === "METABOLISM_ACCUMULATE") {
    const { startIdx, endIdx, clear } = e.data;
    if (clear && clear_metabolism_stats_fn) clear_metabolism_stats_fn();
    if (accumulate_metabolism_stats_fn) accumulate_metabolism_stats_fn(startIdx, endIdx);
    await maybeDelay();
    self.postMessage({ type: "METABOLISM_ACCUMULATE_DONE", pulseId });
  }

  if (type === "METABOLISM_APPLY") {
    const {
      startIdx,
      endIdx,
      noveltySigned,
      symbiosisSigned,
      baseTax,
      targetEnergy,
      homeostasisBand,
      homeostasisMaxDelta,
      overflowThreshold,
      spatialOverflowRatio,
      starvationFloor,
      subsidyEnabled,
    } = e.data;

    if (apply_metabolism_kernel_fn) {
      apply_metabolism_kernel_fn(
        startIdx,
        endIdx,
        noveltySigned,
        symbiosisSigned,
        baseTax,
        targetEnergy,
        homeostasisBand,
        homeostasisMaxDelta,
        Math.floor(overflowThreshold * 1024),
        Math.floor(spatialOverflowRatio * 1024),
        starvationFloor,
        subsidyEnabled ? 1 : 0,
      );
    }
    await maybeDelay();
    self.postMessage({ type: "METABOLISM_APPLY_DONE", pulseId });
    }

  if (type === "SET_DEBUG_DELAY") {
    const delayRaw = Number(e.data.delayMs);
    debugDelayMs = Number.isFinite(delayRaw)
      ? Math.max(0, Math.min(2000, Math.floor(delayRaw)))
      : 0;
    await maybeDelay();
    self.postMessage({ type: "DEBUG_DELAY_SET", pulseId });
  }

  if (type === "SET_DEBUG_JITTER") {
    const minRaw = Number(e.data.minMs);
    const maxRaw = Number(e.data.maxMs);
    const minMs = Number.isFinite(minRaw)
      ? Math.max(0, Math.min(2000, Math.floor(minRaw)))
      : 0;
    const maxMs = Number.isFinite(maxRaw)
      ? Math.max(0, Math.min(2000, Math.floor(maxRaw)))
      : 0;
    debugJitterMinMs = Math.min(minMs, maxMs);
    debugJitterMaxMs = Math.max(minMs, maxMs);
    await maybeDelay();
    self.postMessage({
      type: "DEBUG_JITTER_SET",
      minMs: debugJitterMinMs,
      maxMs: debugJitterMaxMs,
      pulseId,
    });
  }
};
