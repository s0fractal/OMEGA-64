import { glyphTapeToPrettyText } from "../runtime_bridge/glyph_pretty.ts";
import {
  decodeLegacyInstruction,
  type GlyphTapeToken,
  scriptToGlyphTape,
} from "../runtime_bridge/opcode_to_glyph.ts";
import { glyphSpecById } from "../reduction_core/GlyphIR64.ts";
import { RISC, STATE_MATRIX, STRUCTURE, SYS } from "@00/STATE_MATRIX.ts";
import {
  REDUCTION_CASES,
  reductionCaseById,
  type ReductionCaseDefinition,
} from "./reduction_cases.ts";
import { goldenTraceArtifactPaths } from "./golden_trace_catalog.ts";
import { GENESIS_PROGRAMS } from "../reduction_core/GENESIS_BOOT.ts";

type HarnessProps = Record<number, number>;

type ShadowEffects = {
  replicateCount: number;
  signalCount: number;
  buildCount: number;
  bondRequestCount: number;
  sporeDriveCount: number;
  entangleCount: number;
  roleWrites: number[];
  branchTaken: boolean;
  jumpCount: number;
};

type ShadowState = {
  atomIndex: number;
  pc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;

  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  cellPeers: number[];
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  executed: string[];
  energySpent: number;
};

type LegacyShadowResult = {
  mode: "legacy";
  finalPc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;

  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  energySpent: number;
  executed: string[];
  stepsExecuted: number;
};

type ReductionShadowResult = {
  mode: "glyph-reduction";
  finalPc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;
  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  energySpent: number;
  executed: string[];
  stepsExecuted: number;
  glyphTape: GlyphTapeToken[];
  prettyTape: string;
};

type ReductionBaselineAnchor = {
  traceId: string;
  scenario: string;
  runtimeMode: string;
  tickStart: number;
  tickEnd: number;
  codexSnapshotDigest: string;
  invariantDigest: string;
};

export type ReductionHarnessResult = {
  caseId: string;
  baseline: ReductionBaselineAnchor;
  legacy: LegacyShadowResult;
  reduction: ReductionShadowResult;
  parity: {
    ok: boolean;
    reasons: string[];
  };
};

export type ReductionHarnessArtifact = {
  case_id: string;
  baseline_trace_id: string;
  baseline_runtime_mode: string;
  parity_ok: boolean;
  parity_reasons: string[];
  legacy_digest: string;
  reduction_digest: string;
  executed_digest_legacy: string;
  executed_digest_reduction: string;
  diff: {
    final_pc_match: boolean;
    registers_match: boolean;

    role_match: boolean;
    props_match: boolean;
    bond_targets_match: boolean;
    bond_distances_match: boolean;
    damping_match: boolean;
    peer_energy_match: boolean;
    peer_pc_match: boolean;
    hive_memory_match: boolean;
    hive_balance_match: boolean;
    signal_grid_match: boolean;
    structure_grid_match: boolean;
    structure_intent_owner_match: boolean;
    structure_intent_value_match: boolean;
    structure_charge_intent_match: boolean;
    bond_requests_match: boolean;
    hive_energy_pool_match: boolean;
    replicate_count_match: boolean;
    signal_count_match: boolean;
    build_count_match: boolean;
    branch_taken_match: boolean;
    role_writes_match: boolean;
    energy_spent_delta: number;
  };
  expectation_summary: ReductionCaseDefinition["expected"];
};

