import { RISC, SYS, STATE_MATRIX } from "../STATE_MATRIX.ts";

export type ArchitectPlasmidExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type ArchitectPlasmidBranch = "emit" | "suppress" | "unknown";

export type ArchitectPlasmidReductionDecision = {
  status: "ok" | "fallback";
  branch: ArchitectPlasmidBranch;
  plasmidAllowed: boolean;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type ArchitectPlasmidExecutionDecision = {
  mode: ArchitectPlasmidExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: ArchitectPlasmidBranch;
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

type ArchitectShadowState = {
  pc: number;
  regs: number[];
  role: number;
  neuralCoherence: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
};

type ArchitectToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_MAX_STEPS = 8;
const SUPPORTED_ARCHITECT_PROPS = {
  [RISC.PROP_NEURAL_COHERENCE]: true,
} as const;
const SUPPORTED_ARCHITECT_OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_SIGNAL, 1],
  [RISC.OP_ROLE, 3],
  [RISC.OP_BUILD, 3],
  [RISC.OP_SYSCALL, 1],
]);

export const normalizeArchitectPlasmidExecutionMode = (
  raw: string | undefined,
): ArchitectPlasmidExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createInitialState = (neuralCoherence: number): ArchitectShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  neuralCoherence: Math.max(0, Math.floor(neuralCoherence)),
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
});

const decodeArchitectTape = (
  script: Uint8Array,
  maxTokens: number,
): ArchitectToken[] => {
  const out: ArchitectToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? RISC.OP_NOP;
    if (opcode === RISC.OP_NOP) break;
    const length = SUPPORTED_ARCHITECT_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_architect_opcode_0x${opcode.toString(16)}`);
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
  state: ArchitectShadowState,
): ArchitectPlasmidBranch => {
  if (
    state.buildCount > 0 &&
    state.role === STATE_MATRIX.ROLE_ARCHITECT
  ) {
    return "emit";
  }
  if (state.signalCount > 0 && state.buildCount === 0) {
    return "suppress";
  }
  return "unknown";
};

const applyArchitectOpcode = (
  state: ArchitectShadowState,
  token: ArchitectToken,
): void => {
  switch (token.opcode) {
    case RISC.OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (!(prop in SUPPORTED_ARCHITECT_PROPS)) {
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
    case RISC.OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS.YIELD) {
        // no-op
      } else if (sysId === SYS.SET_ROLE) {
        state.role = state.regs[1] ?? 0;
      } else {
        throw new Error(`unsupported architect bridge syscall=0x${sysId.toString(16)}`);
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported architect bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const fallbackDecision = (
  glyphCount: number,
  stepsExecuted: number,
  reason: string,
): ArchitectPlasmidReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  plasmidAllowed: false,
  finalRole: 0,
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
  glyphCount,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateArchitectPlasmidReduction = (
  input: {
    script: Uint8Array;
    neuralCoherence: number;
    maxSteps?: number;
  },
): ArchitectPlasmidReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const architectTape = decodeArchitectTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, ArchitectToken>(
      architectTape.map((token) => [token.pc, token]),
    );
    const state = createInitialState(input.neuralCoherence);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyArchitectOpcode(state, token);
      stepsExecuted++;
    }

    const branch = classifyBranch(state);
    return {
      status: "ok",
      branch,
      plasmidAllowed: branch === "emit",
      finalRole: state.role,
      signalCount: state.signalCount,
      buildCount: state.buildCount,
      branchTaken: state.branchTaken,
      glyphCount: architectTape.length,
      stepsExecuted,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return fallbackDecision(0, 0, message);
  }
};

export const evaluateArchitectPlasmidExecution = (
  input: {
    mode: ArchitectPlasmidExecutionMode;
    script: Uint8Array;
    neuralCoherence: number;
    legacyAllowed: boolean;
  },
): ArchitectPlasmidExecutionDecision => {
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

  const reduction = evaluateArchitectPlasmidReduction({
    script: input.script,
    neuralCoherence: input.neuralCoherence,
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

  const suppress = reduction.plasmidAllowed !== true;
  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: input.mode === "shadow-reduce" ? true : !suppress,
    status: input.mode === "shadow-reduce" ? "shadow" : "hybrid",
    branch: reduction.branch,
    finalRole: reduction.finalRole,
    signalCount: reduction.signalCount,
    buildCount: reduction.buildCount,
    branchTaken: reduction.branchTaken,
    glyphCount: reduction.glyphCount,
    stepsExecuted: reduction.stepsExecuted,
    shadowSuppressed: input.mode === "shadow-reduce" && suppress,
    hybridSuppressed: input.mode === "hybrid-reduce" && suppress,
  };
};
