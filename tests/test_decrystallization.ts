// test_decrystallization.ts
// Smoke test for DECRYSTALLIZATION_EVENT emission and rollback hint.

import { CRYSTALLIZATION_CRYSTALLIZATION as CRYSTALLIZATION } from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import {
  STATE_SNAPSHOT_CanonizationEvent as CanonizationEvent,
  STATE_SNAPSHOT_LedgerEvent as LedgerEvent,
  STATE_SNAPSHOT_ViolationEvent as ViolationEvent,
} from "@omega";
import { CHECKPOINT_CHECKPOINT as CHECKPOINT } from "@omega";

export async function runTest() {
  console.log("🧪 TESTING: Decrystallization Enforcement");

  const originalPath = LEDGER.STORAGE_PATH;
  const originalCheckpointPath = CHECKPOINT.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-decrystal-",
    suffix: ".jsonl",
  });
  const tempCheckpointPath = await Deno.makeTempFile({
    prefix: "omega-checkpoint-decrystal-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  CHECKPOINT.STORAGE_PATH = tempCheckpointPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");
  await Deno.writeTextFile(CHECKPOINT.STORAGE_PATH, "");

  try {
    const canonEvent: CanonizationEvent = {
      event_type: "CANONIZATION_EVENT",
      artifact_hash: "artifact_demo",
      state_hash: "state_100",
      proposal_digest: "digest_100",
      checkpoint_tick: 100,
      window: 4,
      hard_gates: "PASS",
      soft_gates_passed: 6,
      witness: "test",
    };
    await LEDGER.append(canonEvent);
    await CHECKPOINT.save(
      {
        tick: 100,
        state_hash: "state_100",
        state_i16: new Int16Array(64).fill(100),
      },
      "TEST_CANON",
    );

    const e101: LedgerEvent = {
      event_id: "evt_101",
      tick: 101,
      ts_unix_ms: Date.now(),
      state_before_hash: "state_100",
      state_after_hash: "state_101",
      accepted_delta: [{ level: 1, value: 1 }],
      proposal_digest: "digest_101",
      accepted_proposals: ["p101"],
      rejected_proposals: [],
      cost_total: 1,
      budget_used: 1,
      budget_limit: 10,
      gate_config_version: "v0.2",
    };
    await LEDGER.append(e101);

    const critical: ViolationEvent = {
      event_type: "VIOLATION_EVENT",
      tick: 104,
      rule_id: "NO_BYPASS",
      severity: "CRITICAL",
      state_hash: "state_104",
      details: "manual violation for test",
      action_taken: "HALT_AND_QUARANTINE",
    };
    await LEDGER.append(critical);

    const result = await CRYSTALLIZATION.enforcePostCrystal(
      104,
      "artifact_demo",
      {
        windowSize: 4,
        witness: "test",
      },
    );

    console.log(`✅ decrystallized: ${result.decrystallized}`);
    console.log(`✅ rollbackTick: ${result.rollbackTick}`);
    console.log(`✅ reason: ${result.reason}`);

    if (!result.decrystallized) {
      throw new Error("Expected decrystallization on critical violation.");
    }
    if (result.rollbackTick !== 100) {
      throw new Error(
        `Expected rollback checkpoint 100, got ${result.rollbackTick}`,
      );
    }

    let found = false;
    for await (const entry of LEDGER.readAllRaw()) {
      if (
        "event_type" in entry && entry.event_type === "DECRYSTALLIZATION_EVENT"
      ) {
        if (entry.rollback_state_hash !== "state_100") {
          throw new Error(
            `Expected rollback_state_hash=state_100, got ${entry.rollback_state_hash}`,
          );
        }
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error("DECRYSTALLIZATION_EVENT was not emitted.");
    }
  } finally {
    try {
      await Deno.remove(LEDGER.STORAGE_PATH);
    } catch {
      // ignore cleanup errors
    }
    try {
      await Deno.remove(CHECKPOINT.STORAGE_PATH);
    } catch {
      // ignore cleanup errors
    }
    LEDGER.STORAGE_PATH = originalPath;
    CHECKPOINT.STORAGE_PATH = originalCheckpointPath;
  }
}

Deno.test("decrystallization emits event and rollback hint", async () => {
  await runTest();
});

if (import.meta.main) {
  await runTest();
}
