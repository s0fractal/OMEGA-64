// test_oracle.ts
// Verification of Era 3.2: Semantic Immunity

import { KAIROS_KAIROS as KAIROS } from "@omega";
import { SIGNAL__07_07_SIGNAL as SIGNAL } from "@omega";
import type { RIBOSOME_Atom as Atom } from "@omega";

console.log("🔮 TEST ORACLE: Initializing...");

// Mock Signal
SIGNAL.emit = (type: string, payload: any) => {
  console.log(`📡 SIGNAL MOCKED: [${type}] ${JSON.stringify(payload)}`);
};

// Mock Atoms to trigger KAIROS threshold
// KAIROS needs totalResonance > threshold (0.95 * N)
// totalResonance = N * (0.5..1.0)
// To force it, we might need to hack Math.random or just run it MANY times until it hits.
// Or we can monkey-patch KAIROS or Math.random

// Let's monkey-patch Math.random for deterministic high entropy
const originalRandom = Math.random;
Math.random = () => 0.99; // Always high resonance

const mockLattice: Atom[] = Array.from({ length: 10 }, (_, i) => ({
  id: `atom_${i}`,
  type: "TEST",
  content: "entropy",
  hash: "test",
  topo: { r: 0 },
}));

console.log("🔥 Triggering KAIROS ignition (Forced High Entropy)...");
await KAIROS.ignite(mockLattice);

// Restore random
Math.random = originalRandom;

console.log("✅ TEST ORACLE: Finished.");
