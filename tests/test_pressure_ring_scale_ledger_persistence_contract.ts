import {
  appendPressureRingScaleLedgerRecord,
  hydratePressureRingScaleLedgerRuntime,
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
  const dir = await Deno.makeTempDir({ prefix: "omega-ring-ledger-" });
  const path = `${dir}/pressure_ring_scale_ledger.jsonl`;

  const initial = createPressureRingScaleLedgerRuntime(256, 8);
  const first = applyPressureRingScaleLedgerRuntimeUpdate(initial, {
    value: 512,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  expect(
    first.mutation !== null,
    "[pressure_ring_scale_ledger_persistence] first apply must mint mutation",
  );
  await appendPressureRingScaleLedgerRecord(
    recordFromPressureRingScaleApplyMutation(first.mutation!),
    path,
  );

  const second = applyPressureRingScaleLedgerRuntimeUpdate(first.state, {
    value: 768,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  expect(
    second.mutation !== null,
    "[pressure_ring_scale_ledger_persistence] second apply must mint mutation",
  );
  await appendPressureRingScaleLedgerRecord(
    recordFromPressureRingScaleApplyMutation(second.mutation!),
    path,
  );

  const rollback = rollbackPressureRingScaleLedgerRuntimeUpdate(second.state, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  expect(
    rollback.status === "rolled_back" && rollback.mutation !== null,
    "[pressure_ring_scale_ledger_persistence] rollback must succeed",
  );
  await appendPressureRingScaleLedgerRecord(
    recordFromPressureRingScaleRollbackMutation(rollback.mutation!),
    path,
  );

  const hydrated = await hydratePressureRingScaleLedgerRuntime(256, 8, path);
  expect(
    hydrated.snapshot.currentValue === 512,
    "[pressure_ring_scale_ledger_persistence] hydration must restore post-rollback value",
  );
  expect(
    hydrated.persistence.recordCount === 3,
    "[pressure_ring_scale_ledger_persistence] hydration must count persisted records",
  );
  expect(
    hydrated.persistence.rollbackCount === 1,
    "[pressure_ring_scale_ledger_persistence] hydration must count rollback records",
  );
  expect(
    hydrated.persistence.hydrated,
    "[pressure_ring_scale_ledger_persistence] hydration summary must be green",
  );

  console.log(
    `[pressure_ring_scale_ledger_persistence] contract guard passed. records=${hydrated.persistence.recordCount}`,
  );
};

await main();
