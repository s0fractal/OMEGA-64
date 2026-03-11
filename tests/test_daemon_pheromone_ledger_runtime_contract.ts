import {
  applyDaemonPheromoneLedgerRuntimeUpdate,
  createDaemonPheromoneLedgerRuntime,
  rollbackDaemonPheromoneLedgerRuntimeUpdate,
  snapshotDaemonPheromoneLedgerRuntime,
} from "./DAEMON_PHEROMONE_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const initial = createDaemonPheromoneLedgerRuntime(2, 8);
  const applied = applyDaemonPheromoneLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 120,
    source: "test",
    reason: "raise_tax",
  });
  expect(
    applied.status === "applied",
    "[daemon_pheromone_ledger_runtime] apply must succeed",
  );
  expect(
    applied.changed,
    "[daemon_pheromone_ledger_runtime] apply must change state",
  );
  expect(
    applied.mutation?.rollbackToken?.includes(
      "daemon.maxPheromoneIntensity@120:",
    ),
    "[daemon_pheromone_ledger_runtime] apply must produce rollback token",
  );

  const stale = applyDaemonPheromoneLedgerRuntimeUpdate(applied.state, {
    value: 7,
    tick: 121,
    source: "test",
    reason: "raise_more",
  });
  expect(
    stale.status === "applied",
    "[daemon_pheromone_ledger_runtime] second apply must succeed",
  );
  const staleRollback = rollbackDaemonPheromoneLedgerRuntimeUpdate(
    stale.state,
    {
      rollbackToken: applied.mutation!.rollbackToken,
      tick: 122,
      source: "test",
      reason: "stale_attempt",
    },
  );
  expect(
    staleRollback.status === "stale",
    "[daemon_pheromone_ledger_runtime] non-latest token must be stale",
  );

  const rolled = rollbackDaemonPheromoneLedgerRuntimeUpdate(stale.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 123,
    source: "test",
    reason: "undo_latest",
  });
  expect(
    rolled.status === "rolled_back",
    "[daemon_pheromone_ledger_runtime] latest token must roll back",
  );
  expect(
    rolled.nextValue === applied.nextValue,
    "[daemon_pheromone_ledger_runtime] rollback must restore previous daemon pheromone",
  );

  const consumed = rollbackDaemonPheromoneLedgerRuntimeUpdate(rolled.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 124,
    source: "test",
    reason: "repeat_rollback",
  });
  expect(
    consumed.status === "consumed",
    "[daemon_pheromone_ledger_runtime] token must become consumed after rollback",
  );

  const snapshot = snapshotDaemonPheromoneLedgerRuntime(rolled.state);
  expect(
    snapshot.historyDepth >= 2,
    "[daemon_pheromone_ledger_runtime] snapshot must expose history depth",
  );

  console.log(
    `[daemon_pheromone_ledger_runtime] contract guard passed. history=${snapshot.historyDepth}`,
  );
};

main();
