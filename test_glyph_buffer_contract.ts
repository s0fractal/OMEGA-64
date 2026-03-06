import { GLYPH_BUFFER } from "./GLYPH_BUFFER.ts";
import { GRID_W } from "./OFFSETS.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const main = () => {
  GLYPH_BUFFER.clear();

  GLYPH_BUFFER.depositPheromone(700, 400, 120);
  const pheromoneSnapshot = GLYPH_BUFFER.snapshot();
  if (
    pheromoneSnapshot.activeCells <= 0 || pheromoneSnapshot.pheromoneCells <= 0
  ) {
    throw new Error(
      "[glyph-buffer] pheromone deposit did not create active cells",
    );
  }

  const centerCell = 40 * GRID_W + 70;
  const header = STATE_MATRIX.getGlyphHeader(centerCell);
  if ((header & 0xFF) !== GLYPH_BUFFER.GLYPH_KIND.PHEROMONE) {
    throw new Error("[glyph-buffer] center cell is not tagged as pheromone");
  }

  const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  GLYPH_BUFFER.depositPlasmid(100, 100, 512, payload);
  const plasmidSnapshot = GLYPH_BUFFER.snapshot();
  if (plasmidSnapshot.plasmidCells <= 0) {
    throw new Error(
      "[glyph-buffer] plasmid deposit did not create plasmid cells",
    );
  }

  const plasmidCell = 10 * GRID_W + 10;
  const plasmidHeader = STATE_MATRIX.getGlyphHeader(plasmidCell);
  if ((plasmidHeader & 0xFF) !== GLYPH_BUFFER.GLYPH_KIND.PLASMID) {
    throw new Error("[glyph-buffer] plasmid cell is not tagged as plasmid");
  }
  const storedPayload = STATE_MATRIX.getGlyphPayload(plasmidCell);
  for (let i = 0; i < payload.length; i++) {
    if (storedPayload[i] !== payload[i]) {
      throw new Error("[glyph-buffer] plasmid payload was not persisted");
    }
  }

  const ticked = GLYPH_BUFFER.tick(7);
  if (ticked.activeCells <= 0) {
    throw new Error(
      "[glyph-buffer] tick cleared all glyph transport unexpectedly",
    );
  }
  if (ticked.totalAmplitude <= 0) {
    throw new Error(
      "[glyph-buffer] tick did not preserve measurable transport energy",
    );
  }

  console.log(
    `[glyph-buffer] contract guard passed. active=${ticked.activeCells} pheromone=${ticked.pheromoneCells} plasmid=${ticked.plasmidCells}`,
  );
};

main();
