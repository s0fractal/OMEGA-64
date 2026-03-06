import {
  appendDaemonPheromoneLedgerRecord,
  hydrateDaemonPheromoneLedgerRuntime,
  recordFromDaemonPheromoneApplyMutation,
  recordFromDaemonPheromoneRollbackMutation,
} from "./DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts";
import {
  applyDaemonPheromoneLedgerRuntimeUpdate,
  createDaemonPheromoneLedgerRuntime,
  rollbackDaemonPheromoneLedgerRuntimeUpdate,
} from "./DAEMON_PHEROMONE_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-" });
  const path = `${dir}/daemon_pheromone_ledger.jsonl`;

  const initial = createDaemonPheromoneLedgerRuntime(2, 8);
  const first = applyDaemonPheromoneLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  expect(
    first.mutation !== null,
    "[daemon_pheromone_ledger_persistence] first apply must mint mutation",
  );
  await appendDaemonPheromoneLedgerRecord(
    recordFromDaemonPheromoneApplyMutation(first.mutation!),
    path,
  );

  const second = applyDaemonPheromoneLedgerRuntimeUpdate(first.state, {
    value: 7,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  expect(
    second.mutation !== null,
    "[daemon_pheromone_ledger_persistence] second apply must mint mutation",
  );
  await appendDaemonPheromoneLedgerRecord(
    recordFromDaemonPheromoneApplyMutation(second.mutation!),
    path,
  );

  const rollback = rollbackDaemonPheromoneLedgerRuntimeUpdate(second.state, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  expect(
    rollback.status === "rolled_back" && rollback.mutation !== null,
    "[daemon_pheromone_ledger_persistence] rollback must succeed",
  );
  await appendDaemonPheromoneLedgerRecord(
    recordFromDaemonPheromoneRollbackMutation(rollback.mutation!),
    path,
  );

  const hydrated = await hydrateDaemonPheromoneLedgerRuntime(2, 8, path);
  expect(
    hydrated.snapshot.currentValue === 5,
    "[daemon_pheromone_ledger_persistence] hydration must restore post-rollback value",
  );
  expect(
    hydrated.persistence.recordCount === 3,
    "[daemon_pheromone_ledger_persistence] hydration must count persisted records",
  );
  expect(
    hydrated.persistence.rollbackCount === 1,
    "[daemon_pheromone_ledger_persistence] hydration must count rollback records",
  );
  expect(
    hydrated.persistence.hydrated,
    "[daemon_pheromone_ledger_persistence] hydration summary must be green",
  );

  console.log(
    `[daemon_pheromone_ledger_persistence] contract guard passed. records=${hydrated.persistence.recordCount}`,
  );
};

await main();
