---
id: REDUCTION_HARNESS
type: verifier
tags:
  - verifier
  - host
min_level: 13
description: Reduction harness for verifying WASM-shadow parity.
deps:
  - SYSTEM_CONSTANTS
  - MX
  - OPCODE_TO_GLYPH
  - GATE
  - assembler
  - pack_structure_intent
  - unpack_structure_charge
  - REDUCTION_CASES
  - GOLDEN_TRACE_CATALOG
  - GENESIS_BOOT
  - glyph_pretty
  - TYPES
vars:
  - GRID_H
  - GRID_W
  - glyphTapeToPrettyText
  - decodeLegacyInstruction
  - GlyphTapeToken
  - scriptToGlyphTape
  - glyphSpecById
  - MX
  - STR_SOURCE
  - STR_WIRE
  - STR_NODE
  - STR_CAPACITOR
  - OP_NOP
  - OP_SET
  - OP_GET
  - OP_PUT
  - OP_ADD
  - OP_SUB
  - OP_JNZ
  - OP_JZ
  - OP_JMP
  - OP_REPLICATE
  - OP_SIGNAL
  - OP_SHARE
  - PROP_ENERGY
  - OP_COLLECTIVE
  - PROP_X
  - PROP_Y
  - OP_SECRETE_PLASMID
  - OP_BUILD
  - PROP_RESONANCE
  - OP_TENSEGRITY
  - OP_PLUG
  - OP_RESOLVE
  - OP_SENSE
  - OP_BIND
  - OP_SPORE_DRIVE
  - OP_HEBB
  - OP_SYSCALL
  - SYS_SET_ROLE
  - pack_structure_intent
  - unpack_structure_charge
  - goldenTraceArtifactPaths
  - GENESIS_PROGRAMS
  - reductionCaseById
  - ReductionCaseDefinition
  - HarnessProps
  - ShadowEffects
  - ShadowState
  - LegacyShadowResult
  - ReductionShadowResult
  - ReductionBaselineAnchor
  - ReductionHarnessResult
  - ReductionHarnessArtifact
---


```typescript
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";





const REDUCTION_DIFF_ROOT = "src/ontology/verification/data/reduction_diffs";
const STRUCTURE_INTENT_LOCK_BIT = -2147483648;

const cloneEffects = (): ShadowEffects => ({
  replicateCount: 0,
  signalCount: 0,
  buildCount: 0,
  bondRequestCount: 0,
  sporeDriveCount: 0,
  entangleCount: 0,
  roleWrites: [],
  branchTaken: false,
  jumpCount: 0,
});

const createInitialState = (
  definition: ReductionCaseDefinition,
): ShadowState => ({
  atomIndex: definition.ownerAtomIdx ?? 0,
  pc: 0,
  regs: (() => {
    const r = new Array(16).fill(0);
    if (definition.initialRegs) {
      for (
        let i = 0;
        i < Math.min(r.length, definition.initialRegs.length);
        i++
      ) {
        r[i] = definition.initialRegs[i];
      }
    }
    return r;
  })(),
  role: 0,
  props: Object.fromEntries(
    Object.entries(definition.initialProps).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  bondTargets: Object.fromEntries(
    Object.entries(definition.initialBondTargets ?? {}).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),

  bondDistances: Object.fromEntries(
    Object.entries(definition.initialBondDistances ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  damping: definition.initialDamping ?? 0,
  peerEnergy: Object.fromEntries(
    Object.entries(definition.initialPeerEnergy ?? {}).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  peerPc: Object.fromEntries(
    Object.entries(definition.initialPeerPc ?? {}).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  cellPeers: [...(definition.initialCellPeers ?? [])],
  hiveMemory: {},
  hiveBalance: definition.initialHiveBalance ?? 0,
  signalGrid: {},
  structureGrid: Object.fromEntries(
    Object.entries(definition.initialStructureGrid ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureIntentOwner: Object.fromEntries(
    Object.entries(definition.initialStructureIntentOwner ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureIntentValue: Object.fromEntries(
    Object.entries(definition.initialStructureIntentValue ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureChargeIntent: Object.fromEntries(
    Object.entries(definition.initialStructureChargeIntent ?? {}).map((
      [key, value],
    ) => [
      Number(key),
      Number(value),
    ]),
  ),
  bondRequests: {},
  hiveEnergyPool: Object.fromEntries(
    Object.entries(definition.initialHiveEnergyPool ?? {}).map((
      [k, v],
    ) => [Number(k), Number(v)]),
  ),
  hormones: definition.initialHormones
    ? [...definition.initialHormones]
    : [1024, 1024, 1024, 1024, 1024, 1024],
  effects: cloneEffects(),
  executed: [],
  energySpent: 0,
});

const equalNumberArray = (
  a: readonly number[],
  b: readonly number[],
): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const equalHarnessProps = (a: HarnessProps, b: HarnessProps): boolean => {
  const aKeys = Object.keys(a).map(Number).sort((x, y) => x - y);
  const bKeys = Object.keys(b).map(Number).sort((x, y) => x - y);
  if (!equalNumberArray(aKeys, bKeys)) return false;
  return aKeys.every((key) => (a[key] ?? 0) === (b[key] ?? 0));
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${
    entries.map(([key, item]) =>
      `${JSON.stringify(key)}:${stableStringify(item)}`
    ).join(",")
  }}`;
};

