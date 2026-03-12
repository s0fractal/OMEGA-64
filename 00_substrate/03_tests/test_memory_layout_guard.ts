import * as OFFSETS from "@00";

const main = () => {
  const report = OFFSETS.validateMemoryLayout(OFFSETS.WASM_MEMORY_BYTES);
  if (!report.ok) {
    throw new Error(
      `[memory-layout-guard] layout validation failed:\n${
        report.errors.map((entry) => `- ${entry}`).join("\n")
      }`,
    );
  }

  if (report.latticeEnd !== OFFSETS.LATTICE_MEMORY_END) {
    throw new Error(
      `[memory-layout-guard] lattice end mismatch: report=${report.latticeEnd} offsets=${OFFSETS.LATTICE_MEMORY_END}`,
    );
  }

  const names = new Set(report.regions.map((region) => region.name));
  for (
    const required of [
      "IDS",
      "CONTEXT",
      "SPATIAL_GRID",
      "STRUCTURE_GRID",
      "ATTENTION_FIELD",
      "HIVE_ENERGY_POOL",
    ]
  ) {
    if (!names.has(required)) {
      throw new Error(
        `[memory-layout-guard] missing required region: ${required}`,
      );
    }
  }

  console.log(
    `[memory-layout-guard] layout guard passed. regions=${report.regions.length}`,
  );
};

main();
