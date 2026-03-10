import { LATTICE_MEMORY_END } from "./OFFSETS.ts";
import { ensureDir } from "https://deno.land/std@0.212.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.212.0/path/mod.ts";

export type ContinuumMetadata = {
  epochName: string;
  tick: number;
  memoryBounds: number;
  population?: number;
  coherence?: number;
  timestamp: string;
};

const EPOCHS_DIR = ".omega/epochs";

export async function saveEpoch(
  memory: WebAssembly.Memory,
  tick: number,
  epochName: string,
  population: number = 0,
  coherence: number = 0
): Promise<void> {
  await ensureDir(EPOCHS_DIR);

  const buffer = new Uint8Array(memory.buffer, 0, LATTICE_MEMORY_END);
  
  // Create a compression stream
  const compressionStream = new CompressionStream("gzip");
  const writer = compressionStream.writable.getWriter();
  // Copy to standard ArrayBuffer to bypass SharedArrayBuffer stream clone constraints
  writer.write(new Uint8Array(buffer));
  writer.close();

  const compressedBuffer = await new Response(compressionStream.readable).arrayBuffer();
  
  const sigmaPath = join(EPOCHS_DIR, `${epochName}.sigma`);
  await Deno.writeFile(sigmaPath, new Uint8Array(compressedBuffer));

  const metadata: ContinuumMetadata = {
    epochName,
    tick,
    memoryBounds: LATTICE_MEMORY_END,
    population,
    coherence,
    timestamp: new Date().toISOString(),
  };

  const metaPath = join(EPOCHS_DIR, `${epochName}.meta.json`);
  await Deno.writeTextFile(metaPath, JSON.stringify(metadata, null, 2));
}

export async function loadEpoch(
  memory: WebAssembly.Memory,
  epochName: string
): Promise<ContinuumMetadata> {
  const sigmaPath = join(EPOCHS_DIR, `${epochName}.sigma`);
  const metaPath = join(EPOCHS_DIR, `${epochName}.meta.json`);

  const metaRaw = await Deno.readTextFile(metaPath);
  const metadata = JSON.parse(metaRaw) as ContinuumMetadata;

  const compressedData = await Deno.readFile(sigmaPath);
  
  const decompressionStream = new DecompressionStream("gzip");
  const writer = decompressionStream.writable.getWriter();
  writer.write(compressedData);
  writer.close();

  const decompressedBuffer = await new Response(decompressionStream.readable).arrayBuffer();
  const decompressedArray = new Uint8Array(decompressedBuffer);

  if (decompressedArray.byteLength > memory.buffer.byteLength) {
      throw new Error(`[CONTINUUM] Epoch ${epochName} memory bounds (${decompressedArray.byteLength}) exceed target matrix bounds (${memory.buffer.byteLength})`);
  }

  const targetView = new Uint8Array(memory.buffer, 0, decompressedArray.byteLength);
  targetView.set(decompressedArray);

  return metadata;
}
