import { RISC } from "@00";
import { SYS } from "@00";

// Utility to assemble RISC script
export function assembleScript(ops: number[]): Uint8Array {
  const script = new Uint8Array(64);
  for (let i = 0; i < ops.length && i < 64; i++) {
    script[i] = ops[i];
  }
  return script; // Unused slots remain 0 (NOOP/HALT depending on ISA, but default is 0)
}

// ---------------------------------------------------------
// PREDATOR GENOME (Vector 36)
// 1. SCAN for nearest atom (radius = 5)
// 2. If none, MOVE random. If found, calculate DX/DY and MOVE towards it.
// 3. EAT from target.
// 4. If ENERGY > 500, REPLICATE? (Complex for pure RISC without conditional jumps to arbitrary addresses)
// Let's keep it simpler for the ABI:
//    R1 = 5
//    R0 = SYS_SCAN
//    SYSCALL
//    R1 = R0 (Target ID)
//    if R1 == -1, skip to MOVE random (Requires careful jumps)
//    Instead of pure RISC branch-heavy logic, let's just make a simple script:
//    SCAN(r=2) -> if found(R0 != -1): EAT(R0, amount=50). MOVE towards it?
//    Actually, calculating dx/dy in RISC without advanced math opcodes is hard.
//    Let's just SCAN and EAT. The predator doesn't move well yet, or it moves randomly.
// ---------------------------------------------------------

export const SIMPLE_PREDATOR_SCRIPT = assembleScript([
  // [0-2] R1 = 3 (SCAN radius)
  RISC.OP_SET,
  1,
  3,
  // [3-5] R0 = SYS_SCAN
  RISC.OP_SET,
  0,
  SYS.SCAN,
  // [6] SYSCALL -> R0 = targetIdx
  RISC.OP_SYSCALL,

  // [7-9] R1 = 0
  RISC.OP_SET,
  1,
  0,
  // [10-12] R1 = R1 + R0
  RISC.OP_ADD,
  1,
  0,

  // [13-15] R2 = 0 (Resource: Energy)
  RISC.OP_SET,
  2,
  0,

  // [16-18] R3 = 50
  RISC.OP_SET,
  3,
  50,
  // [19-21] R4 = 0
  RISC.OP_SET,
  4,
  0,
  // [22-24] R3 = R4 - R3 (0 - 50 = -50)
  RISC.OP_SUB,
  3,
  4, // R3 = 0 - 50 = -50

  // [25-27] R0 = SYS_TRANSFER (10)
  RISC.OP_SET,
  0,
  SYS.TRANSFER,
  // [28] SYSCALL -> Steal 50 energy
  RISC.OP_SYSCALL,

  // [29-31] R0 = SYS_YIELD
  RISC.OP_SET,
  0,
  SYS.YIELD,
  // [32] SYSCALL
  RISC.OP_SYSCALL,
]);

// Wait, the new VM is LAMBDA_VM or RISC?
// Look at `test_syscall_interface.ts` to see how scripts are written.
