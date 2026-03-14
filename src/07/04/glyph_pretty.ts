import { glyphSpecById } from "@07/04/mod.ts";
import type { GlyphTapeToken } from "./opcode_to_glyph.ts";

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
): string => glyphTapeToLines(tape).join("\n");
