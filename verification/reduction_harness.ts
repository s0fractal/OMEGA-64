import { glyphTapeToPrettyText } from "../runtime_bridge/glyph_pretty.ts";
import {
  decodeLegacyInstruction,
  scriptToGlyphTape,
  type GlyphTapeToken,
} from "../runtime_bridge/opcode_to_glyph.ts";
import { glyphSpecById } from "../reduction_core/GlyphIR64.ts";
import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";
import {
  REDUCTION_CASES,
  reductionCaseById,
  type ReductionCaseDefinition,
} from "./reduction_cases.ts";
import { goldenTraceArtifactPaths } from "./golden_trace_catalog.ts";

type HarnessProps = Record<number, number>;

type ShadowEffects = {
  replicateCount: number;
  signalCount: number;
  buildCount: number;
  roleWrites: number[];
  branchTaken: boolean;
  jumpCount: number;
};

type ShadowState = {
  pc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
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
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
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
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
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
    structure_grid_match: boolean;
    structure_intent_owner_match: boolean;
    structure_intent_value_match: boolean;
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
  roleWrites: [],
  branchTaken: false,
  jumpCount: 0,
});

const createInitialState = (
  definition: ReductionCaseDefinition,
): ShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  props: Object.fromEntries(
    Object.entries(definition.initialProps).map(([key, value]) => [
      Number(key),
      Number(value),
    ]),
  ),
  structureGrid: {},
  structureIntentOwner: {},
  structureIntentValue: {},
  effects: cloneEffects(),
  executed: [],
  energySpent: 0,
});

const equalNumberArray = (a: readonly number[], b: readonly number[]): boolean =>
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
  return `{${entries.map(([key, item]) =>
    `${JSON.stringify(key)}:${stableStringify(item)}`
  ).join(",")}}`;
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
  structureGrid: { ...state.structureGrid },
  structureIntentOwner: { ...state.structureIntentOwner },
  structureIntentValue: { ...state.structureIntentValue },
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
  structureGrid: { ...state.structureGrid },
  structureIntentOwner: { ...state.structureIntentOwner },
  structureIntentValue: { ...state.structureIntentValue },
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

