import {
  appendDaemonPlasmidLedgerRecord,
  hydrateDaemonPlasmidLedgerRuntime,
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
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-" });
  const path = `${dir}/daemon_plasmid_ledger.jsonl`;

  const initial = createDaemonPlasmidLedgerRuntime(2, 8);
  const first = applyDaemonPlasmidLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  expect(
    first.mutation !== null,
    "[daemon_plasmid_ledger_persistence] first apply must mint mutation",
  );
  await appendDaemonPlasmidLedgerRecord(
    recordFromDaemonPlasmidApplyMutation(first.mutation!),
    path,
  );

  const second = applyDaemonPlasmidLedgerRuntimeUpdate(first.state, {
    value: 7,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  expect(
    second.mutation !== null,
    "[daemon_plasmid_ledger_persistence] second apply must mint mutation",
  );
  await appendDaemonPlasmidLedgerRecord(
    recordFromDaemonPlasmidApplyMutation(second.mutation!),
    path,
  );

  const rollback = rollbackDaemonPlasmidLedgerRuntimeUpdate(second.state, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  expect(
    rollback.status === "rolled_back" && rollback.mutation !== null,
    "[daemon_plasmid_ledger_persistence] rollback must succeed",
  );
  await appendDaemonPlasmidLedgerRecord(
    recordFromDaemonPlasmidRollbackMutation(rollback.mutation!),
    path,
  );

  const hydrated = await hydrateDaemonPlasmidLedgerRuntime(2, 8, path);
  expect(
    hydrated.snapshot.currentValue === 5,
    "[daemon_plasmid_ledger_persistence] hydration must restore post-rollback value",
  );
  expect(
    hydrated.persistence.recordCount === 3,
    "[daemon_plasmid_ledger_persistence] hydration must count persisted records",
  );
  expect(
    hydrated.persistence.rollbackCount === 1,
    "[daemon_plasmid_ledger_persistence] hydration must count rollback records",
  );
  expect(
    hydrated.persistence.hydrated,
    "[daemon_plasmid_ledger_persistence] hydration summary must be green",
  );

  console.log(
    `[daemon_plasmid_ledger_persistence] contract guard passed. records=${hydrated.persistence.recordCount}`,
  );
};

await main();
