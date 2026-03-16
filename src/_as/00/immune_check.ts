// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/immune_check.md

@inline
export function immune_check(energy: i32, resonance: i32, id_handle: i32, role: u8, entropy_pressure: i32): bool {
if (id_handle === 0) return false;

  // Necrotic check (Zero energy and zero resonance)
  if (energy <= 0 && resonance <= 0) return true;

  if (role === 5) return false; // ROLE_MITOCHONDRIA are immune to drifting checks

  // Drifting check
  // Base threshold for "weak" atoms.
  // Entropy pressure (H0) modulates how aggressive the cleanup is.
  // Normalized H0 is 0..1000.
  // We use integer math to avoid floats where possible. threshold * 1000 = entropy * 2.
  const threshold_x1000 = entropy_pressure * 2;
  const energy_x1000 = energy * 1000;
  
  // energy < threshold
  if (energy_x1000 < threshold_x1000) {
      // resonance < threshold * 100 -> resonance * 10 < threshold * 1000
      if ((resonance * 10) < threshold_x1000) {
          return true;
      }
  }

  return false;
}
