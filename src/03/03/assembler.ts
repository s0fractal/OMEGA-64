import { OP_NOP, OP_SET, OP_GET, OP_PUT, OP_ADD, OP_SUB, OP_JZ, OP_JNZ, OP_JMP, OP_REPLICATE, OP_SIGNAL, OP_BIND, OP_SHARE, OP_PLUG, OP_TENSEGRITY, OP_HEBB, OP_BUILD, OP_SENSE, OP_COLLECTIVE, OP_SECRETE_PLASMID, OP_SPORE_DRIVE, OP_SENSE_AS, OP_RESOLVE, OP_RESONATE_KURAMOTO, OP_SYSCALL } from "../../_/mod.ts";

export const OP_ARITY: Record<number, number> = {
  [OP_NOP]: 0,
  [OP_SET]: 2,
  [OP_GET]: 2,
  [OP_PUT]: 2,
  [OP_ADD]: 2,
  [OP_SUB]: 2,
  [OP_JZ]: 2,
  [OP_JNZ]: 2,
  [OP_JMP]: 1,
  [OP_REPLICATE]: 0,
  [OP_SIGNAL]: 0,
  [OP_BIND]: 0,
  [OP_SHARE]: 2,
  [OP_PLUG]: 2,
  [OP_TENSEGRITY]: 3,
  [OP_HEBB]: 0, // Maps to OP_HEBB
  [OP_BUILD]: 2,
  [OP_SENSE]: 2,
  [OP_COLLECTIVE]: 3,
  [OP_SECRETE_PLASMID]: 2, // Maps to OP_SECRETE_PLASMID
  [OP_SPORE_DRIVE]: 0,
  [OP_SENSE_AS]: 2,
  [OP_RESOLVE]: 2,
  [OP_RESONATE_KURAMOTO]: 1,
  [OP_SYSCALL]: 0,
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
