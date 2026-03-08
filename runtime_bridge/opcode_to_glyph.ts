import { RISC } from "../STATE_MATRIX.ts";
import { glyphSpecByLegacyOpcode } from "../reduction_core/GlyphIR64.ts";

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
  [RISC.OP_NOP, "NOP"],
  [RISC.OP_SET, "SET"],
  [RISC.OP_GET, "GET"],
  [RISC.OP_PUT, "PUT"],
  [RISC.OP_ADD, "ADD"],
  [RISC.OP_SUB, "SUB"],
  [RISC.OP_JZ, "JZ"],
  [RISC.OP_JNZ, "JNZ"],
  [RISC.OP_JMP, "JMP"],
  [RISC.OP_REPLICATE, "REPLICATE"],
  [RISC.OP_SIGNAL, "SIGNAL"],
  [RISC.OP_BIND, "BIND"],
  [RISC.OP_SHARE, "SHARE"],
  [RISC.OP_TENSEGRITY, "TENSEGRITY"],
  [RISC.OP_COLLECTIVE, "COLLECTIVE"],
  [RISC.OP_ROLE, "ROLE"],
  [RISC.OP_BUILD, "BUILD"],
  [RISC.OP_SENSE, "SENSE"],
  [RISC.OP_SPORE_DRIVE, "SPORE_DRIVE"],
  [RISC.OP_ENTANGLE, "ENTANGLE"],
  [0xA4, "PLUG"],
  [RISC.OP_RESOLVE, "RESOLVE"],
]);

const OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_NOP, 1],
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_PUT, 3],
  [RISC.OP_ADD, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_JZ, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_REPLICATE, 1],
  [RISC.OP_SIGNAL, 1],
  [RISC.OP_BIND, 1],
  [RISC.OP_SHARE, 3],
  [0xA4, 3],
  [RISC.OP_TENSEGRITY, 4],
  [RISC.OP_COLLECTIVE, 4],
  [RISC.OP_ROLE, 3],
  [RISC.OP_BUILD, 3],
  [RISC.OP_SENSE, 3],
  [RISC.OP_SPORE_DRIVE, 1],
  [RISC.OP_ENTANGLE, 1],
  [RISC.OP_RESOLVE, 3],
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
  const opcode = script[pc] ?? RISC.OP_NOP;
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
    if (decoded.opcode === RISC.OP_NOP) break;

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
