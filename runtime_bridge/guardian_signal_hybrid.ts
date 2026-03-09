import { RISC, STATE_MATRIX, SYS } from "../STATE_MATRIX.ts";

export type GuardianSignalExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type GuardianSignalBranch = "stable" | "repair" | "unknown";

export type GuardianSignalReductionDecision = {
  status: "ok" | "fallback";
  branch: GuardianSignalBranch;
  signalAllowed: boolean;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type GuardianSignalExecutionDecision = {
  mode: GuardianSignalExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: GuardianSignalBranch;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

type GuardianShadowState = {
  pc: number;
  regs: number[];
  role: number;
  neuralCoherence: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
};

type GuardianToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_MAX_STEPS = 8;
const GUARDIAN_PROP_MAP = {
  [RISC.PROP_NEURAL_COHERENCE]: true,
} as const;
const SUPPORTED_GUARDIAN_OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_SIGNAL, 1],
  [RISC.OP_ROLE, 3],
  [RISC.OP_BUILD, 3],
  [RISC.OP_JZ, 3],
  [RISC.OP_SPORE_DRIVE, 1],
  [RISC.OP_SYSCALL, 1],
]);

export const normalizeGuardianSignalExecutionMode = (
  raw: string | undefined,
): GuardianSignalExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createInitialState = (neuralCoherence: number): GuardianShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  neuralCoherence: Math.max(0, Math.floor(neuralCoherence)),
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
});

const decodeGuardianTape = (
  script: Uint8Array,
  maxTokens: number,
): GuardianToken[] => {
  const out: GuardianToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? RISC.OP_NOP;
    if (opcode === RISC.OP_NOP) break;
    const length = SUPPORTED_GUARDIAN_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_guardian_opcode_0x${opcode.toString(16)}`);
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const classifyBranch = (
  state: GuardianShadowState,
): GuardianSignalBranch => {
  if (
    state.buildCount > 0 ||
    state.role === STATE_MATRIX.ROLE_ARCHITECT ||
    state.branchTaken
  ) {
    return "repair";
  }
  if (
    state.signalCount > 0 &&
    state.role === STATE_MATRIX.ROLE_GUARDIAN &&
    !state.branchTaken
  ) {
    return "stable";
  }
  return "unknown";
};

const applyGuardianOpcode = (
  state: GuardianShadowState,
  token: GuardianToken,
): void => {
  switch (token.opcode) {
    case RISC.OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (!(prop in GUARDIAN_PROP_MAP)) {
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.regs[reg] = state.neuralCoherence;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case RISC.OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case RISC.OP_ROLE: {
      const mode = token.args[0] ?? 0;
      const role = token.args[1] ?? 0;
      if (mode === 0) state.role = role;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SIGNAL: {
      state.signalCount++;
      state.pc += token.length;
      return;
    }
    case RISC.OP_BUILD: {
      state.buildCount++;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SPORE_DRIVE: {
      // Movement is no-op in bridge reduction
      state.pc += token.length;
      return;
    }
    case RISC.OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS.YIELD) {
        // no-op
      } else if (sysId === SYS.SET_ROLE) {
        state.role = state.regs[1] ?? 0;
      } else {
        throw new Error(
          `unsupported guardian bridge syscall=0x${sysId.toString(16)}`,
        );
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported guardian bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const fallbackDecision = (
  glyphCount: number,
  stepsExecuted: number,
  reason: string,
): GuardianSignalReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  signalAllowed: false,
  finalRole: 0,
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
  glyphCount,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateGuardianSignalReduction = (
  input: {
    script: Uint8Array;
    neuralCoherence: number;
    maxSteps?: number;
  },
): GuardianSignalReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const guardianTape = decodeGuardianTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, GuardianToken>(
      guardianTape.map((token) => [token.pc, token]),
    );
    const state = createInitialState(input.neuralCoherence);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyGuardianOpcode(state, token);
      stepsExecuted++;
    }

    const branch = classifyBranch(state);
    return {
      status: "ok",
      branch,
      signalAllowed: branch === "stable",
      finalRole: state.role,
      signalCount: state.signalCount,
      buildCount: state.buildCount,
      branchTaken: state.branchTaken,
      glyphCount: guardianTape.length,
      stepsExecuted,
    };
  } catch (err) {
    return fallbackDecision(0, 0, String(err));
  }
};

export const evaluateGuardianSignalExecution = (
  input: {
    mode: GuardianSignalExecutionMode;
    script: Uint8Array;
    neuralCoherence: number;
    legacyAllowed: boolean;
    maxSteps?: number;
  },
): GuardianSignalExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateGuardianSignalReduction({
    script: input.script,
    neuralCoherence: input.neuralCoherence,
    maxSteps: input.maxSteps,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  if (input.mode === "shadow-reduce") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "shadow",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: !reduction.signalAllowed,
      hybridSuppressed: false,
    };
  }

  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: reduction.signalAllowed,
    status: "hybrid",
    branch: reduction.branch,
    finalRole: reduction.finalRole,
    signalCount: reduction.signalCount,
    buildCount: reduction.buildCount,
    branchTaken: reduction.branchTaken,
    glyphCount: reduction.glyphCount,
    stepsExecuted: reduction.stepsExecuted,
    shadowSuppressed: false,
    hybridSuppressed: !reduction.signalAllowed,
  };
};
