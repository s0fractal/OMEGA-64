/**
 * interference_wave_test.ts
 * Тест семантичної інтерференції хвильових пакетів.
 */

import { WAVE_PACKET } from "@00/03_tests/i.L13.core.WAVE_PACKET.ts";
import { INTERFERENCE } from "@00/03_tests/i.L13.core.INTERFERENCE.ts";

function test() {
  console.log("🌊 OMEGA-64: Semantic Interference Test\n");

  const p1 = WAVE_PACKET.create(0, 500, 0, 1.0); // Центр 0, фаза 0
  const p2_constructive = WAVE_PACKET.create(200, 500, 0, 1.0); // Фаза 0 (Конструктивна)
  const p2_destructive = WAVE_PACKET.create(200, 500, Math.PI, 1.0); // Фаза PI (Деструктивна)

  console.log("--- Point Interference (at r=100) ---");
  const res_c = INTERFERENCE.superpose(p1, p2_constructive, 100);
  const res_d = INTERFERENCE.superpose(p1, p2_destructive, 100);

  console.log(`Constructive Amplitude: ${res_c.toFixed(4)} (Expected > 1.0)`);
  console.log(`Destructive Amplitude:  ${res_d.toFixed(4)} (Expected < 1.0)`);

  console.log("\n--- Semantic Tension (Overlap Conflict) ---");
  const tension_c = INTERFERENCE.getTension(p1, p2_constructive);
  const tension_d = INTERFERENCE.getTension(p1, p2_destructive);

  console.log(`Tension (Same Phase): ${tension_c.toFixed(4)}`);
  console.log(`Tension (Opposite):   ${tension_d.toFixed(4)} (Expected High)`);
}

test();
