import {
  appendPressureRingScaleLedgerRecordAndMaybeCompact,
  hydratePressureRingScaleLedgerRuntime,
  readPressureRingScaleLedgerPersistenceSummary,
  recordFromPressureRingScaleApplyMutation,
  recordFromPressureRingScaleRollbackMutation,
} from "./PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts";
import {
  applyPressureRingScaleLedgerRuntimeUpdate,
  createPressureRingScaleLedgerRuntime,
  rollbackPressureRingScaleLedgerRuntimeUpdate,
} from "./PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  const dir = await Deno.makeTempDir({ prefix: "omega-ring-ledger-compact-" });
  const path = `${dir}/pressure_ring_scale_ledger.jsonl`;
  const snapshotPath = `${dir}/pressure_ring_scale_ledger.snapshot.json`;

  let runtime = createPressureRingScaleLedgerRuntime(256, 8);

  const first = applyPressureRingScaleLedgerRuntimeUpdate(runtime, {
    value: 384,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  runtime = first.state;
  await appendPressureRingScaleLedgerRecordAndMaybeCompact(
    recordFromPressureRingScaleApplyMutation(first.mutation!),
    {
      initialValue: 256,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const second = applyPressureRingScaleLedgerRuntimeUpdate(runtime, {
    value: 512,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  runtime = second.state;
  await appendPressureRingScaleLedgerRecordAndMaybeCompact(
    recordFromPressureRingScaleApplyMutation(second.mutation!),
    {
      initialValue: 256,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const rollback = rollbackPressureRingScaleLedgerRuntimeUpdate(runtime, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  runtime = rollback.state;
  await appendPressureRingScaleLedgerRecordAndMaybeCompact(
    recordFromPressureRingScaleRollbackMutation(rollback.mutation!),
    {
      initialValue: 256,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const third = applyPressureRingScaleLedgerRuntimeUpdate(runtime, {
    value: 448,
    tick: 13,
    source: "test",
    reason: "apply_third",
  });
  runtime = third.state;
  await appendPressureRingScaleLedgerRecordAndMaybeCompact(
    recordFromPressureRingScaleApplyMutation(third.mutation!),
    {
      initialValue: 256,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  const fourth = applyPressureRingScaleLedgerRuntimeUpdate(runtime, {
    value: 640,
    tick: 14,
    source: "test",
    reason: "apply_fourth",
  });
  runtime = fourth.state;
  const persisted = await appendPressureRingScaleLedgerRecordAndMaybeCompact(
    recordFromPressureRingScaleApplyMutation(fourth.mutation!),
    {
      initialValue: 256,
      historyLimit: 8,
      path,
      snapshotPath,
      threshold: 4,
      keepTailRecords: 2,
    },
  );

  expect(
    persisted.snapshotExists,
    "[pressure_ring_scale_ledger_compaction] compaction must materialize snapshot file",
  );
  expect(
    persisted.snapshotRecordCount > 0,
    "[pressure_ring_scale_ledger_compaction] snapshot must represent compacted records",
  );
  expect(
    persisted.tailRecordCount <= 2,
    "[pressure_ring_scale_ledger_compaction] compaction must keep only bounded tail",
  );
  expect(
    persisted.recordCount === 5,
    "[pressure_ring_scale_ledger_compaction] summary must preserve total represented record count",
  );

  const summary = await readPressureRingScaleLedgerPersistenceSummary(
    path,
    snapshotPath,
  );
  expect(
    summary.snapshotExists,
    "[pressure_ring_scale_ledger_compaction] read summary must see persisted snapshot",
  );
  expect(
    summary.tailRecordCount <= 2,
    "[pressure_ring_scale_ledger_compaction] read summary must report compacted tail depth",
  );

  const hydrated = await hydratePressureRingScaleLedgerRuntime(
    256,
    8,
    path,
    snapshotPath,
  );
  expect(
    hydrated.snapshot.currentValue === runtime.currentValue,
    "[pressure_ring_scale_ledger_compaction] hydration must reconstruct final runtime value from snapshot+tail",
  );
  expect(
    hydrated.persistence.snapshotExists,
    "[pressure_ring_scale_ledger_compaction] hydration summary must retain snapshot visibility",
  );

  console.log(
    `[pressure_ring_scale_ledger_compaction] contract guard passed. total=${summary.recordCount} tail=${summary.tailRecordCount}`,
  );
};

await main();
