# i.L32.core.AGENT_SIGNATURE_SPEC

Status: Final Layer: L32 Intent: Deterministic proposal signing and verification
for agent admission.

## 0. Normative References

1. `/Users/s0fractal/OMEGA/i.L99.core.STATE_SNAPSHOT.ts` (signature-related type
   fields).
2. `/Users/s0fractal/OMEGA/i.L32.core.GLIDER_GATE_PROTOCOL.md` (gate admission
   flow and rejection taxonomy).
3. `/Users/s0fractal/OMEGA/i.L99.core.PROPOSAL_ENVELOPE_INDEX.md` (anti-replay
   storage and chain semantics).

Conflict rule:

1. This spec governs canonicalization/sign/verify/envelope hashing.
2. Gate execution ordering and policy application are governed by
   `GLIDER_GATE_PROTOCOL`.

## 1. Scope

This spec defines:

1. canonical proposal payload encoding,
2. signature envelope format,
3. supported signature schemes,
4. deterministic test vectors.

It is normative for:

1. `/Users/s0fractal/OMEGA/i.L32.core.AGENT_SIGNATURE.ts`,
2. `/Users/s0fractal/OMEGA/i.L32.core.GATE.ts` signature checks,
3. anti-replay envelope anchoring.

## 2. Supported Schemes

Primary:

1. `ed25519/v1` (public-key verify in gate).

Legacy:

1. `hmac-sha256/v1` (shared-secret compatibility mode).

## 3. Canonical Payload

Canonical payload function:

1. `AGENT_SIGNATURE.canonicalProposalPayload(proposal)`.

Rules:

1. JSON object keys are lexicographically sorted.
2. `delta` entries are sorted by `level`.
3. `causal_refs` are sorted lexicographically.
4. `target_path` defaults to `"LOCAL"` when absent.
5. `agent_phase_u16` is included when present and MUST be integer `[0..65535]`.
6. `undefined` fields are excluded.

Envelope message bytes for signing:

1. UTF-8 bytes of:
2. `scheme=<scheme>|payload=<canonical_payload_json_string>`.

## 4. Canonical Envelope Hash

Canonical envelope function:

1. `AGENT_SIGNATURE.canonicalProposalEnvelope(proposal)`.

Envelope object:

1. `signature_scheme` (`null` when absent),
2. `agent_signature` (`null` when absent),
3. `payload` (canonical payload string).

Envelope hash:

1. `proposal_envelope_hash = SHA-256(UTF8(canonical_envelope_json_string))`.

This hash is the replay anchor consumed by:

1. `GateConfig.anti_replay_window_ticks`,
2. `LedgerEvent.accepted_proposal_envelopes`.

## 5. Deterministic Test Vector TV-1

Proposal fixture:

```json
{
  "proposal_id": "tv1",
  "tick": 42,
  "base_state_hash": "state_tv_42",
  "agent_id": "agent_tv",
  "intent": "vector_test",
  "confidence": 0.875,
  "delta": [{ "level": 8, "value": -3 }, { "level": 2, "value": 11 }],
  "cost_estimate": 321,
  "artifact_hash": "artifact_tv_42",
  "semantic_fingerprint": "sem_tv_42",
  "causal_refs": ["c2", "c1"],
  "target_path": "CANON"
}
```

Canonical payload (expected):

```text
{"agent_id":"agent_tv","artifact_hash":"artifact_tv_42","base_state_hash":"state_tv_42","causal_refs":["c1","c2"],"confidence":0.875,"cost_estimate":321,"delta":[{"level":2,"value":11},{"level":8,"value":-3}],"intent":"vector_test","proposal_id":"tv1","semantic_fingerprint":"sem_tv_42","target_path":"CANON","tick":42}
```

### TV-1A: HMAC

Key:

1. `scheme = "hmac-sha256/v1"`
2. `secret = "tv_hmac_secret_v1"`

Expected signature:

1. `fe2c50ae84cedaf4329e565fedda2fa6538117ec9b8ef3658f0d15e753f41280`

Expected envelope hash (with `signature_scheme="hmac-sha256/v1"` and signature
above):

1. `8d003c91143bfaece0d0f66eb9689195f620e55ad431ed1397c7e54ed8bacc33`

### TV-1B: Ed25519

Key material:

1. `scheme = "ed25519/v1"`
2. `public_key_b64 = "WkjZtogfRh6UxCLSNcv3gMOQtc2s5KItP82GPZefLNY="`
3. `private_key_pkcs8_b64 = "MC4CAQAwBQYDK2VwBCIEIJ5TM9SnTDMkZnFJ2Nrctvv/csSzRA0jdQDfZyS+RPyt"`

Expected signature:

1. `c7389764f2793e48cbcdb1d8b5fdfda072e0bf899e5e71c5f196c76b5b2d91c78de1f84f369716ca6e85f82c41497e64f839ce92ed11a641557279620605f90b`

Expected envelope hash (with `signature_scheme="ed25519/v1"` and signature
above):

1. `3b261891f0ec466bae9b9a2b4789a6647a5a828b456e0f1494d4224a72bee409`

## 6. Verification Semantics

1. Missing signature => `SIGNATURE_REQUIRED`.
2. Proposal scheme mismatch with key scheme => `SIGNATURE_SCHEME_UNSUPPORTED`.
3. Signature parse/verify failure => `SIGNATURE_INVALID`.
4. Valid signature => `{ ok: true }`.

## 7. Replay Semantics

1. If `proposal.proposal_envelope_hash` is provided, gate MUST compare it with
   computed hash.
2. Mismatch => `PROPOSAL_ENVELOPE_HASH_MISMATCH`.
3. If `anti_replay_window_ticks > 0`, duplicate envelope in recent accepted
   history or current batch => `REPLAY_ENVELOPE_DUPLICATE`.
