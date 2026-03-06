import {
  appendDaemonPheromoneLedgerRecordAndMaybeCompact,
  hydrateDaemonPheromoneLedgerRuntime,
  readDaemonPheromoneLedgerPersistenceSummary,
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
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-compact-" });
  const path = `${dir}/daemon_pheromone_ledger.jsonl`;
  const snapshotPath = `${dir}/daemon_pheromone_ledger.snapshot.json`;

  let runtime = createDaemonPheromoneLedgerRuntime(2, 8);

  const first = applyDaemonPheromoneLedgerRuntimeUpdate(runtime, {
    value: 4,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  runtime = first.state;
  await appendDaemonPheromoneLedgerRecordAndMaybeCompact(
    recordFromDaemonPheromoneApplyMutation(first.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const second = applyDaemonPheromoneLedgerRuntimeUpdate(runtime, {
    value: 6,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  runtime = second.state;
  await appendDaemonPheromoneLedgerRecordAndMaybeCompact(
    recordFromDaemonPheromoneApplyMutation(second.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const rollback = rollbackDaemonPheromoneLedgerRuntimeUpdate(runtime, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  runtime = rollback.state;
  await appendDaemonPheromoneLedgerRecordAndMaybeCompact(
    recordFromDaemonPheromoneRollbackMutation(rollback.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const third = applyDaemonPheromoneLedgerRuntimeUpdate(runtime, {
    value: 5,
    tick: 13,
    source: "test",
    reason: "apply_third",
  });
  runtime = third.state;
  await appendDaemonPheromoneLedgerRecordAndMaybeCompact(
    recordFromDaemonPheromoneApplyMutation(third.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const fourth = applyDaemonPheromoneLedgerRuntimeUpdate(runtime, {
    value: 7,
    tick: 14,
    source: "test",
    reason: "apply_fourth",
  });
  runtime = fourth.state;
  const persisted = await appendDaemonPheromoneLedgerRecordAndMaybeCompact(
    recordFromDaemonPheromoneApplyMutation(fourth.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  expect(
    persisted.snapshotExists,
    "[daemon_pheromone_ledger_compaction] compaction must materialize snapshot file",
  );
  expect(
    persisted.snapshotRecordCount > 0,
    "[daemon_pheromone_ledger_compaction] snapshot must represent compacted records",
  );
  expect(
    persisted.tailRecordCount <= 2,
    "[daemon_pheromone_ledger_compaction] compaction must keep only bounded tail",
  );
  expect(
    persisted.recordCount === 5,
    "[daemon_pheromone_ledger_compaction] summary must preserve total represented record count",
  );
  expect(
    persisted.lastCompactedAt !== null,
    "[daemon_pheromone_ledger_compaction] compaction must stamp lastCompactedAt",
  );

  const summary = await readDaemonPheromoneLedgerPersistenceSummary(
    path,
    snapshotPath,
  );
  expect(
    summary.snapshotExists,
    "[daemon_pheromone_ledger_compaction] read summary must see persisted snapshot",
  );
  expect(
    summary.tailRecordCount <= 2,
    "[daemon_pheromone_ledger_compaction] read summary must report compacted tail depth",
  );

  const hydrated = await hydrateDaemonPheromoneLedgerRuntime(
    2,
    8,
    path,
    snapshotPath,
  );
  expect(
    hydrated.snapshot.currentValue === runtime.currentValue,
    "[daemon_pheromone_ledger_compaction] hydration must reconstruct final runtime value from snapshot+tail",
  );
  expect(
    hydrated.persistence.snapshotExists,
    "[daemon_pheromone_ledger_compaction] hydration summary must retain snapshot visibility",
  );

  console.log(
    `[daemon_pheromone_ledger_compaction] contract guard passed. total=${summary.recordCount} tail=${summary.tailRecordCount}`,
  );
};

await main();
