# i.L99.core.O_STREAM_SCHEMA.md

# OMEGA-64 | O_STREAM_SCHEMA (Minimal)

Purpose:

- Minimal validation contract for O stream proposals.

Rules:

- proposal_id, tick, base_state_hash, agent_id, intent, confidence, delta,
  cost_estimate, artifact_hash, semantic_fingerprint are required.
- delta must be non-empty with numeric level/value.
