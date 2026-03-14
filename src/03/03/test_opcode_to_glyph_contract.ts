
import { glyphTapeToPrettyText } from "../../_/08/glyph_pretty.ts";
import { scriptToGlyphTape } from "@07/04/opcode_to_glyph.ts";
import { OP_GET, PROP_ENERGY, OP_SIGNAL, OP_JMP, OP_JZ } from "../../_/mod.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = OP_GET;
  script[pc++] = 0;
  script[pc++] = PROP_ENERGY;
  script[pc++] = OP_SIGNAL;
  script[pc++] = OP_JMP;
  script[pc++] = 0;

  const tape = scriptToGlyphTape(script);
  expect(tape.length === 3, "[opcode_to_glyph] expected 3 mapped tokens");
  expect(
    tape[0]?.glyphMnemonic === "GET",
    "[opcode_to_glyph] first token must be GET",
  );
  expect(
    tape[1]?.glyphMnemonic === "SIGNAL",
    "[opcode_to_glyph] second token must be SIGNAL",
  );
  expect(
    tape[2]?.glyphMnemonic === "JMP",
    "[opcode_to_glyph] third token must be JMP",
  );

  const pretty = glyphTapeToPrettyText(tape);
  expect(
    pretty.includes("pc=0"),
    "[opcode_to_glyph] pretty output must include pc",
  );
  expect(
    pretty.includes("GET[9]"),
    "[opcode_to_glyph] pretty output must mention GET glyph",
  );
  expect(
    pretty.includes("SIGNAL[17]"),
    "[opcode_to_glyph] pretty output must mention SIGNAL glyph",
  );
  expect(
    scriptToGlyphTape(new Uint8Array([OP_JZ, 0, 0]))[0]?.glyphMnemonic ===
      "JZ",
    "[opcode_to_glyph] OP_JZ must now map into the control glyph band",
  );

  const unmapped = new Uint8Array([0xFF, 0, 0]);
  let failedClosed = false;
  try {
    scriptToGlyphTape(unmapped);
  } catch {
    failedClosed = true;
  }
  expect(
    failedClosed,
    "[opcode_to_glyph] unmapped opcode must fail closed by default",
  );

  console.log(`[opcode_to_glyph] contract guard passed. tokens=${tape.length}`);
};

main();
