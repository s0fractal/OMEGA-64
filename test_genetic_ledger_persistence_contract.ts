import {
  appendBaseTaxLedgerRecord,
  hydrateBaseTaxLedgerRuntime,
  recordFromApplyMutation,
  recordFromRollbackMutation,
} from "./GENETIC_LEDGER_PERSISTENCE.ts";
import {
  applyBaseTaxLedgerRuntimeUpdate,
  createBaseTaxLedgerRuntime,
  rollbackBaseTaxLedgerRuntimeUpdate,
} from "./GENETIC_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-" });
  const path = `${dir}/base_tax_ledger.jsonl`;

  const initial = createBaseTaxLedgerRuntime(2, 8);
  const first = applyBaseTaxLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  expect(
    first.mutation !== null,
    "[genetic_ledger_persistence] first apply must mint mutation",
  );
  await appendBaseTaxLedgerRecord(
    recordFromApplyMutation(first.mutation!),
    path,
  );

  const second = applyBaseTaxLedgerRuntimeUpdate(first.state, {
    value: 7,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  expect(
    second.mutation !== null,
    "[genetic_ledger_persistence] second apply must mint mutation",
  );
  await appendBaseTaxLedgerRecord(
    recordFromApplyMutation(second.mutation!),
    path,
  );

  const rollback = rollbackBaseTaxLedgerRuntimeUpdate(second.state, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  expect(
    rollback.status === "rolled_back" && rollback.mutation !== null,
    "[genetic_ledger_persistence] rollback must succeed",
  );
  await appendBaseTaxLedgerRecord(
    recordFromRollbackMutation(rollback.mutation!),
    path,
  );

  const hydrated = await hydrateBaseTaxLedgerRuntime(2, 8, path);
  expect(
    hydrated.snapshot.currentValue === 5,
    "[genetic_ledger_persistence] hydration must restore post-rollback value",
  );
  expect(
    hydrated.persistence.recordCount === 3,
    "[genetic_ledger_persistence] hydration must count persisted records",
  );
  expect(
    hydrated.persistence.rollbackCount === 1,
    "[genetic_ledger_persistence] hydration must count rollback records",
  );
  expect(
    hydrated.persistence.hydrated,
    "[genetic_ledger_persistence] hydration summary must be green",
  );

  console.log(
    `[genetic_ledger_persistence] contract guard passed. records=${hydrated.persistence.recordCount}`,
  );
};

await main();
