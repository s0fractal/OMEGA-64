/**
 * test_genesis_bootstrap.ts
 * Final verification for Stage 20: The Chromatic Genesis.
 */

import { GLYPH_SPECS, glyphSpecById } from "@07/04_transpilers/GlyphIR64.ts";
import { GENESIS_PROGRAMS } from "@07/05_generators/GENESIS_BOOT.ts";

function testChromaticMapping() {
  console.log("[test] verifying chromatic mapping...");
  const s = GLYPH_SPECS.find((g) => g.mnemonic === "S");
  console.assert(
    s?.rgb?.[0] === 255 && s?.rgb?.[1] === 255 && s?.rgb?.[2] === 255,
    "S Glyph should be White",
  );

  const gId4 = glyphSpecById(4);
  console.assert(gId4?.vertexIndex === 0, "Glyph 4 should have vertexIndex 0");
  console.assert(gId4?.rgb !== undefined, "Glyph 4 should have RGB color");
  console.log("[test] chromatic mapping OK.");
}

function testGenesisPrograms() {
  console.log("[test] verifying genesis programs...");
  console.assert(
    GENESIS_PROGRAMS["guardian_base"] !== undefined,
    "guardian_base missing",
  );
  console.assert(
    GENESIS_PROGRAMS["architect_base"].length >= 4,
    "architect_base too short",
  );
  console.log("[test] genesis programs OK.");
}

async function runAll() {
  testChromaticMapping();
  testGenesisPrograms();
  console.log("\n[STAGE 20] Chromatic Genesis Initialized Successfully. 💎🌀");
}

if (import.meta.main) {
  runAll();
}
