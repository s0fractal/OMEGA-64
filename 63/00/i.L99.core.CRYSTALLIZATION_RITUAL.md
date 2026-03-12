# i.L99.core.CRYSTALLIZATION_RITUAL.md

# OMEGA-64 | Ritual of Crystallization

Purpose:

- Define the operator ritual for moving an artifact from drift to canon.

Prerequisites (Hard Gates):

- replayGreen == true
- gate admission index chain OK
- ledger chain OK
- SAFE_WINDOW open (drift + slope within thresholds)

Spectral Gates:

- Spectral concordance across lenses (SPECTRAL_INVARIANTS).
- Minimum lens count (>= 2) satisfied.

Ritual Steps:

1. Witness stabilization (CHECKPOINT.witnessedStabilization).
2. Run REPLAY_AUDIT with verifyLedgerChain + verifyTopologicalSignatures.
3. Run GATE_ADMISSION_REPORT and CRYSTALLIZATION_REPORT.
4. Validate spectral concordance for the candidate atom(s).
5. Emit CANONIZATION_EVENT with report hashes and witness.

Notes:

- This ritual is procedural; it does not imply automatic mutation.
- Canon is a consequence of stability, not a button.
