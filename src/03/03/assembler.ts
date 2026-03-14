import { RISC } from "../../00/STATE_MATRIX.ts";

export const OP_ARITY: Record<number, number> = {
  [RISC.OP_NOP]: 0,
  [RISC.OP_SET]: 2,
  [RISC.OP_GET]: 2,
  [RISC.OP_PUT]: 2,
  [RISC.OP_ADD]: 2,
  [RISC.OP_SUB]: 2,
  [RISC.OP_JZ]: 2,
  [RISC.OP_JNZ]: 2,
  [RISC.OP_JMP]: 1,
  [RISC.OP_REPLICATE]: 0,
  [RISC.OP_SIGNAL]: 0,
  [RISC.OP_BIND]: 0,
  [RISC.OP_SHARE]: 2,
  [RISC.OP_PLUG]: 2,
  [RISC.OP_TENSEGRITY]: 3,
  [RISC.ENTANGLE]: 0, // Maps to OP_HEBB
  [RISC.OP_BUILD]: 2,
  [RISC.OP_SENSE]: 2,
  [RISC.OP_COLLECTIVE]: 3,
  [RISC.ROLE]: 2, // Maps to OP_SECRETE_PLASMID
  [RISC.OP_SPORE_DRIVE]: 0,
  [RISC.OP_SENSE_AS]: 2,
  [RISC.OP_RESOLVE]: 2,
  [RISC.OP_RESONATE_KURAMOTO]: 1,
  [RISC.OP_SYSCALL]: 0,
};

export const assemble = (instructions: (number | string)[]): Uint8Array => {
  const binary = new Uint8Array(64);
  const labels: Record<string, number> = {};

  // Pass 1: Resolve Labels
  let pc = 0;
  for (let i = 0; i < instructions.length; ) {
    const item = instructions[i];
    if (typeof item === "string") {
      labels[item] = pc;
      i++;
    } else {
      const arity = OP_ARITY[item as number] ?? 0;
      pc += 1 + arity;
      i += 1 + arity;
    }
  }

  // Pass 2: Emit bytes
  pc = 0;
  for (let i = 0; i < instructions.length; ) {
    const item = instructions[i];
    if (typeof item === "string") {
      i++;
    } else {
      binary[pc++] = item as number;
      const arity = OP_ARITY[item as number] ?? 0;
      for (let j = 0; j < arity; j++) {
        const arg = instructions[i + 1 + j];
        if (typeof arg === "string") {
          if (labels[arg] === undefined) {
             throw new Error(`Assembler Error: Unresolved label '${arg}'`);
          }
          binary[pc++] = labels[arg];
        } else {
          binary[pc++] = (arg as number) & 0xFF; // ensure byte boundary just in case
        }
      }
      i += 1 + arity;
    }
  }

  return binary;
};
