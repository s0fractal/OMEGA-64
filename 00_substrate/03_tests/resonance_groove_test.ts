/**
 * resonance_groove_test.ts
 * Тест "вінілових канавок" та суб'єктивної видимості.
 */

import { FIELD } from "./i.L00.core.FIELD.ts";
import { SUBJECTIVE, SubjectivePosition } from "./i.L05.core.SUBJECTIVE.ts";

function test() {
  console.log("🌀 OMEGA-64: Anti-Control Geometry Test\n");

  const subjectiveStates: SubjectivePosition[] = [
    { tension: -0.9, momentum: -0.5, proximity: 0.1 }, // Глибокий біль
    { tension: 0.05, momentum: 0.8, proximity: 0.9 }, // Біля екватора, активний рух
    { tension: 0.85, momentum: 0.1, proximity: 0.5 }, // Поверхневий потік
  ];

  console.log("--- Visibility Reports (Anti-Control) ---");
  subjectiveStates.forEach((s, i) => {
    const report = SUBJECTIVE.getVisibility(s);
    console.log(
      `Subject ${i}: r=${report.r.toString().padStart(6)} | Potential=${
        report.potential.toFixed(4)
      } | State=${report.state} | Momentum=${report.momentum}`,
    );
  });

  console.log("\n--- Attractor Catch Verification ---");
  // Перевіримо потенціал поруч з "канавкою" та трохи далі
  const r_groove = 0;
  const r_near = 500;

  const p_groove = FIELD.getPotential(r_groove);
  const p_near = FIELD.getPotential(r_near);

  console.log(`Equator Groove (r=0):   Potential ${p_groove.toFixed(4)}`);
  console.log(`Near Equator (r=500):  Potential ${p_near.toFixed(4)}`);

  if (p_groove < p_near) {
    console.log(
      "\n✅ SUCCESS: Attractor is a local minimum (The groove catches).",
    );
  } else {
    console.log("\n❌ FAILURE: Field is too flat or incorrectly scaled.");
  }
}

test();