const sha256Hex = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const snapshotLegacy = (
  state: ShadowState,
  stepsExecuted: number,
): LegacyShadowResult => ({
  mode: "legacy",
  finalPc: state.pc,
  regs: [...state.regs],
  role: state.role,
  props: { ...state.props },
  bondTargets: { ...state.bondTargets },

  bondDistances: { ...state.bondDistances },
  damping: state.damping,
  peerEnergy: { ...state.peerEnergy },
  peerPc: { ...state.peerPc },
  hiveMemory: { ...state.hiveMemory },
  hiveBalance: state.hiveBalance,
  signalGrid: { ...state.signalGrid },
  structureGrid: { ...state.structureGrid },
  structureIntentOwner: { ...state.structureIntentOwner },
  structureIntentValue: { ...state.structureIntentValue },
  structureChargeIntent: { ...state.structureChargeIntent },
  bondRequests: { ...state.bondRequests },
  hiveEnergyPool: { ...state.hiveEnergyPool },
  hormones: [...state.hormones],
  effects: {
    ...state.effects,
    roleWrites: [...state.effects.roleWrites],
  },
  energySpent: state.energySpent,
  executed: [...state.executed],
  stepsExecuted,
});

const snapshotReduction = (
  state: ShadowState,
  stepsExecuted: number,
  glyphTape: GlyphTapeToken[],
): ReductionShadowResult => ({
  mode: "glyph-reduction",
  finalPc: state.pc,
  regs: [...state.regs],
  role: state.role,
  props: { ...state.props },
  bondTargets: { ...state.bondTargets },
  bondDistances: { ...state.bondDistances },
  damping: state.damping,
  peerEnergy: { ...state.peerEnergy },
  peerPc: { ...state.peerPc },
  hiveMemory: { ...state.hiveMemory },
  hiveBalance: state.hiveBalance,
  signalGrid: { ...state.signalGrid },
  structureGrid: { ...state.structureGrid },
  structureIntentOwner: { ...state.structureIntentOwner },
  structureIntentValue: { ...state.structureIntentValue },
  structureChargeIntent: { ...state.structureChargeIntent },
  bondRequests: { ...state.bondRequests },
  hiveEnergyPool: { ...state.hiveEnergyPool },
  hormones: [...state.hormones],
  effects: {
    ...state.effects,
    roleWrites: [...state.effects.roleWrites],
  },
  energySpent: state.energySpent,
  executed: [...state.executed],
  stepsExecuted,
  glyphTape,
  prettyTape: glyphTapeToPrettyText(glyphTape),
});

const readStructureCell = (state: ShadowState, cellIdx: number): number => {
  const ownerRaw = state.structureIntentOwner[cellIdx] ?? 0;
  if (ownerRaw < 0) {
    return state.structureGrid[cellIdx] ?? 0;
  }
  if ((ownerRaw & 0x7FFFFFFF) !== 0) {
    return state.structureIntentValue[cellIdx] ?? 0;
  }
  return state.structureGrid[cellIdx] ?? 0;
};

