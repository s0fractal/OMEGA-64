import {
  applyDaemonPlasmidLedgerRuntimeUpdate,
  createDaemonPlasmidLedgerRuntime,
  rollbackDaemonPlasmidLedgerRuntimeUpdate,
  snapshotDaemonPlasmidLedgerRuntime,
} from "@03/03_tests/DAEMON_PLASMID_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const initial = createDaemonPlasmidLedgerRuntime(2, 8);
  const applied = applyDaemonPlasmidLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 120,
    source: "test",
    reason: "raise_tax",
  });
  expect(
    applied.status === "applied",
    "[daemon_plasmid_ledger_runtime] apply must succeed",
  );
  expect(
    applied.changed,
    "[daemon_plasmid_ledger_runtime] apply must change state",
  );
  expect(
    applied.mutation?.rollbackToken?.includes(
      "daemon.maxPlasmidCharge@120:",
    ),
    "[daemon_plasmid_ledger_runtime] apply must produce rollback token",
  );

  const stale = applyDaemonPlasmidLedgerRuntimeUpdate(applied.state, {
    value: 7,
    tick: 121,
    source: "test",
    reason: "raise_more",
  });
  expect(
    stale.status === "applied",
    "[daemon_plasmid_ledger_runtime] second apply must succeed",
  );
  const staleRollback = rollbackDaemonPlasmidLedgerRuntimeUpdate(
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
    "[daemon_plasmid_ledger_runtime] non-latest token must be stale",
  );

  const rolled = rollbackDaemonPlasmidLedgerRuntimeUpdate(stale.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 123,
    source: "test",
    reason: "undo_latest",
  });
  expect(
    rolled.status === "rolled_back",
    "[daemon_plasmid_ledger_runtime] latest token must roll back",
  );
  expect(
    rolled.nextValue === applied.nextValue,
    "[daemon_plasmid_ledger_runtime] rollback must restore previous daemon plasmid",
  );

  const consumed = rollbackDaemonPlasmidLedgerRuntimeUpdate(rolled.state, {
    rollbackToken: stale.mutation!.rollbackToken,
    tick: 124,
    source: "test",
    reason: "repeat_rollback",
  });
  expect(
    consumed.status === "consumed",
    "[daemon_plasmid_ledger_runtime] token must become consumed after rollback",
  );

  const snapshot = snapshotDaemonPlasmidLedgerRuntime(rolled.state);
  expect(
    snapshot.historyDepth >= 2,
    "[daemon_plasmid_ledger_runtime] snapshot must expose history depth",
  );

  console.log(
    `[daemon_plasmid_ledger_runtime] contract guard passed. history=${snapshot.historyDepth}`,
  );
};

main();
