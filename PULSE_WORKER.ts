/// <reference lib="deno.worker" />
// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";
import { LOGGER } from "./LOGGER.ts";
const resolveWithPhase = (
  baseValue: number,
  modifiers: Array<{ phase: number; weight: number }>,
): number => {
  let real = baseValue;
  let imag = 0;

  for (const mod of modifiers) {
    const rad = (mod.phase * Math.PI) / 128; // 0-255 → radians
    real += mod.weight * Math.cos(rad);
    imag += mod.weight * Math.sin(rad);
  }

  // Return "intensity" = |z|
  return Math.floor(Math.sqrt(real * real + imag * imag));
};
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
let resolve_bond_requests_fn: ((start: number, end: number) => number) | null =
  null;
let drain_spawn_requests_fn: ((tick: number) => number) | null = null;
let clear_metabolism_stats_fn: (() => void) | null = null;
let accumulate_metabolism_stats_fn:
  | ((start: number, end: number) => void)
  | null = null;
let apply_metabolism_kernel_fn:
  | ((
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
  ) => void)
  | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let tickCounterView: Int32Array | null = null;
let syncStateView: Int32Array | null = null;
let idsView: BigUint64Array | null = null;
let xsView: Int16Array | null = null;
let ysView: Int16Array | null = null;
let contextI32View: Int32Array | null = null;
let contextU8View: Uint8Array | null = null;
let structureGridView: Int32Array | null = null;
let spatialGridView: Int32Array | null = null;
let buildOwnerView: Int32Array | null = null;
let buildValueView: Int32Array | null = null;
let spawnHeadView: Int32Array | null = null;
let spawnDataView: DataView | null = null;
let lineageView: BigUint64Array | null = null;
let logicView: BigUint64Array | null = null;
let bondRequestsView: Int32Array | null = null;
let energiesView: Int32Array | null = null;
let phaseView: Int32Array | null = null;

