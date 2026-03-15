import { OP_NOP, OP_SET, OP_GET, OP_PUT, OP_ADD, OP_SUB, OP_JZ, OP_JNZ, OP_JMP, OP_REPLICATE, OP_SIGNAL, OP_BIND, OP_SHARE, OP_TENSEGRITY, OP_COLLECTIVE, OP_SECRETE_PLASMID, OP_BUILD, OP_SENSE, OP_SPORE_DRIVE, OP_HEBB, OP_PLUG, OP_RESOLVE, OP_SYSCALL } from "@generated";
import { glyphSpecByLegacyOpcode } from "@07/04/mod.ts";

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
  [OP_SPORE_DRIVE, "SPORE_DRIVE"],
  [OP_HEBB, "ENTANGLE"],
  [OP_PLUG, "PLUG"],
  [OP_RESOLVE, "RESOLVE"],
  [OP_SYSCALL, "SYSCALL"],
]);

const OPCODE_LENGTHS = new Map<number, number>([
  [OP_NOP, 1],
  [OP_SET, 3],
  [OP_GET, 3],
  [OP_PUT, 3],
  [OP_ADD, 3],
  [OP_SUB, 3],
  [OP_JZ, 3],
  [OP_JNZ, 3],
  [OP_JMP, 2],
  [OP_REPLICATE, 1],
  [OP_SIGNAL, 1],
  [OP_BIND, 1],
  [OP_SHARE, 3],
  [OP_PLUG, 3],
  [OP_TENSEGRITY, 4],
  [OP_COLLECTIVE, 4],
  [OP_SECRETE_PLASMID, 3],
  [OP_BUILD, 3],
  [OP_SENSE, 3],
  [OP_SPORE_DRIVE, 1],
  [OP_HEBB, 1],
  [OP_RESOLVE, 3],
  [OP_SYSCALL, 1],
]);

const opcodeName = (opcode: number): string =>
  OPCODE_NAMES.get(opcode) ?? `OP_0x${opcode.toString(16).toUpperCase()}`;

export const legacyOpcodeLength = (opcode: number): number =>
  OPCODE_LENGTHS.get(opcode) ?? 1;

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
