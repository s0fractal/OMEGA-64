// test_gate_bridge_mode.ts
// Verifies L32 bridge mode membrane behavior for canon-bound proposals.

import { GATE_GATE as GATE } from "@omega";
import { LEDGER__08_00_LEDGER as LEDGER } from "@omega";
import {
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
  baseStateHash: string,
  level: number,
  value: number,
  target_path: "LOCAL" | "CANON",
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseStateHash,
  agent_id: "agent_sync",
  intent: `${target_path.toLowerCase()}_mutate`,
  confidence: 1,
  delta: [{ level, value }],
  cost_estimate: 100,
  artifact_hash: "a1",
  semantic_fingerprint: "s1",
  target_path,
});

async function readBridgeAndLedger(): Promise<
  { bridge: BridgeModeEvent; ledger: LedgerEvent }
> {
  const raw = [];
  for await (const evt of LEDGER.readAllRaw()) {
    raw.push(evt);
  }

  const bridge = raw.find((x) =>
    "event_type" in x && x.event_type === "BRIDGE_MODE_EVENT"
  );
  if (!bridge) {
    throw new Error("missing BRIDGE_MODE_EVENT");
  }

  const ledger = raw.find((x) => !("event_type" in x));
  if (!ledger) {
    throw new Error("missing LedgerEvent");
  }

  return {
    bridge: bridge as BridgeModeEvent,
    ledger: ledger as LedgerEvent,
  };
}

Deno.test("bridge RED blocks canon-bound proposals and keeps local drift", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-bridge-red-",
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
    const canon = proposal("p_canon", 1, "state_1", 0, 50, "CANON");
    const local = proposal("p_local", 1, "state_1", 1, 20, "LOCAL");

    const next = await GATE.process(
      genesis,
      [canon, local],
      baseConfig(),
      {
        bridge_invariant_report: {
          index_chain_checked: true,
          index_chain_ok: false,
          index_chain_checked_records: 3,
          index_chain_failures: ["INDEX_CHAIN_PREV_MISMATCH_AT_LINE_2"],
          gate_admission_index_chain_checked: true,
          gate_admission_index_chain_ok: true,
          gate_admission_index_chain_checked_records: 1,
          gate_admission_index_chain_failures: [],
        },
        witness: "test",
      },
    );

    const { bridge, ledger } = await readBridgeAndLedger();
    if (bridge.mode !== "RED") {
      throw new Error(`expected RED bridge mode, got ${bridge.mode}`);
    }
    if (!bridge.invariant_packet_hash) {
      throw new Error("expected invariant_packet_hash in bridge event");
    }
    if (!bridge.blocked_canon_proposals.includes("p_canon")) {
      throw new Error("expected p_canon in blocked_canon_proposals");
    }
    if (!bridge.canon_bound_proposals.includes("p_canon")) {
      throw new Error("expected p_canon in canon_bound_proposals");
    }

    if (ledger.accepted_proposals.includes("p_canon")) {
      throw new Error("canon proposal must be rejected in RED mode");
    }
    if (!ledger.accepted_proposals.includes("p_local")) {
      throw new Error("local proposal should be accepted in RED mode");
    }
    if (!ledger.rejected_proposals.some((r) => r.proposal_id === "p_canon")) {
      throw new Error("expected p_canon rejection in ledger");
    }

    if (next.state_i16[0] !== 0) {
      throw new Error("canon-bound level must not mutate in RED mode");
    }
    if (next.state_i16[1] === 0) {
      throw new Error("local level should mutate in RED mode");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("bridge AMBER blocks canon-bound proposals without chain evidence", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-bridge-amber-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const genesis: StateSnapshot = {
      tick: 7,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_7",
    };
    const canon = proposal("p_canon_only", 7, "state_7", 3, 33, "CANON");

    const next = await GATE.process(
      genesis,
      [canon],
      baseConfig(),
      {
        bridge_invariant_report: {
          index_chain_checked: false,
          index_chain_ok: true,
          index_chain_checked_records: 0,
          index_chain_failures: [],
          gate_admission_index_chain_checked: false,
          gate_admission_index_chain_ok: true,
          gate_admission_index_chain_checked_records: 0,
          gate_admission_index_chain_failures: [],
        },
      },
    );

    const { bridge, ledger } = await readBridgeAndLedger();
    if (bridge.mode !== "AMBER") {
      throw new Error(`expected AMBER bridge mode, got ${bridge.mode}`);
    }
    if (!bridge.invariant_packet_hash) {
      throw new Error("expected invariant_packet_hash in bridge event");
    }
    if (
      !ledger.rejected_proposals.some((r) => r.proposal_id === "p_canon_only")
    ) {
      throw new Error("canon proposal must be rejected in AMBER mode");
    }
    if (ledger.accepted_proposals.length !== 0) {
      throw new Error("no proposal should be accepted in this AMBER scenario");
    }
    if (next.state_i16[3] !== 0) {
      throw new Error("state must remain unchanged for blocked canon proposal");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("bridge GREEN allows canon-bound proposals", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-bridge-green-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(LEDGER.STORAGE_PATH, "");

  try {
    const genesis: StateSnapshot = {
      tick: 11,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_11",
    };
    const canon = proposal("p_canon_green", 11, "state_11", 4, 44, "CANON");

    const next = await GATE.process(
      genesis,
      [canon],
      baseConfig(),
      {
        bridge_invariant_report: {
          index_chain_checked: true,
          index_chain_ok: true,
          index_chain_checked_records: 5,
          index_chain_failures: [],
          gate_admission_index_chain_checked: true,
          gate_admission_index_chain_ok: true,
          gate_admission_index_chain_checked_records: 2,
          gate_admission_index_chain_failures: [],
        },
      },
    );

    const { bridge, ledger } = await readBridgeAndLedger();
    if (bridge.mode !== "GREEN") {
      throw new Error(`expected GREEN bridge mode, got ${bridge.mode}`);
    }
    if (!bridge.invariant_packet_hash) {
      throw new Error("expected invariant_packet_hash in bridge event");
    }
    if (bridge.blocked_canon_proposals.length !== 0) {
      throw new Error("GREEN mode must not block canon proposals");
    }
    if (!ledger.accepted_proposals.includes("p_canon_green")) {
      throw new Error("canon proposal should be accepted in GREEN mode");
    }
    if (
      ledger.rejected_proposals.some((r) => r.proposal_id === "p_canon_green")
    ) {
      throw new Error("canon proposal should not be rejected in GREEN mode");
    }
    if (next.state_i16[4] === 0) {
      throw new Error("canon proposal should mutate state in GREEN mode");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});
