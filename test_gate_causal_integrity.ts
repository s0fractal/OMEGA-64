import { REPLAY_AUDIT } from "./i.L99.core.REPLAY_AUDIT.ts";
import { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

const mockState = {
    tick: 100,
    state_hash: "base_hash",
    state_i16: new Int16Array(64).fill(0)
};

const mockEvent: LedgerEvent = {
    event_id: "evt_test",
    tick: 100,
    ts_unix_ms: Date.now(),
    state_before_hash: "base_hash",
    state_after_hash: "computed_hash",
    accepted_delta: [{ level: 5, value: 10 }],
    proposal_digest: "digest",
    accepted_proposals: ["p1"],
    rejected_proposals: [],
    cost_total: 10,
    budget_used: 10,
    budget_limit: 1000,
    gate_config_version: "v0.2"
};

// We don't know the exact expected hash without running the internal sha256 function,
// but we can test that mismatched inputs fail.

const res1 = await REPLAY_AUDIT.verifyEventCausalIntegrity(mockEvent, { ...mockState, tick: 101 });
console.log("Causal Check (Tick Mismatch):", !res1.ok && res1.reason?.includes("TICK_MISMATCH") ? "✅ PASS" : "❌ FAIL");

const res2 = await REPLAY_AUDIT.verifyEventCausalIntegrity(mockEvent, { ...mockState, state_hash: "wrong_hash" });
console.log("Causal Check (Hash Mismatch):", !res2.ok && res2.reason?.includes("BASE_HASH_MISMATCH") ? "✅ PASS" : "❌ FAIL");

const res3 = await REPLAY_AUDIT.verifyEventCausalIntegrity(mockEvent, mockState);
console.log("Causal Check (Integrity Mismatch):", !res3.ok && res3.reason?.includes("STATE_AFTER_HASH_MISMATCH") ? "✅ PASS" : "❌ FAIL");
