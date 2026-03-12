import {
  applyPressureRingScaleLedgerRuntimeUpdate,
  createPressureRingScaleLedgerRuntime,
  rollbackPressureRingScaleLedgerRuntimeUpdate,
  snapshotPressureRingScaleLedgerRuntime,
} from "@03/03/PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const initial = createPressureRingScaleLedgerRuntime(256, 8);
  const applied = applyPressureRingScaleLedgerRuntimeUpdate(initial, {
    value: 512,
    tick: 220,
    source: "test",
    reason: "raise_scale",
  });
  expect(
    applied.status === "applied",
    "[pressure_ring_scale_ledger_runtime] apply must succeed",
  );
  expect(
    applied.changed,
    "[pressure_ring_scale_ledger_runtime] apply must change state",
  );
  expect(
    applied.mutation?.rollbackToken?.includes("pulse.pressureRing.scale@220:"),
    "[pressure_ring_scale_ledger_runtime] apply must produce rollback token",
  );

  const stale = applyPressureRingScaleLedgerRuntimeUpdate(applied.state, {
    value: 640,
    tick: 221,
    source: "test",
    reason: "raise_more",
  });
  expect(
    stale.status === "applied",
    "[pressure_ring_scale_ledger_runtime] second apply must succeed",
  );
  const staleRollback = rollbackPressureRingScaleLedgerRuntimeUpdate(
    stale.state,
    {
      rollbackToken: applied.mutation!.rollbackToken,
      tick: 222,
      source: "test",
      reason: "stale_attempt",
    },
  );
  expect(
    staleRollback.status === "stale",
    "[pressure_ring_scale_ledger_runtime] non-latest token must be stale",
  );

  const rolled = rollbackPressureRingScaleLedgerRuntimeUpdate(stale.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 223,
    source: "test",
    reason: "undo_latest",
  });
  expect(
    rolled.status === "rolled_back",
    "[pressure_ring_scale_ledger_runtime] latest token must roll back",
  );
  expect(
    rolled.nextValue === applied.nextValue,
    "[pressure_ring_scale_ledger_runtime] rollback must restore previous scale",
  );

  const consumed = rollbackPressureRingScaleLedgerRuntimeUpdate(rolled.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 224,
    source: "test",
    reason: "repeat_rollback",
  });
  expect(
    consumed.status === "consumed",
    "[pressure_ring_scale_ledger_runtime] token must become consumed after rollback",
  );

  const snapshot = snapshotPressureRingScaleLedgerRuntime(rolled.state);
  expect(
    snapshot.historyDepth >= 2,
    "[pressure_ring_scale_ledger_runtime] snapshot must expose history depth",
  );

  console.log(
    `[pressure_ring_scale_ledger_runtime] contract guard passed. history=${snapshot.historyDepth}`,
  );
};

main();
