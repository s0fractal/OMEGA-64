// test_signal.ts
// Verification of Era 2.7: The Signal

import { KAIROS_KAIROS as KAIROS } from "@omega";
import { RIBOSOME_Atom as Atom } from "@omega";

console.log("📡 TEST SIGNAL: Initializing...");

// Mock Lattice
const mockLattice: Atom[] = Array.from({ length: 100 }, (_, i) => ({
  id: `atom_${i}.ts`,
  level: i % 64,
  content: "// mock",
  hash: "mock_hash",
}));

// Force KAIROS to trigger (run multiple times until threshold hit)
// We bumped threshold to 0.95, and random is 0.5-1.0.
// So needs random > 0.9.
console.log("⏳ TEST SIGNAL: Burning cycles to trigger KAIROS...");

for (let i = 0; i < 50; i++) {
  await KAIROS.ignite(mockLattice);
}

console.log("✅ TEST SIGNAL: Finished cycles. Check OMEGA_SIGNAL.md.");
