import { ARCHITECT_PLASMID_MODE_CASES } from "./verification/architect_plasmid_mode_cases.ts";

const main = () => {
  if (ARCHITECT_PLASMID_MODE_CASES.length < 3) {
    throw new Error(
      "[architect-plasmid-mode-cases] expected at least 3 mode-aware architect cases",
    );
  }

  const ids = new Set<string>();
  for (const definition of ARCHITECT_PLASMID_MODE_CASES) {
    if (ids.has(definition.id)) {
      throw new Error(
        `[architect-plasmid-mode-cases] duplicate case id: ${definition.id}`,
      );
    }
    ids.add(definition.id);
    for (
      const mode of [
        "legacy-execute",
        "shadow-reduce",
        "hybrid-reduce",
      ] as const
    ) {
      if (!definition.expected[mode]) {
        throw new Error(
          `[architect-plasmid-mode-cases] missing expected entry for ${definition.id} mode=${mode}`,
        );
      }
    }
  }

  console.log(
    `[architect-plasmid-mode-cases] contract guard passed. cases=${ARCHITECT_PLASMID_MODE_CASES.length}`,
  );
};

main();