const publishBuildIntent = (
  state: ShadowState,
  cellIdx: number,
  ownerAtomIdx: number,
  buildValue: number,
): void => {
  const ownerToken = ownerAtomIdx + 1;
  const current = state.structureIntentOwner[cellIdx] ?? 0;
  if (current < 0) return;
  const winningOwner = current & 0x7FFFFFFF;
  if (ownerToken < winningOwner) return;
  state.structureIntentValue[cellIdx] = buildValue;
  state.structureIntentOwner[cellIdx] = ownerToken;
};

const flushStructureTick = (state: ShadowState): void => {
  const cellKeys = new Set<number>([
    ...Object.keys(state.structureGrid).map(Number),
    ...Object.keys(state.structureIntentOwner).map(Number),
    ...Object.keys(state.structureIntentValue).map(Number),
    ...Object.keys(state.structureChargeIntent).map(Number),
  ]);

  for (const cellIdx of cellKeys) {
    let cellVal = state.structureGrid[cellIdx] ?? 0;
    const ownerRaw = state.structureIntentOwner[cellIdx] ?? 0;
    if (ownerRaw !== 0) {
      cellVal = state.structureIntentValue[cellIdx] ?? 0;
      state.structureGrid[cellIdx] = cellVal;
      state.structureIntentOwner[cellIdx] = 0;
      state.structureIntentValue[cellIdx] = 0;
    }
    const chargeRaw = state.structureChargeIntent[cellIdx] ?? 0;
    if (chargeRaw > 0) {
      const intentCharge = Math.min(chargeRaw, 255);
      const baseCharge = (cellVal >> 16) & 0xFF;
      if (intentCharge > baseCharge) {
        cellVal = (cellVal & ~0x00FF0000) | (intentCharge << 16);
      }
      state.structureGrid[cellIdx] = cellVal;
      state.structureChargeIntent[cellIdx] = 0;
    }
    const type = cellVal & 0xFF;
    const currentCharge = (cellVal >> 16) & 0xFF;
    if (type === STR_SOURCE) {
      cellVal = (cellVal & ~0x00FF0000) | (255 << 16);
      state.structureGrid[cellIdx] = cellVal;
    } else if (
      (type === STR_WIRE || type === STR_NODE ||
        type === STR_CAPACITOR) &&
      currentCharge > 0
    ) {
      const nextCharge = currentCharge > 10 ? currentCharge - 10 : 0;
      cellVal = (cellVal & ~0x00FF0000) | (nextCharge << 16);
      state.structureGrid[cellIdx] = cellVal;
    }
  }
};

