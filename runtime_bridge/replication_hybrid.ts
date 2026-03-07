import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";

export type ReplicationExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type ReplicationBranch = "emit" | "suppress" | "unknown";

export type ReplicationReductionDecision = {
  status: "ok" | "fallback";
  branch: ReplicationBranch;
  replicationAllowed: boolean;
  replicationCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type ReplicationExecutionDecision = {
  mode: ReplicationExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: ReplicationBranch;
  replicationCount: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

export type ReplicationHybridState = {
  mode: ReplicationExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedReplications: number;
  suppressedReplications: number;
  shadowSuppressedReplications: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "emit"
    | "suppress"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: ReplicationBranch;
  lastFallbackReason: string;
  lastMode?: ReplicationExecutionMode;
};


type ReplicationShadowState = {
  pc: number;
  regs: number[];
  energy: number;
  resonance: number;
  aggression: number;
  replicationCount: number;
};

type ReplicationToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_MAX_STEPS = 16;
const REPLICATION_PROP_MAP = {
  [RISC.PROP_ENERGY]: true,
  [RISC.PROP_RESONANCE]: true,
} as const;

const SUPPORTED_REPLICATION_OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_ADD, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_REPLICATE, 1],
  [RISC.OP_PUT, 3],
]);

export const normalizeReplicationExecutionMode = (
  raw: string | undefined,
): ReplicationExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createInitialState = (
  energy: number,
  resonance: number,
  aggression: number,
): ReplicationShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  energy,
  resonance,
  aggression,
  replicationCount: 0,
});

const decodeReplicationTape = (
  script: Uint8Array,
  maxTokens: number,
): ReplicationToken[] => {
  const out: ReplicationToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? RISC.OP_NOP;
    if (opcode === RISC.OP_NOP) break;
    const length = SUPPORTED_REPLICATION_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_replication_opcode_0x${opcode.toString(16)}`);
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

const applyReplicationOpcode = (
  state: ReplicationShadowState,
  token: ReplicationToken,
): void => {
  switch (token.opcode) {
    case RISC.OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (prop === RISC.PROP_ENERGY) state.regs[reg] = state.energy;
      else if (prop === RISC.PROP_RESONANCE) state.regs[reg] = state.resonance;
      else if (!(prop in REPLICATION_PROP_MAP)) {
        // We only allow energy and resonance in this slit for now
        throw new Error(`unsupported GET prop=${prop}`);
      }
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
    case RISC.OP_ADD: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case RISC.OP_PUT: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      const val = state.regs[reg] ?? 0;
      if (prop === RISC.PROP_ENERGY) state.energy = val;
      else if (prop === RISC.PROP_RESONANCE) state.resonance = val;
      state.pc += token.length;
      return;
    }
    case RISC.OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
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
    case RISC.OP_REPLICATE: {
      const aggrH = state.aggression;
      const eThresh = 150 - (aggrH >> 3); // Lowered from 1500 for audit
      const rThresh = 20 - (aggrH >> 5);  // Lowered from 200 for audit
      if (state.energy > eThresh && state.resonance > rThresh) {
        state.replicationCount++;
        state.energy = state.energy >> 1;
        state.resonance = state.resonance + 30;
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported replication bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const fallbackDecision = (
  stepsExecuted: number,
  reason: string,
): ReplicationReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  replicationAllowed: true, // Fail-open for replication safety
  replicationCount: 0,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateReplicationReduction = (
  input: {
    script: Uint8Array;
    energy: number;
    resonance: number;
    aggression: number;
    maxSteps?: number;
  },
): ReplicationReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const replicationTape = decodeReplicationTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, ReplicationToken>(
      replicationTape.map((token) => [token.pc, token]),
    );
    const state = createInitialState(input.energy, input.resonance, input.aggression);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyReplicationOpcode(state, token);
      stepsExecuted++;
    }

    const branch: ReplicationBranch = state.replicationCount > 0 ? "emit" : "suppress";
    return {
      status: "ok",
      branch,
      replicationAllowed: branch === "emit",
      replicationCount: state.replicationCount,
      stepsExecuted,
    };
  } catch (err) {
    return fallbackDecision(0, String(err));
  }
};

export const evaluateReplicationExecution = (
  input: {
    mode: ReplicationExecutionMode;
    script: Uint8Array;
    energy: number;
    resonance: number;
    aggression: number;
    legacyAllowed: boolean;
    maxSteps?: number;
  },
): ReplicationExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      replicationCount: 0,
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
      replicationCount: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateReplicationReduction({
    script: input.script,
    energy: input.energy,
    resonance: input.resonance,
    aggression: input.aggression,
    maxSteps: input.maxSteps,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      replicationCount: reduction.replicationCount,
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
      replicationCount: reduction.replicationCount,
      shadowSuppressed: !reduction.replicationAllowed,
      hybridSuppressed: false,
    };
  }

  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: reduction.replicationAllowed,
    status: "hybrid",
    branch: reduction.branch,
    replicationCount: reduction.replicationCount,
    shadowSuppressed: false,
    hybridSuppressed: !reduction.replicationAllowed,
  };
};
