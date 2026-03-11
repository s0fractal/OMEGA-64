import {
  appendLedgerRecord,
  hydrateLedgerRuntime,
  recordFromApply,
  recordFromRollback,
} from "./GENERIC_LEDGER_PERSISTENCE.ts";
import {
  applyLedgerUpdate,
  createGeneticLedgerRuntime,
  createLedgerRuntime,
  rollbackLedgerUpdate,
} from "./GENERIC_LEDGER_SYSTEM.ts";

import { getLogPath } from "./GENERIC_LEDGER_PERSISTENCE.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const cleanup = async (path: string) => {
  try {
    await Deno.remove(path);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }
};

const main = async () => {
  const key = "daemon.maxPheromoneIntensity";
  const path = getLogPath(key);

  await cleanup(path);
  const initial = createGeneticLedgerRuntime(key, 2, 8);
  const first = applyLedgerUpdate(initial, {
    value: 5,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  expect(
    first.mutation !== null,
    "[generic_ledger_persistence] first apply must mint mutation",
  );
  await appendLedgerRecord(
    recordFromApply(first.mutation!, key),
  );

  const second = applyLedgerUpdate(first.state, {
    value: 7,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  expect(
    second.mutation !== null,
    "[generic_ledger_persistence] second apply must mint mutation",
  );
  await appendLedgerRecord(
    recordFromApply(second.mutation!, key),
  );

  const rollback = rollbackLedgerUpdate(second.state, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  expect(
    rollback.status === "rolled_back" && rollback.mutation !== null,
    "[generic_ledger_persistence] rollback must succeed",
  );
  await appendLedgerRecord(
    recordFromRollback(rollback.mutation!, key),
  );

  const hydrated = await hydrateLedgerRuntime(key, {
    initialValue: 2,
    historyLimit: 8,
  });
  expect(
    hydrated.snapshot.currentValue === 5,
    "[generic_ledger_persistence] hydration must restore post-rollback value",
  );
  expect(
    hydrated.persistence.recordCount === 3,
    "[generic_ledger_persistence] hydration must count persisted records",
  );
  expect(
    hydrated.persistence.rollbackCount === 1,
    "[generic_ledger_persistence] hydration must count rollback records",
  );
  expect(
    hydrated.persistence.hydrated,
    "[generic_ledger_persistence] hydration summary must be green",
  );

  console.log(
    `[generic_ledger_persistence] contract guard passed. records=${hydrated.persistence.recordCount}`,
  );

  await cleanup(path);
};

await main();
