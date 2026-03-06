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
    REDUCTION_CASES.length === 6,
    "[reduction_cases] expected 6 initial reduction cases",
  );

  const ids = new Set(REDUCTION_CASES.map((definition) => definition.id));
  expect(ids.size === REDUCTION_CASES.length, "[reduction_cases] ids must be unique");

  for (const definition of REDUCTION_CASES) {
    expect(
      definition.baselineTraceId === "gt01_coldstart_seeded_swarm" ||
        definition.baselineTraceId === "gt03_pheromone_inject" ||
        definition.baselineTraceId === "gt05_homeostasis_correction",
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

  console.log(
    `[reduction_cases] contract guard passed. cases=${REDUCTION_CASES.length}`,
  );
};

main();
