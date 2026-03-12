# i.L99.core.LOAD_MODEL

Hybrid load model for invariant anchoring.

Purpose: Model how invariants slow down due to imports from higher-entropy
layers without collapsing into zero. Load depends on entropy mass and phase
misalignment.

Definitions (per import i):

- phi_i: phase in [0..65535]
- evt_i: entropy in [-32768..32767]
- w_i: coupling weight (>= 0)
- a_i: optional amplitude/resonance weight (default 1)

Normalization: e_i = (evt_i + 32768) / 65535 // entropy mass in [0..1] dphi =
min(|phi_i - phi_inv|, 65535 - |phi_i - phi_inv|) p_i = 1 - cos(2π * dphi
/ 65535) // phase mismatch in [0..2]

Hybrid load: Load = Σ (w_i * e_i * p_i * a_i)

Effective frequency: omega_eff = omega_0 / (1 + alpha * Load) omega_eff <=
omega_max

Standing invariant condition (conceptual):

- phase lock is stable (Δφ bounded)
- Load remains low across time
- coherence increases in projections

Notes:

- This is a hybrid of entropy mass and phase mismatch.
- It avoids collapsing everything to zero under simple optimization.
- Phase mismatch can be computed on i16 or mapped to radians.
- Relation to ML weighting (for intuition):
  - The sum has a familiar "weighted signal" form.
  - Here weights are coupling/physics (not learned loss minimizers).
  - Load is an energy/drag term, not an error.
  - Phase mismatch is closer to cosine-similarity than to raw distance.
  - Intuition: resonance lowers drag (like attention alignment), mismatch raises
    it (like friction).

i16 mapping hint: phi_rad = (phi / 65535) * 2π
