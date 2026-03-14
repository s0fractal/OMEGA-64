import { GRID_H, GRID_W } from "../../_/mod.ts";
import { glyphTapeToPrettyText } from "@07/04/glyph_pretty.ts";
import {
  decodeLegacyInstruction,
  type GlyphTapeToken,
  scriptToGlyphTape,
} from "@07/04/opcode_to_glyph.ts";
import { glyphSpecById } from "@07/04/mod.ts";
import { STATE_MATRIX, STR_SOURCE, STR_WIRE, STR_NODE, STR_CAPACITOR, OP_NOP, OP_SET, OP_GET, OP_PUT, OP_ADD, OP_SUB, OP_JNZ, OP_JZ, OP_JMP, OP_REPLICATE, OP_SIGNAL, OP_SHARE, PROP_ENERGY, OP_COLLECTIVE, PROP_X, PROP_Y, OP_SECRETE_PLASMID, OP_BUILD, PROP_RESONANCE, OP_TENSEGRITY, OP_PLUG, OP_RESOLVE, OP_SENSE, OP_BIND, OP_SPORE_DRIVE, OP_HEBB, OP_SYSCALL, SYS_SET_ROLE } from "@00/STATE_MATRIX.ts";
import {
  REDUCTION_CASES,
  reductionCaseById,
  type ReductionCaseDefinition,
} from "./reduction_cases.ts";
import { pack_structure_intent, unpack_structure_charge } from "../../_/mod.ts";
import { goldenTraceArtifactPaths } from "./golden_trace_catalog.ts";
import { GENESIS_PROGRAMS } from "@07/05/GENESIS_BOOT.ts";

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

