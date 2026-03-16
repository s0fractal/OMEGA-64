// test_projection_drift_analytics.ts
// Tests deterministic projection drift analytics report.

import { GATE_GATE as GATE } from "@g";
import { LEDGER__08_00_LEDGER as LEDGER } from "@g";
import { PROJECTION_DRIFT_ANALYTICS_PROJECTION_DRIFT_ANALYTICS as PROJECTION_DRIFT_ANALYTICS } from "@g";
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

const proposal = (
  id: string,
  tick: number,
  baseHash: string,
  delta: Array<{ level: number; value: number }>,
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "drift_analytics",
  confidence: 1,
  delta,
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  causal_refs: ["9".repeat(64)],
});

async function withTempLedger<T>(fn: () => Promise<T>): Promise<T> {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-drift-analytics-",
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

Deno.test("projection drift analytics produces deterministic timeline", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };
    const s2 = await GATE.process(
      genesis,
      [proposal("p1", 1, "state_1", [{ level: 32, value: 40 }, {
        level: 13,
        value: 5,
      }])],
      baseConfig(),
    );
    await GATE.process(
      { tick: 2, state_i16: s2.state_i16, state_hash: s2.state_hash },
      [proposal("p2", 2, s2.state_hash, [{ level: 32, value: -15 }, {
        level: 5,
        value: 9,
      }])],
      baseConfig(),
    );

    const r1 = await PROJECTION_DRIFT_ANALYTICS.analyze(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { startTick: 1, endTick: 2 },
    );
    const r2 = await PROJECTION_DRIFT_ANALYTICS.analyze(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { startTick: 1, endTick: 2 },
    );

    if (!r1.ok) {
      throw new Error(
        `expected ok report, got failures: ${r1.failures.join(",")}`,
      );
    }
    if (r1.eventsAnalyzed !== 2) {
      throw new Error(`expected eventsAnalyzed=2, got ${r1.eventsAnalyzed}`);
    }
    if (r1.timeline.length !== 2) {
      throw new Error(`expected timeline length=2, got ${r1.timeline.length}`);
    }
    if (!(r1.timeline[0].l1_total > 0 && r1.timeline[1].l1_total > 0)) {
      throw new Error("expected positive l1 drift in timeline");
    }
    if (r1.topHotLevels.length === 0) {
      throw new Error("expected non-empty hot levels");
    }

    // Determinism check (same input -> same report).
    if (JSON.stringify(r1) !== JSON.stringify(r2)) {
      throw new Error("projection drift analytics report is not deterministic");
    }
  });
});

Deno.test("projection drift analytics fails when replay audit is not green", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 10,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_10",
    };
    await GATE.process(
      genesis,
      [proposal("p1", 10, "state_10", [{ level: 32, value: 7 }])],
      baseConfig(),
    );

    // Tamper projection hash in ledger.
    const raw = await Deno.readTextFile(LEDGER.STORAGE_PATH);
    const lines = raw.split("\n").filter((x) => x.trim().length > 0);
    const ledgerIdx = lines.findIndex((line) =>
      !line.includes('"event_type":')
    );
    if (ledgerIdx < 0) {
      throw new Error("missing ledger event line");
    }
    const evt = JSON.parse(lines[ledgerIdx]);
    evt.projection_2d_hash = "f".repeat(64);
    lines[ledgerIdx] = JSON.stringify(evt);
    await Deno.writeTextFile(LEDGER.STORAGE_PATH, lines.join("\n") + "\n");

    const report = await PROJECTION_DRIFT_ANALYTICS.analyze(
      {
        tick: 10,
        state_i16: genesis.state_i16,
        state_hash: "state_10",
      },
      { startTick: 10, endTick: 10, requireReplayGreen: true },
    );

    if (report.ok) {
      throw new Error(
        "expected report.ok=false when replay audit is not green",
      );
    }
    if (!report.failures.some((x) => x === "REPLAY_AUDIT_NOT_GREEN")) {
      throw new Error(
        `expected REPLAY_AUDIT_NOT_GREEN, got: ${report.failures.join(",")}`,
      );
    }
  });
});
