// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/verification/integration/reduction_cases.md
import { GRID_W, pack_structure_intent, assemble, MX, OP_GET, PROP_ENERGY, OP_SET, OP_SUB, OP_JNZ, OP_SIGNAL, OP_JMP, SYS_SET_ROLE, OP_SYSCALL, OP_BUILD, OP_REPLICATE, OP_PUT, PROP_RESONANCE, OP_JZ, OP_SECRETE_PLASMID, OP_SENSE, OP_TENSEGRITY, OP_PLUG, STR_SOURCE, OP_RESOLVE, OP_COLLECTIVE, OP_SHARE, OP_BIND, OP_SPORE_DRIVE, OP_HEBB, PROP_NEURAL_COHERENCE, STR_NODE, PROP_X, PROP_Y, STR_WIRE, OP_NOP, ReductionCaseExpectation, ReductionCaseDefinition, OPCODE_TO_GLYPH, GATE, assembler, TYPES } from "@g12";

const makeEnergyThresholdScript = (targetEnergy: number): Uint8Array => assemble([
  OP_GET, 0, PROP_ENERGY,
  OP_SET, 1, targetEnergy,
  OP_SUB, 0, 1,
  OP_JNZ, 0, "ROLE",
  OP_SIGNAL,
  OP_JMP, 0,
  "ROLE",
  OP_SET, 0, SYS_SET_ROLE,
  OP_SET, 1, MX.ROLE_ARCHITECT,
  OP_SYSCALL,
  OP_BUILD, 1, 1,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeReplicatorLoopScript = (): Uint8Array => assemble([
  OP_REPLICATE,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeArchitectLoopScript = (): Uint8Array => assemble([
  OP_SET, 0, SYS_SET_ROLE,
  OP_SET, 1, MX.ROLE_ARCHITECT,
  OP_SYSCALL,
  OP_BUILD, 1, 1,
  OP_SIGNAL,
  OP_JMP, 0
]);

const GUARDIAN_SCRIPT = MX.getGuardianScript();
const HOMEOSTASIS_BAND_ANCHOR_SCRIPT = makeEnergyThresholdScript(240);

const makePlasmidPropWriteScript = (resonanceValue: number): Uint8Array => assemble([
  OP_SET, 0, resonanceValue,
  OP_PUT, 0, PROP_RESONANCE,
  OP_GET, 1, PROP_RESONANCE,
  OP_JZ, 1, "ROLE",
  OP_SIGNAL,
  OP_JMP, 0,
  "ROLE",
  OP_SET, 0, SYS_SET_ROLE,
  OP_SET, 1, MX.ROLE_ARCHITECT,
  OP_SYSCALL,
  OP_BUILD, 1, 1,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeSenseIntentScript = (
  buildType: number,
  targetType: number,
): Uint8Array => assemble([
  OP_SECRETE_PLASMID, 0, MX.ROLE_ARCHITECT,
  OP_BUILD, buildType, 1,
  OP_SENSE, 1, targetType,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeBuildOnlyScript = (
  buildType: number,
  buildState: number,
): Uint8Array => assemble([
  OP_SET, 0, SYS_SET_ROLE,
  OP_SET, 1, MX.ROLE_ARCHITECT,
  OP_SYSCALL,
  OP_BUILD, buildType, buildState
]);

const makeTensegrityScript = (
  slot: number,
  dist: number,
  damping: number,
): Uint8Array => assemble([
  OP_TENSEGRITY, 0, slot, dist,
  OP_TENSEGRITY, 1, damping, 0
]);

const makePlugChargeScript = (charge: number): Uint8Array => assemble([
  OP_SET, 0, charge,
  OP_PLUG, 1, 0
]);

const makePlugChargeCompetitionScript = (
  firstCharge: number,
  secondCharge: number,
): Uint8Array => assemble([
  OP_SET, 0, firstCharge,
  OP_PLUG, 1, 0,
  OP_SET, 0, secondCharge,
  OP_PLUG, 1, 0
]);

const makeBuildSourceScript = (): Uint8Array => assemble([
  OP_SET, 0, SYS_SET_ROLE,
  OP_SET, 1, MX.ROLE_ARCHITECT,
  OP_SYSCALL,
  OP_BUILD, STR_SOURCE, 0
]);

const makeBuildSourceWithStateScript = (state: number): Uint8Array => assemble([
  OP_SET, 0, SYS_SET_ROLE,
  OP_SET, 1, MX.ROLE_ARCHITECT,
  OP_SYSCALL,
  OP_BUILD, STR_SOURCE, state
]);

const makeSenseScript = (targetType: number): Uint8Array => assemble([
  OP_SENSE, 1, targetType,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeResolveRoleScript = (role: number, threshold: number): Uint8Array => assemble([
  OP_SET, 0, role,
  OP_RESOLVE, 0, threshold
]);

const makeResolveBankScript = (amount: number): Uint8Array => assemble([
  OP_RESOLVE, 1, amount // Mode: Bank
]);

const makeCollectiveHiveScript = (
  addr: number,
  value: number,
  reg: number,
): Uint8Array => assemble([
  OP_COLLECTIVE, 0, addr, value,
  OP_COLLECTIVE, 1, addr, reg,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeCollectivePheromoneScript = (
  intensity: number,
  type: number,
): Uint8Array => assemble([
  OP_COLLECTIVE, 2, intensity, type,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeCollectiveBankDepositScript = (
  amount: number,
): Uint8Array => assemble([
  OP_COLLECTIVE, 3, amount, 0,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeCollectiveBankWithdrawScript = (
  reg: number,
): Uint8Array => assemble([
  OP_COLLECTIVE, 4, reg, 0,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeCollectivePhaseLockScript = (): Uint8Array => assemble([
  OP_COLLECTIVE, 5, 0, 0,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeCollectivePcSyncQuorumScript = (): Uint8Array => assemble([
  OP_COLLECTIVE, 6, 0, 0,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeShareScript = (
  slot: number,
  percentage: number,
): Uint8Array => assemble([
  OP_SHARE, slot, percentage,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeBindScript = (): Uint8Array => assemble([
  OP_BIND,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeSporeDriveScript = (): Uint8Array => assemble([
  OP_SPORE_DRIVE,
  OP_SIGNAL,
  OP_JMP, 0
]);

const makeEntangleScript = (): Uint8Array => assemble([
  OP_GET, 0, PROP_ENERGY,
  OP_HEBB,
  OP_SIGNAL,
  OP_JMP, 0
]);

const structureNeighborCell = (centerX: number, centerY: number): number => {
  const gx = Math.floor(centerX / 10);
  const gy = Math.floor(centerY / 10);
  return (gy * GRID_W) + gx + 1;
};

export const REDUCTION_CASES: readonly ReductionCaseDefinition[] = Object
  .freeze([
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
        "An architect script spinning in an infinite build-signal loop should emit 2 full cycles before reduction stops it.",
      script: makeArchitectLoopScript(),
      maxSteps: 12,
      initialProps: {},
      expected: {
        finalPc: 0,
        buildCount: 2,
        signalCount: 2,
        finalRole: MX.ROLE_ARCHITECT,
        branchTaken: false,
      },
    },
    {
      id: "rc03_gt03_guardian_stable_branch",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Guardian script on a coherent field should stay in the stable signaling branch.",
      script: GUARDIAN_SCRIPT,
      maxSteps: 9,
      initialProps: {
        [PROP_NEURAL_COHERENCE]: 200,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: MX.ROLE_GUARDIAN,
        registers: [6, 2, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc04_gt03_guardian_repair_branch",
      baselineTraceId: "gt03_pheromone_inject",
      description:
        "Guardian script on a low-coherence field should branch into repair mode and emit BUILD+SIGNAL.",
      script: GUARDIAN_SCRIPT,
      maxSteps: 9,
      initialProps: {
        [PROP_NEURAL_COHERENCE]: 0,
      },
      expected: {
        finalPc: 0,
        signalCount: 0,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        registers: [6, 3, 0, 0, 0, 0, 0, 0],
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
        [PROP_ENERGY]: 240,
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
      maxSteps: 10,
      initialProps: {
        [PROP_ENERGY]: 1200,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        registers: [6, 3, 0, 0, 0, 0, 0, 0],
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
        [PROP_RESONANCE]: 0,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [5, 5, 0, 0, 0, 0, 0, 0],
        finalProps: {
          [PROP_RESONANCE]: 5,
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
      maxSteps: 10,
      initialProps: {
        [PROP_RESONANCE]: 255,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        registers: [6, 3, 0, 0, 0, 0, 0, 0],
        finalProps: {
          [PROP_RESONANCE]: 0,
        },
        branchTaken: true,
      },
    },
    {
      id: "rc09_gt08_structure_intent_visible",
      baselineTraceId: "gt08_structure_intent_visibility",
      description:
        "An architect should publish a same-tick BUILD intent that OP_SENSE can observe immediately through the structure overlay.",
      script: makeSenseIntentScript(STR_NODE, STR_NODE),
      maxSteps: 5,
      initialProps: {
        [PROP_X]: 705,
        [PROP_Y]: 405,
        [PROP_RESONANCE]: 2,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        registers: [0, 1, 0, 0, 0, 0, 0, 0],
        branchTaken: false,
      },
    },
    {
      id: "rc10_gt08_structure_intent_typed_miss",
      baselineTraceId: "gt08_structure_intent_visibility",
      description:
        "The same BUILD intent should stay invisible to OP_SENSE when the queried structure type does not match the published build payload.",
      script: makeSenseIntentScript(STR_NODE, STR_WIRE),
      maxSteps: 5,
      initialProps: {
        [PROP_X]: 705,
        [PROP_Y]: 405,
        [PROP_RESONANCE]: 2,
      },
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
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
        [PROP_X]: 105,
        [PROP_Y]: 105,
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
        [PROP_ENERGY]: 1000,
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
          [PROP_ENERGY]: 500,
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
        [PROP_ENERGY]: 1000,
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
          [PROP_ENERGY]: 1000,
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
        [PROP_ENERGY]: 5000,
      },
      initialHiveBalance: 250,
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        finalProps: {
          [PROP_ENERGY]: 4920,
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
        [PROP_ENERGY]: 5000,
      },
      initialHiveBalance: 250,
      expected: {
        finalPc: 0,
        signalCount: 1,
        buildCount: 0,
        finalRole: 0,
        registers: [100, 0, 0, 0, 0, 0, 0, 0],
        finalProps: {
          [PROP_ENERGY]: 5100,
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
        [PROP_X]: 205,
        [PROP_Y]: 105,
      },
      initialPeerPc: {
        1: 7,
        2: 8,
      },
      initialCellPeers: [1, 2],
      expected: {
        finalPc: 0,
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
      script: makeSenseScript(STR_WIRE),
      maxSteps: 3,
      initialProps: {
        [PROP_X]: 705,
        [PROP_Y]: 405,
      },
      initialStructureGrid: {
        [structureNeighborCell(705, 405)]: STR_WIRE,
      },
      initialStructureIntentOwner: {
        [structureNeighborCell(705, 405)]: pack_structure_intent(0, 0, true),
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
      script: makeSenseScript(STR_NODE),
      maxSteps: 3,
      initialProps: {
        [PROP_X]: 705,
        [PROP_Y]: 405,
      },
      initialStructureGrid: {
        [structureNeighborCell(705, 405)]: STR_WIRE,
      },
      initialStructureIntentOwner: {
        [structureNeighborCell(705, 405)]: pack_structure_intent(0, 0, true),
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
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STR_WIRE,
      },
      expected: {
        finalPc: 6,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STR_WIRE |
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
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STR_WIRE,
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        registers: [220, 0, 0, 0, 0, 0, 0, 0],
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STR_WIRE |
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
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STR_WIRE,
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 0,
        finalRole: 0,
        registers: [120, 0, 0, 0, 0, 0, 0, 0],
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]:
            STR_WIRE |
            (210 << 16),
        },
        branchTaken: false,
      },
    },
    {
      id: "rc24_gt16_build_source_materialize",
      baselineTraceId: "gt16_runtime_build_materialization",
      description:
        "A bounded BUILD bridge should preserve source materialization semantics, clearing temporary intent layers and updating the structure grid.",
      script: makeBuildSourceScript(),
      maxSteps: 2,
      postStructureTick: true,
      initialProps: {
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {},
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        finalStructureGrid: {
          [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: STR_SOURCE,
        },
        branchTaken: false,
      },
    },
    {
      id: "rc25_gt17_build_competition_high_owner_overwrite",
      baselineTraceId: "gt17_structure_build_competition",
      description:
        "A bounded BUILD bridge should preserve max-owner-index priority, allowing an atom with a higher index to overwrite a lower-indexed atom's intent.",
      script: makeBuildSourceWithStateScript(88),
      maxSteps: 2,
      ownerAtomIdx: 10,
      initialProps: {
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {},
      initialStructureIntentOwner: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: 5, // Lower ownerToken
      },
      initialStructureIntentValue: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: pack_structure_intent(
          STR_NODE,
          0,
          false,
        ),
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        finalStructureGrid: {}, // Intent layer not yet flushed
        branchTaken: false,
      },
    },
    {
      id: "rc26_gt17_build_competition_low_owner_blocked",
      baselineTraceId: "gt17_structure_build_competition",
      description:
        "The same bounded BUILD bridge should fail a write intent when a higher-indexed atom has already published to the cell in the same tick.",
      script: makeBuildSourceWithStateScript(88),
      maxSteps: 2,
      ownerAtomIdx: 5,
      initialProps: {
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {},
      initialStructureIntentOwner: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: 11, // Higher ownerToken
      },
      initialStructureIntentValue: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: pack_structure_intent(
          STR_NODE,
          0,
          false,
        ),
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        finalStructureGrid: {},
        branchTaken: false,
      },
    },
    {
      id: "rc27_gt18_build_stale_lock_blocked",
      baselineTraceId: "gt18_structure_lock_blocking",
      description:
        "A bounded BUILD bridge should respect the underlying stale lock bit, blocking new materialization intents even if no concurrent intent exists.",
      script: makeBuildSourceScript(),
      maxSteps: 2,
      initialProps: {
        [PROP_X]: 35,
        [PROP_Y]: 35,
      },
      initialStructureGrid: {},
      initialStructureIntentOwner: {
        [Math.floor(35 / 10) + (Math.floor(35 / 10) * GRID_W)]: pack_structure_intent(
          0,
          0,
          true,
        ),
      },
      expected: {
        finalPc: 12,
        signalCount: 0,
        buildCount: 1,
        finalRole: MX.ROLE_ARCHITECT,
        finalStructureGrid: {},
        branchTaken: false,
      },
    },
    {
      id: "rc28_gt19_tensegrity_kinematics",
      baselineTraceId: "gt19_tensegrity_kinematics",
      description:
        "A bounded TENSEGRITY bridge should preserve mode 0 distance writes and mode 1 damping writes.",
      script: makeTensegrityScript(2, 100, 255),
      maxSteps: 2,
      initialProps: {},
      expected: {
        finalPc: 8,
        finalBondDistances: {
          2: 100,
        },
        finalDamping: 255,
      },
    },
    {
      id: "rc29_gt20_bind_resolution",
      baselineTraceId: "gt20_stigmergic_binding",
      description:
        "A bounded BIND bridge should record a bond request intent when called.",
      script: makeBindScript(),
      maxSteps: 3,
      initialProps: {
        [PROP_X]: 100,
        [PROP_Y]: 100,
      },
      initialCellPeers: [1, 2],
      expected: {
        finalPc: 0,
        finalBondRequests: {
          2: 1, // Peer 2 is closer in our shadow logic
        },
      },
    },
    {
      id: "rc30_spore_drive_jump",
      baselineTraceId: "gt21_spore_drive",
      description: "SPORE_DRIVE should record a jump intent.",
      script: makeSporeDriveScript(),
      maxSteps: 3,
      initialProps: {},
      expected: {
        finalPc: 0,
      },
    },
    {
      id: "rc31_entangle_hive_deposit",
      baselineTraceId: "gt22_quantum_entanglement",
      description: "HEBB should resolve into a hive deposit if valid.",
      script: makeEntangleScript(),
      maxSteps: 5,
      initialProps: {
        [PROP_ENERGY]: 1000,
      },
      expected: {
        finalPc: 0,
        finalProps: {
          [PROP_ENERGY]: 1000,
        },
      },
    },
    {
      id: "rc32_quorum_pc_sync",
      baselineTraceId: "gt12_collective_synchrony",
      description: "QUORUM PC sync (mode 6) should push cell peers to PC 4.",
      script: makeCollectivePcSyncQuorumScript(),
      maxSteps: 3,
      initialProps: {
        [PROP_X]: 205,
        [PROP_Y]: 105,
      },
      initialPeerPc: {
        1: 7,
        2: 8,
      },
      initialCellPeers: [1, 2],
      expected: {
        finalPc: 0,
        finalPeerPc: {
          1: 4,
          2: 4,
        },
      },
    },
    {
      id: "rc33_share_percentage_drift",
      baselineTraceId: "gt10_share_transfer",
      description: "SHARE percentage logic should be consistent.",
      script: makeShareScript(0, 50),
      maxSteps: 3,
      initialProps: {
        [PROP_ENERGY]: 1000,
      },
      initialBondTargets: {
        0: 2,
      },
      initialPeerEnergy: {
        2: 100,
      },
      expected: {
        finalPc: 0,
        finalProps: {
          [PROP_ENERGY]: 500,
        },
        finalPeerEnergy: {
          2: 600,
        },
      },
    },
    {
      id: "rc34_role_resolution",
      baselineTraceId: "gt13_role_shift",
      description: "RESOLVE mode 0 should update role if quorum is met.",
      script: makeResolveRoleScript(MX.ROLE_ARCHITECT, 1),
      maxSteps: 3,
      initialRegs: [MX.ROLE_ARCHITECT],
      initialProps: {
        [PROP_X]: 705,
        [PROP_Y]: 405,
        [PROP_RESONANCE]: 0,
      },
      initialStructureGrid: {
        [structureNeighborCell(705, 405)]: STR_WIRE,
      },
      expected: {
        finalPc: 0,
        finalRole: MX.ROLE_ARCHITECT,
        finalProps: {
          [PROP_RESONANCE]: 20,
        },
      },
    },
    {
      id: "rc35_bank_resolution",
      baselineTraceId: "gt11_bank_sync",
      description: "RESOLVE mode 1 should deposit energy if quorum is met.",
      script: makeResolveBankScript(100),
      maxSteps: 3,
      initialRegs: [0, 0, 0, 0, 0, 0, 0, 0, 0], // Slot 0
      initialProps: {
        [PROP_ENERGY]: 1000,
        [PROP_RESONANCE]: 0,
        [PROP_X]: 705,
        [PROP_Y]: 405,
      },
      initialStructureGrid: {
        [structureNeighborCell(705, 405)]: STR_WIRE,
        [structureNeighborCell(705, 405) + 1]: STR_WIRE,
        [structureNeighborCell(705, 405) + 2]: STR_WIRE,
      },
      expected: {
        finalPc: 0,
        finalProps: {
          [PROP_ENERGY]: 900,
          [PROP_RESONANCE]: 10,
        },
        finalHiveEnergyPool: {
          0: 100,
        },
      },
    },
    {
      id: "rc36_genesis_guardian",
      baselineTraceId: "gt23_genesis_boot",
      description: "Native guardian_base run from GEENSIS_PROGRAMS.",
      script: new Uint8Array(),
      nativeProgram: "guardian_base",
      maxSteps: 100,
      initialProps: {
        [PROP_NEURAL_COHERENCE]: 500,
      },
      expected: {
        finalPc: 8,
        finalRole: MX.ROLE_GUARDIAN,
        signalCount: 1,
      },
    },
    {
      id: "rc37_genesis_architect",
      baselineTraceId: "gt23_genesis_boot",
      description: "Native architect_base run from GEENSIS_PROGRAMS.",
      script: new Uint8Array(),
      nativeProgram: "architect_base",
      maxSteps: 100,
      initialProps: {
        [PROP_NEURAL_COHERENCE]: 0,
      },
      expected: {
        finalPc: 16,
        finalRole: MX.ROLE_ARCHITECT,
        buildCount: 1,
      },
    },
  ]);

export const reductionCaseById = (id: string): ReductionCaseDefinition | undefined =>
  REDUCTION_CASES.find((c) => c.id === id);