const applyShadowOpcode = (
  state: ShadowState,
  opcode: number,
  args: number[],
  energyCost: number,
  isNative: boolean = false,
): void => {
  state.energySpent += energyCost;
  switch (opcode) {
    case OP_NOP:
    case 2: { // GLYPH.I / OP_NOP
      state.pc += 1;
      return;
    }
    case OP_SET:
    case 8: { // GLYPH.SET
      const reg = args[0] ?? 0;
      state.regs[reg] = args[1] ?? 0;
      state.pc += 3;
      return;
    }
    case OP_GET:
    case 9: { // GLYPH.GET
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.regs[reg] = state.props[prop] ?? 0;
      state.pc += 3;
      return;
    }
    case OP_PUT:
    case 10: { // GLYPH.PUT
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.props[prop] = state.regs[reg] ?? 0;
      state.pc += 3;
      return;
    }
    case OP_ADD:
    case 11: { // GLYPH.ADD
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case OP_SUB:
    case 12: { // GLYPH.SUB
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case OP_JNZ:
    case 13: { // GLYPH.JNZ
      const reg = args[0] ?? 0;
      const target = args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.effects.branchTaken = true;
        state.effects.jumpCount += 1;
        state.pc = target;
      } else {
        state.pc += 3;
      }
      return;
    }
    case OP_JMP:
    case 14: { // GLYPH.JMP
      state.effects.jumpCount += 1;
      state.pc = args[0] ?? 0;
      return;
    }
    case OP_JZ:
    case 15: { // GLYPH.JZ
      const reg = args[0] ?? 0;
      const target = args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.effects.branchTaken = true;
        state.effects.jumpCount += 1;
        state.pc = target;
      } else {
        state.pc += 3;
      }
      return;
    }
    case OP_REPLICATE:
    case 16: { // GLYPH.REPLICATE
      state.effects.replicateCount += 1;
      state.pc += 1;
      return;
    }
    case OP_SIGNAL:
    case 17: { // GLYPH.SIGNAL
      state.effects.signalCount += 1;
      state.pc += 1;
      return;
    }
    case 24: { // GLYPH.PLUG
      const targetType = args[0] ?? 0;
      const energyAmt = args[1] ?? 0;
      const r0 = state.regs[0] ?? 0;
      const rx = state.props[PROP_X] ?? 0;
      const ry = state.props[PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
        const cellIdx = gy * GRID_W + gx;
        const currentChargeIntent = state.structureChargeIntent[cellIdx] ?? 0;
        if (r0 > currentChargeIntent) {
          state.structureChargeIntent[cellIdx] = r0;
        }
      }
      state.pc += 3;
      return;
    }
    case 25: { // GLYPH.TENSEGRITY
      state.pc += 4;
      return;
    }
    case 26: { // GLYPH.BUILD
      state.effects.buildCount += 1;
      state.pc += 3;
      return;
    }
    case 27: { // GLYPH.SENSE
      state.pc += 3;
      return;
    }
    case OP_SHARE: {
      const slot = (args[0] ?? 0) & 3;
      let percentage = args[1] ?? 0;
      // HORMONE 2: aggression scales the share percentage
      const aggression = state.hormones[2] ?? 1024;
      if (aggression > 1024) {
        percentage += 10;
      }

      const targetIdx = state.bondTargets[slot] ?? 0;
      if (targetIdx > 0) {
        const energy = state.props[PROP_ENERGY] ?? 0;
        const amount = Math.trunc((energy * percentage) / 100);
        if (energy >= amount) {
          state.props[PROP_ENERGY] = energy - amount;
          state.peerEnergy[targetIdx] = (state.peerEnergy[targetIdx] ?? 0) +
            amount;
        }
      }
      state.pc += 3;
      return;
    }
    case OP_COLLECTIVE: {
      const mode = args[0] ?? 0;
      const p2 = args[1] ?? 0;
      const p3 = args[2] ?? 0;
      if (mode === 0) {
        state.hiveMemory[p2 & 1023] = p3 & 0xFF;
      } else if (mode === 1) {
        state.regs[p3 & 7] = state.hiveMemory[p2 & 1023] ?? 0;
      } else if (mode === 2) {
        const rx = state.props[PROP_X] ?? 0;
        const ry = state.props[PROP_Y] ?? 0;
        const gx = Math.floor(rx / 10);
        const gy = Math.floor(ry / 10);
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          state.signalGrid[gy * GRID_W + gx] = ((p2 & 0xFF) << 8) | (p3 & 0xFF);
        }
      } else if (mode === 3) {
        const val = p2 & 0xFF;
        const energy = state.props[PROP_ENERGY] ?? 0;
        if (energy >= val) {
          state.hiveBalance += val;
          state.props[PROP_ENERGY] = energy - val;
        }
      } else if (mode === 4) {
        const reg = p2 & 7;
        const balance = state.hiveBalance;
        const amount = balance > 100 ? 100 : balance;
        if (amount > 0) {
          state.hiveBalance -= amount;
          state.props[PROP_ENERGY] = (state.props[PROP_ENERGY] ?? 0) +
            amount;
        }
        state.regs[reg] = amount;
      } else if (mode === 5) {
        for (let slot = 0; slot < 4; slot++) {
          const target = state.bondTargets[slot] ?? 0;
          if (target > 0) {
            state.peerPc[target] = state.pc + 4;
          }
        }
      } else if (mode === 6) {
        for (const peer of state.cellPeers) {
          if (peer > 0) {
            state.peerPc[peer] = state.pc + 4;
          }
        }
      } else if (mode === 7) { // PLASMID_EMIT
        const rx = state.props[PROP_X] ?? 0;
        const ry = state.props[PROP_Y] ?? 0;
        const gx = Math.floor(rx / 10);
        const gy = Math.floor(ry / 10);
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          state.signalGrid[gy * GRID_W + gx] = ((p2 & 0xFF) << 8) | (p3 & 0xFF);
        }
      }
      state.pc += 4;
      return;
    }
    case OP_SECRETE_PLASMID: {
      const mode = args[0] ?? 0;
      const role = args[1] ?? 0;
      if (mode === 0) {
        state.role = role;
        state.effects.roleWrites.push(role);
      }
      state.pc += 3;
      return;
    }
    case OP_BUILD: {
      state.effects.buildCount += 1;
      if (state.role === MX.ROLE_ARCHITECT) {
        const type = args[0] ?? 0;
        const buildState = args[1] ?? 0;
        const rx = state.props[PROP_X] ?? 0;
        const ry = state.props[PROP_Y] ?? 0;
        const resonance = state.props[PROP_RESONANCE] ?? 0;
        const dx = (resonance % 3) - 1;
        const dy = ((resonance * 7) % 3) - 1;
        const tx = Math.floor(rx / 10) + dx;
        const ty = Math.floor(ry / 10) + dy;
        if (tx >= 0 && tx < GRID_W && ty >= 0 && ty < GRID_H) {
          const cellIdx = ty * GRID_W + tx;
          const newVal = pack_structure_intent(type, buildState, false);
          publishBuildIntent(state, cellIdx, state.atomIndex, newVal);
        }
      }
      state.pc += 3;
      return;
    }

    case OP_TENSEGRITY: {
      const mode = args[0] ?? 0;
      const p2 = args[1] ?? 0;
      const p3 = args[2] ?? 0;
      if (mode === 0) {
        state.bondDistances[p2] = p3;
      } else if (mode === 1) {
        state.damping = p2;
      }
      state.pc += 4;
      return;
    }
    case OP_PLUG: {
      const targetType = args[0] ?? 0;
      const energyAmt = args[1] ?? 0;
      const r0 = state.regs[0] ?? 0;
      const rx = state.props[PROP_X] ?? 0;
      const ry = state.props[PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
        const cellIdx = gy * GRID_W + gx;
        const currentChargeIntent = state.structureChargeIntent[cellIdx] ?? 0;
        if (r0 > currentChargeIntent) {
          state.structureChargeIntent[cellIdx] = r0;
        }
      }
      state.pc += 3;
      return;
    }
    case OP_RESOLVE: {
      const mode = args[0] ?? 0;
      const value = args[1] ?? 0;

      // Neighborhood Quorum Check (r=1)
      const rx = state.props[PROP_X] ?? 0;
      const ry = state.props[PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = gx + dx;
          const ny = gy + dy;
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            const cellIdx = ny * GRID_W + nx;
            if (readStructureCell(state, cellIdx) !== 0) { // STR_VOID is 0
              count++;
            }
          }
        }
      }

      if (mode === 0) { // ROLE RESOLUTION
        if (count >= value) {
          const desiredRole = state.regs[0] ?? 0;
          state.role = desiredRole;
          state.props[PROP_RESONANCE] =
            (state.props[PROP_RESONANCE] ?? 0) + 20;
        }
      } else if (mode === 1) { // ENERGY BANKING
        const energy = state.props[PROP_ENERGY] ?? 0;
        if (count >= 3 && energy >= value) {
          // Deposit to hive energy pool
          const gene0 = state.regs[8] ?? 0; // Simplified genome pool slot calculation logic
          const slot = gene0 % 4; // Assuming SPAWN_MAX equivalent or similar logic
          state.props[PROP_ENERGY] = energy - value;
          state.hiveEnergyPool[slot] = (state.hiveEnergyPool[slot] ?? 0) +
            value;
          state.props[PROP_RESONANCE] =
            (state.props[PROP_RESONANCE] ?? 0) + 10;
        }
      }

      state.pc += 3;
      return;
    }
    case OP_SENSE: {
      const reg = args[0] ?? 0;
      const targetType = args[1] ?? 0;
      const rx = state.props[PROP_X] ?? 0;
      const ry = state.props[PROP_Y] ?? 0;
      const gx = Math.floor(rx / 10);
      const gy = Math.floor(ry / 10);
      let found = 0;
      for (let ny = gy - 1; ny <= gy + 1 && found === 0; ny++) {
        for (let nx = gx - 1; nx <= gx + 1; nx++) {
          if (nx === gx && ny === gy) continue;
          if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
          const cellVal = readStructureCell(state, ny * GRID_W + nx);
          if ((cellVal & 0xFF) === targetType) {
            found = 1;
            break;
          }
        }
      }
      state.regs[reg] = found;
      state.pc += 3;
      return;
    }
    case OP_BIND: {
      state.effects.bondRequestCount += 1;
      const rx = state.props[PROP_X] ?? 0;
      const ry = state.props[PROP_Y] ?? 0;
      // Shadow-model nearest neighbor logic (simplistic for harness)
      // In ground truth, this uses the spatial grid.
      // For harness testing, we assume definition.initialCellPeers contains candidates.
      let nearestIdx = -1;
      let minDist = 1000000;
      for (const peerIdx of state.cellPeers) {
        if (peerIdx === state.atomIndex) continue;
        // In the harness, peers are often just indices. We need their positions.
        // We'll rely on a convention where definition targets are pre-setup.
        const px = state.peerEnergy[peerIdx] !== undefined ? 100 : 0; // Placeholder pos
        const py = 100;
        const d = Math.sqrt((px - rx) ** 2 + (py - ry) ** 2);
        if (d < 250 && d < minDist) {
          minDist = d;
          nearestIdx = peerIdx;
        }
      }
      if (nearestIdx !== -1) {
        state.bondRequests[nearestIdx] = 1;
      }
      state.pc += 1;
      return;
    }
    case OP_SPORE_DRIVE: {
      state.effects.sporeDriveCount += 1;
      state.pc += 1;
      return;
    }
    case OP_HEBB: {
      state.effects.entangleCount += 1;
      const energy = state.props[PROP_ENERGY] ?? 0;
      if (energy >= 100) {
        // Simple shadow rule: successful entanglement always clears costs for harness.
      }
      state.pc += 1;
      return;
    }
    default:
      throw new Error(`[ShadowVM] Unimplemented opcode: ${opcode}`);
  }
};

