import { scriptToGlyphTape } from "./runtime_bridge/opcode_to_glyph.ts";
import {
  REDUCTION_CASES,
  reductionCaseById,
} from "./verification/reduction_cases.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  expect(
    REDUCTION_CASES.length === 18,
    "[reduction_cases] expected 18 reduction cases",
  );

  const ids = new Set(REDUCTION_CASES.map((definition) => definition.id));
  expect(ids.size === REDUCTION_CASES.length, "[reduction_cases] ids must be unique");

  for (const definition of REDUCTION_CASES) {
    expect(
      definition.baselineTraceId === "gt01_coldstart_seeded_swarm" ||
        definition.baselineTraceId === "gt03_pheromone_inject" ||
        definition.baselineTraceId === "gt04_plasmid_inject" ||
        definition.baselineTraceId === "gt08_structure_intent_visibility" ||
        definition.baselineTraceId === "gt05_homeostasis_correction" ||
        definition.baselineTraceId === "gt09_collective_transport" ||
        definition.baselineTraceId === "gt10_share_transfer" ||
        definition.baselineTraceId === "gt11_collective_banking" ||
        definition.baselineTraceId === "gt12_collective_synchrony",
      `[reduction_cases] unexpected baseline anchor for ${definition.id}`,
    );
    expect(
      definition.maxSteps > 0,
      `[reduction_cases] maxSteps must be positive for ${definition.id}`,
    );
    const tape = scriptToGlyphTape(definition.script);
    expect(
      tape.every((token) => token.mapped),
      `[reduction_cases] all tokens must map into GlyphIR64 for ${definition.id}`,
    );
  }

  expect(
    reductionCaseById("rc01_gt01_replicator_loop") !== null,
    "[reduction_cases] rc01 must be addressable by id",
  );
  expect(
    reductionCaseById("rc06_gt05_band_anchor_mismatch") !== null,
    "[reduction_cases] rc06 must be addressable by id",
  );
  expect(
    reductionCaseById("rc08_gt04_plasmid_zero_branch") !== null,
    "[reduction_cases] rc08 must be addressable by id",
  );
  expect(
    reductionCaseById("rc10_gt08_structure_intent_typed_miss") !== null,
    "[reduction_cases] rc10 must be addressable by id",
  );
  expect(
    reductionCaseById("rc12_gt09_collective_pheromone_emit") !== null,
    "[reduction_cases] rc12 must be addressable by id",
  );
  expect(
    reductionCaseById("rc14_gt10_share_transfer_empty_bond") !== null,
    "[reduction_cases] rc14 must be addressable by id",
  );
  expect(
    reductionCaseById("rc16_gt11_collective_bank_withdraw") !== null,
    "[reduction_cases] rc16 must be addressable by id",
  );
  expect(
    reductionCaseById("rc18_gt12_collective_pc_sync_quorum") !== null,
    "[reduction_cases] rc18 must be addressable by id",
  );

  console.log(
    `[reduction_cases] contract guard passed. cases=${REDUCTION_CASES.length}`,
  );
};

main();