let currentPulseId = 0;
let currentTheta = 0;
let resonancesView: Int32Array | null = null;
let instructionsView: Uint8Array | null = null;
let mailboxView: Int32Array | null = null;
let ledgerHeadView: Int32Array | null = null;
let ledgerDataView: Int32Array | null = null;
let marketState: Int32Array | null = null;
let betPoolInt: Int32Array | null = null;

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
const SYS_SCAN = 13;
const SYS_MOVE = 14;
const SYS_EAT = 15;
const SYS_BET = 16;
const SYS_ATTRACT = 17;
const SYS_FOLD = 18;
const SYS_SPORE_DRIVE = 20;
const SYS_SENSE_PHASE = 21;

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

  LOGGER.debug(
    `   [DEBUG-SYSCALL] Atom ${atomIdx} invoked sysId=${sysId} with r1=${r1}, r2=${r2}, r3=${r3}`,
  );

  let gasCost = 0;
  switch (sysId) {
    case SYS_YIELD:
      gasCost = 1;
      break;
    case SYS_READ_MEM:
      gasCost = 5;
      break;
    case SYS_WRITE_MEM:
      gasCost = 20;
      break;
    case SYS_SPAWN:
      gasCost = 100;
      break;
    case SYS_BIND:
      gasCost = 10;
      break;
    case SYS_SET_ROLE:
      gasCost = 5;
      break;
    case SYS_MUTATE:
      gasCost = 50;
      break;
    case SYS_MSG:
      gasCost = 20;
      break;
    case SYS_READ_INBOX:
      gasCost = 2;
      break;
    case SYS_TRANSFER:
      gasCost = 10;
      break;
    case SYS_REPLICATE:
      gasCost = 100;
      break;
    case SYS_EMIT:
      gasCost = 5;
      break;
    case SYS_SCAN:
      gasCost = 20;
      break;
    case SYS_MOVE:
      gasCost = 10;
      break;
    case SYS_EAT:
      gasCost = 30;
      break;
    case SYS_BET:
      gasCost = 10;
      break;
    case SYS_ATTRACT:
    case SYS_FOLD:
      gasCost = 10;
      break;
    case SYS_SPORE_DRIVE:
      gasCost = 500;
      break;
    case SYS_SENSE_PHASE:
      gasCost = 5;
      break;
    default:
      gasCost = 1;
      break;
  }

  const currentEnergy = Atomics.load(energiesView, atomIdx);
  if (currentEnergy < gasCost * 1000) {
    // Out of Gas for this syscall
    LOGGER.debug(
      `   [SYSCALL-OOG] Atom ${atomIdx} Out of Gas for sysId=${sysId} (Needs ${gasCost}, Has ${
        currentEnergy / 1000
      })`,
    );
    return;
  }

  // Burn the gas
  Atomics.sub(energiesView, atomIdx, gasCost * 1000); // 1000 is energy SCALE

  switch (sysId) {
    case SYS_YIELD:
      break;
    case SYS_READ_MEM: {
      const gx = r1, gy = r2;
      let val = 0;
      if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80 && structureGridView) {
        val = structureGridView[gy * 140 + gx] & 0xFF;
      }
      LOGGER.debug(
        `   [SYSCALL] Atom ${atomIdx} requested READ_MEM at (${gx}, ${gy}) -> ${val}`,
      );
      contextI32View[regBase] = val; // Return value in R0
      break;
    }
    case SYS_WRITE_MEM: {
      const gx = r1, gy = r2, newVal = r3;
      LOGGER.debug(
        `   [SYSCALL] Atom ${atomIdx} requested WRITE_MEM at (${gx}, ${gy}) with ${newVal}`,
      );
      if (
        gx >= 0 && gx < 140 && gy >= 0 && gy < 80 && buildOwnerView &&
        buildValueView
      ) {
        const cellIdx = gy * 140 + gx;
        Atomics.store(buildOwnerView, cellIdx, atomIdx);
        Atomics.store(buildValueView, cellIdx, newVal);
      }
      break;
    }
    case SYS_SPAWN: {
      const childGx = r1, childGy = r2;
      if (
        childGx >= 0 && childGx < 140 && childGy >= 0 && childGy < 80 &&
        spawnHeadView && spawnDataView
      ) {
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
      const rolesView = new Uint8Array(
        sharedBuffer!,
        OFFSETS.ROLES_OFFSET,
        MAX_ATOMS,
      );
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
      if (
        targetIdx >= 0 && targetIdx < MAX_ATOMS && offset >= 0 && offset < 64 &&
        instructionsView
      ) {
        const globalOffset = targetIdx * 64 + offset;
        Atomics.store(instructionsView, globalOffset, newValue & 0xFF);
        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} MUTATED Atom ${targetIdx} instruction at offset ${offset} to 0x${
            (newValue & 0xFF).toString(16)
          }`,
        );
      } else {
        LOGGER.debug(
          `   [SYSCALL-ERROR] Atom ${atomIdx} invalid MUTATE on ${targetIdx} at ${offset}`,
        );
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
        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} MSG -> Atom ${targetIdx} | Type: ${msgType}, Data: ${payload}`,
        );
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
          LOGGER.debug(
            `   [SYSCALL] Atom ${atomIdx} READ INBOX | Type: ${msgType}, Data: ${payload}`,
          );
        }
      }
      break;
    }
    case SYS_TRANSFER: {
      const targetIdx = r1;
      const resourceType = r2; // 0 = Energy, 1 = Resonance
      const amount = r3;       // Positive to give, Negative to steal

      if (targetIdx > 0 && targetIdx < MAX_ATOMS && amount !== 0) {
        if (resourceType === 0 && energiesView) { // ENERGY
          if (amount > 0) {
            const senderEnergy = Atomics.load(energiesView, atomIdx);
            const scaledAmount = amount * 1000;
            if (senderEnergy >= scaledAmount) {
              Atomics.sub(energiesView, atomIdx, scaledAmount);
              Atomics.add(energiesView, targetIdx, scaledAmount);
              LOGGER.debug(`   [SYSCALL] Atom ${atomIdx} TRANSFERRED ${amount} Energy to Atom ${targetIdx}`);
            }
          } else {
             // Stealing
             const stealAmount = (-amount) * 1000;
             if (resonancesView && xsView && ysView) {
               const myRes = Atomics.load(resonancesView, atomIdx);
               const tRes = Atomics.load(resonancesView, targetIdx);
               if (myRes > tRes && myRes > 250 && tRes < 100) {
                 const ox = Atomics.load(xsView, atomIdx);
                 const oy = Atomics.load(ysView, atomIdx);
                 const tx = Atomics.load(xsView, targetIdx);
                 const ty = Atomics.load(ysView, targetIdx);

                 const dx = (tx - ox) / 10.0;
                 const dy = (ty - oy) / 10.0;
                 const distSq = dx * dx + dy * dy;

                 if (distSq <= 2.25) {
                   const tEnergy = Atomics.load(energiesView, targetIdx);
                   const takeAmount = Math.min(stealAmount, tEnergy);
                   if (takeAmount > 0) {
                     Atomics.sub(energiesView, targetIdx, takeAmount);
                     Atomics.add(energiesView, atomIdx, takeAmount);
                     LOGGER.debug(`   [SYSCALL] Atom ${atomIdx} STOLE ${takeAmount/1000} Energy from Atom ${targetIdx}`);
                     if (contextU8View) {
                         const flagsIdx = (atomIdx << 6) + 33; // pseudo-cost
                         // Note: VM costs 30 for stealing, we already deducted 10, deduct 20 more
                         const extraCost = 20 * 1000;
                         const e = Atomics.load(energiesView, atomIdx);
                         if (e >= extraCost) Atomics.sub(energiesView, atomIdx, extraCost); 
                     }
                   }
                 }
               }
             }
          }
        } else if (resourceType === 1 && resonancesView) { // RESONANCE
          if (amount > 0) {
            const senderResonance = Atomics.load(resonancesView, atomIdx);
            if (senderResonance >= amount) {
              Atomics.sub(resonancesView, atomIdx, amount);
              Atomics.add(resonancesView, targetIdx, amount);
              LOGGER.debug(`   [SYSCALL] Atom ${atomIdx} TRANSFERRED ${amount} Resonance to Atom ${targetIdx}`);
            }
          }
        }
      }
      break;
    }
    case SYS_REPLICATE: {
      const targetIdx = r1;

      if (
        targetIdx >= 0 && targetIdx < MAX_ATOMS && targetIdx !== atomIdx &&
        instructionsView && contextU8View
      ) {
        const receiverEnergy = Atomics.load(energiesView, targetIdx);
        // Only allow replication into dead slots or by aggressive "infection"
        // For now, let's keep it simple: can replicate anywhere, it overwrites the genome.

        // Copy 64 bytes of genome
        const srcOffset = atomIdx * 64;
        const dstOffset = targetIdx * 64;

        for (let i = 0; i < 64; i++) {
          Atomics.store(
            instructionsView,
            dstOffset + i,
            Atomics.load(instructionsView, srcOffset + i),
          );
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

        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} REPLICATED genome into Atom ${targetIdx}`,
        );
      } else {
        LOGGER.debug(
          `   [SYSCALL-FAIL] Atom ${atomIdx} REPLICATE failed (invalid target ${targetIdx})`,
        );
      }
      break;
    }
    case SYS_EMIT: {
      if (ledgerHeadView && ledgerDataView) {
        // Atomic ring buffer increment
        const cursor = Atomics.add(ledgerHeadView, 0, 1) %
          OFFSETS.MAX_LEDGER_EVENTS;
        const base = cursor * 4; // 4 i32 per event

        const currentTick = tickCounterView
          ? Atomics.load(tickCounterView, 0)
          : 0;

        // Emitted Event Structure -> [Tick, AtomIdx, R1, R2]
        Atomics.store(ledgerDataView, base, currentTick);
        Atomics.store(ledgerDataView, base + 1, atomIdx);
        Atomics.store(ledgerDataView, base + 2, r1);
        Atomics.store(ledgerDataView, base + 3, r2);

        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} EMIT event: [${r1}, ${r2}] at Tick ${currentTick}`,
        );
      }
      break;
    }
    case SYS_SCAN: {
      const radius = r1;
      let closestIdx = -1;
      let minDstSq = Infinity;

      if (
        radius > 0 && xsView && ysView && spatialGridView && idsView &&
        energiesView && resonancesView
      ) {
        // Deduct scan cost. Let's say 20 gas.
        const COST = 20 * 1000;
        const currentEnergy = Atomics.load(energiesView, atomIdx);
        if (currentEnergy >= COST) {
          Atomics.sub(energiesView, atomIdx, COST);

          // xsView stores coordinate * 100. Unscale to match spatial hash scale (1 unit = 1 pixel).
          const cx = xsView[atomIdx] / 100;
          const cy = ysView[atomIdx] / 100;

          const CELL_SIZE = 10;
          const GRID_COLS = 140;
          const GRID_ROWS = 80;

          const startX = Math.max(0, Math.floor((cx - radius) / CELL_SIZE));
          const endX = Math.min(
            GRID_COLS - 1,
            Math.floor((cx + radius) / CELL_SIZE),
          );
          const startY = Math.max(0, Math.floor((cy - radius) / CELL_SIZE));
          const endY = Math.min(
            GRID_ROWS - 1,
            Math.floor((cy + radius) / CELL_SIZE),
          );

          for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
              const cellIdx = y * GRID_COLS + x;
              const cellBase = cellIdx * 32; // 32 slots per cell (1 count + 31 items)

              const count = spatialGridView[cellBase];

              for (let i = 1; i <= count; i++) {
                const targetIdx = spatialGridView[cellBase + i];
                if (targetIdx === atomIdx) continue; // Skip self

                if (idsView[targetIdx] !== 0n) {
                  // Dark Forest Topology: Radar Stealth
                  const targetRes = Atomics.load(resonancesView, targetIdx);
                  if (targetRes <= 20) continue; // Invisible

                  const tx = xsView[targetIdx] / 100;
                  const ty = ysView[targetIdx] / 100;
                  const dx = tx - cx;
                  const dy = ty - cy;
                  const dstSq = dx * dx + dy * dy;

                  if (dstSq <= radius * radius && dstSq < minDstSq) {
                    minDstSq = dstSq;
                    closestIdx = targetIdx;
                  }
                }
              }
            }
          }
          LOGGER.debug(
            `   [SYSCALL] Atom ${atomIdx} SCAN r=${radius}. Found=${closestIdx}`,
          );
        } else {
          LOGGER.debug(
            `   [SYSCALL-FAIL] Atom ${atomIdx} insufficient Energy for SCAN`,
          );
        }
      }
      contextI32View![regBase] = closestIdx;
      break;
    }
    case SYS_ATTRACT: {
      const targetIdx = r1;
      const intensity = r2; // Pos=Attract, Neg=Repel
      if (targetIdx > 0 && targetIdx < MAX_ATOMS && xsView && ysView && spatialGridView) {
        const ox = Atomics.load(xsView, atomIdx);
        const oy = Atomics.load(ysView, atomIdx);
        const tx = Atomics.load(xsView, targetIdx);
        const ty = Atomics.load(ysView, targetIdx);

        const dx = tx - ox;
        const dy = ty - oy;

        const dxSign = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
        const dySign = dy > 0 ? 1 : (dy < 0 ? -1 : 0);

        const dxStr = intensity > 0 ? dxSign : -dxSign;
        const dyStr = intensity > 0 ? dySign : -dySign;

        if (dxStr !== 0 || dyStr !== 0) {
          let nx = ox + dxStr * 10;
          let ny = oy + dyStr * 10;
          console.log(`[PULSE_WORKER] SYS_ATTRACT executed by ${atomIdx} targeting ${targetIdx}. Moving to (${nx}, ${ny})`);
          
          if (nx < 0) nx = 0; else if (nx > 1399) nx = 1399;
          if (ny < 0) ny = 0; else if (ny > 799) ny = 799;

          const nGridX = Math.floor(nx / 10);
          const nGridY = Math.floor(ny / 10);
          const nCellIdx = nGridY * 140 + nGridX;

          let capacityOk = false;
          let emptySlotOffset = -1;
          for (let s = 0; s < 32; s++) {
            const currentAtomId = Atomics.load(spatialGridView, nCellIdx * 32 + s);
            if (currentAtomId === 0) {
              capacityOk = true;
              break;
            }
          }

          console.log(`[PULSE_WORKER_DEBUG] atomIdx: ${atomIdx}, targetIdx: ${targetIdx}, ox: ${ox}, tx: ${tx}`);

          if (capacityOk) {
            Atomics.store(xsView, atomIdx, nx);
            Atomics.store(ysView, atomIdx, ny);
          }
        }
      }
      break;
    }
    case SYS_FOLD: {
      break; // Placeholder for purely topological matrix operations
    }
    case SYS_BET: {
      if (!marketState || !betPoolInt) {
        contextI32View[regBase + 1] = 0;
        break;
      }

      const energyBet = Math.max(0, r1);
      if (energyBet <= 0) {
        contextI32View[regBase + 1] = 0;
        break;
      }

      const currentMarketState = Atomics.load(marketState, 0);
      if (currentMarketState !== 1) {
        // No active crisis
        contextI32View[regBase + 1] = 0;
        break;
      }

      const scaledBet = energyBet * 1000;
      const availableEnergy = Atomics.load(energiesView, atomIdx);

      // We already deducted gasCost * 1000 before reaching the switch block
      if (availableEnergy >= scaledBet) {
        Atomics.sub(energiesView, atomIdx, scaledBet);
        Atomics.add(betPoolInt, 0, scaledBet);
        contextI32View[regBase + 1] = 1; // success
      } else {
        contextI32View[regBase + 1] = 0; // failure
      }
      break;
    }
    case SYS_SPORE_DRIVE: {
      const energy = Atomics.load(energiesView!, atomIdx);
      const atomPhase = Atomics.load(phaseView!, atomIdx);
      const epochPhase = (currentPulseId * 4) % 256;

      const sporeCost = resolveWithPhase(500, [
        { phase: epochPhase, weight: 50 },
        { phase: currentTheta, weight: 30 },
        { phase: atomPhase, weight: 20 },
      ]);
      const energyBet = sporeCost * 1000;

      if (energy >= energyBet) {
        Atomics.sub(energiesView!, atomIdx, energyBet);
        self.postMessage({ type: "SPORE_DRIVE_REQUEST", atomIdx });
        // Syscall intercept verification
        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} initiated SPORE_DRIVE (Energy drained by ${sporeCost}: EpochPhase=${epochPhase}, Theta=${
            Math.floor(currentTheta)
          }, AtomPhase=${atomPhase}).`,
        );
      } else {
        contextI32View![(atomIdx << 4) + 1] = 0; // failure in register
      }
      break;
    }
    case SYS_SENSE_PHASE: {
      const epochPhase = (currentPulseId * 4) % 256;
      const packed = (epochPhase & 0xFFFF) |
        ((Math.floor(currentTheta) & 0xFFFF) << 16);
      contextI32View![regBase] = packed;
      LOGGER.debug(
        `   [SYSCALL] Atom ${atomIdx} performed SENSE_PHASE (EpochPhase=${epochPhase}, Theta=${
          Math.floor(currentTheta)
        })`,
      );
      break;
    }
    default:
      LOGGER.debug(
        `   [SYSCALL-UNKNOWN] Atom ${atomIdx} requested UNKNOWN ${sysId}`,
      );
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
    const { buffer, marketBuffer, wasmMemory, workerIndex } = e.data;
    sharedBuffer = buffer;
    if (marketBuffer) {
      marketState = new Int32Array(marketBuffer, 0, 1);
      betPoolInt = new Int32Array(marketBuffer, 4, 1);
    }
    const sb = sharedBuffer as SharedArrayBuffer;
    tickCounterView = new Int32Array(sb, OFFSETS.TICK_COUNTER_OFFSET, 1);
    syncStateView = new Int32Array(sb, OFFSETS.SYNC_STATE_OFFSET, 1);
    idsView = new BigUint64Array(sb, OFFSETS.IDS_OFFSET, MAX_ATOMS);
    xsView = new Int16Array(sb, OFFSETS.XS_OFFSET, MAX_ATOMS); // 2 bytes per atom, so length is MAX_ATOMS
    ysView = new Int16Array(sb, OFFSETS.YS_OFFSET, MAX_ATOMS);
    contextI32View = new Int32Array(sb, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 16);
    contextU8View = new Uint8Array(sb, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 64);
    structureGridView = new Int32Array(
      sb,
      OFFSETS.STRUCTURE_GRID_OFFSET,
      140 * 80,
    );
    spatialGridView = new Int32Array(
      sb,
      OFFSETS.SPATIAL_GRID_OFFSET,
      140 * 80 * 32,
    );
    buildOwnerView = new Int32Array(
      sb,
      OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
      140 * 80,
    );
    buildValueView = new Int32Array(
      sb,
      OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET,
      140 * 80,
    );
    spawnHeadView = new Int32Array(sb, OFFSETS.SPAWN_REQUESTS_OFFSET, 1);
    spawnDataView = new DataView(
      sb,
      OFFSETS.SPAWN_REQUESTS_OFFSET + 8,
      1024 * 24,
    );
    lineageView = new BigUint64Array(sb, OFFSETS.LINEAGE_OFFSET, MAX_ATOMS);
    logicView = new BigUint64Array(sb, OFFSETS.LOGIC_OFFSET, MAX_ATOMS);
    bondRequestsView = new Int32Array(
      sb,
      OFFSETS.BOND_REQUESTS_OFFSET,
      MAX_ATOMS * 3,
    );
    energiesView = new Int32Array(sb, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
    resonancesView = new Int32Array(sb, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
    phaseView = new Int32Array(sb, OFFSETS.PHASE_OFFSET, MAX_ATOMS);
    instructionsView = new Uint8Array(
      sb,
      OFFSETS.INSTRUCTIONS_OFFSET,
      MAX_ATOMS * 64,
    );
    mailboxView = new Int32Array(sb, OFFSETS.MAILBOX_OFFSET, MAX_ATOMS * 2);
    ledgerHeadView = new Int32Array(sb, OFFSETS.LEDGER_HEAD_OFFSET, 1);
    ledgerDataView = new Int32Array(
      sb,
      OFFSETS.LEDGER_DATA_OFFSET,
      OFFSETS.MAX_LEDGER_EVENTS * 4,
    );

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
      const traceAtom = (idx: number, op: number, gx: number, gy: number, target: number) => {
        console.log(
          `   [WASM_TRACE] Atom ${idx} executed ${
            op.toString(16)
          } | Pos: (${gx},${gy}) | target: ${target}`,
        );
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
      resolve_bond_requests_fn = wasmInstance.exports
        .resolve_bond_requests as any;
      drain_spawn_requests_fn = wasmInstance.exports
        .drain_spawn_requests as any;
      clear_metabolism_stats_fn = wasmInstance.exports
        .clear_metabolism_stats as any;
      accumulate_metabolism_stats_fn = wasmInstance.exports
        .accumulate_metabolism_stats as any;
      apply_metabolism_kernel_fn = wasmInstance.exports
        .apply_metabolism_kernel as any;
      LOGGER.info("   [WORKER] WASM Instantiated successfully.");
      await maybeDelay();
      self.postMessage({ type: "READY" });
      const bview = new Int32Array(sb, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
      setInterval(() => {
        // console.log(`[WORKER BONDS VIEW] A2_0: ${bview[2 * 4]} A2_1: ${bview[2 * 4 + 1]}`);
      }, 5000);
      self.postMessage({ type: "INIT_OK", workerIndex: Number(workerIndex) });
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
    const { startIdx, endIdx, pulseId, theta } = e.data;
    currentPulseId = pulseId ?? 0;
    currentTheta = theta ?? 0;
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
        const beforeX11 = Atomics.load(xsView!, 11);
        execute_atom_fn(i);
        const afterX11 = Atomics.load(xsView!, 11);
        if (beforeX11 !== afterX11) {
          console.log(`[WASM_MUTATION_TRACE] execute_atom(${i}) changed xs[11] from ${beforeX11} to ${afterX11}`);
        }
        
        handle_syscall(i); // Process any syscall intent pending from the atom
        
        const afterSys11 = Atomics.load(xsView!, 11);
        if (afterX11 !== afterSys11) {
          console.log(`[JS_MUTATION_TRACE] handle_syscall(${i}) changed xs[11] from ${afterX11} to ${afterSys11}`);
        }
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
    const bH = new Int32Array(sharedBuffer!, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
    // console.log(`[PULSE_WORKER:TICK_MATRIX] TICK=${e.data.tick} BONDS: Atom 2 = [${bH[2*4]}, ${bH[2*4+1]}, ${bH[2*4+2]}, ${bH[2*4+3]}]`);
    if (tick_matrix_fn) tick_matrix_fn();
    await maybeDelay();
    self.postMessage({ type: "MATRIX_DONE", pulseId });
  }

  if (type === "TICK_ENVIRONMENT") {
    const bH = new Int32Array(sharedBuffer!, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
    console.log(`[PULSE_WORKER:TICK_ENV] TICK=${e.data.tick} BONDS: Atom 2 = [${bH[2*4]}, ${bH[2*4+1]}, ${bH[2*4+2]}, ${bH[2*4+3]}]`);
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
    const count = drain_spawn_requests_fn
      ? drain_spawn_requests_fn(e.data.tick)
      : 0;
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
    self.postMessage({
      type: "HASH_DONE",
      pulseId,
      overflowCount,
      maxCellCount,
    });
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
    if (accumulate_metabolism_stats_fn) {
      accumulate_metabolism_stats_fn(startIdx, endIdx);
    }
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
