import { GLYPH_TELEMETRY, GLYPH_KIND } from "@06";
import { STATE_MATRIX } from "@generated";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  STATE_MATRIX.clear();
  STATE_MATRIX.glyphHeaders.fill(0); STATE_MATRIX.glyphPayload.fill(0);

  // 1. Constructive Interference (+100 and +50 = +150)
  GLYPH_TELEMETRY.depositPheromone(50, 50, 100);
  GLYPH_TELEMETRY.depositPheromone(50, 50, 50);

  // Need to calculate cell correctly for the assertion
  const cell = Math.floor(50 / 10) * 140 + Math.floor(50 / 10);
  let header = STATE_MATRIX.getGlyphHeader(cell);
  let amp = header >> 8;
  expect(
    amp === 150,
    `Constructive interference failed. Expected 150, got ${amp}`,
  );

  // 2. Destructive Interference (+150 and -200 = -50)
  GLYPH_TELEMETRY.depositPheromone(50, 50, -200);
  header = STATE_MATRIX.getGlyphHeader(cell);
  amp = header >> 8;
  expect(
    amp === -50,
    `Destructive interference failed. Expected -50, got ${amp}`,
  );

  // 3. Perfect Annihilation (-50 and +50 = 0 -> NONE)
  GLYPH_TELEMETRY.depositPheromone(50, 50, 50);
  header = STATE_MATRIX.getGlyphHeader(cell);
  amp = header >> 8;
  const kind = header & 0xFF;
  expect(amp === 0, `Annihilation failed. Expected 0, got ${amp}`);
  expect(
    kind === GLYPH_KIND.NONE,
    `Annihilation kind failed. Expected NONE (0), got ${kind}`,
  );

  console.log("[glyph_interference] contract guard passed.");
};

main();
