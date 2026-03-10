import { GLYPH_BUFFER } from "./GLYPH_BUFFER.ts";
import { GRID_W } from "./OFFSETS.ts";
import { STATE_MATRIX, wasmMemory } from "./STATE_MATRIX.ts";

const main = async () => {
  const wasmBytes = await Deno.readFile("./build/release.wasm");
  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom: (a: any, b: any) => console.log("TRACE:", a, b) },
    env: {
      memory: wasmMemory,
      abort: () => {},
    },
  });
  const tickGlyphTransport = instantiated.instance.exports
    .tickGlyphTransport as (tick: number) => void;

  const tick = (t: number) => {
    tickGlyphTransport(t);
    return GLYPH_BUFFER.snapshot();
  };

  GLYPH_BUFFER.clear();

  GLYPH_BUFFER.depositPheromone(920, 30, 120);
  const pheromoneSnapshot = GLYPH_BUFFER.snapshot();
  if (
    pheromoneSnapshot.activeCells <= 0 || pheromoneSnapshot.pheromoneCells <= 0
  ) {
    throw new Error(
      "[glyph-buffer] pheromone deposit did not create active cells",
    );
  }

  const centerCell = 512;
  const header = STATE_MATRIX.getGlyphHeader(centerCell);
  if ((header & 0xFF) !== GLYPH_BUFFER.GLYPH_KIND.PHEROMONE) {
    throw new Error("[glyph-buffer] center cell is not tagged as pheromone");
  }

  const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  GLYPH_BUFFER.depositPlasmid(1240, 30, 512, payload);
  const plasmidSnapshot = GLYPH_BUFFER.snapshot();
  if (plasmidSnapshot.plasmidCells <= 0) {
    throw new Error(
      "[glyph-buffer] plasmid deposit did not create plasmid cells",
    );
  }

  const plasmidCell = 544;
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

  const ticked = tick(7);
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

  GLYPH_BUFFER.clear();
  STATE_MATRIX.signalGrid.fill(0);
  STATE_MATRIX.memoryGrid.fill(0);

  Atomics.store(STATE_MATRIX.signalGrid, centerCell, 512);
  const memoryCell = 544;
  const memoryOffset = memoryCell * 8;
  STATE_MATRIX.memoryGrid[memoryOffset] = 128;
  STATE_MATRIX.memoryGrid[memoryOffset + 4] = 9;
  STATE_MATRIX.memoryGrid[memoryOffset + 5] = 7;

  const internalTick = tick(32);
  
  if (internalTick.internalSignalSeeds <= 0) {
    throw new Error(
      "[glyph-buffer] signal grid did not seed internal pheromone transport",
    );
  }
  if (internalTick.internalMemorySeeds <= 0) {
    throw new Error(
      "[glyph-buffer] memory grid did not seed internal plasmid transport",
    );
  }

  const signalHeader = STATE_MATRIX.getGlyphHeader(centerCell);
  if ((signalHeader & 0xFF) !== GLYPH_BUFFER.GLYPH_KIND.PHEROMONE) {
    throw new Error("[glyph-buffer] signal leak did not emit pheromone glyph");
  }
  const leakedMemoryHeader = STATE_MATRIX.getGlyphHeader(memoryCell);
  if ((leakedMemoryHeader & 0xFF) !== GLYPH_BUFFER.GLYPH_KIND.PLASMID) {
    throw new Error("[glyph-buffer] memory leak did not emit plasmid glyph");
  }
  const leakedPayload = STATE_MATRIX.getGlyphPayload(memoryCell);
  if (leakedPayload[4] !== 9 || leakedPayload[5] !== 7) {
    throw new Error(
      "[glyph-buffer] memory leak did not preserve plasmid residue bytes",
    );
  }

  GLYPH_BUFFER.clear();
  GLYPH_BUFFER.beginInternalAtomEmissionTick();
  GLYPH_BUFFER.emitAtomPheromone(
    200,
    200,
    96,
    STATE_MATRIX.ROLE_GUARDIAN,
  );
  GLYPH_BUFFER.emitAtomPlasmid(
    220,
    220,
    144,
    new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]),
    STATE_MATRIX.ROLE_ARCHITECT,
  );
  const atomTick = tick(32);
  if (atomTick.internalAtomPheromoneSeeds <= 0) {
    throw new Error(
      "[glyph-buffer] atom pheromone emission counter did not advance",
    );
  }
  if (atomTick.internalAtomPlasmidSeeds <= 0) {
    throw new Error(
      "[glyph-buffer] atom plasmid emission counter did not advance",
    );
  }
  if (atomTick.atomRolePheromone.guardian <= 0) {
    throw new Error(
      "[glyph-buffer] guardian pheromone emission was not tracked by role",
    );
  }
  if (atomTick.atomRolePlasmid.architect <= 0) {
    throw new Error(
      "[glyph-buffer] architect plasmid emission was not tracked by role",
    );
  }
  if (
    atomTick.atomRolePheromone.architect !== 0 ||
    atomTick.atomRolePlasmid.guardian !== 0
  ) {
    throw new Error(
      "[glyph-buffer] role emission counters drifted into the wrong buckets",
    );
  }

  console.log(
    `[glyph-buffer] contract guard passed. active=${atomTick.activeCells} pheromone=${atomTick.pheromoneCells} plasmid=${atomTick.plasmidCells} signalSeeds=${internalTick.internalSignalSeeds} memorySeeds=${internalTick.internalMemorySeeds} atomPheromone=${atomTick.internalAtomPheromoneSeeds} atomPlasmid=${atomTick.internalAtomPlasmidSeeds} guardianPheromone=${atomTick.atomRolePheromone.guardian} architectPlasmid=${atomTick.atomRolePlasmid.architect}`,
  );
};

main();
