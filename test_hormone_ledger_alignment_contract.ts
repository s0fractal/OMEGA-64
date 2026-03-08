import { HORMONE_BUFFER_CATALOG } from "./HORMONE_BUFFER.ts";
import { GENETIC_LEDGER_CATALOG } from "./GENETIC_LEDGER.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const hormoneIds = new Set(HORMONE_BUFFER_CATALOG.map((spec) => spec.id));
  const ledgerLinked = GENETIC_LEDGER_CATALOG.filter((entry) =>
    entry.hormoneLink !== null
  );

  expect(
    ledgerLinked.length === GENETIC_LEDGER_CATALOG.length,
    "[hormone_ledger] every initial ledger entry must map to a hormone",
  );

  for (const entry of ledgerLinked) {
    expect(
      hormoneIds.has(
        entry.hormoneLink as typeof HORMONE_BUFFER_CATALOG[number]["id"],
      ),
      `[hormone_ledger] missing hormone link target for ${entry.key}`,
    );
  }

  const daemonGoverned = GENETIC_LEDGER_CATALOG.filter((entry) =>
    entry.mutability === "daemon-governed"
  );
  expect(
    daemonGoverned.length >= 4,
    "[hormone_ledger] expected daemon-governed initial knobs",
  );

  const immediateRollback = GENETIC_LEDGER_CATALOG.filter((entry) =>
    entry.rollbackClass === "immediate"
  );
  expect(
    immediateRollback.length > 0,
    "[hormone_ledger] at least one ledger knob must allow immediate rollback",
  );

  console.log(
    `[hormone_ledger] alignment guard passed. hormones=${HORMONE_BUFFER_CATALOG.length} ledger=${GENETIC_LEDGER_CATALOG.length}`,
  );
};

main();
