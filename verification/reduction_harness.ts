import { glyphTapeToPrettyText } from "../runtime_bridge/glyph_pretty.ts";
import {
  decodeLegacyInstruction,
  scriptToGlyphTape,
  type GlyphTapeToken,
} from "../runtime_bridge/opcode_to_glyph.ts";
import { glyphSpecById } from "../reduction_core/GlyphIR64.ts";
import { RISC } from "../STATE_MATRIX.ts";
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
  effects: ShadowEffects;
  executed: string[];
  energySpent: number;
};

type LegacyShadowResult = {
  mode: "legacy";
  finalPc: number;
  regs: number[];
  role: number;
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
  effects: cloneEffects(),
  executed: [],
  energySpent: 0,
});

const equalNumberArray = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const snapshotLegacy = (
  state: ShadowState,
  stepsExecuted: number,
): LegacyShadowResult => ({
  mode: "legacy",
  finalPc: state.pc,
  regs: [...state.regs],
  role: state.role,
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