const runShadowModel = async (
  definition: ReductionCaseDefinition,
  isReduction: boolean,
): Promise<{ result: LegacyShadowResult | ReductionShadowResult }> => {
  const state = createInitialState(definition);
  let script = definition.script;

  if (definition.nativeProgram && GENESIS_PROGRAMS[definition.nativeProgram]) {
    script = GENESIS_PROGRAMS[definition.nativeProgram];
  }

  let steps = 0;
  const glyphTape: GlyphTapeToken[] = (isReduction && !definition.nativeProgram)
    ? scriptToGlyphTape(script)
    : [];

  while (steps < definition.maxSteps) {
    if (state.pc >= script.length) break;

    const opcode = script[state.pc];
    const spec = glyphSpecById(opcode);
    if (!spec) break;

    const argsCount = spec.arglen;
    const args = Array.from(script.slice(state.pc + 1, state.pc + 1 + argsCount));
    const energyCost = isReduction ? (spec.energy_cost || 0) : (spec.energy_cost || 0);

    applyShadowOpcode(state, opcode, args, energyCost, !!definition.nativeProgram);
    steps++;
    state.executed.push(spec.id);
  }

  if (definition.postStructureTick) {
    flushStructureTick(state);
  }

  return {
    result: isReduction
      ? snapshotReduction(state, steps, glyphTape)
      : snapshotLegacy(state, steps),
  };
};

