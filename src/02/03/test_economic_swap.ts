// OMEGA-64 | test_economic_swap.ts | Stage 31 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { STATE_MATRIX, LOGGER, Li } from "@generated";
import {
  PULSE
} from "@generated";

import {
  OP_SET,
  SYS_TRANSFER,
  OP_SYSCALL
} from "@generated";

Deno.test("Stage 31: Economic Swap Protocol (Cross-Chain P2P Transfer)", async () => {
  Li("--- STAGE 31: ECONOMIC SWAP TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 1);
  await PULSE.initWorkers(1);

  const senderIdx = 1;
  const receiverIdx = 2;

  STATE_MATRIX.setId(senderIdx, 1n);
  STATE_MATRIX.setEnergy(senderIdx, 1000);
  STATE_MATRIX.setResonance(senderIdx, 50);

  STATE_MATRIX.setId(receiverIdx, 2n);
  STATE_MATRIX.setEnergy(receiverIdx, 100);
  STATE_MATRIX.setResonance(receiverIdx, 10);

  // Sender Script: Transfer 500 Energy to Receiver
  // R0 = SYS.TRANSFER (10)
  // R1 = targetIdx (2)
  // R2 = resourceType (0 = Energy)
  // R3 = amount (500)
  const senderScript = new Uint8Array(64);
  senderScript[0] = OP_SET;
  senderScript[1] = 0; // r0
  senderScript[2] = SYS_TRANSFER;

  senderScript[3] = OP_SET;
  senderScript[4] = 1; // r1
  senderScript[5] = receiverIdx; // target

  senderScript[6] = OP_SET;
  senderScript[7] = 2; // r2
  senderScript[8] = 0; // 0 = Energy

  // NOTE: RISC.OP_SET sets a 1-byte value (0-255).
  // Let's transfer 200 Energy to stay within an 8-bit literal.
  // Wait, amount in SYS_TRANSFER expects standard scale (where 1 = 1.0 Energy represented internally as 1000)
  // So 200 amount means sending 200 physical Energy.
  senderScript[9] = OP_SET;
  senderScript[10] = 3; // r3
  senderScript[11] = 200; // amount

  senderScript[12] = OP_SYSCALL;
  senderScript[13] = 0;
  STATE_MATRIX.setInstructions(senderIdx, senderScript);

  // Receiver does nothing this tick.

  Li("Executing Economic Transfer Pulse...");
  await PULSE.tick();

  const senderEnergy = STATE_MATRIX.getEnergy(senderIdx);
  const receiverEnergy = STATE_MATRIX.getEnergy(receiverIdx);

  // Sender started at 1000.
  // Sent 200. Gas fee ~10. Metabolic tick takes ~1-3. expected remaining ~785-790.
  Li(`Sender Energy remaining: ${senderEnergy}`);
  Li(`Receiver Energy remaining: ${receiverEnergy}`);

  assertEquals(
    senderEnergy < 800,
    true,
    "Sender must have < 800 Energy (1000 initial - 200 sent - 10 gas tax)",
  );
  assertEquals(
    receiverEnergy > 295 && receiverEnergy < 305,
    true,
    "Receiver must have ~300 Energy (100 initial + 200 received - ~1 metabolic tax)",
  );

  // Test Resonance Transfer next tick
  senderScript.fill(0);
  senderScript[0] = OP_SET;
  senderScript[1] = 0;
  senderScript[2] = SYS_TRANSFER;
  senderScript[3] = OP_SET;
  senderScript[4] = 1;
  senderScript[5] = receiverIdx;
  senderScript[6] = OP_SET;
  senderScript[7] = 2;
  senderScript[8] = 1; // 1 = Resonance
  senderScript[9] = OP_SET;
  senderScript[10] = 3;
  senderScript[11] = 25; // Send 25 Resonance
  senderScript[12] = OP_SYSCALL;
  senderScript[13] = 0;
  STATE_MATRIX.setInstructions(senderIdx, senderScript);
  STATE_MATRIX.setPC(senderIdx, 0); // Need to reset PC for new script to run!

  Li("Executing Resonance Transfer Pulse...");
  await PULSE.tick();

  const senderResonance = STATE_MATRIX.getResonance(senderIdx);
  const receiverResonance = STATE_MATRIX.getResonance(receiverIdx);

  Li(`Sender Resonance remaining: ${senderResonance}`);
  Li(`Receiver Resonance remaining: ${receiverResonance}`);

  // Sender started at 50. Pulse 1 decay: -2 (48). Pulse 2 transferred 25, decay -2 = 21.
  // Receiver started at 10. Pulse 1 decay: -2 (8). Pulse 2 received 25, decay -2 = 31.
  assertEquals(
    senderResonance,
    21,
    "Sender Resonance should be 21 (50 - 2 decay - 25 sent - 2 decay)",
  );
  assertEquals(
    receiverResonance,
    31,
    "Receiver Resonance should be 31 (10 - 2 decay + 25 received - 2 decay)",
  );

  Li("--- STAGE 31: SUCCESS ---");
  PULSE.stopWorkers();
});
