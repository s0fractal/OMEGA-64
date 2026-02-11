// test_gate_agent_signature.ts
// Validates L32 signature policy admission behavior (Ed25519 primary, HMAC legacy).

import {
  AGENT_SIGNATURE,
  type AgentSigningKey,
} from "./i.L32.core.AGENT_SIGNATURE.ts";
import { GATE } from "./i.L32.core.GATE.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import {
  type AgentSignatureKey,
  type DeltaProposal,
  type GateConfig,
  type LedgerEvent,
  REJECTION,
  type StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";

const baseProposal = (
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

const baseConfig = (key: AgentSignatureKey): GateConfig => ({
  max_abs_delta_per_level: 1000,
  max_total_abs_delta_per_tick: 5000,
  max_cost_per_agent: 10000,
  reliability_weight: new Map([["agent_sync", 1.0]]),
  dry_run: false,
  signature_policy: "REQUIRED",
  agent_signature_keys: new Map([["agent_sync", key]]),
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

const withTempLedger = async (
  name: string,
  fn: () => Promise<void>,
): Promise<void> => {
  const originalPath = LEDGER.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: `omega-ledger-${name}-`,
    suffix: ".jsonl",
  });
  LEDGER.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(tempPath, "");
  try {
    await fn();
  } finally {
    LEDGER.STORAGE_PATH = originalPath;
    try {
      await Deno.remove(tempPath);
    } catch {
      // ignore
    }
  }
};

const createEd25519Material = async (): Promise<{
  verification: AgentSignatureKey;
  signing: AgentSigningKey;
}> => {
  const pair = await AGENT_SIGNATURE.generateEd25519KeyPair();
  return {
    verification: {
      scheme: "ed25519/v1",
      public_key_b64: pair.public_key_b64,
    },
    signing: {
      scheme: "ed25519/v1",
      private_key_pkcs8_b64: pair.private_key_pkcs8_b64,
    },
  };
};

Deno.test("required signature accepts valid ed25519 signed proposal", async () => {
  await withTempLedger("sig-valid-ed25519", async () => {
    const key = await createEd25519Material();
    const genesis: StateSnapshot = {
      tick: 1,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_1",
    };
    const p = baseProposal("p_sig_ok_ed", 1, "state_sig_1", 12);
    p.signature_scheme = "ed25519/v1";
    p.agent_signature = await AGENT_SIGNATURE.signProposal(p, key.signing);

    const next = await GATE.process(genesis, [p], baseConfig(key.verification));
    const evt = await latestLedgerEvent();

    if (!evt.accepted_proposals.includes("p_sig_ok_ed")) {
      throw new Error("expected signed proposal to be accepted");
    }
    if (next.state_i16[5] <= 0) {
      throw new Error("expected signed proposal to mutate state");
    }
  });
});

Deno.test("required signature rejects missing signature", async () => {
  await withTempLedger("sig-missing", async () => {
    const key = await createEd25519Material();
    const genesis: StateSnapshot = {
      tick: 2,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_2",
    };
    const p = baseProposal("p_sig_missing", 2, "state_sig_2", 12);

    const next = await GATE.process(genesis, [p], baseConfig(key.verification));
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
  });
});

Deno.test("required signature rejects invalid ed25519 signature", async () => {
  await withTempLedger("sig-invalid", async () => {
    const key = await createEd25519Material();
    const genesis: StateSnapshot = {
      tick: 3,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_3",
    };
    const p = baseProposal("p_sig_invalid", 3, "state_sig_3", 12);
    p.signature_scheme = "ed25519/v1";
    p.agent_signature = "00deadbeef";

    const next = await GATE.process(genesis, [p], baseConfig(key.verification));
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
  });
});

Deno.test("optional signature rejects signed proposal when key missing", async () => {
  await withTempLedger("sig-key-missing", async () => {
    const genesis: StateSnapshot = {
      tick: 4,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_4",
    };
    const p = baseProposal("p_sig_key_missing", 4, "state_sig_4", 12);
    p.signature_scheme = "ed25519/v1";
    p.agent_signature = "abcd";

    const config: GateConfig = {
      ...baseConfig({ scheme: "ed25519/v1", public_key_b64: "unused" }),
      signature_policy: "OPTIONAL",
      agent_signature_keys: new Map(),
    };

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
  });
});

Deno.test("required signature rejects unsupported signature scheme", async () => {
  await withTempLedger("sig-scheme", async () => {
    const key = await createEd25519Material();
    const genesis: StateSnapshot = {
      tick: 5,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_5",
    };
    const p = baseProposal("p_sig_scheme", 5, "state_sig_5", 12);
    p.signature_scheme = "hmac-sha256/v1";
    p.agent_signature = "abcd";

    await GATE.process(genesis, [p], baseConfig(key.verification));
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
  });
});

Deno.test("legacy hmac signature remains supported", async () => {
  await withTempLedger("sig-hmac-legacy", async () => {
    const verification: AgentSignatureKey = {
      scheme: "hmac-sha256/v1",
      secret: "agent_sync_secret_v1",
    };
    const signing: AgentSigningKey = {
      scheme: "hmac-sha256/v1",
      secret: "agent_sync_secret_v1",
    };
    const genesis: StateSnapshot = {
      tick: 6,
      state_i16: new Int16Array(64).fill(0),
      state_hash: "state_sig_6",
    };
    const p = baseProposal("p_sig_hmac_ok", 6, "state_sig_6", 8);
    p.signature_scheme = "hmac-sha256/v1";
    p.agent_signature = await AGENT_SIGNATURE.signProposal(p, signing);

    const next = await GATE.process(genesis, [p], baseConfig(verification));
    const evt = await latestLedgerEvent();

    if (!evt.accepted_proposals.includes("p_sig_hmac_ok")) {
      throw new Error("expected legacy hmac proposal to be accepted");
    }
    if (next.state_i16[5] <= 0) {
      throw new Error("expected legacy hmac proposal to mutate state");
    }
  });
});
