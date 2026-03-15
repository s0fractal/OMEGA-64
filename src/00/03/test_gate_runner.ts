// test_gate_runner.ts
// Smoke test for runtime runner routed through GATE_PIPELINE.

import { GATE_RUNNER_GATE_RUNNER as GATE_RUNNER } from "@generated";
import { LEDGER__08_00_LEDGER as LEDGER } from "@generated";
import type {
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

const proposal = (
  id: string,
  tick: number,
  baseHash: string,
  level: number,
  value: number,
  target_path: "LOCAL" | "CANON",
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "runner_smoke",
  confidence: 1,
  delta: [{ level, value }],
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  target_path,
});

Deno.test("gate runner routes through replay/invariant contexts", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-runner-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };

    const s1 = await GATE_RUNNER.step({
      state: genesis,
      proposals: [
        proposal("p_local", 1, "state_1", 0, 5, "LOCAL"),
        proposal("p_canon", 1, "state_1", 1, 9, "CANON"),
      ],
      config: baseConfig(),
      mode: "REPLAY_CONTEXT",
      witness: "smoke",
    });

    if (s1.bridge_mode !== "AMBER") {
      throw new Error(`expected AMBER in first step, got ${s1.bridge_mode}`);
    }
    if (s1.nextState.state_i16[0] === 0) {
      throw new Error("local proposal should mutate state in first step");
    }
    if (s1.nextState.state_i16[1] !== 0) {
      throw new Error("canon proposal should be blocked in AMBER mode");
    }

    const s2 = await GATE_RUNNER.step({
      state: s1.nextState,
      proposals: [
        proposal(
          "p_canon_green",
          s1.nextState.tick,
          s1.nextState.state_hash,
          1,
          11,
          "CANON",
        ),
      ],
      config: baseConfig(),
      mode: "INVARIANT_CONTEXT",
      invariantReport: {
        index_chain_checked: true,
        index_chain_ok: true,
        index_chain_checked_records: 1,
        index_chain_failures: [],
        gate_admission_index_chain_checked: true,
        gate_admission_index_chain_ok: true,
        gate_admission_index_chain_checked_records: 1,
        gate_admission_index_chain_failures: [],
      },
      witness: "smoke",
    });

    if (s2.bridge_mode !== "GREEN") {
      throw new Error(`expected GREEN in second step, got ${s2.bridge_mode}`);
    }
    if (s2.nextState.state_i16[1] === 0) {
      throw new Error("canon proposal should mutate state in GREEN mode");
    }

    let bridgeEvents = 0;
    let ledgerEvents = 0;
    for await (const evt of LEDGER.readAllRaw()) {
      if ("event_type" in evt && evt.event_type === "BRIDGE_MODE_EVENT") {
        bridgeEvents++;
      }
      if (!("event_type" in evt)) ledgerEvents++;
    }
    if (bridgeEvents !== 2) {
      throw new Error(
        `expected 2 BRIDGE_MODE_EVENT entries, got ${bridgeEvents}`,
      );
    }
    if (ledgerEvents !== 2) {
      throw new Error(`expected 2 LedgerEvent entries, got ${ledgerEvents}`);
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});
