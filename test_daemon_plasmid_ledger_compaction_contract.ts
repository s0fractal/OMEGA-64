import {
  appendDaemonPlasmidLedgerRecordAndMaybeCompact,
  hydrateDaemonPlasmidLedgerRuntime,
  readDaemonPlasmidLedgerPersistenceSummary,
  recordFromDaemonPlasmidApplyMutation,
  recordFromDaemonPlasmidRollbackMutation,
} from "./DAEMON_PLASMID_LEDGER_PERSISTENCE.ts";
import {
  applyDaemonPlasmidLedgerRuntimeUpdate,
  createDaemonPlasmidLedgerRuntime,
  rollbackDaemonPlasmidLedgerRuntimeUpdate,
} from "./DAEMON_PLASMID_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-compact-" });
  const path = `${dir}/daemon_plasmid_ledger.jsonl`;
  const snapshotPath = `${dir}/daemon_plasmid_ledger.snapshot.json`;

  let runtime = createDaemonPlasmidLedgerRuntime(2, 8);

  const first = applyDaemonPlasmidLedgerRuntimeUpdate(runtime, {
    value: 4,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  runtime = first.state;
  await appendDaemonPlasmidLedgerRecordAndMaybeCompact(
    recordFromDaemonPlasmidApplyMutation(first.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const second = applyDaemonPlasmidLedgerRuntimeUpdate(runtime, {
    value: 6,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  runtime = second.state;
  await appendDaemonPlasmidLedgerRecordAndMaybeCompact(
    recordFromDaemonPlasmidApplyMutation(second.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const rollback = rollbackDaemonPlasmidLedgerRuntimeUpdate(runtime, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  runtime = rollback.state;
  await appendDaemonPlasmidLedgerRecordAndMaybeCompact(
    recordFromDaemonPlasmidRollbackMutation(rollback.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const third = applyDaemonPlasmidLedgerRuntimeUpdate(runtime, {
    value: 5,
    tick: 13,
    source: "test",
    reason: "apply_third",
  });
  runtime = third.state;
  await appendDaemonPlasmidLedgerRecordAndMaybeCompact(
    recordFromDaemonPlasmidApplyMutation(third.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const fourth = applyDaemonPlasmidLedgerRuntimeUpdate(runtime, {
    value: 7,
    tick: 14,
    source: "test",
    reason: "apply_fourth",
  });
  runtime = fourth.state;
  const persisted = await appendDaemonPlasmidLedgerRecordAndMaybeCompact(
    recordFromDaemonPlasmidApplyMutation(fourth.mutation!),
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
    "[daemon_plasmid_ledger_compaction] compaction must materialize snapshot file",
  );
  expect(
    persisted.snapshotRecordCount > 0,
    "[daemon_plasmid_ledger_compaction] snapshot must represent compacted records",
  );
  expect(
    persisted.tailRecordCount <= 2,
    "[daemon_plasmid_ledger_compaction] compaction must keep only bounded tail",
  );
  expect(
    persisted.recordCount === 5,
    "[daemon_plasmid_ledger_compaction] summary must preserve total represented record count",
  );
  expect(
    persisted.lastCompactedAt !== null,
    "[daemon_plasmid_ledger_compaction] compaction must stamp lastCompactedAt",
  );

  const summary = await readDaemonPlasmidLedgerPersistenceSummary(
    path,
    snapshotPath,
  );
  expect(
    summary.snapshotExists,
    "[daemon_plasmid_ledger_compaction] read summary must see persisted snapshot",
  );
  expect(
    summary.tailRecordCount <= 2,
    "[daemon_plasmid_ledger_compaction] read summary must report compacted tail depth",
  );

  const hydrated = await hydrateDaemonPlasmidLedgerRuntime(
    2,
    8,
    path,
    snapshotPath,
  );
  expect(
    hydrated.snapshot.currentValue === runtime.currentValue,
    "[daemon_plasmid_ledger_compaction] hydration must reconstruct final runtime value from snapshot+tail",
  );
  expect(
    hydrated.persistence.snapshotExists,
    "[daemon_plasmid_ledger_compaction] hydration summary must retain snapshot visibility",
  );

  console.log(
    `[daemon_plasmid_ledger_compaction] contract guard passed. total=${summary.recordCount} tail=${summary.tailRecordCount}`,
  );
};

await main();
