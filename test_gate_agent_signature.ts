// test_gate_agent_signature.ts
// Validates L32 signature policy admission behavior.

import { AGENT_SIGNATURE } from "./i.L32.core.AGENT_SIGNATURE.ts";
import { GATE } from "./i.L32.core.GATE.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import {
  DeltaProposal,
  GateConfig,
  LedgerEvent,
  REJECTION,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";

const key = {
  scheme: "hmac-sha256/v1" as const,
  secret: "agent_sync_secret_v1",
};

const baseConfig = (): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
  signature_policy: "REQUIRED",
  agent_signature_keys: new Map([["agent_sync", key]]),
});

const proposal = (
  id: string,
  tick: number,
  baseStateHash: string,
  value: number,
): DeltaProposal => ({
  proposal_id: id,
  tick,
  base_state_hash: baseStateHash,
  agent_id: "agent_sync",
  intent: "signed_mutate",
  confidence: 1,
  delta: [{ level: 5, value }],
  cost_estimate: 100,
  artifact_hash: "artifact_sync_v1",
  semantic_fingerprint: "semantic_sync_v1",
});

const latestLedgerEvent = async (): Promise<LedgerEvent> => {
  const events: LedgerEvent[] = [];
  for await (const evt of LEDGER.readAllRaw()) {
    if (!("event_type" in evt)) {
      events.push(evt as LedgerEvent);
    }
  }
  if (events.length === 0) {
    throw new Error("missing ledger event");
  }
  return events[events.length - 1];
};

Deno.test("required signature accepts valid signed proposal", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-sig-valid-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_1",
    };
    const p = proposal("p_sig_ok", 1, "state_sig_1", 12);
    p.signature_scheme = "hmac-sha256/v1";
    p.agent_signature = await AGENT_SIGNATURE.signProposal(p, key);

    const next = await GATE.process(genesis, [p], baseConfig());
    const evt = await latestLedgerEvent();

    if (!evt.accepted_proposals.includes("p_sig_ok")) {
      throw new Error("expected signed proposal to be accepted");
    }
    if (next.state_i16[5] <= 0) {
      throw new Error("expected signed proposal to mutate state");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("required signature rejects missing signature", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-sig-missing-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    const genesis: StateSnapshot = {
      tick: 2,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_2",
    };
    const p = proposal("p_sig_missing", 2, "state_sig_2", 12);

    const next = await GATE.process(genesis, [p], baseConfig());
    const evt = await latestLedgerEvent();

    const rejection = evt.rejected_proposals.find((r) =>
      r.proposal_id === "p_sig_missing"
    );
    if (!rejection) {
      throw new Error("expected missing-signature rejection");
    }
    if (rejection.reason !== REJECTION.SIGNATURE_REQUIRED) {
      throw new Error(
        `expected ${REJECTION.SIGNATURE_REQUIRED}, got ${rejection.reason}`,
      );
    }
    if (next.state_i16[5] !== 0) {
      throw new Error("state must not mutate for missing signature");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("required signature rejects invalid signature", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-sig-invalid-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    const genesis: StateSnapshot = {
      tick: 3,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_3",
    };
    const p = proposal("p_sig_invalid", 3, "state_sig_3", 12);
    p.signature_scheme = "hmac-sha256/v1";
    p.agent_signature = "00deadbeef";

    const next = await GATE.process(genesis, [p], baseConfig());
    const evt = await latestLedgerEvent();

    const rejection = evt.rejected_proposals.find((r) =>
      r.proposal_id === "p_sig_invalid"
    );
    if (!rejection) {
      throw new Error("expected invalid-signature rejection");
    }
    if (rejection.reason !== REJECTION.SIGNATURE_INVALID) {
      throw new Error(
        `expected ${REJECTION.SIGNATURE_INVALID}, got ${rejection.reason}`,
      );
    }
    if (next.state_i16[5] !== 0) {
      throw new Error("state must not mutate for invalid signature");
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("optional signature rejects signed proposal when key missing", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-sig-key-missing-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    const genesis: StateSnapshot = {
      tick: 4,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_4",
    };
    const p = proposal("p_sig_key_missing", 4, "state_sig_4", 12);
    p.signature_scheme = "hmac-sha256/v1";
    p.agent_signature = "abcd";

    const config = baseConfig();
    config.signature_policy = "OPTIONAL";
    config.agent_signature_keys = new Map();

    await GATE.process(genesis, [p], config);
    const evt = await latestLedgerEvent();

    const rejection = evt.rejected_proposals.find((r) =>
      r.proposal_id === "p_sig_key_missing"
    );
    if (!rejection) {
      throw new Error("expected signature key missing rejection");
    }
    if (rejection.reason !== REJECTION.SIGNATURE_KEY_MISSING) {
      throw new Error(
        `expected ${REJECTION.SIGNATURE_KEY_MISSING}, got ${rejection.reason}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});

Deno.test("required signature rejects unsupported signature scheme", async () => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-ledger-sig-scheme-",
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");

  try {
    const genesis: StateSnapshot = {
      tick: 5,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_5",
    };
    const p = proposal("p_sig_scheme", 5, "state_sig_5", 12);
    p.signature_scheme = "ed25519/v1" as unknown as "hmac-sha256/v1";
    p.agent_signature = "abcd";

    await GATE.process(genesis, [p], baseConfig());
    const evt = await latestLedgerEvent();

    const rejection = evt.rejected_proposals.find((r) =>
      r.proposal_id === "p_sig_scheme"
    );
    if (!rejection) {
      throw new Error("expected unsupported-signature-scheme rejection");
    }
    if (rejection.reason !== REJECTION.SIGNATURE_SCHEME_UNSUPPORTED) {
      throw new Error(
        `expected ${REJECTION.SIGNATURE_SCHEME_UNSUPPORTED}, got ${rejection.reason}`,
      );
    }
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch { /* ignore */ }
  }
});
