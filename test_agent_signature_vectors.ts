// test_agent_signature_vectors.ts
// Deterministic vectors for AGENT_SIGNATURE spec.

import { AGENT_SIGNATURE } from "./i.L32.core.AGENT_SIGNATURE.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

const TV1_BASE: DeltaProposal = {
  proposal_id: "tv1",
  tick: 42,
  base_state_hash: "state_tv_42",
  agent_id: "agent_tv",
  intent: "vector_test",
  confidence: 0.875,
  delta: [{ level: 8, value: -3 }, { level: 2, value: 11 }],
  cost_estimate: 321,
  artifact_hash: "artifact_tv_42",
  semantic_fingerprint: "sem_tv_42",
  causal_refs: ["c2", "c1"],
  target_path: "CANON",
};

const TV1_PAYLOAD =
  '{"agent_id":"agent_tv","artifact_hash":"artifact_tv_42","base_state_hash":"state_tv_42","causal_refs":["c1","c2"],"confidence":0.875,"cost_estimate":321,"delta":[{"level":2,"value":11},{"level":8,"value":-3}],"intent":"vector_test","proposal_id":"tv1","semantic_fingerprint":"sem_tv_42","target_path":"CANON","tick":42}';

const TV1_HMAC_SECRET = "tv_hmac_secret_v1";
const TV1_HMAC_SIG =
  "fe2c50ae84cedaf4329e565fedda2fa6538117ec9b8ef3658f0d15e753f41280";
const TV1_HMAC_ENV_HASH =
  "8d003c91143bfaece0d0f66eb9689195f620e55ad431ed1397c7e54ed8bacc33";

const TV1_ED_PUB = "WkjZtogfRh6UxCLSNcv3gMOQtc2s5KItP82GPZefLNY=";
const TV1_ED_PRIV =
  "MC4CAQAwBQYDK2VwBCIEIJ5TM9SnTDMkZnFJ2Nrctvv/csSzRA0jdQDfZyS+RPyt";
const TV1_ED_SIG =
  "c7389764f2793e48cbcdb1d8b5fdfda072e0bf899e5e71c5f196c76b5b2d91c78de1f84f369716ca6e85f82c41497e64f839ce92ed11a641557279620605f90b";
const TV1_ED_ENV_HASH =
  "3b261891f0ec466bae9b9a2b4789a6647a5a828b456e0f1494d4224a72bee409";

Deno.test("AGENT_SIGNATURE TV1 canonical payload is stable", () => {
  const payload = AGENT_SIGNATURE.canonicalProposalPayload(TV1_BASE);
  if (payload !== TV1_PAYLOAD) {
    throw new Error("TV1 payload mismatch");
  }
});

Deno.test("AGENT_SIGNATURE TV1 HMAC signature and envelope hash", async () => {
  const sig = await AGENT_SIGNATURE.signProposal(TV1_BASE, {
    scheme: "hmac-sha256/v1",
    secret: TV1_HMAC_SECRET,
  });
  if (sig !== TV1_HMAC_SIG) {
    throw new Error("TV1 HMAC signature mismatch");
  }

  const proposal: DeltaProposal = {
    ...TV1_BASE,
    signature_scheme: "hmac-sha256/v1",
    agent_signature: sig,
  };
  const verify = await AGENT_SIGNATURE.verifyProposal(proposal, {
    scheme: "hmac-sha256/v1",
    secret: TV1_HMAC_SECRET,
  });
  if (!verify.ok) {
    throw new Error(`TV1 HMAC verify failed: ${verify.reason ?? "UNKNOWN"}`);
  }

  const envHash = await AGENT_SIGNATURE.proposalEnvelopeHash(proposal);
  if (envHash !== TV1_HMAC_ENV_HASH) {
    throw new Error("TV1 HMAC envelope hash mismatch");
  }
});

Deno.test("AGENT_SIGNATURE TV1 Ed25519 signature and envelope hash", async () => {
  const sig = await AGENT_SIGNATURE.signProposal(TV1_BASE, {
    scheme: "ed25519/v1",
    private_key_pkcs8_b64: TV1_ED_PRIV,
  });
  if (sig !== TV1_ED_SIG) {
    throw new Error("TV1 Ed25519 signature mismatch");
  }

  const proposal: DeltaProposal = {
    ...TV1_BASE,
    signature_scheme: "ed25519/v1",
    agent_signature: sig,
  };
  const verify = await AGENT_SIGNATURE.verifyProposal(proposal, {
    scheme: "ed25519/v1",
    public_key_b64: TV1_ED_PUB,
  });
  if (!verify.ok) {
    throw new Error(`TV1 Ed25519 verify failed: ${verify.reason ?? "UNKNOWN"}`);
  }

  const envHash = await AGENT_SIGNATURE.proposalEnvelopeHash(proposal);
  if (envHash !== TV1_ED_ENV_HASH) {
    throw new Error("TV1 Ed25519 envelope hash mismatch");
  }
});
