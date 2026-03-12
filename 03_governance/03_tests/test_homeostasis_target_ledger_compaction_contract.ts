import {
  appendTargetEnergyLedgerRecordAndMaybeCompact,
  hydrateTargetEnergyLedgerRuntime,
  readTargetEnergyLedgerPersistenceSummary,
  recordFromTargetEnergyApplyMutation,
  recordFromTargetEnergyRollbackMutation,
} from "@03/03_tests/HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts";
import {
  applyTargetEnergyLedgerRuntimeUpdate,
  createTargetEnergyLedgerRuntime,
  rollbackTargetEnergyLedgerRuntimeUpdate,
} from "@03/03_tests/HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-compact-" });
  const path = `${dir}/target_energy_ledger.jsonl`;
  const snapshotPath = `${dir}/target_energy_ledger.snapshot.json`;

  let runtime = createTargetEnergyLedgerRuntime(2, 8);

  const first = applyTargetEnergyLedgerRuntimeUpdate(runtime, {
    value: 4,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  runtime = first.state;
  await appendTargetEnergyLedgerRecordAndMaybeCompact(
    recordFromTargetEnergyApplyMutation(first.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const second = applyTargetEnergyLedgerRuntimeUpdate(runtime, {
    value: 6,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  runtime = second.state;
  await appendTargetEnergyLedgerRecordAndMaybeCompact(
    recordFromTargetEnergyApplyMutation(second.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const rollback = rollbackTargetEnergyLedgerRuntimeUpdate(runtime, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  runtime = rollback.state;
  await appendTargetEnergyLedgerRecordAndMaybeCompact(
    recordFromTargetEnergyRollbackMutation(rollback.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const third = applyTargetEnergyLedgerRuntimeUpdate(runtime, {
    value: 5,
    tick: 13,
    source: "test",
    reason: "apply_third",
  });
  runtime = third.state;
  await appendTargetEnergyLedgerRecordAndMaybeCompact(
    recordFromTargetEnergyApplyMutation(third.mutation!),
    {
      initialValue: 2,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const fourth = applyTargetEnergyLedgerRuntimeUpdate(runtime, {
    value: 7,
    tick: 14,
    source: "test",
    reason: "apply_fourth",
  });
  runtime = fourth.state;
  const persisted = await appendTargetEnergyLedgerRecordAndMaybeCompact(
    recordFromTargetEnergyApplyMutation(fourth.mutation!),
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
    "[homeostasis_target_ledger_compaction] compaction must materialize snapshot file",
  );
  expect(
    persisted.snapshotRecordCount > 0,
    "[homeostasis_target_ledger_compaction] snapshot must represent compacted records",
  );
  expect(
    persisted.tailRecordCount <= 2,
    "[homeostasis_target_ledger_compaction] compaction must keep only bounded tail",
  );
  expect(
    persisted.recordCount === 5,
    "[homeostasis_target_ledger_compaction] summary must preserve total represented record count",
  );
  expect(
    persisted.lastCompactedAt !== null,
    "[homeostasis_target_ledger_compaction] compaction must stamp lastCompactedAt",
  );

  const summary = await readTargetEnergyLedgerPersistenceSummary(
    path,
    snapshotPath,
  );
  expect(
    summary.snapshotExists,
    "[homeostasis_target_ledger_compaction] read summary must see persisted snapshot",
  );
  expect(
    summary.tailRecordCount <= 2,
    "[homeostasis_target_ledger_compaction] read summary must report compacted tail depth",
  );

  const hydrated = await hydrateTargetEnergyLedgerRuntime(
    2,
    8,
    path,
    snapshotPath,
  );
  expect(
    hydrated.snapshot.currentValue === runtime.currentValue,
    "[homeostasis_target_ledger_compaction] hydration must reconstruct final runtime value from snapshot+tail",
  );
  expect(
    hydrated.persistence.snapshotExists,
    "[homeostasis_target_ledger_compaction] hydration summary must retain snapshot visibility",
  );

  console.log(
    `[homeostasis_target_ledger_compaction] contract guard passed. total=${summary.recordCount} tail=${summary.tailRecordCount}`,
  );
};

await main();
