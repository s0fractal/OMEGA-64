import {
  appendTargetEnergyLedgerRecord,
  hydrateTargetEnergyLedgerRuntime,
  recordFromTargetEnergyApplyMutation,
  recordFromTargetEnergyRollbackMutation,
} from "@03/03/HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts";
import {
  applyTargetEnergyLedgerRuntimeUpdate,
  createTargetEnergyLedgerRuntime,
  rollbackTargetEnergyLedgerRuntimeUpdate,
} from "@03/03/HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  const dir = await Deno.makeTempDir({ prefix: "omega-ledger-" });
  const path = `${dir}/target_energy_ledger.jsonl`;

  const initial = createTargetEnergyLedgerRuntime(2, 8);
  const first = applyTargetEnergyLedgerRuntimeUpdate(initial, {
    value: 5,
    tick: 10,
    source: "test",
    reason: "apply_first",
  });
  expect(
    first.mutation !== null,
    "[homeostasis_target_ledger_persistence] first apply must mint mutation",
  );
  await appendTargetEnergyLedgerRecord(
    recordFromTargetEnergyApplyMutation(first.mutation!),
    path,
  );

  const second = applyTargetEnergyLedgerRuntimeUpdate(first.state, {
    value: 7,
    tick: 11,
    source: "test",
    reason: "apply_second",
  });
  expect(
    second.mutation !== null,
    "[homeostasis_target_ledger_persistence] second apply must mint mutation",
  );
  await appendTargetEnergyLedgerRecord(
    recordFromTargetEnergyApplyMutation(second.mutation!),
    path,
  );

  const rollback = rollbackTargetEnergyLedgerRuntimeUpdate(second.state, {
    rollbackToken: second.mutation!.rollbackToken,
    tick: 12,
    source: "test",
    reason: "rollback_second",
  });
  expect(
    rollback.status === "rolled_back" && rollback.mutation !== null,
    "[homeostasis_target_ledger_persistence] rollback must succeed",
  );
  await appendTargetEnergyLedgerRecord(
    recordFromTargetEnergyRollbackMutation(rollback.mutation!),
    path,
  );

  const hydrated = await hydrateTargetEnergyLedgerRuntime(2, 8, path);
  expect(
    hydrated.snapshot.currentValue === 5,
    "[homeostasis_target_ledger_persistence] hydration must restore post-rollback value",
  );
  expect(
    hydrated.persistence.recordCount === 3,
    "[homeostasis_target_ledger_persistence] hydration must count persisted records",
  );
  expect(
    hydrated.persistence.rollbackCount === 1,
    "[homeostasis_target_ledger_persistence] hydration must count rollback records",
  );
  expect(
    hydrated.persistence.hydrated,
    "[homeostasis_target_ledger_persistence] hydration summary must be green",
  );

  console.log(
    `[homeostasis_target_ledger_persistence] contract guard passed. records=${hydrated.persistence.recordCount}`,
  );
};

await main();