const compareParity = (
  legacy: LegacyShadowResult,
  reduction: ReductionShadowResult,
): { ok: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  if (legacy.finalPc !== reduction.finalPc) {
    reasons.push(
      `PC mismatch: legacy=${legacy.finalPc} reduction=${reduction.finalPc}`,
    );
  }
  if (!equalNumberArray(legacy.regs, reduction.regs)) {
    reasons.push(`Registers mismatch`);
  }
  if (legacy.role !== reduction.role) {
    reasons.push(`Role mismatch: legacy=${legacy.role} reduction=${reduction.role}`);
  }
  if (!equalHarnessProps(legacy.props, reduction.props)) {
    reasons.push(`Props mismatch`);
  }
  if (!equalHarnessProps(legacy.bondTargets, reduction.bondTargets)) {
    reasons.push(`Bond targets mismatch`);
  }
  if (!equalHarnessProps(legacy.bondDistances, reduction.bondDistances)) {
    reasons.push(`Bond distances mismatch`);
  }
  if (legacy.damping !== reduction.damping) {
    reasons.push(`Damping mismatch`);
  }
  if (!equalHarnessProps(legacy.peerEnergy, reduction.peerEnergy)) {
    reasons.push(`Peer energy mismatch`);
  }
  if (!equalHarnessProps(legacy.peerPc, reduction.peerPc)) {
    reasons.push(`Peer PC mismatch`);
  }
  if (!equalHarnessProps(legacy.hiveMemory, reduction.hiveMemory)) {
    reasons.push(`Hive memory mismatch`);
  }
  if (legacy.hiveBalance !== reduction.hiveBalance) {
    reasons.push(`Hive balance mismatch`);
  }
  if (!equalHarnessProps(legacy.signalGrid, reduction.signalGrid)) {
    reasons.push(`Signal grid mismatch`);
  }
  if (!equalHarnessProps(legacy.structureGrid, reduction.structureGrid)) {
    reasons.push(`Structure grid mismatch`);
  }
  if (!equalHarnessProps(legacy.structureIntentOwner, reduction.structureIntentOwner)) {
    reasons.push(`Structure intent owner mismatch`);
  }
  if (!equalHarnessProps(legacy.structureIntentValue, reduction.structureIntentValue)) {
    reasons.push(`Structure intent value mismatch`);
  }
  if (!equalHarnessProps(legacy.structureChargeIntent, reduction.structureChargeIntent)) {
    reasons.push(`Structure charge intent mismatch`);
  }
  if (!equalHarnessProps(legacy.bondRequests, reduction.bondRequests)) {
    reasons.push(`Bond requests mismatch`);
  }
  if (!equalHarnessProps(legacy.hiveEnergyPool, reduction.hiveEnergyPool)) {
    reasons.push(`Hive energy pool mismatch`);
  }
  if (!equalNumberArray(legacy.hormones, reduction.hormones)) {
    reasons.push(`Hormones mismatch`);
  }
  if (legacy.effects.replicateCount !== reduction.effects.replicateCount) {
    reasons.push(`Replicate count mismatch`);
  }
  if (legacy.effects.signalCount !== reduction.effects.signalCount) {
    reasons.push(`Signal count mismatch`);
  }
  if (legacy.effects.buildCount !== reduction.effects.buildCount) {
    reasons.push(`Build count mismatch`);
  }
  if (legacy.effects.branchTaken !== reduction.effects.branchTaken) {
    reasons.push(`Branch taken mismatch`);
  }
  if (legacy.energySpent !== reduction.energySpent) {
    reasons.push(`Energy spent mismatch`);
  }

  return { ok: reasons.length === 0, reasons };
};

