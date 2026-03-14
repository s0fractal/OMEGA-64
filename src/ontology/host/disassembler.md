---
id: disassembler
type: module
description: "Disassembler to decode OMEGA-64 legacy opcodes into GlyphTapeTokens."
tags: ["host"]
deps: [OPCODE_ARITY_LUT]
min_level: 7
---

### TypeScript
```typescript
import { OPCODE_ARITY_LUT } from "../00/mod.ts";
import { OP_NOP, OP_SET, OP_GET, OP_PUT, OP_ADD, OP_SUB, OP_JZ, OP_JNZ, OP_JMP, OP_SYSCALL, OP_REPLICATE, OP_SIGNAL, OP_BIND, OP_SHARE, OP_HEBB, OP_PLUG, OP_TENSEGRITY, OP_COLLECTIVE, OP_BUILD, OP_SPORE_DRIVE, OP_SENSE, OP_SENSE_AS, OP_SECRETE_PLASMID, OP_INCORPORATE_PLASMID, OP_RESOLVE, OP_RESONATE_KURAMOTO } from "../00/mod.ts";
// We need glyphSpecByLegacyOpcode which is part of glyph_ir_64 module
import { glyphSpecByLegacyOpcode } from "./glyph_ir_64.ts";

export type LegacyInstruction = {
  pc: number;
  opcode: number;
  opcodeMnemonic: string;
  length: number;
  args: number[];
};

export type GlyphTapeToken = LegacyInstruction & {
  glyphId: number | null;
  glyphMnemonic: string | null;
  mapped: boolean;
};

const OPCODE_NAMES = new Map<number, string>([
  [OP_NOP, "NOP"],
  [OP_SET, "SET"],
  [OP_GET, "GET"],
  [OP_PUT, "PUT"],
  [OP_ADD, "ADD"],
  [OP_SUB, "SUB"],
  [OP_JZ, "JZ"],
  [OP_JNZ, "JNZ"],
  [OP_JMP, "JMP"],
  [OP_REPLICATE, "REPLICATE"],
  [OP_SIGNAL, "SIGNAL"],
  [OP_BIND, "BIND"],
  [OP_SHARE, "SHARE"],
  [OP_TENSEGRITY, "TENSEGRITY"],
  [OP_COLLECTIVE, "COLLECTIVE"],
  [OP_SECRETE_PLASMID, "ROLE"],
  [OP_BUILD, "BUILD"],
  [OP_SENSE, "SENSE"],
  [OP_SENSE_AS, "SENSE_AS"],
  [OP_SPORE_DRIVE, "SPORE_DRIVE"],
  [OP_HEBB, "ENTANGLE"],
  [OP_PLUG, "PLUG"],
  [OP_RESOLVE, "RESOLVE"],
  [OP_SYSCALL, "SYSCALL"],
  [OP_RESONATE_KURAMOTO, "RESONATE_KURAMOTO"]
]);

const opcodeName = (opcode: number): string =>
  OPCODE_NAMES.get(opcode) ?? `OP_0x${opcode.toString(16).toUpperCase()}`;

export const legacyOpcodeLength = (opcode: number): number =>
  (OPCODE_ARITY_LUT[opcode] ?? 0) + 1;

export const decodeLegacyInstruction = (
  script: Uint8Array,
  pc: number,
): LegacyInstruction | null => {
  if (pc < 0 || pc >= script.length) return null;
  const opcode = script[pc] ?? OP_NOP;
  const length = legacyOpcodeLength(opcode);
  const args = Array.from(script.slice(pc + 1, pc + length));
  return {
    pc,
    opcode,
    opcodeMnemonic: opcodeName(opcode),
    length,
    args,
  };
};

type ScriptToGlyphOptions = {
  allowUnmapped?: boolean;
  maxSteps?: number;
};

export const scriptToGlyphTape = (
  script: Uint8Array,
  options: ScriptToGlyphOptions = {},
): GlyphTapeToken[] => {
  const allowUnmapped = options.allowUnmapped ?? false;
  const maxSteps = Math.max(1, Math.min(64, options.maxSteps ?? 64));
  const out: GlyphTapeToken[] = [];
  let pc = 0;
  let steps = 0;

  while (pc >= 0 && pc < script.length && steps < maxSteps) {
    const decoded = decodeLegacyInstruction(script, pc);
    if (!decoded) break;
    if (decoded.opcode === OP_NOP) break;

    const spec = glyphSpecByLegacyOpcode(decoded.opcode);
    if (!spec && !allowUnmapped) {
      throw new Error(
        `[opcode_to_glyph] unmapped legacy opcode at pc=${pc}: ${decoded.opcodeMnemonic}`,
      );
    }

    out.push({
      ...decoded,
      glyphId: spec?.id ?? null,
      glyphMnemonic: spec?.mnemonic ?? null,
      mapped: spec !== null,
    });

    pc += decoded.length;
    steps++;
  }

  return out;
};
```
