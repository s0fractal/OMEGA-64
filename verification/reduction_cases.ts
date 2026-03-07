import { RISC, STATE_MATRIX, STRUCTURE } from "../STATE_MATRIX.ts";

export type ReductionCaseExpectation = {
  finalPc: number;
  replicateCount?: number;
  signalCount?: number;
  buildCount?: number;
  finalRole?: number;
  registers?: number[];
  finalProps?: Partial<Record<number, number>>;
  finalHiveMemory?: Partial<Record<number, number>>;
  finalHiveBalance?: number;
  finalSignalGrid?: Partial<Record<number, number>>;
  finalPeerEnergy?: Partial<Record<number, number>>;
  finalPeerPc?: Partial<Record<number, number>>;
  finalStructureGrid?: Partial<Record<number, number>>;
  branchTaken?: boolean;
};

export type ReductionCaseDefinition = {
  id: string;
  baselineTraceId: string;
  description: string;
  script: Uint8Array;
  maxSteps: number;
  postStructureTick?: boolean;
  initialProps: Partial<Record<number, number>>;
  initialBondTargets?: Partial<Record<number, number>>;
  initialPeerEnergy?: Partial<Record<number, number>>;
  initialPeerPc?: Partial<Record<number, number>>;
  initialCellPeers?: number[];
  initialHiveBalance?: number;
  initialStructureGrid?: Partial<Record<number, number>>;
  initialStructureIntentOwner?: Partial<Record<number, number>>;
  initialStructureIntentValue?: Partial<Record<number, number>>;
  initialStructureChargeIntent?: Partial<Record<number, number>>;
  expected: ReductionCaseExpectation;
};

const GRID_W = 140;
const STRUCTURE_INTENT_LOCK_BIT = -2147483648;

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