const REDUCTION_DIFF_ROOT = "src/03/03/verification/reduction_diffs";
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
    case OP_NOP: {
      if (opcode === OP_NOP) {
        state.pc += 1;
        return;
      }
    }
    /* falls through */
    case OP_SET: {
      const reg = args[0] ?? 0;
      state.regs[reg] = args[1] ?? 0;
      state.pc += 3;
      return;
    }
    case OP_GET: {
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
    case OP_PUT: {
      const reg = args[0] ?? 0;
      const prop = args[1] ?? 0;
      state.props[prop] = state.regs[reg] ?? 0;
      state.pc += 3;
      return;
    }
    case OP_ADD: {
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case OP_SUB: {
      const dst = args[0] ?? 0;
      const src = args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += 3;
      return;
    }
    case OP_JNZ: {
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
    case OP_JZ: {
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
    case OP_JMP: {
      state.effects.jumpCount += 1;
      state.pc = args[0] ?? 0;
      return;
    }
    case OP_REPLICATE: {
      state.effects.replicateCount += 1;
      state.pc += 1;
      return;
    }
    case OP_SIGNAL: {
      state.effects.signalCount += 1;
      state.pc += 1;
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
      if (state.role === STATE_MATRIX.ROLE_ARCHITECT) {
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
        state.bondRequests[state.atomIndex * 3 + 0] = state.atomIndex + 1;
        state.bondRequests[state.atomIndex * 3 + 1] = nearestIdx + 1;
        state.bondRequests[state.atomIndex * 3 + 2] = 1; // PENDING
      }
      state.pc += 1;
      return;
    }
    case OP_SPORE_DRIVE: {
      state.effects.sporeDriveCount += 1;
      const energy = state.props[PROP_ENERGY] ?? 0;
      if (energy >= 500) {
        state.props[PROP_ENERGY] = energy - 500;
        // Pseudo-random jump for shadow model parity
        // In real WASM it uses LCG. Here we just mark as "moved".
        state.props[PROP_X] = (state.props[PROP_X] ?? 0) + 7;
        state.props[PROP_Y] = (state.props[PROP_Y] ?? 0) + 7;
      }
      state.pc += 1;
      return;
    }
    case OP_HEBB: {
      state.effects.entangleCount += 1;
      const energy = state.props[PROP_ENERGY] ?? 0;
      // slot is derived from genomePoolSlot which needs logic bytes.
      // for harness, we'll use a simplified mapping or just slot 0.
      const slot = 0;
      if (energy > 500) {
        const deposit = Math.floor(energy / 10);
        state.props[PROP_ENERGY] = energy - deposit;
        state.hiveEnergyPool[slot] = (state.hiveEnergyPool[slot] ?? 0) +
          deposit;
      } else {
        let draw = 500 - energy;
        if (draw > 400) draw = 400;
        const pool = state.hiveEnergyPool[slot] ?? 0;
        const take = Math.min(pool, draw);
        state.hiveEnergyPool[slot] = pool - take;
        state.props[PROP_ENERGY] = energy + take;
      }
      state.pc += 1;
      return;
    }
    case OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS_SET_ROLE) {
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
    if (!decoded || decoded.opcode === OP_NOP) break;
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
    if (!token || token.opcode === OP_NOP || token.glyphId === 2) {
      break;
    }
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

const PARITY_IGNORE_KEYS = new Set([
  "mode",
  "executed",
  "stepsExecuted",
  "energySpent",
  "glyphTape",
  "prettyTape",
]);

function deepCompareState(obj1: any, obj2: any, path: string = ""): string[] {
  const reasons: string[] = [];
  if (obj1 === obj2) return reasons;
  if (!path && obj1 && obj2) {
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of keys) {
      if (PARITY_IGNORE_KEYS.has(key)) continue;
      reasons.push(...deepCompareState(obj1[key], obj2[key], key));
    }
    return reasons;
  }

  if (typeof obj1 !== typeof obj2) {
    reasons.push(`${path} type mismatch: ${typeof obj1} vs ${typeof obj2}`);
    return reasons;
  }
  if (typeof obj1 !== "object" || obj1 === null || obj2 === null) {
    reasons.push(`${path} mismatch legacy=${obj1} reduction=${obj2}`);
    return reasons;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      reasons.push(
        `${path} length mismatch: legacy=${obj1.length} reduction=${obj2.length}`,
      );
    }
    for (let i = 0; i < Math.max(obj1.length, obj2.length); i++) {
        const p = `${path}[${i}]`;
        if (obj1[i] !== obj2[i]) reasons.push(`${p} mismatch legacy=${obj1[i]} reduction=${obj2[i]}`);
    }
    return reasons;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);
  for (const key of allKeys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const currentPath = `${path}.${key}`;
    if (!(key in obj1)) {
       reasons.push(`${currentPath} missing in legacy`);
    } else if (!(key in obj2)) {
       reasons.push(`${currentPath} missing in reduction`);
    } else if (typeof val1 === "object" && val1 !== null) {
       reasons.push(...deepCompareState(val1, val2, currentPath));
    } else if (val1 !== val2) {
       reasons.push(`${currentPath} mismatch legacy=${val1} reduction=${val2}`);
    }
  }
  return reasons;
}

const EXPECTATION_MAPPING: Record<string, (legacy: LegacyShadowResult) => any> = {
  finalPc: l => l.finalPc,
  replicateCount: l => l.effects.replicateCount,
  signalCount: l => l.effects.signalCount,
  buildCount: l => l.effects.buildCount,
  finalRole: l => l.role,
  registers: l => l.regs,
  finalProps: l => l.props,
  finalHiveMemory: l => l.hiveMemory,
  finalHiveBalance: l => l.hiveBalance,
  finalSignalGrid: l => l.signalGrid,
  finalPeerEnergy: l => l.peerEnergy,
  finalPeerPc: l => l.peerPc,
  finalBondDistances: l => l.bondDistances,
  finalDamping: l => l.damping,
  finalStructureGrid: l => l.structureGrid,
  finalStructureIntentOwner: l => l.structureIntentOwner,
  finalStructureIntentValue: l => l.structureIntentValue,
  finalStructureChargeIntent: l => l.structureChargeIntent,
  branchTaken: l => l.effects.branchTaken,
  finalBondRequests: l => l.bondRequests,
  finalHiveEnergyPool: l => l.hiveEnergyPool,
  finalHormones: l => l.hormones,
};

const compareResults = (
  definition: ReductionCaseDefinition,
  legacy: LegacyShadowResult,
  reduction: ReductionShadowResult,
): { ok: boolean; reasons: string[] } => {
  const reasons: string[] = deepCompareState(legacy, reduction);

  for (const [key, expectedVal] of Object.entries(definition.expected)) {
    if (expectedVal === undefined) continue;
    const mappingFn = EXPECTATION_MAPPING[key];
    if (!mappingFn) {
      reasons.push(`Unknown expectation key: ${key}`);
      continue;
    }
    const actualVal = mappingFn(legacy);

    if (typeof expectedVal === "object" && expectedVal !== null && !Array.isArray(expectedVal)) {
      for (const [k, v] of Object.entries(expectedVal)) {
        const actualSubVal = actualVal[k as keyof typeof actualVal] ?? 0;
        if (actualSubVal !== v) {
          reasons.push(`expected ${key}[${k}]=${v} got=${actualSubVal}`);
        }
      }
    } else if (Array.isArray(expectedVal)) {
      for (let i = 0; i < expectedVal.length; i++) {
        if (actualVal[i] !== expectedVal[i]) {
          reasons.push(`expected ${key} mismatch at index ${i}: got=${actualVal[i]} vs expected=${expectedVal[i]}`);
        }
      }
    } else {
      if (actualVal !== expectedVal) {
        reasons.push(`expected ${key}=${expectedVal} got=${actualVal}`);
      }
    }
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
