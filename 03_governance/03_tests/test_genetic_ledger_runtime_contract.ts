import {
  applyBaseTaxLedgerRuntimeUpdate,
  createBaseTaxLedgerRuntime,
  rollbackBaseTaxLedgerRuntimeUpdate,
  snapshotBaseTaxLedgerRuntime,
} from "@03/03_tests/GENETIC_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const initial = createBaseTaxLedgerRuntime(2, 8);
  const applied = applyBaseTaxLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 120,
    source: "test",
    reason: "raise_tax",
  });
  expect(
    applied.status === "applied",
    "[genetic_ledger_runtime] apply must succeed",
  );
  expect(applied.changed, "[genetic_ledger_runtime] apply must change state");
  expect(
    applied.mutation?.rollbackToken?.includes("pulse.homeostasis.baseTax@120:"),
    "[genetic_ledger_runtime] apply must produce rollback token",
  );

  const stale = applyBaseTaxLedgerRuntimeUpdate(applied.state, {
    value: 7,
    tick: 121,
    source: "test",
    reason: "raise_more",
  });
  expect(
    stale.status === "applied",
    "[genetic_ledger_runtime] second apply must succeed",
  );
  const staleRollback = rollbackBaseTaxLedgerRuntimeUpdate(stale.state, {
    rollbackToken: applied.mutation!.rollbackToken,
    tick: 122,
    source: "test",
    reason: "stale_attempt",
  });
  expect(
    staleRollback.status === "stale",
    "[genetic_ledger_runtime] non-latest token must be stale",
  );

  const rolled = rollbackBaseTaxLedgerRuntimeUpdate(stale.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 123,
    source: "test",
    reason: "undo_latest",
  });
  expect(
    rolled.status === "rolled_back",
    "[genetic_ledger_runtime] latest token must roll back",
  );
  expect(
    rolled.nextValue === applied.nextValue,
    "[genetic_ledger_runtime] rollback must restore previous base tax",
  );

  const consumed = rollbackBaseTaxLedgerRuntimeUpdate(rolled.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 124,
    source: "test",
    reason: "repeat_rollback",
  });
  expect(
    consumed.status === "consumed",
    "[genetic_ledger_runtime] token must become consumed after rollback",
  );

  const snapshot = snapshotBaseTaxLedgerRuntime(rolled.state);
  expect(
    snapshot.historyDepth >= 2,
    "[genetic_ledger_runtime] snapshot must expose history depth",
  );

  console.log(
    `[genetic_ledger_runtime] contract guard passed. history=${snapshot.historyDepth}`,
  );
};

main();
