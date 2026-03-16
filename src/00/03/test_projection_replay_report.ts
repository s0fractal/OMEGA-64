// test_projection_replay_report.ts
// Verifies per-tick projection replay report summaries.

import { GATE_GATE as GATE } from "@g";
import { LEDGER__08_00_LEDGER as LEDGER } from "@g";
import { PROJECTION_REPLAY_REPORT_PROJECTION_REPLAY_REPORT as PROJECTION_REPLAY_REPORT } from "@g";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@g";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
});

const proposalFor = (
  tick: number,
  baseHash: string,
  id: string,
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "projection_report",
  confidence: 1,
  delta: [{ level: 32, value: 11 }],
  cost_estimate: 50,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  causal_refs: ["1".repeat(64)],
});

async function withTempLedger<T>(fn: () => Promise<T>): Promise<T> {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-proj-report-",
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

Deno.test("projection replay report summarizes pass/fail/skip", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 100,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_100",
    };

    const s101 = await GATE.process(genesis, [
      proposalFor(100, "state_100", "p1"),
    ], baseConfig());

    const dry = baseConfig();
    dry.dry_run = true;
    await GATE.process(
      { tick: 101, state_i16: s101.state_i16, state_hash: s101.state_hash },
      [proposalFor(101, s101.state_hash, "p2")],
      dry,
    );

    const report = await PROJECTION_REPLAY_REPORT.generate(
      {
        tick: 100,
        state_i16: genesis.state_i16,
        state_hash: "state_100",
      },
      {
        startTick: 100,
        endTick: 101,
      },
    );

    // Replay skips dry-run events in the deterministic chain, so we expect one PASS here.
    if (!report.ok) {
      throw new Error(
        `report should be ok, failures: ${report.failures.join(",")}`,
      );
    }
    if (report.passCount !== 1) {
      throw new Error(`expected passCount=1, got ${report.passCount}`);
    }
    if (report.failCount !== 0) {
      throw new Error(`expected failCount=0, got ${report.failCount}`);
    }
    if (report.totalTicks !== 1) {
      throw new Error(`expected totalTicks=1, got ${report.totalTicks}`);
    }
  });
});
