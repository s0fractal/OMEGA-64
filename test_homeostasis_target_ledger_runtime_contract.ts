import {
  applyTargetEnergyLedgerRuntimeUpdate,
  createTargetEnergyLedgerRuntime,
  rollbackTargetEnergyLedgerRuntimeUpdate,
  snapshotTargetEnergyLedgerRuntime,
} from "./HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const initial = createTargetEnergyLedgerRuntime(2, 8);
  const applied = applyTargetEnergyLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 120,
    source: "test",
    reason: "raise_tax",
  });
  expect(
    applied.status === "applied",
    "[homeostasis_target_ledger_runtime] apply must succeed",
  );
  expect(
    applied.changed,
    "[homeostasis_target_ledger_runtime] apply must change state",
  );
  expect(
    applied.mutation?.rollbackToken?.includes(
      "pulse.homeostasis.targetEnergy@120:",
    ),
    "[homeostasis_target_ledger_runtime] apply must produce rollback token",
  );

  const stale = applyTargetEnergyLedgerRuntimeUpdate(applied.state, {
    value: 7,
    tick: 121,
    source: "test",
    reason: "raise_more",
  });
  expect(
    stale.status === "applied",
    "[homeostasis_target_ledger_runtime] second apply must succeed",
  );
  const staleRollback = rollbackTargetEnergyLedgerRuntimeUpdate(stale.state, {
    rollbackToken: applied.mutation!.rollbackToken,
    tick: 122,
    source: "test",
    reason: "stale_attempt",
  });
  expect(
    staleRollback.status === "stale",
    "[homeostasis_target_ledger_runtime] non-latest token must be stale",
  );

  const rolled = rollbackTargetEnergyLedgerRuntimeUpdate(stale.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 123,
    source: "test",
    reason: "undo_latest",
  });
  expect(
    rolled.status === "rolled_back",
    "[homeostasis_target_ledger_runtime] latest token must roll back",
  );
  expect(
    rolled.nextValue === applied.nextValue,
    "[homeostasis_target_ledger_runtime] rollback must restore previous target energy",
  );

  const consumed = rollbackTargetEnergyLedgerRuntimeUpdate(rolled.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 124,
    source: "test",
    reason: "repeat_rollback",
  });
  expect(
    consumed.status === "consumed",
    "[homeostasis_target_ledger_runtime] token must become consumed after rollback",
  );

  const snapshot = snapshotTargetEnergyLedgerRuntime(rolled.state);
  expect(
    snapshot.historyDepth >= 2,
    "[homeostasis_target_ledger_runtime] snapshot must expose history depth",
  );

  console.log(
    `[homeostasis_target_ledger_runtime] contract guard passed. history=${snapshot.historyDepth}`,
  );
};

main();
