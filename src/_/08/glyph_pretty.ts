// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/glyph_pretty.md
import { glyphSpecById, glyph_ir_64, disassembler } from "@g07";

export const describeGlyphToken = (token: GlyphTapeToken): string => {
  const spec = token.glyphId === null ? null : glyphSpecById(token.glyphId);
  const glyphLabel = token.mapped && spec
    ? `${spec.mnemonic}[${spec.id}]`
    : `UNMAPPED(${token.opcodeMnemonic})`;
  const args = token.args.length > 0 ? ` args=[${token.args.join(",")}]` : "";
  const reductionRule = spec ? ` rule=${spec.reductionRuleRef}` : "";
  const energy = spec ? ` energy=${spec.energyCost}` : "";
  return `pc=${token.pc} opcode=${token.opcodeMnemonic} -> ${glyphLabel}${args}${energy}${reductionRule}`;
};

export const glyphTapeToLines = (tape: readonly GlyphTapeToken[]): string[] =>
  tape.map((token) => describeGlyphToken(token));

export const glyphTapeToPrettyText = (
  tape: readonly GlyphTapeToken[],
): string => glyphTapeToLines(tape).join("\\n");
