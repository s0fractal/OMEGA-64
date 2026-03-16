// test_gate_agent_phase.ts
// Verifies agent phase handling in GATE cost model and schema validation.

import { GATE_GATE as GATE } from "@g";
import { LEDGER__08_00_LEDGER as LEDGER } from "@g";
import { PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX } from "@g";
import type {
  STATE_SNAPSHOT_DeltaProposal as DeltaProposal,
  STATE_SNAPSHOT_GateConfig as GateConfig,
  STATE_SNAPSHOT_LedgerEvent as LedgerEvent,
  STATE_SNAPSHOT_StateSnapshot as StateSnapshot,
} from "@g";

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 150,
  reliability_weight: new Map([["agent_phase", 1.0]]),
  dry_run: false,
});

const proposal = (
  id: string,
  tick: number,
  baseHash: string,
  agentPhase: number | undefined,
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseHash,
  agent_id: "agent_phase",
  agent_phase_u16: agentPhase,
  intent: "phase-cost",
  confidence: 1,
  delta: [{ level: 4, value: 100 }],
  cost_estimate: 100,
  artifact_hash: "artifact_phase",
  semantic_fingerprint: "sem_phase",
});

const firstLedgerEvent = async (): Promise<LedgerEvent | undefined> => {
  for await (const evt of LEDGER.readAllRaw()) {
    if (!("event_type" in evt)) return evt as LedgerEvent;
  }
  return undefined;
};

Deno.test("gate uses agent_phase_u16 mismatch in physical cost budget", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-agent-phase-",
    suffix: ".jsonl",
  });
  const indexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(tempPath);
  LEDGER.STORAGE_PATH = tempPath;
  PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
  await Deno.writeTextFile(tempPath, "");

  try {
    const baseState: StateSnapshot = {
      tick: 1,
      state_hash: "state_phase_1",
      state_i16: new Int16Array(64).fill(0),
      phase_u16: new Uint16Array(64).fill(0),
      entropy_i16: new Int16Array(64).fill(32767),
    };

    const accepted = await GATE.process(
      baseState,
      [proposal("p_in_phase", 1, "state_phase_1", 0)],
      baseConfig(),
    );
    if (accepted.state_i16[4] === 0) {
      throw new Error(
        "expected in-phase proposal to pass budget and mutate state",
      );
    }

    const rejected = await GATE.process(
      {
        ...baseState,
        tick: 2,
        state_hash: accepted.state_hash,
        state_i16: accepted.state_i16,
      },
      [proposal("p_out_phase", 2, accepted.state_hash, 32768)],
      baseConfig(),
    );
    if (rejected.state_i16[4] !== accepted.state_i16[4]) {
      throw new Error(
        "expected out-of-phase proposal to be rejected on cost budget",
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
    try {
      await Deno.remove(indexPath);
    } catch { /* ignore */ }
  }
});

Deno.test("gate rejects invalid agent_phase_u16 range", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-agent-phase-range-",
    suffix: ".jsonl",
  });
  const indexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(tempPath);
  LEDGER.STORAGE_PATH = tempPath;
  PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
  await Deno.writeTextFile(tempPath, "");

  try {
    const state: StateSnapshot = {
      tick: 10,
      state_hash: "state_phase_10",
      state_i16: new Int16Array(64).fill(0),
    };

    await GATE.process(
      state,
      [proposal("p_invalid_phase", 10, "state_phase_10", 70000)],
      baseConfig(),
    );

    const evt = await firstLedgerEvent();
    if (!evt) throw new Error("expected ledger event");
    const rejected = evt.rejected_proposals.find((r) =>
      r.proposal_id === "p_invalid_phase"
    );
    if (!rejected) {
      throw new Error("expected rejection for invalid agent_phase_u16");
    }
    if (rejected.reason !== "OUT_OF_RANGE_VALUE") {
      throw new Error(`unexpected rejection reason: ${rejected.reason}`);
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
    try {
      await Deno.remove(indexPath);
    } catch { /* ignore */ }
  }
});

Deno.test("phase coherence mode attenuates out-of-phase reliability weight", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-gate-phase-coherence-",
    suffix: ".jsonl",
  });
  const indexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(tempPath);
  LEDGER.STORAGE_PATH = tempPath;
  PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
  await Deno.writeTextFile(tempPath, "");

  try {
    const state: StateSnapshot = {
      tick: 30,
      state_hash: "state_phase_30",
      state_i16: new Int16Array(64).fill(0),
      phase_u16: new Uint16Array(64).fill(0),
      entropy_i16: new Int16Array(64).fill(0),
    };

    const config: GateConfig = {
      ...baseConfig(),
      max_cost_per_agent: 1000,
      reliability_mode: "PHASE_COHERENCE",
      reliability_floor: 0,
    };

    const next = await GATE.process(
      state,
      [
        {
          ...proposal("p_in", 30, "state_phase_30", 0),
          delta: [{ level: 7, value: 100 }],
        },
        {
          ...proposal("p_out", 30, "state_phase_30", 32768),
          delta: [{ level: 7, value: 100 }],
        },
      ],
      config,
    );

    if (next.state_i16[7] !== 100) {
      throw new Error(`expected merged value 100, got ${next.state_i16[7]}`);
    }

    const evt = await firstLedgerEvent();
    if (!evt) throw new Error("expected ledger event");
    const metrics = evt.accepted_proposal_metrics ?? [];
    if (metrics.length !== 2) {
      throw new Error(`expected 2 proposal metrics, got ${metrics.length}`);
    }
    const inMetric = metrics.find((m) => m.proposal_id === "p_in");
    const outMetric = metrics.find((m) => m.proposal_id === "p_out");
    if (!inMetric || !outMetric) {
      throw new Error("expected metrics for p_in and p_out");
    }
    if (inMetric.reliability_effective <= outMetric.reliability_effective) {
      throw new Error("expected in-phase reliability to exceed out-of-phase");
    }
    if (inMetric.weight <= outMetric.weight) {
      throw new Error("expected in-phase weight to exceed out-of-phase");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    PROPOSAL_ENVELOPE_INDEX.resetCacheForTests(indexPath);
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
    try {
      await Deno.remove(indexPath);
    } catch { /* ignore */ }
  }
});
