// test_gate_pipeline.ts
// Verifies integrated gate pipeline with automatic/runtime bridge context.

import { GATE_PIPELINE_GATE_PIPELINE as GATE_PIPELINE } from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import type {
  STATE_SNAPSHOT_BridgeModeEvent as BridgeModeEvent,
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_LedgerEvent as LedgerEvent,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@omega";

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
  target_path: "LOCAL" | "CANON",
  level: number,
  value: number,
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "pipeline",
  confidence: 1,
  delta: [{ level, value }],
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  target_path,
});

async function collectRaw() {
  const out = [];
  for await (const evt of LEDGER.readAllRaw()) {
    out.push(evt);
  }
  return out;
}

Deno.test("pipeline replay-context defaults to AMBER and blocks canon-bound proposal", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-pipeline-amber-",
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

    const result = await GATE_PIPELINE.processWithReplayContext(
      genesis,
      [proposal("p_canon", 1, "state_1", "CANON", 0, 9)],
      baseConfig(),
      { witness: "test" },
    );

    if (result.bridge_mode !== "AMBER") {
      throw new Error(`expected AMBER, got ${result.bridge_mode}`);
    }
    if (!result.replay_audit) {
      throw new Error("expected replay_audit in pipeline result");
    }
    if (result.nextState.state_i16[0] !== 0) {
      throw new Error("canon-bound mutation should be blocked in AMBER");
    }

    const events = await collectRaw();
    const bridge = events.find((x) =>
      "event_type" in x && x.event_type === "BRIDGE_MODE_EVENT"
    );
    const ledger = events.find((x) => !("event_type" in x));
    if (!bridge || !ledger) {
      throw new Error("missing bridge or ledger event");
    }
    if ((bridge as BridgeModeEvent).mode !== "AMBER") {
      throw new Error("bridge event mode mismatch");
    }
    if (!(bridge as BridgeModeEvent).invariant_packet_hash) {
      throw new Error("bridge event must include invariant_packet_hash");
    }
    if (
      !(ledger as LedgerEvent).rejected_proposals.some((r) =>
        r.proposal_id === "p_canon"
      )
    ) {
      throw new Error("expected canon proposal rejection in ledger event");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("pipeline invariant-context GREEN allows canon-bound proposal", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-pipeline-green-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const genesis: StateSnapshot = {
      tick: 5,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_5",
    };

    const result = await GATE_PIPELINE.processWithInvariantContext(
      genesis,
      [proposal("p_canon_green", 5, "state_5", "CANON", 4, 12)],
      baseConfig(),
      {
        index_chain_checked: true,
        index_chain_ok: true,
        index_chain_checked_records: 1,
        index_chain_failures: [],
        gate_admission_index_chain_checked: true,
        gate_admission_index_chain_ok: true,
        gate_admission_index_chain_checked_records: 1,
        gate_admission_index_chain_failures: [],
      },
      "test",
    );

    if (result.bridge_mode !== "GREEN") {
      throw new Error(`expected GREEN, got ${result.bridge_mode}`);
    }
    const events = await collectRaw();
    const bridge = events.find((x) =>
      "event_type" in x && x.event_type === "BRIDGE_MODE_EVENT"
    );
    if (!bridge || !(bridge as BridgeModeEvent).invariant_packet_hash) {
      throw new Error("bridge event must include invariant_packet_hash");
    }
    if (result.nextState.state_i16[4] === 0) {
      throw new Error("canon-bound mutation should be accepted in GREEN");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});
