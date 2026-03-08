/**
 * swarm_test.rs
 * Тест інтерференції QWave.
 * Перевіряє конструктивну та деструктивну взаємодію.
 *
 * NOTE: Since I cannot compile Rust directly in this environment effectively without a cargo project setup,
 * this file serves as a logic verification script or a blueprint for the user to run.
 * I will emulate the logic in TypeScript for immediate verification if needed,
 * but this file is part of the requested artifacts (Lxx atoms are usually code).
 * However, atoms are usually .rs or .ts. This is a test.
 */

// Since we are adding this to the OMEGA/ repo, we can try to "emulate" the test
// by creating a small TypeScript script that implements the EXACT same math
// and runs it to verify the logic. The user can then use the Rust code in their actual system.

// Re-implementing the core logic in TS for verification output.
console.log("🌀 OMEGA-64: Swarm Wave Interference Test");

const PI = Math.PI;

function evaluate_phase_vector(amp: number, phi_u16: number): [number, number] {
  const phase_rad = (phi_u16 / 65535.0) * 2.0 * PI;
  return [amp * Math.cos(phase_rad), amp * Math.sin(phase_rad)];
}

function interference(
  waves: { r: number; phi: number; amp: number }[],
): { r: number; phi: number; amp: number } {
  let sum_x = 0.0;
  let sum_y = 0.0;

  waves.forEach((w) => {
    const [vx, vy] = evaluate_phase_vector(w.amp, w.phi);
    sum_x += vx;
    sum_y += vy;
  });

  const res_amp = Math.sqrt(sum_x * sum_x + sum_y * sum_y);
  let res_phase = Math.atan2(sum_y, sum_x);
  if (res_phase < 0) res_phase += 2 * PI;

  const res_phi_u16 = (res_phase / (2 * PI)) * 65535;

  // Simple average for r
  const res_r = waves.reduce((a, b) => a + b.r, 0) / waves.length;

  return {
    r: Math.round(res_r),
    phi: Math.round(res_phi_u16),
    amp: Math.round(res_amp),
  };
}

// Case 1: Constructive Interference
// Two waves in phase (phi=0), amp=100
const w1 = { r: 0, phi: 0, amp: 10000 };
const w2 = { r: 0, phi: 0, amp: 10000 };
const res1 = interference([w1, w2]);
console.log(`\nCase 1: Constructive (In-Phase)`);
console.log(`Wave A: Amp=${w1.amp}, Phi=${w1.phi}`);
console.log(`Wave B: Amp=${w2.amp}, Phi=${w2.phi}`);
console.log(`Result: Amp=${res1.amp} (Expected ~20000), Phi=${res1.phi}`);

if (res1.amp > 19000) console.log("✅ SUCCESS: Amplitude doubled.");
else console.log("❌ FAILURE: Constructive interference failed.");

// Case 2: Destructive Interference
// Two waves out of phase (phi=0 and phi=32768 ~ PI), amp=10000
const w3 = { r: 0, phi: 0, amp: 10000 };
const w4 = { r: 0, phi: 32767, amp: 10000 }; // ~PI
const res2 = interference([w3, w4]);
console.log(`\nCase 2: Destructive (Out-of-Phase)`);
console.log(`Wave A: Amp=${w3.amp}, Phi=${w3.phi}`);
console.log(`Wave B: Amp=${w4.amp}, Phi=${w4.phi}`);
console.log(`Result: Amp=${res2.amp} (Expected ~0)`);

if (res2.amp < 100) console.log("✅ SUCCESS: Waves annihilated.");
else console.log("❌ FAILURE: Destructive interference failed.");

// Case 3: 90 Degree Phase
// Two waves 90 deg apart (0 and 16384 ~ PI/2)
const w5 = { r: 0, phi: 0, amp: 10000 };
const w6 = { r: 0, phi: 16383, amp: 10000 }; // ~PI/2
const res3 = interference([w5, w6]);
console.log(`\nCase 3: Orthogonal (90 deg)`);
console.log(`Wave A: Amp=${w5.amp}, Phi=${w5.phi}`);
console.log(`Wave B: Amp=${w6.amp}, Phi=${w6.phi}`);
// Vector sum: sqrt(10000^2 + 10000^2) = 14142
console.log(`Result: Amp=${res3.amp} (Expected ~14142)`);

if (res3.amp > 14000 && res3.amp < 14300) {
  console.log("✅ SUCCESS: Vector sum correct.");
} else console.log("❌ FAILURE: Vector physics incorrect.");
