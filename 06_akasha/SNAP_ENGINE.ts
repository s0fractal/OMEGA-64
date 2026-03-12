// OMEGA-64 | SNAP_ENGINE.ts | Era 71: The Quantum Snap
import { sharedBuffer } from "@00";
import * as OFFSETS from "@00";
import { LOGGER } from "@00";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

const SNAP_DIR = ".omega/snap";

/**
 * SNAP_ENGINE handles the binary persistence of the STATE_MATRIX.
 * It fulfills the 'SNAP' phase of the autopoietic heartbeat.
 */
export const SNAP_ENGINE = {
  /**
   * Saves the current state of the matrix to a binary file.
   * This operation is performed asynchronously to minimize pulse jitter.
   */
  async save(tick: number): Promise<string | null> {
    try {
      await Deno.mkdir(SNAP_DIR, { recursive: true });
      const snapPath = join(
        SNAP_DIR,
        `tick_${tick.toString().padStart(10, "0")}.bin`,
      );

      // We capture a snapshot of the buffer to avoid data races during async write.
      // Although SharedArrayBuffer is shared, Deno.writeFile will read from it.
      // To be safe and non-blocking, we slice the relevant portion.
      const data = new Uint8Array(
        sharedBuffer.slice(0, OFFSETS.LATTICE_MEMORY_END),
      );

      await Deno.writeFile(snapPath, data);

      LOGGER.info(`📸 [SNAP] Matrix fixed at tick ${tick} -> ${snapPath}`);
      return snapPath;
    } catch (err) {
      LOGGER.error(`❌ [SNAP] Save failed at tick ${tick}:`, err);
      return null;
    }
  },

  /**
   * Re-hydrates the matrix from a specific binary snap file.
   */
  async load(snapPath: string): Promise<boolean> {
    try {
      const data = await Deno.readFile(snapPath);
      if (data.length > sharedBuffer.byteLength) {
        throw new Error(
          `Snap file size (${data.length}) exceeds allocated buffer (${sharedBuffer.byteLength})`,
        );
      }

      // Copy data back into the shared buffer
      const view = new Uint8Array(sharedBuffer);
      view.set(data);

      LOGGER.info(`💎 [SNAP] Matrix re-hydrated from ${snapPath}`);
      return true;
    } catch (err) {
      LOGGER.error(`❌ [SNAP] Load failed from ${snapPath}:`, err);
      return false;
    }
  },

  /**
   * Cleanup old snaps to prevent disk overflow.
   * Keeps the last 'keepCount' snaps.
   */
  async cleanup(keepCount = 10): Promise<void> {
    try {
      const entries = [];
      for await (const entry of Deno.readDir(SNAP_DIR)) {
        if (entry.isFile && entry.name.endsWith(".bin")) {
          entries.push(entry.name);
        }
      }

      if (entries.length <= keepCount) return;

      entries.sort();
      const toDelete = entries.slice(0, entries.length - keepCount);

      for (const filename of toDelete) {
        await Deno.remove(join(SNAP_DIR, filename));
      }

      if (toDelete.length > 0) {
        LOGGER.info(`🧹 [SNAP] Cleaned up ${toDelete.length} old snaps.`);
      }
    } catch (err) {
      LOGGER.warn(`⚠️ [SNAP] Cleanup failed:`, err);
    }
  },
};
