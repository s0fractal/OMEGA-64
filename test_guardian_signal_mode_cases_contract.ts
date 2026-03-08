import { GUARDIAN_SIGNAL_MODE_CASES } from "./verification/guardian_signal_mode_cases.ts";

const main = () => {
  if (GUARDIAN_SIGNAL_MODE_CASES.length < 3) {
    throw new Error(
      "[guardian-signal-mode-cases] expected at least 3 mode-aware guardian cases",
    );
  }

  const ids = new Set<string>();
  for (const definition of GUARDIAN_SIGNAL_MODE_CASES) {
    if (ids.has(definition.id)) {
      throw new Error(
        `[guardian-signal-mode-cases] duplicate case id: ${definition.id}`,
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
          `[guardian-signal-mode-cases] missing expected entry for ${definition.id} mode=${mode}`,
        );
      }
    }
  }

  console.log(
    `[guardian-signal-mode-cases] contract guard passed. cases=${GUARDIAN_SIGNAL_MODE_CASES.length}`,
  );
};

main();
