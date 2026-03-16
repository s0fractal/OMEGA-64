---
id: glyph_pretty
type: module
description: Tape token stringifier for the OMEGA-64 virtual machine.
tags:
  - host
deps:
  - glyph_ir_64
  - disassembler
  - TYPES
min_level: 7
vars:
  - glyphSpecById
extra_symbols:
  - describeGlyphToken
  - glyphTapeToLines
  - glyphTapeToPrettyText
---

### TypeScript
```typescript





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
```
