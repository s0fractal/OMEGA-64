---
id: assembler
type: module
description: Two-pass bytecode assembler for the OMEGA-64 virtual machine.
tags:
  - host
deps:
  - OPCODE_ARITY_LUT
  - TYPES
min_level: 7
vars:
  - OPCODE_ARITY_LUT
  - AssembleToken
extra_symbols:
  - assemble
---


```typescript




export const assemble = (instructions: AssembleToken[]): Uint8Array => {
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
      const arity = OPCODE_ARITY_LUT[item as number] ?? 0;
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
      const arity = OPCODE_ARITY_LUT[item as number] ?? 0;
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
```
