import { ISA, LAMBDA_VM } from "../02_metabolism/mod.ts";
import { STATE_MATRIX } from "../00_substrate/mod.ts";
import { RIBOSOME } from "../02_metabolism/mod.ts";

async function runWasmExpansionTests() {
  console.log("🕸️ [TEST] Booting Wasm Kernel Expansion Diagnostics...");
  await RIBOSOME.lift();

  STATE_MATRIX.clear();
  STATE_MATRIX.setId(1, 0x1111111111111111n);
  STATE_MATRIX.setEnergy(1, 100);
  const mockLogic = new Uint8Array(8);
  mockLogic[0] = 5;
  STATE_MATRIX.setLogic(1, mockLogic);

  // We are going to construct a complex program to test MUL, CMP, CALL, RET, JZ, JMP
  const code = new Uint32Array(16);
  // Program:
  // 0: CALL func (jump to 8)
  // 1: JMP end (jump to 15)

  // func:
  // 8: LOAD 0, 0, 0 (R0 = LOGIC[0] (val: 5))
  // 9: MUL 1, 0, 0 (R1 = R0 * R0 (val: 25))
  // 10: CMP 1, 2 (Compare R1 with R2 (val: 25 vs 25) -> Set Z flag)
  // 11: JZ return_func (jump to 13 if Z flag set)
  // 12: JMP err
  // return_func:
  // 13: RET (pop 1, jump to pc=1)

  // end:
  // 15: NOP (halt)

  code[0] = ISA.CALL | (8 << 8);
  code[1] = ISA.JMP | (15 << 8);

  code[8] = ISA.LOAD | (0 << 8) | (0 << 16) | (0 << 24);
  code[9] = ISA.MUL | (1 << 8) | (0 << 16) | (0 << 24);
  code[10] = ISA.CMP | (1 << 8) | (2 << 16);
  code[11] = ISA.JZ | (13 << 8);
  code[12] = ISA.JMP | (14 << 8); // Error trap
  code[13] = ISA.RET;

  code[14] = ISA.MOVE | (128 << 8); // Trap
  code[15] = ISA.MOVE | (128 << 8); // Halt (stay in place)

  STATE_MATRIX.setCode(1, code);

  // Context execution
  const context = new Uint8Array(32);
  context[2 + 0] = 5; // R0 = 5
  context[2 + 2] = 25; // R2 = 25

  const vmState = {
    x: 0,
    y: 0,
    nutrients: new Int32Array(1),
    marketPool: new Int32Array(1),
    energy: 100,
    resonance: 0,
    bonds: new Uint32Array(4),
  };

  console.log("--- Executing Cycle 0 (CALL) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[0] !== 8) {
    console.error("❌ CALL failed. PC is:", context[0]);
    Deno.exit(1);
  }
  if (context[18] !== 1 || context[10] !== 1) {
    console.error("❌ CALL stack push failed.");
    Deno.exit(1);
  }

  console.log("--- Executing Cycle 1 (LOAD) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[0] !== 9) {
    console.error("❌ LOAD failed PC inc.");
    Deno.exit(1);
  }

  console.log("--- Executing Cycle 2 (MUL) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[2 + 1] !== 25) {
    console.error("❌ MUL failed. R1 is:", context[2 + 1]);
    Deno.exit(1);
  }

  console.log("--- Executing Cycle 3 (CMP) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if ((context[1] & 0x01) !== 1) {
    console.error("❌ CMP failed to set Zero Flag. Flags:", context[1]);
    Deno.exit(1);
  }

  console.log("--- Executing Cycle 4 (JZ) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[0] !== 13) {
    console.error("❌ JZ failed to branch. PC is:", context[0]);
    Deno.exit(1);
  }

  console.log("--- Executing Cycle 5 (RET) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[0] !== 1) {
    console.error("❌ RET failed to return to PC 1. PC is:", context[0]);
    Deno.exit(1);
  }
  if (context[18] !== 0) {
    console.error("❌ RET failed to decrement SP.");
    Deno.exit(1);
  }

  console.log("--- Executing Cycle 6 (JMP) ---");
  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[0] !== 15) {
    console.error("❌ JMP failed to branch. PC is:", context[0]);
    Deno.exit(1);
  }

  console.log("✅ [TEST] Hardware-level Wasm Control Flow & Math confirmed!");

  // --- Test Data Movement to Base Genome (LOGIC) ---
  console.log("\n🕸️ [TEST] Testing Wasm Viral Mutator (Genome Write/Read) ...");
  // R0 = 0xAA. STORE it to LOGIC[3]. LOAD it to R1.
  const viralCode = new Uint32Array(16);
  viralCode[0] = ISA.STORE | (0 << 8) | (3 << 16) | (0 << 24); // p1=0 (R0), p2=3 (Logic idx)
  viralCode[1] = ISA.LOAD | (1 << 8) | (3 << 16) | (0 << 24); // p1=1 (R1), p2=3 (Logic idx)
  STATE_MATRIX.setCode(1, viralCode);

  context.fill(0);
  context[2 + 0] = 0xAA;

  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  const logicAfterStore = STATE_MATRIX.getLogic(1);
  if (logicAfterStore[3] !== 0xAA) {
    console.error("❌ Wasm STORE to LOGIC failed.");
    Deno.exit(1);
  }

  LAMBDA_VM.execute(
    STATE_MATRIX.getLogic(1),
    STATE_MATRIX.getCode(1),
    context,
    vmState,
  );
  if (context[2 + 1] !== 0xAA) {
    console.error("❌ Wasm LOAD from LOGIC failed.");
    Deno.exit(1);
  }

  console.log("✅ [TEST] Wasm Viral Base Genome mutation active!");
  console.log(
    "🎉 [VERIFIED] Era 43 Phase 2 is complete. AssemblyScript Kernel achieves structural coherence.",
  );
}

runWasmExpansionTests();
