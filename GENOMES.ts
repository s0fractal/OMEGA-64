import { RISC } from "./STATE_MATRIX.ts";
import { SYS } from "./STATE_MATRIX.ts";

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
  // [0-3] SYS_SCAN(radius = 3)
  RISC.OP_SET,
  1,
  3, // R1 = 3 (radius)
  RISC.OP_SET,
  0,
  SYS.SCAN, // R0 = SYS_SCAN
  RISC.OP_SYSCALL, // R0 now holds closestIdx or -1

  // [7-10] Store targetIdx (R0) in R3 for later
  RISC.OP_SET,
  3,
  0, // R3 = 0
  RISC.OP_ADD,
  3,
  0, // R3 = R3 + R0

  // [11-13] If R0 == 255 (or -1 unsigned), jump to YIELD? RISC has JZ. We need CMP.
  // Let's just unconditionally try to EAT. If R3 is -1, SYS_EAT will fail gracefully.
  // [14-17] SYS_EAT(targetIdx=R3, amount=50)
  RISC.OP_SET,
  0,
  0, // R0 = 0
  RISC.OP_ADD,
  1,
  3, // R1 = R3 (targetIdx) -> Wait, ADD R1, R3 adds R3 to R1? ISA.ADD is `regs[p1] = regs[p2] + regs[p3]`.
  // Let's look at RISC ISA. Actually we don't have RISC object for old ISA, we are using RISC from STATE_MATRIX.ts
]);

// Wait, the new VM is LAMBDA_VM or RISC?
// Look at `test_syscall_interface.ts` to see how scripts are written.
