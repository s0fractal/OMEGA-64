// OMEGA-64 | test_networked_cognition.ts | Stage 30 Verification
import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import { MX, LOGGER, Li } from "@generated";
import {
  PULSE
} from "@generated";

import {
  OP_SET,
  OP_SYSCALL,
  SYS_MSG,
  SYS_READ_INBOX
} from "@generated";

Deno.test("Stage 30: Networked Cognition (P2P Syscalls)", async () => {
  Li("--- STAGE 30: NETWORKED COGNITION TEST ---");

  // 1. Initialize world
  MX.clear();
  Atomics.store(MX.syncState, 0, 0); // Ensure IDLE (0)
  Atomics.store(MX.tickCounter, 0, 1); // Skip Gate audit
  await PULSE.initWorkers(1);

  // 2. Spawn two test atoms
  const senderIdx = 1;
  const receiverIdx = 2;
  MX.setId(senderIdx, 1n);
  MX.setEnergy(senderIdx, 1000);

  MX.setId(receiverIdx, 2n);
  MX.setEnergy(receiverIdx, 1000);

  // 3. Sender Script (SYS.MSG)
  // R0 = SYS.MSG (8)
  // R1 = targetIdx (2)
  // R2 = msgType (99)
  // R3 = payload (42)
  const senderScript = new Uint8Array(64);
  senderScript[0] = OP_SET;
  senderScript[1] = 0; // r0
  senderScript[2] = SYS_MSG;

  senderScript[3] = OP_SET;
  senderScript[4] = 1; // r1
  senderScript[5] = receiverIdx; // target

  senderScript[6] = OP_SET;
  senderScript[7] = 2; // r2
  senderScript[8] = 99; // msgType

  senderScript[9] = OP_SET;
  senderScript[10] = 3; // r3
  senderScript[11] = 42; // payload

  senderScript[12] = OP_SYSCALL;
  senderScript[13] = 0;
  MX.setInstructions(senderIdx, senderScript);

  // 4. Receiver Script (SYS.READ_INBOX)
  // R0 = SYS.READ_INBOX (9)
  const receiverScript = new Uint8Array(64);
  receiverScript[0] = OP_SET;
  receiverScript[1] = 0; // r0
  receiverScript[2] = SYS_READ_INBOX;

  receiverScript[3] = OP_SYSCALL;
  receiverScript[4] = 0;
  MX.setInstructions(receiverIdx, receiverScript);

  // Verify mailboxes are empty
  assertEquals(MX.getMailboxMsgType(receiverIdx), 0);
  assertEquals(MX.getMailboxPayload(receiverIdx), 0);

  // 5. Tick: Sender sends message, Receiver reads it (in the same parallel pulse)
  Li("Tick 1: Executing PULSE...");
  await PULSE.tick();

  // 6. Verify message was read and cleared
  const msgTypeAfterRead = MX.getMailboxMsgType(receiverIdx);
  const payloadAfterRead = MX.getMailboxPayload(receiverIdx);
  assertEquals(
    msgTypeAfterRead,
    0,
    "Inbox should be cleared after reading (msgType=0)",
  );
  assertEquals(
    payloadAfterRead,
    0,
    "Inbox should be cleared after reading (payload=0)",
  );

  // Verify R0 and R1 of Receiver contain the read values
  const r0 = MX.getReg(receiverIdx, 0);
  const r1 = MX.getReg(receiverIdx, 1);
  assertEquals(r0, 99, "Receiver R0 should contain msgType 99");
  assertEquals(r1, 42, "Receiver R1 should contain payload 42");

  // Verify Sender Gas deduction (OP_SET*4 + SYS_MSG)
  // Cost = 20 for SYS_MSG + 4 for SETs = ~ 24 + metabolic tick
  const senderEnergy = MX.getEnergy(senderIdx);
  assertEquals(
    senderEnergy < 980,
    true,
    `Sender should be taxed for sending MSG. Energy: ${senderEnergy}`,
  );

  Li("--- STAGE 30: SUCCESS ---");
  PULSE.stopWorkers();
});