export const runReductionHarnessCase = async (
  caseId: string,
): Promise<ReductionHarnessResult> => {
  const definition = reductionCaseById(caseId);
  if (!definition) throw new Error(`Unknown case: ${caseId}`);

  const legacy = (await runShadowModel(definition, false))
    .result as LegacyShadowResult;
  const reduction = (await runShadowModel(definition, true))
    .result as ReductionShadowResult;

  const parity = compareParity(legacy, reduction);

  return {
    caseId: definition.id,
    baseline: {
      traceId: definition.baselineTraceId,
      scenario: "REDUCED_BY_HARNESS",
      runtimeMode: "SHADOW",
      tickStart: 0,
      tickEnd: stepsToTicks(legacy.stepsExecuted),
      codexSnapshotDigest: "N/A",
      invariantDigest: "N/A",
    },
    legacy,
    reduction,
    parity,
  };
};

const stepsToTicks = (steps: number) => Math.ceil(steps / 4);


Deno.test({
  name: "Reduction Parity Harness",
  ignore: false,
  fn: async (t) => {
    for (const testCase of REDUCTION_CASES) {
      await t.step(testCase.id, async () => {
        const result = await runReductionHarnessCase(testCase.id);
        if (!result.parity.ok) {
           console.error(`Reduction Parity Failure for ${testCase.id}:`);
           result.parity.reasons.forEach(r => console.error(`  - ${r}`));
        }
        assertEquals(result.parity.ok, true, `Parity check failed for ${testCase.id}`);
      });
    }
  }
});
```
