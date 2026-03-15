// test_replay_audit_topological_signature.ts
// Replay audit checks projection anchors emitted by the gate.

import { GATE_GATE as GATE } from "@generated";
import { LEDGER__08_00_LEDGER as LEDGER } from "@generated";
import { REPLAY_AUDIT__08_00_REPLAY_AUDIT as REPLAY_AUDIT } from "@generated";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@generated";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
});

const baseProposal = (tick: number, baseHash: string): DeltaProposal => ({
  proposal_id: "audit_sig_p1",
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "audit_signature",
  confidence: 1,
  delta: [{ level: 5, value: 3 }, { level: 13, value: 11 }],
  cost_estimate: 120,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  causal_refs: ["e".repeat(64)],
});

async function withTempLedger<T>(fn: () => Promise<T>): Promise<T> {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-audit-toposig-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");
  try {
    return await fn();
  } finally {
    try {
      await Deno.remove(LEDGER.STORAGE_PATH);
    } catch {
      // ignore cleanup errors
    }
    LEDGER.STORAGE_PATH = originalPath;
  }
}

Deno.test("replay audit validates topological signature fields", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 10,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_10",
    };

    await GATE.process(genesis, [baseProposal(10, "state_10")], baseConfig());

    const result = await REPLAY_AUDIT.audit(
      {
        tick: 10,
        state_i16: genesis.state_i16,
        state_hash: "state_10",
      },
      {
        runs: 2,
        startTick: 10,
        endTick: 10,
        verifyTopologicalSignatures: true,
      },
    );

    if (!result.replayGreen) {
      throw new Error(
        `replay should be green, got failures: ${result.failures.join(",")}`,
      );
    }
    if (result.checkedProjectionEvents !== 1) {
      throw new Error(
        `expected 1 checked projection event, got ${result.checkedProjectionEvents}`,
      );
    }
    if (result.skippedProjectionEvents !== 0) {
      throw new Error(
        `expected 0 skipped projection events, got ${result.skippedProjectionEvents}`,
      );
    }
  });
});

Deno.test("replay audit fails when projection hashes are tampered", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 20,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_20",
    };

    await GATE.process(genesis, [baseProposal(20, "state_20")], baseConfig());

    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const ledgerIdx = lines.findIndex((line) =>
      !line.includes('"event_type":')
    );
    if (ledgerIdx < 0) {
      throw new Error(`expected at least 1 ledger line, got ${lines.length}`);
    }
    const evt = JSON.parse(lines[ledgerIdx]);
    evt.projection_2d_hash = "f".repeat(64);
    lines[ledgerIdx] = JSON.stringify(evt);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, lines.join("\n") + "\n");

    const result = await REPLAY_AUDIT.audit(
      {
        tick: 20,
        state_i16: genesis.state_i16,
        state_hash: "state_20",
      },
      {
        runs: 1,
        startTick: 20,
        endTick: 20,
        verifyTopologicalSignatures: true,
      },
    );

    if (result.replayGreen) {
      throw new Error("replay should fail for tampered projection hash");
    }
    if (!result.failures.some((f) => f.includes("projection mismatch"))) {
      throw new Error(
        `expected projection mismatch failure, got: ${
          result.failures.join(",")
        }`,
      );
    }
  });
});
