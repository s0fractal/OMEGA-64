/**
 * resonance_dipole_test.ts
 * Тест дипольного поля та енергетичного метаболізму.
 */

import { FIELD } from "./i.L00.core.FIELD.ts";
import { ENERGY_ENGINE, QWaveState } from "./i.L05.core.ENERGY.ts";

function test() {
  console.log("🌀 OMEGA-64: Dipole Field Resonance Test\n");

  const points = [-30000, -10000, -500, 0, 500, 10000, 30000];

  console.log("--- Logarithmic Compression ---");
  points.forEach((p) => {
    const comp = FIELD.compress(p);
    const exp = FIELD.expand(comp);
    console.log(
      `p: ${p.toString().padStart(6)} | log: ${
        comp.toFixed(2).padStart(8)
      } | exp: ${exp.toString().padStart(6)} | Diff: ${Math.abs(p - exp)}`,
    );
  });

  console.log("\n--- Potential & Pain Simulation ---");
  const states: QWaveState[] = [
    { r: 0, energy: 1000, coherence: 1.0, tension: 0 },
    { r: 15000, energy: 500, coherence: 0.9, tension: 50 },
    { r: -32000, energy: 200, coherence: 0.95, tension: 150 },
  ];

  states.forEach((s, i) => {
    const potential = FIELD.getPotential(s.r);
    const decay = ENERGY_ENGINE.calculateDecay(s);
    const pain = ENERGY_ENGINE.getPainLevel(s);
    console.log(
      `State ${i} [r: ${s.r.toString().padStart(6)}]: Potential: ${
        potential.toFixed(4)
      } | Decay: ${decay.toFixed(2)} | Pain: ${pain.toFixed(2)}`,
    );
  });
}

test();
