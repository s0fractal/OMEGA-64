import { RISC, STATE_MATRIX } from "../STATE_MATRIX.ts";

export type ReductionCaseExpectation = {
  finalPc: number;
  replicateCount?: number;
  signalCount?: number;
  buildCount?: number;
  finalRole?: number;
  registers?: number[];
  finalProps?: Partial<Record<number, number>>;
  branchTaken?: boolean;
};

export type ReductionCaseDefinition = {
  id: string;
  baselineTraceId: string;
  description: string;
  script: Uint8Array;
  maxSteps: number;
  initialProps: Partial<Record<number, number>>;
  expected: ReductionCaseExpectation;
};

const makeEnergyThresholdScript = (targetEnergy: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_GET;
  script[pc++] = 0;
  script[pc++] = RISC.PROP_ENERGY;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 1;
  script[pc++] = targetEnergy & 0xFF;
  script[pc++] = RISC.OP_SUB;
  script[pc++] = 0;
  script[pc++] = 1;
  script[pc++] = RISC.OP_JNZ;
  script[pc++] = 0;
  script[pc++] = 15;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeReplicatorLoopScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_REPLICATE;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeArchitectLoopScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const GUARDIAN_SCRIPT = STATE_MATRIX.getGuardianScript();
const HOMEOSTASIS_BAND_ANCHOR_SCRIPT = makeEnergyThresholdScript(240);

const makePlasmidPropWriteScript = (resonanceValue: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = resonanceValue & 0xFF;
  script[pc++] = RISC.OP_PUT;
  script[pc++] = 0;
  script[pc++] = RISC.PROP_RESONANCE;
  script[pc++] = RISC.OP_GET;
  script[pc++] = 1;
  script[pc++] = RISC.PROP_RESONANCE;
  script[pc++] = RISC.OP_JZ;
  script[pc++] = 1;
  script[pc++] = 15;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

export const REDUCTION_CASES: readonly ReductionCaseDefinition[] = Object.freeze([
  {
    id: "rc01_gt01_replicator_loop",
    baselineTraceId: "gt01_coldstart_seeded_swarm",
    description:
      "Seeded-swarm replicator loop shadowed through REPLICATE -> SIGNAL -> JMP bridge subset.",
    script: makeReplicatorLoopScript(),
    maxSteps: 6,
    initialProps: {},
    expected: {
      finalPc: 0,
      replicateCount: 2,
      signalCount: 2,
      buildCount: 0,
      branchTaken: false,
    },
  },
  {
    id: "rc02_gt01_architect_loop",
    baselineTraceId: "gt01_coldstart_seeded_swarm",
    description:
      "Seeded-swarm architect loop shadowed through ROLE -> BUILD -> SIGNAL -> JMP bridge subset.",
    script: makeArchitectLoopScript(),
    maxSteps: 8,
    initialProps: {},
    expected: {
      finalPc: 0,
      buildCount: 2,
      signalCount: 2,
      finalRole: STATE_MATRIX.ROLE_ARCHITECT,
      branchTaken: false,
    },
  },
  {
    id: "rc03_gt03_guardian_stable_branch",
    baselineTraceId: "gt03_pheromone_inject",
    description:
      "Guardian script on a coherent field should stay in the stable signaling branch.",
    script: GUARDIAN_SCRIPT,
    maxSteps: 7,
    initialProps: {
      [RISC.PROP_NEURAL_COHERENCE]: 200,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: STATE_MATRIX.ROLE_GUARDIAN,
      registers: [200, 0, 0, 0, 0, 0, 0, 0],
      branchTaken: false,
    },
  },
  {
    id: "rc04_gt03_guardian_repair_branch",
    baselineTraceId: "gt03_pheromone_inject",
    description:
      "Guardian script on a low-coherence field should branch into repair mode and emit BUILD+SIGNAL.",
    script: GUARDIAN_SCRIPT,
    maxSteps: 8,
    initialProps: {
      [RISC.PROP_NEURAL_COHERENCE]: 0,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 1,
      finalRole: STATE_MATRIX.ROLE_ARCHITECT,
      registers: [0, 200, 0, 0, 0, 0, 0, 0],
      branchTaken: true,
    },
  },
  {
    id: "rc05_gt05_band_anchor_match",
    baselineTraceId: "gt05_homeostasis_correction",
    description:
      "Because the current bridge subset only supports Imm8 anchors, this case uses gt05's representable band=240 as a policy anchor and stays on the signaling branch when energy matches it exactly.",
    script: HOMEOSTASIS_BAND_ANCHOR_SCRIPT,
    maxSteps: 6,
    initialProps: {
      [RISC.PROP_ENERGY]: 240,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      registers: [0, 240, 0, 0, 0, 0, 0, 0],
      branchTaken: false,
    },
  },
  {
    id: "rc06_gt05_band_anchor_mismatch",
    baselineTraceId: "gt05_homeostasis_correction",
    description:
      "The same gt05 band anchor should branch into corrective build mode when energy still reflects the hotter pre-correction regime.",
    script: HOMEOSTASIS_BAND_ANCHOR_SCRIPT,
    maxSteps: 8,
    initialProps: {
      [RISC.PROP_ENERGY]: 1200,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 1,
      finalRole: STATE_MATRIX.ROLE_ARCHITECT,
      registers: [960, 240, 0, 0, 0, 0, 0, 0],
      branchTaken: true,
    },
  },
  {
    id: "rc07_gt04_plasmid_prop_write_signal",
    baselineTraceId: "gt04_plasmid_inject",
    description:
      "Durable symbolic ingress should preserve a property write through PUT and stay on the signaling branch when the written resonance value is non-zero.",
    script: makePlasmidPropWriteScript(5),
    maxSteps: 6,
    initialProps: {
      [RISC.PROP_RESONANCE]: 0,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      registers: [5, 5, 0, 0, 0, 0, 0, 0],
      finalProps: {
        [RISC.PROP_RESONANCE]: 5,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc08_gt04_plasmid_zero_branch",
    baselineTraceId: "gt04_plasmid_inject",
    description:
      "The same symbolic ingress path should take the JZ-controlled repair branch when the written resonance value is zero, proving bounded zero-branch parity inside the reduction bridge.",
    script: makePlasmidPropWriteScript(0),
    maxSteps: 8,
    initialProps: {
      [RISC.PROP_RESONANCE]: 255,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 1,
      finalRole: STATE_MATRIX.ROLE_ARCHITECT,
      registers: [0, 0, 0, 0, 0, 0, 0, 0],
      finalProps: {
        [RISC.PROP_RESONANCE]: 0,
      },
      branchTaken: true,
    },
  },
]);

const REDUCTION_CASE_BY_ID = new Map<string, ReductionCaseDefinition>(
  REDUCTION_CASES.map((definition) => [definition.id, definition]),
);

export const reductionCaseById = (id: string): ReductionCaseDefinition | null =>
  REDUCTION_CASE_BY_ID.get(id) ?? null;
