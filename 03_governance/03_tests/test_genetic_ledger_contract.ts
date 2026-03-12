import { GENETIC_LEDGER_CATALOG, geneticLedgerBaseline, geneticLedgerEntryByKey } from "@03";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  expect(
    GENETIC_LEDGER_CATALOG.length >= 10,
    "[genetic_ledger] expected a non-trivial initial ledger surface",
  );

  const keys = new Set(GENETIC_LEDGER_CATALOG.map((entry) => entry.key));
  expect(
    keys.size === GENETIC_LEDGER_CATALOG.length,
    "[genetic_ledger] keys must be unique",
  );

  for (const entry of GENETIC_LEDGER_CATALOG) {
    expect(
      entry.min <= entry.defaultValue,
      `[genetic_ledger] default below min for ${entry.key}`,
    );
    expect(
      entry.defaultValue <= entry.max,
      `[genetic_ledger] default above max for ${entry.key}`,
    );
    expect(
      entry.notes.trim().length > 0,
      `[genetic_ledger] notes missing for ${entry.key}`,
    );
    expect(
      entry.sourcePath === entry.key,
      `[genetic_ledger] sourcePath must stay canonical for ${entry.key}`,
    );
  }

  const baseline = geneticLedgerBaseline();
  expect(
    Object.keys(baseline).length === GENETIC_LEDGER_CATALOG.length,
    "[genetic_ledger] baseline size mismatch",
  );
  expect(
    geneticLedgerEntryByKey("pulse.homeostasis.targetEnergy")?.mutability ===
      "daemon-governed",
    "[genetic_ledger] targetEnergy must be daemon-governed",
  );
  expect(
    geneticLedgerEntryByKey("federation.admission.degradeEnergyRatio")
      ?.rollbackClass === "epochal",
    "[genetic_ledger] federation degrade ratio must stay epochal",
  );

  console.log(
    `[genetic_ledger] contract guard passed. entries=${GENETIC_LEDGER_CATALOG.length}`,
  );
};

main();