const makeSenseIntentScript = (buildType: number, targetType: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = buildType & 0xFF;
  script[pc++] = 1;
  script[pc++] = RISC.OP_SENSE;
  script[pc++] = 1;
  script[pc++] = targetType & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeBuildOnlyScript = (buildType: number, buildState: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
  script[pc++] = RISC.OP_BUILD;
  script[pc++] = buildType & 0xFF;
  script[pc++] = buildState & 0xFF;
  return script;
};

const makePlugChargeScript = (charge: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = charge & 0xFF;
  script[pc++] = 0xA4;
  script[pc++] = 1;
  script[pc++] = 0;
  return script;
};

const makePlugChargeCompetitionScript = (
  firstCharge: number,
  secondCharge: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = firstCharge & 0xFF;
  script[pc++] = 0xA4;
  script[pc++] = 1;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SET;
  script[pc++] = 0;
  script[pc++] = secondCharge & 0xFF;
  script[pc++] = 0xA4;
  script[pc++] = 1;
  script[pc++] = 0;
  return script;
};

const makeSenseScript = (targetType: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SENSE;
  script[pc++] = 1;
  script[pc++] = targetType & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectiveHiveScript = (
  addr: number,
  value: number,
  reg: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 0;
  script[pc++] = addr & 0xFF;
  script[pc++] = value & 0xFF;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 1;
  script[pc++] = addr & 0xFF;
  script[pc++] = reg & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectivePheromoneScript = (
  intensity: number,
  type: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 2;
  script[pc++] = intensity & 0xFF;
  script[pc++] = type & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectiveBankDepositScript = (
  amount: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 3;
  script[pc++] = amount & 0xFF;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectiveBankWithdrawScript = (
  reg: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 4;
  script[pc++] = reg & 0xFF;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectivePhaseLockScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 5;
  script[pc++] = 0;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeCollectivePcSyncQuorumScript = (): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_COLLECTIVE;
  script[pc++] = 6;
  script[pc++] = 0;
  script[pc++] = 0;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeShareScript = (
  slot: number,
  percentage: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = RISC.OP_SHARE;
  script[pc++] = slot & 0xFF;
  script[pc++] = percentage & 0xFF;
  script[pc++] = RISC.OP_SIGNAL;
  script[pc++] = RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const structureNeighborCell = (centerX: number, centerY: number): number => {
  const gx = Math.floor(centerX / 10);
  const gy = Math.floor(centerY / 10);
  return (gy * GRID_W) + gx + 1;
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
  {
    id: "rc09_gt08_structure_intent_visible",
    baselineTraceId: "gt08_structure_intent_visibility",
    description:
      "An architect should publish a same-tick BUILD intent that OP_SENSE can observe immediately through the structure overlay.",
    script: makeSenseIntentScript(STRUCTURE.NODE, STRUCTURE.NODE),
    maxSteps: 5,
    initialProps: {
      [RISC.PROP_X]: 705,
      [RISC.PROP_Y]: 405,
      [RISC.PROP_RESONANCE]: 2,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 1,
      finalRole: STATE_MATRIX.ROLE_ARCHITECT,
      registers: [0, 1, 0, 0, 0, 0, 0, 0],
      branchTaken: false,
    },
  },
  {
    id: "rc10_gt08_structure_intent_typed_miss",
    baselineTraceId: "gt08_structure_intent_visibility",
    description:
      "The same BUILD intent should stay invisible to OP_SENSE when the queried structure type does not match the published build payload.",
    script: makeSenseIntentScript(STRUCTURE.NODE, STRUCTURE.WIRE),
    maxSteps: 5,
    initialProps: {
      [RISC.PROP_X]: 705,
      [RISC.PROP_Y]: 405,
      [RISC.PROP_RESONANCE]: 2,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 1,
      finalRole: STATE_MATRIX.ROLE_ARCHITECT,
      registers: [0, 0, 0, 0, 0, 0, 0, 0],
      branchTaken: false,
    },
  },
  {
    id: "rc11_gt09_collective_hive_store_load",
    baselineTraceId: "gt09_collective_transport",
    description:
      "A bounded COLLECTIVE bridge should preserve hive store/load semantics through mode 0 and mode 1 without reaching outside the local shadow state.",
    script: makeCollectiveHiveScript(1, 88, 0),
    maxSteps: 4,
    initialProps: {},
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      registers: [88, 0, 0, 0, 0, 0, 0, 0],
      finalHiveMemory: {
        1: 88,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc12_gt09_collective_pheromone_emit",
    baselineTraceId: "gt09_collective_transport",
    description:
      "The same bounded COLLECTIVE bridge should preserve pheromone emission through mode 2 at the atom's local grid cell.",
    script: makeCollectivePheromoneScript(200, 5),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_X]: 105,
      [RISC.PROP_Y]: 105,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      finalSignalGrid: {
        1410: 0xC805,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc13_gt10_share_transfer_success",
    baselineTraceId: "gt10_share_transfer",
    description:
      "A bounded SHARE bridge should deduct percentage energy from self and credit the bonded peer when slot 0 resolves to a live target.",
    script: makeShareScript(0, 50),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_ENERGY]: 1000,
    },
    initialBondTargets: {
      0: 2,
    },
    initialPeerEnergy: {
      2: 100,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      finalProps: {
        [RISC.PROP_ENERGY]: 500,
      },
      finalPeerEnergy: {
        2: 600,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc14_gt10_share_transfer_empty_bond",
    baselineTraceId: "gt10_share_transfer",
    description:
      "The same SHARE bridge should fail closed when the selected bond slot is empty, leaving self and peer energy untouched.",
    script: makeShareScript(0, 50),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_ENERGY]: 1000,
    },
    initialPeerEnergy: {
      2: 100,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      finalProps: {
        [RISC.PROP_ENERGY]: 1000,
      },
      finalPeerEnergy: {
        2: 100,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc15_gt11_collective_bank_deposit",
    baselineTraceId: "gt11_collective_banking",
    description:
      "A bounded COLLECTIVE bridge should preserve mode 3 bank deposit semantics as raw opcode units, reducing local energy and increasing hive balance.",
    script: makeCollectiveBankDepositScript(80),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_ENERGY]: 5000,
    },
    initialHiveBalance: 250,
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      finalProps: {
        [RISC.PROP_ENERGY]: 4920,
      },
      finalHiveBalance: 330,
      branchTaken: false,
    },
  },
  {
    id: "rc16_gt11_collective_bank_withdraw",
    baselineTraceId: "gt11_collective_banking",
    description:
      "The same bounded COLLECTIVE bridge should preserve mode 4 capped withdraw semantics, crediting at most 100 raw units to energy and writing the amount to the selected register.",
    script: makeCollectiveBankWithdrawScript(0),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_ENERGY]: 5000,
    },
    initialHiveBalance: 250,
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      registers: [100, 0, 0, 0, 0, 0, 0, 0],
      finalProps: {
        [RISC.PROP_ENERGY]: 5100,
      },
      finalHiveBalance: 150,
      branchTaken: false,
    },
  },
  {
    id: "rc17_gt12_collective_phase_lock",
    baselineTraceId: "gt12_collective_synchrony",
    description:
      "A bounded COLLECTIVE bridge should preserve mode 5 phase-lock semantics by pushing bonded peers to the next instruction boundary.",
    script: makeCollectivePhaseLockScript(),
    maxSteps: 3,
    initialProps: {},
    initialBondTargets: {
      0: 1,
      1: 2,
    },
    initialPeerPc: {
      1: 9,
      2: 10,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      finalPeerPc: {
        1: 4,
        2: 4,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc18_gt12_collective_pc_sync_quorum",
    baselineTraceId: "gt12_collective_synchrony",
    description:
      "The same bounded COLLECTIVE bridge should preserve mode 6 quorum semantics by pushing local cell peers to the next instruction boundary.",
    script: makeCollectivePcSyncQuorumScript(),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_X]: 205,
      [RISC.PROP_Y]: 105,
    },
    initialPeerPc: {
      1: 7,
      2: 8,
    },
    initialCellPeers: [1, 2],
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      finalPeerPc: {
        1: 4,
        2: 4,
      },
      branchTaken: false,
    },
  },
  {
    id: "rc19_gt13_sense_stale_lock_visible",
    baselineTraceId: "gt13_structure_lock_progress",
    description:
      "A bounded SENSE bridge should observe the underlying structure grid through a stale lock bit, matching the forward-progress semantics captured in gt13.",
    script: makeSenseScript(STRUCTURE.WIRE),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_X]: 705,
      [RISC.PROP_Y]: 405,
    },
    initialStructureGrid: {
      [structureNeighborCell(705, 405)]: STRUCTURE.WIRE,
    },
    initialStructureIntentOwner: {
      [structureNeighborCell(705, 405)]: STRUCTURE_INTENT_LOCK_BIT,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      registers: [0, 1, 0, 0, 0, 0, 0, 0],
      branchTaken: false,
    },
  },
  {
    id: "rc20_gt13_sense_stale_lock_typed_miss",
    baselineTraceId: "gt13_structure_lock_progress",
    description:
      "The same stale-lock fallback should still fail closed on type mismatch, proving that lock forward progress does not blur structure-type semantics.",
    script: makeSenseScript(STRUCTURE.NODE),
    maxSteps: 3,
    initialProps: {
      [RISC.PROP_X]: 705,
      [RISC.PROP_Y]: 405,
    },
    initialStructureGrid: {
      [structureNeighborCell(705, 405)]: STRUCTURE.WIRE,
    },
    initialStructureIntentOwner: {
      [structureNeighborCell(705, 405)]: STRUCTURE_INTENT_LOCK_BIT,
    },
    expected: {
      finalPc: 0,
      signalCount: 1,
      buildCount: 0,
      finalRole: 0,
      registers: [0, 0, 0, 0, 0, 0, 0, 0],
      branchTaken: false,
    },
  },
  {
    id: "rc21_gt14_plug_charge_resolve",
    baselineTraceId: "gt14_structure_charge_resolution",
    description:
      "A bounded PLUG bridge should publish a charge intent that resolves into a concrete wire charge on the next bounded structure tick, clearing the intent afterward.",
    script: makePlugChargeScript(180),
    maxSteps: 2,
    postStructureTick: true,
    initialProps: {
      [RISC.PROP_X]: 35,
      [RISC.PROP_Y]: 35,
    },
    initialStructureGrid: {
      [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE,
    },
    expected: {
      finalPc: 6,
      signalCount: 0,
      buildCount: 0,
      finalRole: 0,
      finalStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE |
          (170 << 16),
      },
      branchTaken: false,
    },
  },
  {
    id: "rc22_gt15_plug_charge_competition_low_high",
    baselineTraceId: "gt15_structure_charge_competition",
    description:
      "A bounded PLUG bridge should preserve max-intent semantics when a lower charge is published before a higher one to the same cell.",
    script: makePlugChargeCompetitionScript(120, 220),
    maxSteps: 4,
    postStructureTick: true,
    initialProps: {
      [RISC.PROP_X]: 35,
      [RISC.PROP_Y]: 35,
    },
    initialStructureGrid: {
      [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE,
    },
    expected: {
      finalPc: 12,
      signalCount: 0,
      buildCount: 0,
      finalRole: 0,
      registers: [220, 0, 0, 0, 0, 0, 0, 0],
      finalStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE |
          (210 << 16),
      },
      branchTaken: false,
    },
  },
  {
    id: "rc23_gt15_plug_charge_competition_high_low",
    baselineTraceId: "gt15_structure_charge_competition",
    description:
      "The same bounded PLUG bridge should still preserve max-intent semantics when the higher charge arrives first and a lower publication follows.",
    script: makePlugChargeCompetitionScript(220, 120),
    maxSteps: 4,
    postStructureTick: true,
    initialProps: {
      [RISC.PROP_X]: 35,
      [RISC.PROP_Y]: 35,
    },
    initialStructureGrid: {
      [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE,
    },
    expected: {
      finalPc: 12,
      signalCount: 0,
      buildCount: 0,
      finalRole: 0,
      registers: [120, 0, 0, 0, 0, 0, 0, 0],
      finalStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STRUCTURE.WIRE |
          (210 << 16),
      },
      branchTaken: false,
    },
  },
]);

const REDUCTION_CASE_BY_ID = new Map<string, ReductionCaseDefinition>(
  REDUCTION_CASES.map((definition) => [definition.id, definition]),
);

export const reductionCaseById = (id: string): ReductionCaseDefinition | null =>
  REDUCTION_CASE_BY_ID.get(id) ?? null;