const applyShadowOpcode = (
  state: ShadowState,
  opcode: number,
  args: number[],
  energyCost: number,
): void => {
  state.energySpent += energyCost;
  switch (opcode) {
    case RISC.OP_SET: {
      const reg = args[0] ?? 0;
      state.regs[reg] = args[1] ?? 0;
      state.pc += 3;
      return;
    }
    case RISC.OP_GET: {
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
          publishBuildIntent(state, cellIdx, 0, newVal);
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
    default:
      throw new Error(`[reduction_harness] unsupported legacy opcode 0x${opcode.toString(16)}`);
  }
};

const runLegacyShadow = (definition: ReductionCaseDefinition): LegacyShadowResult => {
  const state = createInitialState(definition);
  let stepsExecuted = 0;
  while (stepsExecuted < definition.maxSteps) {
    const decoded = decodeLegacyInstruction(definition.script, state.pc);
    if (!decoded || decoded.opcode === RISC.OP_NOP) break;
    state.executed.push(
      `pc=${decoded.pc} opcode=${decoded.opcodeMnemonic} args=[${decoded.args.join(",")}]`,
    );
    applyShadowOpcode(state, decoded.opcode, decoded.args, 0);
    stepsExecuted++;
  }
  return snapshotLegacy(state, stepsExecuted);
};

const runReductionShadow = (
  definition: ReductionCaseDefinition,
): ReductionShadowResult => {
  const glyphTape = scriptToGlyphTape(definition.script);
  const tokenByPc = new Map<number, GlyphTapeToken>(glyphTape.map((token) => [token.pc, token]));
  const state = createInitialState(definition);
  let stepsExecuted = 0;

  while (stepsExecuted < definition.maxSteps) {
    const token = tokenByPc.get(state.pc);
    if (!token) break;
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
    applyShadowOpcode(state, token.opcode, token.args, spec.energyCost);
    stepsExecuted++;
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
    reasons.push(`finalPc mismatch legacy=${legacy.finalPc} reduction=${reduction.finalPc}`);
  }
  if (!equalNumberArray(legacy.regs, reduction.regs)) {
    reasons.push("register vector mismatch");
  }
  if (legacy.role !== reduction.role) {
    reasons.push(`role mismatch legacy=${legacy.role} reduction=${reduction.role}`);
  }
  if (!equalHarnessProps(legacy.props, reduction.props)) {
    reasons.push("props mismatch");
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
  if (!equalNumberArray(legacy.effects.roleWrites, reduction.effects.roleWrites)) {
    reasons.push("roleWrites mismatch");
  }

  const expected = definition.expected;
  if (typeof expected.finalPc === "number" && legacy.finalPc !== expected.finalPc) {
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
  if (
    Array.isArray(expected.registers) &&
    !equalNumberArray(legacy.regs, expected.registers)
  ) {
    reasons.push("expected registers mismatch");
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
  if (
    typeof expected.branchTaken === "boolean" &&
    legacy.effects.branchTaken !== expected.branchTaken
  ) {
    reasons.push(
      `expected branchTaken=${expected.branchTaken} got=${legacy.effects.branchTaken}`,
    );
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
    structureGrid: result.legacy.structureGrid,
    structureIntentOwner: result.legacy.structureIntentOwner,
    structureIntentValue: result.legacy.structureIntentValue,
    effects: result.legacy.effects,
    energySpent: result.legacy.energySpent,
  }),
  reduction_digest: await sha256Hex({
    finalPc: result.reduction.finalPc,
    regs: result.reduction.regs,
    role: result.reduction.role,
    props: result.reduction.props,
    structureGrid: result.reduction.structureGrid,
    structureIntentOwner: result.reduction.structureIntentOwner,
    structureIntentValue: result.reduction.structureIntentValue,
    effects: result.reduction.effects,
    energySpent: result.reduction.energySpent,
  }),
  executed_digest_legacy: await sha256Hex(result.legacy.executed),
  executed_digest_reduction: await sha256Hex(result.reduction.executed),
  diff: {
    final_pc_match: result.legacy.finalPc === result.reduction.finalPc,
    registers_match: equalNumberArray(result.legacy.regs, result.reduction.regs),
    role_match: result.legacy.role === result.reduction.role,
    props_match: equalHarnessProps(result.legacy.props, result.reduction.props),
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
    replicate_count_match:
      result.legacy.effects.replicateCount ===
        result.reduction.effects.replicateCount,
    signal_count_match:
      result.legacy.effects.signalCount === result.reduction.effects.signalCount,
    build_count_match:
      result.legacy.effects.buildCount === result.reduction.effects.buildCount,
    branch_taken_match:
      result.legacy.effects.branchTaken === result.reduction.effects.branchTaken,
    role_writes_match: equalNumberArray(
      result.legacy.effects.roleWrites,
      result.reduction.effects.roleWrites,
    ),
    energy_spent_delta: result.reduction.energySpent - result.legacy.energySpent,
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
  const definition = reductionCaseById(caseId);
  if (!definition) {
    throw new Error(`[reduction_harness] unknown case id: ${caseId}`);
  }

  const [baseline, legacy, reduction] = await Promise.all([
    loadBaselineAnchor(definition.baselineTraceId),
    Promise.resolve(runLegacyShadow(definition)),
    Promise.resolve(runReductionShadow(definition)),
  ]);

  return {
    caseId,
    baseline,
    legacy,
    reduction,
    parity: compareResults(definition, legacy, reduction),
  };
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
  const caseIds = Deno.args.length > 0 ? Deno.args : REDUCTION_CASES.map((caseDef) => caseDef.id);
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
