import { RISC } from "./STATE_MATRIX.ts";
import {
  BRIDGE_GLYPH_IDS,
  GLYPH_SPECS,
  glyphSpecById,
  glyphSpecByLegacyOpcode,
} from "./reduction_core/GlyphIR64.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  expect(GLYPH_SPECS.length === 64, "[glyphir64] expected 64 glyph specs");

  const ids = new Set(GLYPH_SPECS.map((spec) => spec.id));
  expect(ids.size === 64, "[glyphir64] glyph ids must be unique");

  expect(glyphSpecById(0)?.mnemonic === "S", "[glyphir64] id=0 must be S");
  expect(glyphSpecById(1)?.mnemonic === "K", "[glyphir64] id=1 must be K");
  expect(glyphSpecById(2)?.mnemonic === "I", "[glyphir64] id=2 must be I");
  expect(glyphSpecById(3)?.mnemonic === "Y", "[glyphir64] id=3 must be Y");

  expect(
    BRIDGE_GLYPH_IDS.length >= 10,
    "[glyphir64] expected at least 10 bridge-mapped glyphs",
  );

  expect(
    glyphSpecByLegacyOpcode(RISC.OP_SET)?.id === 8,
    "[glyphir64] OP_SET must map to glyph 8",
  );
  expect(
    glyphSpecByLegacyOpcode(RISC.OP_REPLICATE)?.mnemonic === "REPLICATE",
    "[glyphir64] OP_REPLICATE must map",
  );
  expect(
    glyphSpecByLegacyOpcode(RISC.OP_BUILD)?.mnemonic === "BUILD",
    "[glyphir64] OP_BUILD must map",
  );
  expect(
    glyphSpecByLegacyOpcode(RISC.OP_JZ) === null,
    "[glyphir64] OP_JZ must stay unmapped for now",
  );
  expect(
    glyphSpecByLegacyOpcode(RISC.OP_BIND) === null,
    "[glyphir64] OP_BIND must stay unmapped for now",
  );

  console.log(
    `[glyphir64] contract guard passed. specs=${GLYPH_SPECS.length} bridge=${BRIDGE_GLYPH_IDS.length}`,
  );
};

main();
