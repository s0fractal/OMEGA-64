// test_gate_runtime_context.ts
// Verifies helper APIs for building Gate runtime bridge context.

import { GATE_RUNTIME_CONTEXT_GATE_RUNTIME_CONTEXT as GATE_RUNTIME_CONTEXT } from "@omega";
import { GATE_GATE as GATE } from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@omega";
import type { REPLAY_AUDIT__08_00_ReplayInvariantReport as ReplayInvariantReport } from "@omega";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
});

const proposal = (tick: number, baseHash: string): DeltaProposal => ({
  proposal_id: "ctx_p1",
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_sync",
  intent: "ctx_seed",
  confidence: 1,
  delta: [{ level: 0, value: 4 }],
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
});

async function withTempLedger<T>(fn: () => Promise<T>): Promise<T> {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-runtime-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");
  try {
    return await fn();
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
}

Deno.test("gate runtime context resolves AMBER when invariant report is absent", () => {
  const out = GATE_RUNTIME_CONTEXT.fromInvariantReport(undefined, "test");
  if (out.bridge_mode !== "AMBER") {
    throw new Error(`expected AMBER, got ${out.bridge_mode}`);
  }
  if (out.runtime.bridge_invariant_report !== undefined) {
    throw new Error("bridge_invariant_report should be undefined");
  }
  if (out.runtime.witness !== "test") {
    throw new Error(`unexpected witness: ${out.runtime.witness}`);
  }
});

Deno.test("gate runtime context resolves RED from failing invariant report", () => {
  const invariant: ReplayInvariantReport = {
    index_chain_checked: true,
    index_chain_ok: false,
    index_chain_checked_records: 2,
    index_chain_failures: ["INDEX_CHAIN_PREV_MISMATCH_AT_LINE_2"],
    gate_admission_index_chain_checked: true,
    gate_admission_index_chain_ok: true,
    gate_admission_index_chain_checked_records: 1,
    gate_admission_index_chain_failures: [],
  };
  const out = GATE_RUNTIME_CONTEXT.fromInvariantReport(invariant);
  if (out.bridge_mode !== "RED") {
    throw new Error(`expected RED, got ${out.bridge_mode}`);
  }
  if (out.runtime.bridge_invariant_report?.index_chain_ok !== false) {
    throw new Error("runtime should carry invariant report");
  }
});

Deno.test("gate runtime context can be derived from replay audit", async () => {
  await withTempLedger(async () => {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_1",
    };
    await GATE.process(genesis, [proposal(1, "state_1")], baseConfig());

    const out = await GATE_RUNTIME_CONTEXT.fromReplayAudit(
      {
        tick: 1,
        state_i16: genesis.state_i16,
        state_hash: "state_1",
      },
      { runs: 1, startTick: 1, endTick: 1 },
      "auto",
    );

    if (!out.replay_audit) {
      throw new Error("expected replay_audit in envelope");
    }
    if (out.replay_audit.invariantReport.index_chain_checked) {
      throw new Error("index chain should be unchecked without canon events");
    }
    if (out.replay_audit.invariantReport.gate_admission_index_chain_checked) {
      throw new Error(
        "gate admission chain should be unchecked without canon events",
      );
    }
    if (out.bridge_mode !== "AMBER") {
      throw new Error(
        `expected AMBER for unchecked chain, got ${out.bridge_mode}`,
      );
    }
    if (out.runtime.witness !== "auto") {
      throw new Error(`unexpected witness: ${out.runtime.witness}`);
    }
  });
});