const REDUCTION_DIFF_ROOT = "verification/reduction_diffs";
const GRID_W = 140;
const GRID_H = 80;
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
  if ((ownerRaw & STRUCTURE_INTENT_LOCK_BIT) !== 0) {
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
  if ((current & STRUCTURE_INTENT_LOCK_BIT) !== 0) return;
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
    if (type === STRUCTURE.SOURCE) {
      cellVal = (cellVal & ~0x00FF0000) | (255 << 16);
      state.structureGrid[cellIdx] = cellVal;
    } else if (
      (type === STRUCTURE.WIRE || type === STRUCTURE.NODE ||
        type === STRUCTURE.CAPACITOR) &&
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
    case RISC.OP_NOP: {
      if (opcode === RISC.OP_NOP) {
        state.pc += 1;
        return;
      }
    }
    /* falls through */
    case RISC.OP_SET: {
      const reg = args[0] ?? 0;
      state.regs[reg] = args[1] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_GET: {
      if (isNative) {
        state.pc += 1; // Native 'I' is 1 byte/token
        return;
      }
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.regs[reg] = state.props[prop] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_PUT: {
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.props[prop] = state.regs[reg] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_ADD: {
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case RISC.OP_SUB: {
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case RISC.OP_JNZ: {
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
    case RISC.OP_JZ: {
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
    case RISC.OP_JMP: {
      state.effects.jumpCount += 1;
      state.pc = args[0] ?? 0;
      return;
    }
    case RISC.OP_REPLICATE: {
      state.effects.replicateCount += 1;
      state.pc += 1;
      return;
    }
    case RISC.OP_SIGNAL: {
      state.effects.signalCount += 1;
      state.pc += 1;
      return;
    }
    case RISC.OP_SHARE: {
      const slot = (args[0] ?? 0) & 3;
      let percentage = args[1] ?? 0;
      // HORMONE 2: aggression scales the share percentage
      const aggression = state.hormones[2] ?? 1024;
      if (aggression > 1024) {
        percentage += 10;
      }

      const targetIdx = state.bondTargets[slot] ?? 0;
      if (targetIdx > 0) {
        const energy = state.props[RISC.PROP_ENERGY] ?? 0;
        const amount = Math.trunc((energy * percentage) / 100);
        if (energy >= amount) {
          state.props[RISC.PROP_ENERGY] = energy - amount;
          state.peerEnergy[targetIdx] = (state.peerEnergy[targetIdx] ?? 0) +
            amount;
        }
      }
      state.pc += 3;
      return;
    }
    case RISC.OP_COLLECTIVE: {
      const mode = args[0] ?? 0;
      const p2 = args[1] ?? 0;
      const p3 = args[2] ?? 0;
      if (mode === 0) {
        state.hiveMemory[p2 & 1023] = p3 & 0xFF;
      } else if (mode === 1) {
        state.regs[p3 & 7] = state.hiveMemory[p2 & 1023] ?? 0;
      } else if (mode === 2) {
        const rx = state.props[RISC.PROP_X] ?? 0;
        const ry = state.props[RISC.PROP_Y] ?? 0;
        const gx = Math.floor(rx / 10);
        const gy = Math.floor(ry / 10);
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          state.signalGrid[gy * GRID_W + gx] = ((p2 & 0xFF) << 8) | (p3 & 0xFF);
        }
      } else if (mode === 3) {
        const val = p2 & 0xFF;
        const energy = state.props[RISC.PROP_ENERGY] ?? 0;
        if (energy >= val) {
          state.hiveBalance += val;
          state.props[RISC.PROP_ENERGY] = energy - val;
        }
      } else if (mode === 4) {
        const reg = p2 & 7;
        const balance = state.hiveBalance;
        const amount = balance > 100 ? 100 : balance;
        if (amount > 0) {
          state.hiveBalance -= amount;
          state.props[RISC.PROP_ENERGY] = (state.props[RISC.PROP_ENERGY] ?? 0) +
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
        const rx = state.props[RISC.PROP_X] ?? 0;
        const ry = state.props[RISC.PROP_Y] ?? 0;
        const gx = Math.floor(rx / 10);
        const gy = Math.floor(ry / 10);
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          state.signalGrid[gy * GRID_W + gx] = ((p2 & 0xFF) << 8) | (p3 & 0xFF);
        }
      }
      state.pc += 4;
      return;
    }
    case RISC.OP_ROLE: {
      const mode = args[0] ?? 0;
      const role = args[1] ?? 0;
      if (mode === 0) {
        state.role = role;
        state.effects.roleWrites.push(role);
      }
      state.pc += 3;
      return;
    }
    case RISC.OP_BUILD: {
      state.effects.buildCount += 1;
      if (state.role === STATE_MATRIX.ROLE_ARCHITECT) {
        const type = args[0] ?? 0;
        const buildState = args[1] ?? 0;
        const rx = state.props[RISC.PROP_X] ?? 0;
        const ry = state.props[RISC.PROP_Y] ?? 0;
        const resonance = state.props[RISC.PROP_RESONANCE] ?? 0;
        const dx = (resonance % 3) - 1;
        const dy = ((resonance * 7) % 3) - 1;
        const tx = Math.floor(rx / 10) + dx;
        const ty = Math.floor(ry / 10) + dy;
        if (tx >= 0 && tx < GRID_W && ty >= 0 && ty < GRID_H) {
          const cellIdx = ty * GRID_W + tx;
          const newVal = ((buildState & 0xFF) << 24) | (type & 0xFF);
          publishBuildIntent(state, cellIdx, state.atomIndex, newVal);
        }
      }
      state.pc += 3;
      return;
    }

    case RISC.OP_TENSEGRITY: {
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
    case RISC.OP_PLUG: {
      const targetType = args[0] ?? 0;
      const energyAmt = args[1] ?? 0;
      const r0 = state.regs[0] ?? 0;
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
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
    case RISC.OP_RESOLVE: {
      const mode = args[0] ?? 0;
      const value = args[1] ?? 0;

      // Neighborhood Quorum Check (r=1)
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
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
          state.props[RISC.PROP_RESONANCE] =
            (state.props[RISC.PROP_RESONANCE] ?? 0) + 20;
        }
      } else if (mode === 1) { // ENERGY BANKING
        const energy = state.props[RISC.PROP_ENERGY] ?? 0;
        if (count >= 3 && energy >= value) {
          // Deposit to hive energy pool
          const gene0 = state.regs[8] ?? 0; // Simplified genome pool slot calculation logic
          const slot = gene0 % 4; // Assuming SPAWN_MAX equivalent or similar logic
          state.props[RISC.PROP_ENERGY] = energy - value;
          state.hiveEnergyPool[slot] = (state.hiveEnergyPool[slot] ?? 0) +
            value;
          state.props[RISC.PROP_RESONANCE] =
            (state.props[RISC.PROP_RESONANCE] ?? 0) + 10;
        }
      }

      state.pc += 3;
      return;
    }
    case RISC.OP_SENSE: {
      const reg = args[0] ?? 0;
      const targetType = args[1] ?? 0;
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
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
    case RISC.OP_BIND: {
      state.effects.bondRequestCount += 1;
      const rx = state.props[RISC.PROP_X] ?? 0;
      const ry = state.props[RISC.PROP_Y] ?? 0;
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
        state.bondRequests[state.atomIndex * 3 + 0] = state.atomIndex + 1;
        state.bondRequests[state.atomIndex * 3 + 1] = nearestIdx + 1;
        state.bondRequests[state.atomIndex * 3 + 2] = 1; // PENDING
      }
      state.pc += 1;
      return;
    }
    case RISC.OP_SPORE_DRIVE: {
      state.effects.sporeDriveCount += 1;
      const energy = state.props[RISC.PROP_ENERGY] ?? 0;
      if (energy >= 500) {
        state.props[RISC.PROP_ENERGY] = energy - 500;
        // Pseudo-random jump for shadow model parity
        // In real WASM it uses LCG. Here we just mark as "moved".
        state.props[RISC.PROP_X] = (state.props[RISC.PROP_X] ?? 0) + 7;
        state.props[RISC.PROP_Y] = (state.props[RISC.PROP_Y] ?? 0) + 7;
      }
      state.pc += 1;
      return;
    }
    case RISC.OP_ENTANGLE: {
      state.effects.entangleCount += 1;
      const energy = state.props[RISC.PROP_ENERGY] ?? 0;
      // slot is derived from genomePoolSlot which needs logic bytes.
      // for harness, we'll use a simplified mapping or just slot 0.
      const slot = 0;
      if (energy > 500) {
        const deposit = Math.floor(energy / 10);
        state.props[RISC.PROP_ENERGY] = energy - deposit;
        state.hiveEnergyPool[slot] = (state.hiveEnergyPool[slot] ?? 0) +
          deposit;
      } else {
        let draw = 500 - energy;
        if (draw > 400) draw = 400;
        const pool = state.hiveEnergyPool[slot] ?? 0;
        const take = Math.min(pool, draw);
        state.hiveEnergyPool[slot] = pool - take;
        state.props[RISC.PROP_ENERGY] = energy + take;
      }
      state.pc += 1;
      return;
    }
    case RISC.OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS.SET_ROLE) {
        const role = state.regs[1] ?? 0;
        state.role = role;
        state.effects.roleWrites.push(role);
      }
      state.pc += 1;
      return;
    }
    default:
      throw new Error(
        `[reduction_harness] unsupported legacy opcode 0x${
          opcode.toString(16)
        }`,
      );
  }
};

const runLegacyShadow = (
  definition: ReductionCaseDefinition,
): LegacyShadowResult => {
  const state = createInitialState(definition);
  let stepsExecuted = 0;
  while (stepsExecuted < definition.maxSteps) {
    const decoded = decodeLegacyInstruction(definition.script, state.pc);
    if (!decoded || decoded.opcode === RISC.OP_NOP) break;
    state.executed.push(
      `pc=${decoded.pc} opcode=${decoded.opcodeMnemonic} args=[${
        decoded.args.join(",")
      }] R0=${state.regs[0]} R1=${state.regs[1]}`,
    );
    applyShadowOpcode(state, decoded.opcode, decoded.args, 0, false);
    stepsExecuted++;
  }
  if (definition.postStructureTick) {
    state.executed.push("post=structure_tick");
    flushStructureTick(state);
  }
  return snapshotLegacy(state, stepsExecuted);
};

const runReductionShadow = (
  definition: ReductionCaseDefinition,
): ReductionShadowResult => {
  let glyphTape: GlyphTapeToken[] = [];
  if (definition.nativeProgram && GENESIS_PROGRAMS[definition.nativeProgram]) {
    const bytecode = GENESIS_PROGRAMS[definition.nativeProgram];
    let i = 0;
    while (i < bytecode.length) {
      const id = bytecode[i];
      const spec = glyphSpecById(id);
      const arity = spec?.arity ?? 0;
      const pc = i;
      const args: number[] = [];
      for (let a = 0; a < arity; a++) {
        args.push(bytecode[i + 1 + a] ?? 0);
      }
      glyphTape.push({
        glyphId: id,
        glyphMnemonic: spec?.mnemonic ?? "UNKNOWN",
        mapped: true,
        opcode: spec?.legacyOpcode ?? id,
        opcodeMnemonic: spec?.mnemonic ?? "UNKNOWN",
        args,
        length: 1 + arity,
        pc,
      });
      i += 1 + arity;
    }
  } else {
    glyphTape = scriptToGlyphTape(definition.script);
  }
  const tokenByPc = new Map<number, GlyphTapeToken>(
    glyphTape.map((token) => [token.pc, token]),
  );
  const state = createInitialState(definition);
  let stepsExecuted = 0;

  while (stepsExecuted < definition.maxSteps) {
    const token = tokenByPc.get(state.pc);
    if (!token || token.opcode === RISC.OP_NOP || token.glyphId === 2) break;
    if (token.glyphId === null) {
      throw new Error(
        `[reduction_harness] unmapped glyph token at pc=${token.pc} for case=${definition.id}`,
      );
    }
    const spec = glyphSpecById(token.glyphId);
    if (!spec) {
      throw new Error(
        `[reduction_harness] missing glyph spec for id=${token.glyphId} case=${definition.id}`,
      );
    }
    state.executed.push(
      `pc=${token.pc} glyph=${spec.mnemonic}[${spec.id}] rule=${spec.reductionRuleRef}`,
    );
    applyShadowOpcode(
      state,
      token.opcode,
      token.args,
      spec.energyCost,
      !!definition.nativeProgram,
    );
    stepsExecuted++;
  }
  if (definition.postStructureTick) {
    state.executed.push("post=structure_tick");
    flushStructureTick(state);
  }

  if (definition.id.startsWith("rc22")) {
    console.log("REDUCTION EXECUTION TRACE:", state.executed);
    console.log(
      "REDUCTION TAPE TOKENS:",
      glyphTape.map((t) =>
        `pc=${t.pc} id=${t.glyphId} len=${t.length} op=${t.opcode}`
      ),
    );
  }
  return snapshotReduction(state, stepsExecuted, glyphTape);
};

const loadBaselineAnchor = async (
  traceId: string,
): Promise<ReductionBaselineAnchor> => {
  const { traceJson } = goldenTraceArtifactPaths(traceId);
  const parsed = JSON.parse(
    await Deno.readTextFile(traceJson),
  ) as Record<string, unknown>;
  return {
    traceId,
    scenario: String(parsed.scenario ?? traceId),
    runtimeMode: String(parsed.runtime_mode ?? "unknown"),
    tickStart: Number(parsed.tick_start ?? -1),
    tickEnd: Number(parsed.tick_end ?? -1),
    codexSnapshotDigest: String(parsed.codex_snapshot_digest ?? "missing"),
    invariantDigest: String(parsed.invariant_digest ?? "missing"),
  };
};

const compareResults = (
  definition: ReductionCaseDefinition,
  legacy: LegacyShadowResult,
  reduction: ReductionShadowResult,
): { ok: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  if (legacy.finalPc !== reduction.finalPc) {
    reasons.push(
      `finalPc mismatch legacy=${legacy.finalPc} reduction=${reduction.finalPc}`,
    );
  }
  if (!equalNumberArray(legacy.regs, reduction.regs)) {
    reasons.push("register vector mismatch");
  }
  if (legacy.role !== reduction.role) {
    reasons.push(
      `role mismatch legacy=${legacy.role} reduction=${reduction.role}`,
    );
  }
  if (!equalHarnessProps(legacy.props, reduction.props)) {
    reasons.push("props mismatch");
  }
  if (!equalHarnessProps(legacy.bondTargets, reduction.bondTargets)) {
    reasons.push("bondTargets mismatch");
  }
  if (!equalHarnessProps(legacy.bondTargets, reduction.bondTargets)) {
    reasons.push("bondTargets mismatch");
  }
  if (!equalHarnessProps(legacy.bondDistances, reduction.bondDistances)) {
    reasons.push("bondDistances mismatch");
  }
  if (legacy.damping !== reduction.damping) {
    reasons.push(
      `damping mismatch legacy=${legacy.damping} reduction=${reduction.damping}`,
    );
  }
  if (!equalHarnessProps(legacy.peerEnergy, reduction.peerEnergy)) {
    reasons.push("peerEnergy mismatch");
  }
  if (!equalHarnessProps(legacy.peerPc, reduction.peerPc)) {
    reasons.push("peerPc mismatch");
  }
  if (!equalHarnessProps(legacy.hiveMemory, reduction.hiveMemory)) {
    reasons.push("hiveMemory mismatch");
  }
  if (legacy.hiveBalance !== reduction.hiveBalance) {
    reasons.push("hiveBalance mismatch");
  }
  if (!equalHarnessProps(legacy.signalGrid, reduction.signalGrid)) {
    reasons.push("signalGrid mismatch");
  }
  if (!equalHarnessProps(legacy.structureGrid, reduction.structureGrid)) {
    reasons.push("structureGrid mismatch");
  }
  if (
    !equalHarnessProps(
      legacy.structureIntentOwner,
      reduction.structureIntentOwner,
    )
  ) {
    reasons.push("structureIntentOwner mismatch");
  }
  if (
    !equalHarnessProps(
      legacy.structureIntentValue,
      reduction.structureIntentValue,
    )
  ) {
    reasons.push("structureIntentValue mismatch");
  }
  if (
    !equalHarnessProps(
      legacy.structureChargeIntent,
      reduction.structureChargeIntent,
    )
  ) {
    reasons.push("structureChargeIntent mismatch");
  }
  if (!equalHarnessProps(legacy.bondRequests, reduction.bondRequests)) {
    reasons.push("bondRequests mismatch");
  }
  if (!equalHarnessProps(legacy.hiveEnergyPool, reduction.hiveEnergyPool)) {
    reasons.push("hiveEnergyPool mismatch");
  }
  if (!equalNumberArray(legacy.hormones, reduction.hormones)) {
    reasons.push("hormones mismatch");
  }
  if (legacy.effects.replicateCount !== reduction.effects.replicateCount) {
    reasons.push("replicateCount mismatch");
  }
  if (legacy.effects.signalCount !== reduction.effects.signalCount) {
    reasons.push("signalCount mismatch");
  }
  if (legacy.effects.buildCount !== reduction.effects.buildCount) {
    reasons.push("buildCount mismatch");
  }
  if (legacy.effects.branchTaken !== reduction.effects.branchTaken) {
    reasons.push("branchTaken mismatch");
  }
  if (legacy.effects.bondRequestCount !== reduction.effects.bondRequestCount) {
    reasons.push("bondRequestCount mismatch");
  }
  if (legacy.effects.sporeDriveCount !== reduction.effects.sporeDriveCount) {
    reasons.push("sporeDriveCount mismatch");
  }
  if (legacy.effects.entangleCount !== reduction.effects.entangleCount) {
    reasons.push("entangleCount mismatch");
  }
  if (
    !equalNumberArray(legacy.effects.roleWrites, reduction.effects.roleWrites)
  ) {
    reasons.push("roleWrites mismatch");
  }

  const expected = definition.expected;
  if (
    typeof expected.finalPc === "number" && legacy.finalPc !== expected.finalPc
  ) {
    reasons.push(`expected finalPc=${expected.finalPc} got=${legacy.finalPc}`);
  }
  if (
    typeof expected.replicateCount === "number" &&
    legacy.effects.replicateCount !== expected.replicateCount
  ) {
    reasons.push(
      `expected replicateCount=${expected.replicateCount} got=${legacy.effects.replicateCount}`,
    );
  }
  if (
    typeof expected.signalCount === "number" &&
    legacy.effects.signalCount !== expected.signalCount
  ) {
    reasons.push(
      `expected signalCount=${expected.signalCount} got=${legacy.effects.signalCount}`,
    );
  }
  if (
    typeof expected.buildCount === "number" &&
    legacy.effects.buildCount !== expected.buildCount
  ) {
    reasons.push(
      `expected buildCount=${expected.buildCount} got=${legacy.effects.buildCount}`,
    );
  }
  if (
    typeof expected.finalRole === "number" &&
    legacy.role !== expected.finalRole
  ) {
    reasons.push(`expected finalRole=${expected.finalRole} got=${legacy.role}`);
  }
  if (Array.isArray(expected.registers)) {
    for (let i = 0; i < expected.registers.length; i++) {
      if (legacy.regs[i] !== expected.registers[i]) {
        reasons.push(
          `expected registers mismatch at index ${i}: legacy=${
            legacy.regs[i]
          } pos=${i} vs expected=${expected.registers[i]}`,
        );
      }
    }
  }
  if (!equalNumberArray(legacy.regs, reduction.regs)) {
    reasons.push(
      `register vector mismatch: legacy=[${
        legacy.regs.slice(0, 4)
      }] reduction=[${reduction.regs.slice(0, 4)}]`,
    );
  }
  if (expected.finalProps) {
    for (const [key, value] of Object.entries(expected.finalProps)) {
      const prop = Number(key);
      if ((legacy.props[prop] ?? 0) !== value) {
        reasons.push(
          `expected prop[${prop}]=${value} got=${legacy.props[prop] ?? 0}`,
        );
      }
    }
  }
  if (expected.finalHiveMemory) {
    for (const [key, value] of Object.entries(expected.finalHiveMemory)) {
      const addr = Number(key);
      if ((legacy.hiveMemory[addr] ?? 0) !== value) {
        reasons.push(
          `expected hiveMemory[${addr}]=${value} got=${
            legacy.hiveMemory[addr] ?? 0
          }`,
        );
      }
    }
  }
  if (
    typeof expected.finalHiveBalance === "number" &&
    legacy.hiveBalance !== expected.finalHiveBalance
  ) {
    reasons.push(
      `expected hiveBalance=${expected.finalHiveBalance} got=${legacy.hiveBalance}`,
    );
  }
  if (expected.finalSignalGrid) {
    for (const [key, value] of Object.entries(expected.finalSignalGrid)) {
      const cell = Number(key);
      if ((legacy.signalGrid[cell] ?? 0) !== value) {
        reasons.push(
          `expected signalGrid[${cell}]=${value} got=${
            legacy.signalGrid[cell] ?? 0
          }`,
        );
      }
    }
  }

  if (expected.finalBondDistances) {
    for (const [key, value] of Object.entries(expected.finalBondDistances)) {
      const slot = Number(key);
      if ((legacy.bondDistances[slot] ?? 0) !== value) {
        reasons.push(
          `expected bondDistances[${slot}]=${value} got=${
            legacy.bondDistances[slot] ?? 0
          }`,
        );
      }
    }
  }
  if (
    typeof expected.finalDamping === "number" &&
    legacy.damping !== expected.finalDamping
  ) {
    reasons.push(
      `expected finalDamping=${expected.finalDamping} got=${legacy.damping}`,
    );
  }
  if (expected.finalPeerEnergy) {
    for (const [key, value] of Object.entries(expected.finalPeerEnergy)) {
      const peer = Number(key);
      if ((legacy.peerEnergy[peer] ?? 0) !== value) {
        reasons.push(
          `expected peerEnergy[${peer}]=${value} got=${
            legacy.peerEnergy[peer] ?? 0
          }`,
        );
      }
    }
  }
  if (expected.finalPeerPc) {
    for (const [key, value] of Object.entries(expected.finalPeerPc)) {
      const peer = Number(key);
      if ((legacy.peerPc[peer] ?? 0) !== value) {
        reasons.push(
          `expected peerPc[${peer}]=${value} got=${legacy.peerPc[peer] ?? 0}`,
        );
      }
    }
  }
  if (expected.finalStructureGrid) {
    for (const [key, value] of Object.entries(expected.finalStructureGrid)) {
      const cell = Number(key);
      if ((legacy.structureGrid[cell] ?? 0) !== value) {
        reasons.push(
          `expected structureGrid[${cell}]=${value} got=${
            legacy.structureGrid[cell] ?? 0
          }`,
        );
      }
    }
  }
  if (
    typeof expected.branchTaken === "boolean" &&
    legacy.effects.branchTaken !== expected.branchTaken
  ) {
    reasons.push(
      `expected branchTaken=${expected.branchTaken} got=${legacy.effects.branchTaken}`,
    );
  }
  if (expected.finalBondRequests) {
    for (const [key, value] of Object.entries(expected.finalBondRequests)) {
      const idx = Number(key);
      if ((legacy.bondRequests[idx] ?? 0) !== value) {
        reasons.push(
          `expected bondRequests[${idx}]=${value} got=${
            legacy.bondRequests[idx] ?? 0
          }`,
        );
      }
    }
  }
  if (expected.finalHiveEnergyPool) {
    for (const [key, value] of Object.entries(expected.finalHiveEnergyPool)) {
      const slot = Number(key);
      if ((legacy.hiveEnergyPool[slot] ?? 0) !== value) {
        reasons.push(
          `expected hiveEnergyPool[${slot}]=${value} got=${
            legacy.hiveEnergyPool[slot] ?? 0
          }`,
        );
      }
    }
  }

  if (
    expected.finalHormones &&
    !equalNumberArray(legacy.hormones, expected.finalHormones)
  ) {
    reasons.push("expected finalHormones mismatch");
  }
  return { ok: reasons.length === 0, reasons };
};

const artifactPathForCase = (caseId: string): string =>
  `${REDUCTION_DIFF_ROOT}/${caseId}.json`;

const buildReductionHarnessArtifact = async (
  definition: ReductionCaseDefinition,
  result: ReductionHarnessResult,
): Promise<ReductionHarnessArtifact> => ({
  case_id: result.caseId,
  baseline_trace_id: result.baseline.traceId,
  baseline_runtime_mode: result.baseline.runtimeMode,
  parity_ok: result.parity.ok,
  parity_reasons: [...result.parity.reasons],
  legacy_digest: await sha256Hex({
    finalPc: result.legacy.finalPc,
    regs: result.legacy.regs,
    role: result.legacy.role,
    props: result.legacy.props,
    bondTargets: result.legacy.bondTargets,

    bondDistances: result.legacy.bondDistances,
    damping: result.legacy.damping,
    peerEnergy: result.legacy.peerEnergy,
    peerPc: result.legacy.peerPc,
    hiveMemory: result.legacy.hiveMemory,
    hiveBalance: result.legacy.hiveBalance,
    signalGrid: result.legacy.signalGrid,
    structureGrid: result.legacy.structureGrid,
    structureIntentOwner: result.legacy.structureIntentOwner,
    structureIntentValue: result.legacy.structureIntentValue,
    structureChargeIntent: result.legacy.structureChargeIntent,
    bondRequests: result.legacy.bondRequests,
    hiveEnergyPool: result.legacy.hiveEnergyPool,
    effects: result.legacy.effects,
    energySpent: result.legacy.energySpent,
  }),
  reduction_digest: await sha256Hex({
    finalPc: result.reduction.finalPc,

    regs: result.reduction.regs,
    role: result.reduction.role,
    props: result.reduction.props,
    bondTargets: result.reduction.bondTargets,
    bondDistances: result.reduction.bondDistances,
    damping: result.reduction.damping,
    peerEnergy: result.reduction.peerEnergy,
    peerPc: result.reduction.peerPc,
    hiveMemory: result.reduction.hiveMemory,
    hiveBalance: result.reduction.hiveBalance,
    signalGrid: result.reduction.signalGrid,
    structureGrid: result.reduction.structureGrid,
    structureIntentOwner: result.reduction.structureIntentOwner,
    structureIntentValue: result.reduction.structureIntentValue,
    structureChargeIntent: result.reduction.structureChargeIntent,
    effects: result.reduction.effects,
    energySpent: result.reduction.energySpent,
  }),
  executed_digest_legacy: await sha256Hex(result.legacy.executed),
  executed_digest_reduction: await sha256Hex(result.reduction.executed),
  diff: {
    final_pc_match: result.legacy.finalPc === result.reduction.finalPc,
    registers_match: equalNumberArray(
      result.legacy.regs,
      result.reduction.regs,
    ),
    role_match: result.legacy.role === result.reduction.role,
    props_match: equalHarnessProps(result.legacy.props, result.reduction.props),
    bond_targets_match: equalHarnessProps(
      result.legacy.bondTargets,
      result.reduction.bondTargets,
    ),

    bond_distances_match: equalHarnessProps(
      result.legacy.bondDistances,
      result.reduction.bondDistances,
    ),
    damping_match: result.legacy.damping === result.reduction.damping,
    peer_energy_match: equalHarnessProps(
      result.legacy.peerEnergy,
      result.reduction.peerEnergy,
    ),
    peer_pc_match: equalHarnessProps(
      result.legacy.peerPc,
      result.reduction.peerPc,
    ),
    hive_memory_match: equalHarnessProps(
      result.legacy.hiveMemory,
      result.reduction.hiveMemory,
    ),
    hive_balance_match:
      result.legacy.hiveBalance === result.reduction.hiveBalance,
    signal_grid_match: equalHarnessProps(
      result.legacy.signalGrid,
      result.reduction.signalGrid,
    ),
    structure_grid_match: equalHarnessProps(
      result.legacy.structureGrid,
      result.reduction.structureGrid,
    ),
    structure_intent_owner_match: equalHarnessProps(
      result.legacy.structureIntentOwner,
      result.reduction.structureIntentOwner,
    ),
    structure_intent_value_match: equalHarnessProps(
      result.legacy.structureIntentValue,
      result.reduction.structureIntentValue,
    ),
    structure_charge_intent_match: equalHarnessProps(
      result.legacy.structureChargeIntent,
      result.reduction.structureChargeIntent,
    ),
    bond_requests_match: equalHarnessProps(
      result.legacy.bondRequests,
      result.reduction.bondRequests,
    ),
    hive_energy_pool_match: equalHarnessProps(
      result.legacy.hiveEnergyPool,
      result.reduction.hiveEnergyPool,
    ),
    replicate_count_match: result.legacy.effects.replicateCount ===
      result.reduction.effects.replicateCount,
    signal_count_match: result.legacy.effects.signalCount ===
      result.reduction.effects.signalCount,
    build_count_match:
      result.legacy.effects.buildCount === result.reduction.effects.buildCount,
    branch_taken_match: result.legacy.effects.branchTaken ===
      result.reduction.effects.branchTaken,
    role_writes_match: equalNumberArray(
      result.legacy.effects.roleWrites,
      result.reduction.effects.roleWrites,
    ),
    energy_spent_delta: result.reduction.energySpent -
      result.legacy.energySpent,
  },
  expectation_summary: definition.expected,
});

export const writeReductionHarnessArtifacts = async (
  results: ReductionHarnessResult[],
): Promise<string[]> => {
  await Deno.mkdir(REDUCTION_DIFF_ROOT, { recursive: true });
  const written: string[] = [];
  for (const result of results) {
    const definition = reductionCaseById(result.caseId);
    if (!definition) {
      throw new Error(
        `[reduction_harness] missing definition for artifact case ${result.caseId}`,
      );
    }
    const artifact = await buildReductionHarnessArtifact(definition, result);
    const path = artifactPathForCase(result.caseId);
    await Deno.writeTextFile(path, JSON.stringify(artifact, null, 2));
    written.push(path);
  }
  return written;
};

export const runReductionHarnessCase = async (
  caseId: string,
): Promise<ReductionHarnessResult> => {
  console.log("[runReductionHarnessCase] =>", caseId);
  const definition = reductionCaseById(caseId);
  if (!definition) {
    throw new Error(`[reduction_harness] unknown case id: ${caseId}`);
  }

  const [baseline, legacy, reduction] = await Promise.all([
    loadBaselineAnchor(definition.baselineTraceId),
    Promise.resolve(runLegacyShadow(definition)),
    Promise.resolve(runReductionShadow(definition)),
  ]);

  const result = {
    caseId,
    baseline,
    legacy,
    reduction,
    parity: compareResults(definition, legacy, reduction),
  };
  if (!result.parity.ok && caseId === "rc03_gt03_guardian_stable_branch") {
    console.log("LEGACY EXECUTION TRACE:", result.legacy.executed);
  }
  return result;
};

export const runReductionHarness = async (
  caseIds: string[] = REDUCTION_CASES.map((definition) => definition.id),
): Promise<ReductionHarnessResult[]> => {
  const results: ReductionHarnessResult[] = [];
  for (const caseId of caseIds) {
    results.push(await runReductionHarnessCase(caseId));
  }
  return results;
};

if (import.meta.main) {
  const caseIds = Deno.args.length > 0
    ? Deno.args
    : REDUCTION_CASES.map((caseDef) => caseDef.id);
  const results = await runReductionHarness(caseIds);
  await writeReductionHarnessArtifacts(results);
  for (const result of results) {
    console.log(
      `[reduction_harness] case=${result.caseId} baseline=${result.baseline.traceId} parity=${
        result.parity.ok ? "OK" : "FAIL"
      } steps=${result.legacy.stepsExecuted} glyphs=${result.reduction.glyphTape.length}`,
    );
    if (!result.parity.ok) {
      console.log(`  reasons=${result.parity.reasons.join(" | ")}`);
    }
  }
}
